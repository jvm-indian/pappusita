import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GameLog, User } from '../lib/schemas'
import MirrorPattern from '../components/games/MirrorPattern'
import { MIRROR_PATTERN_LEVELS } from '../lib/gameConfig'

export default function GameMirrorPatternPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [level, setLevel] = useState(1)

  useEffect(() => {
    const str = localStorage.getItem('currentUser')
    if (!str) {
      navigate('/login')
      return
    }
    const u: User = JSON.parse(str)
    setUser(u)
    setLevel(u.progression?.mirror_game_level || 1)
  }, [navigate])

  if (!user) return <div className="flex items-center justify-center min-h-screen"><span>Loading...</span></div>

  const handleLevelComplete = (_metrics?: GameLog) => {
    const nextLevel = Math.min(10, level + 1) // Cap at 10 levels
    const updated = {
      ...user,
      progression: { ...user.progression, mirror_game_level: nextLevel },
    }
    setUser(updated)
    setLevel(nextLevel)
    localStorage.setItem('currentUser', JSON.stringify(updated))
  }

  return <MirrorPattern childId={user._id} currentLevel={level} onLevelComplete={handleLevelComplete} />
}
