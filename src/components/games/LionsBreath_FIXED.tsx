import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LIONS_BREATH_LEVELS } from '../../lib/gameConfig';
import type { GameLog } from '../../lib/schemas';
import { db } from '../../lib/schemas';
import { generateGitaWisdom } from '../../lib/gitaAI';

interface LionsBreathProps {
  childId: string;
  currentLevel: number;
  onLevelComplete: (metrics: any) => void;
}

export default function LionsBreath({ childId, currentLevel, onLevelComplete }: LionsBreathProps) {
  const levelConfig = LIONS_BREATH_LEVELS[currentLevel - 1];
  const [gameStatus, setGameStatus] = useState<'INITIALIZING' | 'PLAYING' | 'WON' | 'FAILED'>('INITIALIZING');
  const [breathDuration, setBreathDuration] = useState(0);
  const [breathVolume, setBreathVolume] = useState(0);
  const [featherHeight, setFeatherHeight] = useState(200);
  const [successCount, setSuccessCount] = useState(0);
  const [duck, setDuck] = useState({
    x: 50,
    y: 200,
    width: 40,
    height: 40,
    dy: 0,
    isJumping: false,
  });
  const [obstacles, setObstacles] = useState<{ x: number; y: number; width: number; height: number }[]>([]);
  const [score, setScore] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const breathStartRef = useRef<number | null>(null);
  const smoothedVolumeRef = useRef<number>(0); // ADDED: For volume smoothing

  // Initialize microphone access
  useEffect(() => {
    const initMicrophone = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        // CRITICAL FIX: Resume AudioContext to unblock browsers
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        dataArrayRef.current = dataArray;
        analyzerRef.current = analyser;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        setGameStatus('PLAYING');
        startAnalysis();
      } catch (error) {
        console.error('Microphone access denied', error);
        setGameStatus('FAILED');
      }
    };

    initMicrophone();

    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startAnalysis = () => {
    const analyze = () => {
      if (!analyzerRef.current || !dataArrayRef.current) return;

      analyzerRef.current.getByteTimeDomainData(dataArrayRef.current as any);

      let sumOfSquares = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const normalized = (dataArrayRef.current[i] - 128) / 128;
        sumOfSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumOfSquares / dataArrayRef.current.length);

      const rawVolume = rms * 100 * 6.0;
      const volumeCapped = Math.min(100, rawVolume);
      const volumeAboveNoise = Math.max(0, volumeCapped - 4);

      const smoothed = 0.75 * smoothedVolumeRef.current + 0.25 * volumeAboveNoise;
      smoothedVolumeRef.current = smoothed;

      setBreathVolume(Math.round(smoothed));

      // Track breath duration
      if (smoothed > levelConfig.volumeThreshold) {
        if (!breathStartRef.current) {
          breathStartRef.current = Date.now();
        }
        const duration = (Date.now() - breathStartRef.current) / 1000;
        setBreathDuration(duration);

        // Update feather height (keeps feather floating)
        setFeatherHeight(Math.max(50, 200 - duration * 30));

        // Check win condition
        if (duration >= levelConfig.durationRequired) {
          handleSuccess();
          return;
        }
      } else {
        // Breath stopped
        if (breathStartRef.current && (Date.now() - breathStartRef.current) / 1000 > 0.5) {
          breathStartRef.current = null;
          setBreathDuration(0);
          setFeatherHeight(200);
        }
      }

      requestAnimationFrame(analyze);
    };

    analyze();
  };

  const handleSuccess = () => {
    setSuccessCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        handleGameEnd('WON');
      }
      return newCount;
    });

    // Reset for next attempt
    breathStartRef.current = null;
    setBreathDuration(0);
    setFeatherHeight(200);
  };

  const handleGameEnd = (status: 'WON' | 'FAILED') => {
    setGameStatus(status);

    const metrics: GameLog = {
      _id: `log_${Date.now()}`,
      child_id: childId,
      game_type: 'LIONS_BREATH',
      level_played: currentLevel,
      timestamp: new Date(),
      metrics: {
        accuracy: status === 'WON' ? 100 : (successCount / 3) * 100,
        time_taken: 0,
        impulsivity_count: 0,
        tremor_index: Math.abs(breathVolume - levelConfig.volumeThreshold),
        focus_breaks: 0,
        completion_status: status,
      },
      ai_insight: generateGitaWisdom('Child', 'LIONS_BREATH', status === 'WON', currentLevel),
      recommended_action: '',
    };

    db.recordGameLog(metrics);
    onLevelComplete(metrics);
  };

  const jump = () => {
    if (!duck.isJumping) {
      setDuck((prev) => ({ ...prev, dy: -12, isJumping: true }));
    }
  };

  const updateGame = () => {
    setFrameCount((prev) => prev + 1);
    setDuck((prev) => {
      let newY = prev.y + prev.dy;
      let newDy = prev.dy + 0.6;
      if (newY + prev.height > 250) {
        newY = 250 - prev.height;
        newDy = 0;
        prev.isJumping = false;
      }
      return { ...prev, y: newY, dy: newDy };
    });

    setObstacles((prev) => {
      const newObstacles = prev.map((obs) => ({ ...obs, x: obs.x - 5 }));
      if (frameCount % 120 === 0) {
        newObstacles.push({ x: 800, y: 210, width: 20, height: 40 });
      }
      return newObstacles.filter((obs) => obs.x + obs.width > 0);
    });

    setScore((prev) => prev + 1);
  };

  useEffect(() => {
    const interval = setInterval(updateGame, 1000 / 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (breathVolume > 25) {
      jump();
    }
  }, [breathVolume]);

  useEffect(() => {
    console.log('Game initialized');
    console.log('Duck state:', duck);
    console.log('Obstacles state:', obstacles);
    console.log('Frame count:', frameCount);
    console.log('Breath volume:', breathVolume);
  }, [duck, obstacles, frameCount, breathVolume]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-ayur-sky/20 to-ayur-cream p-8 flex flex-col items-center justify-center">
      {/* Header */}
      <motion.div className="w-full max-w-2xl mb-8 text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-playfair text-4xl font-bold text-ayur-slate mb-2">🦁 The Lion's Breath</h1>
        <p className="font-body text-ayur-slate/60">Level {currentLevel} of 11 - Keep the feather floating</p>
      </motion.div>

      {/* Game Area */}
      <motion.div className="w-full max-w-2xl rounded-3xl bg-white p-12 shadow-2xl mb-8" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        {/* Feather Animation */}
        <div className="relative w-full h-80 bg-gradient-to-b from-ayur-sky/20 to-transparent rounded-2xl overflow-hidden border-2 border-ayur-sky/30 mb-8">
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ y: featherHeight }}
            transition={{ type: 'spring', damping: 5, stiffness: 50 }}
          >
            <span className="text-8xl">🪶</span>
          </motion.div>

          {/* Wind visualization */}
          {breathVolume > levelConfig.volumeThreshold && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-ayur-gold/60 to-transparent" />
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-ayur-gold/60 to-transparent" />
            </motion.div>
          )}
        </div>

        {/* Status Display */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-ayur-sky/10 rounded-lg text-center">
            <p className="font-body text-xs text-ayur-slate/60 mb-2">Breath Duration</p>
            <p className="font-playfair text-2xl font-bold text-ayur-sky">{breathDuration.toFixed(1)}s</p>
            <p className="font-body text-xs text-ayur-slate/60 mt-1">Target: {levelConfig.durationRequired}s</p>
          </div>

          <div className="p-4 bg-pitta-fire/10 rounded-lg text-center">
            <p className="font-body text-xs text-ayur-slate/60 mb-2">Volume</p>
            <p className="font-playfair text-2xl font-bold text-pitta-fire">{breathVolume}</p>
            <p className="font-body text-xs text-ayur-slate/60 mt-1">Min: {levelConfig.volumeThreshold}</p>
          </div>

          <div className="p-4 bg-vata-wind/10 rounded-lg text-center">
            <p className="font-body text-xs text-ayur-slate/60 mb-2">Success</p>
            <p className="font-playfair text-2xl font-bold text-vata-wind">{successCount}/3</p>
            <p className="font-body text-xs text-ayur-slate/60 mt-1">Need 3 breaths</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-ayur-sky/20 rounded-full h-3 mb-6">
          <motion.div
            className="bg-gradient-to-r from-ayur-gold to-vata-wind h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(breathDuration / levelConfig.durationRequired) * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Instructions */}
        <div className="p-4 bg-ayur-gold/10 rounded-lg border border-ayur-gold/30 text-center">
          <p className="font-body text-sm text-ayur-slate mb-2">
            {gameStatus === 'INITIALIZING' && '🎤 Requesting microphone access...'}
            {gameStatus === 'PLAYING' &&
              (breathDuration < 0.5
                ? '💨 Start breathing... keep the feather floating!'
                : `Keep breathing! ${breathDuration.toFixed(1)}s of ${levelConfig.durationRequired}s`)}
            {gameStatus === 'WON' && '🎉 Perfect! You kept all 3 feathers floating!'}
          </p>
        </div>
      </motion.div>

      {/* Breathing Pattern Info */}
      {gameStatus === 'PLAYING' && (
        <motion.div className="w-full max-w-2xl p-6 bg-ayur-sage/10 rounded-2xl border border-ayur-sage/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <h3 className="font-body font-bold text-ayur-slate mb-3">Breathing Pattern: {levelConfig.breathPattern}</h3>
          <p className="font-body text-sm text-ayur-slate/70">
            {levelConfig.breathPattern === 'STEADY' && 'Breathe in slowly, then out long and steady. No jerky movements!'}
            {levelConfig.breathPattern === 'PULSE' && 'Loud breath, soft breath, loud breath. Three pulses per successful attempt.'}
            {levelConfig.breathPattern === 'HOLD' && 'One long, continuous breath. Steady and powerful like a warrior.'}
          </p>
        </motion.div>
      )}

      {/* Game End Feedback */}
      {(gameStatus === 'WON' || gameStatus === 'FAILED') && (
        <motion.div className={`w-full max-w-2xl p-8 rounded-2xl text-center ${gameStatus === 'WON' ? 'bg-ayur-sage/10 border border-ayur-sage' : 'bg-pitta-fire/10 border border-pitta-fire'}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <p className="font-playfair text-2xl font-bold text-ayur-slate mb-4">
            {gameStatus === 'WON' ? '🦁 Lion\'s Breath Mastered!' : '💪 Try Again'}
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-ayur-gold text-white font-body font-bold rounded-full hover:bg-ayur-olive transition">
              Retry Level
            </button>
            {gameStatus === 'WON' && (
              <button onClick={() => onLevelComplete({})} className="px-6 py-3 border-2 border-ayur-gold text-ayur-gold font-body font-bold rounded-full hover:bg-ayur-gold/10 transition">
                Next Level
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Canvas for Duck Game */}
      <div className="relative w-full max-w-2xl h-80 bg-white rounded-2xl border border-ayur-sky/30 overflow-hidden">
        <canvas id="gameCanvas" width="800" height="300"></canvas>
        <div className="absolute top-4 right-4 bg-ayur-sky/10 p-2 rounded-lg shadow-md">
          <span className="font-playfair text-lg font-bold text-ayur-slate">Score: {score}</span>
        </div>
      </div>
    </div>
  );
}
