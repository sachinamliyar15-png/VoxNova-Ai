import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Play, 
  Download, 
  History, 
  Settings2, 
  Volume2, 
  Trash2, 
  Loader2, 
  ChevronDown, 
  Check, 
  X,
  Library,
  Sparkles,
  Languages,
  Key,
  Share2,
  TrendingUp,
  Globe,
  Monitor,
  DollarSign,
  LogOut,
  User,
  Video,
  CreditCard,
  Crown,
  Upload,
  Languages as LangIcon,
  RefreshCw,
  Pause,
  Music,
  Search,
  Menu,
  HelpCircle,
  AlertCircle,
  Zap,
  Clock,
  Mail,
  ExternalLink,
  PenTool,
  ArrowUp,
  ArrowRight,
  Type,
  Plus,
  Edit2,
  PanelLeft,
  Copy,
  Send,
  ImagePlus,
  Image as ImageIcon,
  MoreVertical,
  Folder,
  Square,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VOICES, Voice, Generation } from './types';
import emailjs from 'emailjs-com';
import Markdown from 'react-markdown';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db, auth, googleProvider, analytics, logEvent } from './firebase';

const WelcomeScreen = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Professional Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/10">
          <Mic className="text-white w-12 h-12" />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-display font-bold tracking-tighter text-zinc-900 flex flex-col items-center">
            <div>VOX<span className="text-emerald-500">NOVA</span></div>
            <div className="text-xl text-zinc-400 font-medium tracking-tight mt-1">Text to Speech</div>
          </h1>
        </div>

        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          onAnimationComplete={() => setTimeout(onComplete, 500)}
          className="h-1 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        />
      </motion.div>

      <div className="absolute bottom-12 text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
        Professional Studio Grade TTS
      </div>
    </motion.div>
  );
};

