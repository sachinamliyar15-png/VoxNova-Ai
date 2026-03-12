import React from 'react';

interface AdSlotProps {
  id: string;
  className?: string;
  label?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ id, className = "", label = "Advertisement" }) => {
  return (
    <div 
      id={id}
      className={`bg-zinc-900/30 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-4 min-h-[100px] relative overflow-hidden group ${className}`}
    >
      <span className="text-[10px] text-zinc-600 uppercase tracking-widest absolute top-2 left-3 font-bold">
        {label}
      </span>
      <div className="text-zinc-700 text-xs text-center px-4 group-hover:text-zinc-500 transition-colors">
        Google AdSense Slot <br/>
        <span className="text-[10px] opacity-50">(Replace with your Ad Unit Code)</span>
      </div>
      
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/10" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/10" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/10" />
    </div>
  );
};
