export type SessionMetrics = {
  id: string
  startedAt: number
  endedAt?: number
  followSuccesses: number
  followTotal: number
  blinkCount: number
  focusHoldFrames: number
}

let current: SessionMetrics | null = null
const sessions: SessionMetrics[] = []

export function startSession() {
  current = {
    id: Math.random().toString(36).slice(2),
    startedAt: Date.now(),
    followSuccesses: 0,
    followTotal: 0,
    blinkCount: 0,
    focusHoldFrames: 0,
  }
}

export function endSession() {
  if (!current) return null
  current.endedAt = Date.now()
  sessions.push(current)
  const finished = current
  current = null
  return finished
}

export function recordFollow(directionOk: boolean) {
  if (!current) return
  current.followTotal += 1
  if (directionOk) current.followSuccesses += 1
}

export function recordBlink() {
  if (!current) return
  current.blinkCount += 1
}

export function recordFocusHoldFrames(frames: number) {
  if (!current) return
  current.focusHoldFrames += frames
}

export function getCurrentSummary() {
  const c = current
  if (!c) return null
  const followAccuracy = c.followTotal > 0 ? Math.round((c.followSuccesses / c.followTotal) * 100) : 0
  const focusHoldSeconds = Math.round((c.focusHoldFrames * 0.45)) // 450ms per frame
  return {
    id: c.id,
    startedAt: c.startedAt,
    followAccuracy,
    blinkCount: c.blinkCount,
    focusHoldSeconds,
  }
}

export function getAllSessions() {
  return sessions.map(s => ({
    id: s.id,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    followAccuracy: s.followTotal > 0 ? Math.round((s.followSuccesses / s.followTotal) * 100) : 0,
    blinkCount: s.blinkCount,
    focusHoldSeconds: Math.round(s.focusHoldFrames * 0.45),
  }))
}
