/**
 * Ayurvedic AI Inference Engine
 * Maps game metrics to Vata/Pitta/Kapha imbalances and generates prescriptions
 */

import type { GameLog } from './schemas';

export type DoshaType = 'VATA' | 'PITTA' | 'KAPHA';

export interface DoshaAnalysis {
  vata_score: number; // 0-100
  pitta_score: number; // 0-100
  kapha_score: number; // 0-100
  dominant_dosha: DoshaType;
  insights: string[];
  prescriptions: LifestylePrescription[];
}

export interface LifestylePrescription {
  category: 'FOOD' | 'ACTIVITY' | 'BREATHING' | 'ROUTINE';
  description: string;
  duration_minutes?: number;
  urgency: 'IMMEDIATE' | 'TODAY' | 'WEEKLY';
}

/**
 * Analyze game metrics and infer Dosha imbalances
 */
export function analyzeGameMetrics(gameLogs: GameLog[]): DoshaAnalysis {
  if (gameLogs.length === 0) {
    return getBaselineAnalysis();
  }

  let vata_score = 0;
  let pitta_score = 0;
  let kapha_score = 0;

  const insights: string[] = [];

  // Analyze recent games (last 5)
  const recent = gameLogs.slice(-5);

  for (const log of recent) {
    const { metrics, game_type } = log;

    // VATA ANALYSIS (Air/Wind - Tremor, Instability, Anxiety)
    // High tremor index indicates high Vata (ADHD, anxiety)
    if (metrics.tremor_index > 60) {
      vata_score += 30;
      insights.push('High Vata detected: Motor agitation and instability');
    }

    // High impulsivity = High Vata
    if (metrics.impulsivity_count > 5) {
      vata_score += 25;
      insights.push('Vata imbalance: Impulsive decision-making pattern');
    }

    // PITTA ANALYSIS (Fire - Anger, Frustration, Aggression)
    // Low accuracy with high speed attempts = Pitta (rushing, frustration)
    if (metrics.accuracy < 50 && metrics.time_taken < 30) {
      pitta_score += 25;
      insights.push('Pitta imbalance: Rushing without focus (Fire energy)');
    }

    // Many focus breaks = Pitta agitation
    if (metrics.focus_breaks > 3) {
      pitta_score += 20;
      insights.push('Pitta aggravation: Frequent focus interruptions');
    }

    // KAPHA ANALYSIS (Earth/Water - Lethargy, Slowness)
    // Very slow completion with low engagement
    if (metrics.time_taken > 120 && metrics.accuracy > 60) {
      kapha_score += 20;
      insights.push('Kapha tendency: Slow but steady approach');
    }

    // Game failure despite time = Kapha lethargy
    if (
      metrics.completion_status === 'FAILED' &&
      metrics.time_taken > 60
    ) {
      kapha_score += 15;
      insights.push('Kapha imbalance: Sluggish engagement');
    }
  }

  // Normalize scores to 0-100
  const total = vata_score + pitta_score + kapha_score || 1;
  vata_score = (vata_score / total) * 100;
  pitta_score = (pitta_score / total) * 100;
  kapha_score = (kapha_score / total) * 100;

  // Determine dominant dosha
  let dominant_dosha: DoshaType = 'VATA';
  if (pitta_score >= vata_score && pitta_score >= kapha_score) {
    dominant_dosha = 'PITTA';
  } else if (kapha_score >= vata_score && kapha_score >= pitta_score) {
    dominant_dosha = 'KAPHA';
  }

  // Generate prescriptions based on dosha
  const prescriptions = generatePrescriptions(
    dominant_dosha,
    vata_score,
    pitta_score,
    kapha_score,
    recent[recent.length - 1]?.metrics
  );

  return {
    vata_score: Math.round(vata_score),
    pitta_score: Math.round(pitta_score),
    kapha_score: Math.round(kapha_score),
    dominant_dosha,
    insights,
    prescriptions,
  };
}

/**
 * Generate lifestyle prescriptions based on Dosha imbalance
 */
