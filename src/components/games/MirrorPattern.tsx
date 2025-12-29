import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MIRROR_PATTERN_LEVELS, GAME_METRICS_CONFIG, type MirrorPatternLevel } from '../../lib/gameConfig';
import type { GameLog } from '../../lib/schemas';
import { db } from '../../lib/schemas';
import { generateGitaWisdom } from '../../lib/gitaAI';

interface MirrorPatternProps {
  childId: string;
  currentLevel: number;
  onLevelComplete: (metrics: GameLog) => void;
}

// 10 levels with 0-based indexing
const LEVELS: MirrorPatternLevel[] = MIRROR_PATTERN_LEVELS;
const TOTAL_LEVELS = 10; // Levels 0-9

export default function MirrorPattern({ childId, currentLevel, onLevelComplete }: MirrorPatternProps) {
  // Convert 1-based currentLevel to 0-based index
  const initialLevelIndex = Math.max(0, Math.min(currentLevel - 1, TOTAL_LEVELS - 1));
  const [currentLevelIndex, setCurrentLevelIndex] = useState(initialLevelIndex);
  const levelConfig = LEVELS[currentLevelIndex];
  
  const [userPath, setUserPath] = useState<number[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStatus, setGameStatus] = useState<'PLAYING' | 'WON' | 'FAILED'>('PLAYING');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const targetPath = useRef<number[]>([]);

  // Generate target path based on shape
  const generateTargetPath = (config: MirrorPatternLevel): number[] => {
    const size = config.gridSize;
    const dotCount = config.dotsToConnect;

    const pathMap: Record<string, number[]> = {
      LINE: [0, 1],
      TRIANGLE: [0, size + 1, size * 2],
      SQUARE: [0, 1, size + 1, size],
      Z_SHAPE: [0, 1, size, size + 1, 2 * size],
      RECTANGLE: [0, 1, 2, size + 2, 2 * size + 2, 2 * size + 1],
      STAR: Array.from({ length: dotCount }, (_, i) => i),
      HEXAGON: Array.from({ length: dotCount }, (_, i) => i),
      SPIRAL: Array.from({ length: dotCount }, (_, i) => i),
      WAVE: Array.from({ length: dotCount }, (_, i) => i),
      COMPLEX: Array.from({ length: dotCount }, (_, i) => Math.floor(Math.random() * (size * size))),
      MANDALA: Array.from({ length: dotCount }, (_, i) => i),
    };

    return (pathMap[config.shape] || Array.from({ length: dotCount }, (_, i) => i)).slice(0, dotCount);
  };

  // Reset game state when level changes
  useEffect(() => {
    targetPath.current = generateTargetPath(levelConfig);
    setUserPath([]);
    setAccuracy(0);
    setTimeElapsed(0);
    setGameStatus('PLAYING');
    setShowSuccessModal(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [currentLevelIndex]);

  // Calculate accuracy
  useEffect(() => {
    if (userPath.length === 0) {
      setAccuracy(0);
      return;
    }

    let correct = 0;
    for (let i = 0; i < userPath.length; i++) {
      if (userPath[i] === targetPath.current[i]) {
        correct++;
      }
    }

    const acc = userPath.length > 0 ? (correct / targetPath.current.length) * 100 : 0;
    setAccuracy(Math.round(acc));
  }, [userPath]);

  // Timer
  useEffect(() => {
    if (gameStatus === 'PLAYING') {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => {
          if (levelConfig.timeLimit && prev >= levelConfig.timeLimit) {
            setGameStatus('FAILED');
            setShowSuccessModal(true);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStatus, levelConfig.timeLimit]);

  // Check win condition and show success modal
  useEffect(() => {
    if (userPath.length === targetPath.current.length && gameStatus === 'PLAYING') {
      const isCorrect = userPath.every((dot, idx) => dot === targetPath.current[idx]);
      if (isCorrect && accuracy >= GAME_METRICS_CONFIG.MIRROR_PATTERN.passThreshold) {
        setGameStatus('WON');
        setShowSuccessModal(true);
      } else if (!isCorrect) {
        setGameStatus('FAILED');
        setShowSuccessModal(true);
      }
    }
  }, [userPath, accuracy, gameStatus]);

  const handleDotClick = (dotIndex: number) => {
    if (gameStatus !== 'PLAYING') return;
    setUserPath([...userPath, dotIndex]);
  };

  const handleGameEnd = (status: 'WON' | 'FAILED') => {
    const metrics: GameLog = {
      _id: `log_${Date.now()}`,
      child_id: childId,
      game_type: 'MIRROR_PATTERN',
      level_played: currentLevelIndex + 1, // Convert back to 1-based for logging
      timestamp: new Date(),
      metrics: {
        accuracy: accuracy,
        time_taken: timeElapsed,
        impulsivity_count: Math.max(0, userPath.length - targetPath.current.length),
        tremor_index: 0,
        focus_breaks: 0,
        completion_status: status,
      },
      ai_insight: generateGitaWisdom('Child', 'MIRROR_PATTERN', status === 'WON', currentLevelIndex + 1),
      recommended_action: '',
    };

    db.recordGameLog(metrics);

    // Only call parent completion handler on wins
    if (status === 'WON') {
      onLevelComplete(metrics);
    }
  };

  const handleRetry = () => {
    // Keep currentLevelIndex the same, reset the game board
    targetPath.current = generateTargetPath(levelConfig);
    setUserPath([]);
    setAccuracy(0);
    setTimeElapsed(0);
    setGameStatus('PLAYING');
    setShowSuccessModal(false);
  };

  const handleNextLevel = () => {
    // Call parent handler to update progression
    if (gameStatus === 'WON') {
      handleGameEnd('WON');
    }

    // Increment to next level (0-based)
    if (currentLevelIndex < TOTAL_LEVELS - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
    } else {
      // At final level, show completion certificate
      setShowSuccessModal(false);
    }
  };

  const renderDots = () => {
    const size = levelConfig.gridSize;
    const dots = [];

    for (let i = 0; i < size * size; i++) {
      const isInTargetPath = targetPath.current.includes(i);
      const isInUserPath = userPath.includes(i);

      dots.push(
        <motion.button
          key={i}
          onClick={() => handleDotClick(i)}
          className={`w-12 h-12 rounded-full font-body font-bold transition-all ${
            isInUserPath
              ? 'bg-ayur-sage text-white scale-110'
              : isInTargetPath && gameStatus !== 'PLAYING'
              ? 'bg-ayur-gold/50 text-white'
              : 'bg-ayur-sky/30 text-ayur-slate hover:bg-ayur-sky/50'
          }`}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          disabled={gameStatus !== 'PLAYING'}
        >
          {i + 1}
        </motion.button>
      );
    }

    return dots;
  };

  return (
    <div className="min-h-screen bg-ayur-cream p-8 flex flex-col items-center justify-center">
      {/* Header */}
      <motion.div className="w-full max-w-4xl mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-ayur-slate">The Mirror Pattern</h1>
            <p className="font-body text-ayur-slate/60">Level {currentLevelIndex + 1} of {TOTAL_LEVELS}</p>
          </div>
          <div className="text-right">
            <p className="font-body text-lg text-ayur-slate">
              <span className="font-bold text-ayur-gold">{accuracy}%</span> Accuracy
            </p>
            <p className="font-body text-ayur-slate/60">{timeElapsed}s / {levelConfig.timeLimit || '∞'}s</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-ayur-sky/20 rounded-full h-2 mb-4">
          <motion.div
            className="bg-ayur-gold h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(userPath.length / targetPath.current.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Game Area */}
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 mb-8">
        {/* Target Pattern */}
        <motion.div
          className="p-8 bg-white rounded-3xl border-2 border-ayur-gold/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-playfair text-lg font-bold text-ayur-slate mb-6 text-center">Copy This Pattern</h3>
          <div
            className={`grid gap-2 justify-center`}
            style={{
              gridTemplateColumns: `repeat(${levelConfig.gridSize}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: levelConfig.gridSize * levelConfig.gridSize }).map((_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full ${
                  targetPath.current.includes(i) ? 'bg-ayur-gold/60' : 'bg-ayur-sky/20'
                }`}
              />
            ))}
          </div>
          {levelConfig.features.includes('Memory') && (
            <p className="font-body text-xs text-ayur-slate/60 mt-4 text-center italic">
              Pattern will disappear in 5 seconds
            </p>
          )}
        </motion.div>

        {/* User Drawing Area */}
        <motion.div
          className="p-8 bg-gradient-to-br from-ayur-sage/10 to-ayur-sky/10 rounded-3xl border-2 border-ayur-sage/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-playfair text-lg font-bold text-ayur-slate mb-6 text-center">Your Pattern</h3>
          <div
            className={`grid gap-2 justify-center`}
            style={{
              gridTemplateColumns: `repeat(${levelConfig.gridSize}, minmax(0, 1fr))`,
            }}
          >
            {renderDots()}
          </div>
        </motion.div>
      </div>

      {/* Success Modal / Feedback */}
      {showSuccessModal && (
        <motion.div
          className={`w-full max-w-2xl p-8 rounded-2xl mb-8 text-center ${
            gameStatus === 'WON'
              ? 'bg-ayur-sage/10 border border-ayur-sage text-ayur-slate'
              : 'bg-pitta-fire/10 border border-pitta-fire text-ayur-slate'
          }`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="font-playfair text-2xl font-bold mb-3">
            {gameStatus === 'WON' ? '🎉 Victory!' : '💪 Try Again'}
          </p>
          <p className="font-body text-lg mb-4">{levelConfig.dotsToConnect} dots</p>
          <p className="font-body text-sm text-ayur-slate/70 mb-6">
            {accuracy >= GAME_METRICS_CONFIG.MIRROR_PATTERN.passThreshold && gameStatus === 'WON' && 'You have pattern recognition mastery!'}
            {accuracy < GAME_METRICS_CONFIG.MIRROR_PATTERN.passThreshold && 'Focus on matching each dot in sequence.'}
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-ayur-gold text-white font-body font-bold rounded-full hover:bg-ayur-olive transition"
            >
              Retry Level
            </button>
            {gameStatus === 'WON' && currentLevelIndex < TOTAL_LEVELS - 1 && (
              <button
                onClick={handleNextLevel}
                className="px-6 py-3 border-2 border-ayur-gold text-ayur-gold font-body font-bold rounded-full hover:bg-ayur-gold/10 transition"
              >
                Next Level
              </button>
            )}
            {gameStatus === 'WON' && currentLevelIndex === TOTAL_LEVELS - 1 && (
              <div className="px-6 py-3 border-2 border-ayur-sage bg-ayur-sage/10 rounded-full">
                <p className="font-playfair font-bold text-ayur-slate">🏆 Certification of Completion</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Level Info */}
      <motion.div className="w-full max-w-2xl text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <p className="font-body text-sm text-ayur-slate/60">
          <span className="font-bold">Shape:</span> {levelConfig.shape} •{' '}
          <span className="font-bold">Dots:</span> {levelConfig.dotsToConnect} •{' '}
          <span className="font-bold">Grid:</span> {levelConfig.gridSize}x{levelConfig.gridSize}
        </p>
      </motion.div>
    </div>
  );
}
