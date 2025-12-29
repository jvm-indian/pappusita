import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LIONS_BREATH_LEVELS } from '../../lib/gameConfig';
import type { GameLog } from '../../lib/schemas';
import { db } from '../../lib/schemas';
import { generateGitaWisdom } from '../../lib/gitaAI';

interface LionsBreathProps {
  childId: string;
  currentLevel: number;
  onLevelComplete: (metrics: GameLog) => void;
}

const TOTAL_LEVELS = 10;
const MULTIPLIER = 50; // Convert mic volume to 0-100% scale

export default function LionsBreath({ childId, currentLevel, onLevelComplete }: LionsBreathProps) {
  const levelIndex = Math.min(TOTAL_LEVELS - 1, Math.max(0, currentLevel - 1));
  const levelConfig = LIONS_BREATH_LEVELS[levelIndex];

  // Game state
  const [gamePhase, setGamePhase] = useState<'IDLE' | 'CALIBRATING' | 'PLAYING' | 'WON'>('IDLE');
  const [featherY, setFeatherY] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [breathDuration, setBreathDuration] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Breath tracking refs
  const lastVolumeRef = useRef(0);
  const breathStartTimeRef = useRef<number | null>(null);
  const currentBreathDurationRef = useRef(0);
  const isBreathingRef = useRef(false);

  // Calibration timer
  useEffect(() => {
    if (gamePhase === 'CALIBRATING') {
      const timer = setTimeout(() => {
        setGamePhase('PLAYING');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gamePhase]);

  // Initialize microphone and start game - requires user gesture
  const handleStart = async () => {
    try {
      setErrorMessage('');
      setGamePhase('CALIBRATING');
      setSuccessCount(0);
      setFeatherY(0);
      setVolumeLevel(0);
      setBreathDuration(0);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Resume audio context if suspended (required on some browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Force resume by playing a silent source
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(0, audioContext.currentTime);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(0);
      oscillator.stop(0);

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      startAudioLoop();
    } catch (error: any) {
      setErrorMessage('Microphone access denied. Please allow microphone access.');
      setGamePhase('IDLE');
    }
  };

  // Main audio analysis loop
  const startAudioLoop = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    let smoothVolRef = { current: 0 };

    const analyzeAudio = () => {
      if (gamePhase === 'WON' || !analyserRef.current || !dataArrayRef.current) return;

      // Get raw audio data
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current as any);

        // AGGRESSIVE volume calculation with 5x multiplier
        const average = (dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length) * 5;
        
        // DIRECT height mapping - any sound immediately moves feather up
        const targetY = Math.min(90, average);
        
        // Set volume display (0-100%)
        setVolumeLevel(Math.min(100, Math.round(average)));
        
        // DEBUG: Log in console for inspection
        console.log('Volume:', Math.round(average), 'Feather Height:', Math.round(targetY));

        // Update feather position directly
        setFeatherY(targetY);

        // Update volume display (0-100)
        const displayVol = Math.min(100, (average / 128) * MULTIPLIER);
        setVolumeLevel(Math.round(displayVol));

        // Breath detection logic (only during PLAYING phase)
        if (gamePhase === 'PLAYING') {
          const isAboveThreshold = displayVol > levelConfig.volumeThreshold;

          if (isAboveThreshold && !isBreathingRef.current) {
            // Start of a new breath
            isBreathingRef.current = true;
            breathStartTimeRef.current = performance.now();
            currentBreathDurationRef.current = 0;
          } else if (isAboveThreshold && isBreathingRef.current) {
            // Continue current breath
            const now = performance.now();
            currentBreathDurationRef.current = (now - (breathStartTimeRef.current || 0)) / 1000;
            setBreathDuration(parseFloat(currentBreathDurationRef.current.toFixed(1)));

            // Check if breath duration meets requirement
            if (currentBreathDurationRef.current >= levelConfig.durationRequired) {
              // Successful breath!
              isBreathingRef.current = false;
              breathStartTimeRef.current = null;
              setSuccessCount((prev) => {
                const newCount = prev + 1;
                // If 3 breaths completed, trigger win
                if (newCount >= 3) {
                  setGamePhase('WON');
                  handleGameComplete(newCount);
                }
                return newCount;
              });
            }
          } else if (!isAboveThreshold && isBreathingRef.current) {
            // Breath interrupted
            isBreathingRef.current = false;
            breathStartTimeRef.current = null;
            setBreathDuration(0);
          }
        }

        lastVolumeRef.current = displayVol;
      }
      rafRef.current = requestAnimationFrame(analyzeAudio);
    };

    rafRef.current = requestAnimationFrame(analyzeAudio);
  };

  const handleGameComplete = (finalCount: number) => {
    const metrics: GameLog = {
      _id: `log_${Date.now()}`,
      child_id: childId,
      game_type: 'LIONS_BREATH',
      level_played: levelIndex + 1,
      timestamp: new Date(),
      metrics: {
        accuracy: 100,
        time_taken: 0,
        impulsivity_count: 0,
        tremor_index: 0,
        focus_breaks: 0,
        completion_status: 'WON',
      },
      ai_insight: generateGitaWisdom('Child', 'LIONS_BREATH', true, levelIndex + 1),
      recommended_action: '',
    };

    db.recordGameLog(metrics);
  };

  const cleanup = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (micStreamRef.current) micStreamRef.current.getTracks().forEach((track) => track.stop());
    if (audioContextRef.current) audioContextRef.current.close();
  };

  const handleRetry = () => {
    cleanup();
    setGamePhase('IDLE');
    setSuccessCount(0);
    setFeatherY(0);
    setVolumeLevel(0);
    setBreathDuration(0);
  };

  const handleNextLevel = () => {
    cleanup();
    const metrics: GameLog = {
      _id: `log_${Date.now()}`,
      child_id: childId,
      game_type: 'LIONS_BREATH',
      level_played: levelIndex + 1,
      timestamp: new Date(),
      metrics: {
        accuracy: 100,
        time_taken: 0,
        impulsivity_count: 0,
        tremor_index: 0,
        focus_breaks: 0,
        completion_status: 'WON',
      },
      ai_insight: generateGitaWisdom('Child', 'LIONS_BREATH', true, levelIndex + 1),
      recommended_action: '',
    };
    onLevelComplete(metrics);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-ayur-sky/20 to-ayur-cream p-6 flex flex-col items-center justify-center">
      {/* Header */}
      <motion.div className="w-full max-w-2xl mb-6 text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-playfair text-4xl font-bold text-ayur-slate mb-2">🦁 The Lion's Breath</h1>
        <p className="font-body text-ayur-slate/60">Level {levelIndex + 1} of {TOTAL_LEVELS}</p>
      </motion.div>

      {/* Main Game Card */}
      <motion.div
        className="w-full max-w-2xl rounded-[40px] bg-white p-8 shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {gamePhase === 'IDLE' && (
          <div className="flex flex-col items-center justify-center min-h-96 gap-6">
            <div className="text-8xl">🍃</div>
            <h2 className="font-playfair text-3xl font-bold text-slate-800">Ready to Start?</h2>
            <p className="font-body text-slate-700 text-center max-w-md">
              Breathe steadily to keep the feather floating. You need {levelConfig.durationRequired} second{levelConfig.durationRequired !== 1 ? 's' : ''} of continuous breath to score a point.
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-ayur-gold text-white font-body font-bold rounded-full hover:bg-ayur-olive transition shadow-lg text-lg"
            >
              🎤 Start Game & Allow Microphone
            </button>
            {errorMessage && <p className="text-red-600 font-body text-sm">{errorMessage}</p>}
          </div>
        )}

        {gamePhase === 'CALIBRATING' && (
          <div className="flex flex-col items-center justify-center min-h-96 gap-4">
            <motion.div
              className="text-6xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              🎤
            </motion.div>
            <p className="font-playfair text-2xl font-bold text-slate-800">Calibrating...</p>
            <p className="font-body text-slate-600 text-center max-w-md">
              Getting your microphone ready. Please wait...
            </p>
          </div>
        )}

        {(gamePhase === 'PLAYING' || gamePhase === 'WON') && (
          <div className="space-y-6">
            {/* Play Area */}
            <div
              className="relative w-full h-80 bg-[#E3F2FD]/50 rounded-3xl border-2 border-[#81D4FA]/50 overflow-hidden"
              style={{ minHeight: '320px' }}
            >
              {/* Feather */}
              <div
                style={{
                  position: 'absolute',
                  bottom: `${featherY}%`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '3rem',
                  zIndex: 50,
                }}
              >
                🪶
              </div>

              {/* Instructions overlay when idle */}
              {gamePhase === 'PLAYING' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gradient-to-b from-transparent via-transparent to-white/10">
                  <div className="text-center">
                    <p className="font-body text-sm text-slate-600 font-semibold">
                      Breathe steadily to lift the feather
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-3 gap-4">
              {/* Card 1: Breath Duration (Blue) */}
              <motion.div
                className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl border-2 border-blue-300 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="font-body text-xs text-slate-700 mb-2 font-semibold">Breath Duration</p>
                <p className="font-playfair text-2xl font-bold text-blue-600">{breathDuration.toFixed(1)}s</p>
                <p className="font-body text-xs text-slate-600 mt-1">Target: {levelConfig.durationRequired}s</p>
              </motion.div>

              {/* Card 2: Volume (Orange) */}
              <motion.div
                className="p-4 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl border-2 border-orange-300 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="font-body text-xs text-slate-700 mb-2 font-semibold">Volume</p>
                <p className="font-playfair text-2xl font-bold text-orange-600">{volumeLevel}%</p>
                <p className="font-body text-xs text-slate-600 mt-1">Min: {levelConfig.volumeThreshold}</p>
              </motion.div>

              {/* Card 3: Success (Green) */}
              <motion.div
                className="p-4 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl border-2 border-green-300 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="font-body text-xs text-slate-700 mb-2 font-semibold">Success</p>
                <p className="font-playfair text-2xl font-bold text-green-600">{successCount}/3</p>
                <p className="font-body text-xs text-slate-600 mt-1">Need 3 breaths</p>
              </motion.div>
            </div>

            {/* Instructions */}
            {gamePhase === 'PLAYING' && (
              <motion.div
                className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-300 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="font-body text-sm text-slate-800 font-semibold">
                  {successCount === 0 && '🌱 Start breathing! Hold your breath for the target duration.'}
                  {successCount === 1 && '⚡ Great! 2 more breaths to go!'}
                  {successCount === 2 && '🔥 Almost there! One more breath!'}
                </p>
              </motion.div>
            )}

            {/* Win Modal */}
            {gamePhase === 'WON' && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="w-full max-w-md p-8 rounded-3xl text-center bg-white shadow-2xl mx-4"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                >
                  <p className="text-6xl mb-4">🎉</p>
                  <p className="font-playfair text-3xl font-bold text-slate-800 mb-2">Level Complete!</p>
                  <p className="font-body text-slate-700 mb-6">Excellent breath control! 🌬️</p>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <button
                      onClick={handleRetry}
                      className="px-6 py-3 bg-ayur-gold text-white font-body font-bold rounded-full hover:bg-ayur-olive transition shadow-lg"
                    >
                      Retry Level
                    </button>
                    {levelIndex + 1 < TOTAL_LEVELS ? (
                      <button
                        onClick={handleNextLevel}
                        className="px-6 py-3 border-2 border-ayur-gold text-ayur-gold bg-white font-body font-bold rounded-full hover:bg-ayur-gold/10 transition shadow-lg"
                      >
                        Next Level →
                      </button>
                    ) : (
                      <button
                        onClick={handleNextLevel}
                        className="px-6 py-3 border-2 border-emerald-600 text-emerald-600 bg-white font-body font-bold rounded-full hover:bg-emerald-100 transition shadow-lg"
                      >
                        Complete Journey ✓
                      </button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
