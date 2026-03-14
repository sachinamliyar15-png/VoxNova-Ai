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
  DollarSign,
  LogOut,
  User,
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
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Modality } from "@google/genai";
import { VOICES, Voice, Generation } from './types';
import emailjs from 'emailjs-com';

const AdBox = ({ className = "", label = "" }: { className?: string, label?: string }) => (
  <div className={`glass-panel p-4 rounded-2xl flex flex-col items-center justify-center min-h-[120px] border-dashed border-white/10 bg-white/5 ${className}`}>
    <div className="w-full h-full flex items-center justify-center text-zinc-700 font-display font-bold text-2xl opacity-20">
      {label}
    </div>
  </div>
);

const StickyFooterAd = () => {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-black/90 backdrop-blur-md border-t border-white/10 p-2 flex items-center justify-center animate-in slide-in-from-bottom duration-500">
      <div className="max-w-5xl w-full flex items-center justify-between gap-4 px-4">
        <div className="flex-1 h-14 glass-panel rounded-xl flex items-center justify-center text-zinc-700 font-bold text-lg opacity-20 border-emerald-500/10">
          D
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-1.5 hover:bg-white/10 rounded-full text-zinc-500 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

import { auth, googleProvider, analytics, logEvent } from './firebase';
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

export default function App() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<Voice>(VOICES[0]);
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
    "Analyzing script and context...",
    "Selecting professional voice profile...",
    "Synthesizing high-fidelity audio...",
    "Applying cinematic emotional layers...",
    "Finalizing professional narration..."
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);
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
  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'dubbing' | 'voice-changer'>('generate');
  const [showShareToast, setShowShareToast] = useState(false);
  const [userApiKey, setUserApiKey] = useState<string>(() => localStorage.getItem('voxnova_api_key') || '');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const WHITELISTED_EMAILS = ['sachinamliyar15@gmail.com', 'amliyarsachin248@gmail.com'];
  const isWhitelisted = (email: string | null | undefined) => email ? WHITELISTED_EMAILS.includes(email) : false;

  // Dubbing & Conversion States
  const [isDubbing, setIsDubbing] = useState(false);
  const [dubbingFile, setDubbingFile] = useState<File | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [dubbingMode, setDubbingMode] = useState<'convert' | 'dub'>('convert');
  const [dubbingResult, setDubbingResult] = useState<{ text: string, audioUrl: string } | null>(null);
  const [voiceSearchTerm, setVoiceSearchTerm] = useState('');
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  const handlePreviewVoice = async (voice: Voice) => {
    if (previewingVoiceId) return;
    
    setPreviewingVoiceId(voice.id);
    try {
      const apiKey = userApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key not configured");

      const keys = apiKey.split(',').map(k => k.trim()).filter(k => k.length > 0);
      const activeKey = keys[Math.floor(Math.random() * keys.length)];
      const ai = new GoogleGenAI({ apiKey: activeKey });

      const voiceMapping: Record<string, string> = {
        'Adam': 'Puck', 'Brian': 'Charon', 'Daniel': 'Fenrir', 'Josh': 'Puck',
        'Liam': 'Charon', 'Michael': 'Fenrir', 'Ryan': 'Puck', 'Matthew': 'Charon',
        'Bill': 'Fenrir', 'Callum': 'Puck', 'Frank': 'Zephyr', 'Marcus': 'Charon',
        'Jessica': 'Kore', 'Sarah': 'Zephyr', 'Matilda': 'Kore', 'Emily': 'Zephyr',
        'Bella': 'Kore', 'Rachel': 'Zephyr', 'Nicole': 'Kore', 'Clara': 'Zephyr',
        'Documentary Pro': 'Charon', 'Atlas (Do)': 'Fenrir', 'Virat Best Voice': 'Zephyr'
      };

      const targetVoice = voiceMapping[voice.name] || 'Puck';
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Hello! I am ${voice.name}. I can speak in many languages.` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: targetVoice as any },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const pcmBuffer = base64ToArrayBuffer(base64Audio);
        const resampledPcm = resamplePCM(pcmBuffer, 24000, 44100);
        const wavHeader = createWavHeader(resampledPcm, 44100);
        const combinedBuffer = new Uint8Array(wavHeader.byteLength + resampledPcm.byteLength);
        combinedBuffer.set(new Uint8Array(wavHeader), 0);
        combinedBuffer.set(new Uint8Array(resampledPcm), wavHeader.byteLength);
        const blob = new Blob([combinedBuffer], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => {
          setPreviewingVoiceId(null);
          URL.revokeObjectURL(url);
        };
        audio.play();
      } else {
        setPreviewingVoiceId(null);
      }
    } catch (error) {
      console.error("Preview failed:", error);
      setPreviewingVoiceId(null);
    }
  };

  useEffect(() => {
    if (!auth) {
      setIsAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      if (user) {
        fetchUserProfile(user);
      } else {
        setUserProfile(null);
        setHistory([]);
      }
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
      setUserProfile(data);
      fetchHistory(user);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const handleLogin = async () => {
    if (!auth || !googleProvider) {
      setError("Firebase is not configured. Please add your Firebase environment variables to enable login.");
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (analytics) {
        logEvent(analytics, 'login', {
          method: 'Google',
          user_id: result.user.uid
        });
      }
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed', err);
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
        name: "VoxNova AI",
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
      title: 'VoxNova AI - Professional Voice Generator',
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

  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    // EmailJS logic - Using placeholders for ServiceID, TemplateID, and UserID
    // User will need to configure these in their EmailJS dashboard
    emailjs.send(
      'service_52isgcx', // Your EmailJS Service ID
      'template_id', // Replace with your Template ID
      {
        from_name: contactForm.name,
        from_email: contactForm.email,
        message: contactForm.message,
        to_email: 'robotlinkan@gmail.com'
      },
      'user_id' // Replace with your Public Key (User ID)
    ).then(() => {
      setSendSuccess(true);
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setSendSuccess(false), 5000);
    }).catch((err) => {
      console.error('EmailJS Error:', err);
      setError("Failed to send message. Please try the Google Form or Mailto link.");
    }).finally(() => {
      setIsSending(false);
    });
  };

  const handleGenerate = async () => {
    if (!currentUser) {
      handleLogin();
      return;
    }
    if (!text.trim()) return;

    if (analytics) {
      logEvent(analytics, 'generate_voice_start', {
        voice_name: selectedVoice.name,
        text_length: text.length,
        language: language
      });
    }

    // Calculate credit cost (1 credit per 10 characters)
    const creditCost = Math.ceil(text.length / 10);
    
    // Check for premium voice restriction
    if (selectedVoice.isPremium && (!userProfile || userProfile.plan === 'free') && !isWhitelisted(currentUser.email)) {
      setError(`The voice "${selectedVoice.name}" is a Premium feature. Please upgrade your plan to access high-quality cinematic voices.`);
      setIsPricingModalOpen(true);
      return;
    }

    if (userProfile && userProfile.credits < creditCost && !isWhitelisted(currentUser.email)) {
      setError(`Insufficient credits. You need ${creditCost} credits but only have ${userProfile.credits}.`);
      setIsPricingModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setErrorType(null);
    
    const maxRetries = 3;
    let attempt = 0;

    const generateWithRetry = async (chunkText: string): Promise<string> => {
      let attempt = 0;
      const maxRetries = 8; // Increased retries for rate limits

      while (attempt < maxRetries) {
        try {
          const baseKey = userApiKey || process.env.GEMINI_API_KEY;
          if (!baseKey) {
            throw new Error("Gemini API Key is not configured. Please enter your API key by clicking the 'Key' icon.");
          }

          // Load Balancing: Support multiple keys separated by commas
          const keys = baseKey.split(',').map(k => k.trim()).filter(k => k.length > 0);
          const apiKey = keys[Math.floor(Math.random() * keys.length)];

          const ai = new GoogleGenAI({ apiKey });
          
          const voiceMapping: Record<string, string> = {
            'Adam': 'Puck', 'Brian': 'Charon', 'Daniel': 'Fenrir', 'Josh': 'Puck',
            'Liam': 'Charon', 'Michael': 'Fenrir', 'Ryan': 'Puck', 'Matthew': 'Charon',
            'Bill': 'Fenrir', 'Callum': 'Puck', 'Frank': 'Zephyr', 'Marcus': 'Charon',
            'Jessica': 'Kore', 'Sarah': 'Zephyr', 'Matilda': 'Kore', 'Emily': 'Zephyr',
            'Bella': 'Kore', 'Rachel': 'Zephyr', 'Nicole': 'Kore', 'Clara': 'Zephyr',
            'Documentary Pro': 'Charon', 'Atlas (Do)': 'Fenrir', 'Virat Best Voice': 'Charon'
          };

          const targetVoice = voiceMapping[selectedVoice.name] || 'Puck';
          
          let promptPrefix = `You are an elite, world-class professional voice actor and narrator. Your task is to provide a stunningly realistic, human-like, and emotionally resonant performance in ${language === 'hi' ? 'Hindi' : 'English'}. 
          
          PERFORMANCE GUIDELINES:
          - Use natural human prosody, complex intonation, and realistic rhythm.
          - Incorporate subtle, natural breathing and micro-pauses where appropriate to sound 100% human.
          - Avoid any robotic, monotone, or repetitive cadence.
          - For ${language === 'hi' ? 'Hindi' : 'English'}, ensure perfect native pronunciation, natural flow, and cultural nuance.
          - Sound like a real person speaking in a high-end professional studio, not a computer.
          
          TECHNICAL STANDARDS:
          - NO background noise, hums, or digital artifacts.
          - NO robotic glitches, metallic sounds, or synthetic "buzzing".
          - Ensure crystal-clear, 48kHz studio-quality audio.
          `;
          
          if (studioClarity) {
            promptPrefix += "CRITICAL: Apply professional noise reduction and denoising. Ensure zero background hum, zero robotic artifacts, and zero background music. The audio must be crystal clear and studio-quality. ";
          }
          
          const voiceTraits: Record<string, string> = {
            'Adam': 'Deep, resonant, and authoritative. A professional cinematic voice with a slight gravelly texture.',
            'Brian': 'Calm, steady, and trustworthy. High-fidelity studio quality with a neutral, clear tone.',
            'Daniel': 'Clear, news-like, and highly articulate. Fast-paced broadcast standard.',
            'Josh': 'Young, energetic, and friendly. Natural conversational tone with a slight upward inflection.',
            'Liam': 'Warm, empathetic, and gentle. Soft-spoken storytelling with emotional depth.',
            'Michael': 'Mature, wise, and sophisticated. Slow, deliberate professional narration.',
            'Ryan': 'Casual, upbeat, and conversational. Relatable, authentic, and slightly breathy.',
            'Matthew': 'Deep, cinematic, and dramatic. Movie trailer quality with intense resonance.',
            'Bill': 'Gravelly, experienced, and rugged. Character-rich performance with a rough edge.',
            'Callum': 'Refined, polite, and sophisticated. Elite British-style professional tone.',
            'Frank': 'Natural, balanced, and clear. Perfect for long-form narration with consistent energy.',
            'Marcus': 'Strong, motivational, and powerful. Commanding, inspiring, and loud.',
            'Jessica': 'Clear, bright, and professional. Modern corporate standard with a friendly smile.',
            'Sarah': 'Soft, soothing, and gentle. Ethereal, calm, and very quiet.',
            'Matilda': 'Intelligent, articulate, and formal. Academic precision with a sharp, crisp delivery.',
            'Emily': 'Youthful, cheerful, and friendly. High-energy realism with a bubbly personality.',
            'Bella': 'Elegant, smooth, and professional. Premium quality with a sophisticated, rich texture.',
            'Rachel': 'Dynamic, expressive, and clear. Versatile performance with wide emotional range.',
            'Nicole': 'Direct, confident, and professional. Business standard with a firm, no-nonsense tone.',
            'Clara': 'Kind, helpful, and natural. Approachable realism with a warm, motherly feel.',
            'Documentary Pro': 'The ultimate documentary narrator. Deep, mature, cinematic, and incredibly intelligent.',
            'Virat Best Voice': 'Extremely powerful, deep, and authoritative masculine voice. Thick, resonant, and commanding. Professional documentary standard.'
          };

          promptPrefix += `${voiceTraits[selectedVoice.name] || ''} `;

          if (style === 'documentary' || style === 'doc-pro' || selectedVoice.name === 'Documentary Pro') {
            promptPrefix = `You are a world-class cinematic documentary narrator. Your voice is deep, mature, intelligent, and authoritative, similar to National Geographic or Discovery Channel. 
            
            CRITICAL INSTRUCTIONS FOR THIS PERFORMANCE:
            1. BASE TONE: Calm, deep, and controlled storytelling with perfect ${language === 'hi' ? 'Hindi' : 'English'} native pronunciation.
            2. EMOTIONAL MODULATION: 
               - For normal parts: Calm, steady, and informative.
               - For suspense: Slow down slightly, add dramatic pauses, and sound mysterious.
               - For intense/war parts: Sound stronger, brave, and commanding.
               - For emotional parts: Sound warm, respectful, and inspiring.
               - For big reveals: Pause briefly before the sentence, then speak slower and deeper for impact.
            3. DELIVERY: Natural storytelling flow, NOT robotic. Use human-like pauses, subtle breathing, and natural emphasis.
            4. PACING: Medium pace generally, but slow down for dramatic effect.
            5. QUALITY: Studio-grade, clean audio. NO background noise or glitches.
            
            This is a high-end cinematic production. Deliver a performance that sounds like a real human narrator.`;
          } else if (style === 'emotional') {
            promptPrefix += `Use a voice filled with deep feeling, expression, and appropriate pauses to convey profound emotion. `;
          } else if (style === 'storytelling') {
            promptPrefix += `Use a rhythmic, engaging, and warm tone to bring the narrative to life. `;
          } else if (style === 'motivational') {
            promptPrefix += `Use a strong, inspiring, and energetic tone to uplift and empower the audience. `;
          }

          // Granular pitch control
          if (pitch > 1.3) promptPrefix += "Use a very high, bright, and sharp pitch. ";
          else if (pitch > 1.1) promptPrefix += "Use a slightly higher, more youthful and energetic pitch. ";
          else if (pitch < 0.7) promptPrefix += "Use a very deep, bassy, and low-frequency pitch. ";
          else if (pitch < 0.9) promptPrefix += "Use a slightly deeper, more mature and resonant pitch. ";

          // Granular speed control
          promptPrefix += `CRITICAL: Speak at exactly ${speed}x speed. `;
          if (speed > 1.5) promptPrefix += "Speak at a very fast, rapid-fire pace. ";
          else if (speed > 1.1) promptPrefix += "Speak at a brisk, energetic pace. ";
          else if (speed < 0.7) promptPrefix += "Speak at a very slow, drawn-out, and deliberate pace. ";
          else if (speed < 0.9) promptPrefix += "Speak at a slightly slower, more measured pace. ";
          else promptPrefix += "Speak at a natural, medium pace. ";
          
          // Add pause gap instructions
          if (pause > 0.1) {
            promptPrefix += `Add a natural pause of approximately ${pause} seconds between sentences and major phrases to ensure clarity and professional pacing. `;
          }
          
          const finalPrompt = `${promptPrefix}\n\nSCRIPT TO PERFORM:\n${chunkText}`;

          let currentPrompt = finalPrompt;
          if (attempt > 0) {
            // On retries, keep the high-quality instructions but emphasize realism even more
            currentPrompt = `CRITICAL: The previous attempt sounded slightly robotic. Please deliver a MORE HUMAN, MORE REALISTIC performance for this script in ${language === 'hi' ? 'Hindi' : 'English'}. Use natural breathing and prosody:\n\n${chunkText}`;
          }

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: currentPrompt }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: targetVoice },
                },
              },
            },
          });

          const candidate = response.candidates?.[0];
          const base64 = candidate?.content?.parts?.[0]?.inlineData?.data;
          
          if (!base64) {
            if (candidate?.finishReason === 'SAFETY') {
              throw new Error("The generation was blocked by safety filters. Please check your script for sensitive content.");
            }
            if (candidate?.finishReason === 'RECITATION') {
              throw new Error("The generation was blocked due to recitation filters (copyrighted content).");
            }
            if (candidate?.finishReason === 'OTHER' || !candidate) {
              throw new Error("AI model failed to generate audio data. Try shortening your text or checking for special characters.");
            }
            throw new Error("AI model failed to generate audio data. Please try again with a simpler script.");
          }
          return base64;

        } catch (err: any) {
          attempt++;
          const errStr = err.message || JSON.stringify(err);
          const isNetworkError = errStr.includes("Rpc failed") || errStr.includes("xhr error") || errStr.includes("fetch");
          const isGenerationError = errStr.includes("failed to generate audio data");
          const isRateLimit = errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota");
          const isInternalError = errStr.includes("500") || errStr.includes("INTERNAL") || errStr.includes("Internal error");
          
          if ((isNetworkError || isGenerationError || isRateLimit || isInternalError) && attempt < maxRetries) {
            // Exponential backoff with jitter
            // Use much longer delay for rate limits (429)
            const baseDelay = isRateLimit ? 10000 : (isInternalError ? 5000 : 1000);
            const delay = Math.pow(2, attempt) * baseDelay + Math.random() * 2000;
            
            console.warn(`Attempt ${attempt} failed for chunk. Retrying in ${Math.round(delay)}ms...`, err);
            
            if (isRateLimit) {
              setError(`Rate limit reached. Waiting ${Math.round(delay/1000)}s before retrying part ${attempt + 1}...`);
              setErrorType('rate-limit');
            }
            
            await new Promise(resolve => setTimeout(resolve, delay));
            if (isRateLimit) setError(null);
            continue;
          }
          throw err;
        }
      }
      throw new Error("Maximum retry attempts reached. Please try again later.");
    };

    try {
      // 1. Split text into chunks for long-form stability
      const chunks = splitTextIntoChunks(text, 700); // Slightly smaller chunks for better reliability
      
      // Limit parallel requests to avoid hitting rate limits too hard
      // Using 1 for maximum safety with free tier quotas
      const CONCURRENCY_LIMIT = 1;
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
        const token = await currentUser!.getIdToken();
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
        
        fetchHistory();
        fetchUserProfile(currentUser!);
      } catch (saveErr: any) {
        console.error("Failed to save to history:", saveErr);
        setError(`Saved locally, but failed to sync: ${saveErr.message}`);
      }
    } catch (err: any) {
      console.error('Generation failed', err);
      const errStr = err.message || JSON.stringify(err);
      if (errStr.includes("API key not valid")) {
        setError("Invalid API Key: Please check your API key settings.");
        setErrorType('auth');
        setHasApiKey(false);
      } else if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota")) {
        setError("Our AI servers are currently at capacity due to high demand. Please try again in a few minutes.");
        setErrorType('rate-limit');
      } else if (errStr.includes("500") || errStr.includes("INTERNAL")) {
        setError("The AI server is temporarily unavailable. We're working to restore it. Please try again shortly.");
        setErrorType('general');
      } else if (errStr.includes("Rpc failed") || errStr.includes("xhr error")) {
        setError("Network connection lost. Please check your internet and try again.");
        setErrorType('network');
      } else {
        setError("Something went wrong while generating your voice. Please try again later.");
        setErrorType('general');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const [dubbingStep, setDubbingStep] = useState<string>('');
  const [dubbingProgress, setDubbingProgress] = useState(0);

  const handleDubbing = async () => {
    if (!dubbingFile) {
      setError("Please upload an audio file first.");
      return;
    }

    if (dubbingFile.size > 20 * 1024 * 1024) {
      setError("File size too large. Please upload a file smaller than 20MB.");
      return;
    }

    if (!currentUser) {
      setError("Please login to use this feature.");
      setErrorType('auth');
      return;
    }

    const dubbingCost = 5;
    if (userProfile && userProfile.credits < dubbingCost && !isWhitelisted(currentUser.email)) {
      setError(`Insufficient credits. You need ${dubbingCost} credits for dubbing/conversion.`);
      setErrorType('general');
      setIsPricingModalOpen(true);
      return;
    }

    if (analytics) {
      logEvent(analytics, dubbingMode === 'dub' ? 'dubbing_start' : 'voice_changer_start', {
        target_language: targetLanguage,
        voice_name: selectedVoice.name
      });
    }

    setIsDubbing(true);
    setError(null);
    setErrorType(null);
    setDubbingResult(null);
    setDubbingProgress(5);
    setDubbingStep("Reading file...");

    try {
      const apiKey = userApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key not configured. Please add your key in API Settings.");

      const keys = apiKey.split(',').map(k => k.trim()).filter(k => k.length > 0);
      const activeKey = keys[Math.floor(Math.random() * keys.length)];
      const ai = new GoogleGenAI({ apiKey: activeKey });

      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(dubbingFile);
      });
      const fileBase64 = await base64Promise;

      setDubbingProgress(20);
      setDubbingStep(dubbingMode === 'dub' ? "Transcribing & Translating..." : "Transcribing audio...");

      const langMap: Record<string, string> = {
        'hi': 'Hindi', 'bn': 'Bengali', 'mr': 'Marathi', 'te': 'Telugu', 
        'ta': 'Tamil', 'gu': 'Gujarati', 'kn': 'Kannada', 'en': 'English',
        'es': 'Spanish', 'fr': 'French', 'de': 'German', 'ja': 'Japanese',
        'ko': 'Korean', 'zh': 'Chinese'
      };

      const targetLangName = langMap[targetLanguage] || 'English';

      const prompt = dubbingMode === 'dub' 
        ? `You are an expert translator. Transcribe the attached audio and translate it into ${targetLangName}. 
           Maintain the original tone, emotion, and context. 
           Return ONLY the translated text. Do not include any notes, explanations, or labels like "Translation:".`
        : `Transcribe the attached audio exactly as it is spoken. 
           Return ONLY the transcribed text. Do not include any notes, explanations, or speaker labels.`;

      console.log("Starting transcription with model: gemini-3-flash-preview");
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          parts: [
            { inlineData: { data: fileBase64, mimeType: dubbingFile.type } },
            { text: prompt }
          ]
        }]
      });

      const processedText = result.text;
      console.log("Transcription result:", processedText);
      
      if (!processedText || processedText.trim().length === 0) {
        throw new Error("The AI could not hear any speech in the audio. Please try a clearer recording.");
      }

      setDubbingProgress(60);
      setDubbingStep("Generating new voice...");

      const voiceMapping: Record<string, string> = {
        'Adam': 'Puck', 'Brian': 'Charon', 'Daniel': 'Fenrir', 'Josh': 'Puck',
        'Liam': 'Charon', 'Michael': 'Fenrir', 'Ryan': 'Puck', 'Matthew': 'Charon',
        'Bill': 'Fenrir', 'Callum': 'Puck', 'Frank': 'Zephyr', 'Marcus': 'Charon',
        'Jessica': 'Kore', 'Sarah': 'Zephyr', 'Matilda': 'Kore', 'Emily': 'Zephyr',
        'Bella': 'Kore', 'Rachel': 'Zephyr', 'Nicole': 'Kore', 'Clara': 'Zephyr',
        'Documentary Pro': 'Charon', 'Atlas (Do)': 'Fenrir', 'Virat Best Voice': 'Zephyr'
      };

      const targetVoice = voiceMapping[selectedVoice.name] || 'Puck';
      
      console.log(`Generating TTS with voice: ${targetVoice}`);
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: processedText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: targetVoice as any },
            },
          },
        },
      });

      const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("Voice generation failed. The text might be too complex or the service is temporarily unavailable.");

      setDubbingProgress(90);
      setDubbingStep("Finalizing audio...");

      const pcmBuffer = base64ToArrayBuffer(base64Audio);
      const resampledPcm = resamplePCM(pcmBuffer, 24000, targetSampleRate);
      
      const wavHeader = createWavHeader(resampledPcm, targetSampleRate);
      const combinedBuffer = new Uint8Array(wavHeader.byteLength + resampledPcm.byteLength);
      combinedBuffer.set(new Uint8Array(wavHeader), 0);
      combinedBuffer.set(new Uint8Array(resampledPcm), wavHeader.byteLength);
      const finalBlob = new Blob([combinedBuffer], { type: 'audio/wav' });

      const audioUrl = URL.createObjectURL(finalBlob);
      setDubbingResult({ text: processedText, audioUrl });
      setDubbingProgress(100);
      setDubbingStep("Complete!");

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.error("Auto-play failed:", e));
        }
      }, 100);

      if (analytics) {
        logEvent(analytics, dubbingMode === 'dub' ? 'dubbing_success' : 'voice_changer_success', {
          target_language: targetLanguage,
          voice_name: selectedVoice.name
        });
      }

      // Calculate duration and credit cost (700 credits per minute)
      const durationInSeconds = (pcmBuffer.byteLength / 2) / 24000;
      const creditCost = Math.max(1, Math.ceil((durationInSeconds / 60) * 700));

      // Save to history
      try {
        const token = await currentUser!.getIdToken();
        await fetch('/api/save', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            text: processedText,
            voice: selectedVoice.name,
            style: dubbingMode === 'dub' ? 'dubbing' : 'voice-changer',
            speed: 1.0,
            audioData: base64Audio,
            creditCost: creditCost
          })
        });
        fetchHistory();
      } catch (e) {
        console.warn("Failed to save dubbing to history", e);
      }

    } catch (err: any) {
      console.error("Dubbing failed:", err);
      const errStr = err.message || JSON.stringify(err);
      
      if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota")) {
        setError("Our AI servers are currently at capacity. Please try again in a few minutes.");
        setErrorType('rate-limit');
      } else if (errStr.includes("500") || errStr.includes("INTERNAL")) {
        setError("The AI server is temporarily busy. Please try again shortly.");
        setErrorType('general');
      } else if (errStr.includes("Rpc failed") || errStr.includes("xhr error")) {
        setError("Network connection lost. Please check your internet and try again.");
        setErrorType('network');
      } else {
        setError(`Processing failed: ${err.message || "An unexpected error occurred."}`);
        setErrorType('general');
      }
    } finally {
      setIsDubbing(false);
    }
  };

  const deleteHistoryItem = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this generation from your history?")) return;
    try {
      const token = await currentUser!.getIdToken();
      const res = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete history item:", err);
    }
  };

  const playFromHistory = (audioData: string, id: number) => {
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
        setError("This audio was too large to be stored in history. Please generate it again.");
        return;
      }

      const pcmBuffer = base64ToArrayBuffer(audioData);
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
      
      const audioUrl = URL.createObjectURL(finalBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setPlayingId(id);

      audio.onended = () => {
        setPlayingId(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.play().catch(e => {
        console.error("History playback failed:", e);
        setError("Playback failed. Your browser might be blocking auto-play or the audio format is unsupported.");
        setPlayingId(null);
      });
    } catch (err: any) {
      console.error("Error playing from history:", err);
      setError("Failed to process audio for playback.");
      setPlayingId(null);
    }
  };

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

  const handleDeleteHistory = async (id: number) => {
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
      fetchHistory();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0f1115] text-zinc-100 relative overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0f1115] z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Mic className="text-black w-5 h-5" />
          </div>
          <h1 className="text-lg font-display font-bold tracking-tight">VoxNova</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-zinc-400 hover:text-white"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Background Mesh Gradient for Professional Look */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#0f1115] border-r border-white/10 p-6 flex flex-col gap-8 transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="hidden md:flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <Mic className="text-black w-6 h-6" />
          </div>
          <h1 className="text-xl font-display font-bold tracking-tight">VoxNova</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => { setActiveTab('generate'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'generate' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            <Sparkles size={20} />
            Text to Speech Voice
          </button>
          <button 
            onClick={() => { setActiveTab('history'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            <History size={20} />
            History
          </button>
          <button 
            onClick={() => { setActiveTab('dubbing'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dubbing' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            <LangIcon size={20} />
            AI Dubbing
          </button>
          <button 
            onClick={() => { setActiveTab('voice-changer'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'voice-changer' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            <RefreshCw size={20} />
            Voice Changer
          </button>
          <button 
            onClick={() => { setShowVoiceLibrary(true); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Library size={20} />
            Voice Library
          </button>
          <button 
            onClick={() => { handleShare(); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Share2 size={20} />
            Share App
          </button>
          <button 
            onClick={() => { setIsPricingModalOpen(true); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-yellow-400 hover:text-white hover:bg-yellow-500/10 transition-all border border-yellow-500/20"
          >
            <Crown size={20} />
            Premium Plans
          </button>
        </nav>

        <div className="mt-auto p-4 glass-panel rounded-2xl">
          {currentUser ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={currentUser.photoURL || ''} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{currentUser.displayName}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                    {isWhitelisted(currentUser.email) ? 'Owner' : (userProfile?.plan || 'Free')} Plan
                  </p>
                </div>
                <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
              <div className="pt-3 border-t border-white/5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Credits</span>
                  <span className="text-xs font-mono text-emerald-400">
                    {isWhitelisted(currentUser.email) ? 'Unlimited' : (userProfile?.credits?.toLocaleString() || 0)}
                  </span>
                </div>
                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
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
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-all"
            >
              <User size={18} />
              Login with Google
            </button>
          )}
        </div>

        <div className="mt-4 p-4 glass-panel rounded-2xl">
          <p className="text-xs text-zinc-500 mb-2">Current Voice</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">
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

      {/* Share Toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-emerald-500 text-white rounded-full shadow-2xl flex items-center gap-2 font-medium"
          >
            <Check size={18} />
            Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing Modal */}
      <AnimatePresence>
        {isPricingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 space-y-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-3xl font-display font-bold">Premium Plans</h3>
                  <p className="text-zinc-500">Choose the plan that fits your creative needs.</p>
                </div>
                <button onClick={() => setIsPricingModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Free Plan */}
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-6 flex flex-col">
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold">Free</h4>
                    <div className="text-3xl font-display font-bold">₹0<span className="text-sm text-zinc-500">/mo</span></div>
                  </div>
                  <ul className="text-xs text-zinc-400 space-y-3 flex-1">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 20,000 Credits/mo</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Standard Voices</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Monthly Reset</li>
                  </ul>
                  <button disabled className="w-full py-3 rounded-xl bg-zinc-800 text-zinc-500 font-bold text-sm">Current Plan</button>
                </div>

                {/* Basic Plan */}
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-6 flex flex-col">
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold">Basic</h4>
                    <div className="text-3xl font-display font-bold">₹100</div>
                  </div>
                  <ul className="text-xs text-zinc-400 space-y-3 flex-1">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 6,000 Credits</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> High Quality Voices</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> No Expiry</li>
                  </ul>
                  <button onClick={() => purchaseCredits('basic', 6000)} className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all">Buy Now</button>
                </div>

                {/* Pro Plan */}
                <div className="p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 space-y-6 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[8px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">Best Value</div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold">Pro</h4>
                    <div className="text-3xl font-display font-bold">₹200</div>
                  </div>
                  <ul className="text-xs text-zinc-400 space-y-3 flex-1">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 15,000 Credits</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> High Quality Voices</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Priority Support</li>
                  </ul>
                  <button onClick={() => purchaseCredits('pro', 15000)} className="w-full py-3 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-all">Buy Now</button>
                </div>

                {/* Advanced Plan */}
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-6 flex flex-col">
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold">Advanced</h4>
                    <div className="text-3xl font-display font-bold">₹400</div>
                  </div>
                  <ul className="text-xs text-zinc-400 space-y-3 flex-1">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 30,000 Credits</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> All Premium Features</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Priority Support</li>
                  </ul>
                  <button onClick={() => purchaseCredits('advanced', 30000)} className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all">Buy Now</button>
                </div>

                {/* Ultra Plan */}
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-6 flex flex-col">
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold">Ultra</h4>
                    <div className="text-3xl font-display font-bold">₹500</div>
                  </div>
                  <ul className="text-xs text-zinc-400 space-y-3 flex-1">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 40,000 Credits</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> All Premium Features</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Custom Voice Profiles</li>
                  </ul>
                  <button onClick={() => purchaseCredits('ultra', 40000)} className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all">Buy Now</button>
                </div>
              </div>

              <div className="p-6 bg-white/5 rounded-3xl text-center space-y-4">
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">Secure Payments via Razorpay</p>
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
                <p className="text-[10px] text-zinc-600">
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
                   <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-xl p-1">
                      <button 
                        onClick={() => setStudioClarity(!studioClarity)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${studioClarity ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-500 border border-transparent'}`}
                      >
                        <Sparkles size={14} />
                        Studio Clarity
                      </button>
                   </div>
                   <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-xl p-1">
                      <button 
                        onClick={() => setLanguage('en')}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${language === 'en' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}
                      >
                        English
                      </button>
                      <button 
                        onClick={() => setLanguage('hi')}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${language === 'hi' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}
                      >
                        Hindi
                      </button>
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter your script here... (up to 10,000 characters)"
                    maxLength={10000}
                    className="w-full h-64 bg-zinc-900/50 border border-white/10 rounded-2xl p-6 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-700"
                  />
                  <div className="absolute bottom-4 right-6 text-xs text-zinc-600 flex items-center gap-4">
                    <button 
                      onClick={() => setText('')}
                      className="hover:text-white transition-colors"
                    >
                      Clear Text
                    </button>
                    <span>{text.length} / 10,000 characters</span>
                  </div>
                </div>

                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>{loadingMessages[loadingStep]}</span>
                      <span>{generationProgress}%</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
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
                        <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
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
                      <option value="normal" className="bg-zinc-900">Normal</option>
                      <option value="documentary" className="bg-zinc-900">Documentary</option>
                      <option value="doc-pro" className="bg-zinc-900">Professional Documentary</option>
                      <option value="emotional" className="bg-zinc-900">Emotional</option>
                      <option value="storytelling" className="bg-zinc-900">Storytelling</option>
                      <option value="motivational" className="bg-zinc-900">Motivational</option>
                    </select>
                  </div>

                  <div className="glass-panel p-4 rounded-2xl space-y-3">
                    <label className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Settings2 size={14} /> Controls
                    </label>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-zinc-500">
                          <span>Speed</span>
                          <span>{speed}x</span>
                        </div>
                        <div className="flex gap-2 mb-2">
                          <button 
                            onClick={() => setSpeed(0.7)}
                            className={`flex-1 py-1 rounded-md text-[10px] border ${speed === 0.7 ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                          >
                            Slow
                          </button>
                          <button 
                            onClick={() => setSpeed(1.0)}
                            className={`flex-1 py-1 rounded-md text-[10px] border ${speed === 1.0 ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                          >
                            Normal
                          </button>
                          <button 
                            onClick={() => setSpeed(1.4)}
                            className={`flex-1 py-1 rounded-md text-[10px] border ${speed === 1.4 ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                          >
                            Fast
                          </button>
                        </div>
                        <input 
                          type="range" min="0.5" max="2" step="0.1" 
                          value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
                          className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
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
                          className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
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
                          className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1 pt-2 border-t border-white/5">
                        <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                          <span>Output Format</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setAudioFormat('wav')}
                            className={`flex-1 py-1 rounded-md text-[10px] border ${audioFormat === 'wav' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                          >
                            WAV
                          </button>
                          <button 
                            onClick={() => setAudioFormat('mp3')}
                            className={`flex-1 py-1 rounded-md text-[10px] border ${audioFormat === 'mp3' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-zinc-500 hover:text-zinc-300'}`}
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
                            className={`flex-1 py-1 rounded-md text-[8px] border ${targetSampleRate === 24000 ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                          >
                            24kHz
                          </button>
                          <button 
                            onClick={() => setTargetSampleRate(44100)}
                            className={`flex-1 py-1 rounded-md text-[8px] border ${targetSampleRate === 44100 ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                          >
                            44.1kHz
                          </button>
                          <button 
                            onClick={() => setTargetSampleRate(48000)}
                            className={`flex-1 py-1 rounded-md text-[8px] border ${targetSampleRate === 48000 ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-zinc-500 hover:text-zinc-300'}`}
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

                <AdBox className="mt-16" label="A" />


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
              </div>
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
                <h2 className="text-3xl font-display font-bold">AI Dubbing</h2>
                <p className="text-zinc-400">Translate and dub your audio into different languages with professional AI voices.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-[2.5rem] space-y-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">1. Upload File</label>
                    <div 
                      onClick={() => document.getElementById('audio-upload')?.click()}
                      className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${dubbingFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}
                    >
                      <input 
                        type="file" id="audio-upload" hidden accept="audio/*,video/*" 
                        onChange={(e) => {
                          setDubbingFile(e.target.files?.[0] || null);
                          setDubbingResult(null);
                        }}
                      />
                      {dubbingFile ? (
                        <>
                          <div className="p-4 bg-emerald-500/20 rounded-2xl text-emerald-400">
                            <Music size={32} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-emerald-400">{dubbingFile.name}</p>
                            <p className="text-xs text-zinc-500">{(dubbingFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = URL.createObjectURL(dubbingFile);
                              const audio = new Audio(url);
                              audio.play();
                            }}
                            className="mt-2 px-4 py-1 bg-white/10 rounded-full text-[10px] hover:bg-white/20 transition-all flex items-center gap-2"
                          >
                            <Play size={10} /> Preview Upload
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="p-4 bg-white/5 rounded-2xl text-zinc-500">
                            <Upload size={32} />
                          </div>
                          <p className="text-sm text-zinc-500">Click to upload</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">2. Target Language</label>
                    <select 
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-white/20"
                    >
                      <option value="hi" className="bg-zinc-900">Hindi</option>
                      <option value="bn" className="bg-zinc-900">Bengali</option>
                      <option value="mr" className="bg-zinc-900">Marathi</option>
                      <option value="te" className="bg-zinc-900">Telugu</option>
                      <option value="ta" className="bg-zinc-900">Tamil</option>
                      <option value="gu" className="bg-zinc-900">Gujarati</option>
                      <option value="kn" className="bg-zinc-900">Kannada</option>
                      <option value="en" className="bg-zinc-900">English</option>
                      <option value="es" className="bg-zinc-900">Spanish</option>
                      <option value="fr" className="bg-zinc-900">French</option>
                    </select>
                  </div>
                </div>

                <div className="glass-panel p-8 rounded-[2.5rem] space-y-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">3. Select Voice</label>
                    <div 
                      onClick={() => setShowVoiceLibrary(true)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">
                          {selectedVoice.name[0]}
                        </div>
                        <span className="text-sm font-medium">{selectedVoice.name}</span>
                      </div>
                      <ChevronDown size={16} className="text-zinc-500" />
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!dubbingFile) {
                        setError("Please upload an audio or video file first to start dubbing.");
                        return;
                      }
                      handleDubbing();
                    }}
                    disabled={isDubbing}
                    className={`w-full py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${isDubbing ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : !dubbingFile ? 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-400' : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20'}`}
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
                        <LangIcon size={24} />
                        Start Dubbing
                      </>
                    )}
                  </button>

                  {isDubbing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>{dubbingStep}</span>
                        <span>{dubbingProgress}%</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
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
                  className="glass-panel p-8 rounded-[2.5rem] border-emerald-500/20 bg-emerald-500/5 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Sparkles className="text-emerald-400" /> Result
                    </h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = dubbingResult.audioUrl;
                          a.download = `dubbed-${Date.now()}.wav`;
                          a.click();
                        }}
                        className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-black/20 rounded-2xl">
                    <p className="text-sm text-zinc-400 italic mb-4">"{dubbingResult.text}"</p>
                    <audio src={dubbingResult.audioUrl} controls className="w-full h-10 accent-emerald-500" />
                  </div>
                </motion.div>
              )}

              <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-400" /> How it works
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Our AI will analyze your uploaded audio, transcribe the content, and then re-generate it using your selected target voice. For dubbing, it will also translate the content into your chosen language while maintaining the original meaning.
                </p>
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
                <h2 className="text-3xl font-display font-bold">Voice Changer</h2>
                <p className="text-zinc-400">Transform your voice into any of our professional AI characters while maintaining emotion and tone.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-[2.5rem] space-y-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">1. Upload File</label>
                    <div 
                      onClick={() => document.getElementById('audio-upload-vc')?.click()}
                      className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${dubbingFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}
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
                          <div className="p-4 bg-emerald-500/20 rounded-2xl text-emerald-400">
                            <Music size={32} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-emerald-400">{dubbingFile.name}</p>
                            <p className="text-xs text-zinc-500">{(dubbingFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-4 bg-white/5 rounded-2xl text-zinc-500">
                            <Upload size={32} />
                          </div>
                          <p className="text-sm text-zinc-500">Click to upload</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-8 rounded-[2.5rem] space-y-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">2. Select Target Voice</label>
                    <div 
                      onClick={() => setShowVoiceLibrary(true)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">
                          {selectedVoice.name[0]}
                        </div>
                        <span className="text-sm font-medium">{selectedVoice.name}</span>
                      </div>
                      <ChevronDown size={16} className="text-zinc-500" />
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
                    className={`w-full py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${isDubbing ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : !dubbingFile ? 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-400' : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20'}`}
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
                      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
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
                  className="glass-panel p-8 rounded-[2.5rem] border-emerald-500/20 bg-emerald-500/5 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Sparkles className="text-emerald-400" /> Result
                    </h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = dubbingResult.audioUrl;
                          a.download = `voice-change-${Date.now()}.wav`;
                          a.click();
                        }}
                        className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                  </div>

                  {dubbingResult.text && (
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-sm text-zinc-400 leading-relaxed italic">
                        "{dubbingResult.text}"
                      </p>
                    </div>
                  )}
                  
                  <div className="p-4 bg-black/20 rounded-2xl">
                    <audio src={dubbingResult.audioUrl} controls className="w-full h-10 accent-emerald-500" />
                  </div>
                </motion.div>
              )}
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
                <h2 className="text-3xl font-display font-bold">Generation History</h2>
                <p className="text-zinc-400">Access and download your previously generated audio files.</p>
              </div>

              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-20 glass-panel rounded-3xl border-dashed">
                    <History size={48} className="mx-auto text-zinc-700 mb-4" />
                    <p className="text-zinc-500">No generations yet. Start by creating some audio!</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold uppercase tracking-wider">{item.voice_name}</span>
                          <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-zinc-500 uppercase tracking-wider">{item.style}</span>
                          <span className="text-[10px] text-zinc-600">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-zinc-300 line-clamp-2 italic">"{item.text}"</p>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => playFromHistory(item.audio_data, item.id)}
                          className={`p-3 rounded-xl transition-all ${playingId === item.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}`}
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
                          onClick={() => downloadAudio(item.audio_data, `voice-${item.id}`)}
                          className="p-3 hover:bg-white/5 rounded-xl transition-all text-zinc-400 hover:text-white"
                        >
                          <Download size={20} />
                        </button>
                        <button 
                          onClick={() => handleDeleteHistory(item.id)}
                          className="p-3 hover:bg-red-500/10 rounded-xl transition-all text-zinc-600 hover:text-red-400"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AdBox label="B" />
            <AdBox label="C" />
          </div>
        </div>

        {/* SEO Content Section */}
        <section className="max-w-4xl mx-auto py-16 px-6 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-display font-bold text-white">Why Choose VoxNova AI?</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">VoxNova is the world's most advanced AI voice generation platform, designed for creators, filmmakers, and storytellers who demand cinematic quality.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl space-y-4 border-white/5 hover:border-emerald-500/20 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold">Ultra-Realistic Voices</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Our neural networks are trained on thousands of hours of professional studio recordings to capture the subtle nuances of human speech, including breath, rhythm, and emotion.</p>
            </div>

            <div className="glass-panel p-8 rounded-3xl space-y-4 border-white/5 hover:border-emerald-500/20 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold">Multilingual Support</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Generate high-quality voiceovers in English and Hindi with perfect native accents. Our AI understands cultural nuances and provides localized performances for global audiences.</p>
            </div>

            <div className="glass-panel p-8 rounded-3xl space-y-4 border-white/5 hover:border-emerald-500/20 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Mic size={24} />
              </div>
              <h3 className="text-xl font-bold">Cinematic Narration</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">From deep movie trailer voices to calm documentary narrators, VoxNova provides the perfect tone for any project. Use our advanced style controls to fine-tune the performance.</p>
            </div>
          </div>

          <div className="glass-panel p-10 rounded-[3rem] border-white/5 bg-white/2 space-y-6">
            <h3 className="text-2xl font-bold text-center">Professional Grade AI Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h4 className="font-bold text-emerald-400">AI Voice Cloning</h4>
                <p className="text-sm text-zinc-500">Clone any voice with just a few seconds of audio. Perfect for maintaining consistency across long-running series or dubbing content into multiple languages while keeping the original actor's essence.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-emerald-400">Advanced Style Modulation</h4>
                <p className="text-sm text-zinc-500">Go beyond simple pitch and speed. Our AI allows you to control the emotional intensity, gravitas, and storytelling style of every generation, giving you full creative control.</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-3xl font-display font-bold text-center">How VoxNova Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: '01', title: 'Input Text', desc: 'Paste your script into our advanced editor. We support long-form content up to 10,000 characters.' },
                { step: '02', title: 'Select Voice', desc: 'Browse our library of 20+ professional AI voices, each with unique traits and characteristics.' },
                { step: '03', title: 'Fine-Tune', desc: 'Adjust pitch, speed, and emotional style to get the perfect performance for your project.' },
                { step: '04', title: 'Generate', desc: 'Our neural engines process your request in seconds, delivering studio-quality 48kHz audio.' }
              ].map((item, i) => (
                <div key={i} className="p-6 space-y-3">
                  <div className="text-4xl font-display font-bold text-emerald-500/20">{item.step}</div>
                  <h4 className="font-bold">{item.title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-6xl mx-auto py-12 px-6 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Mic className="text-white" size={18} />
              </div>
              <span className="text-xl font-display font-bold tracking-tighter">VOXNOVA</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
              <button onClick={() => setShowAbout(true)} className="hover:text-white transition-colors">About Us</button>
              <button onClick={() => setShowContact(true)} className="hover:text-white transition-colors">Contact Us</button>
              <button onClick={() => setShowPrivacy(true)} className="hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={() => setShowTerms(true)} className="hover:text-white transition-colors">Terms of Service</button>
            </div>

            <div className="text-xs text-zinc-600">
              © 2026 VoxNova AI. All rights reserved.
            </div>
          </div>
        </footer>
      </main>

      <StickyFooterAd />

      {/* Legal & Info Modals */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAbout(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl glass-panel p-8 md:p-12 rounded-[2.5rem] border-white/10 max-h-[80vh] overflow-y-auto"
            >
              <button onClick={() => setShowAbout(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
              <div className="space-y-6">
                <h2 className="text-3xl font-display font-bold">About VoxNova</h2>
                <div className="space-y-4 text-zinc-400 leading-relaxed">
                  <p>VoxNova is a cutting-edge AI research lab dedicated to pushing the boundaries of synthetic speech and neural audio generation. Our mission is to democratize high-end cinematic voice production for creators worldwide.</p>
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl glass-panel p-8 md:p-12 rounded-[2.5rem] border-white/10 max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setShowContact(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-bold">Contact Us</h2>
                  <p className="text-zinc-400">Have questions or feedback? We'd love to hear from you.</p>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-500 uppercase tracking-widest">Name</label>
                      <input 
                        required
                        type="text" 
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 transition-all"
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-500 uppercase tracking-widest">Email</label>
                      <input 
                        required
                        type="email" 
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 transition-all"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase tracking-widest">Message</label>
                    <textarea 
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <button 
                    disabled={isSending}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    {isSending ? <Loader2 className="animate-spin" /> : 'Send Message'}
                  </button>
                  {sendSuccess && (
                    <p className="text-center text-emerald-400 text-sm font-bold animate-bounce">Message sent successfully!</p>
                  )}
                </form>

                <div className="pt-8 border-t border-white/5 space-y-4">
                  <p className="text-sm text-zinc-500 text-center">Alternatively, you can reach us via:</p>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <a href="mailto:robotlinkan@gmail.com" className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full hover:bg-white/10 transition-all text-sm">
                      <HelpCircle size={16} /> Direct Email
                    </a>
                    <a href="https://forms.gle/your-google-form-link" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full hover:bg-white/10 transition-all text-sm">
                      <Sparkles size={16} /> Google Form
                    </a>
                  </div>
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl glass-panel p-8 md:p-12 rounded-[2.5rem] border-white/10 max-h-[80vh] overflow-y-auto"
            >
              <button onClick={() => setShowPrivacy(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
              <div className="space-y-8">
                <h2 className="text-3xl font-display font-bold">Privacy Policy</h2>
                <div className="space-y-6 text-zinc-400 text-sm leading-relaxed">
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-white">1. Data Collection</h3>
                    <p>We collect minimal data necessary to provide our AI services. This includes your email address for authentication and the text scripts you provide for voice generation.</p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-white">2. Audio Data</h3>
                    <p>Generated audio files are stored temporarily to allow you to download them. We do not use your generated audio or input text to train our base models without explicit consent.</p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-white">3. Third-Party Services</h3>
                    <p>We use Google Firebase for authentication and database services, and Google Gemini API for AI processing. Your data is handled according to their respective privacy policies.</p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-white">4. Cookies</h3>
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl glass-panel p-8 md:p-12 rounded-[2.5rem] border-white/10 max-h-[80vh] overflow-y-auto"
            >
              <button onClick={() => setShowTerms(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
              <div className="space-y-8">
                <h2 className="text-3xl font-display font-bold">Terms of Service</h2>
                <div className="space-y-6 text-zinc-400 text-sm leading-relaxed">
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-white">1. Acceptable Use</h3>
                    <p>You agree not to use VoxNova to generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable. This includes generating deepfakes for malicious purposes.</p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-white">2. Intellectual Property</h3>
                    <p>You retain ownership of the text scripts you provide. VoxNova grants you a non-exclusive license to use the generated audio for personal or commercial purposes, provided you comply with these terms.</p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-white">3. Service Availability</h3>
                    <p>We strive for 100% uptime but do not guarantee uninterrupted service. We reserve the right to modify or discontinue features at any time.</p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-white">4. Credits & Payments</h3>
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl max-h-[80vh] bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-display font-bold">Voice Library</h3>
                  <p className="text-zinc-500 text-sm">Explore and preview professional AI voices.</p>
                </div>
                
                <div className="flex items-center gap-4 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input 
                      type="text"
                      placeholder="Search voices by name..."
                      value={voiceSearchTerm}
                      onChange={(e) => setVoiceSearchTerm(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                  <button 
                    onClick={() => setShowVoiceLibrary(false)}
                    className="p-2 hover:bg-white/5 rounded-full transition-all shrink-0"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {VOICES.filter(v => v.name.toLowerCase().includes(voiceSearchTerm.toLowerCase())).map((voice) => (
                  <div 
                    key={voice.id}
                    className={`p-6 rounded-2xl border transition-all group relative ${selectedVoice.id === voice.id ? 'bg-white/10 border-white/20' : 'bg-zinc-800/50 border-white/5 hover:border-white/10'}`}
                  >
                    <div 
                      className="absolute inset-0 cursor-pointer z-0"
                      onClick={() => {
                        setSelectedVoice(voice);
                        setShowVoiceLibrary(false);
                      }}
                    />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center font-display font-bold text-xl group-hover:scale-110 transition-transform">
                        {voice.name[0]}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewVoice(voice);
                          }}
                          disabled={previewingVoiceId === voice.id}
                          className={`p-2 rounded-xl transition-all ${previewingVoiceId === voice.id ? 'bg-emerald-500 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}`}
                        >
                          {previewingVoiceId === voice.id ? <Loader2 className="animate-spin" size={18} /> : <Volume2 size={18} />}
                        </button>
                        {selectedVoice.id === voice.id && (
                          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                            <Check size={16} />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="relative z-10">
                      <h4 className="font-bold text-lg mb-1">{voice.name}</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 px-2 py-0.5 bg-zinc-900 rounded">{voice.gender}</span>
                        {voice.isPremium && (
                          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded flex items-center gap-1">
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

      {/* Footer / Status */}
      <footer className="fixed bottom-0 left-0 right-0 md:left-64 p-4 border-t border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between text-[10px] text-zinc-600 uppercase tracking-[0.2em]">
        <div className="flex items-center gap-4">
        </div>
        <div className="hidden md:block">
          VoxNova AI &copy; 2026
        </div>
      </footer>
    </div>
  );
}
