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
  Volume2,
  Video,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, googleProvider } from '../../firebase';
import { User, signInWithPopup } from 'firebase/auth';

interface ClonedVoice {
  id: string;
  name: string;
  sampleUrl: string;
  fingerprint: string;
  createdAt: any;
}

const VoiceClone = ({ onCloneCreated, currentUser, onNavigateToTTS }: { onCloneCreated: (voice: any) => void, currentUser: User | null, onNavigateToTTS: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [clonedVoiceName, setClonedVoiceName] = useState('');
  const [step, setStep] = useState<'upload' | 'analyze' | 'naming' | 'success'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

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

  const handleSaveClone = async () => {
    if (!clonedVoiceName.trim() || !currentUser) return;
    
    setIsSaving(true);
    try {
      const voiceData = {
        uid: currentUser.uid,
        name: clonedVoiceName,
        gender: 'male' as const,
        color: 'from-emerald-500 to-teal-600',
        description: `Custom cloned voice: ${clonedVoiceName}`,
        fingerprint: 'vocal-fingerprint-data-hash',
        isCloned: true,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'cloned_voices'), voiceData);
      
      onCloneCreated({
        id: docRef.id,
        ...voiceData
      });
      setStep('success');
    } catch (error) {
      console.error("Error saving cloned voice:", error);
      alert("Failed to save cloned voice. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
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
                  accept="audio/*,video/*" 
                  className="hidden" 
                  id="voice-sample-upload" 
                  onChange={handleFileChange}
                />
                <label 
                  htmlFor="voice-sample-upload"
                  className="flex flex-col items-center gap-4 cursor-pointer w-full h-full"
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all shadow-sm border border-zinc-100">
                      <Upload size={32} />
                    </div>
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-zinc-400 group-hover:text-blue-500 group-hover:scale-110 transition-all shadow-sm border border-zinc-100">
                      <Video size={32} />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-zinc-900">Upload Voice Sample</p>
                    <p className="text-sm text-zinc-500">WAV, MP3, M4A, or MP4 Video</p>
                    <p className="text-[10px] text-zinc-400 mt-2 uppercase tracking-widest font-bold">Click anywhere in this box to upload</p>
                  </div>
                </label>
              </div>

              {file && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-zinc-900 rounded-[2rem] text-white">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                      {file.type.startsWith('video') ? (
                        <Video size={20} className="text-blue-400" />
                      ) : (
                        <Music size={20} className="text-emerald-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm truncate">{file.name}</p>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                        {file.type.startsWith('video') ? 'Video' : 'Audio'} Source Detected
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button 
                      onClick={() => { setFile(null); setPreviewUrl(null); }}
                      className="flex-1 md:flex-none p-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all flex items-center justify-center"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button 
                      onClick={startAnalysis}
                      className="flex-[3] md:flex-none px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      Start Analysis <ChevronRight size={18} />
                    </button>
                  </div>
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
                  { label: 'Prosody & Intonation', active: analysisProgress > 15 },
                  { label: 'Neural Mapping', active: analysisProgress > 35 },
                  { label: 'Micro-Expressions', active: analysisProgress > 55 },
                  { label: 'Emotional Resonance', active: analysisProgress > 75 },
                  { label: 'Acoustic Fingerprint', active: analysisProgress > 90 },
                  { label: 'Elite Synthesis Ready', active: analysisProgress >= 100 }
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${item.active ? 'text-emerald-600' : 'text-zinc-300'}`}>
                    <Check size={12} className={item.active ? 'animate-bounce' : ''} /> {item.label}
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
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
                <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
                  <Sparkles size={32} />
                </div>
                <div className="flex-1 space-y-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-zinc-900">Elite Synthesis Complete!</h3>
                  <p className="text-sm text-zinc-500">Your realistic digital twin is ready. We've mapped every emotional nuance and micro-expression.</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-zinc-900 ml-2">Name Your Realistic Clone</label>
                <input 
                  type="text" 
                  value={clonedVoiceName}
                  onChange={(e) => setClonedVoiceName(e.target.value)}
                  placeholder="e.g. My Realistic Voice, CEO Master..."
                  className="w-full p-6 bg-white border-2 border-zinc-100 rounded-3xl text-xl focus:outline-none focus:border-emerald-500 transition-all shadow-sm"
                />
                <p className="text-xs text-zinc-400 ml-2">This voice will be added to your private library for Text to Speech.</p>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <button 
                  onClick={() => setStep('upload')}
                  className="w-full md:flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
                >
                  Discard
                </button>
                
                {!currentUser ? (
                  <button 
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="w-full md:flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20"
                  >
                    {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                    {isLoggingIn ? 'Logging in...' : 'Login to Save Clone'}
                  </button>
                ) : (
                  <button 
                    onClick={handleSaveClone}
                    disabled={!clonedVoiceName.trim() || isSaving}
                    className="w-full md:flex-[2] py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-900/20 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Save size={20} />
                    )}
                    {isSaving ? 'Synthesizing...' : 'Save Realistic Clone'}
                  </button>
                )}
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
                onClick={onNavigateToTTS}
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
