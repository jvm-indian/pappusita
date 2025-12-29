import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AgentMessage from '../components/AgentMessage'
import { getAgentDecision } from '../services/agent'

type TrialState = 'idle' | 'waiting' | 'ready' | 'done'
type Difficulty = 'easy' | 'hard'

export default function Game() {
  const [trial, setTrial] = useState<TrialState>('idle')
  const [round, setRound] = useState(0)
  const [times, setTimes] = useState<number[]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('hard')
  const startRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)

  const avgTime = useMemo(() => {
    if (times.length === 0) return 0
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length)
  }, [times])

  const decision = useMemo(() => {
    if (times.length < 3) return null
    return getAgentDecision(avgTime)
  }, [times, avgTime])

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const scheduleReady = useCallback(() => {
    clearTimer()
    setTrial('waiting')
    // Adaptive wait: easier mode = longer random wait; harder = shorter
    const [min, max] = difficulty === 'easy' ? [800, 1800] : [300, 900]
    const delay = min + Math.random() * (max - min)
    timerRef.current = window.setTimeout(() => {
      startRef.current = performance.now()
      setTrial('ready')
    }, delay)
  }, [difficulty])

  const startRound = useCallback(() => {
    setTimes([])
    setRound(1)
    scheduleReady()
  }, [scheduleReady])

  const resetAll = () => {
    clearTimer()
    setTrial('idle')
    setRound(0)
    setTimes([])
    startRef.current = null
  }

  const tap = () => {
    if (trial !== 'ready' || !startRef.current) return
    const rt = performance.now() - startRef.current
    setTimes(prev => [...prev, rt])
    startRef.current = null
    if (round >= 5) {
      setTrial('done')
      clearTimer()
    } else {
      setRound(r => r + 1)
      scheduleReady()
    }
  }

  useEffect(() => () => clearTimer(), [])

  return (
    <main className="relative min-h-screen w-full theme-ocean p-6">
      <div className="max-w-4xl mx-auto">
        <section className="bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-slate-900">Super Eyes – Reaction Trainer</h2>
          <p className="mt-2 text-slate-700">Tap as fast as you can when the button turns green. Five trials.</p>
          <div className="mt-4 flex gap-2 flex-wrap">
            <a href="/game/follow" className="px-3 py-2 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700">Eye Follow Dots</a>
            <a href="/game/blink" className="px-3 py-2 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">Blink Power</a>
            <a href="/game/gaze" className="px-3 py-2 rounded-full text-sm font-semibold bg-violet-100 text-violet-700">Gaze Hold</a>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 text-slate-700">
                <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-sm">Round {Math.min(round || 0, 5)} / 5</span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm">Avg: {avgTime} ms</span>
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm">Trials: {times.length}</span>
                <span className={`px-3 py-1 rounded-full text-white text-sm ${difficulty === 'easy' ? 'bg-emerald-500' : 'bg-rose-500'}`}>Mode: {difficulty.toUpperCase()}</span>
              </div>

              <div className="mt-6 h-56 flex items-center justify-center">
                {trial === 'idle' && (
                  <button onClick={startRound} className="px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 shadow-lg hover:shadow-xl transition">
                    Start Test
                  </button>
                )}
                {trial !== 'idle' && (
                  <button
                    onClick={tap}
                    className={`w-64 h-40 rounded-2xl text-2xl font-extrabold shadow-xl transition-all border-4 ${
                      trial === 'ready'
                        ? `${difficulty === 'easy' ? 'bg-emerald-500 border-emerald-600 scale-110' : 'bg-amber-500 border-amber-600 scale-100'} text-white`
                        : `${difficulty === 'easy' ? 'bg-slate-200 border-slate-300' : 'bg-slate-300 border-slate-400'} text-slate-600`
                    }`}
                  >
                    {trial === 'ready' ? 'TAP!' : 'Wait...'}
                  </button>
                )}
              </div>

              {trial === 'done' && (
                <div className="mt-4 flex gap-3">
                  <button onClick={resetAll} className="px-5 py-2 rounded-full font-semibold bg-white text-slate-800 border border-slate-200 shadow-sm hover:shadow">
                    Reset
                  </button>
                  {decision && (
                    <button
                      onClick={() => {
                        setDifficulty(decision.level)
                        setTimes([])
                        setRound(1)
                        setTrial('waiting')
                        scheduleReady()
                      }}
                      className="px-5 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow hover:shadow-lg"
                    >
                      Apply Guidance & Replay
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="md:col-span-1">
              {decision ? (
                <AgentMessage level={decision.level} message={decision.message} />
              ) : (
                <div className="rounded-2xl p-5 bg-white/80 text-slate-700 border border-white/50 shadow">
                  <p className="font-medium">Complete at least 3 trials to get guidance from the Guru.</p>
                </div>
              )}
            </div>
          </div>
          {/* Agent loop explainer */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl p-4 bg-white/80 text-slate-700 border border-white/50 shadow">
              <p className="text-sm font-semibold text-slate-600">Agent Loop</p>
              <ul className="mt-2 text-sm list-disc list-inside">
                <li>Observe: measure reaction times</li>
                <li>Decide: compute average → easy/hard</li>
                <li>Adapt: change timing and UI</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Ocean stickers */}
      <div className="absolute bottom-6 right-6 flex gap-2">
        <span className="floaty px-3 py-2 rounded-full bg-white/70 text-xl shadow">🐠</span>
        <span className="floaty px-3 py-2 rounded-full bg-white/70 text-xl shadow">🐳</span>
        <span className="floaty px-3 py-2 rounded-full bg-white/70 text-xl shadow">🐙</span>
        <span className="floaty px-3 py-2 rounded-full bg-white/70 text-xl shadow">🐚</span>
      </div>

      {/* Ocean waves */}
      <div className="wave wave-bl floaty"></div>
      <div className="wave wave-br floaty"></div>
    </main>
  )
}
