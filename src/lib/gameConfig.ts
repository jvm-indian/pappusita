/**
 * Game Configuration for Nayanthara
 * Defines all 11 levels for each game with progression logic
 */

export type GameName = 'MIRROR_PATTERN' | 'HIDDEN_HERB' | 'LIONS_BREATH' | 'SOCIAL_DETECTIVE';

/**
 * GAME 1: THE MIRROR PATTERN
 * Target: Autism (Pattern Recognition & Memory)
 * Mechanic: Connect dots to match a pattern shown on the left
 */
export interface MirrorPatternLevel {
  level: number;
  gridSize: number; // 2x2, 3x3, etc.
  dotsToConnect: number;
  shape: string; // 'TRIANGLE', 'SQUARE', 'STAR', 'MANDALA'
  timeLimit?: number; // seconds
  features: string[];
}

export const MIRROR_PATTERN_LEVELS: MirrorPatternLevel[] = [
  {
    level: 1,
    gridSize: 2,
    dotsToConnect: 2,
    shape: 'LINE',
    features: ['Static', 'Green Color'],
  },
  {
    level: 2,
    gridSize: 3,
    dotsToConnect: 3,
    shape: 'TRIANGLE',
    features: ['Static'],
  },
  {
    level: 3,
    gridSize: 3,
    dotsToConnect: 4,
    shape: 'SQUARE',
    features: ['Static'],
  },
  {
    level: 4,
    gridSize: 4,
    dotsToConnect: 5,
    shape: 'Z_SHAPE',
    features: [],
  },
  {
    level: 5,
    gridSize: 4,
    dotsToConnect: 6,
    shape: 'RECTANGLE',
    timeLimit: 30,
    features: ['Timer'],
  },
  {
    level: 6,
    gridSize: 5,
    dotsToConnect: 7,
    shape: 'STAR',
    features: [],
  },
  {
    level: 7,
    gridSize: 5,
    dotsToConnect: 8,
    shape: 'HEXAGON',
    features: ['Background Pulses'],
  },
  {
    level: 8,
    gridSize: 6,
    dotsToConnect: 9,
    shape: 'SPIRAL',
    features: ['Memory Mode (5s)'],
  },
  {
    level: 9,
    gridSize: 6,
    dotsToConnect: 10,
    shape: 'WAVE',
    features: ['Memory Mode (3s)'],
  },
  {
    level: 10,
    gridSize: 8,
    dotsToConnect: 12,
    shape: 'COMPLEX',
    features: [],
  },
  {
    level: 11,
    gridSize: 8,
    dotsToConnect: 15,
    shape: 'MANDALA',
    timeLimit: 15,
    features: ['Memory Mode (1s)', 'Master Level', 'Timer'],
  },
];

/**
 * GAME 2: THE HIDDEN HERB
 * Target: ADHD/Concentration (Find Target Amid Distractors)
 * Mechanic: Find the glowing Tulsi leaf in a cluttered forest
 */
export interface HiddenHerbLevel {
  level: number;
  distractorCount: number;
  targetSize: 'LARGE' | 'MEDIUM' | 'SMALL' | 'TINY';
  features: string[];
  timeLimit?: number;
}

export const HIDDEN_HERB_LEVELS: HiddenHerbLevel[] = [
  {
    level: 1,
    distractorCount: 5,
    targetSize: 'LARGE',
    features: ['Static'],
  },
  {
    level: 2,
    distractorCount: 10,
    targetSize: 'LARGE',
    features: ['Static'],
  },
  {
    level: 3,
    distractorCount: 15,
    targetSize: 'MEDIUM',
    features: [],
  },
  {
    level: 4,
    distractorCount: 20,
    targetSize: 'MEDIUM',
    features: ['Distractors Rotate'],
  },
  {
    level: 5,
    distractorCount: 30,
    targetSize: 'SMALL',
    features: [],
  },
  {
    level: 6,
    distractorCount: 40,
    targetSize: 'SMALL',
    features: ['Target Blinks'],
  },
  {
    level: 7,
    distractorCount: 50,
    targetSize: 'SMALL',
    features: ['Target Moves Slowly'],
  },
  {
    level: 8,
    distractorCount: 60,
    targetSize: 'SMALL',
    features: ['Target Moves Medium', 'Distractors Rotate'],
  },
  {
    level: 9,
    distractorCount: 80,
    targetSize: 'TINY',
    features: ['Target Camouflage', 'Fast Movement'],
  },
  {
    level: 10,
    distractorCount: 100,
    targetSize: 'TINY',
    features: ['Background Changes', 'Fast Movement'],
  },
  {
    level: 11,
    distractorCount: 150,
    targetSize: 'TINY',
    features: ['Needle in Haystack', 'Master Level', 'Multiple Targets Mimic'],
  },
];

