import React from 'react';
import { 
  Video, 
  Upload, 
  Trash2, 
  Play, 
  Pause, 
  Download, 
  Clapperboard, 
  RefreshCw,
  Clock,
  Settings2,
  Check,
  Zap,
  Loader2,
  Sparkles,
  Search,
  Globe,
  ChevronDown,
  RotateCcw,
  Languages,
  PenTool,
  Plus,
  Type,
  Activity,
  Palette,
  Monitor,
  Maximize,
  FileText,
  VolumeX,
  Volume2,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CaptionWord, CaptionStyle } from '../types';
import { CAPTION_PRESETS } from '../constants/captionPresets';
import CaptionEditor from './CaptionEditor';
import CaptionOverlay from './CaptionOverlay';

const CAPTION_COLORS = [
  '#ffffff', '#000000', '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ff0000', 
  '#ffd700', '#ff6b00', '#ff1493', '#1e90ff', '#7fff00', '#4169e1', '#8a2be2',
  '#ff4500', '#00ff7f', '#adff2f', '#00ced1', '#f0f0f0'
];

interface CaptionEngineProps {
  videoFile: File | null;
  videoUrl: string | null;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  isCaptioning: boolean;
  captionProgress: number;
  captionStep: string;
  captionWords: CaptionWord[];
  setCaptionWords: (words: CaptionWord[]) => void;
  captionStyle: CaptionStyle;
  setCaptionStyle: (style: CaptionStyle) => void;
  captionAnimation: string;
  setCaptionAnimation: (anim: string) => void;
  captionOffset: number;
  setCaptionOffset: (offset: number) => void;
  captionLanguage: string;
  setCaptionLanguage: (lang: string) => void;
  captionScriptType: 'hindi' | 'hinglish';
  setCaptionScriptType: (type: 'hindi' | 'hinglish') => void;
  translateToEnglish: boolean;
  setTranslateToEnglish: (translate: boolean) => void;
  selectedPresetId: string;
  setSelectedPresetId: (id: string) => void;
  handleVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeVideo: () => void;
  handleGenerateCaptions: () => void;
  handleExportCaptions: () => void;
  exportVideoUrl: string | null;
  isExporting: boolean;
  setIsExporting: (exporting: boolean) => void;
  setCaptionStep: (step: string) => void;
  setCaptionProgress: (progress: number) => void;
  resetCaptionSettings: () => void;
  history: any[];
  currentUser: any;
  handleDownloadSrt: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const CaptionEngine: React.FC<CaptionEngineProps> = ({
  videoFile,
  videoUrl,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  isCaptioning,
  captionProgress,
  captionStep,
  captionWords,
  setCaptionWords,
  captionStyle,
  setCaptionStyle,
  captionAnimation,
  setCaptionAnimation,
  captionOffset,
  setCaptionOffset,
  captionLanguage,
  setCaptionLanguage,
  captionScriptType,
  setCaptionScriptType,
  translateToEnglish,
  setTranslateToEnglish,
  selectedPresetId,
  setSelectedPresetId,
  handleVideoUpload,
  removeVideo,
  handleGenerateCaptions,
  handleExportCaptions,
  isExporting,
  setIsExporting,
  setCaptionStep,
  setCaptionProgress,
  resetCaptionSettings,
  currentUser,
  handleDownloadSrt,
  videoRef
}) => {
  const [isMuted, setIsMuted] = React.useState(false);
  const [isEditingCaptions, setIsEditingCaptions] = React.useState(false);
  const [shadowColor, setShadowColor] = React.useState('#000000');

  const videoContainerRef = React.useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    if (!videoContainerRef.current) return;
    const element = videoContainerRef.current as any;
    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement && !(document as any).msFullscreenElement) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      }
    } else {
      const doc = document as any;
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto space-y-8 pb-32"
    >
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-4xl font-display font-black text-zinc-900 tracking-tighter leading-none">Caption <span className="text-emerald-500">Studio</span></h2>
          <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest opacity-70">Professional Viral Workspace</p>
        </div>
        {captionWords.length > 0 && (
          <div className="flex gap-2">
            <button 
              onClick={handleExportCaptions}
              disabled={isCaptioning}
              className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 min-w-[140px] justify-center shadow-xl shadow-zinc-900/20"
            >
              {isCaptioning ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download Video
                </>
              )}
            </button>
            <button 
              onClick={handleDownloadSrt}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-zinc-900 text-zinc-900 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-all shadow-sm"
            >
              <FileText size={16} />
              SRT
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 md:p-6 rounded-[2.5rem] md:rounded-[3rem] border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all relative">
            {videoFile && (
              <div className="flex justify-between items-center mb-6 px-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                    <Video size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 leading-none">Video Preview</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Real-time Rendering</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsEditingCaptions(!isEditingCaptions)}
                    className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black transition-all border shadow-sm uppercase tracking-wider ${isEditingCaptions ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
                  >
                    <Edit3 size={14} />
                    {isEditingCaptions ? 'Save' : 'Edit Caption'}
                  </button>
                  <button 
                    onClick={() => document.getElementById('video-upload-captions')?.click()}
                    className="px-5 py-2.5 bg-zinc-100 text-zinc-600 rounded-2xl flex items-center gap-2 text-xs font-black hover:bg-zinc-200 transition-all border border-zinc-200 shadow-sm uppercase tracking-wider"
                  >
                    <RotateCcw size={14} />
                    Change Video
                  </button>
                </div>
              </div>
            )}
            
            {isCaptioning && (
              <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 rounded-[2.5rem] md:rounded-[3rem]">
                <div className="w-full max-w-sm space-y-6">
                  <div className="flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                      <Loader2 className="animate-spin text-emerald-400" size={24} />
                      <span className="font-bold">{captionStep}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">{captionProgress}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${captionProgress}%` }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    />
                  </div>
                  <p className="text-center text-[10px] text-white/40 font-medium tracking-wider uppercase">
                    Processing deep vectors • Do not close tab
                  </p>
                </div>
              </div>
            )}

            {videoFile ? (
              <div 
                ref={videoContainerRef}
                className="relative w-full max-h-[70vh] bg-zinc-950 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden group shadow-2xl flex items-center justify-center border border-zinc-800"
              >
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <video 
                    ref={videoRef}
                    src={videoUrl || ''} 
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    className="max-w-full max-h-[70vh] object-contain cursor-pointer" 
                    muted={isMuted}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onClick={() => {
                      if (videoRef.current) {
                        if (videoRef.current.paused) videoRef.current.play();
                        else videoRef.current.pause();
                      }
                    }}
                  />
                  {captionWords.length > 0 && !isCaptioning && !isExporting && (
                    <CaptionOverlay 
                      words={captionWords} 
                      currentTime={currentTime + (captionOffset / 1000)} 
                      style={captionStyle} 
                      animation={captionAnimation} 
                      shadowColor={shadowColor}
                      isExporting={isExporting}
                      onUpdateStyle={(updates) => setCaptionStyle({ ...captionStyle, ...updates })}
                    />
                  )}
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
                  <div className="flex items-center gap-3 pointer-events-auto">
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-2xl text-white hover:bg-emerald-500 transition-all flex items-center justify-center shadow-lg border border-white/10"
                    >
                      {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 pointer-events-auto">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleFullScreen}
                      className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-2xl text-white hover:bg-emerald-500 flex items-center justify-center shadow-lg border border-white/10"
                    >
                      <Maximize size={22} strokeWidth={2.5} />
                    </motion.button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => document.getElementById('video-upload-captions')?.click()}
                className="flex flex-col items-center justify-center gap-8 cursor-pointer group py-10 px-6 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[3rem] hover:border-emerald-500/50 hover:bg-emerald-50/20 transition-all duration-500"
              >
                <div className="w-28 h-28 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-all duration-500 relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="relative z-10 flex flex-col items-center gap-1">
                     <Upload size={42} className="group-hover:-translate-y-1 transition-transform" />
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                   </div>
                </div>
                <div className="text-center space-y-3">
                   <p className="text-2xl font-black text-zinc-900 tracking-tight">Drop video here or <span className="text-emerald-500">browse</span></p>
                   <p className="text-[11px] text-zinc-400 font-black uppercase tracking-[0.2em] opacity-80">MP4, MOV OR WEBM (MAX 500MB)</p>
                </div>
              </div>
            )}
            <input 
              type="file" id="video-upload-captions" hidden accept="video/*" 
              onChange={handleVideoUpload}
            />
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Languages size={24} />
                </div>
                <div>
                  <p className="font-bold text-zinc-900">Translate to English</p>
                  <p className="text-xs text-zinc-500 font-medium">Convert Hindi to English</p>
                </div>
              </div>
              <button 
                onClick={() => setTranslateToEnglish(!translateToEnglish)}
                className={`w-14 h-8 rounded-full transition-all relative ${translateToEnglish ? 'bg-emerald-500' : 'bg-zinc-200'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${translateToEnglish ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <button 
              onClick={handleGenerateCaptions}
              disabled={isCaptioning || !videoFile}
              className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
            >
              {isCaptioning ? <Loader2 className="animate-spin" /> : <Sparkles />}
              Generate AI Captions
            </button>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-5 h-5 text-[#22C55E]">
                <Globe size={18} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400">Caption Language</h3>
            </div>
            
            <div className="relative group">
              <select 
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-3.5 px-5 text-sm font-bold text-zinc-900 appearance-none hover:border-zinc-300 transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={captionLanguage}
                onChange={(e) => setCaptionLanguage(e.target.value)}
              >
                <option value="All Languages">All Languages (Auto)</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Marathi">Marathi (मराठी)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Bengali">Bengali (বাংলা)</option>
                <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                <option value="Malayalam">Malayalam (മലയാളം)</option>
                <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                <option value="Urdu">Urdu (اردु)</option>
                <option value="Japanese">Japanese (日本語)</option>
                <option value="Korean">Korean (한국어)</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-zinc-600 transition-colors">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {captionWords.length > 0 && isEditingCaptions && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <PenTool size={20} className="text-emerald-500" />
                  Word Timing Studio
                </h3>
                <p className="text-xs text-zinc-400">Drag sliders to adjust word synchronization</p>
              </div>
              <CaptionEditor 
                words={captionWords} 
                onUpdate={setCaptionWords}
                style={captionStyle}
                onUpdateStyle={(updates) => setCaptionStyle({ ...captionStyle, ...updates })}
                animation={captionAnimation}
                onUpdateAnimation={setCaptionAnimation}
              />
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-6 pt-2 pb-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#E1F9EF] text-[#22C55E] rounded-2xl flex items-center justify-center">
                  <Sparkles size={22} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Caption Studio</h3>
              </div>
              <button 
                onClick={resetCaptionSettings}
                className="flex items-center gap-2 px-2 py-1 bg-[#FEF2F2] text-[#EF4444] rounded-lg hover:bg-rose-100 transition-all border border-rose-100 shadow-sm font-bold text-[10px]"
              >
                <RotateCcw size={11} />
                Reset
              </button>
            </div>

            <div className="space-y-4">
              <details className="group bg-white border border-emerald-100 rounded-[2rem] overflow-hidden shadow-[0_8px_25px_rgb(16,185,129,0.08)]" open>
                <summary className="flex items-center justify-between p-6 cursor-pointer transition-all list-none select-none border-b border-emerald-50 bg-emerald-50/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Sparkles size={18} />
                    </div>
                    <div>
                        <span className="text-sm font-bold text-zinc-900 block">Style Presets</span>
                        <span className="text-[10px] text-emerald-600 font-medium tracking-tight">One-tap Professional Styles</span>
                    </div>
                  </div>
                  <ChevronDown size={20} className="text-emerald-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-6 grid grid-cols-2 gap-4 bg-white">
                    {CAPTION_PRESETS.map(preset => (
                      <motion.button
                        key={preset.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setCaptionStyle(preset.style);
                          setCaptionAnimation(preset.animation);
                          setSelectedPresetId(preset.id);
                        }}
                        className={`flex flex-col items-center gap-2 p-1.5 rounded-3xl border-2 transition-all group relative ${
                          selectedPresetId === preset.id 
                            ? 'border-emerald-500 bg-emerald-50/80 shadow-md scale-[1.02]' 
                            : 'bg-white border-zinc-200 hover:border-emerald-100'
                        }`}
                      >
                        <div className="w-full aspect-[1.7/1] bg-zinc-950 rounded-xl flex items-center justify-center p-2.5 relative overflow-hidden shadow-lg border border-zinc-800">
                            <motion.div 
                              animate={{
                                scale: preset.animation === 'pop' ? [1, 1.2, 1] : 
                                       preset.animation === 'bounce' ? [1, 1.1, 1] :
                                       [1, 1.05, 1],
                                y: preset.animation === 'bounce' ? [0, -4, 0] : 
                                   preset.animation === 'slide' ? [0, -2, 0] : 0,
                                opacity: preset.animation === 'glow' ? [1, 0.6, 1] : 1,
                                rotate: [0, 1, -1, 0]
                              }}
                              transition={{ 
                                duration: preset.animation === 'pop' ? 0.8 : 2, 
                                repeat: Infinity, 
                                ease: "easeInOut" 
                              }}
                              className="text-center uppercase font-black text-[11px] select-none leading-tight transition-all"
                              style={{
                                color: preset.style.color || '#FFFFFF',
                                fontFamily: preset.style.font || 'Inter',
                                WebkitTextStroke: preset.style.border !== 'none' ? `2px ${preset.style.outlineColor || '#000'}` : 'none',
                                paintOrder: 'stroke fill',
                                fontWeight: preset.style.fontWeight || '900',
                                backgroundColor: preset.style.backgroundColor && preset.style.backgroundColor !== 'transparent' ? preset.style.backgroundColor : 'transparent',
                                padding: preset.style.backgroundColor && preset.style.backgroundColor !== 'transparent' ? '4px 8px' : '0',
                                borderRadius: '4px',
                                fontStyle: preset.style.italic ? 'italic' : 'normal',
                                textShadow: preset.style.glow ? `0 0 5px ${preset.style.color}` : preset.style.shadow ? `1px 1px 0px ${preset.style.shadowColor || 'rgba(0,0,0,0.8)'}` : 'none'
                              }}
                            >
                              {preset.name}
                            </motion.div>
                        </div>
                        <span className={`text-[10px] font-bold ${selectedPresetId === preset.id ? 'text-emerald-600' : 'text-zinc-400 group-hover:text-zinc-600'}`}>{preset.name}</span>
                      </motion.button>
                    ))}
                </div>
              </details>

              <details open className="group bg-white border border-zinc-100 rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <summary className="flex items-center justify-between p-6 cursor-pointer transition-all list-none select-none border-b border-zinc-50 bg-zinc-50/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                      <Type size={18} />
                    </div>
                    <div>
                        <span className="text-sm font-bold text-zinc-900 block">Typography & Layout</span>
                        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tight opacity-60">Font, size and layout</span>
                    </div>
                  </div>
                  <ChevronDown size={20} className="text-zinc-400 group-open:rotate-180 transition-transform" />
                </summary>
                
                <div className="p-6 space-y-8">
                  {/* Font Family Selector */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">FONT FAMILY</label>
                    <div className="relative group">
                      <select 
                        value={captionStyle.font}
                        onChange={(e) => setCaptionStyle({...captionStyle, font: e.target.value})}
                        className="w-full p-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-lg font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 appearance-none shadow-sm transition-all hover:bg-zinc-100/50"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Rajdhani">Rajdhani (Hindi)</option>
                        <option value="Bangers">Bangers (Impact)</option>
                        <option value="Luckiest Guy">Luckiest Guy</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>

                  {/* Case & Style Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">CASE</label>
                      <div className="flex bg-zinc-50 p-1 rounded-xl border border-zinc-300 shadow-sm">
                        {(['original', 'uppercase'] as const).map(c => (
                          <button 
                            key={c}
                            onClick={() => setCaptionStyle({...captionStyle, case: c})}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${captionStyle.case === c ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
                          >
                            {c === 'original' ? 'Original' : 'Uppercase'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">STYLE</label>
                      <div className="flex bg-zinc-50 p-1 rounded-xl border border-zinc-300 shadow-sm">
                        <button 
                          onClick={() => setCaptionStyle({...captionStyle, fontWeight: captionStyle.fontWeight === '900' ? '400' : '900'})}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${captionStyle.fontWeight === '900' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
                        >
                          Bold
                        </button>
                        <button 
                          onClick={() => setCaptionStyle({...captionStyle, italic: !captionStyle.italic})}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${captionStyle.italic ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
                        >
                          Italic
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Font Size & Words Per Line */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
                        <span>FONT SIZE</span>
                        <span className="text-emerald-500 font-bold">{captionStyle.fontSize}PX</span>
                      </div>
                      <input 
                        type="range" min="16" max="150" 
                        value={captionStyle.fontSize} 
                        onChange={(e) => setCaptionStyle({...captionStyle, fontSize: parseInt(e.target.value)})}
                        className="w-full accent-zinc-900 h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
                        <span>WORDS PER LINE</span>
                        <span className="text-emerald-500 font-bold">{captionStyle.wordsPerLine}</span>
                      </div>
                      <input 
                        type="range" min="1" max="10" 
                        value={captionStyle.wordsPerLine} 
                        onChange={(e) => setCaptionStyle({...captionStyle, wordsPerLine: parseInt(e.target.value)})}
                        className="w-full accent-zinc-900 h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Position Selector */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">POSITION</label>
                    <div className="flex bg-zinc-50 p-1 rounded-xl border border-zinc-300 shadow-sm">
                      {(['top', 'middle', 'bottom'] as const).map(p => (
                        <button 
                          key={p}
                          onClick={() => setCaptionStyle({...captionStyle, yPos: p === 'top' ? 20 : p === 'middle' ? 50 : 85})}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all capitalize ${
                            (p === 'top' && captionStyle.yPos <= 30) || (p === 'middle' && captionStyle.yPos > 30 && captionStyle.yPos < 70) || (p === 'bottom' && captionStyle.yPos >= 70)
                              ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-600'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Controls */}
                  <div className="pt-6 border-t border-zinc-100 space-y-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setCaptionScriptType(captionScriptType === 'hindi' ? 'hinglish' : 'hindi')}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-2 transition-all ${captionScriptType === 'hindi' ? 'bg-white border-zinc-100 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-900'}`}
                      >
                        {captionScriptType === 'hindi' ? 'Hindi Script' : 'Hinglish Script'}
                      </button>
                      <button 
                        onClick={() => setTranslateToEnglish(!translateToEnglish)}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-2 transition-all ${translateToEnglish ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-white border-zinc-100 text-zinc-400'}`}
                      >
                        {translateToEnglish ? 'Translated' : 'Original Lang'}
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => setCaptionStyle({...captionStyle, isSmart: !captionStyle.isSmart})}
                      className={`w-full py-4 rounded-3xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${captionStyle.isSmart ? 'bg-zinc-900 text-white shadow-xl' : 'bg-white border-2 border-zinc-100 text-zinc-300'}`}
                    >
                      <Sparkles size={14} className={captionStyle.isSmart ? 'text-emerald-400' : ''} />
                      {captionStyle.isSmart ? 'Smart Highlights: ON' : 'Smart Highlights: OFF'}
                    </button>
                  </div>
                </div>
              </details>

              <details className="group bg-white border border-zinc-100 rounded-[2rem] overflow-hidden shadow-[0_4px_15px_rgb(0,0,0,0.03)]">
                <summary className="flex items-center justify-between p-6 cursor-pointer transition-all list-none select-none">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#F5F3FF] text-[#8B5CF6] rounded-xl flex items-center justify-center">
                      <Activity size={18} />
                    </div>
                    <span className="text-sm font-bold text-zinc-900">Animations</span>
                  </div>
                  <ChevronDown size={20} className="text-zinc-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-6 pt-0 grid grid-cols-2 gap-2">
                    {['pop', 'snappy', 'bounce', 'slide', 'glitch', 'fade', 'rotate', 'flip', 'skate', 'heartbeat', 'float', 'glow', 'karaoke', 'zeemo', 'kinetic', 'typewriter', 'professional'].map(anim => (
                      <button
                        key={anim}
                        onClick={() => setCaptionAnimation(anim)}
                        className={`py-2 px-1 rounded-lg border text-[8px] font-black uppercase tracking-widest border-2 transition-all ${captionAnimation === anim ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300'}`}
                      >
                        {anim}
                      </button>
                    ))}
                </div>
              </details>

              <details className="group bg-white border border-zinc-200 rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)]" open>
                <summary className="flex items-center justify-between p-6 cursor-pointer transition-all list-none select-none border-b border-zinc-50 bg-zinc-50/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FFF7ED] text-[#F97316] rounded-xl flex items-center justify-center shadow-sm">
                      <Palette size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-zinc-900 block">Colors & Effects</span>
                      <span className="text-[10px] text-orange-500 font-bold uppercase tracking-tight opacity-60">Hue, shadows and outline</span>
                    </div>
                  </div>
                  <ChevronDown size={20} className="text-zinc-400 group-open:rotate-180 transition-transform" />
                </summary>
                
                <div className="p-6 space-y-8">
                  {/* Structure Selector */}
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">STRUCTURE</label>
                    <div className="flex bg-zinc-100/50 p-1 rounded-xl gap-1 border border-zinc-300">
                      {(['none', 'thin', 'thick'] as const).map(b => (
                        <button
                          key={b}
                          onClick={() => setCaptionStyle({ ...captionStyle, border: b })}
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${captionStyle.border === b ? 'bg-emerald-500 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600'}`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main Color Grid */}
                  <div className="bg-zinc-50/50 p-6 rounded-[2rem] border border-zinc-200 shadow-inner">
                    <div className="grid grid-cols-5 gap-3">
                      {CAPTION_COLORS.slice(0, 19).map(c => (
                        <div key={`main-color-container-${c}`} className="flex justify-center">
                          <button
                            onClick={() => setCaptionStyle({ ...captionStyle, color: c })}
                            className={`w-9 h-9 rounded-full border-2 transition-all relative flex items-center justify-center ${captionStyle.color === c ? 'border-zinc-900 scale-110 shadow-lg' : 'border-zinc-200 hover:border-zinc-400 hover:scale-105 shadow-sm'}`}
                            style={{ backgroundColor: c }}
                          >
                            {captionStyle.color === c && (
                              <Check size={14} className={c.toLowerCase() === '#ffffff' ? 'text-zinc-900' : 'text-white'} strokeWidth={4} />
                            )}
                          </button>
                        </div>
                      ))}
                      <div className="flex justify-center">
                        <button className="w-9 h-9 rounded-full border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 hover:border-emerald-400 transition-all bg-white shadow-sm">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Outline Section */}
                  <div className="bg-white p-5 rounded-[2rem] border border-zinc-200 shadow-sm space-y-6">
                    <div className="flex justify-between items-center text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
                      <span>OUTLINE</span>
                      <div className="flex items-center gap-2">
                        <span className="opacity-50">THICKNESS</span>
                        <span className="text-zinc-900 font-black">{captionStyle.strokeWidth || 1}PX</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex gap-2">
                         {['#000000', '#ffffff', '#ff0000', '#00ff00'].map(c => (
                           <button 
                             key={`outline-${c}`}
                             onClick={() => setCaptionStyle({...captionStyle, outlineColor: c})}
                             className={`w-9 h-9 rounded-xl border-2 transition-all ${captionStyle.outlineColor === c ? 'border-zinc-900 scale-105 border-zinc-900' : 'border-zinc-200 shadow-sm opacity-80'}`}
                             style={{ backgroundColor: c }}
                           />
                         ))}
                      </div>
                      <div className="flex-1">
                        <input 
                          type="range" min="0" max="15" 
                          value={captionStyle.strokeWidth || 1}
                          onChange={(e) => setCaptionStyle({...captionStyle, strokeWidth: parseInt(e.target.value)})}
                          className="w-full accent-zinc-900 h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Auto-Coloring */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center">
                          <Sparkles size={16} />
                        </div>
                        <span className="text-xs font-black text-zinc-900 tracking-wider uppercase">AUTO-COLORING</span>
                      </div>
                      <button 
                        onClick={() => setCaptionStyle({...captionStyle, alternatingColors: !captionStyle.alternatingColors})}
                        className={`w-12 h-7 rounded-full transition-all relative ${captionStyle.alternatingColors ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                      >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${captionStyle.alternatingColors ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    
                    <p className="text-[10px] text-zinc-400 font-bold leading-relaxed px-1">Alternates colors every word for a professional viral look.</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">COLOR 1</label>
                        <div className="h-12 w-full bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden relative group hover:border-zinc-300 transition-all">
                          <input 
                            type="color" 
                            value={captionStyle.color1 || '#ffffff'}
                            onChange={(e) => setCaptionStyle({...captionStyle, color1: e.target.value})}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          />
                          <div className="w-full h-full" style={{ backgroundColor: captionStyle.color1 || '#ffffff' }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">ACCENT</label>
                        <div className="h-12 w-full bg-[#ffff00] border border-zinc-200 rounded-2xl shadow-sm overflow-hidden relative group hover:border-zinc-300 transition-all" style={{ backgroundColor: captionStyle.color2 || '#ffff00' }}>
                          <input 
                            type="color" 
                            value={captionStyle.color2 || '#ffff00'}
                            onChange={(e) => setCaptionStyle({...captionStyle, color2: e.target.value})}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Effects */}
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <button 
                      onClick={() => setCaptionStyle({...captionStyle, glow: !captionStyle.glow})}
                      className={`py-4 rounded-[1.5rem] transition-all flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest border-2 ${captionStyle.glow ? 'bg-blue-600 text-white shadow-lg border-blue-600' : 'bg-white border-zinc-300 text-zinc-400'}`}
                    >
                      <Sparkles size={16} className={captionStyle.glow ? 'text-white' : 'text-blue-600'} />
                      GLOW EFFECT
                    </button>
                    <button 
                      onClick={() => setCaptionStyle({...captionStyle, shadow: !captionStyle.shadow})}
                      className={`py-4 rounded-[1.5rem] transition-all flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest border-2 ${captionStyle.shadow ? 'bg-blue-600 text-white shadow-lg border-blue-600' : 'bg-white border-zinc-300 text-zinc-400'}`}
                    >
                      <Monitor size={16} />
                      3D SHADOW
                    </button>
                  </div>
                </div>
              </details>

              <details className="group bg-transparent rounded-2xl overflow-visible">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-100/50 transition-all list-none">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center">
                      <Clock size={16} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-900">Timing</span>
                  </div>
                  <ChevronDown size={16} className="text-zinc-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 pt-1 space-y-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
                        <span>Caption Offset</span>
                        <span className="text-emerald-500 font-mono">{(captionOffset/1000).toFixed(2)}s</span>
                      </div>
                      <input 
                        type="range" min="-1000" max="1000" step="50" 
                        value={captionOffset} onChange={(e) => setCaptionOffset(parseInt(e.target.value))}
                        className="w-full accent-zinc-900 h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                </div>
              </details>

              {captionWords.length > 0 && !isCaptioning && (
                <div className="pt-6 border-t border-zinc-100 space-y-4">
                  <button 
                    onClick={handleExportCaptions}
                    disabled={isExporting}
                    className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 flex items-center justify-center gap-3"
                  >
                    {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Video size={18} />}
                    {isExporting ? 'Downloading...' : 'Download HD Video'}
                  </button>
                  <button 
                    onClick={removeVideo}
                    className="w-full py-3 bg-zinc-100 text-zinc-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} />
                    Re-generate
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CaptionEngine;
