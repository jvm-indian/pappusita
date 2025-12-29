import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '../lib/schemas'
import { db } from '../lib/schemas'
import { analyzeGameMetrics, type DoshaAnalysis, type LifestylePrescription } from '../lib/gitaAI'

export default function LifestylePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [doshaAnalysis, setDoshaAnalysis] = useState<DoshaAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const user = localStorage.getItem('currentUser')
    if (!user) {
      navigate('/login')
      return
    }
    const parsedUser = JSON.parse(user)
    setCurrentUser(parsedUser)

    // Get game logs and analyze
    const logs = db.getGameLogs(parsedUser.id)
    const analysis = analyzeGameMetrics(logs)
    setDoshaAnalysis(analysis)
    setLoading(false)
  }, [navigate])

  const getCategoryIcon = (category: LifestylePrescription['category']) => {
    switch (category) {
      case 'FOOD':
        return '🍎'
      case 'ACTIVITY':
        return '🏃'
      case 'BREATHING':
        return '🧘'
      case 'ROUTINE':
        return '📅'
    }
  }

  const getCategoryColor = (category: LifestylePrescription['category']) => {
    switch (category) {
      case 'FOOD':
        return 'from-green-100 to-emerald-100 border-green-300'
      case 'ACTIVITY':
        return 'from-blue-100 to-cyan-100 border-blue-300'
      case 'BREATHING':
        return 'from-purple-100 to-pink-100 border-purple-300'
      case 'ROUTINE':
        return 'from-orange-100 to-yellow-100 border-orange-300'
    }
  }

  const getUrgencyBadge = (urgency: LifestylePrescription['urgency']) => {
    switch (urgency) {
      case 'IMMEDIATE':
        return <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">🔥 DO NOW</span>
      case 'TODAY':
        return <span className="px-3 py-1 bg-orange-400 text-white text-xs font-bold rounded-full">⏰ TODAY</span>
      case 'WEEKLY':
        return <span className="px-3 py-1 bg-blue-400 text-white text-xs font-bold rounded-full">📆 THIS WEEK</span>
    }
  }

  const getDoshaInfo = (dosha: 'VATA' | 'PITTA' | 'KAPHA') => {
    switch (dosha) {
      case 'VATA':
        return {
          title: 'Vata (Air & Wind)',
          emoji: '💨',
          description: 'You have high energy but need grounding. Focus on stability and calmness.',
          color: 'text-blue-600',
          bg: 'bg-blue-50 border-blue-300'
        }
      case 'PITTA':
        return {
          title: 'Pitta (Fire)',
          emoji: '🔥',
          description: 'You have intense focus but need cooling. Practice patience and calmness.',
          color: 'text-red-600',
          bg: 'bg-red-50 border-red-300'
        }
      case 'KAPHA':
        return {
          title: 'Kapha (Earth & Water)',
          emoji: '🌍',
          description: 'You are steady but need energizing. Focus on movement and activity.',
          color: 'text-green-600',
          bg: 'bg-green-50 border-green-300'
        }
    }
  }

  if (loading || !doshaAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">🔮 Analyzing your health profile...</div>
      </div>
    )
  }

  const doshaInfo = getDoshaInfo(doshaAnalysis.dominant_dosha)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-purple-700">
            💪 Your Lifestyle & Health Guide
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Welcome Message */}
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border-2 border-purple-200">
          <h2 className="text-2xl font-bold text-purple-600 mb-3">
            Hello {currentUser?.name}! 👋
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Based on your game performance, we've created a <strong>personalized health plan</strong> just for you! 
            Follow these simple tips to feel amazing, stay healthy, and become even stronger. 🌟
          </p>
        </div>

        {/* Dosha Analysis Card */}
        <div className={`mb-8 p-6 rounded-2xl shadow-lg border-2 ${doshaInfo.bg}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{doshaInfo.emoji}</div>
            <div>
              <h3 className={`text-3xl font-bold ${doshaInfo.color}`}>
                Your Energy Type: {doshaInfo.title}
              </h3>
              <p className="text-gray-700 text-lg mt-2">{doshaInfo.description}</p>
            </div>
          </div>

          {/* Dosha Scores */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">💨</div>
              <div className="text-2xl font-bold text-blue-600">{doshaAnalysis.vata_score}%</div>
              <div className="text-sm text-gray-600">Vata (Air)</div>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-red-600">{doshaAnalysis.pitta_score}%</div>
              <div className="text-sm text-gray-600">Pitta (Fire)</div>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">🌍</div>
              <div className="text-2xl font-bold text-green-600">{doshaAnalysis.kapha_score}%</div>
              <div className="text-sm text-gray-600">Kapha (Earth)</div>
            </div>
          </div>

          {/* Insights */}
          {doshaAnalysis.insights.length > 0 && (
            <div className="mt-6 p-4 bg-white rounded-lg">
              <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span>💡</span> What We Noticed:
              </h4>
              <ul className="space-y-2">
                {doshaAnalysis.insights.map((insight, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Prescriptions Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-purple-700 mb-4 flex items-center gap-3">
            <span>🎯</span> Your Personal Action Plan
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Follow these recommendations to balance your energy and feel your best!
          </p>

          <div className="space-y-4">
            {doshaAnalysis.prescriptions.map((prescription, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-xl shadow-lg border-2 bg-gradient-to-r ${getCategoryColor(prescription.category)} hover:shadow-xl transition-shadow`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{getCategoryIcon(prescription.category)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {prescription.category}
                      </h3>
                      {prescription.duration_minutes && (
                        <p className="text-sm text-gray-600">⏱️ {prescription.duration_minutes} minutes</p>
                      )}
                    </div>
                  </div>
                  {getUrgencyBadge(prescription.urgency)}
                </div>
                
                <p className="text-gray-700 text-lg leading-relaxed">
                  {prescription.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Diet Tips Section */}
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border-2 border-green-300">
          <h3 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
            <span>🥗</span> Healthy Eating Tips for Kids
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-bold text-green-700 mb-2">✅ Eat More:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Fresh fruits (apples, bananas, berries)</li>
                <li>• Colorful vegetables (carrots, broccoli, spinach)</li>
                <li>• Whole grains (brown rice, oats)</li>
                <li>• Nuts and seeds (almonds, walnuts)</li>
                <li>• Drink plenty of water!</li>
              </ul>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-bold text-red-700 mb-2">⚠️ Eat Less:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Sugary drinks and sodas</li>
                <li>• Fried and oily foods</li>
                <li>• Too many sweets and candies</li>
                <li>• Processed junk food</li>
                <li>• Heavy meals before bedtime</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Daily Routine Card */}
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border-2 border-blue-300">
          <h3 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
            <span>⏰</span> Healthy Daily Routine
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">🌅</span>
              <div>
                <h4 className="font-bold text-blue-700">Morning (6-8 AM)</h4>
                <p className="text-gray-700">Wake up early, drink warm water, do light stretching or yoga</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <span className="text-2xl">🌞</span>
              <div>
                <h4 className="font-bold text-yellow-700">Daytime (12-3 PM)</h4>
                <p className="text-gray-700">Eat your biggest meal at lunch, stay active, play outdoors</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <span className="text-2xl">🌙</span>
              <div>
                <h4 className="font-bold text-purple-700">Evening (6-9 PM)</h4>
                <p className="text-gray-700">Light dinner, calm activities, read books, sleep by 9 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fun Activity Ideas */}
        <div className="p-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl shadow-lg border-2 border-pink-300">
          <h3 className="text-2xl font-bold text-pink-700 mb-4 flex items-center gap-2">
            <span>🎨</span> Fun Activities to Try
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-4xl mb-2">🏃</div>
              <h4 className="font-bold text-gray-800">Physical</h4>
              <p className="text-sm text-gray-600 mt-2">Running, jumping, dancing, cycling, sports</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-4xl mb-2">🎨</div>
              <h4 className="font-bold text-gray-800">Creative</h4>
              <p className="text-sm text-gray-600 mt-2">Drawing, painting, music, crafts, building</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-4xl mb-2">🧘</div>
              <h4 className="font-bold text-gray-800">Calming</h4>
              <p className="text-sm text-gray-600 mt-2">Yoga, breathing, meditation, reading, nature walks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
