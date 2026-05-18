import React from 'react';
import { 
  X, 
  Search, 
  Trash2, 
  Play, 
  Pause, 
  Download, 
  Clock, 
  Volume2, 
  Clapperboard,
  SearchX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Generation } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: Generation[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  playingId: string | number | null;
  playFromHistory: (item: Generation) => void;
  deleteHistoryItem: (id: string | number) => void;
  downloadAudio: (audioDataOrUrl: string, fileName: string) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  searchTerm,
  setSearchTerm,
  playingId,
  playFromHistory,
  deleteHistoryItem,
  downloadAudio
}) => {
  const filteredHistory = history.filter(item => 
    item.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.voice_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-zinc-100"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-900/10">
                  <Clock className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-zinc-900 tracking-tight">Generation History</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Manage your recent creations</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-zinc-100 text-zinc-500 rounded-2xl hover:bg-zinc-200 transition-all outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-8 py-4 bg-white">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input 
                  type="text"
                  placeholder="Search by text or voice name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar bg-zinc-50/30">
              {filteredHistory.length > 0 ? (
                <div className="space-y-4">
                  {filteredHistory.map((item) => (
                    <motion.div 
                      layout
                      key={`history-item-${item.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-white border border-zinc-100 p-5 rounded-3xl hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all relative overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.voice_color || 'from-zinc-500 to-zinc-700'} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                            <span className="text-lg font-bold text-white uppercase">{item.voice_name?.[0] || 'V'}</span>
                          </div>
                          
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-zinc-900 truncate">{item.voice_name || 'Personal Audio'}</h4>
                              <span className="text-[10px] bg-zinc-100 font-bold px-2 py-0.5 rounded-full text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                                {item.type || 'voice'}
                              </span>
                              {item.language && (
                                <span className="text-[10px] bg-emerald-50 font-bold px-2 py-0.5 rounded-full text-emerald-600 uppercase tracking-widest">
                                  {item.language}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed italic">
                              "{item.text || 'Voice Cloning Audio'}"
                            </p>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                               <span className="flex items-center gap-1"><Clock size={10} /> {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}</span>
                               <span className="flex items-center gap-1">•</span>
                               <span className="flex items-center gap-1">{item.pitch || 1.0}p • {item.speed || 1.0}s</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-zinc-50 p-2 rounded-2xl group-hover:bg-emerald-50 transition-colors">
                          <button 
                            onClick={() => playFromHistory(item)}
                            className={`p-3 rounded-xl transition-all ${playingId === item.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white text-zinc-600 hover:text-emerald-500 hover:scale-105 shadow-sm'}`}
                          >
                            {playingId === item.id ? <Pause size={18} /> : <Play size={18} />}
                          </button>
                          
                          <button 
                            onClick={() => downloadAudio(item.audio_data || item.audio_url || '', `voxnova-${item.voice_name?.toLowerCase() || 'audio'}`)}
                            className="p-3 bg-white text-zinc-600 rounded-xl hover:bg-zinc-900 hover:text-white hover:scale-105 transition-all shadow-sm"
                          >
                            <Download size={18} />
                          </button>
                          
                          <div className="w-px h-6 bg-zinc-200 mx-1" />
                          
                          <button 
                            onClick={() => deleteHistoryItem(item.id)}
                            className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="w-20 h-20 bg-zinc-100 text-zinc-300 rounded-[2rem] flex items-center justify-center mb-6">
                    <SearchX size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-zinc-900 mb-2">No generations found</h4>
                  <p className="text-zinc-500 max-w-xs">Try adjusting your search or create something new to build your history.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-zinc-50 bg-white flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
               <span>Total Creations: {history.length}</span>
               <span>Powered by High-Density Neural Networks</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HistoryModal;
