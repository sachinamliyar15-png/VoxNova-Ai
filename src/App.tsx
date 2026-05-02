import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Play, 
  Download, 
  History, 
  Settings2, 
  Volume2, 
  VolumeX,
  Trash2, 
  Loader2, 
  ChevronDown, 
  MessageSquare,
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
  RefreshCw,
  Pause,
  Music,
  Search,
  Menu,
  HelpCircle,
  AlertCircle,
  Zap,
  Clock,
  Timer,
  Mail,
  ExternalLink,
  PenTool,
  ArrowUp,
  ArrowRight,
  Type,
  Plus,
  Edit2,
  Edit3,
  Highlighter,
  PanelLeft,
  Copy,
  Send,
  ImagePlus,
  Image as ImageIcon,
  MoreVertical,
  Folder,
  Square,
  LayoutGrid,
  FileText,
  Activity,
  Maximize,
  Terminal,
  RotateCcw,
  Wind,
  Heart,
  Cloud,
  Star,
  Smile,
  Palette,
  AlignLeft,
  Clapperboard,
  Smartphone,
  Layers,
  FileCode,
  CaseSensitive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CAPTION_COLORS = [
  '#ffffff', '#000000', '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ff0000', 
  '#ffd700', '#ff6b00', '#ff1493', '#1e90ff', '#7fff00', '#4169e1', '#8a2be2',
  '#ff4500', '#00ff7f', '#adff2f', '#00ced1', '#f0f0f0'
];
import { GoogleGenAI, Modality } from "@google/genai";
import { 
  VOICES, 
  Voice, 
  Generation, 
  LANGUAGES, 
  CaptionWord, 
  CaptionStyle, 
  CaptionPreset 
} from './types';
import { CAPTION_PRESETS } from './constants/captionPresets';
import { FONTS } from './constants/fonts';
import CaptionEditor from './components/CaptionEditor';
import VoiceClone from './components/VoiceClone/VoiceClone';
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
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  GoogleAuthProvider
} from 'firebase/auth';

// Firebase connection check removed to prevent unnecessary warnings
const testFirestoreConnection = async () => {};

const BLOG_ARTICLES = [
  {
    title: "How AI Voice Generators are Changing Content Creation",
    excerpt: "AI voice technology has evolved significantly in recent years. From robotic voices to ultra-realistic human-like speech, the journey has been remarkable. VoxNova Text to Speech uses advanced neural networks to capture the nuances of human emotion...",
    date: "March 28, 2026",
    img: "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=800&h=450",
    content: (
      <article className="space-y-6">
        <h2 className="text-4xl font-display font-bold text-zinc-900">How AI Voice Generators are Changing Content Creation</h2>
        <div className="text-zinc-500 leading-relaxed space-y-4">
          <p className="text-lg font-medium text-zinc-900">AI voice technology has evolved significantly in recent years. From robotic voices to ultra-realistic human-like speech, the journey has been remarkable.</p>
          <p>VoxNova Text to Speech uses advanced neural networks to capture the nuances of human emotion, making it perfect for YouTube creators, filmmakers, and businesses. The ability to generate high-quality audio without a voice actor has opened up new possibilities for small creators.</p>
          <p>With the rise of short-form content like TikTok, Reels, and YouTube Shorts, the demand for quick and effective voiceovers is at an all-time high. AI voices allow creators to iterate faster and produce more content in less time.</p>
          <h3 className="text-2xl font-bold text-zinc-900 pt-4">Why Realism Matters</h3>
          <p>In the past, AI voices were easy to spot. They lacked the natural rhythm and breathing patterns of human speech. Today, VoxNova's technology incorporates these subtle details, making the voices sound 100% realistic.</p>
        </div>
      </article>
    )
  },
  {
    title: "Best Hindi AI Voices for YouTube Shorts and Reels",
    excerpt: "Hindi content is booming on social media. To stand out, you need high-quality voiceovers. VoxNova offers voices like 'Pankaj' and 'Sultan' which are perfect for motivational videos, news, and storytelling in Hindi...",
    date: "March 25, 2026",
    img: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800&h=450",
    content: (
      <article className="space-y-6">
        <h2 className="text-4xl font-display font-bold text-zinc-900">Best Hindi AI Voices for YouTube Shorts and Reels</h2>
        <div className="text-zinc-500 leading-relaxed space-y-4">
          <p className="text-lg font-medium text-zinc-900">Hindi content is booming on social media. To stand out, you need high-quality voiceovers that resonate with the audience.</p>
          <p>VoxNova offers a specialized library of Hindi voices that are perfect for various niches. For example, 'Pankaj' is an ultra-deep, authoritative voice ideal for news and documentary-style videos. On the other hand, 'Sultan' provides a powerful, warrior-like tone for motivational content.</p>
          <h3 className="text-2xl font-bold text-zinc-900 pt-4">Tips for Hindi Voiceovers</h3>
          <p>When generating Hindi audio, it's important to use proper punctuation. This helps the AI understand where to pause and which words to emphasize. Our Hindi models are trained on native speakers to ensure perfect pronunciation and cultural nuance.</p>
        </div>
      </article>
    )
  },
  {
    title: "The Future of Text to Speech Technology in 2026",
    excerpt: "As we move further into 2026, AI voices are becoming indistinguishable from real humans. VoxNova is at the forefront of this revolution, providing tools for voice cloning, emotional modulation, and real-time dubbing...",
    date: "March 22, 2026",
    img: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?auto=format&fit=crop&q=80&w=800&h=450",
    content: (
      <article className="space-y-6">
        <h2 className="text-4xl font-display font-bold text-zinc-900">The Future of Text to Speech Technology in 2026</h2>
        <div className="text-zinc-500 leading-relaxed space-y-4">
          <p className="text-lg font-medium text-zinc-900">As we move further into 2026, AI voices are becoming indistinguishable from real humans.</p>
          <p>VoxNova is at the forefront of this revolution, providing tools for voice cloning, emotional modulation, and real-time dubbing. The next step in TTS evolution is the integration of real-time emotional intelligence, where the AI can adapt its tone based on the sentiment of the text automatically.</p>
          <p>We are also seeing a shift towards personalized AI voices, where users can create a unique digital twin of their own voice for use in various applications.</p>
        </div>
      </article>
    )
  },
  {
    title: "How to Create Professional Voiceovers with VoxNova",
    excerpt: "Creating a professional voiceover used to require expensive equipment and a recording studio. Now, with VoxNova Text to Speech, you can generate studio-quality audio in seconds. Learn how to fine-tune your scripts for the best results...",
    date: "March 18, 2026",
    img: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800&h=450",
    content: (
      <article className="space-y-6">
        <h2 className="text-4xl font-display font-bold text-zinc-900">How to Create Professional Voiceovers with VoxNova</h2>
        <div className="text-zinc-500 leading-relaxed space-y-4">
          <p className="text-lg font-medium text-zinc-900">Creating a professional voiceover used to require expensive equipment and a recording studio. Now, you can do it in seconds.</p>
          <p>Step 1: Write a clear script. Use punctuation to guide the AI's rhythm.<br/>Step 2: Choose the right voice. Each voice in VoxNova has a specific 'vibe' described in the library.<br/>Step 3: Fine-tune the settings. Adjust the speed for energy and the pitch for authority.<br/>Step 4: Use 'Studio Clarity' to ensure the output is crisp and professional.</p>
        </div>
      </article>
    )
  }
];

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let isFirestoreError = false;
      let fsErrorData: any = null;
      try {
        if (this.state.error?.message) {
          fsErrorData = JSON.parse(this.state.error.message);
          if (fsErrorData.operationType && fsErrorData.authInfo) {
            isFirestoreError = true;
          }
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            {isFirestoreError ? 'Database Access Error' : 'Something went wrong'}
          </h1>
          <p className="text-zinc-500 mb-8 max-w-md">
            {isFirestoreError 
              ? `We encountered a permission issue while trying to ${fsErrorData.operationType} data at ${fsErrorData.path}. Please ensure you are logged in and have the correct permissions.` 
              : 'The application encountered an unexpected error. Please try refreshing the page.'}
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all"
              >
                Refresh Page
              </button>
              {isFirestoreError && (
                <button 
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.href = '/';
                  }}
                  className="px-6 py-3 bg-white border border-zinc-200 text-zinc-900 rounded-xl font-bold hover:bg-zinc-50 transition-all"
                >
                  Go to Home
                </button>
              )}
            </div>
            <div className="mt-8 p-4 bg-zinc-50 rounded-lg text-left text-xs text-red-600 overflow-auto max-w-full">
              <p className="font-bold mb-2">Error Details:</p>
              <pre className="whitespace-pre-wrap">{this.state.error?.toString()}</pre>
              <pre className="mt-2 opacity-50 whitespace-pre-wrap">{this.state.error?.stack}</pre>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const WelcomeScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    // Fallback timeout to ensure the app loads even if animation fails
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

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
            <div className="text-xl text-zinc-400 font-medium tracking-tight mt-1 text-center">Text to Speech</div>
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


