import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllSessions } from '../services/metrics'
import { getCurrentUserRole, logout } from '../services/auth'

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const sessions = getAllSessions()
  // Placeholder patient list for MVP
  const [patients] = useState<Array<{ name: string; age: number; status: 'Stable' | 'Alert'; focus: number; breath: number }>>([
    { name: 'Aryan', age: 9, status: 'Stable', focus: 68, breath: 62 },
    { name: 'Meera', age: 8, status: 'Alert', focus: 42, breath: 55 },
    { name: 'Shruti', age: 10, status: 'Stable', focus: 74, breath: 71 },
  ])
  useEffect(() => {
    const role = getCurrentUserRole()
    if (!role) {
      navigate('/login')
      return
    }
    if (role !== 'DOCTOR') {
      navigate('/dashboard')
    }
  }, [navigate])
  return (
    <div className="min-h-screen relative">
      {/* Background SVG */}
      <div className="fixed inset-0 z-[1]">
        <img 
          src="/src/assets/background of doctor portal.svg" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-10 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-5xl font-bold text-gray-900" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Doctor Dashboard</h1>
          {/* Verified Clinical User badge */}
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            ✅ Verified Clinical User
          </span>
        </div>
        <button
          onClick={() => { if (window.confirm('Logout from Doctor?')) { logout(); navigate('/login') } }}
          className="px-4 py-2 bg-ayur-gold/20 hover:bg-ayur-gold/40 text-ayur-slate rounded-lg transition-colors duration-300 font-semibold"
        >
          Logout
        </button>
      </div>
      <p className="text-sm text-gray-800 mb-6 font-semibold drop-shadow-md bg-white/70 backdrop-blur-sm p-3 rounded-lg inline-block">Exploratory demo metrics (not medical diagnostics).</p>
      {/* Patient Grid + AI Insights */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient Grid (2 columns) */}
        <section className="lg:col-span-2">
          <h2 className="text-2xl font-extrabold text-white/90 bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-lg inline-block mb-4">Patients</h2>
          {patients.length === 0 ? (
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white/30 font-semibold">No sessions yet. Play a game to generate metrics.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {patients.map((p, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-extrabold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-700">Age {p.age}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === 'Alert' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'}`}>{p.status}</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800">Focus Level</span>
                        <span className="text-slate-800">{p.focus}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded">
                        <div className="h-2 rounded bg-blue-600" style={{ width: `${p.focus}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800">Breath Control</span>
                        <span className="text-slate-800">{p.breath}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded">
                        <div className="h-2 rounded bg-emerald-600" style={{ width: `${p.breath}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* AI Clinical Summary with light glassmorphism */}
        <aside className="p-4 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.25)]">
          <h3 className="text-xl font-extrabold text-slate-900 mb-2">AI Clinical Summary</h3>
          <p className="text-sm text-slate-800 mb-4">AI is analyzing game logs...</p>
          <button className="w-full py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800">Generate AI Report</button>
        </aside>
      </div>
      </div>
    </div>
  )
}
