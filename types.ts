
export enum PillarType {
  CAREER = 'CAREER',
  FINANCES = 'FINANCES',
  RELATIONSHIPS = 'RELATIONSHIPS',
  SPIRITUALITY = 'SPIRITUALITY',
  HEALTH = 'HEALTH',
  PERSONAL_GROWTH = 'PERSONAL_GROWTH',
  CUSTOM = 'CUSTOM'
}

export type ViewType = 'GARDEN' | 'TIMELINE' | 'ARCHITECT' | 'RITUALS' | 'SETTINGS' | 'CALENDAR';

export interface AppSettings {
  appName: string;
  motto: string;
  theme: 'gold' | 'night' | 'oasis' | 'crimson';
  font: 'serif' | 'sans' | 'classic';
  bgPattern: string;
}

export interface Habit {
  id: string;
  title: string;
  goalId: string;
  pillarId: string;
  completedDates: string[]; 
  frequency: 'daily' | 'weekly' | 'one-off';
  startDate: string;
  endDate: string;
  startTime?: string; // HH:mm format
  duration?: number; // Duration in minutes
  createdAt: number;
}

export interface Goal {
  id: string;
  pillarId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isCompleted?: boolean;
}

export interface Pillar {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  gradient: string;
}
