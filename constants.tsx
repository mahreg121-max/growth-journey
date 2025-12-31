
import { Pillar } from './types';

export const PILLARS: Pillar[] = [
  {
    id: 'health',
    name: "Temple of Vitality",
    icon: '🦁',
    description: 'Honoring the vessel of your spirit through movement and nourishment.',
    color: '#fb923c',
    gradient: 'from-orange-400 to-amber-500'
  },
  {
    id: 'intellectual',
    name: "The Scribe's Path",
    icon: '🪶',
    description: 'Deepening knowledge, sharpening the mind, and recording wisdom.',
    color: '#818cf8',
    gradient: 'from-indigo-400 to-blue-500'
  },
  {
    id: 'career',
    name: "The Architect's Legacy",
    icon: '🏛️',
    description: 'Building structures of influence and pursuing mastery in the marketplace.',
    color: '#94a3b8',
    gradient: 'from-slate-400 to-slate-600'
  },
  {
    id: 'finances',
    name: "The Royal Treasury",
    icon: '🪙',
    description: 'Cultivating wealth and managing resources to build a lasting legacy.',
    color: '#fbbf24',
    gradient: 'from-yellow-400 to-amber-500'
  },
  {
    id: 'emotional',
    name: "River of Serenity",
    icon: '🌊',
    description: 'Navigating the currents of feeling and cultivating inner peace.',
    color: '#2dd4bf',
    gradient: 'from-teal-400 to-cyan-500'
  },
  {
    id: 'spiritual',
    name: "Eye of Horus",
    icon: '👁️',
    description: 'Connecting with the divine and the unseen patterns of the universe.',
    color: '#a78bfa',
    gradient: 'from-violet-400 to-purple-500'
  },
  {
    id: 'character',
    name: "The Hall of Ma'at",
    icon: '⚖️',
    description: 'Aligning actions with truth and strengthening the integrity of the soul.',
    color: '#f87171',
    gradient: 'from-red-400 to-rose-500'
  },
  {
    id: 'relationships',
    name: "Kindred Spirits",
    icon: '👥',
    description: 'Nurturing the threads that bind us to family, friends, and community.',
    color: '#f472b6',
    gradient: 'from-pink-400 to-rose-500'
  },
  {
    id: 'vision',
    name: "The North Star",
    icon: '✨',
    description: 'Aligning your path with your highest purpose and future self.',
    color: '#d4af37',
    gradient: 'from-yellow-400 to-amber-600'
  }
];

export const INITIAL_GOALS = [
  {
    id: 'g1',
    pillarId: 'intellectual',
    title: 'Master the Ancient Arts',
    description: 'Deepen my professional mastery through daily practice.',
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  }
];

export const INITIAL_HABITS = [
  {
    id: 'h1',
    title: 'Morning Reflection',
    goalId: 'g1',
    pillarId: 'intellectual',
    completedDates: [],
    frequency: 'daily',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    startTime: '08:00',
    duration: 30,
    createdAt: Date.now()
  }
];
