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
          <div className="bg-white p-4 md:p-6 rounded-[2.5rem] md:rounded-[3rem] border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all relative">
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
            <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-sm flex items-center justify-between">
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

          <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6">
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
                            : 'bg-white border-zinc-100 hover:border-emerald-100'
                        }`}
                      >
                        <div className="w-full aspect-[1.7/1] bg-zinc-950 rounded-xl flex items-center justify-center p-2.5 relative overflow-hidden shadow-lg border border-zinc-800">
                            <motion.div 
                              animate={preset.animation === 'glow' ? { opacity: [1, 0.7, 1] } : 
                                       preset.animation === 'pop' ? { scale: [0.9, 1.1, 0.9] } : 
                                       preset.animation === 'bounce' ? { y: [0, -3, 0] } : {}}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
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

              <details open className="group bg-white border border-emerald-50 rounded-[2rem] overflow-hidden shadow-[0_8px_25px_rgb(16,185,129,0.05)]">
                <summary className="flex items-center justify-between p-6 cursor-pointer transition-all list-none select-none border-b border-emerald-50 bg-emerald-50/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Type size={18} />
                    </div>
                    <div>
                        <span className="text-sm font-bold text-zinc-900 block">Typography & Layout</span>
                        <span className="text-[10px] text-blue-600 font-medium">Font, size and layout</span>
                    </div>
                  </div>
                  <ChevronDown size={20} className="text-zinc-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-6 pt-0 space-y-6">
                  <div className="space-y-4 pt-6">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                      <span>FONT SIZE</span>
                      <span className="text-emerald-500 font-bold">{captionStyle.fontSize}px</span>
                    </div>
                    <input 
                      type="range" min="16" max="150" 
                      value={captionStyle.fontSize} 
                      onChange={(e) => setCaptionStyle({...captionStyle, fontSize: parseInt(e.target.value)})}
                      className="w-full accent-zinc-900 h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Words Per Line</label>
                      <div className="flex bg-zinc-50 p-1 rounded-xl border border-zinc-100 shadow-sm">
                        {[1, 2, 3].map(n => (
                          <button 
                            key={`wpl-${n}`}
                            onClick={() => setCaptionStyle({...captionStyle, wordsPerLine: n})}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${captionStyle.wordsPerLine === n ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Case</label>
                       <div className="flex bg-zinc-50 p-1 rounded-xl border border-zinc-100 shadow-sm">
                        {(['original', 'uppercase'] as const).map(c => (
                          <button 
                            key={c}
                            onClick={() => setCaptionStyle({...captionStyle, case: c})}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${captionStyle.case === c ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
                          >
                            {c === 'original' ? 'Orgl' : 'Up'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Font Family</label>
                    <select 
                      value={captionStyle.font}
                      onChange={(e) => setCaptionStyle({...captionStyle, font: e.target.value})}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Rajdhani">Rajdhani (Hindi)</option>
                      <option value="Bangers">Bangers (Impact)</option>
                    </select>
                  </div>

                  <div className="pt-6 border-t border-zinc-100 space-y-4">
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setCaptionScriptType(captionScriptType === 'hindi' ? 'hinglish' : 'hindi')}
                          className={`flex-1 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-2 transition-all ${captionScriptType === 'hinglish' ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : 'bg-white border-zinc-100 text-zinc-400'}`}
                        >
                          {captionScriptType === 'hinglish' ? 'Hinglish' : 'Hindi'}
                        </button>
                        <button 
                          onClick={() => setTranslateToEnglish(!translateToEnglish)}
                          className={`flex-1 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-2 transition-all ${translateToEnglish ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : 'bg-white border-zinc-100 text-zinc-400'}`}
                        >
                          {translateToEnglish ? 'Translated' : 'Original'}
                        </button>
                      </div>
                      <button 
                        onClick={() => setCaptionStyle({...captionStyle, isSmart: !captionStyle.isSmart})}
                        className={`w-full py-4 rounded-3xl text-[10px] font-bold uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-3 ${captionStyle.isSmart ? 'bg-zinc-900 border-zinc-900 text-white shadow-xl' : 'bg-white border-zinc-100 text-zinc-400'}`}
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
                        className={`py-2 px-1 rounded-lg border text-[8px] font-black uppercase tracking-widest border-2 transition-all ${captionAnimation === anim ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200'}`}
                      >
                        {anim}
                      </button>
                    ))}
                </div>
              </details>

              <details className="group bg-white border border-zinc-100 rounded-[2rem] overflow-hidden shadow-[0_4px_15px_rgb(0,0,0,0.03)]">
                <summary className="flex items-center justify-between p-6 cursor-pointer transition-all list-none select-none">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#FFF7ED] text-[#F97316] rounded-xl flex items-center justify-center">
                      <Palette size={18} />
                    </div>
                    <span className="text-sm font-bold text-zinc-900">Colors & Effects</span>
                  </div>
                  <ChevronDown size={20} className="text-zinc-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-6 pt-0 space-y-6">
                    <div className="grid grid-cols-5 gap-2.5 p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-inner">
                      {CAPTION_COLORS.map(c => (
                        <button
                          key={`preset-color-${c}`}
                          onClick={() => setCaptionStyle({...captionStyle, color: c})}
                          className={`w-full aspect-square rounded-full border-2 transition-all relative group ${captionStyle.color === c ? 'border-zinc-900 scale-110 shadow-md ring-2 ring-emerald-100' : 'border-white hover:scale-105 shadow-sm'}`}
                          style={{ backgroundColor: c }}
                        >
                          {captionStyle.color === c && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check size={12} className={c === '#ffffff' ? 'text-zinc-900' : 'text-white'} strokeWidth={4} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Shadow Color</label>
                      <div className="relative h-12 w-full group">
                        <input 
                          type="color" 
                          value={shadowColor}
                          onChange={(e) => setShadowColor(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        />
                        <div className="w-full h-full rounded-2xl border-2 border-zinc-100 shadow-sm" style={{ backgroundColor: shadowColor }} />
                      </div>
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
