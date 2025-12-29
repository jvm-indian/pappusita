import { createContext, useContext, useMemo, useState } from 'react'

type DevSettings = {
  moveThreshold: number
  windowSize: number
  confMin: number
  debug: boolean
  setMoveThreshold: (v: number) => void
  setWindowSize: (v: number) => void
  setConfMin: (v: number) => void
  setDebug: (v: boolean) => void
}

const DEFAULTS = {
  moveThreshold: Number((import.meta as any).env?.VITE_STABILITY_THRESHOLD ?? 10),
  windowSize: Number((import.meta as any).env?.VITE_WINDOW_SIZE ?? 10),
  confMin: Number((import.meta as any).env?.VITE_CONFIDENCE_MIN ?? 90),
  debug: false,
}

const Ctx = createContext<DevSettings | null>(null)

export function DevSettingsProvider({ children }: { children: React.ReactNode }) {
  const [moveThreshold, setMoveThreshold] = useState<number>(DEFAULTS.moveThreshold)
  const [windowSize, setWindowSize] = useState<number>(DEFAULTS.windowSize)
  const [confMin, setConfMin] = useState<number>(DEFAULTS.confMin)
  const [debug, setDebug] = useState<boolean>(DEFAULTS.debug)

  const value = useMemo<DevSettings>(() => ({
    moveThreshold,
    windowSize,
    confMin,
    debug,
    setMoveThreshold,
    setWindowSize,
    setConfMin,
    setDebug,
  }), [moveThreshold, windowSize, confMin, debug])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDevSettings() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useDevSettings must be used within DevSettingsProvider')
  return v
}
