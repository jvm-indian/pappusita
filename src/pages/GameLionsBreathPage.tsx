import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '../lib/schemas'
import LionsBreath from '../components/games/LionsBreath'

export default function GameLionsBreathPage() {
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
    setLevel(u.progression?.lions_breath_level || 1)
  }, [navigate])

  if (!user) return <div className="flex items-center justify-center min-h-screen"><span>Loading...</span></div>

  const totalLevels = 10

  const handleLevelComplete = () => {
    const nextLevel = Math.min(totalLevels, level + 1)
    const updated = {
      ...user,
      progression: { ...user.progression, lions_breath_level: nextLevel },
    }
    localStorage.setItem('currentUser', JSON.stringify(updated))
    setUser(updated)
    setLevel(nextLevel)
    // Don't auto-navigate - let user see success message and choose next action
  }

  return <LionsBreath childId={user._id} currentLevel={level} onLevelComplete={handleLevelComplete} />
}
