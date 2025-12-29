import { useEffect, useMemo, useRef, useState } from 'react'
import { useCamera } from '../hooks/useCamera'
import { analyzeFrame } from '../services/vision'
import type { AnalyzeResponse } from '../services/vision'
import { startSession, endSession, recordFollow } from '../services/metrics'
import { useDevSettings } from '../context/DevSettingsContext'

const RAW_THRESHOLD = Number((import.meta as any).env?.VITE_FOLLOW_RAW_THRESHOLD ?? 0.01)
const SMOOTH_THRESHOLD = Number((import.meta as any).env?.VITE_FOLLOW_SMOOTH_THRESHOLD ?? 0.015)
const WINDOW_SIZE = Number((import.meta as any).env?.VITE_WINDOW_SIZE ?? 5)

type Direction = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN'

export default function GameFollow() {
  const { videoRef, captureFrame } = useCamera()
  const [dir, setDir] = useState<Direction>('LEFT')
  const prev = useRef<{ x: number; y: number } | null>(null)
  const [tick, setTick] = useState(0)
  const movementHistory = useRef<number[]>([])
  const prevDir = useRef<Direction>('LEFT')
  const smoothed = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 })
  const [successfulWindows, setSuccessfulWindows] = useState(0)
  const [totalWindows, setTotalWindows] = useState(0)
  const [confidence, setConfidence] = useState(0)
  const [confHistory, setConfHistory] = useState<number[]>([])
  const [rawDx, setRawDx] = useState(0)
  const [smoothDx, setSmoothDx] = useState(0)
  const [status, setStatus] = useState('')
  const { moveThreshold, windowSize, confMin, debug } = useDevSettings()

  useEffect(() => {
    startSession()
    const interval = setInterval(() => setTick(t => t + 1), 450)
    return () => { clearInterval(interval); endSession() }
  }, [])

  useEffect(() => {
    const img = captureFrame()
    if (!img) return
    analyzeFrame(img, { debug }).then((data: AnalyzeResponse) => {
      if (!data.eyeLeft || !data.eyeRight) return
      if (debug && (import.meta as any).env?.DEV) {
        console.log('AnalyzeFrame eye rects (Follow):', {
          left: data.eyeLeft,
          right: data.eyeRight,
          eyesOpen: data.eyesOpen,
        })
      }
      const x = (data.eyeLeft.x + data.eyeRight.x) / 2
      const y = (data.eyeLeft.y + data.eyeRight.y) / 2
      if (prev.current) {
        const dx = x - prev.current.x
        const dy = y - prev.current.y
        const vw = (videoRef.current?.videoWidth ?? 240)
        const vh = (videoRef.current?.videoHeight ?? 240)
        // Raw directional metric normalized to [0..~1]
        let rawMetric = 0
        if (dir === 'LEFT') rawMetric = -dx / vw
        if (dir === 'RIGHT') rawMetric = dx / vw
        if (dir === 'UP') rawMetric = -dy / vh
        if (dir === 'DOWN') rawMetric = dy / vh
        setRawDx(rawMetric)
        // Show simple trigger status for debug
        const rawThreshold = moveThreshold / 1000
        if (rawMetric > rawThreshold) {
          setStatus(`${dir} DETECTED`)
        } else {
          setStatus('')
        }
        // Exponential smoothing (safe version)
        const sdx = (smoothed.current.dx = smoothed.current.dx * 0.8 + dx * 0.2)
        const sdy = (smoothed.current.dy = smoothed.current.dy * 0.8 + dy * 0.2)
        let smoothMetric = 0
        if (dir === 'LEFT') smoothMetric = -sdx / vw
        if (dir === 'RIGHT') smoothMetric = sdx / vw
        if (dir === 'UP') smoothMetric = -sdy / vh
        if (dir === 'DOWN') smoothMetric = sdy / vh
        setSmoothDx(smoothMetric)
        // Push into window
        movementHistory.current.push(smoothMetric)
        const smoothThreshold = (moveThreshold / 1000) * 1.5
        const currWindowSize = Math.max(3, Math.min(15, windowSize))
        if (movementHistory.current.length >= currWindowSize) {
          const hist = movementHistory.current
          const avg = hist.reduce((a, b) => a + b, 0) / hist.length
          const ok = avg > smoothThreshold
          setTotalWindows(w => w + 1)
          setConfidence(c => {
            const val = Math.max(0, Math.min(100, c + (ok ? 10 : -5)))
            setConfHistory(h => [...h.slice(-19), val])
            return val
          })
          if (ok && confidence >= confMin) {
            setSuccessfulWindows(s => s + 1)
            recordFollow(true)
          } else {
            recordFollow(false)
          }
          movementHistory.current = []
        }
      }
      prev.current = { x, y }
    })
  }, [tick, dir, captureFrame])

  useEffect(() => {
    const rot = ['LEFT', 'RIGHT', 'UP', 'DOWN'] as Direction[]
    let i = 0
    const id = setInterval(() => { setDir(rot[i % rot.length]); i++ }, 2000)
    return () => clearInterval(id)
  }, [])

  // Track direction for status only (window evaluation is based on frame count)
  useEffect(() => {
    prevDir.current = dir
  }, [dir])

  const dotPos = useMemo(() => {
    switch (dir) {
      case 'LEFT': return 'left-6 top-1/2 -translate-y-1/2'
      case 'RIGHT': return 'right-6 top-1/2 -translate-y-1/2'
      case 'UP': return 'left-1/2 -translate-x-1/2 top-6'
      case 'DOWN': return 'left-1/2 -translate-x-1/2 bottom-6'
    }
  }, [dir])

  const accuracy = useMemo(() => {
    if (totalWindows === 0) return 0
    return Math.round((successfulWindows / totalWindows) * 100)
  }, [successfulWindows, totalWindows])

  return (
    <main className="min-h-screen w-full p-6 bg-gradient-to-br from-green-200 via-emerald-300 to-teal-200">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        <section className="bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold">Eye Follow Dots</h2>
          <p className="text-slate-700">Follow the moving dot with your eyes.</p>
          <div className="mt-4 relative h-64 rounded-2xl bg-slate-100 border">
            <div className={`absolute w-10 h-10 rounded-full bg-amber-500 shadow ${dotPos}`}></div>
          </div>
          <p className="mt-4 text-slate-800">Direction: <span className="font-semibold">{dir}</span></p>
          <p className="text-slate-800">Raw dx: <span className="font-semibold">{rawDx.toFixed(4)}</span></p>
          <p className="text-slate-800">Smooth dx: <span className="font-semibold">{smoothDx.toFixed(4)}</span></p>
          <p className="text-emerald-700 font-semibold">{status}</p>
          <p className="text-slate-800">Windows: <span className="font-semibold">{successfulWindows}/{totalWindows}</span></p>
          <p className={`text-sm font-semibold ${confidence > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>Tracking Confidence: {confidence.toFixed(0)}%</p>
          <p className="text-xs text-gray-600">(computed per {Math.max(3, Math.min(15, windowSize))}-frame windows with smoothing)</p>
          <p className="text-slate-800">Focus Accuracy: <span className="font-semibold">{accuracy}%</span></p>
          <p className="text-xs text-gray-600">(calculated over temporal windows with smoothing)</p>
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