/**
 * GAME 3: THE LION'S BREATH
 * Target: Anxiety/Speech (Breath Control & Duration)
 * Mechanic: Use Microphone to keep a feather floating by maintaining breath
 */
export interface LionsBreathLevel {
  level: number;
  volumeThreshold: number; // 0-100 dB scale
  durationRequired: number; // seconds
  breathPattern: 'STEADY' | 'PULSE' | 'HOLD';
  features: string[];
}

export const LIONS_BREATH_LEVELS: LionsBreathLevel[] = [
  {
    level: 1,
    volumeThreshold: 20,
    durationRequired: 2,
    breathPattern: 'STEADY',
    features: [],
  },
  {
    level: 2,
    volumeThreshold: 20,
    durationRequired: 3,
    breathPattern: 'STEADY',
    features: [],
  },
  {
    level: 3,
    volumeThreshold: 30,
    durationRequired: 4,
    breathPattern: 'STEADY',
    features: [],
  },
  {
    level: 4,
    volumeThreshold: 40,
    durationRequired: 5,
    breathPattern: 'STEADY',
    features: ['Deep Lung Capacity'],
  },
  {
    level: 5,
    volumeThreshold: 35,
    durationRequired: 6,
    breathPattern: 'PULSE',
    features: ['Loud-Soft-Loud Pattern'],
  },
  {
    level: 6,
    volumeThreshold: 40,
    durationRequired: 7,
    breathPattern: 'PULSE',
    features: ['Yogic Control'],
  },
  {
    level: 7,
    volumeThreshold: 35,
    durationRequired: 8,
    breathPattern: 'HOLD',
    features: ['Pranayama'],
  },
  {
    level: 8,
    volumeThreshold: 40,
    durationRequired: 8.5,
    breathPattern: 'HOLD',
    features: ['Advanced Pranayama'],
  },
  {
    level: 9,
    volumeThreshold: 40,
    durationRequired: 9,
    breathPattern: 'PULSE',
    features: ['Complex Pattern'],
  },
  {
    level: 10,
    volumeThreshold: 45,
    durationRequired: 9.5,
    breathPattern: 'HOLD',
    features: ['Master Control'],
  },
  {
    level: 11,
    volumeThreshold: 45,
    durationRequired: 10,
    breathPattern: 'PULSE',
    features: ['The Warrior Breath', 'Master Level'],
  },
];

/**
 * GAME 4: THE SOCIAL DETECTIVE
 * Target: Autism (Social Cue Recognition)
 * Mechanic: Identify emotions and social cues from text scenarios
 */
export interface SocialScenario {
  level: number;
  scenario: string;
  correctAnswer: string;
  options: string[];
  emotionalCue: string;
  explanation: string;
}

