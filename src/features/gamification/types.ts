export interface XpBreakdown {
  base: number;
  accuracyBonus: number;
  streakMultiplier: number;
  streakBonus: number;
  newSpecialtyBonus: number;
  total: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xpReward: number;
  category: 'diagnost' | 'marathon' | 'specialist' | 'roleplay' | 'simulation' | 'collector';
}
