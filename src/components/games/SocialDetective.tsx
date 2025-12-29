import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SocialDetectiveProps {
  childId: string;
  currentLevel: number;
  onLevelComplete: (metrics: any) => void;
}

const TOTAL_LEVELS = 10;

export default function SocialDetective({ childId, currentLevel: _initialLevel, onLevelComplete }: SocialDetectiveProps) {
  // Robust local scenarios (10 levels)
  const scenarios = [
    { id: 1, question: 'Rohan is smiling widely after hearing a joke.', options: ['Happy', 'Sad', 'Angry'], correctIndex: 0, emotionalCue: 'Smile', explanation: 'A wide smile usually signals happiness.' },
    { id: 2, question: 'Priya looks down and tears are rolling down her cheeks.', options: ['Sad', 'Excited', 'Angry'], correctIndex: 0, emotionalCue: 'Tears', explanation: 'Tears and looking down are common signs of sadness.' },
    { id: 3, question: 'Arjun is speaking loudly with clenched fists.', options: ['Calm', 'Angry', 'Sleepy'], correctIndex: 1, emotionalCue: 'Loud voice + clenched fists', explanation: 'Raised voice and clenched fists often indicate anger.' },
    { id: 4, question: 'Maya keeps asking many questions about the same topic.', options: ['Curious', 'Bored', 'Confused'], correctIndex: 0, emotionalCue: 'Many questions', explanation: 'Repeated questions show curiosity and interest.' },
    { id: 5, question: 'Vikram checks his watch again and again during a meeting.', options: ['Calm', 'Impatient', 'Happy'], correctIndex: 1, emotionalCue: 'Watch checking', explanation: 'Checking time repeatedly can mean impatience or anxiety.' },
    { id: 6, question: 'Sneha rolls her eyes while someone is talking.', options: ['Respectful', 'Frustrated', 'Excited'], correctIndex: 1, emotionalCue: 'Eye roll', explanation: 'Eye rolling usually shows frustration or disrespect.' },
    { id: 7, question: 'Arun crosses his arms and avoids eye contact.', options: ['Defensive', 'Friendly', 'Joyful'], correctIndex: 0, emotionalCue: 'Crossed arms + no eye contact', explanation: 'Closed posture and no eye contact suggest defensiveness.' },
    { id: 8, question: 'Divya nods often and asks follow-up questions while listening.', options: ['Engaged', 'Bored', 'Angry'], correctIndex: 0, emotionalCue: 'Nods + follow-up questions', explanation: 'Nodding and asking more shows engagement and interest.' },
    { id: 9, question: 'Rahul taps his foot, fidgets, and keeps looking around.', options: ['Restless', 'Calm', 'Happy'], correctIndex: 0, emotionalCue: 'Fidgeting + looking away', explanation: 'Fidgeting and looking away show restlessness or distraction.' },
    { id: 10, question: 'Shreya pauses, breathes deep, and speaks calmly about something tough.', options: ['Thoughtful', 'Scared', 'Angry'], correctIndex: 0, emotionalCue: 'Pause + deep breath', explanation: 'Pausing and calm tone signal composure and thoughtfulness.' },
  ];

  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Crash-proof guard for missing data
  if (!scenarios || !scenarios[currentLevel]) {
    return <div>Loading scenarios...</div>;
  }

  const scenario = scenarios[currentLevel];

  const handleAnswerClick = (optionIndex: number) => {
    if (isAnswered) return;

    setSelectedOption(optionIndex);
    const correct = optionIndex === scenario.correctIndex;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore((prev) => prev + 1);
      setShowModal(true);
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowModal(false);
  };

  const handleNextLevel = () => {
    setCurrentLevel((prev) => prev + 1);
    setIsCorrect(false);
    setIsAnswered(false);
    setSelectedOption(null);
    setShowModal(false);
  };

  const isFinalLevel = currentLevel === TOTAL_LEVELS - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-ayur-sky/20 via-ayur-cream to-ayur-sage/10 p-8 flex flex-col items-center justify-center">
      <motion.div className="w-full max-w-2xl mb-8 text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-playfair text-4xl font-bold text-ayur-slate mb-2">🔍 The Social Detective</h1>
        <p className="font-body text-ayur-slate/60">Level {currentLevel + 1} of {TOTAL_LEVELS} - Read the situation and guess the emotion</p>
      </motion.div>

      <motion.div
        className="w-full max-w-2xl rounded-3xl bg-white p-12 shadow-2xl mb-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className="mb-8 p-8 bg-gradient-to-br from-ayur-sky/10 to-ayur-sage/10 rounded-2xl border-2 border-ayur-gold/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="font-body text-xl text-ayur-slate leading-relaxed text-center">
            {scenario.question}
          </p>
        </motion.div>

        <motion.h3
          className="font-playfair text-2xl font-bold text-center text-ayur-slate mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          What is this person feeling?
        </motion.h3>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          {scenario.options.map((option, idx) => (
            <motion.button
              key={idx}
              onClick={() => handleAnswerClick(idx)}
              className={`p-6 rounded-2xl font-body font-bold text-lg transition-all ${
                selectedOption === idx
                  ? isCorrect
                    ? 'bg-ayur-sage text-white scale-105 shadow-lg'
                    : 'bg-pitta-fire text-white scale-105 shadow-lg'
                  : 'bg-ayur-sky/10 text-ayur-slate border-2 border-ayur-sky/30 hover:border-ayur-sky hover:bg-ayur-sky/20'
              }`}
              whileHover={!isAnswered ? { scale: 1.05 } : {}}
              whileTap={!isAnswered ? { scale: 0.95 } : {}}
              disabled={isAnswered}
            >
              {option}
              {selectedOption === idx && (
                <motion.div className="ml-3 inline-block">
                  {isCorrect ? '✓' : '✗'}
                </motion.div>
              )}
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence>
          {isAnswered && (
            <motion.div
              className={`p-6 rounded-2xl text-center ${
                isCorrect
                  ? 'bg-ayur-sage/20 border border-ayur-sage text-ayur-slate'
                  : 'bg-pitta-fire/20 border border-pitta-fire text-ayur-slate'
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <p className="font-playfair text-xl font-bold mb-2">{isCorrect ? '✨ Correct!' : '🤔 Not quite'}</p>
              <p className="font-body text-sm mb-4">{scenario.explanation}</p>
              {!isCorrect && (
                <p className="font-body text-sm font-bold text-pitta-fire">
                  The answer was: <span className="text-lg">{scenario.options[scenario.correctIndex]}</span>
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="w-full max-w-2xl p-6 bg-ayur-gold/10 rounded-2xl border border-ayur-gold/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="font-body font-bold text-ayur-slate mb-2">💡 Clue: Look for...</p>
        <p className="font-body text-sm text-ayur-slate/70">{scenario.emotionalCue}</p>
      </motion.div>

      <motion.div className="mt-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <div className="flex gap-8 justify-center">
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="font-body text-xs text-ayur-slate/60 mb-1">Score</p>
            <p className="font-playfair text-3xl font-bold text-ayur-gold">{score}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="font-body text-xs text-ayur-slate/60 mb-1">Level</p>
            <p className="font-playfair text-3xl font-bold text-ayur-sky">{currentLevel + 1}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="font-body text-xs text-ayur-slate/60 mb-1">Emotion</p>
            <p className="font-playfair text-2xl">{scenario.emotionalCue.split(' ')[0]}</p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && isCorrect && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-md shadow-2xl text-center"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <p className="font-playfair text-3xl font-bold text-ayur-sage mb-4">🎉 Level Complete!</p>
              <p className="font-body text-ayur-slate/70 mb-8">{isFinalLevel ? 'Mission Accomplished!' : 'Great job reading the emotions! Ready for the next scenario?'}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 bg-ayur-gold/20 text-ayur-gold font-body font-bold rounded-full hover:bg-ayur-gold/30 transition border border-ayur-gold"
                >
                  Retry
                </button>
                {!isFinalLevel && (
                  <button
                    onClick={handleNextLevel}
                    className="px-6 py-3 bg-ayur-sage text-white font-body font-bold rounded-full hover:bg-ayur-olive transition shadow-lg"
                  >
                    Next Level
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
