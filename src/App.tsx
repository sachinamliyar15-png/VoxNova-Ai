import React, { useState, useEffect, useRef } from 'react';
import { 
  X,
  Settings2, 
  Monitor, 
  Globe,
  LogOut,
  User,
  ExternalLink,
  AlertCircle,
  Check,
  Menu,
  Mic,
  Clapperboard,
  Sparkles,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  VOICES, 
  Voice, 
  Generation, 
  Voice as VoiceType,
  CaptionWord, 
  CaptionStyle
} from './types';
import { CAPTION_PRESETS } from './constants/captionPresets';

// Components
import VoiceEngine from './components/VoiceEngine';
import CaptionEngine from './components/CaptionEngine';
import VoiceLibrary from './components/VoiceLibrary';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import HistoryModal from './components/HistoryModal';
import PricingModal from './components/PricingModal';
import VoiceClone from './components/VoiceClone/VoiceClone';
import VoiceChanger from './components/VoiceChanger';
import InfoModals from './components/InfoModals';

// Utils
import { 
  fetchChunkedAudio, 
  base64ToArrayBuffer, 
  splitTextIntoChunks, 
  resamplePCM, 
  createWavHeader,
  fileToBase64 
} from './lib/audioUtils';
import { generateSRT, generateASS } from './lib/captionUtils';
import AboutSections from './components/AboutSections';

