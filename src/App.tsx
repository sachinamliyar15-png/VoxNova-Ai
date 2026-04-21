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
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
import { testFirestoreConnection } from './lib/firebaseUtils';

const BLOG_ARTICLES = [
  {
    title: "How AI Voice Generators are Changing Content Creation",
    excerpt: "AI voice technology has evolved significantly in recent years. From robotic voices to ultra-realistic human-like speech, the journey has been remarkable. VoxNova Text to Speech uses advanced neural networks to capture the nuances of human emotion...",
    date: "March 28, 2026",
    img: "https://picsum.photos/seed/ai-voice/800/450",
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
    img: "https://picsum.photos/seed/hindi/800/450",
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
    img: "https://picsum.photos/seed/future/800/450",
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
    img: "https://picsum.photos/seed/studio/800/450",
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
  
  const grouped: CaptionWord[] = [];
  
  if (isSmart) {
    let i = 0;
    while (i < words.length) {
      const currentWord = words[i];
      const nextWord = words[i + 1];
      const nextNextWord = words[i + 2];
      
      let count = 1;
      
      // Smart chunking: Group words if they are close in time and short in length
      if (nextWord) {
        const gap = nextWord.start - currentWord.end;
        const totalLen = currentWord.word.length + nextWord.word.length;
        
        if (gap < 0.3 && totalLen < 12) {
          count = 2;
          
          if (nextNextWord) {
             const gap2 = nextNextWord.start - nextWord.end;
             const totalLen2 = totalLen + nextNextWord.word.length;
             if (gap2 < 0.2 && totalLen2 < 18) {
               count = 3;
             }
          }
        }
      }
      
      const chunk = words.slice(i, i + count);
      grouped.push({
        word: chunk.map(w => w.word).join(' '),
        start: chunk[0].start,
        end: chunk[chunk.length - 1].end
      });
      i += count;
    }
  } else if (wordsPerLine <= 1) {
    grouped.push(...words);
  } else {
    for (let i = 0; i < words.length; i += wordsPerLine) {
      const chunk = words.slice(i, i + wordsPerLine);
      grouped.push({
        word: chunk.map(w => w.word).join(' '),
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

  // Ensure the first caption starts at 0 if it's very close to the start
  if (grouped.length > 0 && grouped[0].start < 4.0) {
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
  onUpdateStyle
}: { 
  words: CaptionWord[], 
  currentTime: number, 
  style: CaptionStyle, 
  animation: string,
  shadowColor: string,
  onUpdateStyle?: (style: Partial<CaptionStyle>) => void
}) => {
  // Use the currentTime directly as it already includes the user-defined captionOffset from the parent
  const adjustedTime = currentTime;
  
  const displayWords = React.useMemo(() => groupWordsIntoLines(words, style.wordsPerLine, style.isSmart), [words, style.wordsPerLine, style.isSmart]);
  const currentWordIndex = displayWords.findIndex(w => adjustedTime >= w.start && adjustedTime <= w.end);
  const currentWord = displayWords[currentWordIndex];
  
  // RE-INTRODUCED: Subtle "living" motion that is predictable and smooth
  // This uses a sine wave based on global time to avoid jitter between captions
  const [floatY, setFloatY] = React.useState(0);
  const [floatX, setFloatX] = React.useState(0);

  React.useEffect(() => {
    let frameId: number;
    const start = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - start) / 1000;
      // Very subtle slow drift
      setFloatY(Math.sin(elapsed * 1.5) * 5);
      setFloatX(Math.cos(elapsed * 1.2) * 3);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const floatingOffset = style.isSmart ? { x: floatX, y: floatY } : { x: 0, y: 0 };

  if (!currentWord) return null;

  const getDynamicColor = (index: number, word: CaptionWord) => {
    if (style.isDynamic) {
      const colors = style.threeColors || ['#ffffff', '#ffff00', '#00ff00'];
      
      // Professional Alternating Pattern (Side-by-Side)
      // We use the word index within the current line for the alternating effect
      const wordsInLine = word.word.split(' ');
      if (wordsInLine.length > 1) {
        // If the word itself contains multiple words (grouped), we can't easily color them differently
        // unless we split them here. But for now, let's use the global index.
      }
      
      const globalIndex = words.findIndex(w => w.start === word.start && w.word === word.word);
      return colors[globalIndex % colors.length];
    }
    return style.color || '#ffffff';
  };

  const getAnimationProps = () => {
    switch (animation) {
      case 'typing':
      case 'typewriter':
        return {
          initial: { opacity: 0, y: 2 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.15, ease: "easeOut" as const }
        };
      case 'pop':
        return {
          initial: { scale: 0.9, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { type: 'spring' as const, stiffness: 600, damping: 25 }
        };
      case 'professional':
        return {
          initial: { scale: 0.9, opacity: 0, y: 10 },
          animate: { scale: 1, opacity: 1, y: 0 },
          transition: { 
            duration: 0.1,
            ease: "easeOut" as const
          }
        };
      case 'snappy':
        return {
          initial: { scale: 0.5, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { 
            type: "spring" as const,
            stiffness: 1000,
            damping: 15,
            duration: 0.05
          }
        };
      case 'snappy-pop':
        return {
          initial: { scale: 0.5, opacity: 0, y: 10 },
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
          animate: { scale: [0, 1.2, 1], opacity: 1 },
          transition: { duration: 0.4 }
        };
      case 'glitch':
        return {
          initial: { opacity: 0, x: 0 },
          animate: { 
            opacity: 1,
            x: [0, -2, 2, -2, 2, 0],
            filter: [
              'none',
              'drop-shadow(2px 0 #ff00ff) drop-shadow(-2px 0 #00ffff)',
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
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.5 }
          }
        };
      case 'fade':
        return {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
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
    textShadow: style.shadow 
      ? `2px 2px 0px ${style.shadowColor || 'rgba(0,0,0,0.5)'}` 
      : style.glow 
        ? `0 0 10px ${style.color}, 0 0 20px ${style.color}` 
        : 'none',
    WebkitTextStroke: style.border !== 'none' ? `${style.strokeWidth || 1}px ${style.outlineColor || '#000000'}` : 'none',
    paintOrder: 'stroke fill markers',
    ['WebkitPaintOrder' as any]: 'stroke fill markers',
    backgroundColor: style.backgroundColor && style.backgroundColor !== 'transparent' ? style.backgroundColor : 'transparent',
    padding: style.backgroundColor && style.backgroundColor !== 'transparent' ? '4px 12px' : '0',
    borderRadius: '8px',
    display: 'inline-block',
    whiteSpace: 'pre-wrap',
    fontStyle: style.italic ? 'italic' : 'normal',
    fontWeight: style.fontWeight || 'bold'
  };

  const getPositionClass = (pos?: string) => {
    const p = pos || style.position;
    switch (p) {
      case 'top': return 'top-[15%] justify-center';
      case 'middle': return 'top-1/2 -translate-y-1/2 justify-center';
      case 'bottom': return 'bottom-[15%] justify-center';
      case 'left': return 'top-1/2 -translate-y-1/2 justify-start px-12';
      case 'right': return 'top-1/2 -translate-y-1/2 justify-end px-12';
      case 'top-left': return 'top-[15%] justify-start px-12';
      case 'top-right': return 'top-[15%] justify-end px-12';
      case 'bottom-left': return 'bottom-[15%] justify-start px-12';
      case 'bottom-right': return 'bottom-[15%] justify-end px-12';
      default: return 'bottom-[15%]';
    }
  };

  const getAlignmentClass = (pos?: string) => {
    const p = pos || style.position;
    if (p.includes('left')) return 'justify-start text-left';
    if (p.includes('right')) return 'justify-end text-right';
    return 'justify-center text-center';
  };

  const getWordStyle = (word: CaptionWord, index: number): React.CSSProperties => {
    const finalShadow = style.shadowColor || propShadowColor;
    const baseStyle: React.CSSProperties = {
      fontFamily: style.font,
      fontSize: `${word.fontSize || style.fontSize}px`,
      color: word.color || (style.isDynamic ? getDynamicColor(index, word) : style.color),
      textTransform: style.case === 'uppercase' ? 'uppercase' : style.case === 'lowercase' ? 'lowercase' : 'none',
      padding: style.padding || '0 4px',
      borderRadius: style.borderRadius || '4px',
      letterSpacing: style.letterSpacing || 'normal',
      display: 'inline-block',
      margin: '0 4px',
      transition: 'all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      fontStyle: style.italic ? 'italic' : 'normal',
      fontWeight: style.fontWeight || 'bold'
    };

    if (style.border === 'thin') {
      (baseStyle as any).WebkitTextStroke = `${style.strokeWidth || 1}px ${style.outlineColor || '#000000'}`;
      (baseStyle as any).paintOrder = 'stroke fill markers';
      (baseStyle as any).WebkitPaintOrder = 'stroke fill markers';
    } else if (style.border === 'thick') {
      (baseStyle as any).WebkitTextStroke = `${(style.strokeWidth || 2.5) * 2}px ${style.outlineColor || '#000000'}`;
      (baseStyle as any).paintOrder = 'stroke fill markers';
      (baseStyle as any).WebkitPaintOrder = 'stroke fill markers';
    }

    if (style.glow) {
      baseStyle.textShadow = `0 0 10px ${style.color}, 0 0 20px ${style.color}`;
    }

    if (style.shadow) {
      baseStyle.textShadow = `2px 2px 0px ${finalShadow}, -2px -2px 0px ${finalShadow}, 2px -2px 0px ${finalShadow}, -2px 2px 0px ${finalShadow}, 0px 4px 10px rgba(0,0,0,0.5)`;
    }
    
    // Highlight logic
    if (word.isHighlighted) {
      return {
        ...baseStyle,
        backgroundColor: word.highlightColor || '#facc15', // Use custom color or default viral yellow
        color: '#000000',
        transform: 'rotate(-2deg) scale(1.15)',
        fontWeight: '900',
        boxShadow: `4px 4px 0px ${finalShadow}4D`,
      };
    }

    return baseStyle;
  };

  const currentWordPosition = currentWord.position || style.position;

  // Handle Dragging
  const handleDragEnd = (_: any, info: any) => {
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

    if (isSequential || animation === 'karaoke' || animation === 'zeemo') {
      return (
        <div 
          style={{...textStyle, maxWidth: '95%', margin: '0 auto', backgroundColor: 'transparent', padding: 0}} 
          className={`flex flex-wrap ${alignmentClass} gap-x-[0.25em] gap-y-1 overflow-visible pointer-events-none`}
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
              <motion.span 
                key={`word-${w.start}-${i}-${animation}`}
                initial={{ opacity: 0, scale: 0.8, y: 5 }}
                animate={wordAnimation as any}
                transition={{ 
                  duration: 0.15,
                  ease: "easeOut"
                }}
                style={{
                  ...getWordStyle(w, i),
                  display: 'inline-block',
                  whiteSpace: 'nowrap', // Prevent awkward wrapping mid-word
                  color: (isActive || isVisible) ? (w.color || (style.isDynamic ? getDynamicColor(i, w) : style.color)) : 'rgba(255,255,255,0.2)',
                  opacity: isVisible ? 1 : (isKaraoke ? 0.3 : 0)
                }}
              >
                {w.word}
              </motion.span>
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
                            fontWeight: '900',
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
      return (
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${currentWord.word}-${currentWord.start}`}
            initial={{ scale: 0.8, opacity: 0, y: 15 }}
            animate={{ 
              scale: 1.15, 
              opacity: 1, 
              y: 0,
              color: style.color
            }}
            exit={{ scale: 0.9, opacity: 0, y: -10 }}
            transition={{ 
              type: 'spring', 
              stiffness: animation === 'snappy-pop' ? 700 : 450, 
              damping: 25 
            }}
            style={{ 
              ...getWordStyle(currentWord, words.indexOf(currentWord)), 
              maxWidth: '90%', 
              margin: '0 auto',
            }}
            className="font-bold text-center px-4 flex flex-wrap justify-center gap-[0.25em]"
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
        </AnimatePresence>
      );
    }

    // Glow animation
    if (animation === 'glow') {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentWord.word}-${currentWord.start}-${currentWord.end}`}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ 
              opacity: 1, 
              filter: 'blur(0px)',
              y: style.isSmart ? floatingOffset.y : 0,
              x: style.isSmart ? floatingOffset.x : 0
            }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            style={{ ...getWordStyle(currentWord, words.indexOf(currentWord)) }}
            className="font-bold text-center px-4 flex flex-wrap justify-center gap-[0.25em]"
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
        </AnimatePresence>
      );
    }

    // Default style
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentWord.word}-${currentWord.start}-${currentWord.end}`}
          {...getAnimationProps()}
          animate={{
            ...getAnimationProps().animate,
            x: style.isSmart ? floatingOffset.x : 0,
            y: style.isSmart ? floatingOffset.y : 0
          }}
          style={getWordStyle(currentWord, words.indexOf(currentWord))}
          className={`font-bold ${alignmentClass} px-4 flex flex-wrap gap-[0.25em]`}
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
      </AnimatePresence>
    );
  };

  return (
    <div className={`absolute left-0 right-0 flex pointer-events-none z-[100] ${getPositionClass(displayPosition)}`}>
      <motion.div 
        drag
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={{
          x: (style.x || 0) + floatingOffset.x,
          y: (style.y || 0) + floatingOffset.y
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 30 }}
        style={{ 
          cursor: 'grab'
        }}
        className="pointer-events-auto active:cursor-grabbing min-h-[100px] flex items-center justify-center"
      >
        {renderContent()}
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
  const [targetLanguage, setTargetLanguage] = useState('English');
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [captionFile, setCaptionFile] = useState<File | null>(null);
  const [captionResult, setCaptionResult] = useState<any>(null);
  const [captionWords, setCaptionWords] = useState<CaptionWord[]>([]);
  const [captionScriptType, setCaptionScriptType] = useState<'hindi' | 'hinglish'>('hindi');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('hindi-viral-yellow');
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>(CAPTION_PRESETS[0].style);
  const [captionAnimation, setCaptionAnimation] = useState<string>(CAPTION_PRESETS[0].animation);
  const [isSettingsLocked, setIsSettingsLocked] = useState(false);
  const [isEditingCaptions, setIsEditingCaptions] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [captionOffset, setCaptionOffset] = useState(0); // Set to 0 by default for true sync
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isCaptioning, setIsCaptioning] = useState(false);
  const [captionStep, setCaptionStep] = useState('');
  const [captionProgress, setCaptionProgress] = useState(0);
  const [showConfigError, setShowConfigError] = useState(false);
  const [translateToEnglish, setTranslateToEnglish] = useState(false);
  
  // Smooth time tracking for captions to ensure millimeter-precision
  useEffect(() => {
    let frameId: number;
    const updateSmoothTime = () => {
      const activeRef = activeTab === 'captions' ? videoRef.current : audioRef.current;
      if (activeRef && !activeRef.paused) {
        // Only update if the difference is meaningful (prevents jitter)
        const diff = Math.abs(activeRef.currentTime - currentTime);
        if (diff > 0.005) { 
          setCurrentTime(activeRef.currentTime);
          setAudioCurrentTime(activeRef.currentTime);
        }
      }
      frameId = requestAnimationFrame(updateSmoothTime);
    };
    
    frameId = requestAnimationFrame(updateSmoothTime);
    return () => cancelAnimationFrame(frameId);
  }, [activeTab, currentTime]);
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
    }, 5000);

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
    if (savedPresetId) setSelectedPresetId(savedPresetId);
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
    setCaptionStyle(CAPTION_PRESETS[0].style);
    setCaptionAnimation(CAPTION_PRESETS[0].animation);
    setSelectedPresetId(CAPTION_PRESETS[0].id);
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
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) return;
    try {
      console.log("Loading FFmpeg...");
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { toBlobURL } = await import('@ffmpeg/util');
      const ffmpeg = new FFmpeg();
      
      // Load ffmpeg.wasm from CDN for better performance and reliability
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      // Monitor progress for better UI feedback
      ffmpeg.on('progress', ({ progress }) => {
        // Map 0-1 progress to 90%-100% of the overall voice changer progress
        setVoiceChangingProgress(Math.floor(90 + (progress * 10)));
      });

      ffmpeg.on('log', ({ message }) => {
        console.log("FFmpeg Log:", message);
      });
      
      ffmpegRef.current = ffmpeg;
      setIsFFmpegLoaded(true);
      console.log("FFmpeg loaded successfully");
    } catch (error) {
      console.error("Failed to load FFmpeg:", error);
      setError("Failed to load video engine. Please refresh and try again.");
    }
  };

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const generateASS = (words: CaptionWord[], style: CaptionStyle) => {
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

    const alignment = style.position === 'top' ? 8 : style.position === 'middle' ? 5 : 2;
    const fontName = 'Arial'; // Standard fallback
    
    // Calculate base position for {\pos(x,y)} if custom x/y is used
    // We assume a 1280x720 canvas for ASS
    const basePositions = {
      top: { x: 640, y: 100 },
      middle: { x: 640, y: 360 },
      bottom: { x: 640, y: 620 }
    };
    const basePos = basePositions[style.position || 'bottom'];
    
    // Normalize offsets. We assume preview container is roughly 640px wide for scaling
    const scaleX = 1280 / 640; 
    const scaleY = 720 / 360; // Assuming 16:9 preview
    const customX = basePos.x + (style.x || 0) * scaleX;
    const customY = basePos.y + (style.y || 0) * scaleY;
    const posTag = (style.x !== undefined || style.y !== undefined) ? `{\\pos(${Math.round(customX)},${Math.round(customY)})}` : '';

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
    
    const outline = style.strokeWidth || (style.border === 'thick' ? 2 : style.border === 'thin' ? 1 : 0);
    const shadow = style.shadow ? 2 : 0;

    let ass = `[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColor, SecondaryColor, OutlineColor, BackColor, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${style.fontSize},${assColor},&H000000FF,${assOutlineColor},${assShadowColor},1,0,0,0,100,100,0,0,1,${outline},${shadow},${alignment},10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    displayWords.forEach((w, idx) => {
      let text = style.case === 'uppercase' ? w.word.toUpperCase() : style.case === 'lowercase' ? w.word.toLowerCase() : w.word;
      
      if (style.isDynamic) {
        const colors = style.threeColors || ['#ffffff', '#ffff00', '#00ff00'];
        // Alternating colors for professional look
        const color = colors[idx % colors.length];
        
        const assWordColor = hexToAss(color);
        text = `{\\c${assWordColor}}${text}`;
      }
      
      ass += `Dialogue: 0,${formatTime(w.start)},${formatTime(w.end)},Default,,0,0,0,,${posTag}${text}\n`;
    });

    return ass;
  };

  const burnCaptions = async (videoFile: File, words: CaptionWord[], style: CaptionStyle) => {
    console.log("Starting burnCaptions...");
    if (!ffmpegRef.current) {
      console.log("FFmpeg not loaded, loading now...");
      await loadFFmpeg();
    }
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg) throw new Error("Video engine failed to initialize");
    
    const { fetchFile } = await import('@ffmpeg/util');
    const inputName = 'input.mp4';
    const outputName = 'output.mp4';
    const assName = 'subtitles.ass';
    const fontName = 'Inter-Bold.ttf';
    
    setCaptionStep('Loading video engine...');
    console.log("Writing input file...");
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
    
    setCaptionStep('Loading professional font...');
    try {
      console.log("Fetching font...");
      // Load Inter-Bold for high quality captions
      const fontData = await fetchFile('https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter-Bold.ttf');
      await ffmpeg.writeFile(fontName, fontData);
    } catch (e) {
      console.warn("Font load failed, using fallback", e);
    }
    
    setCaptionStep('Generating subtitle data...');
    // We update generateASS to use the font we just loaded
    const assContent = generateASS(words, style).replace(/Fontname, Arial/g, `Fontname, ${fontName}`);
    await ffmpeg.writeFile(assName, assContent);
    
    setCaptionStep('Burning captions (this may take a minute)...');
    setCaptionProgress(50);
    
    // Clean up old files to prevent issues
    try {
      await ffmpeg.deleteFile(outputName);
    } catch (e) {}
 
    console.log("Executing FFmpeg command...");
    // Run ffmpeg command to burn subtitles
    // We use libx264 and ensure the font path is handled
    try {
      await ffmpeg.exec([
        '-i', inputName, 
        '-vf', `ass=${assName}`, 
        '-c:v', 'libx264', 
        '-preset', 'ultrafast', 
        '-crf', '23',
        '-c:a', 'copy', 
        outputName
      ]);
    } catch (e) {
      console.error("FFmpeg primary exec failed:", e);
      // Fallback to subtitles filter if ass fails
      await ffmpeg.exec([
        '-i', inputName, 
        '-vf', `subtitles=${assName}`, 
        '-c:v', 'libx264', 
        '-preset', 'ultrafast', 
        '-c:a', 'copy', 
        outputName
      ]);
    }
    
    setCaptionProgress(90);
    setCaptionStep('Finalizing video...');
    
    // Small delay to ensure file system is synced
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log("Reading output file...");
    const data = await ffmpeg.readFile(outputName);
    if (!data || data.length === 0) throw new Error("Generated video is empty");
    
    console.log("Burn captions complete");
    return new Blob([data], { type: 'video/mp4' });
  };

  const mergeAudioWithVideo = async (videoFile: File, audioData: string) => {
    if (!ffmpegRef.current) await loadFFmpeg();
    const ffmpeg = ffmpegRef.current;
    
    const fetchFile = (await import('@ffmpeg/util')).fetchFile;
    const inputVideo = 'video.mp4';
    const inputAudio = 'audio.wav';
    const outputName = 'processed.mp4';
    
    // Clear any previous files to prevent disk usage issues
    try {
      await ffmpeg.deleteFile(inputVideo);
      await ffmpeg.deleteFile(inputAudio);
      await ffmpeg.deleteFile(outputName);
    } catch (e) {
      // Ignore errors if files don't exist
    }
    
    setVoiceChangingStep('Writing video track...');
    await ffmpeg.writeFile(inputVideo, await fetchFile(videoFile));
    setVoiceChangingProgress(85);
    
    setVoiceChangingStep('Preparing audio track...');
    // Gemini TTS returns raw PCM (24kHz, 16-bit mono). FFmpeg needs a WAV header to read it correctly as .wav
    const pcmBuffer = base64ToArrayBuffer(audioData);
    const wavHeader = createWavHeader(pcmBuffer, 24000);
    const fullAudioBuffer = new Uint8Array(wavHeader.byteLength + pcmBuffer.byteLength);
    fullAudioBuffer.set(new Uint8Array(wavHeader), 0);
    fullAudioBuffer.set(new Uint8Array(pcmBuffer), wavHeader.byteLength);
    
    await ffmpeg.writeFile(inputAudio, fullAudioBuffer);
    setVoiceChangingProgress(90);
    
    setVoiceChangingStep('Merging audio and video...');
    // Merge audio and video, replacing original audio
    // Use -c:a aac for better compatibility and to ensure output plays everywhere
    // Add -preset ultrafast for faster processing in the browser
    await ffmpeg.exec([
      '-i', inputVideo, 
      '-i', inputAudio, 
      '-c:v', 'copy', 
      '-c:a', 'aac', 
      '-b:a', '128k',
      '-map', '0:v:0', 
      '-map', '1:a:0', 
      '-shortest',
      '-preset', 'ultrafast',
      outputName
    ]);
    
    setVoiceChangingProgress(98);
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
          voice_id: selectedVoice.name,
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
      const resultText = data.transcribedText || "";
      
      setVoiceChangingProgress(80);
      setVoiceChangingStep('Finalizing audio stream...');

      if (voiceChangingFile.type.startsWith('video/')) {
        setVoiceChangingStep('Merging with video...');
        const videoBlob = await mergeAudioWithVideo(voiceChangingFile, audioBase64);
        setVoiceChangingResult({
          url: URL.createObjectURL(videoBlob),
          type: 'video'
        });
      } else {
        // Convert to WAV for audio-only, detecting if already a WAV file
        const pcmBuffer = base64ToArrayBuffer(audioBase64);
        const firstFour = new Uint8Array(pcmBuffer.slice(0, 4));
        const isAlreadyWav = String.fromCharCode(firstFour[0], firstFour[1], firstFour[2], firstFour[3]) === 'RIFF';
        
        let finalBlob;
        if (isAlreadyWav) {
          finalBlob = new Blob([pcmBuffer], { type: 'audio/wav' });
        } else {
          // Note: Gemini flash-tts-preview returns 24kHz PCM for voice changer mode
          const wavHeader = createWavHeader(pcmBuffer, 24000);
          const combinedBuffer = new Uint8Array(wavHeader.byteLength + pcmBuffer.byteLength);
          combinedBuffer.set(new Uint8Array(wavHeader), 0);
          combinedBuffer.set(new Uint8Array(pcmBuffer), wavHeader.byteLength);
          finalBlob = new Blob([combinedBuffer], { type: 'audio/wav' });
        }
        
        setVoiceChangingResult({
          url: URL.createObjectURL(finalBlob),
          type: 'audio'
        });
      }

      setVoiceChangingProgress(100);
      setVoiceChangingStep('Complete!');
      showToast("Voice changed successfully!");
      if (auth.currentUser) fetchUserProfile(auth.currentUser);
    } catch (err: any) {
      console.error("Voice changer error:", err);
      setError(`Voice changer failed: ${err.message}`);
    } finally {
      setIsVoiceChanging(false);
    }
  };

  const toggleFullScreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        showToast(`Error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleCaptioning = async () => {
    if (!captionFile) return;
    const limit = currentUser ? 1024 * 1024 * 1024 : 100 * 1024 * 1024; // 1GB for logged in, 100MB for guest
    if (captionFile.size > limit) {
      setError(`Video file is too large (> ${currentUser ? '1GB' : '100MB'}). Please upload a smaller video for captioning.`);
      return;
    }
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
          language: targetLanguage,
          scriptType: captionScriptType,
          translateToEnglish
        })
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          if (errorData.code === 'AUTH_CONFIG_MISSING') {
            setShowConfigError(true);
            return;
          }
          throw new Error(errorData.error || 'Failed to generate captions');
        } else {
          const text = await response.text();
          console.error('[Captions] Non-JSON error response:', text.substring(0, 200));
          throw new Error(`The AI caption engine returned an unexpected response (${response.status}). It might be restarting or overloaded.`);
        }
      }

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error("Server did not return a valid JSON response for captions.");
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
        srt,
        words: data.words
      });

      // Save to History
      const newGen: Generation = {
        id: `cap-${Date.now()}`,
        text: `${data.words.length} words transcribed`,
        voice_name: 'Captions',
        style: 'Default',
        created_at: new Date().toISOString(),
        type: 'caption',
        words: data.words,
        timestamp: { _seconds: Math.floor(Date.now() / 1000) }
      };

      setHistory(prev => [newGen, ...prev]);

      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          await fetch('/api/save', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              text: `${data.words.length} words transcribed`,
              type: 'caption',
              words: data.words,
              creditCost: 10 // Fixed cost for captioning for now
            })
          });
          fetchHistory(currentUser);
        } catch (saveErr) {
          console.error("Failed to save caption history:", saveErr);
        }
      } else {
        const guestHistory = localStorage.getItem('voxnova_guest_history');
        let historyArray: Generation[] = [];
        if (guestHistory) {
          try {
            historyArray = JSON.parse(guestHistory);
          } catch (e) {}
        }
        historyArray.unshift(newGen);
        if (historyArray.length > 20) historyArray = historyArray.slice(0, 20);
        localStorage.setItem('voxnova_guest_history', JSON.stringify(historyArray));
      }
      
      setCaptionProgress(100);
      setCaptionStep('Captions ready!');
      if (auth.currentUser) fetchUserProfile(auth.currentUser);
    } catch (err: any) {
      setError(`Captioning failed: ${err.message}`);
    } finally {
      setIsCaptioning(false);
    }
  };

  const handleExportCaptions = async () => {
    if (!captionFile || captionWords.length === 0) return;
    setIsCaptioning(true);
    setCaptionProgress(0);
    setCaptionStep('Burning captions into video...'); 
    
    try {
      const videoBlob = await burnCaptions(captionFile, captionWords, captionStyle);
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VoxNova Text to Speech - Captions - ${captionFile.name}`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Video exported successfully!");
    } catch (err: any) {
      setError(`Export failed: ${err.message}`);
    } finally {
      setIsCaptioning(false);
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
          voice_name: selectedVoice.name,
          style,
          speed,
          pitch,
          language,
          studioClarity,
          pause,
          cloned_voice_traits: (selectedVoice as any).fingerprint || null
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
            className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
            <p className="mt-4 text-zinc-500 font-medium animate-pulse">Initializing VoxNova...</p>
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

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !text || !selectedVoice}
                  className="w-full py-5 px-6 bg-emerald-500 text-white rounded-3xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/20 group"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={24} />
                      <span>Generating {generationProgress}%</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles size={24} className="group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />
                      <span>Generate Voice</span>
                    </>
                  )}
                </button>

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
                          <button 
                            onClick={() => setSpeed(1.6)}
                            className={`flex-1 py-1 rounded-md text-[10px] border ${speed === 1.6 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-200 text-zinc-500 hover:text-zinc-900'}`}
                          >
                            (U Fast)
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
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
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
              className="max-w-6xl mx-auto space-y-8"
            >
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-bold text-zinc-900">Auto Caption</h2>
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
                    <button 
                      onClick={handleExportCaptions}
                      disabled={isCaptioning}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 min-w-[120px] justify-center"
                    >
                      {isCaptioning ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          <span>Exporting...</span>
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          Export Video
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => {
                        const blob = new Blob([captionResult.srt], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'VoxNova Text to Speech - captions.srt';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all"
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
                  <div className="glass-panel p-4 rounded-[2.5rem] border-zinc-100 bg-zinc-900 relative overflow-hidden aspect-video flex items-center justify-center">
                    {captionFile ? (
                        <div ref={videoContainerRef} className="relative w-full h-full group bg-black">
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
                              currentTime={currentTime + (captionOffset / 1000)} 
                              style={captionStyle} 
                              animation={captionAnimation} 
                              shadowColor={shadowColor}
                              onUpdateStyle={(updates) => setCaptionStyle(prev => ({ ...prev, ...updates }))}
                            />
                          )}
                          <button 
                            onClick={toggleFullScreen}
                            className="absolute bottom-4 right-12 p-3 bg-zinc-900/80 text-white rounded-xl transition-all z-[110] hover:bg-zinc-900 shadow-xl border border-white/10 flex items-center gap-2 font-bold text-xs"
                            title="Toggle Full Screen (with Captions)"
                          >
                            <Maximize size={18} />
                            Full Screen
                          </button>
                          <button 
                            onClick={() => document.getElementById('video-upload-captions')?.click()}
                            className="absolute top-4 right-4 p-3 bg-white/10 text-white rounded-xl transition-all z-[110] hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center gap-2 font-bold text-xs group"
                            title="Change Video"
                          >
                            <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                            Change Video
                          </button>
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
                        <p className="text-xs opacity-50">MP4, MOV or WEBM (Max 500MB)</p>
                      </div>
                    )}
                    <input 
                      type="file" id="video-upload-captions" hidden accept="video/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file && file.size > 500 * 1024 * 1024) {
                          showToast("File too large (max 500MB)");
                          return;
                        }
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
                        <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                              <Languages size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-blue-900">Translate to English</p>
                              <p className="text-[10px] text-blue-600 font-medium">Convert Hindi to English</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setTranslateToEnglish(!translateToEnglish)}
                            className={`w-12 h-6 rounded-full transition-all relative ${translateToEnglish ? 'bg-blue-500' : 'bg-zinc-200'}`}
                          >
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${translateToEnglish ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>

                      <button 
                        onClick={handleCaptioning}
                        className="w-full py-5 bg-emerald-500 text-white rounded-3xl font-bold text-xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                      >
                        <Sparkles size={24} />
                        {currentUser ? 'Generate AI Captions' : 'Try for Free'}
                      </button>
                    </div>
                  )}

                  {isCaptioning && !captionWords.length && (
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
                        <Globe size={14} className="text-emerald-500" /> Language & Script
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        <select 
                          value={targetLanguage}
                          onChange={(e) => setTargetLanguage(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold focus:outline-none"
                        >
                          {LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.name}>{lang.name}</option>
                          ))}
                        </select>
                        
                        {targetLanguage === 'Hindi' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setCaptionScriptType('hindi')}
                              className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${captionScriptType === 'hindi' ? 'bg-zinc-900 text-white shadow-lg' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                            >
                              Hindi Script
                            </button>
                            <button 
                              onClick={() => setCaptionScriptType('hinglish')}
                              className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${captionScriptType === 'hinglish' ? 'bg-zinc-900 text-white shadow-lg' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                            >
                              Hinglish
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                            <Sparkles size={20} />
                          </div>
                          <h3 className="text-xl font-display font-bold text-zinc-900">Caption Studio</h3>
                        </div>
                        <button 
                          onClick={resetCaptionSettings}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-all"
                        >
                          <RotateCcw size={12} /> Reset
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* Presets Folder */}
                        <details className="group bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden shadow-sm" open>
                          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-100/50 transition-all list-none">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                                <Sparkles size={16} />
                              </div>
                              <span className="text-sm font-bold text-zinc-900">Style Presets</span>
                            </div>
                            <ChevronDown size={16} className="text-zinc-400 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="p-4 pt-0">
                            <div className="grid grid-cols-2 gap-2">
                              {CAPTION_PRESETS.map(preset => (
                                <button
                                  key={preset.id}
                                  onClick={() => {
                                    if (isSettingsLocked) {
                                      setCaptionAnimation(preset.animation);
                                      setCaptionStyle({
                                        ...captionStyle,
                                        isSmart: preset.style.isSmart,
                                        isDynamic: preset.style.isDynamic,
                                        threeColors: preset.style.threeColors,
                                        position: preset.style.position,
                                        case: preset.style.case,
                                        wordsPerLine: preset.style.wordsPerLine
                                      });
                                    } else {
                                      setCaptionStyle(preset.style);
                                      setCaptionAnimation(preset.animation);
                                    }
                                    setSelectedPresetId(preset.id);
                                  }}
                                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl text-xs font-bold transition-all border ${
                                    selectedPresetId === preset.id 
                                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 ring-2 ring-emerald-500/20' 
                                      : 'bg-white border-zinc-100 text-zinc-600 hover:border-emerald-200 hover:bg-emerald-50/30'
                                  } group`}
                                >
                                  <div className="w-full aspect-video bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg flex items-center justify-center overflow-hidden relative group-hover:from-emerald-900 group-hover:to-zinc-900 transition-all duration-500">
                                     <motion.div 
                                       animate={{ 
                                         scale: [1, 1.1, 1],
                                         rotate: preset.animation === 'rotate' ? [0, 5, -5, 0] : 0,
                                         y: preset.animation === 'bounce' ? [0, -5, 0] : 0,
                                         x: preset.animation === 'shake' ? [0, -3, 3, -3, 3, 0] : 0,
                                         opacity: preset.animation === 'fade' ? [0.5, 1, 0.5] : 1
                                       }}
                                       transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                       className="font-bold text-[10px] text-center px-2 py-1 rounded shadow-lg"
                                       style={{
                                         color: preset.style.color,
                                         fontFamily: preset.style.font,
                                         textTransform: preset.style.case === 'uppercase' ? 'uppercase' : preset.style.case === 'lowercase' ? 'lowercase' : 'none',
                                         backgroundColor: preset.style.backgroundColor !== 'transparent' ? preset.style.backgroundColor : 'transparent',
                                         textShadow: preset.style.shadow 
                                           ? `${preset.style.shadowColor} 1px 1px 2px` 
                                           : preset.style.glow 
                                             ? `0 0 5px ${preset.style.color}` 
                                             : 'none',
                                         WebkitTextStroke: preset.style.border !== 'none' ? `${(preset.style.strokeWidth || 1) / 2}px ${preset.style.outlineColor}` : 'none',
                                         paintOrder: 'stroke fill',
                                         ['WebkitPaintOrder' as any]: 'stroke fill',
                                         fontStyle: preset.style.italic ? 'italic' : 'normal',
                                       }}
                                     >
                                       {preset.name}
                                     </motion.div>
                                  </div>
                                  <span className={selectedPresetId === preset.id ? 'text-emerald-700' : 'group-hover:text-emerald-600'}>
                                    {preset.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </details>

                        {/* Typography Folder */}
                        <details className="group bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
                          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-100/50 transition-all list-none">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                <Type size={16} />
                              </div>
                              <span className="text-sm font-bold text-zinc-900">Typography & Layout</span>
                            </div>
                            <ChevronDown size={16} className="text-zinc-400 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="p-4 pt-0 space-y-4">
                            <div className="space-y-2">
                              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Font Family</span>
                              <select 
                                value={captionStyle.font}
                                onChange={(e) => setCaptionStyle({...captionStyle, font: e.target.value})}
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                              >
                                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Case</span>
                                <div className="flex gap-1 p-1 bg-white rounded-xl border border-zinc-100">
                                  {(['original', 'uppercase'] as const).map(c => (
                                    <button
                                      key={c}
                                      onClick={() => setCaptionStyle({...captionStyle, case: c})}
                                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all ${captionStyle.case === c ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                                    >
                                      {c}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Style</span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => setCaptionStyle({...captionStyle, fontWeight: captionStyle.fontWeight === '900' ? '400' : '900'})}
                                    className={`flex-1 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${captionStyle.fontWeight === '900' ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm' : 'bg-white border-zinc-100 text-zinc-400 hover:text-zinc-600'}`}
                                  >
                                    Bold
                                  </button>
                                  <button
                                    onClick={() => setCaptionStyle({...captionStyle, italic: !captionStyle.italic})}
                                    className={`flex-1 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${captionStyle.italic ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm' : 'bg-white border-zinc-100 text-zinc-400 hover:text-zinc-600'}`}
                                  >
                                    Italic
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] text-zinc-500">
                                <span className="font-bold uppercase tracking-wider">Font Size</span>
                                <span className="font-mono text-emerald-600 font-bold">{captionStyle.fontSize}px</span>
                              </div>
                              <input 
                                type="range" min="16" max="120" 
                                value={captionStyle.fontSize} 
                                onChange={(e) => setCaptionStyle({...captionStyle, fontSize: parseInt(e.target.value)})}
                                className="w-full accent-zinc-900 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] text-zinc-500">
                                <span className="font-bold uppercase tracking-wider">Words Per Line</span>
                                <span className="font-mono text-emerald-600 font-bold">{captionStyle.wordsPerLine}</span>
                              </div>
                              <input 
                                type="range" min="1" max="10" 
                                value={captionStyle.wordsPerLine} 
                                onChange={(e) => setCaptionStyle({...captionStyle, wordsPerLine: parseInt(e.target.value)})}
                                className="w-full accent-zinc-900 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>

                            <div className="space-y-2">
                              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Position</span>
                              <div className="flex gap-1 p-1 bg-white rounded-xl border border-zinc-100">
                                {(['top', 'middle', 'bottom'] as const).map(pos => (
                                  <button
                                    key={pos}
                                    onClick={() => setCaptionStyle({...captionStyle, position: pos})}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold capitalize transition-all ${captionStyle.position === pos ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                                  >
                                    {pos}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </details>

                        {/* Animation Folder */}
                        <details className="group bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
                          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-100/50 transition-all list-none">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                                <Activity size={16} />
                              </div>
                              <span className="text-sm font-bold text-zinc-900">Animations</span>
                            </div>
                            <ChevronDown size={16} className="text-zinc-400 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="p-4 pt-0 grid grid-cols-1 gap-1.5">
                            {['pop', 'professional', 'snappy', 'snappy-pop', 'shake', 'bounce', 'slide', 'zoom', 'glitch', 'rotate', 'flip', 'skate', 'heartbeat', 'float', 'fade', 'glow', 'karaoke', 'zeemo', 'kinetic', 'typewriter'].map(anim => (
                              <button 
                                key={anim}
                                onClick={() => setCaptionAnimation(anim)}
                                className={`px-4 py-2.5 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between capitalize ${captionAnimation === anim ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}
                              >
                                {anim.replace('-', ' ')}
                                {captionAnimation === anim && <Check size={12} />}
                              </button>
                            ))}
                          </div>
                        </details>

                        {/* Effects Folder */}
                        <details className="group bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
                          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-100/50 transition-all list-none">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                                <Palette size={16} />
                              </div>
                              <span className="text-sm font-bold text-zinc-900">Colors & Effects</span>
                            </div>
                            <ChevronDown size={16} className="text-zinc-400 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="p-4 pt-0 space-y-4">
                            {!captionStyle.isDynamic && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Text Color</span>
                                  <div className="relative">
                                    <input 
                                      type="color"
                                      value={captionStyle.color}
                                      onChange={(e) => setCaptionStyle({...captionStyle, color: e.target.value})}
                                      className="w-full h-10 rounded-xl cursor-pointer opacity-0 absolute inset-0 z-10"
                                    />
                                    <div 
                                      className="w-full h-10 rounded-xl border-2 border-white shadow-md"
                                      style={{ backgroundColor: captionStyle.color }}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Background</span>
                                  <div className="relative">
                                    <input 
                                      type="color"
                                      value={captionStyle.backgroundColor === 'transparent' ? '#000000' : captionStyle.backgroundColor}
                                      onChange={(e) => setCaptionStyle({...captionStyle, backgroundColor: e.target.value})}
                                      className="w-full h-10 rounded-xl cursor-pointer opacity-0 absolute inset-0 z-10"
                                    />
                                    <div 
                                      className={`w-full h-10 rounded-xl border-2 border-white shadow-md flex items-center justify-center ${captionStyle.backgroundColor === 'transparent' ? 'bg-zinc-100' : ''}`}
                                      style={{ backgroundColor: captionStyle.backgroundColor }}
                                    >
                                      {captionStyle.backgroundColor === 'transparent' && <span className="text-[8px] text-zinc-400 font-bold">NONE</span>}
                                    </div>
                                    <button 
                                      onClick={() => setCaptionStyle({...captionStyle, backgroundColor: 'transparent'})}
                                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center z-20 hover:bg-red-600"
                                    >
                                      <X size={8} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="space-y-4 pt-4 border-t border-zinc-100">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-2"> Stroke & Outline </span>
                                <div className="flex gap-1 p-1 bg-white rounded-xl border border-zinc-100">
                                  {(['none', 'thin', 'thick'] as const).map(b => (
                                    <button
                                      key={b}
                                      onClick={() => setCaptionStyle({...captionStyle, border: b})}
                                      className={`px-3 py-1 rounded-lg text-[8px] font-bold capitalize transition-all ${captionStyle.border === b ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                                    >
                                      {b}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              {captionStyle.border !== 'none' && (
                                <div className="space-y-3 p-3 bg-white rounded-2xl border border-zinc-100 animate-in fade-in slide-in-from-top-2">
                                  <div className="flex gap-4">
                                    <div className="flex-1 space-y-1.5">
                                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Outline Color</span>
                                      <div className="relative">
                                        <input 
                                          type="color"
                                          value={captionStyle.outlineColor || '#000000'}
                                          onChange={(e) => setCaptionStyle({...captionStyle, outlineColor: e.target.value})}
                                          className="w-full h-8 rounded-lg cursor-pointer opacity-0 absolute inset-0 z-10"
                                        />
                                        <div 
                                          className="w-full h-8 rounded-lg border border-zinc-100 shadow-sm"
                                          style={{ backgroundColor: captionStyle.outlineColor || '#000000' }}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex-[2] space-y-1.5">
                                      <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                                        <span>Thickness</span>
                                        <span>{captionStyle.strokeWidth || 0}px</span>
                                      </div>
                                      <input 
                                        type="range" min="0" max="10" step="0.5"
                                        value={captionStyle.strokeWidth || 0} 
                                        onChange={(e) => setCaptionStyle({...captionStyle, strokeWidth: parseFloat(e.target.value)})}
                                        className="w-full accent-zinc-900 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-2">
                                  <Sparkles size={12} className="text-emerald-500" /> Alternating Colors
                                </span>
                                <button 
                                  onClick={() => setCaptionStyle({...captionStyle, isDynamic: !captionStyle.isDynamic})}
                                  className={`w-10 h-5 rounded-full transition-all relative ${captionStyle.isDynamic ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                                >
                                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${captionStyle.isDynamic ? 'left-6' : 'left-1'}`} />
                                </button>
                              </div>
                              
                              {captionStyle.isDynamic && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                  <p className="text-[10px] text-zinc-400">Alternates colors every word for a professional viral look.</p>
                                  <div className="flex gap-4">
                                    {[0, 1].map(idx => (
                                      <div key={`dynamic-color-input-${idx}`} className="flex-1 space-y-1.5">
                                        <span className="text-[8px] text-zinc-400 font-bold uppercase">Color {idx + 1}</span>
                                        <div className="relative">
                                          <input 
                                            type="color"
                                            value={(captionStyle.threeColors || ['#ffffff', '#ffff00', '#00ff00'])[idx]}
                                            onChange={(e) => {
                                              const newColors = [...(captionStyle.threeColors || ['#ffffff', '#ffff00', '#00ff00'])];
                                              newColors[idx] = e.target.value;
                                              setCaptionStyle({...captionStyle, threeColors: newColors});
                                            }}
                                            className="w-full h-8 rounded-lg cursor-pointer opacity-0 absolute inset-0 z-10"
                                          />
                                          <div 
                                            className="w-full h-8 rounded-lg border border-zinc-200 shadow-sm"
                                            style={{ backgroundColor: (captionStyle.threeColors || ['#ffffff', '#ffff00', '#00ff00'])[idx] }}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                              <div className="space-y-3">
                                <button
                                  onClick={() => setCaptionStyle({...captionStyle, glow: !captionStyle.glow})}
                                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all border ${
                                    captionStyle.glow ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200'
                                  }`}
                                >
                                  <Sparkles size={14} /> Glow
                                </button>
                              </div>
                              <div className="space-y-3">
                                <button
                                  onClick={() => setCaptionStyle({...captionStyle, shadow: !captionStyle.shadow})}
                                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all border ${
                                    captionStyle.shadow ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200'
                                  }`}
                                >
                                  <Monitor size={14} /> Shadow
                                </button>
                              </div>
                            </div>
                            
                            {captionStyle.shadow && (
                              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Shadow Color</span>
                                <div className="relative">
                                  <input 
                                    type="color"
                                    value={captionStyle.shadowColor || '#000000'}
                                    onChange={(e) => setCaptionStyle({...captionStyle, shadowColor: e.target.value})}
                                    className="w-full h-8 rounded-lg cursor-pointer opacity-0 absolute inset-0 z-10"
                                  />
                                  <div 
                                    className="w-full h-8 rounded-lg border border-zinc-100 shadow-sm"
                                    style={{ backgroundColor: captionStyle.shadowColor || '#000000' }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </details>

                        {/* Timing Folder */}
                        <details className="group bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
                          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-100/50 transition-all list-none">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                <Clock size={16} />
                              </div>
                              <span className="text-sm font-bold text-zinc-900">Timing & Sync</span>
                            </div>
                            <ChevronDown size={16} className="text-zinc-400 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="p-4 pt-0 space-y-4">
                            <div className="space-y-3">
                              <div className="flex justify-between text-[10px] text-zinc-500">
                                <span className="font-bold uppercase tracking-wider">Caption Offset</span>
                                <span className="font-mono text-emerald-600 font-bold">{captionOffset}ms</span>
                              </div>
                              <input 
                                type="range" min="-2000" max="2000" step="50"
                                value={captionOffset} 
                                onChange={(e) => setCaptionOffset(parseInt(e.target.value))}
                                className="w-full accent-zinc-900 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <p className="text-[9px] text-zinc-400 leading-relaxed">
                                Adjust if captions are appearing too early or too late. Positive values delay captions, negative values make them appear earlier.
                              </p>
                            </div>
                          </div>
                        </details>
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
                            a.download = `VoxNova Text to Speech - Captions - ${Date.now()}.srt`;
                            a.click();
                          }}
                          className="w-full py-3 bg-zinc-100 text-zinc-600 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={14} />
                          Download SRT
                        </button>
                        <button 
                          onClick={handleExportCaptions}
                          disabled={isCaptioning}
                          className="w-full py-4 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-900/20 disabled:opacity-50"
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
                      onClick={() => document.getElementById('audio-upload-vc-main')?.click()}
                      className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${voiceChangingFile ? 'border-emerald-500/50 bg-emerald-50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}`}
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

        {/* SEO Content Section (The "Boxes") - Moved to Bottom */}
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
                  { step: '01', title: 'Input Text', desc: 'Paste your script into our advanced editor. We support long-form content up to 5,000 characters.', img: 'https://picsum.photos/seed/editor/400/300' },
                  { step: '02', title: 'Select Voice', desc: 'Browse our library of 50+ professional AI voices, each with unique traits and characteristics.', img: 'https://picsum.photos/seed/voices/400/300' },
                  { step: '03', title: 'Fine-Tune', desc: 'Adjust pitch, speed, and emotional style to get the perfect performance for your project.', img: 'https://picsum.photos/seed/settings/400/300' },
                  { step: '04', title: 'Generate', desc: 'Our neural engines process your request in seconds, delivering studio-quality 48kHz audio.', img: 'https://picsum.photos/seed/audio/400/300' }
                ].map((item, i) => (
                  <div key={`step-en-${i}`} className="space-y-6 group">
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm group-hover:shadow-md transition-all duration-300">
                      <img src={item.img} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" referrerPolicy="no-referrer" />
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

        <section className="bg-zinc-50 py-24">
          <div className="max-w-6xl mx-auto px-6 space-y-16">
            <div className="text-center space-y-4">
              <h3 className="text-4xl font-display font-bold text-zinc-900">How VoxNova Works?</h3>
              <p className="text-zinc-500">Create your voice in four simple steps.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Enter Text', desc: 'Paste your script into our editor. We support long-form content up to 5,000 characters.', img: 'https://picsum.photos/seed/hi-step1/400/300' },
                { step: '02', title: 'Select Voice', desc: 'Choose your preferred voice from our library of 50+ professional AI voices.', img: 'https://picsum.photos/seed/hi-step2/400/300' },
                { step: '03', title: 'Adjust Settings', desc: 'Fine-tune pitch, speed, and emotional style to perfect your audio output.', img: 'https://picsum.photos/seed/hi-step3/400/300' },
                { step: '04', title: 'Generate Audio', desc: 'Our advanced AI engine will deliver studio-quality audio in just a few seconds.', img: 'https://picsum.photos/seed/hi-step4/400/300' }
              ].map((item, i) => (
                <div key={`step-hi-${i}`} className="space-y-6 group">
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-zinc-200 shadow-sm group-hover:shadow-md transition-all duration-300">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-xl font-display font-bold text-white shadow-lg shadow-emerald-200">
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
              <button onClick={() => setShowBlog(true)} className="hover:text-zinc-900 transition-colors">Blog</button>
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

      {/* Footer / Status */}
      <footer className="fixed bottom-0 left-0 right-0 md:left-64 p-4 border-t border-zinc-100 bg-white/80 backdrop-blur-md flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-[0.2em] z-40">
        <div className="flex items-center gap-4">
        </div>
        <div className="hidden md:block">
          VoxNova Text to Speech &copy; 2026
        </div>
      </footer>

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
