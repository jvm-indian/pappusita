/**
 * Database Schemas for Nayanthara
 * These interfaces define the structure for Users, Doctors, GameLogs, and Allocations
 */

export type DisabilityType = 'ADHD' | 'AUTISM' | 'DYSLEXIA' | 'ANXIETY';
export type UserRole = 'CHILD' | 'DOCTOR' | 'ADMIN' | 'PARENT';
export type GameType = 'MIRROR_PATTERN' | 'HIDDEN_HERB' | 'LIONS_BREATH' | 'SOCIAL_DETECTIVE';

/**
 * User Schema: Represents Child and Parent profiles
 */
export interface User {
  _id: string;
  role: UserRole;
  name: string;
  email: string;
  password_hash?: string;
  
  // Child-specific fields
  age?: number;
  disabilities?: DisabilityType[];
  symptoms_narrative?: string; // "Struggles with loud noises..."
  assigned_doctor_id?: string;
  ayurvedic_profile?: {
    vata_score: number; // 0-100: High = Anxiety/Tremor
    pitta_score: number; // 0-100: High = Anger/Impulse
    kapha_score: number; // 0-100: High = Lethargy
  };
  progression?: {
    mirror_game_level: number; // 1-11
    hidden_herb_level: number; // 1-11
    lions_breath_level: number; // 1-11
    social_detective_level: number; // 1-11
  };
  karma_points: number;
  gita_unlocked_chapters: number[];
  
  // Parent/Doctor-specific fields
  parent_email?: string;
  license_number?: string;
  specialization?: string;
  verification_documents?: string[];
  is_verified: boolean;
  patient_limit?: number;
  current_patients?: string[];
  
  // Common
  created_at: Date;
  last_login: Date;
}

/**
 * GameLog Schema: Records every game play for analytics
 */
export interface GameLog {
  _id: string;
  child_id: string;
  game_type: GameType;
  level_played: number;
  timestamp: Date;
  
  // Metrics captured during gameplay
  metrics: {
    accuracy: number; // Percentage 0-100
    time_taken: number; // Seconds
    impulsivity_count: number; // Wrong clicks/decisions
    tremor_index: number; // Gyroscope variation (0-100)
    focus_breaks: number; // Times broke concentration
    completion_status: 'WON' | 'FAILED' | 'ABANDONED';
  };
  
  // AI Analysis
  ai_insight: string; // "High Vata detected due to 40% tremor rate"
  recommended_action: string; // "Cooling protocol advised"
}

/**
 * Doctor-Patient Allocation Schema
 */
export interface DoctorAllocation {
  _id: string;
  doctor_id: string;
  child_id: string;
  assigned_date: Date;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
}

/**
 * Gita Story Schema: Stores personalized stories for children
 */
export interface GitaStory {
  _id: string;
  child_id: string;
  game_type: GameType;
  level_completed: number;
  story_text: string;
  story_audio_url?: string; // Azure TTS generated
  warrior_habit: string; // "Drink water now" type advice
  generated_at: Date;
}

/**
 * In-Memory Mock Database
 * For development/MVP. Replace with MongoDB in production.
 */
export class MockDatabase {
  private users: Map<string, User> = new Map();
  private gameLogs: GameLog[] = [];
  private stories: GitaStory[] = [];
  private allocations: DoctorAllocation[] = [];

  // User operations
  createUser(user: Omit<User, '_id' | 'created_at' | 'last_login'>): User {
    const newUser: User = {
      ...user,
      _id: `user_${Date.now()}_${Math.random()}`,
      created_at: new Date(),
      last_login: new Date(),
      karma_points: 0,
      gita_unlocked_chapters: [],
      is_verified: false,
    };
    this.users.set(newUser._id, newUser);
    return newUser;
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUsersByRole(role: UserRole): User[] {
    return Array.from(this.users.values()).filter(u => u.role === role);
  }

  // GameLog operations
  recordGameLog(log: Omit<GameLog, '_id'>): GameLog {
    const newLog: GameLog = {
      ...log,
      _id: `log_${Date.now()}_${Math.random()}`,
    };
    this.gameLogs.push(newLog);
    return newLog;
  }

  getGameLogs(childId: string): GameLog[] {
    return this.gameLogs.filter(log => log.child_id === childId);
  }

  getGameLogsByType(childId: string, gameType: GameType): GameLog[] {
    return this.gameLogs.filter(
      log => log.child_id === childId && log.game_type === gameType
    );
  }

  // Story operations
  storeStory(story: Omit<GitaStory, '_id'>): GitaStory {
    const newStory: GitaStory = {
      ...story,
      _id: `story_${Date.now()}_${Math.random()}`,
    };
    this.stories.push(newStory);
    return newStory;
  }

  getStoriesForChild(childId: string): GitaStory[] {
    return this.stories.filter(s => s.child_id === childId);
  }

  // Allocation operations
  allocateChildToDoctor(childId: string, doctorId: string): DoctorAllocation {
    const allocation: DoctorAllocation = {
      _id: `alloc_${Date.now()}`,
      child_id: childId,
      doctor_id: doctorId,
      assigned_date: new Date(),
      status: 'ACTIVE',
    };
    this.allocations.push(allocation);
    
    // Update doctor's patient list
    const doctor = this.getUser(doctorId);
    if (doctor) {
      if (!doctor.current_patients) doctor.current_patients = [];
      doctor.current_patients.push(childId);
      this.updateUser(doctorId, doctor);
    }

    // Update child's assigned doctor
    const child = this.getUser(childId);
    if (child) {
      this.updateUser(childId, { ...child, assigned_doctor_id: doctorId });
    }

    return allocation;
  }

  getChildrenByDoctor(doctorId: string): User[] {
    const doctor = this.getUser(doctorId);
    if (!doctor || !doctor.current_patients) return [];
    return doctor.current_patients
      .map(childId => this.getUser(childId))
      .filter((u): u is User => u !== undefined);
  }

  getDoctorForChild(childId: string): User | undefined {
    const child = this.getUser(childId);
    if (!child || !child.assigned_doctor_id) return undefined;
    return this.getUser(child.assigned_doctor_id);
  }
}

// Global mock database instance
export const db = new MockDatabase();