// Firebase
import { collection, query, orderBy, getDocs, doc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db, auth, googleProvider } from './firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Something went wrong</h1>
          <p className="text-zinc-500 mb-8 max-w-md">The application encountered an unexpected error. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all">Refresh Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  // Tab & UI State
  const [activeTab, setActiveTab] = useState<'generate' | 'captions' | 'voice-changer' | 'library' | 'voice-clone'>('generate');
  const [showWelcome, setShowWelcome] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showVoiceLibrary, setShowVoiceLibrary] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [showConfigError, setShowConfigError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Toast Stats
  const [showLimitToast, setShowLimitToast] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Auth & Profile
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Voice Engine State
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceType>(VOICES[1]);
  const [style, setStyle] = useState('normal');
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [pause, setPause] = useState(0.5);
  const [audioFormat, setAudioFormat] = useState<'wav' | 'mp3'>('wav');
  const [targetSampleRate, setTargetSampleRate] = useState(44100);
  const [language, setLanguage] = useState('hi');
  const [studioClarity, setStudioClarity] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [lastGeneration, setLastGeneration] = useState<Generation | null>(null);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | number | null>(null);

  // Caption Engine State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [exportVideoUrl, setExportVideoUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCaptioning, setIsCaptioning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [captionProgress, setCaptionProgress] = useState(0);
  const [captionStep, setCaptionStep] = useState('');
  const [captionWords, setCaptionWords] = useState<CaptionWord[]>([]);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>(CAPTION_PRESETS[0].style);
  const [captionAnimation, setCaptionAnimation] = useState(CAPTION_PRESETS[0].animation);
  const [selectedPresetId, setSelectedPresetId] = useState('professional-three-color');
  const [captionOffset, setCaptionOffset] = useState(0);
  const [captionLanguage, setCaptionLanguage] = useState('All Languages');
  const [captionScriptType, setCaptionScriptType] = useState<'hindi' | 'hinglish'>('hindi');
  const [translateToEnglish, setTranslateToEnglish] = useState(false);

  // Info Modal States
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showBlog, setShowBlog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  
  // History & Others
  const [history, setHistory] = useState<Generation[]>([]);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceChangingFile, setVoiceChangingFile] = useState<File | null>(null);
  const [voiceChangingResult, setVoiceChangingResult] = useState<any>(null);
  const [isVoiceChanging, setIsVoiceChanging] = useState(false);
  const [voiceChangingStep, setVoiceChangingStep] = useState('');
  const [voiceChangingProgress, setVoiceChangingProgress] = useState(0);

  const loadingMessages = [
    "Analyzing text...",
    "Synthesizing voice...",
    "Applying studio clarity...",
    "Optimizing audio quality...",
    "Finalizing generation..."
  ];
  const [loadingStep, setLoadingStep] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [clonedVoices, setClonedVoices] = useState<Voice[]>([]);

  // Combined voices list
  const allVoices = [...VOICES, ...clonedVoices];

  const handleResetSettings = () => {
    setSpeed(1);
    setPitch(1);
    setPause(0.5);
    setStyle('normal');
    setAudioFormat('wav');
    setTargetSampleRate(44100);
    setStudioClarity(true);
  };

  const handleDownload = () => {
    if (currentAudio) {
      const a = document.createElement('a');
      a.href = currentAudio;
      a.download = `VoxNova_Voice_${Date.now()}.wav`;
      a.click();
    }
  };

  const resetCaptionSettings = () => {
    setCaptionStyle(CAPTION_PRESETS[0].style);
    setCaptionAnimation(CAPTION_PRESETS[0].animation);
    setSelectedPresetId('professional-three-color');
    setCaptionOffset(0);
    setCaptionLanguage('All Languages');
    setCaptionScriptType('hindi');
    setTranslateToEnglish(false);
  };

  const handleVoiceChanger = async () => {
    if (!voiceChangingFile) return;
    setIsVoiceChanging(true);
    setVoiceChangingProgress(0);
    setVoiceChangingStep('Initializing...');
    try {
      const videoData = await fileToBase64(voiceChangingFile);
      setVoiceChangingProgress(30);
      setVoiceChangingStep('Processing neural transfer...');
      
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const response = await fetch('/api/voice-changer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          fileData: videoData,
          voice_id: selectedVoice.id,
          mode: 'dubbing'
        })
      });
      
      if (!response.ok) throw new Error("Conversion failed");
      const data = await response.json();
      setVoiceChangingResult({ url: `data:audio/wav;base64,${data.audioData}`, type: 'audio' });
      setVoiceChangingProgress(100);
      setVoiceChangingStep('Complete!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVoiceChanging(false);
    }
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ffmpegRef = useRef<any>(null);

  const handlePreviewVoice = async (voice: Voice) => {
    if (previewingVoiceId || isPreviewLoading) return;
    setPreviewingVoiceId(voice.id);
    setIsPreviewLoading(true);
    try {
      const response = await fetch('/api/preview-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          voice_id: voice.id, 
          voice_name: voice.name,
          language: language 
        })
      });
      if (!response.ok) throw new Error("Preview failed");
      const { audioData } = await response.json();
      setIsPreviewLoading(false);
      if (audioData) {
        const audio = new Audio(`data:audio/wav;base64,${audioData}`);
        audio.onended = () => setPreviewingVoiceId(null);
        audio.play();
      } else {
        setPreviewingVoiceId(null);
      }
    } catch (err) {
      setPreviewingVoiceId(null);
      setIsPreviewLoading(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.target.value;
    if (val.length > 5000) val = val.substring(0, 5000);
    const limit = currentUser ? 5000 : 300;
    if (val.length <= limit) setText(val);
    else {
      setText(val.substring(0, limit));
      setShowLimitToast(true);
      setTimeout(() => setShowLimitToast(false), 3000);
    }
  };

  const downloadAudio = (audioDataOrUrl: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = audioDataOrUrl;
    a.download = fileName;
    a.click();
  };

  // Auth Observer
  useEffect(() => {
    // Check for redirect result in case popup was blocked/redirect used
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("Logged in via redirect");
        }
      } catch (err: any) {
        if (err.code === 'auth/popup-blocked') {
          setError("Sign-in popup blocked. Please allow popups or try again.");
        }
      }
    };
    checkRedirect();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Ensure profile exists on backend
        try {
          const token = await user.getIdToken();
          await fetch('/api/user/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (e) {
          console.error("Failed to ensure profile creation", e);
        }
        
        fetchUserProfile(user);
        fetchHistory(user);
      } else {
        setUserProfile(null);
        setHistory([]);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = (user: FirebaseUser) => {
    const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setUserProfile(doc.data());
      }
    });
    return unsub;
  };

  const fetchHistory = async (user?: FirebaseUser) => {
    const activeUser = user || currentUser;
    if (!activeUser) return;
    try {
      const token = await activeUser.getIdToken();
      const res = await fetch('/api/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
         setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  // Handlers
  const handleLogin = async () => {
    setIsAuthLoading(true);
    try {
      // Try popup first
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Login failed with popup, trying redirect...', err);
      // Support fallback if popups are blocked by browser/iframe
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (reErr: any) {
          console.error('Redirect login also failed', reErr);
          setError(`Login failed: ${reErr.message}`);
          setIsAuthLoading(false);
        }
      } else {
        setError(`Login failed: ${err.message}`);
        setIsAuthLoading(false);
      }
    }
    // isAuthLoading will be set to false by onAuthStateChanged if successful
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleGenerate = async () => {
    if (!text || !selectedVoice) return;
    setIsGenerating(true);
    setGenerationProgress(0);
    try {
      const token = currentUser ? await currentUser.getIdToken() : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/generate-speech', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text,
          voice_name: selectedVoice.name,
          style,
          speed,
          pitch,
          language,
          pause,
          audioFormat,
          targetSampleRate,
          studioClarity: studioClarity,
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Generation failed");
      }

      const { audioData } = await response.json();
      const audioUrl = `data:audio/wav;base64,${audioData}`;
      setCurrentAudio(audioUrl);
      
      // Initialize and play audio element
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        audioRef.current.play().catch(e => console.warn("Auto-play blocked by browser:", e));
      }
      
      const newGeneration = {
        id: Date.now(),
        text,
        voice_name: selectedVoice.name,
        voice_color: selectedVoice.color,
        style,
        language,
        created_at: new Date().toISOString()
      };
      
      setLastGeneration(newGeneration);
      fetchHistory();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const playFromHistory = async (item: Generation) => {
    try {
      let data = item.audio_data;
      if (data === "CHUNKED") {
        setIsHistoryLoading(true);
        data = await fetchChunkedAudio(item.id.toString()) || "";
        setIsHistoryLoading(false);
      }
      if (!data) return;
      
      if (audioRef.current) {
        audioRef.current.pause();
        // Since server already adds RIFF header, we just use it directly
        const audioUrl = data.startsWith('data:') ? data : `data:audio/wav;base64,${data}`;
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        setPlayingId(item.id);
        setCurrentAudio(audioUrl);
        audioRef.current.play();
        audioRef.current.onended = () => {
          setPlayingId(null);
        };
      }
    } catch (err) {
      console.error("Playback failed", err);
    }
  };

  const downloadAudioLocal = (audioDataOrUrl: string, fileName: string) => {
    // Re-use logic or call utility
  };

  const handleDownloadSrt = () => {
    if (captionWords.length === 0) return;
    const srtContent = generateSRT(captionWords);
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VoxNova_Captions_${Date.now()}.srt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("SRT downloaded!");
  };

  const handleExportCaptions = async () => {
    if (!videoFile || captionWords.length === 0) return;
    setIsExporting(true);
    setCaptionProgress(0);
    setCaptionStep('Initializing download engine...');
    
    try {
      if (!ffmpegRef.current) {
        const { FFmpeg } = await import('@ffmpeg/ffmpeg');
        const { toBlobURL } = await import('@ffmpeg/util');
        const ffmpeg = new FFmpeg();
        const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        ffmpegRef.current = ffmpeg;
      }

      setCaptionStep('Burning captions into video...');
      const { burnCaptions, generateASS } = await import('./lib/captionUtils');
      const assContent = generateASS(captionWords, captionStyle, 1280, 720, captionOffset, captionStyle.font);
      const url = await burnCaptions(ffmpegRef.current, videoFile, assContent, (p) => setCaptionProgress(p), captionStyle.font);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `VoxNova_Captions_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast("Download started!");
    } catch (err: any) {
      console.error("Export failure:", err);
      setError(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
      setCaptionProgress(0);
    }
  };

  const handleGenerateCaptions = async () => {
    if (!videoFile) return;
    
    const limit = currentUser ? 300 * 1024 * 1024 : 50 * 1024 * 1024;
    if (videoFile.size > limit) {
      setError(`Video file is too large (> ${currentUser ? '300MB' : '50MB'}). Please upload a smaller video or compress it.`);
      return;
    }

    setIsCaptioning(true);
    setError(null);
    setCaptionProgress(0);
    setCaptionStep('Reading video file...');
    
    let attempts = 0;
    const maxAttempts = 5;

    const performGeneration = async (): Promise<any> => {
      try {
        const videoData = await fileToBase64(videoFile);
        setCaptionProgress(20);
        setCaptionStep('Uploading to AI engine...');
    
        const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
        const response = await fetch('/api/generate-captions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            videoData,
            language: captionLanguage,
            scriptType: captionScriptType,
            translateToEnglish
          })
        });
    
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Processing Failed' }));
          let errorMessage = 'Failed to generate captions';
          
          if (errorData.error) {
            errorMessage = typeof errorData.error === 'string' ? errorData.error : (errorData.error.message || JSON.stringify(errorData.error));
          }

          if (response.status === 503 && attempts < maxAttempts - 1) {
            attempts++;
            const nextDelay = (3000 * attempts) + 2000;
            setCaptionStep(`Model busy, retrying in ${Math.round(nextDelay/1000)}s (${attempts}/${maxAttempts})...`);
            await new Promise(r => setTimeout(r, nextDelay));
            return performGeneration();
          }
          throw new Error(errorMessage);
        }
    
        const data = await response.json();
        if (!data.words) throw new Error("AI could not find any speech in video.");

        setCaptionWords(data.words);
        setCaptionProgress(100);
        setCaptionStep('Captions ready!');
      } catch (err: any) {
        throw err;
      }
    };

    try {
      await performGeneration();
    } catch (err: any) {
      console.error("[Captions] Error:", err);
      setError(`Captioning failed: ${err.message}`);
    } finally {
      setIsCaptioning(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const isWhitelisted = (email: string) => ['sachinamliyar15@gmail.com', 'amliyarsachin248@gmail.com'].includes(email);

  // Audio event listeners for tracking time and duration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setAudioCurrentTime(audio.currentTime);
    const handleDurationChange = () => {
      if (!isNaN(audio.duration) && audio.duration !== Infinity) {
        setAudioDuration(audio.duration);
      }
    };
    const handleLoadedMetadata = () => {
      if (!isNaN(audio.duration) && audio.duration !== Infinity) {
        setAudioDuration(audio.duration);
      }
    };
    const handleCanPlay = () => {
      if (!isNaN(audio.duration) && audio.duration !== Infinity) {
        setAudioDuration(audio.duration);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {isAuthLoading ? (
          <motion.div 
            key="auth-loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-6 text-center overflow-hidden"
          >
            {/* Background Soundwave Patterns */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: [20, 100, 20],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: i * 0.05 
                  }}
                  className="w-1 mx-0.5 bg-emerald-500 rounded-full"
                />
              ))}
            </div>

            {/* VoxNova Premium Intro Animation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, scaleZ: 0 }}
              animate={{ scale: 1, opacity: 1, scaleZ: 1 }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
              className="relative mb-12"
            >
              <div className="absolute inset-x-[-150px] inset-y-[-150px] bg-emerald-500/5 blur-[100px] rounded-full" />
              <div className="w-32 h-32 bg-zinc-900 rounded-[3rem] flex items-center justify-center relative z-10 shadow-2xl shadow-emerald-500/10 border border-zinc-100">
                <Mic className="text-white w-16 h-16" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="space-y-4"
            >
              <h2 className="text-7xl font-display font-black text-zinc-900 tracking-tighter">
                VoxNova <span className="text-emerald-500">PRO</span>
              </h2>
              <p className="text-emerald-600 font-mono text-xs uppercase tracking-[0.8em] font-bold">Ultra High Fidelity Studio</p>
            </motion.div>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 300 }}
              transition={{ delay: 0.2, duration: 2, ease: "easeInOut" }}
              className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent my-12"
            />

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 2.5 }}
              className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-medium absolute bottom-12 px-8"
            >
              Professional AI Voice Engine • Cinematic Caption Studio
            </motion.p>
          </motion.div>
        ) : showWelcome ? (
          <WelcomeScreen onComplete={() => setShowWelcome(false)} />
        ) : (
          <div className="min-h-screen flex flex-col md:flex-row bg-white text-zinc-900 relative overflow-hidden">
            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 bg-white z-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                  <Mic className="text-white w-5 h-5" />
                </div>
                <h1 className="text-lg font-display font-bold tracking-tight">VoxNova <span className="text-emerald-500 font-medium text-sm">Text to Speech</span></h1>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-zinc-500 hover:text-zinc-900"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </header>

            <Sidebar 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              currentUser={currentUser}
              userProfile={userProfile}
              onLogin={handleLogin}
              onLogout={handleLogout}
              handleShare={() => showToast("Link copied to clipboard!")}
              setIsPricingModalOpen={setIsPricingModalOpen}
              setShowVoiceLibrary={setShowVoiceLibrary}
              setShowSettings={setShowSettings}
              selectedVoice={selectedVoice}
            />

            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
              <AnimatePresence mode="wait">
                {activeTab === 'generate' && (
                  <VoiceEngine 
                    key="voice-engine"
                    text={text} setText={setText}
                    selectedVoice={selectedVoice} setShowVoiceLibrary={setShowVoiceLibrary}
                    style={style} setStyle={setStyle}
                    speed={speed} setSpeed={setSpeed}
                    pitch={pitch} setPitch={setPitch}
                    pause={pause} setPause={setPause}
                    audioFormat={audioFormat} setAudioFormat={setAudioFormat}
                    targetSampleRate={targetSampleRate} setTargetSampleRate={setTargetSampleRate}
                    language={language} setLanguage={setLanguage}
                    studioClarity={studioClarity} setStudioClarity={setStudioClarity}
                    isGenerating={isGenerating} generationProgress={generationProgress}
                    handleGenerate={handleGenerate} handleResetSettings={handleResetSettings}
                    setShowHistoryModal={setShowHistoryModal}
                    currentUser={currentUser} userProfile={userProfile}
                    isAuthLoading={isAuthLoading} isWhitelisted={isWhitelisted}
                    lastGeneration={lastGeneration} currentAudio={currentAudio}
                    playingId={playingId} playFromHistory={playFromHistory}
                    downloadAudio={downloadAudio}
                    handleTextChange={handleTextChange}
                    error={error} errorType={null} 
                    setError={setError} setErrorType={() => {}}
                    loadingMessages={loadingMessages}
                    loadingStep={loadingStep}
                    audioCurrentTime={audioCurrentTime}
                    audioDuration={audioDuration}
                    setAudioCurrentTime={setAudioCurrentTime}
                    audioRef={audioRef}
                    isPlaying={isPlaying}
                    handleDownload={handleDownload}
                    setLastGeneration={setLastGeneration}
                    setCurrentAudio={setCurrentAudio}
                    handlePreviewVoice={handlePreviewVoice}
                    isPreviewLoading={isPreviewLoading}
                  />
                )}
                {activeTab === 'captions' && (
                  <CaptionEngine 
                    key="caption-engine"
                    videoFile={videoFile} videoUrl={videoUrl}
                    currentTime={currentTime} setCurrentTime={setCurrentTime}
                    isPlaying={isPlaying} setIsPlaying={setIsPlaying}
                    isCaptioning={isCaptioning} captionProgress={captionProgress}
                    captionStep={captionStep} captionWords={captionWords}
                    setCaptionWords={setCaptionWords} captionStyle={captionStyle}
                    setCaptionStyle={setCaptionStyle} captionAnimation={captionAnimation}
                    setCaptionAnimation={setCaptionAnimation} captionOffset={captionOffset}
                    setCaptionOffset={setCaptionOffset} 
                    captionLanguage={captionLanguage}
                    setCaptionLanguage={setCaptionLanguage}
                    captionScriptType={captionScriptType}
                    setCaptionScriptType={setCaptionScriptType}
                    translateToEnglish={translateToEnglish}
                    setTranslateToEnglish={setTranslateToEnglish}
                    selectedPresetId={selectedPresetId}
                    setSelectedPresetId={setSelectedPresetId}
                    handleVideoUpload={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setVideoFile(file);
                        setVideoUrl(URL.createObjectURL(file));
                        setCaptionWords([]);
                      }
                    }}
                    removeVideo={() => { setVideoFile(null); setVideoUrl(null); setCaptionWords([]); }}
                    handleGenerateCaptions={handleGenerateCaptions}
                    handleExportCaptions={handleExportCaptions}
                    exportVideoUrl={null} isExporting={isExporting}
                    setIsExporting={setIsExporting}
                    setCaptionStep={setCaptionStep}
                    setCaptionProgress={setCaptionProgress}
                    resetCaptionSettings={resetCaptionSettings} currentUser={currentUser}
                    handleDownloadSrt={handleDownloadSrt} videoRef={videoRef}
                    history={history}
                  />
                )}
                {activeTab === 'library' && (
                  <VoiceLibrary 
                    key="voice-library"
                    onSelect={(v) => { setSelectedVoice(v); setActiveTab('generate'); setShowVoiceLibrary(false); }}
                    selectedVoiceId={selectedVoice.id}
                    voices={VOICES}
                    onPreview={handlePreviewVoice}
                    playingId={previewingVoiceId}
                    isLoading={isPreviewLoading}
                  />
                )}
                {activeTab === 'voice-clone' && (
                  <VoiceClone 
                    currentUser={currentUser}
                    onLogin={handleLogin}
                    onCloneCreated={(voice) => {
                      setClonedVoices(prev => [voice, ...prev]);
                      setSelectedVoice(voice);
                      setActiveTab('generate');
                    }}
                    onNavigateToTTS={() => setActiveTab('generate')}
                  />
                )}
                {activeTab === 'voice-changer' && (
                  <VoiceChanger 
                    key="voice-changer"
                    voiceChangingFile={voiceChangingFile}
                    setVoiceChangingFile={setVoiceChangingFile}
                    voiceChangingResult={voiceChangingResult}
                    setVoiceChangingResult={setVoiceChangingResult}
                    isVoiceChanging={isVoiceChanging}
                    voiceChangingStep={voiceChangingStep}
                    voiceChangingProgress={voiceChangingProgress}
                    selectedVoice={selectedVoice}
                    setShowVoiceLibrary={setShowVoiceLibrary}
                    handleVoiceChanger={handleVoiceChanger}
                    setShowHistoryModal={setShowHistoryModal}
                    allVoices={allVoices}
                    currentUser={currentUser}
                  />
                )}
              </AnimatePresence>

              {/* Restore SEO Sections only once */}
              <AboutSections onShowBlog={(idx) => { setSelectedArticle(idx); setShowBlog(true); }} />

              {/* Restore Footer */}
              <footer className="max-w-6xl mx-auto py-24 px-6 border-t border-zinc-100">
                <div className="flex flex-col items-center gap-12">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center shadow-lg">
                      <Mic className="text-white" size={22} />
                    </div>
                    <div className="flex flex-col text-center">
                      <span className="text-2xl font-display font-bold tracking-tighter text-zinc-900">VOXNOVA</span>
                      <span className="text-[10px] text-emerald-500 font-black tracking-[0.2em] -mt-1 uppercase">Text to Speech</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                    <button onClick={() => setShowAbout(true)} className="hover:text-emerald-500 transition-colors cursor-pointer">About Us</button>
                    <button onClick={() => setShowContact(true)} className="hover:text-emerald-500 transition-colors cursor-pointer">Contact Us</button>
                    <button onClick={() => setShowBlog(true)} className="hover:text-emerald-500 transition-colors cursor-pointer">Blog</button>
                    <button onClick={() => setShowPrivacy(true)} className="hover:text-emerald-500 transition-colors cursor-pointer">Privacy Policy</button>
                    <button onClick={() => setShowTerms(true)} className="hover:text-emerald-500 transition-colors cursor-pointer">Terms of Service</button>
                  </div>
                  <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">© 2026 VoxNova Text to Speech. All rights reserved.</p>
                </div>
              </footer>
            </main>

            {/* Modals */}
            <InfoModals 
              showAbout={showAbout} setShowAbout={setShowAbout}
              showContact={showContact} setShowContact={setShowContact}
              showPrivacy={showPrivacy} setShowPrivacy={setShowPrivacy}
              showTerms={showTerms} setShowTerms={setShowTerms}
              showBlog={showBlog} setShowBlog={setShowBlog}
              selectedArticle={selectedArticle} setSelectedArticle={setSelectedArticle}
            />
            <HistoryModal 
              isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)}
              history={history} searchTerm={historySearchTerm} setSearchTerm={setHistorySearchTerm}
              playingId={playingId} playFromHistory={playFromHistory}
              deleteHistoryItem={(id) => {}} downloadAudio={downloadAudioLocal}
            />

            <AnimatePresence>
              {showVoiceLibrary && (
                <div className="fixed inset-0 z-[1001] bg-white flex flex-col md:p-8">
                  <div className="flex justify-between items-center p-6 border-b border-zinc-100">
                    <h2 className="text-xl font-bold">Voice Library</h2>
                    <button 
                      onClick={() => setShowVoiceLibrary(false)}
                      className="p-2 hover:bg-zinc-100 rounded-full transition-all"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <VoiceLibrary 
                      onSelect={(v) => { 
                        setSelectedVoice(v); 
                        setShowVoiceLibrary(false); 
                      }}
                      selectedVoiceId={selectedVoice.id}
                      voices={VOICES}
                      onPreview={handlePreviewVoice}
                      playingId={previewingVoiceId}
                      isLoading={isPreviewLoading}
                    />
                  </div>
                </div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {isPricingModalOpen && (
                <PricingModal 
                  onClose={() => setIsPricingModalOpen(false)}
                  onSelect={(plan, amount) => {}}
                />
              )}
            </AnimatePresence>

            {/* Config Error Overlay */}
            <AnimatePresence>
              {showConfigError && (
                <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
                  <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center space-y-6">
                    <AlertCircle size={48} className="text-amber-500 mx-auto" />
                    <h3 className="text-xl font-bold">Config Required</h3>
                    <p className="text-zinc-500 text-sm">Please setup your Firebase project first.</p>
                    <button onClick={() => setShowConfigError(false)} className="w-full py-3 bg-zinc-900 text-white rounded-xl">Dismiss</button>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
              {showShareToast && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                  className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl z-[500]"
                >
                  <Check size={18} className="text-emerald-500" />
                  <span className="text-sm font-bold">{toastMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Hidden Audio Element */}
            <audio ref={audioRef} className="hidden" />
          </div>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
};

export default App;