function generatePrescriptions(
  dominant: DoshaType,
  vata: number,
  pitta: number,
  kapha: number,
  metrics?: GameLog['metrics']
): LifestylePrescription[] {
  const prescriptions: LifestylePrescription[] = [];

  if (dominant === 'VATA') {
    prescriptions.push(
      {
        category: 'ACTIVITY',
        description: 'Do 10 Wall Pushes (Heavy pressure for grounding)',
        duration_minutes: 5,
        urgency: 'IMMEDIATE',
      },
      {
        category: 'BREATHING',
        description: 'Practice Deep Pressure Breathing: Wrap yourself in a heavy blanket for 5 minutes and breathe slowly',
        duration_minutes: 5,
        urgency: 'IMMEDIATE',
      },
      {
        category: 'FOOD',
        description: 'Eat warm, grounding foods: Cooked vegetables, warming spices (ginger, cinnamon)',
        urgency: 'TODAY',
      },
      {
        category: 'ROUTINE',
        description: 'Establish a consistent sleep schedule (sleep at same time daily)',
        urgency: 'WEEKLY',
      }
    );
  } else if (dominant === 'PITTA') {
    prescriptions.push(
      {
        category: 'ACTIVITY',
        description: 'Cool down: Splash cold water on face or take a cool shower',
        duration_minutes: 5,
        urgency: 'IMMEDIATE',
      },
      {
        category: 'BREATHING',
        description: 'Practice Cooling Breath (Shitali Pranayama): Breathe in through mouth, out through nose',
        duration_minutes: 5,
        urgency: 'IMMEDIATE',
      },
      {
        category: 'FOOD',
        description: 'Eat cooling foods: Coconut water, cucumber, melon, mint leaves',
        urgency: 'TODAY',
      },
      {
        category: 'ROUTINE',
        description: 'Practice mindfulness: 5-minute meditation focusing on calm thoughts',
        duration_minutes: 5,
        urgency: 'TODAY',
      }
    );
  } else if (dominant === 'KAPHA') {
    prescriptions.push(
      {
        category: 'ACTIVITY',
        description: 'Energize: Go for a brisk walk or do 20 jumping jacks',
        duration_minutes: 10,
        urgency: 'IMMEDIATE',
      },
      {
        category: 'BREATHING',
        description: 'Practice Energizing Breath: Kapalabhati (skull-shining breath) - quick powerful exhales',
        duration_minutes: 5,
        urgency: 'IMMEDIATE',
      },
      {
        category: 'FOOD',
        description: 'Eat light, warming foods: Ginger tea, warm lemon water, spices (black pepper)',
        urgency: 'TODAY',
      },
      {
        category: 'ROUTINE',
        description: 'Maintain activity: Schedule regular play time and exercise',
        urgency: 'WEEKLY',
      }
    );
  }

  return prescriptions;
}

/**
 * Get baseline Dosha analysis for new children
 */
function getBaselineAnalysis(): DoshaAnalysis {
  return {
    vata_score: 40,
    pitta_score: 30,
    kapha_score: 30,
    dominant_dosha: 'VATA',
    insights: [
      'New child profile: Default balanced state',
      'Play games to establish baseline metrics',
    ],
    prescriptions: [
      {
        category: 'ROUTINE',
        description: 'Maintain a consistent daily routine with regular meal and sleep times',
        urgency: 'WEEKLY',
      },
      {
        category: 'ACTIVITY',
        description: 'Engage in mindful play: Games help balance the mind and body',
        duration_minutes: 20,
        urgency: 'TODAY',
      },
    ],
  };
}

/**
 * Generate a Gita-inspired message based on game performance
 */
export function generateGitaWisdom(
  childName: string,
  gameType: string,
  success: boolean,
  level: number
): string {
  const successStories = [
    `${childName}, like Arjuna holding his bow steady, you maintained your focus and hit the target. Your mind is becoming a warrior's mind.`,
    `Through practice, ${childName}, you are becoming a master archer of your own senses. The Gita teaches: "Yoga is skill in action." You just showed that skill.`,
    `${childName}, you have the steadiness of Krishna's chariot—unwavering, focused, unstoppable. This is the path of the warrior within.`,
    `Like the string on a warrior's bow, ${childName}, your focus is now taut and true. You are ready for greater challenges.`,
  ];

  const failureStories = [
    `${childName}, even Arjuna doubted himself. But he took a breath, steadied his mind, and tried again. Will you?`,
    `The Gita says: "On this path, effort never goes to waste." ${childName}, this attempt taught your mind something. Try once more.`,
    `${childName}, the greatest warriors stumble. The difference is they rise. Your next attempt is your next victory.`,
    `The mind is like wind, sometimes turbulent. Breathe deeply, ${childName}. The next level awaits your steady focus.`,
  ];

  const story = success
    ? successStories[Math.floor(Math.random() * successStories.length)]
    : failureStories[Math.floor(Math.random() * failureStories.length)];

  return story;
}

/**
 * Map game type to Ayurvedic principle
 */
export function getGameAyurvedicName(gameType: string): string {
  const mapping: Record<string, string> = {
    MIRROR_PATTERN: 'Chakra Dhyana (Geometric Focus)',
    HIDDEN_HERB: 'Pushpa Sadhana (Flower Finding)',
    LIONS_BREATH: 'Simha Garjana (Lion\'s Breath)',
    SOCIAL_DETECTIVE: 'Rasa Bodha (Emotional Intelligence)',
  };
  return mapping[gameType] || gameType;
}
