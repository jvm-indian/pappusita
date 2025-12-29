import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HIDDEN_HERB_LEVELS, GAME_METRICS_CONFIG } from '../../lib/gameConfig';
import type { GameLog } from '../../lib/schemas';
import { db } from '../../lib/schemas';
import { generateGitaWisdom } from '../../lib/gitaAI';

interface HiddenHerbProps {
  childId: string;
  currentLevel: number;
  onLevelComplete: (metrics: GameLog) => void;
}

type HiddenHerbLevel = (typeof HIDDEN_HERB_LEVELS)[number] & {
  herbId: string;
  hiddenLocation: { x: number; y: number }; // normalized (0-1) coords
};

// Placeholder levels (10) – fill hiddenLocation later
const levels: HiddenHerbLevel[] = Array.from({ length: 10 }, (_, idx) => ({
  ...HIDDEN_HERB_LEVELS[idx],
  herbId: `herb-${idx + 1}`,
  hiddenLocation: { x: 0.5, y: 0.5 },
}));

interface Item {
  id: number;
  x: number;
  y: number;
  isTarget: boolean;
  radius: number;
  vx: number;
  vy: number;
}

export default function HiddenHerb({ childId, currentLevel, onLevelComplete }: HiddenHerbProps) {
  const totalLevels = levels.length; // 10 levels (0-9)
  const [levelIndex, setLevelIndex] = useState(0);
  // sync incoming 1-based currentLevel to 0-based state
  useEffect(() => {
    const idx = Math.max(0, Math.min(currentLevel - 1, totalLevels - 1));
    setLevelIndex(idx);
  }, [currentLevel, totalLevels]);
  const levelConfig = levels[levelIndex];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [gameStatus, setGameStatus] = useState<'PLAYING' | 'WON' | 'FAILED'>('PLAYING');
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const itemsRef = useRef<Item[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);

  const getTargetSize = () => {
    const sizeMap = { LARGE: 25, MEDIUM: 18, SMALL: 12, TINY: 8 };
    return sizeMap[levelConfig.targetSize];
  };

  const resetLevelState = () => {
    setTimeElapsed(0);
    setWrongClicks(0);
    setGameStatus('PLAYING');
    setIsLevelComplete(false);
    setShowModal(false);
    setShowCompletionSummary(false);

    // Rebuild items for this level
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const items: Item[] = [];

    // Distractors
    for (let i = 0; i < levelConfig.distractorCount; i++) {
      items.push({
        id: i,
        x: Math.random() * (canvas.width - 40) + 20,
        y: Math.random() * (canvas.height - 40) + 20,
        isTarget: false,
        radius: 12,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    // Target at predetermined location (normalized -> canvas coords)
    const targetX = levelConfig.hiddenLocation.x * canvas.width;
    const targetY = levelConfig.hiddenLocation.y * canvas.height;
    items.push({
      id: levelConfig.distractorCount,
      x: targetX,
      y: targetY,
      isTarget: true,
      radius: getTargetSize(),
      vx: 0,
      vy: 0,
    });

    itemsRef.current = items;
  };

  // Initialize items on mount and whenever the level changes
  useEffect(() => {
    resetLevelState();
  }, [levelIndex]);

  // Canvas animation loop
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#F9F7F2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw items
      for (const item of itemsRef.current) {
        // Update position if moving
        if (levelConfig.features.includes('Moves') || (item.isTarget && levelConfig.features.includes('Movement'))) {
          item.x += item.vx;
          item.y += item.vy;

          // Bounce off walls
          if (item.x - item.radius < 0 || item.x + item.radius > canvas.width) {
            item.vx *= -1;
          }
          if (item.y - item.radius < 0 || item.y + item.radius > canvas.height) {
            item.vy *= -1;
          }

          item.x = Math.max(item.radius, Math.min(canvas.width - item.radius, item.x));
          item.y = Math.max(item.radius, Math.min(canvas.height - item.radius, item.y));
        }

        // Draw item
        if (item.isTarget) {
          // Draw glowing target
          ctx.fillStyle = 'rgba(139, 176, 75, 0.8)';
          ctx.shadowColor = 'rgba(139, 176, 75, 0.6)';
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
          ctx.fill();

          // Draw leaf shape indicator
          ctx.fillStyle = '#88B04B';
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🌿', item.x, item.y);
        } else {
          // Draw distractors (stones/sticks)
          ctx.fillStyle = 'rgba(101, 84, 63, 0.6)';
          ctx.shadowColor = 'transparent';
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
          ctx.fill();

          // Rotate distractors if feature enabled
          if (levelConfig.features.includes('Rotate')) {
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate((timeElapsed * Math.PI) / 180);
            ctx.fillStyle = 'rgba(140, 100, 50, 0.4)';
            ctx.fillRect(-8, -2, 16, 4);
            ctx.restore();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [timeElapsed, levelConfig.features]);

  // Timer
  useEffect(() => {
    if (gameStatus === 'PLAYING') {
      const interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStatus]);

  // Canvas click handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStatus !== 'PLAYING' || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on target
    const target = itemsRef.current.find((item) => item.isTarget);
    if (target) {
      const dist = Math.sqrt((x - target.x) ** 2 + (y - target.y) ** 2);
      if (dist < target.radius + 10) {
        handleGameEnd('WON');
        return;
      }
    }

    // Wrong click
    setWrongClicks((prev) => prev + 1);
  };

  const handleGameEnd = (status: 'WON' | 'FAILED') => {
    setGameStatus(status);
    setIsLevelComplete(status === 'WON');
    setShowModal(true);

    const metrics: GameLog = {
      _id: `log_${Date.now()}`,
      child_id: childId,
      game_type: 'HIDDEN_HERB',
      level_played: levelIndex + 1,
      timestamp: new Date(),
      metrics: {
        accuracy: status === 'WON' ? 100 : Math.max(0, 100 - wrongClicks * 10),
        time_taken: timeElapsed,
        impulsivity_count: wrongClicks,
        tremor_index: 0,
        focus_breaks: 0,
        completion_status: status,
      },
      ai_insight: generateGitaWisdom('Child', 'HIDDEN_HERB', status === 'WON', levelIndex + 1),
      recommended_action: '',
    };

    db.recordGameLog(metrics);
    if (status === 'WON') {
      onLevelComplete(metrics);
    }
  };

  const handleRetry = () => {
    resetLevelState();
  };

  const handleNextLevel = () => {
    if (levelIndex < levels.length - 1) {
      setLevelIndex((prev) => prev + 1);
      setShowModal(false);
      // reset will run from useEffect when levelIndex changes
    } else {
      // Game completion
      setShowCompletionSummary(true);
    }
  };

  return (
    <div className="min-h-screen bg-ayur-cream p-8 flex flex-col items-center justify-center">
      {/* Header */}
      <motion.div className="w-full max-w-4xl mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-ayur-slate">🌿 The Hidden Herb</h1>
            <p className="font-body text-ayur-slate/60">Level {levelIndex + 1} of {totalLevels} - Find the Glowing Leaf</p>
          </div>
          <div className="text-right">
            <p className="font-body text-lg text-ayur-slate">
              <span className="font-bold text-pitta-fire">{wrongClicks}</span> Wrong Clicks
            </p>
            <p className="font-body text-ayur-slate/60">{timeElapsed}s</p>
          </div>
        </div>
      </motion.div>

      {/* Canvas Game Area */}
      <motion.div
        className="w-full max-w-3xl rounded-3xl border-4 border-ayur-gold/40 overflow-hidden shadow-xl mb-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onClick={handleCanvasClick}
          className="w-full bg-ayur-cream cursor-crosshair block"
        />
      </motion.div>

      {/* Instructions */}
      <motion.div className="w-full max-w-2xl mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <p className="font-body text-center text-ayur-slate mb-4">
          Click on the <span className="font-bold text-vata-wind">glowing 🌿 leaf</span> hidden among {levelConfig.distractorCount} items
        </p>
        {levelConfig.features.length > 0 && (
          <p className="font-body text-center text-sm text-ayur-slate/60">
            <span className="font-bold">Difficulty:</span> {levelConfig.features.join(' + ')}
          </p>
        )}
      </motion.div>

      {/* Success / Failure Modal */}
      {showModal ? (
        <motion.div
          className={`w-full max-w-2xl p-8 rounded-2xl text-center ${
            gameStatus === 'WON'
              ? 'bg-ayur-sage/10 border border-ayur-sage text-ayur-slate'
              : 'bg-pitta-fire/10 border border-pitta-fire text-ayur-slate'
          }`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="font-playfair text-2xl font-bold mb-3">
            {gameStatus === 'WON' ? '🎉 Found It!' : '💪 Keep Looking'}
          </p>
          <p className="font-body text-lg mb-4">
            {gameStatus === 'WON' ? `Found in ${timeElapsed} seconds!` : `${wrongClicks} wrong attempts`}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-ayur-gold text-white font-body font-bold rounded-full hover:bg-ayur-olive transition"
            >
              Retry Level
            </button>
            {gameStatus === 'WON' && levelIndex < totalLevels - 1 && !showCompletionSummary && (
              <button
                onClick={handleNextLevel}
                className="px-6 py-3 border-2 border-ayur-gold text-ayur-gold font-body font-bold rounded-full hover:bg-ayur-gold/10 transition"
              >
                Next Level
              </button>
            )}
            {gameStatus === 'WON' && levelIndex === totalLevels - 1 && (
              <button
                onClick={() => setShowCompletionSummary(true)}
                className="px-6 py-3 border-2 border-ayur-sage text-ayur-sage font-body font-bold rounded-full hover:bg-ayur-sage/10 transition"
              >
                Finish Journey
              </button>
            )}
          </div>
          {showCompletionSummary && (
            <p className="font-body text-sm text-ayur-slate mt-4">All herbs found! Great job completing the journey.</p>
          )}
        </motion.div>
      ) : null}
    </div>
  );
}
