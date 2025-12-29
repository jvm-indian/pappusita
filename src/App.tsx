import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Game from './pages/Game'
import GameFollow from './pages/GameFollow'
import GameBlink from './pages/GameBlink'
import GameGaze from './pages/GameGaze'
import Game1 from './pages/Game1'
import DoctorDashboard from './pages/DoctorDashboard.tsx'
import AdminDashboard from './pages/AdminDashboard.tsx'
import GitaKnowledge from './pages/GitaKnowledge'
import LifestylePage from './pages/LifestylePage'
import GameMirrorPatternPage from './pages/GameMirrorPatternPage'
import GameHiddenHerbPage from './pages/GameHiddenHerbPage'
import GameLionsBreathPage from './pages/GameLionsBreathPage'
import GameSocialDetectivePage from './pages/GameSocialDetectivePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/game" element={<Game />} />
          <Route path="/game/follow" element={<GameFollow />} />
          <Route path="/game/blink" element={<GameBlink />} />
          <Route path="/game/gaze" element={<GameGaze />} />
          <Route path="/game/eye-demo" element={<Game1 />} />
          {/* Therapeutic game routes matching Dashboard slugs */}
          <Route path="/game/mirror-pattern" element={<GameMirrorPatternPage />} />
          <Route path="/game/hidden-herb" element={<GameHiddenHerbPage />} />
          <Route path="/game/lions-breath" element={<GameLionsBreathPage />} />
          <Route path="/game/social-detective" element={<GameSocialDetectivePage />} />
          {/* Gita knowledge tab */}
          <Route path="/gita" element={<GitaKnowledge />} />
          {/* Lifestyle & Diet advice */}
          <Route path="/lifestyle" element={<LifestylePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
  )
}