// Helper to convert base64 to ArrayBuffer
const fetchChunkedAudio = async (historyId: string, collectionName: string = 'voice_history'): Promise<string | null> => {
  try {
    const chunksRef = collection(db, collectionName, historyId, 'chunks');
    const q = query(chunksRef, orderBy('index'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    
    const chunks = querySnapshot.docs.map(doc => doc.data().data);
    return chunks.join('');
  } catch (error) {
    console.error("Failed to fetch chunked audio:", error);
    return null;
  }
};

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

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const groupWordsIntoLines = (words: CaptionWord[], wordsPerLine: number, isSmart?: boolean): CaptionWord[] => {
  if (words.length === 0) return [];
  
  const limit = Math.max(1, wordsPerLine);
  const grouped: CaptionWord[] = [];
  
  // If limit is 1, always return single words regardless of isSmart
  if (limit === 1) {
    return words.map(w => ({ ...w }));
  }

  if (isSmart && limit > 1) {
    let i = 0;
    while (i < words.length) {
      const currentWord = words[i];
      const nextWord = words[i + 1];
      const nextNextWord = words[i + 2];
      let count = 1;
      
      // Respect the user's maximum wordsPerLine limit
      if (nextWord && limit >= 2) {
        const gap = nextWord.start - currentWord.end;
        // Group if words are close or combined length is short
        if (gap < 0.2 && ((currentWord.word?.length || 0) + (nextWord.word?.length || 0) < 12)) {
          count = 2;
          if (nextNextWord && limit >= 3) {
            const gap2 = nextNextWord.start - nextWord.end;
            if (gap2 < 0.1) count = 3;
          }
        }
      }
      
      const chunk = words.slice(i, i + count);
      grouped.push({
        // Use FOUR spaces to ensure they are distinct even with borders
        word: chunk.map(w => w.word).join('\u00A0\u00A0\u00A0\u00A0'), // Use non-breaking spaces
        start: chunk[0].start,
        end: chunk[chunk.length - 1].end
      });
      i += count;
    }
  } else {
    for (let i = 0; i < words.length; i += limit) {
      const chunk = words.slice(i, i + limit);
      grouped.push({
        word: chunk.map(w => w.word).join('\u00A0\u00A0\u00A0\u00A0'),
        start: chunk[0].start,
        end: chunk[chunk.length - 1].end
      });
    }
  }

  // CRITICAL FIX: Close gaps between captions to prevent flickering/disappearing
  // We extend the 'end' of each caption to the 'start' of the next one if the gap is small (< 1.5s)
  for (let i = 0; i < grouped.length - 1; i++) {
    const current = grouped[i];
    const next = grouped[i + 1];
    const gap = next.start - current.end;
    
    if (gap > 0 && gap < 0.2) {
      current.end = next.start;
    }
  }

  // Handle Devanagari joined characters if needed (ensure whitespace is preserved)
  const isHindi = /[\u0900-\u097F]/.test(words[0]?.word || '');
  if (isHindi) {
    // Hindi specific word joining logic can go here if needed
  }

  // Ensure the first caption starts at 0 only if it's very close to the start (< 0.5s)
  if (grouped.length > 0 && grouped[0].start < 0.5) {
    grouped[0].start = 0;
  }

  // Ensure the last caption lasts until the end of the audio/video (approx)
  if (grouped.length > 0) {
    const last = grouped[grouped.length - 1];
    // If it's a short voiceover, make sure the last word stays on screen
    if (last.end - last.start < 1.0) {
      last.end += 1.0;
    }
  }

  return grouped;
};

const CaptionOverlay = ({ 
  words, 
  currentTime, 
  style, 
  animation,
  shadowColor: propShadowColor,
  isExporting,
  onUpdateStyle
}: { 
  words: CaptionWord[], 
  currentTime: number, 
  style: CaptionStyle, 
  animation: string,
  shadowColor: string,
  isExporting?: boolean,
  onUpdateStyle?: (style: Partial<CaptionStyle>) => void
}) => {
  if (isExporting) return null;
  // Use the currentTime directly as it already includes the user-defined captionOffset from the parent
  const adjustedTime = currentTime;

  // Handle Dragging - Moved to top to avoid React hook errors
  const [isDragging, setIsDragging] = React.useState(false);
  const [guides, setGuides] = React.useState({ x: false, y: false });
  
  const displayWords = React.useMemo(() => groupWordsIntoLines(words, style.wordsPerLine, style.isSmart), [words, style.wordsPerLine, style.isSmart]);
  const currentWordIndex = displayWords.findIndex(w => adjustedTime >= w.start && adjustedTime <= w.end);
  const currentWord = displayWords[currentWordIndex];
  
    // Subtle "living" motion only for "Pro" styles (Animated templates)
    const driftOffset = React.useMemo(() => {
      const isProStyle = animation === 'skate' || animation === 'pop' || animation === 'snappy-pop' || animation === 'professional';
      if (!style.isSmart || !isProStyle) return { x: 0, y: 0 };
      
      const seed = (currentWord?.start || 0) * 2; 
      const offsetX = Math.sin(seed) * 4; // reduced for stability
      const offsetY = Math.cos(seed) * 2; // reduced for stability
      return { x: offsetX, y: offsetY };
    }, [animation, style.isSmart, currentWord?.start]);

  if (!currentWord) return null;

  const getDynamicColor = (index: number, word: CaptionWord) => {
    if (style.isDynamic) {
      const colors = style.threeColors || ['#ffffff', '#ffff00', '#00ff1a'];
      // Use the start time as a stable seed to ensure consistent coloring even with grouping
      const stableIndex = Math.floor((word.start * 10) % colors.length);
      return colors[stableIndex];
    }
    return style.color || '#ffffff';
  };

  const getAnimationProps = () => {
    const isPro = style.isSmart;
    switch (animation) {
      case 'typing':
      case 'typewriter':
        return {
          initial: { opacity: 0, x: -5, y: 5, scale: 0.8, rotate: -2 },
          animate: { 
            opacity: 1, 
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
          },
          transition: { 
            duration: 0.04, // Ultra-snappy
            type: "spring" as const,
            stiffness: 2000,
            damping: 40,
            opacity: { duration: 0.03 },
            scale: { duration: 0.05 }
          }
        };
      case 'pop':
        return {
          initial: { scale: 0.5, opacity: 0, y: 20 },
          animate: { scale: [0.5, 1.2, 1], opacity: 1, y: 0 },
          transition: { duration: 0.2, times: [0, 0.6, 1], ease: "easeOut" as const }
        };
      case 'professional':
        return {
          initial: { scale: 0.8, opacity: 0, y: 10 },
          animate: { scale: [0.8, 1.05, 1], opacity: 1, y: 0 },
          transition: { 
            type: 'spring' as const, 
            stiffness: 1000, 
            damping: 30,
            restDelta: 0.001
          }
        };
      case 'snappy':
        return {
          initial: { scale: 0.7, opacity: 0, y: 10 },
          animate: { scale: [0.7, 1.25, 1], opacity: 1, y: 0 },
          transition: { 
            type: "spring" as const,
            stiffness: 1500,
            damping: 25,
            duration: 0.05
          }
        };
      case 'snappy-pop':
        return {
          initial: { scale: 0.5, opacity: 0, y: isPro ? 10 : 15 },
          animate: { scale: 1.2, opacity: 1, y: 0 },
          transition: { 
            type: 'spring' as const, 
            stiffness: 700, 
            damping: 15,
            mass: 0.5
          }
        };
      case 'shake':
        return {
          initial: { x: -10, opacity: 0 },
          animate: { x: [0, -10, 10, -10, 10, 0], opacity: 1 },
          transition: { duration: 0.4 }
        };
      case 'bounce':
        return {
          initial: { y: 20, opacity: 0 },
          animate: { y: [0, -20, 10, -5, 0], opacity: 1 },
          transition: { duration: 0.5 }
        };
      case 'slide':
        return {
          initial: { x: -50, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          transition: { type: 'spring' as const, stiffness: 200, damping: 25 }
        };
      case 'zoom':
        return {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { 
            duration: 0.2,
            ease: "easeOut" as const
          }
        };
      case 'glitch':
        return {
          initial: { opacity: 0, x: 0 },
          animate: { 
            opacity: 1,
            x: [0, -1.5, 1.5, -1.5, 1.5, 0],
            filter: [
              'none',
              'drop-shadow(2px 0 #8B4513) drop-shadow(-2px 0 #FF4500)',
              'none'
            ]
          },
          transition: { duration: 0.3, repeat: Infinity, repeatDelay: 2 }
        };
      case 'rotate':
        return {
          initial: { rotate: -180, opacity: 0, scale: 0 },
          animate: { rotate: 0, opacity: 1, scale: 1 },
          transition: { type: 'spring' as const, stiffness: 260, damping: 20 }
        };
      case 'flip':
        return {
          initial: { rotateX: 90, opacity: 0 },
          animate: { rotateX: 0, opacity: 1 },
          transition: { duration: 0.5 }
        };
      case 'skate':
        return {
          initial: { x: -100, opacity: 0, skewX: -20 },
          animate: { x: 0, opacity: 1, skewX: 0 },
          transition: { type: 'spring' as const, stiffness: 100, damping: 10 }
        };
      case 'heartbeat':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: [1, 1.2, 1, 1.1, 1], opacity: 1 },
          transition: { duration: 0.6 }
        };
      case 'float':
        return {
          initial: { y: 20, opacity: 0 },
          animate: { y: [0, -10, 0], opacity: 1 },
          transition: { 
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
            opacity: { duration: 0.5 }
          }
        };
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.2, ease: "easeOut" as const }
        };
      case 'glow':
        return {
          initial: { opacity: 0, scale: 0.8, filter: 'drop-shadow(0 0 0px transparent)' },
          animate: { 
            opacity: 1, 
            scale: 1,
            filter: [
              'drop-shadow(0 0 0px transparent)',
              'drop-shadow(0 0 15px currentColor)',
              'drop-shadow(0 0 5px currentColor)'
            ]
          },
          transition: { duration: 0.4 }
        };
      case 'karaoke':
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          transition: { duration: 0.1 }
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
    textShadow: [
      style.shadow ? `1.5px 1.5px 0px ${style.shadowColor || 'rgba(0,0,0,0.8)'}` : '',
      style.glow ? `0 0 10px ${style.color}, 0 0 20px ${style.color}` : ''
    ].filter(Boolean).join(', ') || 'none',
    WebkitTextStroke: style.border !== 'none' ? `${style.strokeWidth || 3}px ${style.outlineColor || '#000000'}` : 'none',
    paintOrder: 'stroke fill',
    ['WebkitPaintOrder' as any]: 'stroke fill',
    WebkitTextFillColor: style.color,
    backgroundColor: style.backgroundColor && style.backgroundColor !== 'transparent' ? style.backgroundColor : 'transparent',
    padding: style.backgroundColor && style.backgroundColor !== 'transparent' ? '4px 12px' : '0',
    borderRadius: '8px',
    display: 'inline-block',
    whiteSpace: 'pre-wrap',
    fontStyle: style.italic ? 'italic' : 'normal',
    fontWeight: style.fontWeight || '700'
  };

  const getPositionClass = (pos?: string) => {
    const p = pos || style.position;
    switch (p) {
      case 'top': return 'items-start justify-center pt-[15%]';
      case 'middle': return 'items-center justify-center';
      case 'bottom': return 'items-end justify-center pb-[12%]';
      case 'left': return 'items-center justify-start pl-12';
      case 'right': return 'items-center justify-end pr-12';
      case 'top-left': return 'items-start justify-start pt-[15%] pl-12';
      case 'top-right': return 'items-start justify-end pt-[15%] pr-12';
      case 'bottom-left': return 'items-end justify-start pb-[12%] pl-12';
      case 'bottom-right': return 'items-end justify-end pb-[12%] pr-12';
      default: return 'items-end justify-center pb-[12%]';
    }
  };

  const getAlignmentClass = (pos?: string) => {
    const p = pos || style.position;
    if (p.includes('left')) return 'text-left justify-start';
    if (p.includes('right')) return 'text-right justify-end';
    return 'text-center justify-center';
  };

  const getWordStyle = (word: CaptionWord, index: number): React.CSSProperties => {
    const finalShadow = style.shadowColor || propShadowColor;
    const baseStyle: React.CSSProperties = {
      fontFamily: style.font,
      fontSize: `${word.fontSize || style.fontSize}px`,
      color: word.color || (style.isDynamic ? getDynamicColor(index, word) : style.color),
      textTransform: style.case === 'uppercase' ? 'uppercase' : style.case === 'lowercase' ? 'lowercase' : 'none',
      backgroundColor: 'transparent', // Background is handled by container
      padding: '0.1em 0.15em',
      borderRadius: style.borderRadius || '0.2rem',
      letterSpacing: style.letterSpacing || 'normal',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      wordBreak: 'keep-all',
      margin: '0.25em 0.6em',
      transition: 'all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      fontStyle: style.italic ? 'italic' : 'normal',
      fontWeight: style.fontWeight || '900',
      textShadow: `0 2px 10px rgba(0,0,0,0.5)`,
    };

    if (style.tripleBorder && style.tripleBorderColors) {
      const c1 = style.tripleBorderColors[0] || '#FFD700'; 
      const c2 = style.tripleBorderColors[1] || '#0047AB'; 
      const c3 = style.tripleBorderColors[2] || '#000000'; 
      
      // Multi-layered text shadow for explicit triple border appearance - EXTREME visibility offsets
      baseStyle.textShadow = `
        -3px -3px 0 ${c1}, 3px -3px 0 ${c1}, -3px 3px 0 ${c1}, 3px 3px 0 ${c1},
        -6px -6px 0 ${c2}, 6px -6px 0 ${c2}, -6px 6px 0 ${c2}, 6px 6px 0 ${c2},
        -10px -10px 0 ${c3}, 10px -10px 0 ${c3}, -10px 10px 0 ${c3}, 10px 10px 0 ${c3},
        0 20px 40px rgba(0,0,0,0.95)
      `.trim().replace(/\s+/g, ' ');
      
      (baseStyle as any).WebkitTextStroke = `4px ${c1}`;
      baseStyle.whiteSpace = 'nowrap';
      baseStyle.display = 'inline-block';
      baseStyle.overflow = 'visible';
    }

    if (!style.tripleBorder) {
      if (style.border === 'thin') {
        (baseStyle as any).WebkitTextStroke = `${(style.strokeWidth || 1) * 0.4}px ${style.outlineColor || '#000000'}`;
        (baseStyle as any).paintOrder = 'stroke fill';
        (baseStyle as any).WebkitPaintOrder = 'stroke fill';
      } else if (style.border === 'thick') {
        (baseStyle as any).WebkitTextStroke = `${(style.strokeWidth || 3) * 0.8}px ${style.outlineColor || '#000000'}`;
        (baseStyle as any).paintOrder = 'stroke fill';
        (baseStyle as any).WebkitPaintOrder = 'stroke fill';
      }

      if (style.glow) {
        baseStyle.textShadow = `0 0 12px ${baseStyle.color}, 0 0 24px ${baseStyle.color}, 0 2px 8px rgba(0,0,0,0.4)`;
        baseStyle.filter = `drop-shadow(0 0 8px ${baseStyle.color})`;
      }

      if (style.shadow) {
        baseStyle.textShadow = `1.5px 1.5px 0px ${finalShadow}, -1.5px -1.5px 0px ${finalShadow}, 1.5px -1.5px 0px ${finalShadow}, -1.5px 1.5px 0px ${finalShadow}, 0px 6px 15px rgba(0,0,0,0.7)`;
      }
    }
    
    if (style.background === 'box') {
      baseStyle.backgroundColor = 'rgba(0,0,0,0.85)';
      baseStyle.boxShadow = '0 8px 30px rgba(0,0,0,0.4)';
    }

    // Highlight logic
    if (word.isHighlighted) {
      return {
        ...baseStyle,
        backgroundColor: word.highlightColor || '#facc15',
        color: '#000000',
        transform: 'rotate(-2deg) scale(1.15)',
        fontWeight: '800',
        boxShadow: `6px 6px 0px ${finalShadow}66`,
        textShadow: 'none',
        WebkitTextStroke: '0px',
      };
    }

    return baseStyle;
  };

  const currentWordPosition = currentWord.position || style.position;

  const handleDrag = (_: any, info: any) => {
    setIsDragging(true);
    const currentX = (style.x || 0) + info.offset.x;
    const currentY = (style.y || 0) + info.offset.y;
    
    setGuides({
      x: Math.abs(currentX) < 10,
      y: Math.abs(currentY) < 10
    });
  };

  const handleDragEnd = (_: any, info: any) => {
    setIsDragging(false);
    setGuides({ x: false, y: false });
    if (onUpdateStyle) {
      onUpdateStyle({
        x: (style.x || 0) + info.offset.x,
        y: (style.y || 0) + info.offset.y
      });
    }
  };

  const displayPosition = style.position || 'middle';
  const positionClass = getPositionClass(displayPosition);
  const alignmentClass = getAlignmentClass(displayPosition);

  const renderContent = () => {
    // Grace period: if we're between captions, keep the previous one for up to 0.5s 
    // to prevent unwanted disappearing before voice ends.
    const currentLine = displayWords.find(line => adjustedTime >= line.start && adjustedTime <= line.end) || 
                       displayWords.find(line => adjustedTime >= line.end && adjustedTime <= line.end + 0.5);

    if (!currentLine) return null;

    // Get original words that are part of this line for word-level precision
    const lineWords = words.filter(w => w.start >= currentLine.start && w.end <= (currentLine.end + 0.15));
    
    // typewriter is now the default sequential animation
    const isSequential = ['professional', 'snappy', 'zoom', 'typing', 'typewriter'].includes(animation);

    // Apply background to the whole line if configured
    const lineContainerStyle: React.CSSProperties = {
      ...textStyle,
      maxWidth: '95%',
      margin: '0 auto',
      padding: (style.backgroundColor && style.backgroundColor !== 'transparent') ? (style.padding || '0.2em 0.5em') : 0,
      backgroundColor: (style.backgroundColor && style.backgroundColor !== 'transparent') ? style.backgroundColor : 'transparent',
      borderRadius: (style.backgroundColor && style.backgroundColor !== 'transparent') ? (style.borderRadius || '0.5rem') : 0,
    };

    if (isSequential || animation === 'karaoke' || animation === 'zeemo') {
      return (
        <div 
          style={lineContainerStyle} 
          className={`flex flex-nowrap ${alignmentClass} gap-x-[0.6em] gap-y-1 overflow-visible pointer-events-none items-center justify-center`}
        >
          {lineWords.map((w, i) => {
            const isVisible = adjustedTime >= w.start;
            const isActive = adjustedTime >= w.start && adjustedTime <= w.end;
            const isKaraoke = animation === 'karaoke' || animation === 'zeemo';
            
            // Dynamic animation per word
            const wordAnimation = animation === 'zeemo' ? {
              scale: isActive ? 1.25 : 1,
              y: isActive ? -8 : 0,
              color: isActive ? (style.threeColors?.[0] || '#FFD700') : (style.color || '#FFFFFF')
            } : animation === 'karaoke' ? {
              color: isActive ? (style.threeColors?.[0] || '#FFFF00') : (style.color || '#FFFFFF'),
            } : {
              opacity: isVisible ? 1 : 0,
              scale: isVisible ? 1 : 0.9,
              y: isVisible ? 0 : 5
            };

            return (
              <motion.div 
                key={`word-${w.start}-${i}-${animation}`}
                animate={isKaraoke ? {
                  color: isActive ? (style.threeColors?.[0] || '#FFFF00') : (style.color || '#FFFFFF'),
                } : animation === 'zeemo' ? {
                  scale: isActive ? 1.25 : 1,
                  y: isActive ? -8 : 0,
                  color: isActive ? (style.threeColors?.[0] || '#FFD700') : (style.color || '#FFFFFF')
                } : {
                  opacity: isVisible ? 1 : 0,
                  scale: isVisible ? 1 : 0.9,
                  y: isVisible ? 0 : 5,
                  color: (isActive || isVisible) ? (w.color || (style.isDynamic ? getDynamicColor(i, w) : style.color)) : 'rgba(255,255,255,0.1)'
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 30,
                  mass: 0.8
                }}
                style={{
                  ...getWordStyle(w, i),
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  opacity: isVisible ? 1 : 0
                }}
              >
                {w.word}
              </motion.div>
            );
          })}
        </div>
      );
    }

    // Kinetic Stacking Style remains special as it is layout dependent
    if (animation === 'kinetic') {
      const currentLine = displayWords.find(line => adjustedTime >= line.start && adjustedTime <= line.end);
      if (!currentLine) return null;

      const lineWords = words.filter(w => w.start >= currentLine.start && w.end <= currentLine.end);

      // Split words into lines: Line 1 (1st word), Line 2 (rest)
      const lines = [
        [lineWords[0]],
        lineWords.slice(1)
      ].filter(l => l.length > 0);

      return (
        <div className={`absolute left-0 right-0 w-full flex justify-center px-4 ${positionClass}`}>
          <div className="flex flex-col items-center gap-2">
            <AnimatePresence mode="popLayout">
              {lines.map((line, lineIdx) => (
                  <motion.div
                    key={`kinetic-line-${lineIdx}-${line[0]?.start || 0}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="flex flex-wrap justify-center gap-x-3"
                  >
                    {line.map((w, i) => {
                      const isActive = adjustedTime >= w.start && adjustedTime <= w.end;
                      return (
                        <span
                          key={`kinetic-word-${w.word}-${w.start}-${i}`}
                          style={{
                            ...getWordStyle(w, i),
                            color: isActive ? '#FFD700' : '#FFFFFF',
                            fontWeight: '700',
                            transition: 'color 0.1s ease'
                          }}
                        >
                          {w.word}
                        </span>
                      );
                    })}
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      );
    }

    // Snappy Pop / Pop Animation (Restore classic high-quality centered look)
    if (animation === 'pop' || animation === 'snappy-pop') {
      const isPro = style.isSmart;
      return (
        <AnimatePresence mode="popLayout">
          <div style={lineContainerStyle} className={alignmentClass}>
            <motion.div
              key={`${currentWord.word}-${currentWord.start}`}
              initial={{ scale: 0.8, opacity: 0, y: isPro ? 8 : 12 }}
              animate={{ 
                scale: 1.15, 
                opacity: 1, 
                y: driftOffset.y,
                x: driftOffset.x,
                color: getDynamicColor(words.indexOf(currentWord), currentWord)
              }}
              exit={{ scale: 0.9, opacity: 0, y: isPro ? -5 : -8 }}
              transition={{ 
                type: 'spring', 
                stiffness: animation === 'snappy-pop' ? 700 : 450, 
                damping: 25 
              }}
              style={{ 
                ...getWordStyle(currentWord, words.indexOf(currentWord)),
                backgroundColor: 'transparent',
                maxWidth: '90%', 
                margin: '0 auto',
              }}
              className="font-bold text-center px-4 flex flex-nowrap justify-center items-center gap-[0.5em]"
            >
              {style.isDynamic ? (
                currentWord.word.split(' ').map((w, i) => {
                  const globalWordIndex = words.findIndex(gw => gw.start === currentWord.start) + i;
                  const colors = style.threeColors || ['#ffffff', '#ffff00', '#00ff00'];
                  const wordColor = colors[globalWordIndex % colors.length];
                  return (
                    <span key={i} style={{ color: wordColor }}>
                      {w}
                    </span>
                  );
                })
              ) : (
                currentWord.word
              )}
            </motion.div>
          </div>
        </AnimatePresence>
      );
    }

    // Glow animation
    if (animation === 'glow') {
      const isPro = style.isSmart;
      return (
        <AnimatePresence mode="wait">
          <div style={lineContainerStyle} className={alignmentClass}>
            <motion.div
              key={`${currentWord.word}-${currentWord.start}-${currentWord.end}`}
              initial={{ opacity: 0, filter: 'blur(10px)', y: isPro ? 5 : 8 }}
              animate={{ 
                opacity: 1, 
                filter: 'blur(0px)',
                y: driftOffset.y,
                x: driftOffset.x
              }}
              exit={{ opacity: 0, filter: 'blur(10px)', y: isPro ? -5 : -8 }}
              style={{ ...getWordStyle(currentWord, words.indexOf(currentWord)), backgroundColor: 'transparent' }}
              className="font-bold text-center px-4 flex flex-nowrap justify-center items-center gap-[0.5em]"
            >
              {style.isDynamic ? (
                currentWord.word.split(' ').map((w, i) => {
                  const globalWordIndex = words.findIndex(gw => gw.start === currentWord.start) + i;
                  const colors = style.threeColors || ['#ffffff', '#ffff00', '#00ff00'];
                  const wordColor = colors[globalWordIndex % colors.length];
                  return (
                    <span key={i} style={{ color: wordColor }}>
                      {w}
                    </span>
                  );
                })
              ) : (
                currentWord.word
              )}
            </motion.div>
          </div>
        </AnimatePresence>
      );
    }

    // Default style
    return (
      <AnimatePresence mode="popLayout">
        <div style={lineContainerStyle} className={alignmentClass}>
          <motion.div
            key={`${currentWord.word}-${currentWord.start}-${currentWord.end}`}
            {...getAnimationProps()}
            animate={{
              ...(getAnimationProps()?.animate || {}),
              x: driftOffset.x,
              y: driftOffset.y
            }}
            style={{...getWordStyle(currentWord, words.indexOf(currentWord)), backgroundColor: 'transparent'}}
            className="font-bold flex items-center justify-center whitespace-nowrap overflow-visible gap-8"
          >
            {style.isDynamic ? (
              currentWord.word.split('\u00A0\u00A0\u00A0\u00A0').map((w, i) => {
                const globalWordIndex = words.findIndex(gw => gw.start === currentWord.start) + i;
                const colors = style.threeColors || ['#ffffff', '#ffff00', '#00ff00'];
                const wordColor = colors[globalWordIndex % colors.length];
                return (
                  <span key={i} style={{ color: wordColor }}>
                    {w}
                  </span>
                );
              })
            ) : (
              currentWord.word
            )}
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  return (
    <div className={`absolute inset-0 flex z-[100] ${positionClass} p-4 pointer-events-none`}>
      {/* Laser Guides */}
      {isDragging && guides.x && (
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.8)] z-[101]" />
      )}
      {isDragging && guides.y && (
        <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.8)] z-[101]" />
      )}

      <motion.div 
        drag
        dragMomentum={false}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={{
          x: style.x || 0,
          y: style.y || 0
        }}
        className="pointer-events-auto flex flex-col items-center justify-center cursor-move"
      >
        <div className="w-full flex items-center justify-center min-h-[1.5em]">
          {renderContent()}
        </div>
      </motion.div>
    </div>
  );
};

const VoiceLibrary = ({ onSelect, selectedVoiceId, activeTab, voices }: { onSelect: (voice: Voice) => void, selectedVoiceId: string, activeTab?: string, voices: Voice[] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredVoices = voices.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (v.id === 'original') return false;
    return matchesSearch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} />
            Voice Library
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-zinc-900">
            Explore <span className="text-emerald-500">Premium</span> Voices
          </h2>
          <p className="text-zinc-500 text-lg max-w-2xl">
            Discover over 100+ high-quality AI voices for every project and language.
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text"
            placeholder="Search voices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVoices.map((voice, idx) => (
          <div 
            key={`voice-item-${voice.id}-${idx}`} 
            onClick={() => onSelect(voice)}
            className={`p-6 bg-white rounded-3xl border transition-all group cursor-pointer relative overflow-hidden ${selectedVoiceId === voice.id ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-zinc-100 hover:border-zinc-300 shadow-sm hover:shadow-md'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${voice.color} flex items-center justify-center font-display font-bold text-xl text-white group-hover:scale-110 transition-transform shadow-lg`}>
                  {voice.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900">{voice.name}</h4>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{voice.gender}</span>
                </div>
              </div>
              {voice.isPremium && (
                <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg">
                  <Crown size={14} />
                </div>
              )}
              {voice.isCloned && (
                <div className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase">
                  Cloned
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-500 line-clamp-2 mb-4">{voice.description}</p>
            <div className="flex flex-wrap gap-2">
              {voice.tags?.map((tag, tagIdx) => (
                <span key={`voice-tag-${voice.id}-${tag}-${tagIdx}`} className="px-2 py-1 bg-zinc-50 text-zinc-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Helper to format time for SRT
const formatSRTTime = (seconds: number) => {
  const date = new Date(0);
  date.setSeconds(seconds);
  const hh = date.getUTCHours().toString().padStart(2, '0');
  const mm = date.getUTCMinutes().toString().padStart(2, '0');
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
  return `${hh}:${mm}:${ss},${ms}`;
};

// Helper to generate SRT content from words
const generateSRT = (words: CaptionWord[]) => {
  if (!words || words.length === 0) return "";
  return words.map((word, i) => {
    return `${i + 1}\n${formatSRTTime(word.start)} --> ${formatSRTTime(word.end)}\n${word.word}\n`;
  }).join('\n');
};

const HistoryView = ({ history, onPlay, onDelete, onRestore }: { history: Generation[], onPlay: (gen: Generation) => void, onDelete: (id: string | number) => void, onRestore: (gen: Generation) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredHistory = Array.isArray(history) ? history.filter(h => 
    h.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.voice_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
            <History size={12} />
            History
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-zinc-900">
            Generation <span className="text-blue-500">History</span>
          </h2>
          <p className="text-zinc-500 text-lg max-w-2xl">
            Access and manage your previous voice generations and captions.
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text"
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 rounded-[2.5rem] border-2 border-dashed border-zinc-200">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-zinc-300 mx-auto mb-4">
            <History size={32} />
          </div>
          <p className="text-zinc-500 font-medium">No history found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredHistory.map((gen, idx) => (
            <div key={`history-view-item-${gen.id}-${idx}-${gen.created_at || ''}`} className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${gen.type === 'caption' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {gen.type || 'Voice'}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">{new Date(gen.created_at || Date.now()).toLocaleString()}</span>
                </div>
                <p className="text-sm text-zinc-900 font-medium line-clamp-2">{gen.text || "No text content"}</p>
                <div className="flex items-center gap-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                  <span className="flex items-center gap-1"><User size={10} /> {gen.voice_name}</span>
                  {gen.language && <span className="flex items-center gap-1"><Globe size={10} /> {gen.language}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onPlay(gen)}
                  className="p-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all"
                >
                  <Play size={18} />
                </button>
                <button 
                  onClick={() => onRestore(gen)}
                  title="Restore Script & Settings"
                  className="p-3 bg-zinc-50 text-zinc-600 rounded-xl hover:bg-zinc-100 transition-all"
                >
                  <RefreshCw size={18} />
                </button>
                <button 
                  onClick={() => onDelete(gen.id)}
                  className="p-3 bg-zinc-50 text-zinc-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <Trash2 size={18} />
                </button>
                
                {gen.type === 'caption' ? (
                  <button 
                    onClick={() => {
                      const srtContent = gen.words ? generateSRT(gen.words) : '';
                      const blob = new Blob([srtContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `captions-${gen.id}.srt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    title="Download SRT"
                    className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Download size={18} />
                  </button>
                ) : (gen.audio_data && gen.audio_data !== "LONG_AUDIO_DATA_TOO_LARGE_FOR_HISTORY") ? (
                  <button 
                    onClick={async () => {
                      let data = gen.audio_data!;
                      if (data === "CHUNKED") {
                        const fullAudio = await fetchChunkedAudio(gen.id.toString(), 'voice_history') || "";
                        if (!fullAudio) return;
                        data = fullAudio;
                      }
                      const blob = new Blob([base64ToArrayBuffer(data)], { 
                        type: data.startsWith('//') || data.startsWith('SUQz') ? 'audio/mp3' : 'audio/wav' 
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `VoxNova - ${gen.voice_name || 'AI Voice'}-${gen.id}.${data.startsWith('//') || data.startsWith('SUQz') ? 'mp3' : 'wav'}`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                    title="Download Audio"
                  >
                    <Download size={18} />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const PricingModal = ({ onClose, onSelect }: { onClose: () => void, onSelect: (plan: string, credits: number) => void }) => {
  return (
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
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-900">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <button onClick={() => onSelect('basic', 6000)} className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 transition-all">Buy Now</button>
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
            <button onClick={() => onSelect('pro', 15000)} className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all">Buy Now</button>
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
            <button onClick={() => onSelect('advanced', 30000)} className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 transition-all">Buy Now</button>
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
            <button onClick={() => onSelect('ultra', 40000)} className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 transition-all">Buy Now</button>
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
  );
};

const WHITELISTED_EMAILS = ['sachinamliyar15@gmail.com', 'amliyarsachin248@gmail.com'];
const isWhitelisted = (email: string | null | undefined) => email ? WHITELISTED_EMAILS.includes(email) : false;

const INTERNAL_VOICE_MAPPING: Record<string, string> = {
  'Adam': 'Puck', 'Brian': 'Charon', 'Daniel': 'Fenrir', 'Josh': 'Puck',
  'Liam': 'Charon', 'Michael': 'Fenrir', 'Ryan': 'Puck', 'Matthew': 'Charon',
  'Bill': 'Fenrir', 'Callum': 'Puck', 'Frank': 'Fenrir', 'Marcus': 'Charon',
  'Jessica': 'Kore', 'Sarah': 'Zephyr', 'Matilda': 'Kore', 'Emily': 'Zephyr',
  'Bella': 'Kore', 'Rachel': 'Zephyr', 'Nicole': 'Kore', 'Clara': 'Zephyr',
  'Documentary Pro': 'Charon', 'Atlas (Do)': 'Fenrir', 'Priyanka': 'Zephyr', 'Virat': 'Charon',
  'Leo': 'Puck', 'Sophia': 'Kore', 'Hugo': 'Charon', 'Elara': 'Zephyr', 'Pankaj': 'Fenrir', 'Original Voice': 'Zephyr',
  'adam': 'Puck', 'brian': 'Charon', 'daniel': 'Fenrir', 'josh': 'Puck',
  'liam': 'Charon', 'michael': 'Fenrir', 'ryan': 'Puck', 'matthew': 'Charon',
  'bill': 'Fenrir', 'callum': 'Puck', 'frank': 'Fenrir', 'marcus': 'Charon',
  'jessica': 'Kore', 'sarah': 'Zephyr', 'matilda': 'Kore', 'emily': 'Zephyr',
  'bella': 'Kore', 'rachel': 'Zephyr', 'nicole': 'Kore', 'clara': 'Zephyr',
  'doc-pro': 'Charon', 'atlas-do': 'Fenrir', 'priyanka': 'Zephyr', 'virat-male': 'Charon',
  'leo': 'Puck', 'sophia': 'Kore', 'hugo': 'Charon', 'elara': 'Zephyr', 'pankaj': 'Fenrir', 'original': 'Zephyr',
  'sultan': 'Fenrir', 'vikram': 'Charon', 'bharat': 'Fenrir', 'titan': 'Puck',
  'shera': 'Fenrir', 'kaal': 'Charon', 'bheem': 'Fenrir', 'sikandar': 'Charon',
  'SULTAN': 'Fenrir', 'SHERA': 'Fenrir', 'KAAL': 'Charon', 'BHEEM': 'Fenrir', 'SIKANDAR': 'Charon', 'VIKRAM': 'Charon',
  'munna-bhai': 'Fenrir', 'sachinboy': 'Fenrir', 'Munna Bhai': 'Fenrir', 'Sachinboy': 'Fenrir',
  'maharaja': 'Fenrir', 'MAHARAJA': 'Fenrir', 'emperor-pro': 'Fenrir', 'EMPEROR PRO': 'Fenrir',
  'kabir': 'Charon', 'KABIR': 'Charon', 'aryan': 'Puck', 'ARYAN': 'Puck',
  'ishani': 'Kore', 'ISHANI': 'Kore', 'zoravar': 'Fenrir', 'ZORAVAR': 'Fenrir',
  'rudra': 'Fenrir', 'RUDRA': 'Fenrir',
  'veer': 'Fenrir', 'VEER': 'Fenrir', 'shakti': 'Zephyr', 'SHAKTI': 'Zephyr',
  'raja': 'Charon', 'RAJA': 'Charon', 'toofan': 'Puck', 'TOOFAN': 'Puck',
  'bhairav': 'Fenrir', 'BHAIRAV': 'Fenrir',
  'arav-neutral-pro': 'Charon', 'ARAV_NEUTRAL_PRO': 'Charon',
  'dev-deep-real': 'Fenrir', 'DEV_DEEP_REAL': 'Fenrir',
  'neel-soft-connect': 'Puck', 'NEEL_SOFT_CONNECT': 'Puck',
  'raj-classic-narrator': 'Charon', 'RAJ_CLASSIC_NARRATOR': 'Charon'
};

const VOICE_PROFILES: Record<string, { resonance: string; energy: string; timber: string; pacing: string; description: string }> = {
  'Adam': { resonance: 'Frontal-Oral', energy: 'High', timber: 'Sharp', pacing: 'Normal', description: 'Deep, authoritative tone of a 45-year-old male leader. Resonant, commanding, and professional cinematic voice.' },
  'Brian': { resonance: 'Chest', energy: 'Calm', timber: 'Smooth', pacing: 'Slow', description: 'Kind, trustworthy 30-year-old male with a soft, steady cadence and a friendly neighborhood vibe.' },
  'Daniel': { resonance: 'Frontal-Oral', energy: 'High', timber: 'Sharp', pacing: 'Fast', description: 'Energetic news anchor, mid-30s. Crisp, fast-paced, highly articulate broadcast professional.' },
  'Josh': { resonance: 'Throat', energy: 'High', timber: 'Airy', pacing: 'Normal', description: 'Youthful, energetic 20-year-old male. Natural conversational tone with slight breathiness and upbeat delivery.' },
  'Liam': { resonance: 'Mixed', energy: 'Calm', timber: 'Airy', pacing: 'Slow', description: 'Soft-spoken storyteller, mid-20s. Warm, empathetic, and gentle with distinct emotional depth.' },
  'Michael': { resonance: 'Chest', energy: 'Calm', timber: 'Gravelly', pacing: 'Slow', description: 'Mature 60-year-old narrator. Wise, sophisticated, with a distinct gravelly texture in the lower range.' },
  'Ryan': { resonance: 'Mixed', energy: 'Medium', timber: 'Gravelly', pacing: 'Normal', description: 'Casual, relatable mid-30s male. Authentic "guy-next-door" with slight rasp and conversational inflections.' },
  'Matthew': { resonance: 'Chest', energy: 'High', timber: 'Smooth', pacing: 'Normal', description: 'Intense 40-year-old action trailer narrator. Cinematic, dramatic, and intensely resonant.' },
  'Bill': { resonance: 'Throat', energy: 'Medium', timber: 'Gravelly', pacing: 'Slow', description: 'Rugged 50-year-old farmer type. Experienced, husky, and character-rich performance with rough edges.' },
  'Callum': { resonance: 'Frontal-Oral', energy: 'Medium', timber: 'Sharp', pacing: 'Normal', description: 'Elite British-style professor. Refined, precise, and sophisticated academic delivery.' },
  'Frank': { resonance: 'Chest', energy: 'High', timber: 'Smooth', pacing: 'Normal', description: 'Ultra-deep 55-year-old masculine icon. Powerful chest-voice with maximum bass resonance and authority.' },
  'Marcus': { resonance: 'Chest', energy: 'High', timber: 'Gravelly', pacing: 'Normal', description: 'Strong, motivational army sergeant. Commanding, inspiring, loud, and impactful.' },
  'Jessica': { resonance: 'Frontal-Oral', energy: 'High', timber: 'Sharp', pacing: 'Normal', description: 'Clear, professional 30-year-old corporate leader. Confident, friendly smile in the voice, and extremely crisp.' },
  'Sarah': { resonance: 'Mixed', energy: 'Calm', timber: 'Airy', pacing: 'Slow', description: 'Ethereal, soft-spoken young female. Gentle, soothing, and very quiet with a dream-like quality.' },
  'Matilda': { resonance: 'Frontal-Oral', energy: 'Medium', timber: 'Sharp', pacing: 'Normal', description: 'Intelligent, articulate university student. Professional, focused, and academic with clear delivery.' },
  'Emily': { resonance: 'Mixed', energy: 'High', timber: 'Smooth', pacing: 'Fast', description: 'Youthful, bubbly 19-year-old girl. High-energy, cheerful, and friendly with rapid pacing.' },
  'Bella': { resonance: 'Throat', energy: 'Medium', timber: 'Smooth', pacing: 'Slow', description: 'Elegant, sophisticated 40-year-old businesswoman. Premium, rich texture with a calm presence.' },
  'Rachel': { resonance: 'Mixed', energy: 'High', timber: 'Sharp', pacing: 'Normal', description: 'Dynamic, wide-ranging female actor. Versatile, expressive, and clear with high emotional intelligence.' },
  'Nicole': { resonance: 'Frontal-Oral', energy: 'Medium', timber: 'Sharp', pacing: 'Normal', description: 'Direct, confident 35-year-old journalist. No-nonsense, firm tone with broadcast standard clarity.' },
  'Clara': { resonance: 'Chest', energy: 'Calm', timber: 'Smooth', pacing: 'Slow', description: 'Kind 45-year-old motherly figure. Approachable, warm, and natural with a nurturing tone.' },
  'Documentary Pro': { resonance: 'Chest', energy: 'Medium', timber: 'Smooth', pacing: 'Normal', description: 'The absolute summit of documentary narration. Deep, mature, cinematic, and profoundly intelligent.' },
  'Atlas (Do)': { resonance: 'Chest', energy: 'High', timber: 'Smooth', pacing: 'Slow', description: 'Ultra-high fidelity cinematic voice. Deeply resonant with a legendary storytelling aura.' },
  'Virat': { resonance: 'Chest', energy: 'High', timber: 'Gravelly', pacing: 'Normal', description: 'Realistic, high-energy Hindi-English mix professional. Masculine, thick, and commanding. Documentary standard.' },
  'Priyanka': { resonance: 'Chest', energy: 'Medium', timber: 'Smooth', pacing: 'Normal', description: 'Powerful 40-year-old authoritative female. Perfect for documentaries and high-stakes narration.' },
  'SULTAN': { resonance: 'Chest', energy: 'High', timber: 'Gravelly', pacing: 'Slow', description: 'The Warrior. Ancient king tone. Every word vibrates with massive bass resonance and vocal fry.' },
  'Munna Bhai': { resonance: 'Throat', energy: 'High', timber: 'Sharp', pacing: 'Normal', description: 'Massive baritone Desi voice. Street-smart, energetic, and explosive power.' },
  'Sachinboy': { resonance: 'Frontal-Oral', energy: 'High', timber: 'Sharp', pacing: 'Normal', description: 'Heavyweight sporting champion. Monstrous energy, chest-rattling baritone, and confidence.' },
  'SHERA': { resonance: 'Chest', energy: 'High', timber: 'Gravelly', pacing: 'Normal', description: 'Alpha Motivator. Raw, aggressive, testosterone-driven masculine power. Extremely realistic.' },
  'KAAL': { resonance: 'Throat', energy: 'Medium', timber: 'Gravelly', pacing: 'Slow', description: 'The Mystery Shadow. Dark, cinematic, ultra-low frequency with mysterious undertones. Villainous profile.' },
  'BHEEM': { resonance: 'Chest', energy: 'High', timber: 'Gravelly', pacing: 'Slow', description: 'The Mythical Giant. Super-heavy baritone. The ground shakes with every word. Deepest human limit.' },
  'SIKANDAR': { resonance: 'Chest', energy: 'High', timber: 'Smooth', pacing: 'Normal', description: 'The Legend. Mature, wise warrior king. Rich bass for professional and epic narrations.' },
  'VIKRAM': { resonance: 'Throat', energy: 'Medium', timber: 'Smooth', pacing: 'Normal', description: 'The Dark Master. Smooth, mysterious, and cinematic with a brooding intensity.' },
  'EMPEROR PRO': { resonance: 'Chest', energy: 'High', timber: 'Smooth', pacing: 'Slow', description: 'Absolute Sovereign. Legendary deep baritone with a regal and commanding presence.' },
  'KABIR': { resonance: 'Chest', energy: 'Medium', timber: 'Smooth', pacing: 'Slow', description: 'Warm Poet and Storyteller. Wise, resonant, and deeply soulful storytelling tone.' },
  'ARYAN': { resonance: 'Frontal-Oral', energy: 'High', timber: 'Sharp', pacing: 'Normal', description: 'Intense Fitness Coach. High-energy, sharp, commanding, and extremely loud.' },
  'ZORAVAR': { resonance: 'Chest', energy: 'High', timber: 'Gravelly', pacing: 'Slow', description: 'The Heavy Tank. Ultra-deep, chest-rattling baritone built for trailer impact.' },
  'RUDRA': { resonance: 'Chest', energy: 'High', timber: 'Smooth', pacing: 'Normal', description: 'The Fearless Narrator. Gritty, serious, and extremely authoritative. Pure masculine grit.' },
  'Leo': { resonance: 'Mixed', energy: 'High', timber: 'Sharp', pacing: 'Normal', description: 'Vibrant young male, early 20s. Energetic, expressive, and friendly conversationalist.' },
  'Sophia': { resonance: 'Frontal-Oral', energy: 'High', timber: 'Smooth', pacing: 'Normal', description: 'Intimate female storyteller. Deeply emotional, soft, and resonant narration.' },
  'Hugo': { resonance: 'Chest', energy: 'Medium', timber: 'Smooth', pacing: 'Slow', description: 'Gravelly character actor. Mid-50s male with intense personality and rich tone.' },
  'Elara': { resonance: 'Mixed', energy: 'Medium', timber: 'Airy', pacing: 'Normal', description: 'Enthusiastic female host. Bright, energetic, and highly engaging for modern content.' },
  'Pankaj': { resonance: 'Chest', energy: 'Medium', timber: 'Gravelly', pacing: 'Slow', description: 'Ultra-authoritative male baritone. 100% realistic masculine grit with authority.' },
  'ISHANI': { resonance: 'Frontal-Oral', energy: 'High', timber: 'Sharp', pacing: 'Normal', description: 'High-class female presenter. Elegant, sophisticated, and flawlessly professional.' },
  'VEER': { resonance: 'Chest', energy: 'High', timber: 'Gravelly', pacing: 'Normal', description: 'The Braveheart. High-energy, loud, and incredibly powerful warrior male.' },
  'SHAKTI': { resonance: 'Frontal-Oral', energy: 'High', timber: 'Sharp', pacing: 'Normal', description: 'Female Power Leader. Strong, authoritative, and inspiring leadership voice.' },
  'RAJA': { resonance: 'Chest', energy: 'High', timber: 'Smooth', pacing: 'Normal', description: 'The Royal Prince. Youthful but powerful. Deep, resonant, and prestigious male.' },
  'TOOFAN': { resonance: 'Throat', energy: 'High', timber: 'Sharp', pacing: 'Fast', description: 'The Storm. Extremely fast-paced, explosive energy, and rapid-fire delivery.' },
  'BHAIRAV': { resonance: 'Chest', energy: 'High', timber: 'Gravelly', pacing: 'Slow', description: 'The Intense Sage. Gritty, impactful, and serious professional narration.' },
  'ARAV_NEUTRAL_PRO': { resonance: 'Mixed', energy: 'Medium', timber: 'Smooth', pacing: 'Normal', description: 'Modern Indian Male. Balanced, confident, and grounded. Natural urban Hindi speaker.' },
  'DEV_DEEP_REAL': { resonance: 'Chest', energy: 'Medium', timber: 'Smooth', pacing: 'Slow', description: 'Deep Mature Indian Elder. Stable, trustworthy, and authoritative traditional Hindi voice.' },
  'NEEL_SOFT_CONNECT': { resonance: 'Mixed', energy: 'Medium', timber: 'Airy', pacing: 'Normal', description: 'Friendly Indian Friend. Warm, casual, and relatable with a soft Hindi-English touch.' },
  'RAJ_CLASSIC_NARRATOR': { resonance: 'Chest', energy: 'High', timber: 'Smooth', pacing: 'Normal', description: 'Epic Hindi Narrator. Clear, composed, and formal. Built for grand stories and historical accounts.' }
};

const ActiveVoiceProfile = ({ voice, onPlaySample }: { voice: Voice, onPlaySample: () => void }) => {
  const profile = VOICE_PROFILES[voice.name] || {
    resonance: 'Mixed',
    energy: 'Medium',
    timber: 'Smooth',
    pacing: 'Normal',
    description: voice.description
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-2xl shadow-zinc-200/50 relative overflow-hidden group mb-8"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-transparent rounded-full -mr-32 -mt-32 opacity-50 group-hover:scale-110 transition-transform duration-700" />
      
      <div className="relative flex flex-col md:flex-row gap-8 items-start">
        <div className="relative shrink-0">
          <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-gradient-to-br ${voice.color} flex items-center justify-center font-display font-black text-5xl md:text-6xl text-white shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105 overflow-hidden`}>
            <span>{voice.name[0]}</span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <Mic size={40} className="text-white opacity-20" />
            </div>
          </div>
          <div className={`absolute inset-0 bg-gradient-to-br ${voice.color} blur-2xl opacity-20 -z-0 scale-110`} />
          
          <button 
            onClick={onPlaySample}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-zinc-900 border border-zinc-100 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all z-20 flex items-center gap-2 whitespace-nowrap"
          >
            <Play size={12} className="fill-current" />
            Sample Audio
          </button>
        </div>

        <div className="flex-1 space-y-6 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-3xl font-display font-black text-zinc-900 tracking-tight">{voice.name}</h3>
              {voice.isPremium && (
                <div className="px-3 py-1 bg-amber-50 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-amber-100">
                  <Crown size={12} />
                  Elite
                </div>
              )}
            </div>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em]">{voice.gender} • {voice.isCloned ? 'Custom Voice Print' : 'Neural Studio Model'}</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Resonance', value: profile.resonance, icon: Music },
              { label: 'Energy', value: profile.energy, icon: Zap },
              { label: 'Timber', value: profile.timber, icon: Mic },
              { label: 'Pacing', value: profile.pacing, icon: Timer }
            ].map((attr) => (
              <div key={attr.label} className="space-y-1.5 p-3 rounded-2xl bg-zinc-50 border border-zinc-100/50 group/attr hover:bg-white hover:shadow-lg transition-all border shadow-sm">
                <div className="flex items-center gap-2 text-zinc-400">
                   <attr.icon size={10} />
                   <span className="text-[9px] font-black uppercase tracking-widest">{attr.label}</span>
                </div>
                <p className="text-xs font-bold text-zinc-800">{attr.value}</p>
              </div>
            ))}
          </div>

          <p className="text-zinc-600 text-sm leading-relaxed font-medium bg-zinc-50/50 p-5 rounded-3xl border border-zinc-100/30">
            {profile.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  currentUser, 
  userProfile, 
  onLogin, 
  onLogout, 
  handleShare,
  setIsPricingModalOpen,
  setShowVoiceLibrary,
  setShowSettings,
  selectedVoice
}: any) {
  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 p-6 flex flex-col gap-8 transition-transform duration-300 ease-in-out
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
          onClick={() => { setActiveTab('voice-changer'); setIsMobileMenuOpen(false); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'voice-changer' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
        >
          <RefreshCw size={20} />
          Voice Changer
        </button>
        <button 
          onClick={() => { setActiveTab('voice-clone'); setIsMobileMenuOpen(false); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'voice-clone' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
        >
          <Sparkles size={20} />
          Voice Clone
        </button>
        <button 
          onClick={() => { setActiveTab('captions'); setIsMobileMenuOpen(false); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'captions' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
        >
          <Video size={20} />
          Auto Caption
        </button>
        <button 
          onClick={() => { setActiveTab('history'); setIsMobileMenuOpen(false); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
        >
          <History size={20} />
          Generation History
        </button>
        <button 
          onClick={() => { setActiveTab('library'); setIsMobileMenuOpen(false); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'library' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
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
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="" 
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full border border-zinc-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200 font-bold"
                style={{ display: currentUser.photoURL ? 'none' : 'flex' }}
              >
                {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
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
                <button onClick={onLogout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors" title="Logout">
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
            onClick={onLogin}
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
  );
}

function App() {
  console.log("VoxNova: App component initializing...");
  
  useEffect(() => {
    testFirestoreConnection();
  }, []);
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
  const [exhaustedCount, setExhaustedCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [history, setHistory] = useState<Generation[]>([]);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [lastGeneration, setLastGeneration] = useState<Generation | null>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [clonedVoices, setClonedVoices] = useState<Voice[]>([]);

  // Combined voices list
  const allVoices = React.useMemo(() => [...VOICES, ...clonedVoices], [clonedVoices]);

  // Load guest history from sessionStorage on mount
  useEffect(() => {
    const guestHistory = sessionStorage.getItem('voxnova_guest_history');
    if (guestHistory && !currentUser) {
      try {
        setHistory(JSON.parse(guestHistory));
      } catch (e) {
        console.error("Failed to parse guest history", e);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setClonedVoices([]);
      return;
    }

    const q = query(
      collection(db, 'cloned_voices'),
      where('uid', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const voices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Voice[];
      
      // Sort in memory by createdAt
      voices.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      
      setClonedVoices(voices);
    }, (error) => {
      console.error("Error fetching cloned voices:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);
  const [showVoiceLibrary, setShowVoiceLibrary] = useState(false);
  const [showLimitToast, setShowLimitToast] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'captions' | 'voice-changer' | 'library' | 'tts' | 'voice-clone'>('generate');
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [captionLanguage, setCaptionLanguage] = useState('All Languages');
  const [sourceLanguage, setSourceLanguage] = useState('Auto');
  const [isVoiceChanging, setIsVoiceChanging] = useState(false);
  const [voiceChangingStep, setVoiceChangingStep] = useState('');
  const [voiceChangingProgress, setVoiceChangingProgress] = useState(0);
  const [voiceChangingResult, setVoiceChangingResult] = useState<any>(null);
  const [voiceChangingFile, setVoiceChangingFile] = useState<File | null>(null);

  const [showShareToast, setShowShareToast] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };
  const [isAuthLoading, setIsAuthLoading] = useState(true);

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

  const [voiceSearchTerm, setVoiceSearchTerm] = useState('');
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [playingId, setPlayingId] = useState<string | number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [captionFile, setCaptionFile] = useState<File | null>(null);
  const [captionResult, setCaptionResult] = useState<any>(null);
  const [captionWords, setCaptionWords] = useState<CaptionWord[]>([]);
  const [captionScriptType, setCaptionScriptType] = useState<'hindi' | 'hinglish'>('hindi');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('professional-three-color');
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>({
    ...CAPTION_PRESETS.find(p => p.id === 'professional-three-color')?.style || CAPTION_PRESETS[0].style,
    fontSize: 25,
    wordsPerLine: 3,
    isSmart: true
  });
  const [captionAnimation, setCaptionAnimation] = useState<string>(CAPTION_PRESETS.find(p => p.id === 'professional-three-color')?.animation || 'typewriter');
  const [isSettingsLocked, setIsSettingsLocked] = useState(false);
  const [isEditingCaptions, setIsEditingCaptions] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [captionOffset, setCaptionOffset] = useState(0); // Set to 0 by default for true sync
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isCaptioning, setIsCaptioning] = useState(false);
  const [captionStep, setCaptionStep] = useState('');
  const [captionProgress, setCaptionProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [showConfigError, setShowConfigError] = useState(false);
  const [translateToEnglish, setTranslateToEnglish] = useState(false);
  
  // Smooth time tracking for captions to ensure millimeter-precision
  useEffect(() => {
    let frameId: number;
    const updateSmoothTime = () => {
      const activeRef = activeTab === 'captions' ? videoRef.current : audioRef.current;
      if (activeRef && !activeRef.paused) {
        // Zero delay sync: Update every frame
        setCurrentTime(activeRef.currentTime);
        setAudioCurrentTime(activeRef.currentTime);
      }
      frameId = requestAnimationFrame(updateSmoothTime);
    };
    
    frameId = requestAnimationFrame(updateSmoothTime);
    return () => cancelAnimationFrame(frameId);
  }, [activeTab]);
  const [shadowColor, setShadowColor] = useState('#000000');

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



  const [isClassifying, setIsClassifying] = useState(false);

  const handleClassifyScript = async () => {
    if (!text || text.length < 10) {
      showToast("Please enter a longer script for analysis.");
      return;
    }
    setIsClassifying(true);
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const response = await fetch('/api/classify-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ text })
      });
      if (!response.ok) throw new Error("Classification failed");
      const { suggestedVoiceId, category } = await response.json();
      const voice = allVoices.find(v => v.id === suggestedVoiceId);
      if (voice) {
        setSelectedVoice(voice);
        showToast(`Magic Suggest: Selected ${voice.name} for your ${category} script!`);
      }
    } catch (err) {
      console.error("Classification error:", err);
      showToast("Failed to analyze script. Please select a voice manually.");
    } finally {
      setIsClassifying(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.target.value;
    // If user pastes more than 5000, we allow up to 10000 but truncate to 5000 like ElevenLabs
    if (val.length > 5000) {
      val = val.substring(0, 5000);
      setShowLimitToast(true);
      setTimeout(() => setShowLimitToast(false), 3000);
    }
    
    const limit = currentUser ? 5000 : 300; // Increased guest limit slightly
    if (val.length <= limit) {
      setText(val);
    } else {
      setText(val.substring(0, limit));
      setShowLimitToast(true);
      setTimeout(() => setShowLimitToast(false), 3000);
    }
  };

  const handleResetSettings = () => {
    setSpeed(1.0);
    setPitch(1.0);
    setPause(0.5);
    setAudioFormat('mp3');
    setTargetSampleRate(48000);
    setStyle('normal');
    setStudioClarity(false);
  };

  useEffect(() => {
    // Safety timeout for auth loading
    const safetyTimer = setTimeout(() => {
      if (isAuthLoading) {
        console.warn("Auth loading timed out, forcing app load");
        setIsAuthLoading(false);
      }
    }, 2500); // Shorter safety timeout for better UX

    if (!auth) {
      setIsAuthLoading(false);
      clearTimeout(safetyTimer);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth State Changed:", user?.email);
      setCurrentUser(user);
      setIsAuthLoading(false);
      clearTimeout(safetyTimer);
      if (user) {
        fetchUserProfile(user);
      } else {
        setUserProfile(null);
        // Load guest history from localStorage when logged out
        const guestHistory = localStorage.getItem('voxnova_guest_history');
        if (guestHistory) {
          try {
            setHistory(JSON.parse(guestHistory));
          } catch (e) {
            setHistory([]);
          }
        } else {
          setHistory([]);
        }
      }
    }, (error) => {
      console.error("Auth State Error:", error);
      setIsAuthLoading(false);
      clearTimeout(safetyTimer);
      setError("Authentication service encountered an error. Please refresh the page.");
    });
    return () => {
      unsubscribe();
      clearTimeout(safetyTimer);
    };
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
      // For popups in restricted environments, we can try to catch common errors
      const result = await signInWithPopup(auth, googleProvider).catch(async (err) => {
        if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
          console.warn("Popup blocked, trying redirect fallback...");
          // We could try redirect here but it often fails in iframes. 
          // For now, just inform the user.
          throw new Error("Login popup was blocked by your browser. Please allow popups for this site.");
        }
        throw err;
      });

      console.log("Login successful:", result.user.email);
      if (analytics) {
        logEvent(analytics, 'login', {
          method: 'Google',
          user_id: result.user.uid
        });
      }
    } catch (err: any) {
      console.error('Login failed', err);
      // More user-friendly errors
      let msg = err.message || "Please check your internet connection and try again.";
      if (err.code === 'auth/network-request-failed') msg = "Network error. Please check your internet connection.";
      if (err.code === 'auth/internal-error') msg = "Firebase service internal error. Please try again in a few moments.";
      
      setError(`Login failed: ${msg}`);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    setIsAuthLoading(true);
    try {
      console.log("Starting Logout...");
      // Try to sign out normally
      await signOut(auth).catch(err => {
        console.warn("Firebase signOut failed, forcing local cleanup", err);
      });
      
      console.log("Logout cleanup...");
      // Always clear local state even if Firebase failed
      setCurrentUser(null);
      setUserProfile(null);
      setHistory([]);
      
      // Clear sensitive storage
      localStorage.removeItem('voxnova_user_profile');
      localStorage.removeItem('voxnova_guest_history'); // Also clear guest history to be safe
      
      setIsAuthLoading(false);
      showToast("Successfully logged out");
      window.location.reload(); // Force a fresh state on logout to avoid Firebase zombies
    } catch (err: any) {
      console.error('Logout failed completely', err);
      setError(`Logout failed: ${err.message || "Unknown error"}. Please refresh the page manually.`);
      
      // Absolute fallback
      setCurrentUser(null);
      setUserProfile(null);
    } finally {
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
    // Debug connectivity - small delay to let server warm up
    setTimeout(() => {
      fetch('/api/health')
        .then(r => r.json())
        .then(d => console.log('Server Health:', d))
        .catch(e => {
          // Only log if it's not a temporary fetch error during startup
          if (process.env.NODE_ENV === 'development') {
            console.warn('Server Health Check (Harmless if server is still starting):', e.message);
          }
        });
    }, 2000);
  }, []);

  const checkApiKey = async () => {
    if ((window as any).aistudio?.hasSelectedApiKey) {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
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
      if (Array.isArray(data)) {
        // Filter out duplicates by ID
        const uniqueHistory = data.reduce((acc: Generation[], current: Generation) => {
          const x = acc.find(item => item.id === current.id);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
        setHistory(uniqueHistory);
      } else {
        console.error('History data is not an array:', data);
        setHistory([]);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
      setHistory([]);
    }
  };

  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'rate-limit' | 'network' | 'auth' | 'general' | null>(null);

  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showBlog, setShowBlog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    // Ensure we start at the top
    window.scrollTo(0, 0);
  };

  // Persistent Caption Settings
  useEffect(() => {
    const savedStyle = localStorage.getItem('voxnova_caption_style');
    const savedAnimation = localStorage.getItem('voxnova_caption_animation');
    const savedPresetId = localStorage.getItem('voxnova_caption_preset_id');
    const savedOffset = localStorage.getItem('voxnova_caption_offset');
    
    if (savedStyle) {
      try {
        setCaptionStyle(JSON.parse(savedStyle));
      } catch (e) {
        console.error("Failed to parse saved caption style", e);
      }
    }
    if (savedAnimation) setCaptionAnimation(savedAnimation);
    if (savedPresetId) {
      setSelectedPresetId(savedPresetId);
    } else {
      setSelectedPresetId('professional-three-color');
    }
    if (savedOffset) setCaptionOffset(parseInt(savedOffset));
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('voxnova_caption_style', JSON.stringify(captionStyle));
      localStorage.setItem('voxnova_caption_animation', captionAnimation);
      localStorage.setItem('voxnova_caption_preset_id', selectedPresetId);
      localStorage.setItem('voxnova_caption_offset', captionOffset.toString());
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [captionStyle, captionAnimation, selectedPresetId, captionOffset]);

  const resetCaptionSettings = () => {
    setCaptionStyle(CAPTION_PRESETS.find(p => p.id === 'professional-three-color')?.style || CAPTION_PRESETS[0].style);
    setCaptionAnimation(CAPTION_PRESETS.find(p => p.id === 'professional-three-color')?.animation || 'typewriter');
    setSelectedPresetId('professional-three-color');
    setCaptionOffset(0);
    localStorage.removeItem('voxnova_caption_style');
    localStorage.removeItem('voxnova_caption_animation');
    localStorage.removeItem('voxnova_caption_preset_id');
    localStorage.removeItem('voxnova_caption_offset');
    showToast("Caption settings reset to default");
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
        body: JSON.stringify({ 
          voice_id: voice.id, 
          voice_name: voice.name,
          language: language 
        })
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

  const ffmpegRef = useRef<any>(null);
  const isFFmpegLoading = useRef(false);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);

  const base64ToAudioBlob = (base64: string) => {
    const pcmBuffer = base64ToArrayBuffer(base64);
    const firstFour = new Uint8Array(pcmBuffer.slice(0, 4));
    const isAlreadyWav = String.fromCharCode(firstFour[0], firstFour[1], firstFour[2], firstFour[3]) === 'RIFF';
    
    if (isAlreadyWav) {
      return new Blob([pcmBuffer], { type: 'audio/wav' });
    } else {
      const wavHeader = createWavHeader(pcmBuffer, 24000);
      const combinedBuffer = new Uint8Array(wavHeader.byteLength + pcmBuffer.byteLength);
      combinedBuffer.set(new Uint8Array(wavHeader), 0);
      combinedBuffer.set(new Uint8Array(pcmBuffer), wavHeader.byteLength);
      return new Blob([combinedBuffer], { type: 'audio/wav' });
    }
  };

  const loadFFmpeg = async () => {
    if (ffmpegRef.current && ffmpegRef.current.loaded) return;
    
    if (isFFmpegLoading.current) {
      console.log("[VoxNova] Engine busy, waiting...");
      let waitTime = 0;
      while (isFFmpegLoading.current && waitTime < 20) {
        await new Promise(r => setTimeout(r, 500));
        waitTime++;
      }
      if (ffmpegRef.current?.loaded) return;
    }
    
    isFFmpegLoading.current = true;
    try {
      console.log("[VoxNova] Igniting engine...");
      setCaptionStep('Waking up engine...');
      
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { toBlobURL } = await import('@ffmpeg/util');
      
      const ffmpeg = new FFmpeg();
      
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';
      const loadPromise = ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      ffmpeg.on('log', ({ message }) => {
        if (message.includes('loading')) {
           setCaptionStep(`Engine Loading... (${message})`);
        }
      });

      // Add 10 minute timeout for loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Engine initial load timeout. Your connection might be too slow to download the 30MB engine. Please refresh or try a faster network.')), 600000)
      );

      await Promise.race([loadPromise, timeoutPromise]);
      
      ffmpegRef.current = ffmpeg;
      setIsFFmpegLoaded(true);
      console.log("[VoxNova] Engine active and ready.");
      
      ffmpeg.on('progress', ({ progress }) => {
        if (isCaptioning) {
          setCaptionProgress(Math.floor(progress * 100));
        } else if (isVoiceChanging) {
          const finalPhase = Math.floor(88 + (progress * 11)); 
          setVoiceChangingProgress(prev => Math.max(prev, finalPhase));
        }
      });
    } catch (err: any) {
      console.error("[VoxNova] Engine load failure:", err);
      setError(`Engine failed: ${err.message}. Please refresh the page.`);
    } finally {
      isFFmpegLoading.current = false;
    }
  };

  useEffect(() => {
    loadFFmpeg();
  }, []);

    const generateASS = (words: CaptionWord[], style: CaptionStyle, videoWidth: number = 1280, videoHeight: number = 720, overrideFontName?: string) => {
    const isPortrait = videoHeight > videoWidth;
    
    const displayWords = groupWordsIntoLines(words.map(w => ({
      ...w,
      start: Math.max(0, w.start - (captionOffset / 1000)),
      end: Math.max(0, w.end - (captionOffset / 1000))
    })), style.wordsPerLine);
    const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 100);
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    const alignment = 2; // Bottom Center
    const fontName = overrideFontName || style.font || 'Inter';

    const hexToAss = (hex: string) => {
      const cleanHex = hex.replace('#', '');
      if (cleanHex.length === 3) {
        const r = cleanHex[0] + cleanHex[0];
        const g = cleanHex[1] + cleanHex[1];
        const b = cleanHex[2] + cleanHex[2];
        return `&H00${b}${g}${r}`;
      }
      if (cleanHex.length === 6) {
        return `&H00${cleanHex.substring(4, 6)}${cleanHex.substring(2, 4)}${cleanHex.substring(0, 2)}`;
      }
      return '&H00FFFFFF';
    };

    const assColor = hexToAss(style.color);
    const assOutlineColor = hexToAss(style.outlineColor || '#000000');
    const assShadowColor = hexToAss(style.shadowColor || '#000000');
    
    // Triple Border Color support for ASS
    const c1 = style.tripleBorderColors?.[0] ? hexToAss(style.tripleBorderColors[0]) : assOutlineColor;
    const c2 = style.tripleBorderColors?.[1] ? hexToAss(style.tripleBorderColors[1]) : assOutlineColor;
    const c3 = style.tripleBorderColors?.[2] ? hexToAss(style.tripleBorderColors[2]) : assShadowColor;

    const outline = style.tripleBorder ? 12 : (style.strokeWidth || (style.border === 'thick' ? 5 : style.border === 'thin' ? 2 : 0));
    const shadow = style.tripleBorder ? 0 : (style.shadow ? 4 : 0);
    const spacing = 4; 
    
    // Scale Font size based on resolution
    const baseResY = 720;
    const scaledSize = Math.round(style.fontSize * (videoHeight / baseResY) * 1.3); // Slightly larger for video legibility

    let ass = `[Script Info]
ScriptType: v4.00+
PlayResX: ${videoWidth}
PlayResY: ${videoHeight}
ScaledBorderAndShadow: yes
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColor, SecondaryColor, OutlineColor, BackColor, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${scaledSize},${assColor},&H000000FF,${assOutlineColor},${assShadowColor},1,0,0,0,100,100,${spacing},0,1,${outline},${shadow},${alignment},20,20,${isPortrait ? 80 : 40},1
Style: Layer3,${fontName},${scaledSize},${assColor},&H000000FF,${c3},&H00000000,1,0,0,0,100,100,${spacing},0,1,10,0,${alignment},20,20,${isPortrait ? 80 : 40},1
Style: Layer2,${fontName},${scaledSize},${assColor},&H000000FF,${c2},&H00000000,1,0,0,0,100,100,${spacing},0,1,6,0,${alignment},20,20,${isPortrait ? 80 : 40},1
Style: Layer1,${fontName},${scaledSize},${assColor},&H000000FF,${c1},&H00000000,1,0,0,0,100,100,${spacing},0,1,2,0,${alignment},20,20,${isPortrait ? 80 : 40},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    displayWords.forEach((w, idx) => {
      const isDevanagari = /[\u0900-\u097F]/.test(w.word);
      let text = (style.case === 'uppercase' && !isDevanagari) ? w.word.toUpperCase() : (style.case === 'lowercase' && !isDevanagari) ? w.word.toLowerCase() : w.word;
      
      text = text.replace(/\u00A0\u00A0\u00A0\u00A0/g, '\\h\\h\\h\\h'); 

      if (style.tripleBorder) {
        // Triple Border Layering in ASS - Stacking 3 dialogue lines for perfect pixel-perfect borders
        const startTime = formatTime(w.start);
        const endTime = formatTime(w.end);
        
        // Deepest Layer (Border 3)
        ass += `Dialogue: 0,${startTime},${endTime},Layer3,,0,0,0,,${text}\n`;
        // Middle Layer (Border 2)
        ass += `Dialogue: 1,${startTime},${endTime},Layer2,,0,0,0,,${text}\n`;
        // Top Layer (Border 1 + Fill)
        ass += `Dialogue: 2,${startTime},${endTime},Layer1,,0,0,0,,${text}\n`;
      } else {
        if (style.isDynamic) {
          const colors = style.threeColors || ['#ffffff', '#ffff00', '#00ff00'];
          const color = colors[idx % colors.length];
          const assWordColor = hexToAss(color);
          text = `{\\c${assWordColor}}${text}`;
        }
        ass += `Dialogue: 0,${formatTime(w.start)},${formatTime(w.end)},Default,,0,0,0,,${text}\n`;
      }
    });

    return ass;
  };

  const burnCaptions = async (videoFile: File, words: CaptionWord[], style: CaptionStyle) => {
    setCaptionStep('Preparing High-Speed Engine...');
    setCaptionProgress(5);
    console.log("[VoxNova] Starting burnCaptions process...");
    
    if (!ffmpegRef.current) {
      await loadFFmpeg();
    }
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg) {
      let errorMsg = "Video engine (FFmpeg) failed to initialize.";
      if (!window.crossOriginIsolated) {
        errorMsg += " Security constraints (COOP/COEP) are not active. Try opening the app in a new tab if you're in a restricted environment.";
      } else {
        errorMsg += " Check your connection or try refreshing the page.";
      }
      throw new Error(errorMsg);
    }
    
    const { fetchFile } = await import('@ffmpeg/util');
    const inputName = 'input.mp4';
    const outputName = 'output.mp4';
    const assName = 'subtitles.ass';
    
    // Dynamic Font Loading
    const selectedFont = style.font || 'Inter';
    const fontMapping: Record<string, string> = {
      'Inter': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/inter/Inter-Bold.ttf',
      'Poppins': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Bold.ttf',
      'Montserrat': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/montserrat/Montserrat-Bold.ttf',
      'Rajdhani': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/rajdhani/Rajdhani-Bold.ttf',
      'Kalam': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/kalam/Kalam-Bold.ttf',
      'Hind': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/hind/Hind-Bold.ttf',
      'Teko': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/teko/Teko-Bold.ttf',
      'Martel': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/martel/Martel-Bold.ttf',
      'Bangers': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/bangers/Bangers-Regular.ttf',
      'Luckiest Guy': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/luckiestguy/LuckiestGuy-Regular.ttf'
    };

    // We use the selectedFont name directly as both the filename and internal name for highest reliability
    // We also use a more standard approach for FFmpeg font handling
    const safeFontName = selectedFont.replace(/\s+/g, '');
    const fontFileName = `${safeFontName}.ttf`;
    const internalFontName = safeFontName;
    const fontUrl = fontMapping[selectedFont] || fontMapping['Inter'];
    
    setCaptionStep('Syncing engine with video storage...');
    try {
      // Ensure engine is truly loaded before writing LARGE files
      if (!ffmpeg) throw new Error("FFmpeg engine not initialized");
      
      const videoData = await fetchFile(videoFile);
      if (!videoData || videoData.length === 0) throw new Error("Unable to read video file content");
      
      await ffmpeg.writeFile(inputName, videoData);
      
      setCaptionStep('Optimizing font layers...');
      const fontData = await fetchFile(fontUrl);
      await ffmpeg.writeFile(fontFileName, fontData);
      // Copy to standard name as backup
      await ffmpeg.writeFile('StyleFont.ttf', fontData);
    } catch (e: any) {
      console.error("FFmpeg storage failure:", e);
      const msg = e.message || "Failed to write into virtual memory";
      throw new Error(`FFmpeg error: ${msg}. Your browser might have run out of memory. Please close other tabs, refresh the app, and try again with a shorter video.`);
    }
    
    setCaptionStep('Mapping video architecture...');
    let videoWidth = 1280;
    let videoHeight = 720;
    try {
      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(videoFile);
      await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
          let w = videoElement.videoWidth;
          let h = videoElement.videoHeight;
          const MAX_DIM = 1280;
          if (w > MAX_DIM || h > MAX_DIM) {
            const ratio = Math.min(MAX_DIM / w, MAX_DIM / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          videoWidth = w % 2 === 0 ? w : w - 1;
          videoHeight = h % 2 === 0 ? h : h - 1;
          resolve(true);
        };
        videoElement.onerror = () => resolve(false);
        setTimeout(() => resolve(false), 8000); 
      });
      URL.revokeObjectURL(videoElement.src);
    } catch (e) {
      // Fallback
    }
    
    // Create ASS with forced font styling for FFmpeg compatibility
    // We use StyleFont as the face name but fallback to standard fonts if StyleFont fails
    const assContent = generateASS(words, style, videoWidth, videoHeight, internalFontName);
    await ffmpeg.writeFile(assName, assContent);
    
    setCaptionStep('Burning captions into video...');
    // setIsExporting(true); // Already set in handleExportCaptions
    setCaptionProgress(0);
    
    ffmpeg.on('progress', ({ progress }) => {
      setCaptionProgress(Math.min(95, Math.floor(progress * 100)));
    });

    try {
      console.log("[VoxNova] Starting High-Quality Encoding...");
      
      await ffmpeg.exec([
        '-y', 
        '-i', inputName, 
        '-vf', `scale=${videoWidth}:${videoHeight}:force_original_aspect_ratio=decrease,pad=${videoWidth}:${videoHeight}:(ow-iw)/2:(oh-ih)/2,subtitles='${assName}':fontsdir=.`, 
        '-c:v', 'libx264', 
        '-preset', 'ultrafast', 
        '-crf', '22', 
        '-pix_fmt', 'yuv420p',
        '-c:a', 'copy',
        outputName
      ]);
    } catch (e: any) {
      console.error("Burn-in failure, trying aggressive fallback...", e);
      try {
        await ffmpeg.exec([
          '-y', 
          '-i', inputName, 
          '-vf', `subtitles=${assName}`,
          '-c:v', 'libx264', 
          '-preset', 'ultrafast', 
          '-pix_fmt', 'yuv420p',
          '-c:a', 'copy',
          outputName
        ]);
      } catch (innerE: any) {
        throw new Error(`Video encoding failed. This happens if the video resolution is too high for the browser memory. Try using a 720p or lower resolution video.`);
      }
    }
    
    setCaptionProgress(95);
    setCaptionStep('Finalizing download...');
    
    console.log("Reading final output...");
    const data = await ffmpeg.readFile(outputName);
    
    setCaptionStep('Finalizing video encoding...');
    setCaptionProgress(98);
    
    // Memory Cleanup
    try {
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(assName);
      await ffmpeg.deleteFile(outputName);
    } catch (e) {
      console.warn("Cleanup failed", e);
    }
    
    setCaptionProgress(100);
    setCaptionStep('Success!');
    
    if (!data || (data as any).length === 0) throw new Error("Generated video is empty");
    return new Blob([data], { type: 'video/mp4' });
  };

  const mergeAudioWithVideo = async (videoFile: File, audioData: string) => {
    setVoiceChangingProgress(81);
    setVoiceChangingStep('Preparing engine...');
    if (!ffmpegRef.current) {
      await loadFFmpeg();
      // Double check if it loaded
      if (!ffmpegRef.current) {
        let errorMsg = "FFmpeg could not be initialized.";
        if (!window.crossOriginIsolated) {
          errorMsg += " Security constraints (COOP/COEP) are not active. Try opening the app in a new tab if you are in a restricted environment.";
        } else {
          errorMsg += " Check your internet connection or try refreshing the page.";
        }
        throw new Error(errorMsg);
      }
    }
    const ffmpeg = ffmpegRef.current;
    
    // Set 81% to show we entered the FFmpeg phase
    setVoiceChangingProgress(81);
    
    const { fetchFile } = await import('@ffmpeg/util');
    const inputVideo = 'video.mp4';
    const inputAudio = 'audio.wav';
    const outputName = 'processed.mp4';
    
    // Clear any previous files to prevent disk usage issues
    try {
      await ffmpeg.deleteFile(inputVideo);
      await ffmpeg.deleteFile(inputAudio);
      await ffmpeg.deleteFile(outputName);
    } catch (e) { /* Ignore */ }
    
    setVoiceChangingStep('Writing video track...');
    setVoiceChangingProgress(82);
    // Use an intermediate variable to avoid potential fetchFile hang in writeFile
    const videoData = await fetchFile(videoFile);
    await ffmpeg.writeFile(inputVideo, videoData);
    
    setVoiceChangingStep('Preparing audio track...');
    setVoiceChangingProgress(85);
    
    // The server already provides a full WAV file with RIFF header
    const audioBuffer = base64ToArrayBuffer(audioData);
    await ffmpeg.writeFile(inputAudio, new Uint8Array(audioBuffer));
    setVoiceChangingProgress(88);
    
    setVoiceChangingStep('Merging audio and video...');
    
    try {
      // Standard MP4 merge - try copy first for lightning speed
      await ffmpeg.exec([
        '-i', inputVideo, 
        '-i', inputAudio, 
        '-c:v', 'copy', 
        '-c:a', 'aac', 
        '-b:a', '128k',
        '-map', '0:v:0', 
        '-map', '1:a:0', 
        '-shortest',
        '-y',
        outputName
      ]);
    } catch (e) {
      console.warn("FFmpeg copy failed, trying full merge...", e);
      // Fallback merge without 'copy' which handles different container formats better
      await ffmpeg.exec([
        '-i', inputVideo, 
        '-i', inputAudio, 
        '-c:v', 'copy', // Keep video fast
        '-c:a', 'aac',
        '-shortest',
        '-y',
        outputName
      ]);
    }
    setVoiceChangingProgress(99);
    setVoiceChangingStep('Finalizing file...');
    const data = await ffmpeg.readFile(outputName);
    
    // Cleanup
    try {
      await ffmpeg.deleteFile(inputVideo);
      await ffmpeg.deleteFile(inputAudio);
      await ffmpeg.deleteFile(outputName);
    } catch (e) {
      // Ignore
    }
    
    return new Blob([data], { type: 'video/mp4' });
  };

  const handleVoiceChanger = async () => {
    if (!voiceChangingFile) return;
    const limit = currentUser ? 1024 * 1024 * 1024 : 100 * 1024 * 1024; // 1GB for logged in, 100MB for guest
    if (voiceChangingFile.size > limit) {
      setError(`File is too large (> ${currentUser ? '1GB' : '100MB'}). Please upload a smaller file.`);
      return;
    }
    setIsVoiceChanging(true);
    setVoiceChangingProgress(0);
    setVoiceChangingStep('Preparing file...');

    try {
      const fileData = await fileToBase64(voiceChangingFile);
      
      setVoiceChangingProgress(20);
      setVoiceChangingStep('Neural voice transfer in progress...');

      const token = currentUser ? await currentUser.getIdToken() : null;
      
      const response = await fetch('/api/voice-changer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          fileData,
          voice_id: selectedVoice.id,
          mode: 'dubbing', // Using dubbing mode for voice changing
          targetLanguage: language === 'hi' ? 'Hindi' : 'English'
        })
      });

      if (!response.ok) {
        let errMessage = "Voice conversion failed";
        try {
          const errData = await response.json();
          errMessage = errData.error || errMessage;
        } catch (e) {
          const textErr = await response.text();
          console.error("Non-JSON error from voice-changer:", textErr.substring(0, 200));
        }
        throw new Error(errMessage);
      }

      const data = await response.json();
      const audioBase64 = data.audioData;
      const resultText = data.transcribedText || data.text || "";
      
      setVoiceChangingProgress(80);
      setVoiceChangingStep('Finalizing audio stream...');

      if (voiceChangingFile.type.startsWith('video/')) {
        setVoiceChangingStep('Merging with video...');
        try {
          const videoBlob = await mergeAudioWithVideo(voiceChangingFile, audioBase64);
          setVoiceChangingResult({
            url: URL.createObjectURL(videoBlob),
            type: 'video'
          });
        } catch (mergeError) {
          console.error("Video merge failed, falling back to audio only:", mergeError);
          showToast("Engine error: Could not merge video. Providing audio-only version.");
          
          const audioBlob = base64ToAudioBlob(audioBase64);
          setVoiceChangingResult({
            url: URL.createObjectURL(audioBlob),
            type: 'audio'
          });
        }
      } else {
        const audioBlob = base64ToAudioBlob(audioBase64);
        setVoiceChangingResult({
          url: URL.createObjectURL(audioBlob),
          type: 'audio'
        });
      }

      setVoiceChangingProgress(100);
      setVoiceChangingStep('Complete!');
      showToast("Voice changed successfully!");
      if (auth.currentUser) {
        fetchUserProfile(auth.currentUser);
        fetchHistory(auth.currentUser);
      }
    } catch (err: any) {
      console.error("Voice changer error:", err);
      setError(`Voice changer failed: ${err.message}`);
    } finally {
      setIsVoiceChanging(false);
    }
  };

  const toggleFullScreen = () => {
    if (!videoContainerRef.current) return;
    const element = videoContainerRef.current as any;
    if (!document.fullscreenElement) {
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
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  };

  const handleGenerateCaptions = async () => {
    if (!captionFile) return;
    
    const limit = currentUser ? 300 * 1024 * 1024 : 50 * 1024 * 1024;
    if (captionFile.size > limit) {
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
          } else if (errorData.message) {
            errorMessage = errorData.message;
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
        setCaptionResult({
          videoUrl: URL.createObjectURL(captionFile),
          srt: '',
          words: data.words
        });
        
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

  const handleExportCaptions = async () => {
    if (!captionFile || captionWords.length === 0) return;
    if (videoRef.current && videoRef.current.duration > 300) {
      const confirmLarge = window.confirm("This video is over 5 minutes. Browser-based encoding might fail or crash your browser. Continue anyway?");
      if (!confirmLarge) return;
    }

    console.log("[VoxNova] Exporting captions for:", captionFile.name);
    setIsCaptioning(true);
    setIsExporting(true); // Hide captions immediately in the UI
    setCaptionProgress(0);
    setCaptionStep('Initializing download engine...'); 
    
    try {
      showToast("Download started. Please keep this tab open.");
      const videoBlob = await burnCaptions(captionFile, captionWords, captionStyle);
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.className = 'hidden';
      a.href = url;
      a.download = `VoxNova-Captions-${captionFile.name}`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
      showToast("Video downloaded successfully!");
    } catch (err: any) {
      console.error("[Export] Error:", err);
      setError(`Download failed: ${err.message}`);
    } finally {
      setIsCaptioning(false);
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!currentAudio || !lastGeneration) return;
    const a = document.createElement('a');
    a.href = currentAudio;
    a.download = `VoxNova-${lastGeneration.voice_name || 'voice'}-${Date.now()}.${audioFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      if ((!userProfile || userProfile.plan === 'free') && !isWhitelisted(currentUser.email || '') && (userProfile?.premium_usage_count || 0) >= 3) {
        setError(`The voice "${selectedVoice.name}" is a Premium feature. You have used your 3 free premium generations. Please upgrade your plan to access high-quality cinematic voices.`);
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
          voice_name: selectedVoice.id,
          style,
          speed,
          pitch,
          language,
          studioClarity,
          pause,
          cloned_voice_traits: (selectedVoice as any).fingerprint || null,
          script_type: text.toLowerCase().includes('motivation') ? 'motivational' : 
                       text.toLowerCase().includes('story') ? 'storytelling' : 
                       text.toLowerCase().includes('horror') ? 'horror' : 
                       text.toLowerCase().includes('emotion') ? 'emotional' : 'neutral'
        })
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server error: ${response.status}`);
        } else {
          const text = await response.text();
          console.error('Non-JSON error response:', text.substring(0, 200));
          throw new Error(`Server returned an unexpected response (${response.status}). The backend might be restarting or experiencing an issue.`);
        }
      }

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error("Server did not return a valid JSON response. Please check server logs.");
      }

      const data = await response.json();
      return data.audioData;
    };

    try {
      // Smart Script Parser: Extract only [VOICEOVER] parts if tags are present
      // This ensures "realistic" output by ignoring visual directions
      const parseScriptTags = (t: string) => {
        if (!t.includes('[VOICEOVER]') && !t.includes('[VOICE]')) return t;
        
        const voiceoverParts = t.match(/\[VOICEOVER\]:?([\s\S]*?)(?=\[|$)/gi);
        if (voiceoverParts && voiceoverParts.length > 0) {
          return voiceoverParts.map(p => p.replace(/\[VOICEOVER\]:?/i, '').trim()).join('\n\n');
        }
        return t;
      };

      const processedText = parseScriptTags(text);

      // Sanitize text: remove problematic characters that might crash the TTS model
      const sanitizeText = (t: string) => {
        return t.replace(/[*_#`~[\]()<>|\\{}]/g, '') // Remove markdown-like chars
                .replace(/[^\x20-\x7E\u0900-\u097F\u00A0-\u00FF]/g, ' ') // Keep basic Latin, Hindi, and common symbols
                .trim();
      };

      const sanitizedText = sanitizeText(processedText);
      if (sanitizedText.length === 0) {
        setError("Please enter some valid text to generate voice. If using tags, ensure [VOICEOVER] content is present.");
        setIsGenerating(false);
        return;
      }

      // 1. Split text into chunks for long-form stability
      const chunks = splitTextIntoChunks(sanitizedText, 3500); 
      
      // Increased concurrency to 8 for faster generation while staying within safe limits
      const CONCURRENCY_LIMIT = 8;
      const allPcmBuffers: ArrayBuffer[] = new Array(chunks.length);
      
      // Process chunks in batches
      for (let i = 0; i < chunks.length; i += CONCURRENCY_LIMIT) {
        const batch = chunks.slice(i, i + CONCURRENCY_LIMIT);
        const batchPromises = batch.map(async (chunkText, batchIndex) => {
          const globalIndex = i + batchIndex;
          
          // Reduced stagger delay to 100ms for much faster starts
          await new Promise(resolve => setTimeout(resolve, batchIndex * 100));
          
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

      // 2. Merge all PCM buffers efficiently with pause gaps
      const silenceBytes = Math.floor(pause * 24000) * 2; // pause is in seconds, samples are 24kHz, 2 bytes each
      const totalPcmLength = allPcmBuffers.reduce((acc, buf, idx) => {
        let len = acc + (buf ? buf.byteLength : 0);
        if (idx < allPcmBuffers.length - 1) len += silenceBytes;
        return len;
      }, 0);
      
      const mergedPcm = new Uint8Array(totalPcmLength);
      let offset = 0;
      for (let i = 0; i < allPcmBuffers.length; i++) {
        const buf = allPcmBuffers[i];
        if (buf) {
          mergedPcm.set(new Uint8Array(buf), offset);
          offset += buf.byteLength;
        }
        if (i < allPcmBuffers.length - 1) {
          offset += silenceBytes; // Values are already zeroed by new Uint8Array
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
      setAudioCurrentTime(0);
      setAudioDuration(0);
      
      // Create local generation object for immediate UI update
      const newGen: Generation = {
        id: Date.now() + Math.random(),
        type: 'voice',
        text: processedText,
        voice_name: selectedVoice.name,
        voice_color: selectedVoice.color,
        style: style,
        speed: speed,
        pitch: pitch,
        audio_data: null, // Will be updated if small enough
        created_at: new Date().toISOString(),
        timestamp: { _seconds: Math.floor(Date.now() / 1000) }
      };

      setLastGeneration({ ...newGen, audio_url: audioUrl });

      // Update local history state immediately
      setHistory(prev => [newGen, ...prev]);

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.error("Auto-play failed:", e));
        }
      }, 100);

      // 4. Save to History (Backend or Session)
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

        // Firestore has a 1MB limit. If audio is too large, we store a placeholder.
        const isTooLarge = finalBase64.length > 800000;
        const audioToSave = isTooLarge ? "LONG_AUDIO_DATA_TOO_LARGE_FOR_HISTORY" : finalBase64;

        // Update local gen with audio data if available
        setHistory(prev => prev.map(item => item.id === newGen.id ? { ...item, audio_data: audioToSave } : item));

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
              text: processedText,
              voice: selectedVoice.name,
              style,
              speed,
              pitch,
              audioData: audioToSave,
              creditCost: Math.ceil(processedText.length / 10)
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
          
          // Refresh history from server to get the real ID and timestamp
          fetchHistory(currentUser);
          fetchUserProfile(currentUser);
        } catch (saveErr: any) {
          console.error("Failed to save to history:", saveErr);
          setError(`Saved locally, but failed to sync: ${saveErr.message}`);
        }
      } else {
        // Guest mode: Save to localStorage
        const guestHistory = localStorage.getItem('voxnova_guest_history');
        let historyArray: Generation[] = [];
        if (guestHistory) {
          try {
            historyArray = JSON.parse(guestHistory);
          } catch (e) {}
        }
        historyArray.unshift(newGen);
        // Limit guest history to 20 items to avoid storage limits
        if (historyArray.length > 20) historyArray = historyArray.slice(0, 20);
        localStorage.setItem('voxnova_guest_history', JSON.stringify(historyArray));

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
    // If guest mode, just delete from local state and localStorage
    if (!currentUser) {
      const newHistory = history.filter(item => item.id !== id);
      setHistory(newHistory);
      localStorage.setItem('voxnova_guest_history', JSON.stringify(newHistory));
      return;
    }

    try {
      const token = await currentUser.getIdToken();
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

  const playFromHistory = async (item: Generation) => {
    try {
      if (playingId === item.id) {
        if (audioRef.current) {
          if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
          } else {
            audioRef.current.play();
            setIsPlaying(true);
          }
        }
        return;
      }

      let audioData = item.audio_data;
      
      // Support for chunked audio
      if (audioData === "CHUNKED") {
        setIsHistoryLoading(true);
        const fullAudio = await fetchChunkedAudio(item.id.toString(), item.type === 'caption' ? 'caption_history' : 'voice_history');
        setIsHistoryLoading(false);
        if (!fullAudio) {
          setError("Failed to load chunked audio data.");
          return;
        }
        audioData = fullAudio;
      }

      if (!audioData || audioData === "null" || audioData === "undefined" || audioData === "LONG_AUDIO_DATA_TOO_LARGE_FOR_HISTORY") {
        setError("This audio was too large to be stored in history. You can only play audio generated within the last few minutes.");
        return;
      }

      // Fix: Improved MIME type detection and support for data URLs
      let sanitizedData = audioData;
      if (sanitizedData.includes(',')) {
        sanitizedData = sanitizedData.split(',')[1];
      }
      
      const pcmBuffer = base64ToArrayBuffer(sanitizedData);
      const isMp3 = sanitizedData.startsWith('//') || sanitizedData.startsWith('SUQz') || audioData.includes('audio/mp3') || audioData.includes('audio/mpeg');
      
      const blob = new Blob([pcmBuffer], { 
        type: isMp3 ? 'audio/mp3' : 'audio/wav' 
      });
      const audioUrl = URL.createObjectURL(blob);
      
      setCurrentAudio(audioUrl);
      setLastGeneration({
        ...item,
        audio_url: audioUrl
      });
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setPlayingId(item.id);
      setIsPlaying(true);
      
      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration);
      };

      audio.ontimeupdate = () => {
        setAudioCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setPlayingId(null);
        setIsPlaying(false);
      };

      audio.play().catch(e => {
        console.error("History playback failed:", e);
        setPlayingId(null);
        setIsPlaying(false);
        setError("Playback failed. Please try downloading the file.");
      });
    } catch (err: any) {
      console.error("Error playing from history:", err);
      setError("Failed to play audio.");
      setPlayingId(null);
    }
  };

  const handleRestoreScript = (item: Generation) => {
    if (item.text) setText(item.text);
    const voice = allVoices.find(v => v.name === item.voice_name);
    if (voice) setSelectedVoice(voice);
    setSpeed(item.speed || 1);
    setPitch(item.pitch || 1);
    setStyle(item.style || 'normal');
    setActiveTab('generate');
    setShowHistoryModal(false);
  };

  const filteredHistory = Array.isArray(history) ? history.filter(item => 
    item.text?.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
    item.voice_name?.toLowerCase().includes(historySearchTerm.toLowerCase())
  ) : [];

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
                      <img 
                        src={currentUser.photoURL || ''} 
                        alt="" 
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border border-zinc-200" 
                      />
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
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-4">
                  <History size={48} className="opacity-20" />
                  <p>No generations yet. Start by creating some audio!</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-4">
                  <Search size={48} className="opacity-20" />
                  <p>No matching history found for "{historySearchTerm}".</p>
                </div>
              ) : (
                filteredHistory.map((item, idx) => (
                  <div key={`modal-history-item-${item.id}-${idx}-${item.created_at || ''}-${item.type || ''}`} className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl hover:bg-zinc-100 transition-all group">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1 space-y-2 min-w-0 w-full">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                            {item.voice_name || (item.type === 'caption' ? 'Transcription' : 'AI Voice')}
                          </span>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                          {item.type === 'caption' && (
                            <span className="text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">Captions</span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-600 line-clamp-2 italic w-full">
                          {item.type === 'caption' ? `${item.words?.length || 0} words transcribed` : `"${item.text}"`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                        <button 
                          onClick={() => {
                            if (!item.audio_data && item.type !== 'caption') {
                              setError("This audio was too large to be stored in history.");
                              return;
                            }
                            if (item.type === 'caption') {
                              // Handle caption restoration
                              setCaptionWords(item.words || []);
                              if (item.style && typeof item.style === 'object') {
                                setCaptionStyle(item.style);
                              }
                              if (item.animation) {
                                setCaptionAnimation(item.animation);
                              }
                              setActiveTab('captions');
                              setShowHistoryModal(false);
                            } else {
                              // Reduced flashing: Don't close modal on play so user can continue browsing history
                              playFromHistory(item);
                            }
                          }}
                          className={`p-2.5 rounded-xl transition-all ${playingId === item.id ? 'bg-emerald-500 text-white' : 'bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600'}`}
                          title={item.type === 'caption' ? "Edit Captions" : "Play Audio"}
                        >
                          {playingId === item.id ? <Pause size={16} /> : item.type === 'caption' ? <Edit3 size={16} /> : <Play size={16} />}
                        </button>
                        <button 
                          onClick={() => handleRestoreScript(item)}
                          title="Restore Script & Settings"
                          className="p-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-xl transition-all"
                        >
                          <RefreshCw size={16} />
                        </button>
                        
                        {item.type === 'caption' ? (
                          <button 
                            onClick={() => {
                              const srtContent = item.words ? generateSRT(item.words) : '';
                              const blob = new Blob([srtContent], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `captions-${item.id}.srt`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            title="Download SRT"
                            className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                          >
                            <Download size={16} />
                          </button>
                        ) : (item.audio_data && item.audio_data !== "LONG_AUDIO_DATA_TOO_LARGE_FOR_HISTORY") ? (
                          <button 
                            onClick={async () => {
                              let data = item.audio_data!;
                              if (data === "CHUNKED") {
                                setIsHistoryLoading(true);
                                const fullAudio = await fetchChunkedAudio(item.id.toString(), 'voice_history') || "";
                                setIsHistoryLoading(false);
                                if (!fullAudio) return;
                                data = fullAudio;
                              }
                              const blob = new Blob([base64ToArrayBuffer(data)], { 
                                type: data.startsWith('//') || data.startsWith('SUQz') ? 'audio/mp3' : 'audio/wav' 
                              });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `VoxNova - ${item.voice_name || 'AI Voice'}-${item.id}.${data.startsWith('//') || data.startsWith('SUQz') ? 'mp3' : 'wav'}`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                            title="Download Audio"
                          >
                            <Download size={16} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              if (currentAudio && idx === 0) {
                                downloadAudio(currentAudio, `voxnova-${(item.voice_name || 'audio').toLowerCase()}-${item.id}.wav`);
                              } else {
                                if (item.audio_data === "LONG_AUDIO_DATA_TOO_LARGE_FOR_HISTORY") {
                                  setError("Yah purani audio bahut badi thi aur history mein puri tarah save nahi ho payi. Maaf kijiye, par ab naye generations chunking ki wajah se safe rahenge.");
                                } else {
                                  setError("Audio data available nahi hai. Play karke dekhein agar restore ho sake.");
                                }
                              }
                            }}
                            title="Download Audio"
                            className="p-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-xl transition-all"
                          >
                            <Download size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteHistoryItem(item.id, item.type)}
                          title="Delete"
                          className="p-2.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-100"
                        >
                          <Trash2 size={16} />
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
      a.download = `VoxNova Text to Speech - ${selectedVoice.name}-${fileName}.${audioFormat}`;
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
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {isAuthLoading ? (
          <motion.div 
            key="auth-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-16 h-16 border-4 border-zinc-100 border-t-emerald-500 rounded-full animate-spin mb-6" />
            <h2 className="text-2xl font-display font-bold text-zinc-900 mb-2">VoxNova</h2>
            <p className="text-zinc-500 font-medium animate-pulse mb-8">Authenticating with Firebase...</p>
            
            <div className="max-w-xs space-y-4">
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest leading-relaxed">
                If this takes too long, your connection may be slow or blocked by firewall.
              </p>
              <button 
                onClick={() => setIsAuthLoading(false)}
                className="px-6 py-3 bg-zinc-100 text-zinc-600 rounded-2xl font-bold text-sm hover:bg-zinc-200 transition-all"
              >
                Continue as Guest
              </button>
            </div>
          </motion.div>
        ) : showWelcome ? (
          <WelcomeScreen onComplete={handleWelcomeComplete} />
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
          
          {/* Sidebar Navigation */}
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            currentUser={currentUser}
            userProfile={userProfile}
            onLogin={handleLogin}
            onLogout={handleLogout}
            handleShare={handleShare}
            setIsPricingModalOpen={setIsPricingModalOpen}
            setShowVoiceLibrary={setShowVoiceLibrary}
            setShowSettings={setShowSettings}
            selectedVoice={selectedVoice}
          />

          {/* Global Modals & Toasts */}
          <AnimatePresence>
            {isPricingModalOpen && <PricingModal onClose={() => setIsPricingModalOpen(false)} onSelect={purchaseCredits} />}
            {showLimitToast && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-rose-500 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3"
              >
                <AlertCircle size={20} />
                {currentUser ? "Maximum 5,000 characters reached" : "Guest limit: 200 characters. Sign up for more!"}
              </motion.div>
            )}
            {showSuccessToast && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3"
              >
                <Check size={20} />
                {successMessage}
              </motion.div>
            )}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-rose-500 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3"
              >
                <AlertCircle size={20} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[500] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                  >
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-zinc-100 relative overflow-hidden"
                    >
                      <button 
                        onClick={() => setError(null)}
                        className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all"
                      >
                        <X size={20} />
                      </button>

                      <div className="space-y-6">
                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                          <AlertCircle size={32} />
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-2xl font-display font-bold text-zinc-900">System Message</h3>
                          <p className="text-zinc-500 leading-relaxed text-sm">
                            {error}
                          </p>
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                          <button 
                            onClick={() => {
                              setError(null);
                              setIsPricingModalOpen(true);
                            }}
                            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20"
                          >
                            See available plans
                          </button>
                          <button 
                            onClick={() => setError(null)}
                            className="w-full py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              <SettingsModal />

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

      {/* History Modal */}
      <HistoryModal />

      {/* Pricing Modal removed - consolidated above */}

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

                {/* Character and Credit Counts - Moved outside and below the box */}
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
                      {!currentUser ? 'Guest Mode (Limited)' : (isWhitelisted(currentUser?.email || '') ? 'Unlimited' : `${(userProfile?.credits || 0).toLocaleString()} credits remaining`)}
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
                          type="range" min="0.1" max="2.0" step="0.1" 
                          value={pause} onChange={(e) => setPause(parseFloat(e.target.value))}
                          className="w-full accent-emerald-500 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
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

                <div className="pt-4">
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !text || !selectedVoice}
                    className="w-full py-5 px-6 bg-black text-white rounded-3xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/20 group relative overflow-hidden"
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
                  </button>
                </div>

              {lastGeneration && currentAudio && !isGenerating && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 overflow-hidden bg-white border border-zinc-100 rounded-3xl shadow-2xl shadow-zinc-200/50"
                  >
                    {/* Header Info */}
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
                        {/* Play/Pause Button */}
                        <button 
                          onClick={() => {
                            if (audioRef.current) {
                              if (isPlaying) {
                                audioRef.current.pause();
                              } else {
                                audioRef.current.play();
                              }
                            }
                          }}
                          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 shadow-lg ${isPlaying ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-black hover:bg-zinc-800'}`}
                        >
                          {isPlaying ? (
                            <Pause size={24} className="text-white fill-white" />
                          ) : (
                            <Play size={24} className="text-white ml-1 fill-white" />
                          )}
                        </button>

                        <div className="flex-1 space-y-2">
                          {/* Time & Duration */}
                          <div className="flex justify-between items-end mb-1">
                            <span className="text-[11px] font-mono font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {formatTime(audioCurrentTime)}
                            </span>
                            <span className="text-[11px] font-mono font-medium text-zinc-400">
                              {formatTime(audioDuration)}
                            </span>
                          </div>

                          {/* Seekbar */}
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

                        {/* Download Button */}
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

                {currentAudio && (
                  <audio 
                    ref={audioRef} 
                    src={currentAudio} 
                    className="hidden" 
                    onTimeUpdate={(e) => setAudioCurrentTime(e.currentTarget.currentTime)}
                    onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                )}
              </div>
            </motion.div>
          ) : activeTab === 'captions' ? (
            <motion.div 
              key="captions"
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
                {captionResult && (
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
                      onClick={() => {
                        const blob = new Blob([captionResult.srt], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `VoxNova_Captions_${Date.now()}.srt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
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
                  {/* Video Preview Area */}
                    <div className="bg-white p-4 md:p-6 rounded-[2.5rem] md:rounded-[3rem] border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all relative">
                      {captionFile && (
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
                          {captionProgress === 0 && (
                            <div className="pt-2 text-center">
                              <button 
                                onClick={() => {
                                  ffmpegRef.current = null;
                                  isFFmpegLoading.current = false;
                                  handleExportCaptions();
                                }}
                                className="px-4 py-2 bg-white/10 text-white rounded-xl text-[10px] font-bold hover:bg-white/20 transition-all"
                              >
                                Stuck? Restart Engine
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {captionFile ? (
                        <div 
                          ref={videoContainerRef}
                          className="relative w-full max-h-[70vh] bg-zinc-950 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden group shadow-2xl flex items-center justify-center border border-zinc-800"
                        >
                          <div className="relative max-w-full max-h-full flex items-center justify-center">
                            <video 
                              ref={videoRef}
                              src={captionResult ? captionResult.videoUrl : (captionFile ? URL.createObjectURL(captionFile) : '')} 
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
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <CaptionOverlay 
                                  words={captionWords} 
                                  currentTime={currentTime + (captionOffset / 1000)} 
                                  style={captionStyle} 
                                  animation={captionAnimation} 
                                  shadowColor={shadowColor}
                                  isExporting={isExporting}
                                  onUpdateStyle={(updates) => setCaptionStyle(prev => ({ ...prev, ...updates }))}
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* Video Overlay Actions */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all">
                          </div>

                          {/* Video Controls Overlay */}
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
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          setCaptionFile(file);
                          setCaptionResult(null);
                          setCaptionWords([]);
                        }
                      }}
                    />
                  </div>

                  {/* Translate & Generate Actions */}
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
                              disabled={isCaptioning}
                              className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                            >
                              {isCaptioning ? <Loader2 className="animate-spin" /> : <Sparkles />}
                              Generate AI Captions
                            </button>
                  </div>

                  {/* Language Support Section */}
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
                        defaultValue="All Languages"
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
                        <option value="Urdu">Urdu (اردو)</option>
                        <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
                        <option value="Japanese">Japanese (日本語)</option>
                        <option value="Korean">Korean (한국어)</option>
                        <option value="Spanish">Spanish (Español)</option>
                        <option value="French">French (Français)</option>
                        <option value="German">German (Deutsch)</option>
                        <option value="Portuguese">Portuguese (Português)</option>
                        <option value="Italian">Italiano (Italiano)</option>
                        <option value="Russian">Russian (Русский)</option>
                        <option value="Arabic">Arabic (العربية)</option>
                        <option value="Turkish">Turkish (Türkçe)</option>
                        <option value="Indonesian">Indonesian (Bahasa)</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-zinc-600 transition-colors">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-medium px-2 leading-relaxed">
                      Selecting your video language helps our AI generate more accurate and localized captions for your content.
                    </p>
                  </div>

                  {/* Controls & Editor */}
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
                        onUpdateStyle={setCaptionStyle}
                        animation={captionAnimation}
                        onUpdateAnimation={setCaptionAnimation}
                      />
                    </motion.div>
                  )}

                  {!captionResult && !isCaptioning && captionFile && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="flex items-center justify-between p-5 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                               <Clock size={20} />
                             </div>
                             <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Timing</p>
                               <p className="text-[12px] text-zinc-900 font-black">{captionOffset}ms Delay</p>
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             <button onClick={() => setCaptionOffset(prev => prev - 50)} className="w-9 h-9 flex items-center justify-center bg-white border border-zinc-200 rounded-xl text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 active:scale-90 transition-all font-black">-</button>
                             <button onClick={() => setCaptionOffset(prev => prev + 50)} className="w-9 h-9 flex items-center justify-center bg-white border border-zinc-200 rounded-xl text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 active:scale-90 transition-all font-black">+</button>
                           </div>
                         </div>
                         
                         <div className="flex items-center justify-between p-5 bg-emerald-50/50 rounded-[2rem] border border-emerald-100/50">
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                               <Zap size={20} />
                             </div>
                             <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Pro Logic</p>
                               <p className="text-[12px] text-emerald-900 font-black">Smart Motion</p>
                             </div>
                           </div>
                           <button
                             onClick={() => setCaptionStyle({...captionStyle, isSmart: !captionStyle.isSmart})}
                             className={`w-11 h-6 rounded-full transition-all relative ${captionStyle.isSmart ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                           >
                             <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${captionStyle.isSmart ? 'left-5.5' : 'left-0.5'}`} />
                           </button>
                         </div>
                      </div>

                      <button 
                        onClick={handleGenerateCaptions}
                        className="w-full py-6 bg-emerald-500 text-white rounded-[2.5rem] font-bold text-xl hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95 group"
                      >
                        <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
                        Generate AI Captions
                      </button>
                    </div>
                  )}

                  {isCaptioning && (
                    <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-xl space-y-6">
                      <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-4">
                          <Loader2 className="animate-spin text-emerald-500" size={28} />
                          <span className="font-black text-zinc-900 text-xl tracking-tight">{captionStep}</span>
                        </div>
                        <span className="font-mono text-emerald-600 font-black text-2xl">{captionProgress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden shadow-inner">
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
                  {/* Style Sidebar with Folders */}
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
                      {/* Style Presets Section */}
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
                                       WebkitTextStroke: preset.style.border !== 'none' ? `${Math.max(1.8, (preset.style.strokeWidth || 0) * 0.15)}px ${preset.style.outlineColor || '#000'}` : 'none',
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

                      {/* Typography & Layout Section */}
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
                          {/* Font Family Selector */}
                          <div className="space-y-2 pt-4">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">FONT FAMILY</label>
                            <select 
                              value={captionStyle.font}
                              onChange={(e) => setCaptionStyle({...captionStyle, font: e.target.value})}
                              className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                            >
                              <option value="Inter">Inter</option>
                              <option value="Poppins">Poppins</option>
                              <option value="Montserrat">Montserrat</option>
                              <option value="Rajdhani">Rajdhani (Elite Hindi)</option>
                              <option value="Kalam">Kalam (Handwritten)</option>
                              <option value="Hind">Hind (Classic Devanagari)</option>
                              <option value="Teko">Teko (Modern Bold)</option>
                              <option value="Martel">Martel (Traditional)</option>
                              <option value="Bangers">Bangers (Impact)</option>
                              <option value="Luckiest Guy">Luckiest Guy (Funky)</option>
                              <option value="Outfit">Outfit Pro</option>
                              <option value="Fredoka One">Fredoka One</option>
                            </select>
                          </div>

                          {/* Case & Style Controls */}
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">CASE</label>
                              <div className="flex bg-zinc-50 p-1 rounded-xl border border-zinc-100 shadow-sm">
                                {(['original', 'uppercase'] as const).map(c => (
                                  <button 
                                    key={c}
                                    onClick={() => setCaptionStyle({...captionStyle, case: c})}
                                    className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all ${captionStyle.case === c ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
                                  >
                                    {c === 'original' ? 'Original' : 'Uppercase'}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">STYLE</label>
                              <div className="flex bg-zinc-50 p-1 rounded-xl border border-zinc-100 shadow-sm">
                                <button 
                                  onClick={() => setCaptionStyle({...captionStyle, fontWeight: captionStyle.fontWeight === '900' ? '400' : '900'})}
                                  className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all ${captionStyle.fontWeight === '900' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
                                >
                                  Bold
                                </button>
                                <button 
                                  onClick={() => setCaptionStyle({...captionStyle, italic: !captionStyle.italic})}
                                  className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all ${captionStyle.italic ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
                                >
                                  Italic
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Font Size & Words Per Line */}
                          <div className="space-y-6">
                            <div className="space-y-4">
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
                            <div className="space-y-4">
                              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                                <span>WORDS PER LINE</span>
                                <span className="text-emerald-500 font-bold">{captionStyle.wordsPerLine || 1}</span>
                              </div>
                              <input 
                                type="range" min="1" max="10" 
                                value={captionStyle.wordsPerLine || 1} 
                                onChange={(e) => setCaptionStyle({...captionStyle, wordsPerLine: parseInt(e.target.value)})}
                                className="w-full accent-zinc-900 h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer"
                              />
                            </div>
                          </div>

                          {/* Position Selector */}
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">POSITION</label>
                             <div className="flex bg-zinc-50 p-1 rounded-xl border border-zinc-100 shadow-sm">
                                {(['top', 'middle', 'bottom'] as const).map(p => (
                                  <button 
                                    key={p}
                                    onClick={() => setCaptionStyle({...captionStyle, yPos: p === 'top' ? 20 : p === 'middle' ? 50 : 85})}
                                    className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all capitalize ${
                                      (p === 'top' && captionStyle.yPos <= 30) || (p === 'middle' && captionStyle.yPos > 30 && captionStyle.yPos < 70) || (p === 'bottom' && captionStyle.yPos >= 70)
                                        ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'
                                    }`}
                                  >
                                    {p}
                                  </button>
                                ))}
                             </div>
                          </div>

                          {/* Extra Smart Buttons - Bottom of Typography Section */}
                          <div className="pt-6 border-t border-zinc-100 space-y-4">
                             <div className="flex gap-3">
                                <button 
                                  onClick={() => setCaptionScriptType(captionScriptType === 'hindi' ? 'hinglish' : 'hindi')}
                                  className={`flex-1 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-2 transition-all ${captionScriptType === 'hinglish' ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : 'bg-white border-zinc-100 text-zinc-400'}`}
                                >
                                  {captionScriptType === 'hinglish' ? 'Hinglish Script' : 'Hindi Script'}
                                </button>
                                <button 
                                  onClick={() => setTranslateToEnglish(!translateToEnglish)}
                                  className={`flex-1 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-2 transition-all ${translateToEnglish ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : 'bg-white border-zinc-100 text-zinc-400'}`}
                                >
                                  {translateToEnglish ? 'Translated' : 'Original Lang'}
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

                      {/* Animations Folder */}
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
                        <div className="p-6 pt-0 border-t border-zinc-50/50 grid grid-cols-2 gap-2">
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

                      {/* Colors & Effects Folder */}
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
                        <div className="p-6 pt-0 border-t border-zinc-50/50 space-y-6">
                           {/* Stroke & Outline Section */}
                           <div className="space-y-4">
                             <div className="flex items-center justify-between">
                               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Structure</label>
                               <div className="flex bg-zinc-200/50 p-0.5 rounded-xl">
                                 {(['none', 'thin', 'thick'] as const).map(b => (
                                   <button 
                                     key={b}
                                     onClick={() => setCaptionStyle({...captionStyle, border: b})}
                                     className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${captionStyle.border === b ? 'bg-emerald-500 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'}`}
                                   >
                                     {b}
                                   </button>
                                 ))}
                               </div>
                             </div>

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
                                 <div className="relative w-full aspect-square rounded-full overflow-hidden border-2 border-white shadow-sm group">
                                   <input 
                                     type="color" 
                                     value={captionStyle.color}
                                     onChange={(e) => setCaptionStyle({...captionStyle, color: e.target.value})}
                                     className="absolute inset-0 w-full h-full scale-150 cursor-pointer opacity-0 z-10"
                                   />
                                   <div className="absolute inset-0 flex items-center justify-center bg-white group-hover:bg-zinc-50 transition-colors">
                                     <Plus size={14} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                                   </div>
                                 </div>
                               </div>
                             </div>

                             <div className="p-4 bg-white rounded-3xl border border-zinc-100 shadow-sm space-y-4">
                               <div className="flex gap-4 items-center">
                                  <div className="space-y-2">
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block px-1">Outline</span>
                                    <div className="grid grid-cols-4 gap-1.5">
                                      {['#000000', '#ffffff', '#ff0000', '#00ff00'].map(c => (
                                        <button 
                                          key={`out-${c}`}
                                          onClick={() => setCaptionStyle({...captionStyle, outlineColor: c})}
                                          className={`w-7 h-7 rounded-lg border-2 transition-all ${captionStyle.outlineColor === c ? 'border-emerald-500 scale-110' : 'border-zinc-50'}`}
                                          style={{ backgroundColor: c }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest px-1">
                                      <span className="text-zinc-400">Thickness</span>
                                      <span className="text-zinc-900 font-bold">{captionStyle.strokeWidth || 4}PX</span>
                                    </div>
                                    <div className="pt-1">
                                      <input 
                                        type="range" min="0" max="15" 
                                        value={captionStyle.strokeWidth || 4} 
                                        onChange={(e) => setCaptionStyle({...captionStyle, strokeWidth: parseInt(e.target.value)})}
                                        className="w-full accent-zinc-900 h-1 bg-zinc-200 rounded-full appearance-none cursor-pointer"
                                      />
                                    </div>
                                  </div>
                               </div>
                             </div>

                             {/* Alternating Colors Section */}
                           <div className="space-y-4 pt-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-emerald-500">
                                  <Sparkles size={14} />
                                  <label className="text-[10px] font-black uppercase tracking-widest leading-none">Auto-Coloring</label>
                                </div>
                                <button
                                  onClick={() => setCaptionStyle({...captionStyle, isDynamic: !captionStyle.isDynamic})}
                                  className={`w-11 h-5.5 rounded-full transition-all relative ${captionStyle.isDynamic ? 'bg-emerald-500 shadow-sm' : 'bg-zinc-200'}`}
                                >
                                  <div className={`absolute top-0.75 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${captionStyle.isDynamic ? 'left-6.25' : 'left-0.75'}`} />
                                </button>
                              </div>
                              <p className="text-[9.5px] text-zinc-400 font-medium leading-relaxed max-w-[240px] px-0.5">Alternates colors every word for a professional viral look.</p>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-2">Color 1</label>
                                  <div className="relative h-10 group">
                                    <input 
                                      type="color" 
                                      value={captionStyle.threeColors?.[0] || '#ffffff'}
                                      onChange={(e) => {
                                        const colors = [...(captionStyle.threeColors || ['#ffffff', '#ffff00', '#00ff00'])];
                                        colors[0] = e.target.value;
                                        setCaptionStyle({...captionStyle, threeColors: colors});
                                      }}
                                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                    />
                                    <div className="w-full h-full rounded-2xl border-2 border-zinc-50 shadow-sm transition-transform group-hover:scale-[1.02]" style={{ backgroundColor: captionStyle.threeColors?.[0] || '#ffffff' }} />
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-2">Accent</label>
                                  <div className="relative h-10 group">
                                    <input 
                                      type="color" 
                                      value={captionStyle.threeColors?.[1] || '#ffff00'}
                                      onChange={(e) => {
                                        const colors = [...(captionStyle.threeColors || ['#ffffff', '#ffff00', '#00ff00'])];
                                        colors[1] = e.target.value;
                                        setCaptionStyle({...captionStyle, threeColors: colors});
                                      }}
                                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                    />
                                    <div className="w-full h-full rounded-2xl border-2 border-zinc-50 shadow-sm transition-transform group-hover:scale-[1.02]" style={{ backgroundColor: captionStyle.threeColors?.[1] || '#ffff00' }} />
                                  </div>
                                </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4 pt-2">
                              <button 
                                onClick={() => setCaptionStyle({...captionStyle, glow: !captionStyle.glow})}
                                className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${captionStyle.glow ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-zinc-100 text-zinc-400'}`}
                              >
                                <Sparkles size={16} />
                                Glow Effect
                              </button>
                              <button 
                                onClick={() => setCaptionStyle({...captionStyle, shadow: !captionStyle.shadow})}
                                className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${captionStyle.shadow ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-zinc-100 text-zinc-400'}`}
                              >
                                <Monitor size={16} />
                                3D Shadow
                              </button>
                           </div>

                           <div className="space-y-3 pt-2">
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

                      {/* Timing Folder */}
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
                               <span className="text-emerald-500">{captionOffset}ms</span>
                             </div>
                             <input 
                               type="range" min="-1000" max="1000" step="10" 
                               value={captionOffset} onChange={(e) => setCaptionOffset(parseInt(e.target.value))}
                               className="w-full accent-zinc-900 h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer"
                             />
                           </div>
                        </div>
                      </details>
                    </div>

                    {captionResult && (
                      <div className="pt-6 border-t border-zinc-100 space-y-4">
                        <button 
                           onClick={handleExportCaptions}
                           className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 flex items-center justify-center gap-3"
                        >
                           <Video size={18} />
                           Download HD Video
                        </button>
                        <button 
                           onClick={() => setCaptionResult(null)}
                           className="w-full py-3 bg-zinc-100 text-zinc-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                        >
                           <RefreshCw size={14} />
                           Re-generate
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-emerald-50 rounded-[2.5rem] border border-emerald-100/50 shadow-sm">
                    <h4 className="text-[12px] font-black text-emerald-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Sparkles size={16} className="text-emerald-500" /> Professional Setup
                    </h4>
                    <p className="text-xs text-emerald-700/80 leading-relaxed font-medium italic">
                      "Uppercase" + "Pop Up" is recommended for high-engagement viral reels. Adjust timing if voice sync feels off.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'voice-changer' ? (
            <motion.div 
              key="voice-changer"
              id="voice-changer-tab-root"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-100 pb-8 mb-4">
                <div className="space-y-1.5" id="voice-changer-header">
                  <h2 className="text-4xl font-display font-bold text-zinc-900 tracking-tight">Voice Changer <span className="text-emerald-500 text-sm font-mono align-top ml-2">PRO</span></h2>
                  <p className="text-zinc-500 text-sm font-medium">Transform any audio or video with professional AI character conversion.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-zinc-50 p-2 rounded-[2rem] border border-zinc-100" id="voice-changer-actions">
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
                <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 border-zinc-100">
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
                      if (!voiceChangingFile) {
                        setError("Please upload an audio or video file first to change voice.");
                        return;
                      }
                      handleVoiceChanger();
                    }}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-[2.5rem] border-zinc-100 space-y-4">
                  <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-500" />
                    Pro Tips
                  </h3>
                  <ul className="space-y-3 text-xs text-zinc-500">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1 shrink-0" />
                      Use high-quality audio files with minimal background noise for the best results.
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1 shrink-0" />
                      The AI works best with clear speech. Avoid files with multiple people talking at once.
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1 shrink-0" />
                      You can also upload video files (MP4, etc.) and we will transform the audio while keeping the video.
                    </li>
                  </ul>
                </div>

                <div className="glass-panel p-8 rounded-[2.5rem] border-zinc-100 space-y-4">
                  <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <History size={16} className="text-purple-500" />
                    Why use Voice Changer?
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Our Voice Changer uses advanced neural networks to map your voice's characteristics onto our professional AI models. This allows you to maintain the exact emotion, timing, and emphasis of your original recording while sounding like a completely different person.
                  </p>
                </div>
              </div>

              {voiceChangingResult && (
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
                          a.href = voiceChangingResult.url;
                          const voiceName = allVoices.find(v => v.id === selectedVoice.id)?.name || 'AI Voice';
                          a.download = `VoxNova Text to Speech - ${voiceName}-${Date.now()}.${voiceChangingResult.type === 'video' ? 'mp4' : 'wav'}`;
                          a.click();
                        }}
                        className="p-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all text-zinc-600"
                      >
                        <Download size={20} />
                      </button>
                    </div>
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
          ) : activeTab === 'voice-clone' ? (
            <VoiceClone 
              currentUser={currentUser}
              onCloneCreated={(voice) => {
                setClonedVoices(prev => [voice, ...prev]);
                setSelectedVoice(voice);
                setSuccessMessage(`Elite Neural Model "${voice.name}" synthesized successfully! It's now active in your dashboard.`);
                setShowSuccessToast(true);
                setTimeout(() => setShowSuccessToast(false), 3000);
                setActiveTab('generate');
              }} 
              onNavigateToTTS={() => setActiveTab('generate')}
            />
          ) : activeTab === 'library' ? (
            <VoiceLibrary 
              voices={allVoices}
              onSelect={(voice) => {
                setSelectedVoice(voice);
                setActiveTab('generate');
              }}
              selectedVoiceId={selectedVoice.id}
              activeTab={activeTab}
            />
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
                  history.map((item, idx) => (
                    <div key={`main-history-item-${item.id}-${idx}-${item.created_at || ''}-${item.type || ''}`} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center border-zinc-100">
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
                        {item.type === 'caption' ? (
                          <button 
                            onClick={() => {
                              // If it's a caption, we can download the SRT
                              const srtContent = item.words ? generateSRT(item.words) : '';
                              const blob = new Blob([srtContent], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `captions-${item.id}.srt`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="p-3 hover:bg-zinc-100 rounded-xl transition-all text-zinc-400 hover:text-zinc-600"
                            title="Download SRT"
                          >
                            <Download size={20} />
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => playFromHistory(item)}
                              className={`p-3 rounded-xl transition-all ${playingId === item.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600'}`}
                              title={playingId === item.id ? "Pause" : "Play"}
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
                              onClick={() => {
                                if (item.audio_data && item.audio_data !== "LONG_AUDIO_DATA_TOO_LARGE_FOR_HISTORY") {
                                  downloadAudio(item.audio_data, `voice-${item.id}`);
                                } else if (currentAudio && idx === 0) {
                                  downloadAudio(currentAudio, `voice-${item.id}`);
                                } else {
                                  setError("Audio data is not available for download.");
                                }
                              }}
                              className="p-3 hover:bg-zinc-100 rounded-xl transition-all text-zinc-400 hover:text-zinc-600"
                              title="Download Audio"
                            >
                              <Download size={20} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDeleteHistory(item.id, item.type)}
                          className="p-3 hover:bg-red-50 rounded-xl transition-all text-zinc-400 hover:text-red-500"
                          title="Delete"
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

        {/* SEO Content Section (The "Boxes") - Always Visible */}
        <section className="bg-white">
              <div className="max-w-6xl mx-auto py-24 px-6 space-y-16">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-zinc-900 tracking-tight">Why Choose VoxNova Text to Speech?</h2>
                  <p className="text-zinc-500 max-w-2xl mx-auto text-lg">VoxNova is the world's most advanced AI voice generation platform, designed for creators who demand cinematic quality.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="glass-panel p-10 rounded-[2.5rem] space-y-6 border-zinc-100 hover:border-emerald-500/20 transition-all group bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-inner">
                      <Sparkles size={32} />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-zinc-900">Ultra-Realistic Voices</h3>
                      <p className="text-zinc-500 leading-relaxed">Our neural networks are trained on thousands of hours of professional studio recordings to capture the subtle nuances of human speech, including breath, rhythm, and emotion.</p>
                    </div>
                  </div>

                  <div className="glass-panel p-10 rounded-[2.5rem] space-y-6 border-zinc-100 hover:border-blue-500/20 transition-all group bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
                      <Globe size={32} />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-zinc-900">Multilingual Support</h3>
                      <p className="text-zinc-500 leading-relaxed">Generate high-quality voiceovers in English and Hindi with perfect native accents. Our AI understands cultural nuances and provides localized performances for global audiences.</p>
                    </div>
                  </div>

                  <div className="glass-panel p-10 rounded-[2.5rem] space-y-6 border-zinc-100 hover:border-purple-500/20 transition-all group bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-inner">
                      <Clapperboard size={32} />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-zinc-900">Cinematic Narration</h3>
                      <p className="text-zinc-500 leading-relaxed">From deep movie trailer voices to calm documentary narrators, VoxNova provides the perfect tone for any project. Use our advanced style controls to fine-tune the performance.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-zinc-50/80 py-24">
              <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-16">
                <div className="glass-panel p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-zinc-100 bg-white shadow-sm space-y-10">
                  <div className="text-center space-y-2">
                    <h3 className="text-3xl font-bold text-zinc-900">Professional Grade AI Tools</h3>
                    <p className="text-zinc-500">Everything you need to create world-class audio content.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="flex gap-6">
                      <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Mic size={24} />
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-xl font-bold text-zinc-900">AI Voice Cloning</h4>
                        <p className="text-zinc-500 leading-relaxed">Clone any voice with just a few seconds of audio. Perfect for maintaining consistency across long-running series or dubbing content while keeping the original actor's essence.</p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <Layers size={24} />
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-xl font-bold text-zinc-900">Advanced Style Modulation</h4>
                        <p className="text-zinc-500 leading-relaxed">Go beyond simple pitch and speed. Our AI allows you to control the emotional intensity, gravitas, and storytelling style of every generation, giving you full creative control.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-16">
                  <div className="text-center space-y-4">
                    <h3 className="text-4xl font-display font-bold text-zinc-900">How VoxNova Text to Speech Works</h3>
                    <p className="text-zinc-500 max-w-xl mx-auto">Four simple steps to transform your text into professional audio.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                      { step: '01', title: 'Input Text', desc: 'Paste your script into our advanced editor. We support long-form content up to 5,000 characters.', img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=400&h=300' },
                      { step: '02', title: 'Select Voice', desc: 'Browse our library of 50+ professional AI voices, each with unique traits and characteristics.', img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=400&h=300' },
                      { step: '03', title: 'Fine-Tune', desc: 'Adjust pitch, speed, and emotional style to get the perfect performance for your project.', img: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=400&h=300' },
                      { step: '04', title: 'Generate', desc: 'Our neural engines process your request in seconds, delivering studio-quality 48kHz audio.', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400&h=300' }
                    ].map((item, i) => (
                      <div key={`step-en-${i}`} className="space-y-6 group">
                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm group-hover:shadow-md transition-all duration-300">
                          <motion.div
                            className="w-full h-full"
                            animate={{ 
                              scale: [1, 1.05, 1],
                              rotate: [0, 1, -1, 0]
                            }}
                            transition={{ 
                              duration: 6, 
                              repeat: Infinity, 
                              ease: "easeInOut" 
                            }}
                          >
                            <img src={item.img} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700" referrerPolicy="no-referrer" />
                          </motion.div>
                          <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-500" />
                          <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-xl font-display font-bold text-zinc-900 shadow-sm">
                            {item.step}
                          </div>
                        </div>
                        <div className="space-y-2 px-2">
                          <h4 className="text-xl font-bold text-zinc-900">{item.title}</h4>
                          <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white py-24">
              <div className="max-w-6xl mx-auto px-6 space-y-16">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-display font-bold text-zinc-900">Latest from our AI Voice Blog</h2>
                  <p className="text-zinc-500 max-w-2xl mx-auto text-lg">Explore the latest trends in AI voice technology, text to speech tips, and content creation strategies.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
                  {BLOG_ARTICLES.map((article, i) => (
                    <div 
                      key={`article-${i}`} 
                      className="group cursor-pointer space-y-6" 
                      onClick={() => { setSelectedArticle(i); setShowBlog(true); }}
                    >
                      <div className="aspect-video rounded-[2rem] overflow-hidden border border-zinc-100 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-500 relative">
                        <motion.div
                          className="w-full h-full"
                          animate={{ 
                            scale: [1, 1.02, 1],
                            filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"]
                          }}
                          transition={{ 
                            duration: 4, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                          }}
                        >
                          <img src={article.img} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                        </motion.div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-zinc-900 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-500 shadow-xl">
                            <Play size={32} fill="currentColor" className="ml-1" />
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <motion.div 
                            className="h-full bg-emerald-500"
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          />
                        </div>
                      </div>
                      <div className="space-y-3 px-2">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">{article.date}</span>
                          <span className="text-zinc-300">•</span>
                          <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">AI Technology</span>
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors leading-tight">{article.title}</h3>
                        <p className="text-zinc-500 leading-relaxed line-clamp-2">{article.excerpt}</p>
                        <div className="pt-2 flex items-center gap-2 text-emerald-600 font-bold text-sm group-hover:gap-3 transition-all">
                          Read Article <ArrowRight size={18} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-emerald-50/50 py-24">
              <div className="max-w-6xl mx-auto px-6">
                <div className="glass-panel p-12 md:p-20 rounded-[4rem] border-zinc-100 bg-white shadow-xl shadow-emerald-900/5 space-y-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                  <div className="text-center space-y-4 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-zinc-900">VoxNova Text to Speech: Professional Hindi Voiceovers</h2>
                    <p className="text-zinc-600 max-w-2xl mx-auto text-lg">VoxNova is a premium AI voice generator that enables you to create high-quality Hindi voiceovers with ease.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                    <div className="space-y-6">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                        <Video size={28} />
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-2xl font-bold text-zinc-900">Perfect for YouTube and Reels</h4>
                        <p className="text-zinc-600 leading-relaxed text-lg">
                          Whether you're creating YouTube videos or Instagram Reels, our voices will make your content more engaging. Voices like 'Pankaj' and 'Sultan' are perfect for motivational and news content.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                        <Zap size={28} />
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-2xl font-bold text-zinc-900">Fast and Easy Voice Generation</h4>
                        <p className="text-zinc-600 leading-relaxed text-lg">
                          Simply type your text, choose your favorite voice, and click 'Generate'. Your professional voiceover will be ready in seconds. You can also customize the pitch and speed to suit your needs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white py-24">
              <div className="max-w-6xl mx-auto px-6 space-y-16">
                <div className="text-center space-y-4">
                  <h3 className="text-4xl font-display font-bold text-zinc-900">Frequently Asked Questions</h3>
                  <p className="text-zinc-500">Everything you need to know about VoxNova.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { q: "What is VoxNova Text to Speech?", a: "VoxNova is an advanced AI voice generation platform that converts text into realistic, human-like speech using neural networks." },
                    { q: "Is VoxNova free to use?", a: "We offer both free and premium plans. Free users get a daily credit limit, while premium users enjoy unlimited generations and high-fidelity voices." },
                    { q: "Can I use VoxNova voices for commercial projects?", a: "Yes, all audio generated with VoxNova can be used for commercial projects, including YouTube, social media, and professional presentations." },
                    { q: "How many languages does VoxNova support?", a: "Currently, we specialize in high-quality English and Hindi voices, with more languages being added regularly." },
                    { q: "How do I get the best quality AI voice?", a: "For the best results, use proper punctuation in your scripts and adjust the 'Style' and 'Pitch' settings to match your content's mood." },
                    { q: "Does VoxNova support voice cloning?", a: "Yes, our premium plan includes AI voice cloning technology that allows you to create a digital version of any voice from a short sample." }
                  ].map((faq, i) => (
                    <div key={`faq-${i}`} className="p-8 bg-zinc-50/50 rounded-[2rem] border border-zinc-100 space-y-3 hover:bg-white hover:shadow-lg transition-all duration-300">
                      <h4 className="text-lg font-bold text-zinc-900 flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {faq.q}
                      </h4>
                      <p className="text-zinc-500 leading-relaxed pl-5">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
        
        {/* End of SEO/Blog sections */}

        {/* Footer */}
        <footer className="max-w-6xl mx-auto py-24 px-6 border-t border-zinc-100">
          <div className="flex flex-col items-center gap-12">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center shadow-lg">
                  <Mic className="text-white" size={22} />
                </div>
                <div className="flex flex-col text-center">
                  <span className="text-2xl font-display font-bold tracking-tighter text-zinc-900">VOXNOVA</span>
                  <span className="text-[10px] text-emerald-500 font-black tracking-[0.2em] -mt-1 uppercase">Text to Speech</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
              <button onClick={() => setShowAbout(true)} className="hover:text-emerald-500 transition-colors cursor-pointer">About Us</button>
              <a href="mailto:robotlinkan@gmail.com" className="hover:text-emerald-500 transition-colors cursor-pointer">Contact Us</a>
              <button onClick={() => setShowBlog(true)} className="hover:text-emerald-500 transition-colors cursor-pointer">Blog</button>
              <button onClick={() => setShowPrivacy(true)} className="hover:text-emerald-500 transition-colors cursor-pointer">Privacy Policy</button>
              <button onClick={() => setShowTerms(true)} className="hover:text-emerald-500 transition-colors cursor-pointer">Terms of Service</button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">© 2026 VoxNova Text to Speech. All rights reserved.</p>
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

        {showBlog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowBlog(false); setSelectedArticle(null); }}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white p-8 md:p-12 rounded-[2.5rem] border border-zinc-200 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <button onClick={() => { setShowBlog(false); setSelectedArticle(null); }} className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-900"><X size={20} /></button>
              
              {selectedArticle === null ? (
                <div className="space-y-8">
                  <h2 className="text-4xl font-display font-bold text-zinc-900">VoxNova AI Voice Blog</h2>
                  <div className="grid grid-cols-1 gap-8">
                    {BLOG_ARTICLES.map((article, i) => (
                      <div key={`blog-list-${i}`} className="p-6 rounded-3xl border border-zinc-100 hover:border-emerald-500/20 transition-all cursor-pointer" onClick={() => setSelectedArticle(i)}>
                        <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-2">{article.date}</div>
                        <h3 className="text-2xl font-bold text-zinc-900 mb-3">{article.title}</h3>
                        <p className="text-zinc-500 leading-relaxed mb-4">{article.excerpt}</p>
                        <div className="text-emerald-600 font-bold flex items-center gap-2">Read Full Article <ArrowRight size={16} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <button onClick={() => setSelectedArticle(null)} className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 font-medium">
                    <ArrowUp className="-rotate-90" size={16} /> Back to Blog
                  </button>
                  
                  {BLOG_ARTICLES[selectedArticle].content}
                </div>
              )}
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
                {allVoices.filter(v => {
                  const matchesSearch = v.name.toLowerCase().includes(voiceSearchTerm.toLowerCase());
                  if (v.id === 'original') return false;
                  return matchesSearch;
                }).map((voice, idx) => (
                  <div 
                    key={`voice-lib-item-${voice.id}-${idx}`}
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

      </main>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>
      </div>
    )}
  </AnimatePresence>
</ErrorBoundary>
);
};

export default App;
