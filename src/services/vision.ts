export type EyeRect = { x: number; y: number; w?: number; h?: number }
export type AnalyzeResponse = {
  facePresent: boolean
  eyeLeft?: EyeRect
  eyeRight?: EyeRect
  eyesOpen?: boolean
}

const USE_BACKEND = (import.meta as any).env?.VITE_USE_BACKEND === 'true'

type AnalyzeOptions = { debug?: boolean }

export async function analyzeFrame(imageBase64: string, options?: AnalyzeOptions): Promise<AnalyzeResponse> {
  if (USE_BACKEND) {
    try {
      const res = await fetch('/api/analyzeFrame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 })
      })
      if (res.ok) {
        const json = await res.json()
        if (options?.debug && (import.meta as any).env?.DEV) {
          console.log('analyzeFrame (backend)', json)
        }
        return json
      }
    } catch (e) {
      // fall through to simulation
    }
  }
  // Fallback simulation for local demo without Azure Function
  const eyesOpen = Math.random() > 0.35
  const t = Date.now() / 1200
  const cx = 120 + Math.sin(t) * 12
  const cy = 100 + Math.cos(t) * 10
  const result: AnalyzeResponse = {
    facePresent: true,
    eyeLeft: { x: cx - 6, y: cy },
    eyeRight: { x: cx + 6, y: cy },
    eyesOpen
  }
  if (options?.debug && (import.meta as any).env?.DEV) {
    console.log('analyzeFrame (sim)', result)
  }
  return result
}
