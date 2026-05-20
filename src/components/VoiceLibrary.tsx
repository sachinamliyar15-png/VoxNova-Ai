import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Search, Sparkles, Crown, Pause, Loader2, Volume2 } from 'lucide-react';
import { Voice } from '../types';

interface VoiceLibraryProps {
  onSelect: (voice: Voice) => void;
  selectedVoiceId: string;
  voices: Voice[];
  onPreview: (voice: Voice) => void;
  playingId: string | number | null;
  isLoading?: boolean;
}

const VoiceLibrary: React.FC<VoiceLibraryProps> = ({ onSelect, selectedVoiceId, voices, onPreview, playingId, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredVoices = voices.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (v.id === 'original') return false;
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} />
            Voice Library
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-zinc-900">
            Explore <span className="text-emerald-500">Premium</span> Voices
          </h2>
          <p className="text-zinc-500 text-lg max-w-2xl">
            Discover over 100+ high-quality AI voices for every project and language.
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text"
            placeholder="Search voices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVoices.map((voice, idx) => (
          <motion.div 
            key={`voice-item-${voice.id}-${idx}`} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelect(voice)}
            className={`p-6 bg-white rounded-3xl border transition-all group cursor-pointer relative overflow-hidden ${selectedVoiceId === voice.id ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-zinc-100 hover:border-zinc-300 shadow-sm hover:shadow-md'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${voice.color} flex items-center justify-center font-display font-bold text-xl text-white group-hover:scale-110 transition-transform shadow-lg`}>
                  {voice.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900">{voice.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{voice.gender}</span>
                    {voice.language && (
                      <>
                        <span className="w-1 h-1 bg-zinc-200 rounded-full" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{voice.language}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {voice.isPremium && (
                  <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg">
                    <Crown size={14} />
                  </div>
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(voice);
                  }}
                  className={`p-2 rounded-xl transition-all shadow-sm active:scale-95 ${playingId === voice.id ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                >
                  {playingId === voice.id ? (
                    isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Pause size={16} fill="currentColor" />
                    )
                  ) : (
                    <Volume2 size={16} />
                  )}
                </button>
              </div>
            </div>
            
            <p className="text-zinc-500 text-xs leading-relaxed mb-4 line-clamp-2">
              {voice.description}
            </p>
            
            <div className="flex flex-wrap gap-1.5">
              {voice.tags?.map(tag => (
                <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            {selectedVoiceId === voice.id && (
              <div className="absolute top-0 right-0 p-4">
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-white">✓</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default VoiceLibrary;
