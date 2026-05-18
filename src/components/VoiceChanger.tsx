import React from 'react';
import { 
  Upload, 
  Music, 
  RefreshCw, 
  Loader2, 
  Download, 
  Sparkles, 
  History,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { Voice } from '../types';

interface VoiceChangerProps {
  voiceChangingFile: File | null;
  setVoiceChangingFile: (file: File | null) => void;
  voiceChangingResult: any;
  setVoiceChangingResult: (result: any) => void;
  isVoiceChanging: boolean;
  voiceChangingStep: string;
  voiceChangingProgress: number;
  selectedVoice: Voice;
  setShowVoiceLibrary: (show: boolean) => void;
  handleVoiceChanger: () => void;
  setShowHistoryModal: (show: boolean) => void;
  allVoices: Voice[];
  currentUser: any;
}

const VoiceChanger: React.FC<VoiceChangerProps> = ({
  voiceChangingFile,
  setVoiceChangingFile,
  voiceChangingResult,
  setVoiceChangingResult,
  isVoiceChanging,
  voiceChangingStep,
  voiceChangingProgress,
  selectedVoice,
  setShowVoiceLibrary,
  handleVoiceChanger,
  setShowHistoryModal,
  allVoices,
  currentUser
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-100 pb-8 mb-4">
        <div className="space-y-1.5">
          <h2 className="text-4xl font-display font-bold text-zinc-900 tracking-tight">Voice Changer <span className="text-emerald-500 text-sm font-mono align-top ml-2">PRO</span></h2>
          <p className="text-zinc-500 text-sm font-medium">Transform any audio or video with professional AI character conversion.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-zinc-50 p-2 rounded-[2rem] border border-zinc-100">
          <button 
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 text-zinc-600 rounded-2xl text-xs font-bold hover:bg-zinc-100 transition-all shadow-sm"
          >
            <History size={14} />
            History
          </button>

          <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl shadow-sm group">
            <button 
              onClick={() => setShowVoiceLibrary(true)}
              className="flex items-center gap-2"
            >
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${selectedVoice.color} flex items-center justify-center text-[10px] font-black text-white shadow-sm`}>
                {selectedVoice.name[0]}
              </div>
              <span className="text-sm font-bold text-zinc-800">{selectedVoice.name}</span>
              <ChevronDown size={14} className="text-zinc-400 group-hover:text-zinc-600 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 border border-zinc-100">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">1. Upload File</label>
            <div 
              onClick={() => document.getElementById('audio-upload-vc-main')?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${voiceChangingFile ? 'border-emerald-500/50 bg-emerald-50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}`}
            >
              <input 
                type="file" id="audio-upload-vc-main" hidden accept="audio/*,video/*" 
                onChange={(e) => {
                  setVoiceChangingFile(e.target.files?.[0] || null);
                  setVoiceChangingResult(null);
                }}
              />
              {voiceChangingFile ? (
                <>
                  <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600">
                    <Music size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-emerald-600">{voiceChangingFile.name}</p>
                    <p className="text-xs text-zinc-500">{(voiceChangingFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-zinc-100 rounded-2xl text-zinc-400">
                    <Upload size={32} />
                  </div>
                  <p className="text-sm text-zinc-500">Click to upload</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 border border-zinc-100">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">2. Select Target Voice</label>
            <div 
              onClick={() => setShowVoiceLibrary(true)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${selectedVoice.color} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                  {selectedVoice.name[0]}
                </div>
                <span className="text-sm font-medium text-zinc-900">{selectedVoice.name}</span>
              </div>
              <ChevronDown size={16} className="text-zinc-400" />
            </div>
          </div>

          <button 
            onClick={handleVoiceChanger}
            disabled={isVoiceChanging}
            className={`w-full py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${isVoiceChanging ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : !voiceChangingFile ? 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'}`}
          >
            {isVoiceChanging ? (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="font-bold">Processing...</span>
                </div>
                <span className="text-[10px] opacity-70 animate-pulse">{voiceChangingStep}</span>
              </div>
            ) : (
              <>
                <RefreshCw size={24} />
                {currentUser ? 'Change Voice' : 'Try for Free'}
              </>
            )}
          </button>

          {isVoiceChanging && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>{voiceChangingStep}</span>
                <span>{voiceChangingProgress}%</span>
              </div>
              <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${voiceChangingProgress}%` }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {voiceChangingResult && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 rounded-[2.5rem] border border-emerald-500/20 bg-emerald-50 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2 text-zinc-900">
              <Sparkles className="text-emerald-500" /> Result
            </h3>
            <button 
              onClick={() => {
                const a = document.createElement('a');
                a.href = voiceChangingResult.url;
                a.download = `VoxNova-Changed-${Date.now()}.${voiceChangingResult.type === 'video' ? 'mp4' : 'wav'}`;
                a.click();
              }}
              className="p-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all text-zinc-600"
            >
              <Download size={20} />
            </button>
          </div>

          {voiceChangingResult.type === 'video' ? (
            <video 
              src={voiceChangingResult.url} 
              controls 
              className="w-full rounded-2xl shadow-lg aspect-video bg-black"
            />
          ) : (
            <div className="p-4 bg-zinc-100 rounded-2xl">
              <audio src={voiceChangingResult.url} controls className="w-full h-10 accent-emerald-500" />
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default VoiceChanger;
