import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '../lib/schemas'
import SocialDetective from '../components/games/SocialDetective'

export default function GameSocialDetectivePage() {
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
    setLevel(u.progression?.social_detective_level || 1)
  }, [navigate])

  if (!user) return <div className="flex items-center justify-center min-h-screen"><span>Loading...</span></div>

  const handleLevelComplete = () => {
    const nextLevel = Math.min(11, level + 1)
    const updated = {
      ...user,
      progression: { ...user.progression, social_detective_level: nextLevel },
    }
    localStorage.setItem('currentUser', JSON.stringify(updated))
    // Don't auto-navigate - let user see success message and choose next action
  }

  return <SocialDetective childId={user._id} currentLevel={level} onLevelComplete={handleLevelComplete} />
}
