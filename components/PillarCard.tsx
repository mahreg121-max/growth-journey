
import React from 'react';
import { Pillar, PillarType } from '../types';

interface PillarCardProps {
  pillar: Pillar;
  progress: number;
  isSelected: boolean;
  onClick: () => void;
}

const PillarCard: React.FC<PillarCardProps> = ({ pillar, progress, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden p-6 rounded-3xl transition-all duration-300 text-left group
        ${isSelected 
          ? 'ring-2 ring-offset-2 ring-black scale-105 shadow-xl' 
          : 'hover:scale-[1.02] shadow-sm hover:shadow-md'
        }
        bg-gradient-to-br ${pillar.gradient}
      `}
    >
      <div className="flex flex-col h-full justify-between gap-4">
        <div className="flex items-center justify-between">
          <span className="text-3xl filter drop-shadow-sm">{pillar.icon}</span>
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <span className="text-xs font-bold text-white">{Math.round(progress)}%</span>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-white leading-tight">{pillar.name}</h3>
          <p className="text-white/80 text-xs mt-1">
            Focus Area
          </p>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
    </button>
  );
};

export default PillarCard;
