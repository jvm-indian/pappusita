// Agent brain and simple helper APIs
export type AgentDecision = {
  level: 'easy' | 'hard';
  message: string;
}

export function getAgentDecision(avgTime: number): AgentDecision {
  if (avgTime > 800) {
    return {
      level: 'easy',
      message: 'I noticed your eyes need more rest. Let us slow down 🌱',
    }
  }

  return {
    level: 'hard',
    message: 'Excellent focus! I will increase the challenge ⚡',
  }
}

export type AgentReply = {
  role: 'agent';
  content: string;
};

export async function askGuru(_: string): Promise<AgentReply> {
  return {
    role: 'agent',
    content: '🌟 Welcome to Gurukul! Your super eyes training awaits.'
  };
}

