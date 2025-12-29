import { useEffect, useRef, useState } from 'react'
import { useCamera } from '../hooks/useCamera'
import { analyzeFrame } from '../services/vision'
import { startSession, endSession, recordFocusHoldFrames } from '../services/metrics'
import { useDevSettings } from '../context/DevSettingsContext'
import type { GameLog, User } from '../lib/schemas'
import { db } from '../lib/schemas'
import { generateGitaWisdom } from '../lib/gitaAI'

const REQUIRED_FRAMES = 6

export default function GameGaze() {
  const { videoRef, captureFrame } = useCamera()
  const prev = useRef<{ x: number; y: number } | null>(null)
  const [size, setSize] = useState(60)
  const [hold, setHold] = useState(0)
  const smoothedMove = useRef<number>(0)
  const [windowStable, setWindowStable] = useState(0)
  const [successfulWindows, setSuccessfulWindows] = useState(0)
  const [totalWindows, setTotalWindows] = useState(0)
  const [confidence, setConfidence] = useState(0)
  const [confHistory, setConfHistory] = useState<number[]>([])
  const { moveThreshold, windowSize, confMin, debug } = useDevSettings()
  const [storyText, setStoryText] = useState<string | null>(null)
  const [sessionCompleted, setSessionCompleted] = useState(false)

  useEffect(() => {
    startSession()
    const id = setInterval(async () => {
      const img = captureFrame()
      if (!img) return
      const data = await analyzeFrame(img, { debug })
      if (!data.eyeLeft || !data.eyeRight) return
      const x = (data.eyeLeft.x + data.eyeRight.x) / 2
      const y = (data.eyeLeft.y + data.eyeRight.y) / 2
      if (prev.current) {
        const dx = x - prev.current.x
        const dy = y - prev.current.y
        const rawMove = Math.abs(dx) + Math.abs(dy)
        smoothedMove.current = smoothedMove.current * 0.7 + rawMove * 0.3
        const stable = smoothedMove.current < moveThreshold
        if (stable) {
          setHold(h => h + 1)
          setWindowStable(ws => ws + 1)
          recordFocusHoldFrames(1)
        } else {
          setHold(0)
        }
      }
      prev.current = { x, y }
    }, 450)
    return () => { clearInterval(id); endSession() }
  }, [captureFrame, moveThreshold, debug])

  useEffect(() => {
    if (hold > REQUIRED_FRAMES && confidence >= confMin) {
      setSize(s => Math.min(180, s + 4))
    }
  }, [hold, confidence, confMin])

  useEffect(() => {
    const id = setInterval(() => {
      const winSize = Math.max(3, Math.min(20, windowSize))
      const majority = Math.max(2, Math.round(winSize * 0.7))
      setTotalWindows(w => w + 1)
      const ok = windowStable >= majority
      if (ok) setSuccessfulWindows(s => s + 1)
      setConfidence(c => {
        const val = Math.max(0, Math.min(100, c + (ok ? 10 : -5)))
        setConfHistory(h => [...h.slice(-19), val])
        return val
      })
      setWindowStable(0)
    }, 450 * Math.max(3, Math.min(20, windowSize)))
    return () => clearInterval(id)
  }, [windowStable, windowSize])

  // When thresholds are met, record a game result, award karma, and generate Gita wisdom
  useEffect(() => {
    const accuracy = totalWindows ? Math.round((successfulWindows / totalWindows) * 100) : 0
    const reached = accuracy >= 70 && confidence >= 80 && totalWindows >= 3
    if (!reached || sessionCompleted) return

    // Read current user
    const userStr = localStorage.getItem('currentUser')
    const user: User | null = userStr ? JSON.parse(userStr) : null
    const childId = user?._id || `user_demo_${Date.now()}`
    const childName = user?.name || 'Child'

    // Approximate time taken based on windows and interval
    const timeTakenSec = Math.round(totalWindows * (450 * Math.max(3, Math.min(20, windowSize))) / 1000)

    const log: GameLog = {
      _id: `log_${Date.now()}`,
      child_id: childId,
      game_type: 'HIDDEN_HERB',
      level_played: 1,
      timestamp: new Date(),
      metrics: {
        accuracy,
        time_taken: timeTakenSec,
        impulsivity_count: 0,
        tremor_index: 0,
        focus_breaks: Math.max(0, totalWindows - successfulWindows),
        completion_status: 'WON',
      },
      ai_insight: generateGitaWisdom(childName, 'HIDDEN_HERB', true, 1),
      recommended_action: '',
    }

    db.recordGameLog(log)

    // Store story and award karma if we have a real user
    const wisdom = log.ai_insight
    setStoryText(wisdom)

    if (user) {
      const karmaAward = Math.max(1, Math.round(accuracy / 10 + confidence / 10))
      const nextChapter = ((user.gita_unlocked_chapters?.slice(-1)[0] ?? 0) + 1)

      const updated = db.updateUser(user._id, {
        karma_points: (user.karma_points || 0) + karmaAward,
        gita_unlocked_chapters: [...(user.gita_unlocked_chapters || []), nextChapter],
      })

      if (updated) {
        localStorage.setItem('currentUser', JSON.stringify(updated))
        db.storeStory({
          child_id: user._id,
          game_type: 'HIDDEN_HERB',
          level_completed: 1,
          story_text: wisdom,
          warrior_habit: 'Practice steady gaze for 2 minutes daily',
          generated_at: new Date(),
        })
      }
    }

    setSessionCompleted(true)
  }, [totalWindows, successfulWindows, confidence, windowSize, sessionCompleted])

  const accuracy = totalWindows ? Math.round((successfulWindows / totalWindows) * 100) : 0

  return (
    <main className="min-h-screen w-full p-6 bg-gradient-to-br from-indigo-200 via-violet-200 to-fuchsia-200">
      {storyText && (
        <div className="max-w-4xl mx-auto mb-4 p-4 rounded-2xl bg-white/90 border border-ayur-gold/30 shadow">
          <p className="font-playfair text-lg font-bold text-ayur-slate mb-1">Gita Wisdom</p>
          <p className="font-body text-ayur-slate/80">{storyText}</p>
          <div className="mt-3 text-right">
            <button onClick={() => setStoryText(null)} className="px-4 py-2 rounded-lg bg-ayur-gold/20 hover:bg-ayur-gold/40 text-ayur-slate transition-all">Continue</button>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        <section className="bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold">Gaze Hold</h2>
          <p className="text-slate-700">Hold your gaze to grow the circle.</p>
          <div className="mt-6 grid place-items-center h-64">
            <div style={{ width: size, height: size }} className="rounded-full bg-violet-500 shadow"></div>
          </div>
          <p className="mt-4 text-slate-800">Hold frames: <span className="font-semibold">{hold}</span></p>
          <p className="text-slate-800">Focus Accuracy: <span className="font-semibold">{accuracy}%</span></p>
          <p className="text-xs text-gray-600">(computed per {windowSize}-frame windows with smoothing)</p>
          <p className={`text-sm font-semibold ${confidence > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>Tracking Confidence: {confidence.toFixed(0)}%</p>
          <div className="mt-2 h-8 flex items-end gap-1">
            {confHistory.map((v, i) => (
              <div key={i} className="w-1.5 bg-emerald-500" style={{ height: `${Math.max(2, Math.round(v / 5))}px` }}></div>
            ))}
          </div>
        </section>
        <section className="bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl p-6">
          <h3 className="font-semibold text-slate-700">Camera</h3>
          <video ref={videoRef} className="mt-2 w-full rounded-xl bg-black" muted playsInline></video>
          {(import.meta as any).env?.DEV && (
            <p className="mt-3 text-xs text-slate-600">Dev panel available bottom-right.</p>
          )}
        </section>
      </div>
    </main>
  )
}
