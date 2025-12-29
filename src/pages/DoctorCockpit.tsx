import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder Azure integrations — wire these to real services later
async function verifyDoctorLicenseFromBlob(doctorId: string): Promise<boolean> {
  // TODO: Replace with Azure Blob Storage signed URL/license check
  return Promise.resolve(true);
}

async function getWeeklyClinicalSummaryFromAzureOpenAI(doctorId: string): Promise<string> {
  // TODO: Replace with Azure OpenAI GPT-4o call
  return Promise.resolve(
    'Children show steady improvements in Focus Score and Breath Control. No critical meltdowns detected this week. Maintain current protocol and add short mindfulness breaks.'
  );
}

async function getCosmosGameLogs(patientId: string): Promise<Array<{ timestamp: string; game: string; level: number; metric: string; value: number }>> {
  // TODO: Replace with Cosmos DB query
  return Promise.resolve([
    { timestamp: new Date().toISOString(), game: 'MIRROR_PATTERN', level: 3, metric: 'focus_score', value: 72 },
    { timestamp: new Date().toISOString(), game: 'LIONS_BREATH', level: 2, metric: 'breath_control', value: 65 },
  ]);
}

interface PatientCardData {
  id: string;
  name: string;
  age: number;
  focusScore: number; // 0-100
  breathControl: number; // 0-100
  alert: 'green' | 'red';
}

const PATIENTS: PatientCardData[] = [
  { id: 'p1', name: 'Aarav Sharma', age: 8, focusScore: 72, breathControl: 65, alert: 'green' },
  { id: 'p2', name: 'Diya Patel', age: 9, focusScore: 58, breathControl: 70, alert: 'green' },
  { id: 'p3', name: 'Vivaan Rao', age: 7, focusScore: 45, breathControl: 52, alert: 'red' },
];

export default function DoctorCockpit() {
  const [doctorVerified, setDoctorVerified] = useState<boolean>(true);
  const [weeklySummary, setWeeklySummary] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<PatientCardData | null>(null);
  const [patientLogs, setPatientLogs] = useState<Array<{ timestamp: string; game: string; level: number; metric: string; value: number }>>([]);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useMemo(() => {
    // Initialize verified state and summary (mock async)
    verifyDoctorLicenseFromBlob('doctor-001').then(setDoctorVerified);
    getWeeklyClinicalSummaryFromAzureOpenAI('doctor-001').then(setWeeklySummary);
  }, []);

  const openDetails = async (patient: PatientCardData) => {
    setSelectedPatient(patient);
    const logs = await getCosmosGameLogs(patient.id);
    setPatientLogs(logs);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedPatient(null);
    setPatientLogs([]);
  };

  return (
    <div className="min-h-screen bg-blue-50 text-slate-900">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold">Doctor Cockpit</h1>
            <span className="text-slate-500">|</span>
            <span className="text-lg">Dr. Meera Nair</span>
            <span className={`ml-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${doctorVerified ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
              {doctorVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>
          <div className="text-sm text-slate-600">Clinical Theme • Slate-900 / Blue-50</div>
        </div>
      </motion.header>

      {/* Main Grid: 2 columns on desktop — Patient Grid + Insights Sidebar */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient Monitoring Grid (spans 2 columns) */}
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-extrabold">Patient Monitoring</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PATIENTS.map((p) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white shadow border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-slate-600">Patient</p>
                    <p className="text-lg font-bold">{p.name}</p>
                    <p className="text-xs text-slate-500">Age {p.age}</p>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${p.alert === 'red' ? 'bg-red-500' : 'bg-green-500'}`} title={p.alert === 'red' ? 'Alert: pattern detected' : 'Stable'}></span>
                </div>

                {/* Digital Biomarkers */}
                <div className="space-y-3 mt-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold">Focus Score</span>
                      <span>{p.focusScore}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded">
                      <div
                        className="h-2 rounded bg-gradient-to-r from-blue-500 to-blue-700"
                        style={{ width: `${p.focusScore}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold">Breath Control</span>
                      <span>{p.breathControl}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded">
                      <div
                        className="h-2 rounded bg-gradient-to-r from-emerald-500 to-emerald-700"
                        style={{ width: `${p.breathControl}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => openDetails(p)}
                    className="w-full py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Agentic Insights Sidebar */}
        <aside className="rounded-2xl bg-white shadow border border-slate-200 p-4">
          <h3 className="text-lg md:text-xl font-extrabold mb-3">Agentic Insights</h3>

          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-700 mb-1">Weekly Clinical Summary (Azure OpenAI)</p>
            <div className="p-3 rounded bg-blue-50 border border-blue-100 text-sm">
              {weeklySummary || 'Loading summary...'}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-700 mb-1">Prescribed Lifestyle</p>
            <div className="p-3 rounded bg-blue-50 border border-blue-100 text-sm">
              <ul className="list-disc list-inside space-y-1">
                <li>Current Protocol: Vata‑Pacifying Diet</li>
                <li>Daily: 5 mins Lion’s Breath (Level 2)</li>
                <li>Mindfulness: 2× short breaks during study</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && selectedPatient && (
          <motion.div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="w-full max-w-xl rounded-2xl bg-white shadow-xl border border-slate-200"
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Patient</p>
                  <p className="text-lg font-bold">{selectedPatient.name}</p>
                </div>
                <button onClick={closeDetails} className="px-3 py-1 rounded bg-slate-900 text-white font-bold">Close</button>
              </div>
              <div className="p-4 max-h-[50vh] overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-600">
                      <th className="py-2 pr-2">Timestamp</th>
                      <th className="py-2 pr-2">Game</th>
                      <th className="py-2 pr-2">Level</th>
                      <th className="py-2">Metric</th>
                      <th className="py-2">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientLogs.map((log, idx) => (
                      <tr key={idx} className="border-t border-slate-100">
                        <td className="py-2 pr-2 text-slate-700">{log.timestamp}</td>
                        <td className="py-2 pr-2">{log.game}</td>
                        <td className="py-2 pr-2">{log.level}</td>
                        <td className="py-2 pr-2">{log.metric}</td>
                        <td className="py-2 font-bold">{log.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