export const SOCIAL_DETECTIVE_SCENARIOS: SocialScenario[] = [
  {
    level: 1,
    scenario: 'Rohan is smiling widely.',
    correctAnswer: 'Happy',
    options: ['Happy', 'Sad', 'Angry'],
    emotionalCue: 'Smile',
    explanation: 'When someone smiles, it usually means they are happy!',
  },
  {
    level: 2,
    scenario: 'Priya is looking down and crying.',
    correctAnswer: 'Sad',
    options: ['Sad', 'Happy', 'Confused'],
    emotionalCue: 'Tears',
    explanation: 'Tears and looking down shows sadness.',
  },
  {
    level: 3,
    scenario: 'Arjun is speaking in a loud voice and his fists are tight.',
    correctAnswer: 'Angry',
    options: ['Angry', 'Excited', 'Tired'],
    emotionalCue: 'Loud Voice + Tight Fists',
    explanation: 'Loud voice and tight fists are signs of anger.',
  },
  {
    level: 4,
    scenario: 'Maya keeps asking questions about a topic.',
    correctAnswer: 'Curious',
    options: ['Curious', 'Confused', 'Bored'],
    emotionalCue: 'Questions',
    explanation: 'Asking many questions shows curiosity and interest.',
  },
  {
    level: 5,
    scenario: 'Vikram is looking at his watch repeatedly during a game.',
    correctAnswer: 'Anxious/Impatient',
    options: ['Anxious', 'Happy', 'Calm'],
    emotionalCue: 'Repeated Watch Checking',
    explanation: 'Checking the time repeatedly shows anxiety or impatience.',
  },
  {
    level: 6,
    scenario: 'Sneha is rolling her eyes while someone is talking.',
    correctAnswer: 'Disrespectful/Frustrated',
    options: ['Disrespectful', 'Happy', 'Interested'],
    emotionalCue: 'Eye Rolling',
    explanation: 'Eye rolling shows disrespect or frustration.',
  },
  {
    level: 7,
    scenario: 'Arun keeps his arms crossed and avoids eye contact.',
    correctAnswer: 'Defensive/Closed Off',
    options: ['Defensive', 'Open', 'Friendly'],
    emotionalCue: 'Crossed Arms + No Eye Contact',
    explanation: 'Crossed arms and avoiding eye contact shows defensiveness.',
  },
  {
    level: 8,
    scenario: 'Divya is nodding along while someone speaks and asking follow-up questions.',
    correctAnswer: 'Engaged/Interested',
    options: ['Engaged', 'Bored', 'Confused'],
    emotionalCue: 'Nodding + Questions',
    explanation: 'Nodding and asking questions shows active engagement.',
  },
  {
    level: 9,
    scenario: 'Rahul is tapping his foot, fidgeting in his seat, and looking around the room.',
    correctAnswer: 'Restless/Distracted',
    options: ['Restless', 'Calm', 'Happy'],
    emotionalCue: 'Fidgeting + Looking Around',
    explanation: 'Fidgeting and looking away show restlessness and distraction.',
  },
  {
    level: 10,
    scenario: 'Shreya pauses before speaking, takes a deep breath, and speaks calmly about something difficult.',
    correctAnswer: 'Thoughtful/Composed',
    options: ['Thoughtful', 'Scared', 'Angry'],
    emotionalCue: 'Pause + Deep Breath + Calm Voice',
    explanation: 'Pausing and taking breath before speaking shows composure.',
  },
  {
    level: 11,
    scenario: 'Adityais standing very close to someone who keeps stepping back, speaks loudly, and gestures wildly. Meanwhile, the other person has their body turned away.',
    correctAnswer: 'Overwhelming/Imposing - Other Person is Uncomfortable',
    options: ['Overwhelming/Uncomfortable', 'Friendly', 'Calm'],
    emotionalCue: 'Proxemics + Body Language + Reaction',
    explanation: 'Standing too close, loud voice, and averted body language shows discomfort.',
  },
];

/**
 * Game metrics configuration
 */
export interface GameMetricsConfig {
  passThreshold: number; // % accuracy needed to pass
  karmaPointsWin: number; // Points awarded for winning
  karmaPointsAttempt: number; // Participation points
  nextLevelUnlock: boolean; // Auto unlock next level on win
}

export const GAME_METRICS_CONFIG: Record<GameName, GameMetricsConfig> = {
  MIRROR_PATTERN: {
    passThreshold: 80,
    karmaPointsWin: 50,
    karmaPointsAttempt: 10,
    nextLevelUnlock: true,
  },
  HIDDEN_HERB: {
    passThreshold: 75,
    karmaPointsWin: 50,
    karmaPointsAttempt: 10,
    nextLevelUnlock: true,
  },
  LIONS_BREATH: {
    passThreshold: 70,
    karmaPointsWin: 60,
    karmaPointsAttempt: 15,
    nextLevelUnlock: true,
  },
  SOCIAL_DETECTIVE: {
    passThreshold: 85,
    karmaPointsWin: 40,
    karmaPointsAttempt: 10,
    nextLevelUnlock: true,
  },
};

/**
 * Helper function to get level config
 */
export function getLevelConfig(gameName: GameName, level: number) {
  switch (gameName) {
    case 'MIRROR_PATTERN':
      return MIRROR_PATTERN_LEVELS[level - 1];
    case 'HIDDEN_HERB':
      return HIDDEN_HERB_LEVELS[level - 1];
    case 'LIONS_BREATH':
      return LIONS_BREATH_LEVELS[level - 1];
    case 'SOCIAL_DETECTIVE':
      return SOCIAL_DETECTIVE_SCENARIOS[level - 1];
    default:
      return null;
  }
}

export function getMaxLevel(gameName: GameName): number {
  switch (gameName) {
    case 'MIRROR_PATTERN':
      return MIRROR_PATTERN_LEVELS.length;
    case 'HIDDEN_HERB':
      return HIDDEN_HERB_LEVELS.length;
    case 'LIONS_BREATH':
      return LIONS_BREATH_LEVELS.length;
    case 'SOCIAL_DETECTIVE':
      return SOCIAL_DETECTIVE_SCENARIOS.length;
    default:
      return 1;
  }
}
