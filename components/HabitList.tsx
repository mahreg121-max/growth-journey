
import React from 'react';
import { Habit } from '../types';

interface HabitListProps {
  habits: Habit[];
  onToggle: (habitId: string) => void;
  onDelete: (habitId: string) => void;
}

const HabitList: React.FC<HabitListProps> = ({ habits, onToggle, onDelete }) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-3">
      {habits.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-400 text-sm">No rituals created yet.</p>
        </div>
      ) : (
        habits.map((habit) => {
          const isCompletedToday = habit.completedDates.includes(today);
          return (
            <div 
              key={habit.id}
              className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onToggle(habit.id)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                    ${isCompletedToday 
                      ? 'bg-black border-black text-white' 
                      : 'border-gray-200 hover:border-black text-transparent'
                    }
                  `}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <div>
                  <h4 className={`font-medium transition-all ${isCompletedToday ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {habit.title}
                  </h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                    Streak: {habit.completedDates.length} days
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => onDelete(habit.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-rose-500 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          );
        })
      )}
    </div>
  );
};

export default HabitList;