import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// Helper to convert base64 to ArrayBuffer
const base64ToArrayBuffer = (base64: any) => {
  try {
    if (typeof base64 !== 'string') {
      throw new Error("Input is not a string");
    }

    // 1. Remove any whitespace (newlines, spaces, etc.)
    let sanitized = base64.replace(/\s/g, '');
    
    // 2. Remove data URL prefix if present (e.g., "data:audio/wav;base64,")
    if (sanitized.includes(',')) {
      sanitized = sanitized.split(',')[1];
    }
    
    // 3. Handle URL-safe base64 (replace - with + and _ with /)
    sanitized = sanitized.replace(/-/g, '+').replace(/_/g, '/');

    // 4. Strip any characters that are NOT in the base64 alphabet
    // Alphabet: A-Z, a-z, 0-9, +, /, =
    sanitized = sanitized.replace(/[^A-Za-z0-9+/=]/g, '');

    // 5. Ensure the string is valid base64 (handle missing padding)
    const paddingNeeded = (4 - (sanitized.length % 4)) % 4;
    if (paddingNeeded > 0 && paddingNeeded !== 3) { // 3 is invalid padding length
      sanitized += '='.repeat(paddingNeeded);
    }

    const binaryString = window.atob(sanitized);
    console.log(`Decoded base64, length: ${binaryString.length}`);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (err) {
    console.error("Base64 decoding failed:", err);
    throw new Error("The audio data is corrupted or incorrectly encoded.");
  }
};

// Helper to split text into manageable chunks for long-form generation
const splitTextIntoChunks = (text: string, maxChunkSize: number = 800) => {
  // First, split by natural breaks like paragraphs and sentences
  const segments = text.split(/(\n+|[.!?]+\s+)/g).filter(s => s.length > 0);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const segment of segments) {
    // If a single segment is too long, split it by words
    if (segment.length > maxChunkSize) {
      const words = segment.split(/\s+/);
      for (const word of words) {
        if ((currentChunk + " " + word).length > maxChunkSize && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = word;
        } else {
          currentChunk = currentChunk ? currentChunk + " " + word : word;
        }
      }
    } else if ((currentChunk + segment).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = segment;
    } else {
      currentChunk += segment;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  // Final pass: filter out any empty or whitespace-only chunks
  return chunks.filter(c => c.trim().length > 0);
};

// Helper to resample PCM data (linear interpolation)
const resamplePCM = (oldBuffer: ArrayBuffer, oldRate: number, newRate: number) => {
  const oldData = new Int16Array(oldBuffer);
  const ratio = oldRate / newRate;
  const newLength = Math.round(oldData.length / ratio);
  const newData = new Int16Array(newLength);
  
  for (let i = 0; i < newLength; i++) {
    const pos = i * ratio;
    const index = Math.floor(pos);
    const frac = pos - index;
    
    if (index + 1 < oldData.length) {
      newData[i] = oldData[index] * (1 - frac) + oldData[index + 1] * frac;
    } else {
      newData[i] = oldData[index];
    }
  }
  return newData.buffer;
};

// Helper to create a WAV header for PCM data
const createWavHeader = (pcmData: ArrayBuffer, sampleRate: number = 44100) => {
  const numOfChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numOfChannels * bitsPerSample) / 8;
  const blockAlign = (numOfChannels * bitsPerSample) / 8;
  const dataSize = pcmData.byteLength;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  
  const buffer = new ArrayBuffer(headerSize);
  const view = new DataView(buffer);
  
  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, totalSize - 8, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  
  // format chunk identifier
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // format chunk size
  view.setUint16(20, 1, true); // audio format (1 = PCM)
  view.setUint16(22, numOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  
  // data chunk identifier
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataSize, true);
  
  return buffer;
};

interface CaptionWord {
  word: string;
  start: number;
  end: number;
}

interface CaptionStyle {
  fontSize: number;
  color: string;
  glow: boolean;
  border: string;
  font: string;
  position: 'top' | 'middle' | 'bottom';
  backgroundColor?: string;
  outlineColor?: string;
  case: 'original' | 'uppercase' | 'lowercase';
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const CaptionOverlay = ({ 
  words, 
  currentTime, 
  style, 
  animation 
}: { 
  words: CaptionWord[], 
  currentTime: number, 
  style: CaptionStyle, 
  animation: string 
}) => {
  const currentWord = words.find(w => currentTime >= w.start && currentTime <= w.end);
  
  if (!currentWord) return null;

  const getAnimationProps = () => {
    switch (animation) {
      case 'pop':
        return {
          initial: { scale: 0.5, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { type: 'spring' as const, stiffness: 300, damping: 20 }
        };
      case 'fade':
        return {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.2 }
        };
      case 'glow':
        return {
          initial: { opacity: 0, filter: 'blur(10px)' },
          animate: { opacity: 1, filter: 'blur(0px)' },
          transition: { duration: 0.3 }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.1 }
        };
    }
  };

  const textStyle: React.CSSProperties = {
    fontSize: `${style.fontSize}px`,
    color: style.color,
    fontFamily: style.font,
    textTransform: style.case === 'uppercase' ? 'uppercase' : style.case === 'lowercase' ? 'lowercase' : 'none',
    textShadow: style.glow ? `0 0 10px ${style.color}, 0 0 20px ${style.color}` : 'none',
    WebkitTextStroke: style.border !== 'none' ? `1px ${style.outlineColor}` : 'none',
    backgroundColor: style.backgroundColor,
    padding: style.backgroundColor !== 'transparent' ? '4px 12px' : '0',
    borderRadius: '8px',
  };

  const positionClass = style.position === 'top' ? 'top-10' : style.position === 'middle' ? 'top-1/2 -translate-y-1/2' : 'bottom-10';

  return (
    <div className={`absolute left-0 right-0 flex justify-center pointer-events-none z-10 ${positionClass}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord.word + currentWord.start}
          {...getAnimationProps()}
          style={textStyle}
          className="font-bold text-center px-4"
        >
          {currentWord.word}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const CaptionEditor = ({ 
  words, 
  onUpdate 
}: { 
  words: CaptionWord[], 
  onUpdate: (words: CaptionWord[]) => void 
}) => {
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
      {words.map((word, idx) => (
        <div key={idx} className="flex items-center gap-2 bg-zinc-50 p-2 rounded-xl border border-zinc-100">
          <input 
            type="text" 
            value={word.word} 
            onChange={(e) => {
              const newWords = [...words];
              newWords[idx].word = e.target.value;
              onUpdate(newWords);
            }}
            className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
          />
          <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
            <span>{word.start.toFixed(2)}s</span>
            <span>-</span>
            <span>{word.end.toFixed(2)}s</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<Voice>(VOICES[1]);
  const [style, setStyle] = useState('normal');
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [pause, setPause] = useState(0.5);
  const [audioFormat, setAudioFormat] = useState<'wav' | 'mp3'>('wav');
  const [targetSampleRate, setTargetSampleRate] = useState<24000 | 44100 | 48000>(44100);
  const [studioClarity, setStudioClarity] = useState(true);
  const [language, setLanguage] = useState('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    "Analyzing text...",
    "Synthesizing voice...",
    "Applying studio clarity...",
    "Optimizing audio quality...",
    "Finalizing generation..."
  ];
  const [history, setHistory] = useState<Generation[]>([]);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (currentAudio && currentAudio.startsWith('blob:')) {
        URL.revokeObjectURL(currentAudio);
      }
    };
  }, [currentAudio]);
  const [showVoiceLibrary, setShowVoiceLibrary] = useState(false);
  const [showLimitToast, setShowLimitToast] = useState(false);

  const [exhaustedCount, setExhaustedCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'captions' | 'voice-changer' | 'dubbing'>('generate');
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const [showShareToast, setShowShareToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Reset selected voice if it's 'original' and user switches away from dubbing
  useEffect(() => {
    if (selectedVoice.id === 'original' && activeTab !== 'dubbing') {
      setSelectedVoice(VOICES[1]);
    }
  }, [activeTab, selectedVoice.id]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("File too large (max 5MB)");
        return;
      }
      setFileToUpload(file);
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setFileToUpload(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeatureMenuOpen, setIsFeatureMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isProMode, setIsProMode] = useState(false);
  const stopGenerationRef = useRef(false);

  const WHITELISTED_EMAILS = ['sachinamliyar15@gmail.com', 'amliyarsachin248@gmail.com'];
  const isWhitelisted = (email: string | null | undefined) => email ? WHITELISTED_EMAILS.includes(email) : false;

  const [voiceSearchTerm, setVoiceSearchTerm] = useState('');
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [playingId, setPlayingId] = useState<string | number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [captionFile, setCaptionFile] = useState<File | null>(null);
  const [captionResult, setCaptionResult] = useState<any>(null);
  const [captionWords, setCaptionWords] = useState<CaptionWord[]>([]);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>({
    fontSize: 32,
    color: '#ffffff',
    glow: true,
    border: 'none',
    font: 'Inter',
    position: 'bottom',
    backgroundColor: 'transparent',
    outlineColor: '#000000',
    case: 'uppercase'
  });
  const [isEditingCaptions, setIsEditingCaptions] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dubbingVideoRef = useRef<HTMLVideoElement>(null);
  const dubbingAudioRef = useRef<HTMLAudioElement>(null);
  const [captionAnimation, setCaptionAnimation] = useState('none');
  const [isCaptioning, setIsCaptioning] = useState(false);
  const [captionStep, setCaptionStep] = useState('');
  const [captionProgress, setCaptionProgress] = useState(0);
  const [dubbingFile, setDubbingFile] = useState<File | null>(null);
  const [dubbingResult, setDubbingResult] = useState<any>(null);
  const [dubbingMode, setDubbingMode] = useState('auto');
  const [isDubbing, setIsDubbing] = useState(false);
  const [dubbingProgress, setDubbingProgress] = useState(0);
  const [dubbingStep, setDubbingStep] = useState('');
  const [dubbingLanguage, setDubbingLanguage] = useState('Hindi');
  const [sourceLanguage, setSourceLanguage] = useState('English');
  const [showConfigError, setShowConfigError] = useState(false);
  const [dubbingCurrentTime, setDubbingCurrentTime] = useState(0);
  const [isSyncPlaying, setIsSyncPlaying] = useState(false);

  // Auto-save feature
  useEffect(() => {
    const savedScript = localStorage.getItem('voxnova_script_draft');
    if (savedScript) {
      setText(savedScript);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('voxnova_script_draft', text);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [text]);



  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const limit = currentUser ? 5000 : 200;
    if (val.length <= limit) {
      setText(val);
      if (val.length === limit) {
        setShowLimitToast(true);
        setTimeout(() => setShowLimitToast(false), 3000);
      }
    } else {
      setShowLimitToast(true);
      setTimeout(() => setShowLimitToast(false), 3000);
    }
  };

  useEffect(() => {
    if (!auth) {
      setIsAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth State Changed:", user?.email);
      setCurrentUser(user);
      setIsAuthLoading(false);
      if (user) {
        fetchUserProfile(user);
      } else {
        setUserProfile(null);
        setHistory([]);
      }
    }, (error) => {
      console.error("Auth State Error:", error);
      setIsAuthLoading(false);
      setError("Authentication service encountered an error. Please refresh the page.");
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (user: FirebaseUser) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch profile");
      setUserProfile(data);
      fetchHistory(user);
    } catch (err: any) {
      console.error('Failed to fetch profile', err);
      // Don't show error for profile fetch to avoid blocking UI, but log it
    }
  };

  const handleLogin = async () => {
    if (!auth || !googleProvider) {
      setError("Firebase is not configured. Please add your Firebase environment variables to enable login.");
      return;
    }
    
    setIsAuthLoading(true);
    try {
      console.log("Starting Google Login...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Login successful:", result.user.email);
      if (analytics) {
        logEvent(analytics, 'login', {
          method: 'Google',
          user_id: result.user.uid
        });
      }
    } catch (err: any) {
      console.error('Login failed', err);
      setError(`Login failed: ${err.message || "Please check your internet connection and try again."}`);
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    setIsAuthLoading(true);
    try {
      console.log("Starting Logout...");
      await signOut(auth);
      console.log("Logout successful");
    } catch (err: any) {
      console.error('Logout failed', err);
      setError(`Logout failed: ${err.message}`);
      setIsAuthLoading(false);
    }
  };

  const purchaseCredits = async (plan: string, credits: number) => {
    if (!currentUser) {
      handleLogin();
      return;
    }
    
    try {
      const token = await currentUser.getIdToken();
      
      // 1. Create Order on Server
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      });
      
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Order creation failed");

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "VoxNova Text to Speech",
        description: `Purchase ${credits.toLocaleString()} Credits`,
        order_id: orderData.id,
        handler: async (response: any) => {
          // 3. Verify Payment on Server
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan
            })
          });

          if (verifyRes.ok) {
            fetchUserProfile(currentUser);
            setIsPricingModalOpen(false);
            alert("Payment Successful! Credits added to your account.");
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: currentUser.displayName,
          email: currentUser.email,
        },
        theme: {
          color: "#10b981",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      
    } catch (err: any) {
      console.error('Purchase failed', err);
      alert(`Payment failed: ${err.message}`);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'VoxNova Text to Speech - Professional Voice Generator',
      text: 'Check out this amazing AI Voice Generator! Create professional narrations in Hindi and English.',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    fetchHistory();
    checkApiKey();
    // Debug connectivity
    fetch('/api/health')
      .then(r => r.json())
      .then(d => console.log('Server Health:', d))
      .catch(e => console.error('Server Health Check Failed:', e));
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio?.hasSelectedApiKey) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    }
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
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'rate-limit' | 'network' | 'auth' | 'general' | null>(null);

  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);

  const resetSettings = () => {
    setSpeed(1.0);
    setPitch(1.0);
    setPause(0.5);
    setAudioFormat('wav');
    setTargetSampleRate(44100);
    setStudioClarity(true);
    setStyle('normal');
  };

  const handlePreviewVoice = async (voice: Voice) => {
    if (previewingVoiceId) return;
    if (voice.id === 'original') {
      setError("Original Voice preview is not available as it clones the speaker's voice from your uploaded video.");
      return;
    }
    setPreviewingVoiceId(voice.id);
    try {
      const response = await fetch('/api/preview-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice_id: voice.id, voice_name: voice.name })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to preview voice");
      }

      const { audioData } = await response.json();
      if (audioData) {
        const audio = new Audio(`data:audio/wav;base64,${audioData}`);
        audio.onended = () => setPreviewingVoiceId(null);
        audio.onerror = () => {
          setError("Failed to play audio. Please try again.");
          setPreviewingVoiceId(null);
        };
        audio.play();
      }
    } catch (err: any) {
      console.error("Preview failed:", err);
      setError(err.message || "Failed to preview voice. Please try again.");
      setPreviewingVoiceId(null);
    }
  };

  const handleCaptioning = async () => {
    if (!captionFile) return;
    setIsCaptioning(true);
    setCaptionProgress(0);
    setCaptionStep('Preparing video data...');
    
    try {
      const videoData = await fileToBase64(captionFile);
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
          language: language === 'hi' ? 'Hindi' : 'English'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'AUTH_CONFIG_MISSING') {
          setShowConfigError(true);
          return;
        }
        throw new Error(errorData.error || 'Failed to generate captions');
      }

      setCaptionProgress(70);
      setCaptionStep('Processing word timestamps...');

      const data = await response.json();
      setCaptionWords(data.words);
      
      // Generate a basic SRT for download compatibility
      let srt = '';
      data.words.forEach((w: any, i: number) => {
        const formatTime = (seconds: number) => {
          const date = new Date(0);
          date.setSeconds(seconds);
          return date.toISOString().substr(11, 12).replace('.', ',');
        };
        srt += `${i + 1}\n${formatTime(w.start)} --> ${formatTime(w.end)}\n${w.word}\n\n`;
      });

      setCaptionResult({
        videoUrl: URL.createObjectURL(captionFile),
        srt
      });
      
      setCaptionProgress(100);
      setCaptionStep('Captions ready!');
    } catch (err: any) {
      setError(`Captioning failed: ${err.message}`);
    } finally {
      setIsCaptioning(false);
    }
  };

  const handleDubbing = async () => {
    if (!dubbingFile) return;
    setIsDubbing(true);
    setDubbingProgress(0);
    setDubbingStep('Preparing video data...');
    
    try {
      const videoData = await fileToBase64(dubbingFile);
      setDubbingProgress(20);
      setDubbingStep('Uploading to AI engine...');

      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const response = await fetch('/api/generate-dubbing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          videoData,
          sourceLanguage,
          targetLanguage: dubbingLanguage,
          voiceName: selectedVoice.name,
          mode: dubbingMode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'AUTH_CONFIG_MISSING') {
          setShowConfigError(true);
          return;
        }
        throw new Error(errorData.error || 'Failed to generate dubbing');
      }

      setDubbingProgress(70);
      setDubbingStep('Synthesizing AI voice...');

      const data = await response.json();
      
      setDubbingResult({
        videoUrl: URL.createObjectURL(dubbingFile),
        audioUrl: `data:audio/wav;base64,${data.audioData}`,
        text: data.translatedText,
        segments: data.segments
      });
      
      setDubbingProgress(100);
      setDubbingStep('Dubbing Complete!');
    } catch (err: any) {
      setError(`Dubbing failed: ${err.message}`);
    } finally {
      setIsDubbing(false);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;

    if (analytics) {
      logEvent(analytics, 'generate_voice_start', {
        voice_name: selectedVoice.name,
        text_length: text.length,
        language: language
      });
    }

    // Calculate credit cost (1 credit per character)
    const creditCost = text.length;
    
    // Check for premium voice restriction
    if (selectedVoice.isPremium) {
      if (!currentUser) {
        setError(`The voice "${selectedVoice.name}" is a Premium feature. Please login and upgrade your plan to access high-quality cinematic voices.`);
        setIsPricingModalOpen(true);
        return;
      }
      if ((!userProfile || userProfile.plan === 'free') && !isWhitelisted(currentUser.email || '')) {
        setError(`The voice "${selectedVoice.name}" is a Premium feature. Please upgrade your plan to access high-quality cinematic voices.`);
        setIsPricingModalOpen(true);
        return;
      }
    }

    if (currentUser && userProfile && userProfile.credits < creditCost && !isWhitelisted(currentUser.email || '')) {
      setError(`Insufficient credits. You need ${creditCost} credits but only have ${userProfile.credits}.`);
      setIsPricingModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setErrorType(null);
    setGenerationProgress(0);
    
    const generateWithRetry = async (chunkText: string): Promise<string> => {
      const endpoint = currentUser ? '/api/generate-speech' : '/api/generate-speech-guest';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (currentUser) {
        const token = await currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: chunkText,
          voice_name: selectedVoice.name,
          style,
          speed,
          pitch,
          language,
          studioClarity,
          pause
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate speech via backend");
      }

      const data = await response.json();
      return data.audioData;
    };

    try {
      // Sanitize text: remove problematic characters that might crash the TTS model
      const sanitizeText = (t: string) => {
        return t.replace(/[*_#`~[\]()<>|\\{}]/g, '') // Remove markdown-like chars
                .replace(/[^\x20-\x7E\u0900-\u097F\u00A0-\u00FF]/g, ' ') // Keep basic Latin, Hindi, and common symbols
                .trim();
      };

      const sanitizedText = sanitizeText(text);
      if (sanitizedText.length === 0) {
        setError("Please enter some valid text to generate voice.");
        setIsGenerating(false);
        return;
      }

      // 1. Split text into chunks for long-form stability
      // Increased chunk size to 2500 for faster processing of long scripts
      const chunks = splitTextIntoChunks(sanitizedText, 2500); 
      
      // Increased concurrency to 5 for faster generation while staying within safe limits
      const CONCURRENCY_LIMIT = 5;
      const allPcmBuffers: ArrayBuffer[] = new Array(chunks.length);
      
      // Process chunks in batches
      for (let i = 0; i < chunks.length; i += CONCURRENCY_LIMIT) {
        const batch = chunks.slice(i, i + CONCURRENCY_LIMIT);
        const batchPromises = batch.map(async (chunkText, batchIndex) => {
          const globalIndex = i + batchIndex;
          
          // Stagger the starts within the batch
          await new Promise(resolve => setTimeout(resolve, batchIndex * 1000));
          
          const base64Audio = await generateWithRetry(chunkText);
          const pcmBuffer = base64ToArrayBuffer(base64Audio);
          
          allPcmBuffers[globalIndex] = pcmBuffer;
          
          // Update progress
          setGenerationProgress(prev => {
            const completed = allPcmBuffers.filter(b => b !== undefined).length;
            return Math.floor((completed / chunks.length) * 100);
          });
          setLoadingStep(prev => (prev + 1) % loadingMessages.length);
        });
        
        await Promise.all(batchPromises);
      }

      setGenerationProgress(100);

      // 2. Merge all PCM buffers efficiently
      const totalPcmLength = allPcmBuffers.reduce((acc, buf) => acc + (buf ? buf.byteLength : 0), 0);
      const mergedPcm = new Uint8Array(totalPcmLength);
      let offset = 0;
      for (const buf of allPcmBuffers) {
        if (buf) {
          mergedPcm.set(new Uint8Array(buf), offset);
          offset += buf.byteLength;
        }
      }

      // 3. Process and Play Audio
      const resampledPcm = resamplePCM(mergedPcm.buffer, 24000, targetSampleRate);
      
      let finalBlob: Blob;
      if (audioFormat === 'mp3') {
        // MP3 Encoding
        const _lamejs = (window as any).lamejs;
        if (!_lamejs) {
          throw new Error("MP3 encoder not loaded. Please refresh the page.");
        }
        const mp3Encoder = new _lamejs.Mp3Encoder(1, targetSampleRate, 128);
        const mp3Data: any[] = [];
        const sampleBlockSize = 1152;
        const pcmInt16 = new Int16Array(resampledPcm);
        
        for (let i = 0; i < pcmInt16.length; i += sampleBlockSize) {
          const sampleChunk = pcmInt16.subarray(i, i + sampleBlockSize);
          const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
          if (mp3buf.length > 0) {
            mp3Data.push(new Uint8Array(mp3buf));
          }
        }
        const mp3Last = mp3Encoder.flush();
        if (mp3Last.length > 0) {
          mp3Data.push(new Uint8Array(mp3Last));
        }
        finalBlob = new Blob(mp3Data, { type: 'audio/mp3' });
      } else {
        // WAV Encoding
        const wavHeader = createWavHeader(resampledPcm, targetSampleRate);
        const combinedBuffer = new Uint8Array(wavHeader.byteLength + resampledPcm.byteLength);
        combinedBuffer.set(new Uint8Array(wavHeader), 0);
        combinedBuffer.set(new Uint8Array(resampledPcm), wavHeader.byteLength);
        finalBlob = new Blob([combinedBuffer], { type: 'audio/wav' });
      }
      
      const audioUrl = URL.createObjectURL(finalBlob);
      setCurrentAudio(audioUrl);
      
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.error("Auto-play failed:", e));
        }
      }, 100);

      // 4. Save to History (Backend)
      if (currentUser) {
        // Convert the final blob to base64 for history storage
        const reader = new FileReader();
        const finalBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(',')[1]);
          };
          reader.readAsDataURL(finalBlob);
        });

        // Save to history & Deduct Credits
        try {
          const token = await currentUser.getIdToken();
          const saveRes = await fetch('/api/save', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              text,
              voice: selectedVoice.name,
              style,
              speed,
              pitch,
              audioData: finalBase64,
              creditCost: Math.ceil(text.length / 10)
            })
          });
          
          if (!saveRes.ok) {
            const errData = await saveRes.json();
            throw new Error(errData.error || "Failed to save generation");
          }

          if (analytics) {
            logEvent(analytics, 'generate_voice_success', {
              voice_name: selectedVoice.name,
              language: language
            });
          }
          
          fetchHistory(currentUser);
          fetchUserProfile(currentUser);
        } catch (saveErr: any) {
          console.error("Failed to save to history:", saveErr);
          setError(`Saved locally, but failed to sync: ${saveErr.message}`);
        }
      } else {
        // Guest mode: Just log locally if needed or just finish
        if (analytics) {
          logEvent(analytics, 'generate_voice_guest_success', {
            voice_name: selectedVoice.name,
            language: language
          });
        }
      }
    } catch (err: any) {
      console.error('Generation failed', err);
      const errStr = err.message || JSON.stringify(err);
      if (errStr.includes("API key not valid")) {
        setError("Invalid API Key: Please check your API key settings.");
        setErrorType('auth');
      } else if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota") || errStr.includes("exhausted")) {
        setError("All AI voice servers are currently busy due to high demand. Please try again in 2-3 minutes.");
        setErrorType('rate-limit');
      } else if (errStr.includes("500") || errStr.includes("INTERNAL") || errStr.includes("503")) {
        setError("The AI server is temporarily busy. We're working to restore it. Please try again in a few seconds.");
        setErrorType('general');
      } else if (errStr.includes("Rpc failed") || errStr.includes("xhr error") || errStr.includes("Network Error")) {
        setError("Network connection lost. Please check your internet and try again.");
        setErrorType('network');
      } else {
        // Show the actual error message to help diagnose the issue
        const displayMsg = err.message || "Something went wrong while generating your voice. Please try again later.";
        setError(displayMsg);
        setErrorType('general');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteHistoryItem = async (id: string | number, type?: string) => {
    if (!window.confirm("Are you sure you want to delete this generation?")) return;
    try {
      const token = await currentUser!.getIdToken();
      const res = await fetch(`/api/history/${id}${type ? `?type=${type}` : ''}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }
    } catch (err: any) {
      console.error("Failed to delete history item:", err);
      setError(`Delete failed: ${err.message}`);
    }
  };

  const playFromHistory = (audioData: string, id: string | number) => {
    try {
      if (playingId === id) {
        if (audioRef.current) {
          audioRef.current.pause();
          setPlayingId(null);
        }
        return;
      }

      if (!audioData) throw new Error("No audio data available");
      if (audioData === "LONG_AUDIO_DATA_TOO_LARGE_FOR_HISTORY") {
        setError("This audio was too large to be stored in history.");
        return;
      }

      // Fix: History audio is already a WAV/MP3 base64, don't re-process as PCM
      const blob = new Blob([base64ToArrayBuffer(audioData)], { 
        type: audioData.startsWith('//') || audioData.startsWith('SUQz') ? 'audio/mp3' : 'audio/wav' 
      });
      const audioUrl = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setPlayingId(id);

      audio.onended = () => {
        setPlayingId(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.play().catch(e => {
        console.error("History playback failed:", e);
        setError("Playback failed. Please try downloading the file.");
        setPlayingId(null);
      });
    } catch (err: any) {
      console.error("Error playing from history:", err);
      setError("Failed to play audio.");
      setPlayingId(null);
    }
  };

  const handleRestoreScript = (item: Generation) => {
    setText(item.text);
    const voice = VOICES.find(v => v.name === item.voice_name);
    if (voice) setSelectedVoice(voice);
    setSpeed(item.speed || 1);
    setPitch(item.pitch || 1);
    setStyle(item.style || 'normal');
    setActiveTab('generate');
    setShowHistoryModal(false);
  };

  const filteredHistory = history.filter(item => 
    item.text.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
    item.voice_name.toLowerCase().includes(historySearchTerm.toLowerCase())
  );

  const SettingsModal = () => (
    <AnimatePresence>
      {showSettings && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md glass-panel p-8 rounded-3xl space-y-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                  <Settings2 size={24} />
                </div>
                <h2 className="text-2xl font-display font-bold">Settings</h2>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Account Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Account</h3>
                {currentUser ? (
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={currentUser.photoURL || ''} alt="" className="w-10 h-10 rounded-full border border-zinc-200" />
                      <div>
                        <p className="text-sm font-bold">{currentUser.displayName}</p>
                        <p className="text-xs text-zinc-500">{currentUser.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleLogin}
                    className="w-full btn-primary"
                  >
                    <User size={20} />
                    Sign In with Google
                  </button>
                )}
              </div>

              {/* System Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">System</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <Monitor size={18} />
                      </div>
                      <span className="text-sm font-medium">Theme</span>
                    </div>
                    <span className="text-xs font-bold text-zinc-400 uppercase">Light</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                        <Globe size={18} />
                      </div>
                      <span className="text-sm font-medium">Language</span>
                    </div>
                    <span className="text-xs font-bold text-zinc-400 uppercase">English</span>
                  </div>
                </div>
              </div>

              {/* Support Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Support</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => { setShowSettings(false); setShowAbout(true); }}
                    className="w-full p-3 bg-zinc-50 hover:bg-zinc-100 rounded-xl border border-zinc-100 text-xs font-medium transition-all"
                  >
                    About Us
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 text-center">
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                VoxNova Text to Speech v2.1.0
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const HistoryModal = () => (
    <AnimatePresence>
      {showHistoryModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHistoryModal(false)}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, x: 50 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0.9, opacity: 0, x: 50 }}
            className="relative w-full max-w-2xl h-[80vh] bg-white p-8 rounded-3xl flex flex-col border border-zinc-200 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                  <History size={24} />
                </div>
                <h2 className="text-2xl font-display font-bold text-zinc-900">Generation History</h2>
              </div>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-900"
              >
                <X size={24} />
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text"
                placeholder="Search history by text or voice..."
                value={historySearchTerm}
                onChange={(e) => setHistorySearchTerm(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-emerald-500 transition-all text-zinc-900"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {filteredHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-4">
                  <History size={48} className="opacity-20" />
                  <p>No matching history found.</p>
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <div key={item.id} className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl hover:bg-zinc-100 transition-all group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            {item.voice_name}
                          </span>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-600 line-clamp-2 italic">"{item.text}"</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => playFromHistory(item.audio_data, item.id)}
                          className={`p-3 rounded-xl transition-all ${playingId === item.id ? 'bg-emerald-500 text-white' : 'bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600'}`}
                        >
                          {playingId === item.id ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <button 
                          onClick={() => handleRestoreScript(item)}
                          title="Restore Script & Settings"
                          className="p-3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-xl transition-all"
                        >
                          <RefreshCw size={18} />
                        </button>
                        <button 
                          onClick={() => downloadAudio(item.audio_data, `voxnova-${item.voice_name.toLowerCase()}-${item.id}.wav`)}
                          className="p-3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-xl transition-all"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => deleteHistoryItem(item.id, item.type)}
                          className="p-3 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const downloadAudio = (audioDataOrUrl: string, fileName: string) => {
    try {
      if (!audioDataOrUrl) throw new Error("No audio data available");
      
      let url = "";
      if (audioDataOrUrl.startsWith('blob:')) {
        url = audioDataOrUrl;
      } else {
        if (audioDataOrUrl === "LONG_AUDIO_DATA_TOO_LARGE_FOR_HISTORY") {
          setError("This audio was too large to be stored in history. Please generate it again.");
          return;
        }
        const pcmBuffer = base64ToArrayBuffer(audioDataOrUrl);
        const resampledPcm = resamplePCM(pcmBuffer, 24000, targetSampleRate);
        
        let finalBlob: Blob;
        if (audioFormat === 'mp3') {
          const _lamejs = (window as any).lamejs;
          if (!_lamejs) throw new Error("MP3 encoder not loaded");
          const mp3Encoder = new _lamejs.Mp3Encoder(1, targetSampleRate, 128);
          const mp3Data: any[] = [];
          const sampleBlockSize = 1152;
          const pcmInt16 = new Int16Array(resampledPcm);
          for (let i = 0; i < pcmInt16.length; i += sampleBlockSize) {
            const sampleChunk = pcmInt16.subarray(i, i + sampleBlockSize);
            const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
            if (mp3buf.length > 0) mp3Data.push(new Uint8Array(mp3buf));
          }
          const mp3Last = mp3Encoder.flush();
          if (mp3Last.length > 0) mp3Data.push(new Uint8Array(mp3Last));
          finalBlob = new Blob(mp3Data, { type: 'audio/mp3' });
        } else {
          const wavHeader = createWavHeader(resampledPcm, targetSampleRate);
          const combinedBuffer = new Uint8Array(wavHeader.byteLength + resampledPcm.byteLength);
          combinedBuffer.set(new Uint8Array(wavHeader), 0);
          combinedBuffer.set(new Uint8Array(resampledPcm), wavHeader.byteLength);
          finalBlob = new Blob([combinedBuffer], { type: 'audio/wav' });
        }
        url = URL.createObjectURL(finalBlob);
      }

      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.${audioFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Cleanup if we created a new URL
      if (!audioDataOrUrl.startsWith('blob:')) {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (err: any) {
      console.error("Error downloading audio:", err);
      setError("Failed to process audio for download.");
    }
  };

  const handleDeleteHistory = async (id: string | number, type?: string) => {
    try {
      const token = currentUser ? await currentUser.getIdToken() : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      await fetch(`/api/history/${id}${type ? `?type=${type}` : ''}`, { 
        method: 'DELETE',
        headers
      });
      fetchHistory();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isAuthLoading ? (
        <motion.div 
          key="auth-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center"
        >
          <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
          <p className="mt-4 text-zinc-500 font-medium animate-pulse">Initializing VoxNova...</p>
        </motion.div>
      ) : showWelcome ? (
        <WelcomeScreen onComplete={() => setShowWelcome(false)} />
      ) : (
        <div key="app" className="min-h-screen flex flex-col md:flex-row bg-white text-zinc-900 relative overflow-hidden">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 bg-white z-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <Mic className="text-white w-5 h-5" />
              </div>
              <h1 className="text-lg font-display font-bold tracking-tight">
                VoxNova <span className="text-emerald-500 font-medium text-sm">Text to Speech</span>
              </h1>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-zinc-500 hover:text-zinc-900"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </header>

          {/* Background Mesh Gradient */}
          <div className="fixed inset-0 pointer-events-none opacity-40">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
          </div>

          <SettingsModal />
          <HistoryModal />

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-zinc-200 p-6 flex flex-col gap-8 transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="hidden md:flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
            <Mic className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-display font-bold tracking-tight">
            VoxNova <span className="text-emerald-500 font-medium text-base">Text to Speech</span>
          </h1>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => { setActiveTab('generate'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'generate' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
          >
            <Mic size={20} />
            Text to Speech Voice
          </button>
          <button 
            onClick={() => { setActiveTab('dubbing'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dubbing' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
          >
            <Languages size={20} />
            AI Dubbing
          </button>
          <button 
            onClick={() => { setActiveTab('voice-changer'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'voice-changer' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
          >
            <RefreshCw size={20} />
            Voice Changer
          </button>
          <button 
            onClick={() => { setActiveTab('captions'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'captions' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
          >
            <Video size={20} />
            Animated Captions
          </button>
          <button 
            onClick={() => { setActiveTab('history'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
          >
            <History size={20} />
            Generation History
          </button>
          <button 
            onClick={() => { setShowVoiceLibrary(true); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-all"
          >
            <Library size={20} />
            Voice Library
          </button>
          <button 
            onClick={() => { handleShare(); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-all"
          >
            <Share2 size={20} />
            Share App
          </button>
          <button 
            onClick={() => { setIsPricingModalOpen(true); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all border border-emerald-100"
          >
            <Crown size={20} />
            Premium Plans
          </button>
        </nav>

        <div className="mt-auto p-4 glass-panel rounded-2xl border-zinc-100">
          {currentUser ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={currentUser.photoURL || ''} alt="" className="w-10 h-10 rounded-full border border-zinc-200" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{currentUser.displayName}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                    {isWhitelisted(currentUser.email) ? 'Owner' : (userProfile?.plan || 'Free')} Plan
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                    title="Settings"
                  >
                    <Settings2 size={18} />
                  </button>
                  <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors" title="Logout">
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
              <div className="pt-3 border-t border-zinc-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Credits</span>
                  <span className="text-xs font-mono text-emerald-600">
                    {isWhitelisted(currentUser.email) ? 'Unlimited' : (userProfile ? userProfile.credits?.toLocaleString() : '...')}
                  </span>
                </div>
                <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    style={{ width: isWhitelisted(currentUser.email) ? '100%' : `${Math.min(100, ((userProfile?.credits || 0) / 20000) * 100)}%` }} 
                  />
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white font-bold py-3 rounded-xl hover:bg-zinc-800 transition-all"
            >
              <User size={18} />
              Login with Google
            </button>
          )}
        </div>

        <div className="mt-4 p-4 glass-panel rounded-2xl border-zinc-100">
          <p className="text-xs text-zinc-500 mb-2">Current Voice</p>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${selectedVoice.color} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
              {selectedVoice.name[0]}
            </div>
            <div>
              <p className="text-sm font-medium">{selectedVoice.name}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{selectedVoice.gender}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Toasts */}
      <AnimatePresence>
        {showLimitToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-red-500 text-white rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <AlertCircle size={20} />
            Character limit reached (5,000)
          </motion.div>
        )}
        {showShareToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-zinc-900 text-white rounded-full shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <Check size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold">{toastMessage || "Link copied to clipboard!"}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing Modal */}
      <AnimatePresence>
        {isPricingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-4xl bg-white border border-zinc-200 rounded-[2.5rem] p-10 space-y-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-3xl font-display font-bold text-zinc-900">Premium Plans</h3>
                  <p className="text-zinc-500">Choose the plan that fits your creative needs.</p>
                </div>
                <button onClick={() => setIsPricingModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-900">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Free Plan */}
                <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-6 flex flex-col">
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-zinc-900">Free</h4>
                    <div className="text-3xl font-display font-bold text-zinc-900">₹0<span className="text-sm text-zinc-500">/mo</span></div>
                  </div>
                  <ul className="text-xs text-zinc-500 space-y-3 flex-1">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 20,000 Credits/mo</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Standard Voices</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Monthly Reset</li>
                  </ul>
                  <button disabled className="w-full py-3 rounded-xl bg-zinc-100 text-zinc-400 font-bold text-sm">Current Plan</button>
                </div>

                {/* Basic Plan */}
                <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-6 flex flex-col">
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-zinc-900">Basic</h4>
                    <div className="text-3xl font-display font-bold text-zinc-900">₹100</div>
                  </div>
                  <ul className="text-xs text-zinc-500 space-y-3 flex-1">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 6,000 Credits</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> High Quality Voices</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> No Expiry</li>
                  </ul>
                  <button onClick={() => purchaseCredits('basic', 6000)} className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 transition-all">Buy Now</button>
                </div>

                {/* Pro Plan */}
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-6 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">Best Value</div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-emerald-700">Pro</h4>
                    <div className="text-3xl font-display font-bold text-emerald-700">₹200</div>
                  </div>
                  <ul className="text-xs text-emerald-600 space-y-3 flex-1">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 15,000 Credits</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> High Quality Voices</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Priority Support</li>
                  </ul>
                  <button onClick={() => purchaseCredits('pro', 15000)} className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all">Buy Now</button>
                </div>

                {/* Advanced Plan */}
                <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-6 flex flex-col">
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-zinc-900">Advanced</h4>
                    <div className="text-3xl font-display font-bold text-zinc-900">₹400</div>
                  </div>
                  <ul className="text-xs text-zinc-500 space-y-3 flex-1">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 30,000 Credits</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> All Premium Features</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Priority Support</li>
                  </ul>
                  <button onClick={() => purchaseCredits('advanced', 30000)} className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 transition-all">Buy Now</button>
                </div>

                {/* Ultra Plan */}
                <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-6 flex flex-col">
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-zinc-900">Ultra</h4>
                    <div className="text-3xl font-display font-bold text-zinc-900">₹500</div>
                  </div>
                  <ul className="text-xs text-zinc-500 space-y-3 flex-1">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 40,000 Credits</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> All Premium Features</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Custom Voice Profiles</li>
                  </ul>
                  <button onClick={() => purchaseCredits('ultra', 40000)} className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 transition-all">Buy Now</button>
                </div>
              </div>

              <div className="p-6 bg-zinc-50 rounded-3xl text-center space-y-4">
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Secure Payments via Razorpay</p>
                <div className="flex flex-wrap justify-center items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                  <div className="flex flex-col items-center gap-1">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b2/Google_Pay_Logo.svg" alt="Google Pay" className="h-6" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_standalone.svg" alt="Paytm" className="h-4" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon Pay" className="h-5" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-6" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo.png" alt="UPI" className="h-6" referrerPolicy="no-referrer" />
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400">
                  * 1 Credit = ~10 characters of text. Credits are deducted only on successful generation.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          {activeTab === 'generate' ? (
            <motion.div 
              key="generate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-bold">Speech Synthesis</h2>
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
                      <button 
                        onClick={() => setLanguage('en')}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${language === 'en' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                      >
                        English
                      </button>
                      <button 
                        onClick={() => setLanguage('hi')}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${language === 'hi' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                      >
                        Hindi
                      </button>
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <textarea 
                    value={text}
                    onChange={handleTextChange}
                    placeholder={`Enter your script here... (up to ${currentUser ? '5,000' : '200'} characters)`}
                    className="w-full h-80 bg-white border-2 border-zinc-100 rounded-3xl p-8 text-xl leading-relaxed resize-none focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-300 text-zinc-900 shadow-sm"
                  />
                  
                  <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-3 pointer-events-auto">
                      <div className="relative w-5 h-5">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
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
                            animate={{ strokeDashoffset: 100 - (text.length / (currentUser ? 5000 : 200)) * 100 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-zinc-500">
                        {!currentUser ? 'Guest Mode (10 daily)' : (isWhitelisted(currentUser?.email || '') ? 'Unlimited' : `${(userProfile?.credits || 0).toLocaleString()} credits remaining`)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 pointer-events-auto">
                      <button 
                        onClick={() => setText('')}
                        className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
                      >
                        Clear
                      </button>
                      <div className="h-4 w-px bg-zinc-200" />
                      <span className={`text-sm font-mono font-bold ${text.length >= 4500 ? 'text-amber-500' : 'text-zinc-400'}`}>
                        {text.length.toLocaleString()} / 5,000
                      </span>
                    </div>
                  </div>
                </div>

                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !text || !selectedVoice}
                    className="w-full py-4 px-6 bg-emerald-500 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/20"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={24} />
                        <span>Generating {generationProgress}%</span>
                      </div>
                    ) : (
                      <>
                        <Play size={24} fill="currentColor" />
                        <span>Generate Speech</span>
                      </>
                    )}
                  </button>
                </div>

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
                        className="h-full bg-white"
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
                    <div 
                      onClick={() => setShowVoiceLibrary(true)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${selectedVoice.color} flex items-center justify-center text-[10px] font-bold text-white`}>
                          {selectedVoice.name[0]}
                        </div>
                        <span className="text-sm font-medium">{selectedVoice.name}</span>
                      </div>
                      <ChevronDown size={14} className="text-zinc-500" />
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
                      <option value="documentary" className="bg-white">Documentary</option>
                      <option value="doc-pro" className="bg-white">Professional Documentary</option>
                      <option value="emotional" className="bg-white">Emotional</option>
                      <option value="storytelling" className="bg-white">Storytelling</option>
                      <option value="motivational" className="bg-white">Motivational</option>
                    </select>
                  </div>

                  <div className="glass-panel p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Settings2 size={14} /> Controls
                      </label>
                      <button 
                        onClick={resetSettings}
                        className="text-[10px] text-zinc-400 hover:text-zinc-900 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
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
                          <button 
                            onClick={() => setSpeed(0.7)}
                            className={`flex-1 py-1 rounded-md text-[10px] border ${speed === 0.7 ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-200 text-zinc-500 hover:text-zinc-900'}`}
                          >
                            Slow
                          </button>
                          <button 
                            onClick={() => setSpeed(1.0)}
                            className={`flex-1 py-1 rounded-md text-[10px] border ${speed === 1.0 ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-200 text-zinc-500 hover:text-zinc-900'}`}
                          >
                            Normal
                          </button>
                          <button 
                            onClick={() => setSpeed(1.4)}
                            className={`flex-1 py-1 rounded-md text-[10px] border ${speed === 1.4 ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-200 text-zinc-500 hover:text-zinc-900'}`}
                          >
                            Fast
                          </button>
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
                          <span>Pause Gap</span>
                          <span>{pause}s</span>
                        </div>
                        <input 
                          type="range" min="0.1" max="1" step="0.1" 
                          value={pause} onChange={(e) => setPause(parseFloat(e.target.value))}
                          className="w-full accent-zinc-900 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1 pt-2 border-t border-zinc-100">
                        <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                          <span>Output Format</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setAudioFormat('wav')}
                            className={`flex-1 py-1 rounded-md text-[10px] border ${audioFormat === 'wav' ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-200 text-zinc-500 hover:text-zinc-900'}`}
                          >
                            WAV
                          </button>
                          <button 
                            onClick={() => setAudioFormat('mp3')}
                            className={`flex-1 py-1 rounded-md text-[10px] border ${audioFormat === 'mp3' ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-200 text-zinc-500 hover:text-zinc-900'}`}
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
                            className={`flex-1 py-1 rounded-md text-[8px] border ${targetSampleRate === 24000 ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-200 text-zinc-500 hover:text-zinc-900'}`}
                          >
                            24kHz
                          </button>
                          <button 
                            onClick={() => setTargetSampleRate(44100)}
                            className={`flex-1 py-1 rounded-md text-[8px] border ${targetSampleRate === 44100 ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-200 text-zinc-500 hover:text-zinc-900'}`}
                          >
                            44.1kHz
                          </button>
                          <button 
                            onClick={() => setTargetSampleRate(48000)}
                            className={`flex-1 py-1 rounded-md text-[8px] border ${targetSampleRate === 48000 ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-200 text-zinc-500 hover:text-zinc-900'}`}
                          >
                            48kHz
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              <div className="flex flex-col md:flex-row gap-4 pt-4">
                  <button 
                    onClick={resetSettings}
                    className="md:w-32 h-14 glass-panel flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-900 transition-all"
                  >
                    <RefreshCw size={18} />
                    Reset
                  </button>
                  <button 
                    id="generate-btn"
                    onClick={handleGenerate}
                    disabled={isGenerating || !text.trim()}
                    className="flex-1 btn-primary h-14"
                  >
                    {isGenerating ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={18} />
                          <span className="font-bold">Generating Voice...</span>
                        </div>
                        <span className="text-[10px] opacity-70 animate-pulse">{loadingMessages[loadingStep]}</span>
                      </div>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Generate Voice
                      </>
                    )}
                  </button>
                  
                  {currentAudio && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if (isPlaying) {
                            audioRef.current?.pause();
                            setIsPlaying(false);
                          } else {
                            audioRef.current?.play();
                            setIsPlaying(true);
                          }
                        }}
                        className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${isPlaying ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'glass-panel hover:bg-white/5'}`}
                      >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                      </button>
                      <button 
                        onClick={() => downloadAudio(currentAudio, 'generated-voice')}
                        className="w-14 h-14 glass-panel rounded-xl flex items-center justify-center hover:bg-white/5 transition-all"
                      >
                        <Download size={24} />
                      </button>
                    </div>
                  )}
                </div>

                {currentAudio && (
                  <audio 
                    ref={audioRef} 
                    src={currentAudio} 
                    className="hidden" 
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                )}
            </motion.div>
          ) : activeTab === 'captions' ? (
            <motion.div 
              key="captions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-bold text-zinc-900">Animated Captions</h2>
                  <p className="text-zinc-500">Generate stylish, time-synced captions for your videos automatically.</p>
                </div>
                {captionResult && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditingCaptions(!isEditingCaptions)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isEditingCaptions ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
                    >
                      <Edit2 size={16} />
                      {isEditingCaptions ? 'Finish Editing' : 'Edit Captions'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Video Preview Area */}
                  <div className="glass-panel p-4 rounded-[2.5rem] border-zinc-100 bg-zinc-900 relative overflow-hidden aspect-video flex items-center justify-center">
                    {captionFile ? (
                      <div className="relative w-full h-full">
                        <video 
                          ref={videoRef}
                          src={captionResult ? captionResult.videoUrl : URL.createObjectURL(captionFile)} 
                          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                          controls 
                          className="w-full h-full object-contain" 
                        />
                        {captionWords.length > 0 && (
                          <CaptionOverlay 
                            words={captionWords} 
                            currentTime={currentTime} 
                            style={captionStyle} 
                            animation={captionAnimation} 
                          />
                        )}
                      </div>
                    ) : (
                      <div 
                        onClick={() => document.getElementById('video-upload-captions')?.click()}
                        className="flex flex-col items-center justify-center gap-4 cursor-pointer text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        <div className="p-6 bg-zinc-800 rounded-3xl">
                          <Upload size={48} />
                        </div>
                        <p className="font-bold">Click to upload video</p>
                        <p className="text-xs opacity-50">MP4, MOV or WEBM (Max 50MB)</p>
                      </div>
                    )}
                    <input 
                      type="file" id="video-upload-captions" hidden accept="video/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setCaptionFile(file);
                        setCaptionResult(null);
                        setCaptionWords([]);
                      }}
                    />
                  </div>

                  {/* Controls & Editor */}
                  {captionWords.length > 0 && isEditingCaptions && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-panel p-8 rounded-[2.5rem] border-zinc-100 space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <PenTool size={20} className="text-emerald-500" />
                          Edit Word Timestamps
                        </h3>
                        <p className="text-xs text-zinc-400">Changes are saved locally for preview</p>
                      </div>
                      <CaptionEditor words={captionWords} onUpdate={setCaptionWords} />
                    </motion.div>
                  )}

                  {!captionResult && !isCaptioning && captionFile && (
                    <button 
                      onClick={handleCaptioning}
                      className="w-full py-5 bg-emerald-500 text-white rounded-3xl font-bold text-xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                    >
                      <Sparkles size={24} />
                      Generate AI Captions
                    </button>
                  )}

                  {isCaptioning && (
                    <div className="glass-panel p-8 rounded-[2.5rem] border-zinc-100 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Loader2 className="animate-spin text-emerald-500" size={24} />
                          <span className="font-bold text-zinc-900">{captionStep}</span>
                        </div>
                        <span className="font-mono text-emerald-600 font-bold">{captionProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${captionProgress}%` }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Style Sidebar */}
                  <div className="glass-panel p-6 rounded-[2.5rem] border-zinc-100 space-y-8">
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <LayoutGrid size={14} /> Animation Style
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'none', name: 'Static', icon: <Square size={14} /> },
                          { id: 'pop', name: 'Pop Up', icon: <Zap size={14} /> },
                          { id: 'fade', name: 'Fade', icon: <Monitor size={14} /> },
                          { id: 'glow', name: 'Glow', icon: <Sparkles size={14} /> }
                        ].map(anim => (
                          <button
                            key={anim.id}
                            onClick={() => setCaptionAnimation(anim.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${captionAnimation === anim.id ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200'}`}
                          >
                            {anim.icon}
                            {anim.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Type size={14} /> Typography
                      </label>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] text-zinc-500">
                            <span>Font Size</span>
                            <span>{captionStyle.fontSize}px</span>
                          </div>
                          <input 
                            type="range" min="16" max="120" 
                            value={captionStyle.fontSize} 
                            onChange={(e) => setCaptionStyle({...captionStyle, fontSize: parseInt(e.target.value)})}
                            className="w-full accent-emerald-500 h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <span className="text-[10px] text-zinc-500 uppercase">Text Color</span>
                            <div className="flex items-center gap-2">
                              <input 
                                type="color" 
                                value={captionStyle.color}
                                onChange={(e) => setCaptionStyle({...captionStyle, color: e.target.value})}
                                className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                              />
                              <span className="text-[10px] font-mono uppercase">{captionStyle.color}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <span className="text-[10px] text-zinc-500 uppercase">Glow Effect</span>
                            <button 
                              onClick={() => setCaptionStyle({...captionStyle, glow: !captionStyle.glow})}
                              className={`w-full py-2 rounded-xl text-[10px] font-bold border transition-all ${captionStyle.glow ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-zinc-100 text-zinc-400'}`}
                            >
                              {captionStyle.glow ? 'Enabled' : 'Disabled'}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[10px] text-zinc-500 uppercase">Position</span>
                          <div className="flex gap-1 p-1 bg-zinc-50 rounded-xl border border-zinc-100">
                            {(['top', 'middle', 'bottom'] as const).map(pos => (
                              <button
                                key={pos}
                                onClick={() => setCaptionStyle({...captionStyle, position: pos})}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold capitalize transition-all ${captionStyle.position === pos ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                              >
                                {pos}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[10px] text-zinc-500 uppercase">Case Style</span>
                          <div className="flex gap-1 p-1 bg-zinc-50 rounded-xl border border-zinc-100">
                            {(['original', 'uppercase', 'lowercase'] as const).map(c => (
                              <button
                                key={c}
                                onClick={() => setCaptionStyle({...captionStyle, case: c})}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold capitalize transition-all ${captionStyle.case === c ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {captionResult && (
                      <div className="pt-6 border-t border-zinc-100 space-y-4">
                        <button 
                          onClick={() => {
                            const blob = new Blob([captionResult.srt], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `captions-${Date.now()}.srt`;
                            a.click();
                          }}
                          className="w-full py-3 bg-zinc-100 text-zinc-600 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={14} />
                          Download SRT
                        </button>
                        <button 
                          className="w-full py-4 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-900/20"
                        >
                          <Video size={18} />
                          Export Video
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                    <h4 className="text-sm font-bold mb-2 flex items-center gap-2 text-emerald-900">
                      <Sparkles size={16} className="text-emerald-500" /> Pro Tip
                    </h4>
                    <p className="text-xs text-emerald-700 leading-relaxed">
                      Use "Uppercase" and "Pop Up" animation for viral reel style captions. Our AI handles Hindi script perfectly!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'voice-changer' ? (
            <motion.div 
              key="voice-changer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-zinc-900">Voice Changer</h2>
                <p className="text-zinc-500">Transform your voice into any of our professional AI characters while maintaining emotion and tone.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 border-zinc-100">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">1. Upload File</label>
                    <div 
                      onClick={() => document.getElementById('audio-upload-vc')?.click()}
                      className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${dubbingFile ? 'border-emerald-500/50 bg-emerald-50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}`}
                    >
                      <input 
                        type="file" id="audio-upload-vc" hidden accept="audio/*,video/*" 
                        onChange={(e) => {
                          setDubbingFile(e.target.files?.[0] || null);
                          setDubbingResult(null);
                          setDubbingMode('convert');
                        }}
                      />
                      {dubbingFile ? (
                        <>
                          <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600">
                            <Music size={32} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-emerald-600">{dubbingFile.name}</p>
                            <p className="text-xs text-zinc-500">{(dubbingFile.size / (1024 * 1024)).toFixed(2)} MB</p>
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

                <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 border-zinc-100">
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
                    onClick={() => {
                      if (!dubbingFile) {
                        setError("Please upload an audio or video file first to change voice.");
                        return;
                      }
                      handleDubbing();
                    }}
                    disabled={isDubbing}
                    className={`w-full py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${isDubbing ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : !dubbingFile ? 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'}`}
                  >
                    {isDubbing ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={24} />
                          <span className="font-bold">Processing...</span>
                        </div>
                        <span className="text-[10px] opacity-70 animate-pulse">{dubbingStep}</span>
                      </div>
                    ) : (
                      <>
                        <RefreshCw size={24} />
                        Change Voice
                      </>
                    )}
                  </button>

                  {isDubbing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>{dubbingStep}</span>
                        <span>{dubbingProgress}%</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${dubbingProgress}%` }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {dubbingResult && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel p-8 rounded-[2.5rem] border-emerald-500/20 bg-emerald-50 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-zinc-900">
                      <Sparkles className="text-emerald-500" /> Result
                    </h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = dubbingResult.audioUrl;
                          a.download = `voice-change-${Date.now()}.wav`;
                          a.click();
                        }}
                        className="p-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all text-zinc-600"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                  </div>

                  {dubbingResult.text && (
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <p className="text-sm text-zinc-600 leading-relaxed italic">
                        "{dubbingResult.text}"
                      </p>
                    </div>
                  )}
                  
                  <div className="p-4 bg-zinc-100 rounded-2xl">
                    <audio src={dubbingResult.audioUrl} controls className="w-full h-10 accent-emerald-500" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : activeTab === 'dubbing' ? (
            <motion.div 
              key="dubbing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-zinc-900">AI Video Dubbing</h2>
                <p className="text-zinc-500">Translate and dub your videos into multiple languages while preserving the original speaker's voice characteristics.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 border-zinc-100">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">1. Upload Video</label>
                    <div 
                      onClick={() => document.getElementById('video-upload-dubbing')?.click()}
                      className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${dubbingFile ? 'border-emerald-500/50 bg-emerald-50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}`}
                    >
                      <input 
                        type="file" id="video-upload-dubbing" hidden accept="video/*" 
                        onChange={(e) => {
                          setDubbingFile(e.target.files?.[0] || null);
                          setDubbingResult(null);
                          setDubbingMode('dub');
                        }}
                      />
                      {dubbingFile ? (
                        <>
                          <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600">
                            <Video size={32} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-emerald-600">{dubbingFile.name}</p>
                            <p className="text-xs text-zinc-500">{(dubbingFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-4 bg-zinc-100 rounded-2xl text-zinc-400">
                            <Upload size={32} />
                          </div>
                          <p className="text-sm text-zinc-500">Click to upload video</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">2. Source Language</label>
                      <select 
                        value={sourceLanguage}
                        onChange={(e) => setSourceLanguage(e.target.value)}
                        className="w-full p-3 bg-white border border-zinc-100 rounded-xl text-xs font-bold text-zinc-600 focus:outline-none focus:border-emerald-500/30 transition-all"
                      >
                        {['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese'].map((lang) => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">3. Target Language</label>
                      <select 
                        value={dubbingLanguage}
                        onChange={(e) => setDubbingLanguage(e.target.value)}
                        className="w-full p-3 bg-white border border-zinc-100 rounded-xl text-xs font-bold text-zinc-600 focus:outline-none focus:border-emerald-500/30 transition-all"
                      >
                        {['Hindi', 'English', 'Spanish', 'French', 'German', 'Japanese'].map((lang) => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">4. Voice Character</label>
                    <button 
                      onClick={() => setShowVoiceLibrary(true)}
                      className="w-full p-4 bg-white border border-zinc-100 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedVoice.color} flex items-center justify-center text-white font-bold`}>
                          {selectedVoice.name[0]}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-zinc-900">{selectedVoice.name}</p>
                          <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">{selectedVoice.gender} • {selectedVoice.isPremium ? 'Pro' : 'Standard'}</p>
                        </div>
                      </div>
                      <ChevronDown size={18} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                    </button>
                  </div>

                  <button 
                    onClick={handleDubbing}
                    disabled={isDubbing || !dubbingFile}
                    className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDubbing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        {dubbingStep} ({dubbingProgress}%)
                      </>
                    ) : (
                      <>
                        <Languages size={20} />
                        Start Dubbing
                      </>
                    )}
                  </button>
                </div>

                <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 border-zinc-100">
                  <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">Preview & Export</label>
                  
                  {dubbingResult ? (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Original Video</label>
                        <div className="aspect-video bg-zinc-900 rounded-3xl overflow-hidden relative group">
                          <video 
                            ref={dubbingVideoRef} 
                            src={dubbingResult.videoUrl} 
                            onTimeUpdate={() => setDubbingCurrentTime(dubbingVideoRef.current?.currentTime || 0)}
                            className="w-full h-full object-contain" 
                          />
                        </div>
                      </div>

                      <div className="space-y-4 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-emerald-600 uppercase tracking-widest">Dubbed Audio ({dubbingLanguage})</label>
                          <button 
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = dubbingResult.audioUrl;
                              a.download = `dubbed-audio-${dubbingLanguage}-${Date.now()}.wav`;
                              a.click();
                            }}
                            className="text-emerald-600 hover:text-emerald-700 transition-all"
                            title="Download Dubbed Audio"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                        <audio ref={dubbingAudioRef} src={dubbingResult.audioUrl} controls className="w-full h-10 accent-emerald-500" />
                        
                        <div className="pt-2">
                          <button 
                            onClick={() => {
                              const v = dubbingVideoRef.current;
                              const a = dubbingAudioRef.current;
                              if (v && a) {
                                if (isSyncPlaying) {
                                  v.pause();
                                  a.pause();
                                  setIsSyncPlaying(false);
                                } else {
                                  v.currentTime = 0;
                                  a.currentTime = 0;
                                  v.muted = true;
                                  v.play();
                                  a.play();
                                  setIsSyncPlaying(true);
                                  a.onended = () => {
                                    v.pause();
                                    setIsSyncPlaying(false);
                                  };
                                  v.onended = () => {
                                    a.pause();
                                    setIsSyncPlaying(false);
                                  };
                                }
                              }
                            }}
                            className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${isSyncPlaying ? 'bg-zinc-900 text-white' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'}`}
                          >
                            {isSyncPlaying ? <Pause size={20} /> : <Play size={20} />}
                            {isSyncPlaying ? 'Stop Preview' : 'Play Dubbed Video'}
                          </button>
                          <p className="text-[10px] text-center mt-3 text-emerald-600/60 font-bold uppercase tracking-widest">
                            {isSyncPlaying ? 'Playing Dubbed Audio over Video' : 'Click to sync video with dubbed audio'}
                          </p>
                        </div>

                        {dubbingResult.text && (
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Translated Script</label>
                            <p className="text-sm text-emerald-900 leading-relaxed italic">
                              "{dubbingResult.text}"
                            </p>
                          </div>
                        )}
                      </div>

                      <p className="text-[10px] text-zinc-400 text-center italic">
                        Note: For the best experience, play the dubbed audio alongside the video. Full video merging is available in the Pro version.
                      </p>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
                      <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300">
                        <Languages size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-zinc-400">No Video Dubbed</p>
                        <p className="text-xs text-zinc-400">Upload a video and select target language to start.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-zinc-900">Generation History</h2>
                <p className="text-zinc-500">Access and download your previously generated audio files.</p>
              </div>

              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-20 glass-panel rounded-3xl border-dashed border-zinc-200">
                    <History size={48} className="mx-auto text-zinc-300 mb-4" />
                    <p className="text-zinc-500">No generations yet. Start by creating some audio!</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center border-zinc-100">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {item.type === 'caption' ? (
                            <span className="px-2 py-0.5 bg-blue-100 rounded text-[10px] font-bold uppercase tracking-wider text-blue-600">Captions</span>
                          ) : (
                            <>
                              <span className="px-2 py-0.5 bg-zinc-100 rounded text-[10px] font-bold uppercase tracking-wider text-zinc-600">{item.voice_name}</span>
                              <span className="px-2 py-0.5 bg-zinc-50 rounded text-[10px] text-zinc-400 uppercase tracking-wider">{item.style}</span>
                            </>
                          )}
                          <span className="text-[10px] text-zinc-500">
                            {item.timestamp ? new Date(item.timestamp._seconds * 1000).toLocaleDateString() : new Date(item.created_at || '').toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-600 line-clamp-2 italic">
                          {item.type === 'caption' ? `${item.words?.length} words transcribed` : `"${item.text}"`}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {item.type !== 'caption' && item.audio_data && (
                          <>
                            <button 
                              onClick={() => playFromHistory(item.audio_data!, item.id)}
                              className={`p-3 rounded-xl transition-all ${playingId === item.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600'}`}
                            >
                              {playingId === item.id ? (
                                <div className="flex items-center gap-1">
                                  <div className="w-1 h-3 bg-white animate-pulse" />
                                  <div className="w-1 h-4 bg-white animate-pulse delay-75" />
                                  <div className="w-1 h-2 bg-white animate-pulse delay-150" />
                                  <Pause size={18} />
                                </div>
                              ) : (
                                <Play size={20} />
                              )}
                            </button>
                            <button 
                              onClick={() => downloadAudio(item.audio_data!, `voice-${item.id}`)}
                              className="p-3 hover:bg-zinc-100 rounded-xl transition-all text-zinc-400 hover:text-zinc-600"
                            >
                              <Download size={20} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDeleteHistory(item.id, item.type)}
                          className="p-3 hover:bg-red-50 rounded-xl transition-all text-zinc-400 hover:text-red-500"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Ads Section */}
        <div className="mt-12 pt-12 border-t border-white/5 max-w-4xl mx-auto pb-12">
        </div>

        {/* SEO Content Section (The "Boxes") - Moved to Bottom */}
        <section className="max-w-4xl mx-auto py-16 px-6 space-y-12">
          {/* Ad Section - Top of SEO */}
          {/* Removed AdBox */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-display font-bold text-zinc-900">Why Choose VoxNova Text to Speech?</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">VoxNova Text to Speech is the world's most advanced AI voice generation platform, designed for creators, filmmakers, and storytellers who demand cinematic quality.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl space-y-4 border-zinc-100 hover:border-emerald-500/20 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Ultra-Realistic Voices</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Our neural networks are trained on thousands of hours of professional studio recordings to capture the subtle nuances of human speech, including breath, rhythm, and emotion.</p>
            </div>

            <div className="glass-panel p-8 rounded-3xl space-y-4 border-zinc-100 hover:border-emerald-500/20 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Multilingual Support</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Generate high-quality voiceovers in English and Hindi with perfect native accents. Our AI understands cultural nuances and provides localized performances for global audiences.</p>
            </div>

            <div className="glass-panel p-8 rounded-3xl space-y-4 border-zinc-100 hover:border-emerald-500/20 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Mic size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Cinematic Narration</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">From deep movie trailer voices to calm documentary narrators, VoxNova Text to Speech provides the perfect tone for any project. Use our advanced style controls to fine-tune the performance.</p>
            </div>
          </div>

          <div className="glass-panel p-10 rounded-[3rem] border-zinc-100 bg-zinc-50/50 space-y-6">
            <h3 className="text-2xl font-bold text-center text-zinc-900">Professional Grade AI Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h4 className="font-bold text-emerald-600">AI Voice Cloning</h4>
                <p className="text-sm text-zinc-500">Clone any voice with just a few seconds of audio. Perfect for maintaining consistency across long-running series or dubbing content into multiple languages while keeping the original actor's essence.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-emerald-600">Advanced Style Modulation</h4>
                <p className="text-sm text-zinc-500">Go beyond simple pitch and speed. Our AI allows you to control the emotional intensity, gravitas, and storytelling style of every generation, giving you full creative control.</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-3xl font-display font-bold text-center text-zinc-900">How VoxNova Text to Speech Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: '01', title: 'Input Text', desc: 'Paste your script into our advanced editor. We support long-form content up to 10,000 characters.' },
                { step: '02', title: 'Select Voice', desc: 'Browse our library of 20+ professional AI voices, each with unique traits and characteristics.' },
                { step: '03', title: 'Fine-Tune', desc: 'Adjust pitch, speed, and emotional style to get the perfect performance for your project.' },
                { step: '04', title: 'Generate', desc: 'Our neural engines process your request in seconds, delivering studio-quality 48kHz audio.' }
              ].map((item, i) => (
                <div key={i} className="p-6 space-y-3">
                  <div className="text-4xl font-display font-bold text-zinc-100">{item.step}</div>
                  <h4 className="font-bold text-zinc-900">{item.title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Ad Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
            {/* Removed AdBox */}
            {/* Removed AdBox */}
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-6xl mx-auto py-12 px-6 border-t border-zinc-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                <Mic className="text-white" size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-bold tracking-tighter text-zinc-900">VOXNOVA</span>
                <span className="text-[10px] text-emerald-500 font-medium tracking-widest -mt-1 uppercase">Text to Speech</span>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
              <button onClick={() => setShowAbout(true)} className="hover:text-zinc-900 transition-colors">About Us</button>
              <button onClick={() => setShowContact(true)} className="hover:text-zinc-900 transition-colors">Contact Us</button>
              <button onClick={() => setShowPrivacy(true)} className="hover:text-zinc-900 transition-colors">Privacy Policy</button>
              <button onClick={() => setShowTerms(true)} className="hover:text-zinc-900 transition-colors">Terms of Service</button>
            </div>

            <div className="text-xs text-zinc-400">
              © 2026 VoxNova Text to Speech. All rights reserved.
            </div>
          </div>
        </footer>
        

      {/* Legal & Info Modals */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAbout(false)}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white p-8 md:p-12 rounded-[2.5rem] border border-zinc-200 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <button onClick={() => setShowAbout(false)} className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-900"><X size={20} /></button>
              <div className="space-y-6">
                <h2 className="text-3xl font-display font-bold text-zinc-900">About VoxNova Text to Speech</h2>
                <div className="space-y-4 text-zinc-500 leading-relaxed">
                  <p>VoxNova Text to Speech is a cutting-edge AI research lab dedicated to pushing the boundaries of synthetic speech and neural audio generation. Our mission is to democratize high-end cinematic voice production for creators worldwide.</p>
                  <p>Founded by a team of audio engineers and AI researchers, we believe that the future of storytelling is multimodal. By combining advanced deep learning with professional audio standards, we provide tools that were once only available to major film studios.</p>
                  <p>Our platform is built on the latest Gemini 2.5 architecture, optimized for emotional resonance, natural prosody, and crystal-clear studio fidelity.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showContact && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowContact(false)}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white p-8 md:p-12 rounded-[2.5rem] border border-zinc-200 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setShowContact(false)} className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-900"><X size={20} /></button>
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-bold text-zinc-900">Contact Us</h2>
                  <p className="text-zinc-500">Have questions or feedback? We'd love to hear from you.</p>
                </div>

                <div className="space-y-6 text-center py-8">
                  <p className="text-zinc-500">Click the button below to send us an email directly from your email client.</p>
                  <div className="flex items-center justify-center">
                    <a 
                      href="mailto:robotlinkan@gmail.com" 
                      className="flex items-center gap-3 px-8 py-4 bg-zinc-900 rounded-2xl hover:bg-zinc-800 transition-all text-lg font-bold text-white shadow-xl shadow-zinc-900/20"
                    >
                      <Mail size={24} />
                      Send Email to Support
                    </a>
                  </div>
                  <p className="text-xs text-zinc-400">Your default email app will open with our support address.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showPrivacy && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPrivacy(false)}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white p-8 md:p-12 rounded-[2.5rem] border border-zinc-200 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <button onClick={() => setShowPrivacy(false)} className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-900"><X size={20} /></button>
              <div className="space-y-8">
                <h2 className="text-3xl font-display font-bold text-zinc-900">Privacy Policy</h2>
                <div className="space-y-6 text-zinc-500 text-sm leading-relaxed">
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-zinc-900">1. Data Collection</h3>
                    <p>We collect minimal data necessary to provide our AI services. This includes your email address for authentication and the text scripts you provide for voice generation.</p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-zinc-900">2. Audio Data</h3>
                    <p>Generated audio files are stored temporarily to allow you to download them. We do not use your generated audio or input text to train our base models without explicit consent.</p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-zinc-900">3. Third-Party Services</h3>
                    <p>We use Google Firebase for authentication and database services, and Google Gemini API for AI processing. Your data is handled according to their respective privacy policies.</p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-zinc-900">4. Cookies</h3>
                    <p>We use essential cookies to maintain your session and preferences. We do not use tracking cookies for advertising purposes.</p>
                  </section>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showTerms && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowTerms(false)}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white p-8 md:p-12 rounded-[2.5rem] border border-zinc-200 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <button onClick={() => setShowTerms(false)} className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-900"><X size={20} /></button>
              <div className="space-y-8">
                <h2 className="text-3xl font-display font-bold text-zinc-900">Terms of Service</h2>
                <div className="space-y-6 text-zinc-500 text-sm leading-relaxed">
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-zinc-900">1. Acceptable Use</h3>
                    <p>You agree not to use VoxNova Text to Speech to generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable. This includes generating deepfakes for malicious purposes.</p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-zinc-900">2. Intellectual Property</h3>
                    <p>You retain ownership of the text scripts you provide. VoxNova Text to Speech grants you a non-exclusive license to use the generated audio for personal or commercial purposes, provided you comply with these terms.</p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-zinc-900">3. Service Availability</h3>
                    <p>We strive for 100% uptime but do not guarantee uninterrupted service. We reserve the right to modify or discontinue features at any time.</p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-zinc-900">4. Credits & Payments</h3>
                    <p>Credits purchased are non-refundable. Premium features are subject to active subscription status.</p>
                  </section>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Voice Library Modal */}
      <AnimatePresence>
        {showVoiceLibrary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVoiceLibrary(false)}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl max-h-[80vh] bg-white border border-zinc-200 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-display font-bold text-zinc-900">Voice Library</h3>
                  <p className="text-zinc-500 text-sm">Explore and preview professional AI voices.</p>
                </div>
                
                <div className="flex items-center gap-4 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                      type="text"
                      placeholder="Search voices by name..."
                      value={voiceSearchTerm}
                      onChange={(e) => setVoiceSearchTerm(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition-all text-zinc-900"
                    />
                  </div>
                  <button 
                    onClick={() => setShowVoiceLibrary(false)}
                    className="p-2 hover:bg-zinc-100 rounded-full transition-all shrink-0 text-zinc-900"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {VOICES.filter(v => {
                  const matchesSearch = v.name.toLowerCase().includes(voiceSearchTerm.toLowerCase());
                  if (v.id === 'original') {
                    return matchesSearch && activeTab === 'dubbing';
                  }
                  return matchesSearch;
                }).map((voice) => (
                  <div 
                    key={voice.id}
                    className={`p-6 rounded-2xl border transition-all group relative ${selectedVoice.id === voice.id ? 'bg-zinc-50 border-zinc-900' : 'bg-white border-zinc-100 hover:border-zinc-300'}`}
                  >
                    <div 
                      className="absolute inset-0 cursor-pointer z-0"
                      onClick={() => {
                        setSelectedVoice(voice);
                        setShowVoiceLibrary(false);
                      }}
                    />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${voice.color} flex items-center justify-center font-display font-bold text-xl text-white group-hover:scale-110 transition-transform shadow-lg`}>
                        {voice.name[0]}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewVoice(voice);
                          }}
                          disabled={previewingVoiceId === voice.id}
                          className={`p-2 rounded-xl transition-all ${previewingVoiceId === voice.id ? 'bg-emerald-500 text-white' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900'}`}
                        >
                          {previewingVoiceId === voice.id ? <Loader2 className="animate-spin" size={18} /> : <Volume2 size={18} />}
                        </button>
                        {selectedVoice.id === voice.id && (
                          <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-white">
                            <Check size={16} />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="relative z-10">
                      <h4 className="font-bold text-lg mb-1 text-zinc-900">{voice.name}</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 px-2 py-0.5 bg-zinc-100 rounded">{voice.gender}</span>
                        {voice.isPremium && (
                          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded flex items-center gap-1">
                            <Crown size={10} /> Pro
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500 line-clamp-2">{voice.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Configuration Error Modal */}
      <AnimatePresence>
        {showConfigError && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfigError(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={32} className="text-amber-500" />
                </div>
                <h3 className="text-2xl font-display font-bold text-zinc-900 mb-3">Configuration Required</h3>
                <p className="text-zinc-500 mb-8 leading-relaxed">
                  The authentication service is currently being configured. Please ensure your Firebase environment variables are set in the deployment dashboard to enable this feature.
                </p>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowConfigError(false)}
                    className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Settings2 size={18} />
                    Open Dashboard
                  </button>
                  <button 
                    onClick={() => setShowConfigError(false)}
                    className="w-full py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
                  >
                    Dismiss
                  </button>
                </div>
                
                <div className="mt-8 pt-8 border-t border-zinc-100 flex items-center justify-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-zinc-900 transition-colors">
                    Firebase Console <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer / Status */}
      <footer className="fixed bottom-0 left-0 right-0 md:left-64 p-4 border-t border-zinc-100 bg-white/80 backdrop-blur-md flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-[0.2em] z-40">
        <div className="flex items-center gap-4">
        </div>
        <div className="hidden md:block">
          VoxNova Text to Speech &copy; 2026
        </div>
      </footer>

        </main>
      </div>
    )}
  </AnimatePresence>
);
}
