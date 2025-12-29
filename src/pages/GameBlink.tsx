import { useEffect, useRef, useState } from 'react'
import { useCamera } from '../hooks/useCamera'
import { analyzeFrame } from '../services/vision'
import { startSession, endSession, recordBlink } from '../services/metrics'
import { useDevSettings } from '../context/DevSettingsContext'

const WINDOW_SIZE = Number((import.meta as any).env?.VITE_WINDOW_SIZE ?? 10)
const BLINK_DEBOUNCE_MS = Number((import.meta as any).env?.VITE_BLINK_DEBOUNCE_MS ?? 300)

export default function GameBlink() {
  const { videoRef, captureFrame } = useCamera()
  const [power, setPower] = useState(0)
  const [eyesOpenPrev, setEyesOpenPrev] = useState(true)
  const lastBlinkAt = useRef<number>(0)
  const [windowFrames, setWindowFrames] = useState(0)
  const windowHasValidBlink = useRef<boolean>(false)
  const [successfulWindows, setSuccessfulWindows] = useState(0)
  const [totalWindows, setTotalWindows] = useState(0)
  const [confidence, setConfidence] = useState(0)
  const [confHistory, setConfHistory] = useState<number[]>([])
  const { windowSize, confMin, debug } = useDevSettings()

  useEffect(() => {
    startSession()
    const id = setInterval(async () => {
      const img = captureFrame()
      if (!img) return
      const data = await analyzeFrame(img, { debug })
      if (debug && (import.meta as any).env?.DEV) {
        console.log('AnalyzeFrame eye rects (Blink):', {
          left: data.eyeLeft,
          right: data.eyeRight,
          eyesOpen: data.eyesOpen,
        })
      }
      const eyesOpen = !!data.eyesOpen
      const now = Date.now()
      // Debounce blinks by 300ms to reduce false positives
      if (eyesOpenPrev && !eyesOpen && now - lastBlinkAt.current > BLINK_DEBOUNCE_MS) {
        lastBlinkAt.current = now
        windowHasValidBlink.current = true
        setPower(p => Math.min(100, p + 10))
        recordBlink()
      }
      setEyesOpenPrev(eyesOpen)

      // Frame windowing: one decision per 10 frames
      setWindowFrames(f => {
        const nf = f + 1
        const currWindowSize = Math.max(3, Math.min(15, windowSize))
        if (nf >= currWindowSize) {
          const ok = windowHasValidBlink.current
          setTotalWindows(w => w + 1)
          setConfidence(c => {
            const val = Math.max(0, Math.min(100, c + (ok ? 10 : -5)))
            setConfHistory(h => [...h.slice(-19), val])
            return val
          })
          if (ok && confidence >= confMin) {
            setSuccessfulWindows(s => s + 1)
          }
          windowHasValidBlink.current = false
          return 0
        }
        return nf
      })
    }, 450)
    return () => { clearInterval(id); endSession() }
  }, [captureFrame, eyesOpenPrev])

  const accuracy = totalWindows ? Math.round((successfulWindows / totalWindows) * 100) : 0

  return (
    <main className="min-h-screen w-full p-6 bg-gradient-to-br from-sky-200 via-cyan-200 to-indigo-200">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        <section className="bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold">Blink Power</h2>
          <p className="text-slate-700">Blink to charge the star!</p>
          <div className="mt-4 grid place-items-center h-64">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-xl opacity-50" style={{ background: 'conic-gradient(from 0deg, #f59e0b '+power+'%, #ddd '+power+'%)' }}></div>
              <div className="grid place-items-center w-40 h-40 rounded-full bg-amber-400 text-6xl shadow">⭐</div>
            </div>
          </div>
          <p className="mt-4 text-slate-800">Power: <span className="font-semibold">{power}%</span></p>
          <p className="text-slate-800">Blink Accuracy: <span className="font-semibold">{accuracy}%</span></p>
          <p className="text-xs text-gray-600">(computed per 10-frame windows with debounce)</p>
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
