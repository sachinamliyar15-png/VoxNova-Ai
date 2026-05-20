import React from 'react';
import { 
  Play, 
  Download, 
  History, 
  Settings2, 
  Volume2, 
  ChevronDown, 
  Sparkles,
  RefreshCw,
  Loader2,
  Mic,
  Library,
  Pause,
  Check,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { Voice, LANGUAGES } from '../types';

interface VoiceEngineProps {
  text: string;
  setText: (text: string) => void;
  selectedVoice: Voice;
  setShowVoiceLibrary: (show: boolean) => void;
  style: string;
  setStyle: (style: string) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
  pause: number;
  setPause: (pause: number) => void;
  audioFormat: 'wav' | 'mp3';
  setAudioFormat: (format: 'wav' | 'mp3') => void;
  targetSampleRate: number;
  setTargetSampleRate: (rate: number) => void;
  language: string;
  setLanguage: (lang: string) => void;
  studioClarity: boolean;
  setStudioClarity: (clarity: boolean) => void;
  isGenerating: boolean;
  generationProgress: number;
  handleGenerate: () => void;
  handleResetSettings: () => void;
  setShowHistoryModal: (show: boolean) => void;
  currentUser: any;
  userProfile: any;
  isAuthLoading: boolean;
  isWhitelisted: (email: string | null | undefined) => boolean;
  lastGeneration: any;
  currentAudio: string | null;
  playingId: string | number | null;
  playFromHistory: (item: any) => void;
  downloadAudio: (audioDataOrUrl: string, fileName: string) => void;
  handleTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error: string | null;
  errorType: 'rate-limit' | 'network' | 'auth' | 'general' | null;
  setError: (err: string | null) => void;
  setErrorType: (type: 'rate-limit' | 'network' | 'auth' | 'general' | null) => void;
  loadingMessages: string[];
  loadingStep: number;
  audioCurrentTime: number;
  audioDuration: number;
  setAudioCurrentTime: (time: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  handleDownload: () => void;
  setLastGeneration: (item: any) => void;
  setCurrentAudio: (val: string | null) => void;
  handlePreviewVoice: (voice: Voice) => void;
  isPreviewLoading?: boolean;
}

const VoiceEngine: React.FC<VoiceEngineProps> = ({
  text,
  setText,
  selectedVoice,
  setShowVoiceLibrary,
  style,
  setStyle,
  speed,
  setSpeed,
  pitch,
  setPitch,
  pause,
  setPause,
  audioFormat,
  setAudioFormat,
  targetSampleRate,
  setTargetSampleRate,
  language,
  setLanguage,
  studioClarity,
  setStudioClarity,
  isGenerating,
  generationProgress,
  handleGenerate,
  handleResetSettings,
  setShowHistoryModal,
  currentUser,
  userProfile,
  isAuthLoading,
  isWhitelisted,
  lastGeneration,
  currentAudio,
  playingId,
  playFromHistory,
  downloadAudio,
  handleTextChange,
  error,
  errorType,
  setError,
  setErrorType,
  loadingMessages,
  loadingStep,
  audioCurrentTime,
  audioDuration,
  setAudioCurrentTime,
  audioRef,
  isPlaying,
  handleDownload,
  setLastGeneration,
  setCurrentAudio,
  handlePreviewVoice,
  isPreviewLoading
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter">Speech Synthesis</h2>
          <p className="text-zinc-400">Transform your text into lifelike professional audio.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setShowHistoryModal(true)}
             className="flex items-center gap-2 px-4 py-2 bg-zinc-100 border border-zinc-200 rounded-xl text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 transition-all"
           >
             <History size={16} />
             History
           </button>
           <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 rounded-xl p-1">
              <button 
                onClick={() => setStudioClarity(!studioClarity)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${studioClarity ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                <Sparkles size={14} />
                Studio Clarity
              </button>
           </div>
           <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 rounded-xl p-1">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-sm px-3 py-1.5 focus:outline-none cursor-pointer text-zinc-600 font-medium"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <textarea 
            value={text}
            onChange={handleTextChange}
            placeholder={`Enter your script here... (Paste up to 5,000 characters)`}
            className="w-full h-[500px] bg-white border-2 border-zinc-100 rounded-3xl p-8 text-xl md:text-2xl leading-relaxed resize-none focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-300 text-zinc-900 shadow-sm"
          />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between px-8 py-5 bg-zinc-50/50 rounded-3xl border border-zinc-100 gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-zinc-100"
                  strokeWidth="3"
                />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-emerald-500"
                  strokeWidth="3"
                  strokeDasharray="100"
                  animate={{ strokeDashoffset: 100 - (text.length / (currentUser ? 5000 : 300)) * 100 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                />
              </svg>
            </div>
            <span className="text-sm font-bold text-zinc-500">
              {isAuthLoading ? 'Initializing VoxNova...' : (!currentUser ? 'Guest Mode (Limited)' : (isWhitelisted(currentUser?.email || '') ? 'Unlimited' : `${(userProfile?.credits || 0).toLocaleString()} credits remaining`))}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setText('')}
              className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              Clear Script
            </button>
            <div className="h-4 w-px bg-zinc-200" />
            <span className={`text-sm font-mono font-bold ${text.length >= 4500 ? 'text-amber-500' : 'text-zinc-400'}`}>
              {text.length.toLocaleString()} / 5,000
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Volume2 size={14} /> Voice
              </label>
              <button 
                onClick={() => setShowVoiceLibrary(true)}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1"
              >
                <Library size={12} /> Browse
              </button>
            </div>
            <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all transition-colors group/voice" onClick={() => setShowVoiceLibrary(true)}>
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedVoice.color} flex items-center justify-center text-sm font-bold text-white shadow-sm`}>
                  {selectedVoice.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-zinc-900 group-hover/voice:text-emerald-600 transition-colors">{selectedVoice.name}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewVoice(selectedVoice);
                      }}
                      className={`p-1.5 rounded-lg transition-all ${playingId === selectedVoice.id ? 'bg-emerald-500 text-white' : 'hover:bg-emerald-50 text-zinc-400 hover:text-emerald-600'}`}
                      title="Preview Voice Sample"
                    >
                      {playingId === selectedVoice.id ? (
                        isPreviewLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Pause size={14} className="fill-current" />
                        )
                      ) : (
                        <Volume2 size={14} />
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{selectedVoice.gender}</span>
                </div>
              </div>
              <ChevronDown size={14} className="text-zinc-400 group-hover/voice:translate-y-0.5 transition-transform" />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl space-y-3">
            <label className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={14} /> Style
            </label>
            <select 
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-transparent text-sm focus:outline-none cursor-pointer"
            >
              <option value="normal" className="bg-white">Normal</option>
              <option value="professional-auto" className="bg-white">Professional Auto (Smart)</option>
              <option value="documentary" className="bg-white">Documentary</option>
              <option value="doc-pro" className="bg-white">Professional Documentary</option>
              <option value="cinematic" className="bg-white">Cinematic</option>
              <option value="authoritative" className="bg-white">Authoritative</option>
              <option value="emotional" className="bg-white">Emotional</option>
              <option value="storytelling" className="bg-white">Storytelling</option>
              <option value="motivational" className="bg-white">Motivational</option>
              <option value="news" className="bg-white">News Broadcast</option>
              <option value="conversational" className="bg-white">Conversational</option>
            </select>
          </div>

          <div className="glass-panel p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Settings2 size={14} /> Controls
              </label>
              <button 
                onClick={handleResetSettings}
                className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 flex items-center gap-1 transition-colors uppercase tracking-wider"
              >
                <RefreshCw size={10} /> Reset
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Speed</span>
                  <span>{speed}x</span>
                </div>
                <div className="flex gap-2 mb-2">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSpeed(1.6)}
                    className={`flex-1 py-1 px-2 rounded-md text-[10px] border ${speed === 1.6 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-200 text-zinc-500 hover:text-zinc-900'}`}
                  >
                    (U Fast)
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSpeed(1.0)}
                    className={`flex-1 py-1 px-2 rounded-md text-[10px] border ${speed === 1.0 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-200 text-zinc-500 hover:text-zinc-900'}`}
                  >
                    Normal
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSpeed(1.4)}
                    className={`flex-1 py-1 px-2 rounded-md text-[10px] border ${speed === 1.4 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-200 text-zinc-500 hover:text-zinc-900'}`}
                  >
                    Fast
                  </motion.button>
                </div>
                <input 
                  type="range" min="0.5" max="2" step="0.1" 
                  value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full accent-zinc-900 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Pitch</span>
                  <span>{pitch}x</span>
                </div>
                <input 
                  type="range" min="0.5" max="1.5" step="0.1" 
                  value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full accent-zinc-900 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Pause Gap (Natural Pacing)</span>
                  <span className="font-bold text-emerald-600">{pause}s</span>
                </div>
                <input 
                  type="range" min="0" max="2.0" step="0.1" 
                  value={pause} onChange={(e) => setPause(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                  <span>Output Format</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setAudioFormat('wav')}
                    className={`flex-1 py-1 rounded-md text-[10px] border transition-all ${audioFormat === 'wav' ? 'bg-zinc-900 border-zinc-900 text-white shadow-md' : 'border-zinc-200 text-zinc-500 hover:text-zinc-900'}`}
                  >
                    WAV
                  </button>
                  <button 
                    onClick={() => setAudioFormat('mp3')}
                    className={`flex-1 py-1 rounded-md text-[10px] border transition-all ${audioFormat === 'mp3' ? 'bg-zinc-900 border-zinc-900 text-white shadow-md' : 'border-zinc-200 text-zinc-500 hover:text-zinc-900'}`}
                  >
                    MP3
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                  <span>Sample Rate</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setTargetSampleRate(24000)}
                    className={`flex-1 py-1 rounded-md text-[8px] border transition-all ${targetSampleRate === 24000 ? 'bg-zinc-900 border-zinc-900 text-white shadow-md' : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900'}`}
                  >
                    24kHz
                  </button>
                  <button 
                    onClick={() => setTargetSampleRate(44100)}
                    className={`flex-1 py-1 rounded-md text-[8px] border transition-all ${targetSampleRate === 44100 ? 'bg-zinc-900 border-zinc-900 text-white shadow-md active:scale-95' : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900'}`}
                  >
                    44.1kHz
                  </button>
                  <button 
                    onClick={() => setTargetSampleRate(48000)}
                    className={`flex-1 py-1 rounded-md text-[8px] border transition-all ${targetSampleRate === 48000 ? 'bg-zinc-900 border-zinc-900 text-white shadow-md active:scale-95' : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900'}`}
                  >
                    48kHz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={isGenerating || !text || !selectedVoice}
            animate={isGenerating ? { 
              backgroundColor: ["#000000", "#10b981", "#000000"],
              scale: [1, 1.02, 1],
              transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
            } : { 
              backgroundColor: "#000000",
              scale: 1 
            }}
            className={`w-full py-5 px-6 rounded-3xl font-bold text-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/20 group relative overflow-hidden ${isGenerating ? 'text-white' : 'text-white hover:bg-zinc-800'}`}
          >
            <div className="absolute inset-0 gemini-shimmer opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            {isGenerating ? (
              <div className="flex items-center gap-2 relative z-10">
                <Loader2 className="animate-spin" size={24} />
                <span>Generating {generationProgress}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 relative z-10">
                <div className="relative group/icon">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                  <Sparkles size={24} className="relative text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
                </div>
                <span>Generate Voice</span>
              </div>
            )}
          </motion.button>
        </div>

      {lastGeneration && currentAudio && !isGenerating && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 overflow-hidden bg-white border border-zinc-100 rounded-3xl shadow-2xl shadow-zinc-200/50"
          >
            <div className="px-6 py-3 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${lastGeneration.voice_color || 'from-zinc-500 to-zinc-700'} flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0`}>
                  {lastGeneration.voice_name?.[0] || 'V'}
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-tighter font-bold">{lastGeneration.style || 'Standard'} Mode</div>
                  <div className="text-sm font-bold text-zinc-900 leading-tight">{lastGeneration.voice_name || 'Generated Voice'}</div>
                </div>
              </div>
              <button 
                 onClick={() => {
                   setCurrentAudio(null);
                   setLastGeneration(null);
                 }}
                 className="p-2 hover:bg-zinc-200/50 rounded-full transition-colors text-zinc-400"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-5">
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  animate={isPlaying ? { 
                    scale: [1, 1.1, 1],
                    backgroundColor: ["#10b981", "#059669", "#10b981"],
                    transition: { repeat: Infinity, duration: 1.5 } 
                  } : {}}
                  onClick={() => {
                    if (audioRef.current) {
                      if (isPlaying) {
                        audioRef.current.pause();
                      } else {
                        audioRef.current.play();
                      }
                    }
                  }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 shadow-lg ${isPlaying ? 'bg-emerald-500 hover:bg-emerald-600 ring-4 ring-emerald-500/20' : 'bg-black hover:bg-zinc-800'}`}
                >
                  {isPlaying ? (
                    <Pause size={24} className="text-white fill-white" />
                  ) : (
                    <Play size={24} className="text-white ml-1 fill-white" />
                  )}
                </motion.button>

                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[11px] font-mono font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {formatTime(audioCurrentTime)}
                    </span>
                    <span className="text-[11px] font-mono font-medium text-zinc-400">
                      {formatTime(audioDuration)}
                    </span>
                  </div>

                  <div className="relative group seekbar-container">
                    <input 
                      type="range"
                      min="0"
                      max={audioDuration || 100}
                      value={audioCurrentTime}
                      onChange={(e) => {
                        const time = parseFloat(e.target.value);
                        setAudioCurrentTime(time);
                        if (audioRef.current) audioRef.current.currentTime = time;
                      }}
                      className="w-full h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-emerald-500 transition-all group-hover:h-2"
                      style={{
                        background: `linear-gradient(to right, #10b981 ${(audioCurrentTime / (audioDuration || 1)) * 100}%, #f4f4f5 ${(audioCurrentTime / (audioDuration || 1)) * 100}%)`
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-2">
                  <div className="w-[1px] h-10 bg-zinc-100" />
                  <button 
                    onClick={handleDownload}
                    className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition-all group shadow-sm"
                    title="Download Audio"
                  >
                    <Download size={20} className="group-hover:scale-110 group-hover:text-emerald-500 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>{loadingMessages[loadingStep]}</span>
              <span>{generationProgress}%</span>
            </div>
            <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${generationProgress}%` }}
                className="h-full bg-emerald-500"
              />
            </div>
          </div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl text-sm flex flex-col gap-3 ${
              errorType === 'rate-limit' 
                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            <div className="flex items-start gap-3">
              {errorType === 'rate-limit' ? (
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
              ) : (
                <X size={18} className="shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <p className="font-bold leading-tight">
                  {errorType === 'rate-limit' ? 'Server Busy (Rate Limit)' : 'Generation Error'}
                </p>
                <p className="leading-relaxed opacity-90">{error}</p>
                
                {errorType === 'rate-limit' && (
                  <div className="pt-2 mt-2 border-t border-amber-500/10 flex items-start gap-2 text-[11px] italic opacity-70">
                    <HelpCircle size={12} className="shrink-0 mt-0.5" />
                    <p>Rate limiting occurs when many users generate voices simultaneously. Our AI models have a maximum capacity to ensure high quality for everyone. Trying again in a few minutes usually resolves this.</p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => { setError(null); setErrorType(null); }}
                className="p-1 hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Helper for X button in lastGeneration
const X = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default VoiceEngine;
