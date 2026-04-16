import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Mic, 
  Play, 
  Pause, 
  Trash2, 
  Check, 
  Loader2, 
  AlertCircle,
  Sparkles,
  Music,
  Save,
  ChevronRight,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClonedVoice {
  id: string;
  name: string;
  sampleUrl: string;
  fingerprint: string;
  createdAt: number;
}

const VoiceClone = ({ onCloneCreated }: { onCloneCreated: (voice: ClonedVoice) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [clonedVoiceName, setClonedVoiceName] = useState('');
  const [step, setStep] = useState<'upload' | 'analyze' | 'naming' | 'success'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setStep('analyze');
    
    // Simulate high-resolution vocal fingerprint extraction
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsAnalyzing(false);
          setStep('naming');
        }, 500);
      }
      setAnalysisProgress(progress);
    }, 400);
  };

  const handleSaveClone = () => {
    if (!clonedVoiceName.trim()) return;
    
    const newClone: ClonedVoice = {
      id: `clone-${Date.now()}`,
      name: clonedVoiceName,
      sampleUrl: previewUrl || '',
      fingerprint: 'vocal-fingerprint-data-hash',
      createdAt: Date.now()
    };
    
    onCloneCreated(newClone);
    setStep('success');
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-display font-bold text-zinc-900">VoxNova Elite Voice Cloning</h2>
        <p className="text-zinc-500 max-w-2xl mx-auto">
          Extract a high-resolution vocal fingerprint to create a perfectly realistic digital twin of any voice.
        </p>
      </div>

      <div className="glass-panel p-8 md:p-12 rounded-[3rem] border-zinc-100 bg-white shadow-xl shadow-zinc-900/5">
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div 
              key="upload-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-[2.5rem] p-12 hover:border-emerald-500/30 transition-all group bg-zinc-50/50">
                <input 
                  type="file" 
                  accept="audio/*" 
                  className="hidden" 
                  id="voice-sample-upload" 
                  onChange={handleFileChange}
                />
                <label 
                  htmlFor="voice-sample-upload"
                  className="flex flex-col items-center gap-4 cursor-pointer"
                >
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-zinc-400 group-hover:text-emerald-50 group-hover:scale-110 transition-all shadow-sm border border-zinc-100">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-zinc-900">Upload Voice Sample</p>
                    <p className="text-sm text-zinc-500">WAV, MP3, or M4A (Min 10 seconds recommended)</p>
                  </div>
                </label>
              </div>

              {file && (
                <div className="flex items-center justify-between p-6 bg-zinc-900 rounded-3xl text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <Music size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-bold text-sm truncate max-w-[200px]">{file.name}</p>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Ready for analysis</p>
                    </div>
                  </div>
                  <button 
                    onClick={startAnalysis}
                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    Start Analysis <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {step === 'analyze' && (
            <motion.div 
              key="analyze-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center py-12 space-y-8"
            >
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-zinc-100 flex items-center justify-center">
                  <Loader2 className="text-emerald-500 animate-spin" size={48} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-zinc-900">{Math.round(analysisProgress)}%</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-zinc-900">Extracting Vocal Fingerprint</h3>
                <p className="text-sm text-zinc-500 max-w-sm">
                  Analyzing prosody, intonation, and micro-expressions for maximum realism...
                </p>
              </div>

              <div className="w-full max-w-md h-2 bg-zinc-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${analysisProgress}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                {[
                  { label: 'Prosody & Intonation', active: analysisProgress > 20 },
                  { label: 'Micro-Expressions', active: analysisProgress > 45 },
                  { label: 'Emotional Resonance', active: analysisProgress > 70 },
                  { label: 'Accent Preservation', active: analysisProgress > 90 }
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${item.active ? 'text-emerald-600' : 'text-zinc-300'}`}>
                    <Check size={12} /> {item.label}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'naming' && (
            <motion.div 
              key="naming-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-6 p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
                <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <Sparkles size={32} />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-2xl font-bold text-zinc-900">Cloning Successful!</h3>
                  <p className="text-sm text-zinc-500">The vocal fingerprint has been extracted with 99.8% accuracy.</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-zinc-900 ml-2">Name Your Cloned Voice</label>
                <input 
                  type="text" 
                  value={clonedVoiceName}
                  onChange={(e) => setClonedVoiceName(e.target.value)}
                  placeholder="e.g. My Personal Voice, CEO Voice..."
                  className="w-full p-6 bg-white border-2 border-zinc-100 rounded-3xl text-xl focus:outline-none focus:border-emerald-500 transition-all shadow-sm"
                />
                <p className="text-xs text-zinc-400 ml-2">This name is private and only visible to you.</p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep('upload')}
                  className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSaveClone}
                  disabled={!clonedVoiceName.trim()}
                  className="flex-[2] py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-900/20 disabled:opacity-50"
                >
                  <Save size={20} /> Save Cloned Voice
                </button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div 
              key="success-step"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-12 space-y-8 text-center"
            >
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                <Check size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-zinc-900">Voice Ready for Use</h3>
                <p className="text-zinc-500 max-w-sm">
                  Your cloned voice "{clonedVoiceName}" is now available in your voice library.
                </p>
              </div>
              <button 
                onClick={() => window.location.reload()} // Simplified for now
                className="px-12 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20"
              >
                Go to Text to Speech
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-emerald-50 rounded-[2.5rem] space-y-4 border border-emerald-100">
          <div className="flex items-center gap-3 text-emerald-700">
            <AlertCircle size={20} />
            <h4 className="font-bold">Tips for Best Realism</h4>
          </div>
          <ul className="space-y-2 text-sm text-emerald-600/80">
            <li>• Use a clean recording without background noise.</li>
            <li>• Ensure the speaker has a natural, consistent tone.</li>
            <li>• A longer sample (30s+) provides better micro-expression data.</li>
          </ul>
        </div>
        <div className="p-8 bg-blue-50 rounded-[2.5rem] space-y-4 border border-blue-100">
          <div className="flex items-center gap-3 text-blue-700">
            <Sparkles size={20} />
            <h4 className="font-bold">Elite Synthesis Engine</h4>
          </div>
          <p className="text-sm text-blue-600/80">
            Our engine preserves the original speaker's unique dialect, emotional resonance, and natural warmth.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceClone;
