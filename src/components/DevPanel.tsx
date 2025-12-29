import { useDevSettings } from '../context/DevSettingsContext'

export default function DevPanel() {
  const { moveThreshold, windowSize, confMin, debug,
    setMoveThreshold, setWindowSize, setConfMin, setDebug } = useDevSettings()

  if (!(import.meta as any).env?.DEV) return null

  return (
    <details className="fixed right-4 bottom-4 bg-black/80 text-white p-4 rounded shadow-lg z-50">
      <summary className="cursor-pointer select-none">Dev Settings</summary>
      <div className="mt-3 grid gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="w-36">Eye Move Threshold</span>
          <input type="range" min={1} max={20} value={moveThreshold}
                 onChange={e => setMoveThreshold(Number(e.target.value))} />
          <span className="text-xs">{moveThreshold}</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="w-36">Smoothing Window</span>
          <input type="range" min={3} max={20} value={windowSize}
                 onChange={e => setWindowSize(Number(e.target.value))} />
          <span className="text-xs">{windowSize} frames</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="w-36">Confidence %</span>
          <input type="range" min={60} max={99} value={confMin}
                 onChange={e => setConfMin(Number(e.target.value))} />
          <span className="text-xs">{confMin}%</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={debug} onChange={e => setDebug(e.target.checked)} />
          <span>Debug Logs</span>
        </label>
      </div>
    </details>
  )
}
