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
import { GoogleGenAI, Modality } from "@google/genai";
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
  const [showLimitToast, setShowLimitToast] = useState(false);
  const [userApiKey, setUserApiKey] = useState<string>(() => localStorage.getItem('voxnova_api_key') || '');
  const exhaustedKeysRef = useRef<Set<string>>(new Set());
  const [exhaustedCount, setExhaustedCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'dubbing' | 'voice-changer' | 'captions' | 'script-writer'>('generate');
  const [rawScript, setRawScript] = useState('');
  const [viralScript, setViralScript] = useState('');
  const [isWritingScript, setIsWritingScript] = useState(false);
  const [scriptTone, setScriptTone] = useState<'viral' | 'storytelling' | 'educational'>('viral');
  const [chatMessages, setChatMessages] = useState<{ id?: number, role: 'user' | 'model', content: string, type?: 'text' | 'image', imageUrl?: string, timestamp?: Date }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [currentScriptId, setCurrentScriptId] = useState<string | null>(null);
  const [scriptHistory, setScriptHistory] = useState<any[]>([]);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [playingId, setPlayingId] = useState<string | number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWebResearchEnabled, setIsWebResearchEnabled] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopGeneration = () => {
    stopGenerationRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsWritingScript(false);
    setIsGeneratingImage(false);
    setLoadingStep(0);
    setGenerationProgress(0);
  };
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Fetch script history from Firestore
  const fetchScriptHistory = async () => {
    if (!currentUser) return;
    setIsHistoryLoading(true);
    try {
      const q = query(
        collection(db, 'scripts'),
        where('userId', '==', currentUser.uid),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setScriptHistory(history);
    } catch (error) {
      console.error("Error fetching script history:", error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Save or update script in Firestore
  const saveScriptToFirestore = async (title: string, content: string, messages: any[]) => {
    if (!currentUser) return;
    try {
      const scriptData = {
        userId: currentUser.uid,
        title,
        content,
        messages,
        updatedAt: serverTimestamp(),
      };

      if (currentScriptId) {
        const scriptRef = doc(db, 'scripts', currentScriptId);
        await updateDoc(scriptRef, scriptData);
      } else {
        const docRef = await addDoc(collection(db, 'scripts'), {
          ...scriptData,
          createdAt: serverTimestamp()
        });
        setCurrentScriptId(docRef.id);
      }
      fetchScriptHistory();
    } catch (error) {
      console.error("Error saving script:", error);
    }
  };

  const handleDeleteScript = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'scripts', id));
      if (currentScriptId === id) {
        setCurrentScriptId(null);
        setChatMessages([]);
        setViralScript('');
      }
      fetchScriptHistory();
      showToast("Script deleted");
    } catch (error) {
      console.error("Error deleting script:", error);
    }
  };

  const handleRenameScript = async (id: string, newTitle: string) => {
    try {
      await updateDoc(doc(db, 'scripts', id), { title: newTitle });
      fetchScriptHistory();
      showToast("Script renamed");
    } catch (error) {
      console.error("Error renaming script:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchScriptHistory();
    } else {
      setScriptHistory([]);
      setCurrentScriptId(null);
    }
  }, [currentUser]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  useEffect(() => {
    if (chatInputRef.current) {
      chatInputRef.current.style.height = 'auto';
      chatInputRef.current.style.height = `${chatInputRef.current.scrollHeight}px`;
    }
  }, [chatInput]);

  const [captionAnimation, setCaptionAnimation] = useState<'fade' | 'pop' | 'karaoke' | 'glow'>('pop');
  const [aiHighlights, setAiHighlights] = useState<any[]>([]);
  const [isAnalyzingCaptions, setIsAnalyzingCaptions] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
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
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const stopGenerationRef = useRef(false);

  const getAvailableApiKey = () => {
    const baseKey = userApiKey || process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
    if (!baseKey) return null;
    
    const allKeys = baseKey.split(',').map(k => k.trim()).filter(k => k.length > 0);
    const availableKeys = allKeys.filter(k => !exhaustedKeysRef.current.has(k));
    
    if (availableKeys.length === 0) {
      return null;
    }
    
    // Randomly pick an available key
    return availableKeys[Math.floor(Math.random() * availableKeys.length)];
  };

  const markKeyAsExhausted = (key: string) => {
    if (!key) return;
    exhaustedKeysRef.current.add(key);
    setExhaustedCount(exhaustedKeysRef.current.size);
    
    // Clear exhausted keys after 2 minutes (increased from 1 min for better safety)
    setTimeout(() => {
      exhaustedKeysRef.current.delete(key);
      setExhaustedCount(exhaustedKeysRef.current.size);
    }, 120000);
  };
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

  // AI Captions States
  const [captionFile, setCaptionFile] = useState<File | null>(null);
  const [isCaptioning, setIsCaptioning] = useState(false);
  const [captionResult, setCaptionResult] = useState<any>(null);
  const [captionStyle, setCaptionStyle] = useState<'viral' | 'minimal' | 'bold-hindi'>('viral');
  const [captionProgress, setCaptionProgress] = useState(0);
  const [captionStep, setCaptionStep] = useState('');

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

  const [isPolishing, setIsPolishing] = useState(false);

  const handleViralMagic = async () => {
    if (!text || text.trim().length < 10) {
      setError("Please enter a script of at least 10 characters to optimize.");
      return;
    }

    setIsPolishing(true);
    try {
      const apiKey = userApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key not configured.");

      const keys = apiKey.split(',').map(k => k.trim()).filter(k => k.length > 0);
      const activeKey = keys[Math.floor(Math.random() * keys.length)];
      const ai = new GoogleGenAI({ apiKey: activeKey });

      const prompt = `Rewrite and optimize the following script for a high-retention social media video (Shorts/Reels style). 
      Make it punchy, engaging, and viral-ready. 
      Maintain the original language (${language === 'hi' ? 'Hindi' : 'English'}).
      Keep it under 5,000 characters.
      Return ONLY the optimized script. Do not include any notes or explanations.

      SCRIPT:
      ${text}`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }]
      });

      const polishedText = result.text;
      if (polishedText) {
        setText(polishedText.trim().slice(0, 5000));
      }
    } catch (err: any) {
      console.error("Viral Magic error:", err);
      setError(`Failed to polish script: ${err.message}`);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleViralScriptWriter = async (followUpInput?: string) => {
    const input = followUpInput || chatInput;
    if (!input.trim() && chatMessages.length === 0) {
      setError("Please enter a raw script or instruction first.");
      return;
    }

    setIsWritingScript(true);
    stopGenerationRef.current = false;
    setError(null);
    
    const newUserMessage = { 
      role: 'user' as const, 
      content: input, 
      type: fileToUpload ? 'image' as const : 'text' as const,
      imageUrl: filePreview || undefined
    };
    const updatedMessages = [...chatMessages, newUserMessage];
    setChatMessages(updatedMessages);
    setChatInput('');
    setFileToUpload(null);
    setFilePreview(null);

    const maxRetries = 15;
    let attempt = 0;

    const executeGeneration = async () => {
      while (attempt < maxRetries) {
        const apiKey = getAvailableApiKey();
        if (!apiKey) {
          const waitTime = 5000;
          console.warn(`All keys exhausted. Waiting ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          attempt++;
          continue;
        }

        try {
          const ai = new GoogleGenAI({ apiKey });
          const systemInstruction = `You are a World-Class Movie Scriptwriter and Viral Content Strategist. 
          Your goal is to write scripts that use deep psychological hooks to keep the audience "locked in" from the first second.
          
          STORYTELLING RULES:
          1. OPENING: Start with a high-stakes psychological hook.
          2. RETENTION: Use "Open Loops" to keep viewers curious.
          3. PACING: Fast-paced but emotionally resonant.
          4. LANGUAGE: Use powerful, evocative words that paint a picture.
          5. FORMAT: Use professional script formatting with scene directions and emotional cues.
          
          THUMBNAIL RULES (If asked for image/thumbnail):
          - Create high-CTR, high-competition YouTube thumbnails.
          - Focus on "Storytelling through a single frame".
          - Use vibrant colors, high contrast, and clear focal points.
          
          Always aim for "Hollywood Quality" in every response.`;

          const contents = updatedMessages.map(m => {
            if (m.type === 'image' && m.imageUrl) {
              const base64Data = m.imageUrl.split(',')[1];
              return {
                role: m.role,
                parts: [
                  { inlineData: { data: base64Data, mimeType: 'image/png' } },
                  { text: m.content }
                ]
              };
            }
            return {
              role: m.role,
              parts: [{ text: m.content }]
            };
          });

          const modelParams: any = {
            model: "gemini-3-flash-preview",
            config: { systemInstruction, temperature: 0.9, topP: 0.95 },
            contents
          };

          if (isWebResearchEnabled) {
            modelParams.config.tools = [{ googleSearch: {} }];
          }

          const stream = await ai.models.generateContentStream(modelParams);
          let fullResponse = '';
          
          const aiMessageId = Date.now() + 1;
          setChatMessages(prev => [...prev, { id: aiMessageId, role: 'model', content: '', type: 'text' }]);

          for await (const chunk of stream) {
            // Check if user clicked "Stop"
            if (stopGenerationRef.current) break;
            
            const chunkText = chunk.text || '';
            fullResponse += chunkText;
            
            setChatMessages(prev => prev.map(msg => 
              msg.id === aiMessageId ? { ...msg, content: fullResponse } : msg
            ));
          }

          if (stopGenerationRef.current) return;

          setViralScript(fullResponse);

          if (currentUser) {
            const finalMessages = [...updatedMessages, { id: aiMessageId, role: 'model', content: fullResponse, type: 'text' }];
            if (currentScriptId) {
              await updateDoc(doc(db, 'scripts', currentScriptId), {
                content: fullResponse,
                messages: finalMessages,
                updatedAt: serverTimestamp()
              });
            } else {
              const docRef = await addDoc(collection(db, 'scripts'), {
                userId: currentUser.uid,
                title: input.substring(0, 30) + (input.length > 30 ? '...' : ''),
                content: fullResponse,
                messages: finalMessages,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
              setCurrentScriptId(docRef.id);
            }
          }
          return; // Success

        } catch (error: any) {
          const errStr = error.message || "";
          if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
            markKeyAsExhausted(apiKey!);
            attempt++;
            continue;
          }
          throw error;
        }
      }
      throw new Error("All API keys are busy. Please try again in 1 minute.");
    };

    try {
      await executeGeneration();
    } catch (error: any) {
      console.error("Script writer error:", error);
      setError(error.message);
    } finally {
      setIsWritingScript(false);
    }
  };

  const handleGenerateImage = async (prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "16:9") => {
    if (!prompt.trim()) return;
    
    setIsGeneratingImage(true);
    stopGenerationRef.current = false;
    setError(null);
    
    const newUserMessage = { role: 'user' as const, content: `Generate ${aspectRatio} thumbnail: ${prompt}`, type: 'text' as const };
    const updatedMessages = [...chatMessages, newUserMessage];
    setChatMessages(updatedMessages);

    const maxRetries = 15;
    let attempt = 0;

    const executeImageGen = async () => {
      while (attempt < maxRetries) {
        const apiKey = getAvailableApiKey();
        if (!apiKey) {
          const waitTime = 5000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          attempt++;
          continue;
        }

        try {
          if (stopGenerationRef.current) break;
          const ai = new GoogleGenAI({ apiKey });
          const imagePrompt = `World-class professional YouTube thumbnail, high-CTR, cinematic lighting, psychological hook visual. ${prompt}. 8k resolution, cinematic composition, vibrant colors, trending on ArtStation style, highly detailed, sharp focus.`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{ text: imagePrompt }],
            config: {
              imageConfig: {
                aspectRatio,
              }
            }
          });

          let imageUrl = '';
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              imageUrl = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }

          if (!imageUrl) throw new Error("Failed to generate image data.");

          const newModelMessage = { 
            role: 'model' as const, 
            content: `Generated ${aspectRatio} professional thumbnail for: ${prompt}`, 
            type: 'image' as const, 
            imageUrl 
          };
          
          const finalMessages = [...updatedMessages, newModelMessage];
          setChatMessages(finalMessages);

          if (currentUser) {
            // Deduct credits
            const token = await currentUser.getIdToken();
            await fetch('/api/user/deduct-credits', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ amount: 500 })
            });
            setUserProfile((prev: any) => ({ ...prev, credits: prev.credits - 500 }));

            // Save to Firestore
            if (currentScriptId) {
              await updateDoc(doc(db, 'scripts', currentScriptId), {
                messages: finalMessages,
                updatedAt: serverTimestamp()
              });
            } else {
              const docRef = await addDoc(collection(db, 'scripts'), {
                userId: currentUser.uid,
                title: `Image: ${prompt.substring(0, 20)}...`,
                content: prompt,
                messages: finalMessages,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
              setCurrentScriptId(docRef.id);
            }
          }
          return;

        } catch (error: any) {
          const errStr = error.message || "";
          if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
            markKeyAsExhausted(apiKey!);
            attempt++;
            continue;
          }
          if (errStr.includes("403") || errStr.includes("PERMISSION_DENIED")) {
            if (window.aistudio?.openSelectKey) {
              setError("Permission Denied: Your API key doesn't have access to image generation. Please select a paid API key from the AI Studio dialog.");
              await window.aistudio.openSelectKey();
              const newKey = (process.env as any).API_KEY || '';
              if (newKey) {
                setUserApiKey(newKey);
                localStorage.setItem('voxnova_api_key', newKey);
              }
            } else {
              setError("Permission Denied: Your API key doesn't have access to image generation. Please add a valid API key in Settings.");
            }
            break;
          }
          throw error;
        }
      }
      throw new Error("All API keys are busy. Please try again in 1 minute.");
    };

    try {
      await executeImageGen();
    } catch (error: any) {
      console.error("Image generation error:", error);
      setError(`Image Generation Failed: ${error.message}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleOpenScript = (script: any) => {
    setCurrentScriptId(script.id);
    setChatMessages(script.messages || [{ role: 'model', content: script.content }]);
    setViralScript(script.content);
  };

  const handleAnalyzeCaptions = async () => {
    if (!text.trim()) {
      setError("Please enter or generate a script first.");
      return;
    }

    setIsAnalyzingCaptions(true);
    setError(null);

    try {
      const baseKey = userApiKey || process.env.GEMINI_API_KEY;
      if (!baseKey) throw new Error("API Key not configured");
      const keys = baseKey.split(',').map(k => k.trim()).filter(k => k.length > 0);
      const apiKey = keys[Math.floor(Math.random() * keys.length)];
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Analyze the following script and suggest 'Visual Emphasis Points' for video captions. 
      Identify keywords or phrases that should be highlighted with specific colors, emojis, or font-size increases based on the emotional tone.
      
      Return ONLY a JSON array of objects with this structure:
      [
        { "word": "keyword", "color": "hex_color", "emoji": "🔥", "size": "large|normal" }
      ]
      
      SCRIPT:
      ${text}`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const output = result.text;
      if (output) {
        const parsed = JSON.parse(output);
        setAiHighlights(parsed);
      }
    } catch (err: any) {
      console.error("Caption Analysis error:", err);
      setError(`Failed to analyze captions: ${err.message}`);
    } finally {
      setIsAnalyzingCaptions(false);
    }
  };
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 5000) {
      setText(val);
      if (val.length === 5000) {
        setShowLimitToast(true);
        setTimeout(() => setShowLimitToast(false), 3000);
      }
    } else {
      setShowLimitToast(true);
      setTimeout(() => setShowLimitToast(false), 3000);
    }
  };

  const handlePreviewVoice = async (voice: Voice) => {
    if (previewingVoiceId) return;
    
    setPreviewingVoiceId(voice.id);
    const maxRetries = 5;
    let attempt = 0;

    const executePreview = async () => {
      while (attempt < maxRetries) {
        const apiKey = getAvailableApiKey();
        if (!apiKey) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          attempt++;
          continue;
        }

        try {
          const ai = new GoogleGenAI({ apiKey });
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
            return;
          } else {
            throw new Error("No audio data");
          }
        } catch (error: any) {
          if (error.message?.includes('429')) {
            markKeyAsExhausted(apiKey!);
            attempt++;
            continue;
          }
          throw error;
        }
      }
      setPreviewingVoiceId(null);
    };

    try {
      await executePreview();
    } catch (error) {
      console.error("Preview failed:", error);
      setPreviewingVoiceId(null);
    }
  };

  // Firestore Script History Sync
  useEffect(() => {
    if (!currentUser) {
      setScriptHistory([]);
      return;
    }

    const q = query(
      collection(db, 'scripts'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scripts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setScriptHistory(scripts);
    }, (error) => {
      console.error("Script history sync error:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

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

  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const resetSettings = () => {
    setSpeed(1.0);
    setPitch(1.0);
    setPause(0.5);
    setAudioFormat('wav');
    setTargetSampleRate(44100);
    setStudioClarity(true);
    setStyle('normal');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSendSuccess(false);

    try {
      // Use the environment variables for EmailJS
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_52isgcx';
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '__ejs-test-mail-service__';
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'IDmeLxswf1eiQFsde';

      const result = await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: contactForm.name,
          from_email: contactForm.email,
          message: contactForm.message,
          to_name: 'VoxNova Text to Speech Support',
        },
        publicKey
      );

      if (result.status === 200) {
        setSendSuccess(true);
        setContactForm({ name: '', email: '', message: '' });
        setTimeout(() => setSendSuccess(false), 5000);
      } else {
        throw new Error('Failed to send');
      }
    } catch (err) {
      console.error('EmailJS Error:', err);
      setError("Failed to send message. Please use the Google Form link in the contact section below.");
    } finally {
      setIsSending(false);
    }
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

    // Calculate credit cost (1 credit per character)
    const creditCost = text.length;
    
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
      const maxRetries = 15; // Increased retries for better failover

      while (attempt < maxRetries) {
        let apiKey = getAvailableApiKey();
        
        if (!apiKey) {
          const baseKey = userApiKey || process.env.GEMINI_API_KEY;
          const allKeys = baseKey?.split(',').map(k => k.trim()).filter(k => k.length > 0) || [];
          
          if (allKeys.length > 0 && exhaustedKeysRef.current.size >= allKeys.length) {
            // All keys exhausted, wait and retry if we have attempts left
            const waitTime = 10000; // Increased wait time
            console.warn(`All ${allKeys.length} keys exhausted. Waiting ${waitTime}ms...`);
            setError(`All API keys exhausted. Waiting ${waitTime/1000}s before retrying...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            setError(null);
            attempt++;
            continue;
          }
          throw new Error("Gemini API Key is not configured. Please enter your API key by clicking the 'Key' icon.");
        }

        try {
          console.log(`TTS Attempt ${attempt + 1} with key ${apiKey.substring(0, 8)}...`);
          const ai = new GoogleGenAI({ apiKey });
          
          const voiceMapping: Record<string, string> = {
            'Adam': 'Puck', 'Brian': 'Charon', 'Daniel': 'Fenrir', 'Josh': 'Puck',
            'Liam': 'Charon', 'Michael': 'Fenrir', 'Ryan': 'Puck', 'Matthew': 'Charon',
            'Bill': 'Fenrir', 'Callum': 'Puck', 'Frank': 'Zephyr', 'Marcus': 'Charon',
            'Jessica': 'Kore', 'Sarah': 'Zephyr', 'Matilda': 'Kore', 'Emily': 'Zephyr',
            'Bella': 'Kore', 'Rachel': 'Zephyr', 'Nicole': 'Kore', 'Clara': 'Zephyr',
            'Documentary Pro': 'Charon', 'Atlas (Do)': 'Fenrir', 'Priyanka': 'Zephyr', 'Virat': 'Charon'
          };

          const targetVoice = voiceMapping[selectedVoice.name] || 'Puck';
          
          const systemInstruction = `You are an elite, world-class professional voice actor and narrator. Your task is to provide a stunningly realistic, human-like, and emotionally resonant performance in ${language === 'hi' ? 'Hindi' : 'English'}. 
          
          PERFORMANCE GUIDELINES:
          - Use natural human prosody, complex intonation, and realistic rhythm.
          - Incorporate subtle, natural breathing and micro-pauses where appropriate to sound 100% human.
          - Avoid any robotic, monotone, or repetitive cadence.
          - For ${language === 'hi' ? 'Hindi' : 'English'}, ensure perfect native pronunciation, natural flow, and cultural nuance.
          - Sound like a real person speaking in a high-end professional studio, not a computer.
          - Pay close attention to the emotional weight of the text.
          
          TECHNICAL STANDARDS:
          - NO background noise, hums, or digital artifacts.
          - NO robotic glitches, metallic sounds, or synthetic "buzzing".
          - Ensure crystal-clear, 48kHz studio-quality audio.
          `;
          
          let promptPrefix = "";
          
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
            'Priyanka': 'Powerful, deep, and authoritative female voice - perfect for professional documentaries.',
            'Virat': 'Realistic, high-energy, deep masculine voice. Thick, resonant, and commanding. Professional documentary standard.'
          };

          promptPrefix += `${voiceTraits[selectedVoice.name] || ''} `;

          if (style === 'documentary' || style === 'doc-pro' || selectedVoice.name === 'Documentary Pro') {
            promptPrefix += `You are a world-class cinematic documentary narrator. Your voice is deep, mature, intelligent, and authoritative, similar to National Geographic or Discovery Channel. 
            
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
            5. QUALITY: Studio-grade, clean audio. NO background noise or glitches.`;
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
            currentPrompt = `CRITICAL: The previous attempt sounded slightly robotic. Please deliver a MORE HUMAN, MORE REALISTIC performance for this script in ${language === 'hi' ? 'Hindi' : 'English'}. Use natural breathing and prosody:\n\n${chunkText}`;
          }

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: currentPrompt }] }],
            config: {
              systemInstruction: systemInstruction,
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: targetVoice as any },
                },
              },
            },
          });

          const candidate = response.candidates?.[0];
          const base64 = candidate?.content?.parts?.[0]?.inlineData?.data;
          
          if (!base64) {
            if (candidate?.finishReason === 'SAFETY') {
              throw new Error("The generation was blocked by safety filters. This often happens with long scripts containing sensitive words. Please try a shorter or cleaner script.");
            }
            if (candidate?.finishReason === 'RECITATION') {
              throw new Error("The generation was blocked due to recitation filters (copyrighted content detected).");
            }
            if (candidate?.finishReason === 'OTHER' || !candidate) {
              throw new Error("AI model failed to generate audio data. The script might be too complex or contain unsupported characters.");
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
          
          if (isRateLimit) {
            markKeyAsExhausted(apiKey);
            console.warn(`API Key ${apiKey.substring(0, 8)}... exhausted. Switching keys...`);
            
            const baseKey = userApiKey || process.env.GEMINI_API_KEY;
            const allKeys = baseKey?.split(',').map(k => k.trim()).filter(k => k.length > 0) || [];
            
            if (exhaustedKeysRef.current.size < allKeys.length) {
              attempt--; // Don't count this as a failed attempt for the whole process
              continue;
            }
          }

          if ((isNetworkError || isGenerationError || isRateLimit || isInternalError) && attempt < maxRetries) {
            const baseDelay = isRateLimit ? 10000 : (isInternalError ? 5000 : 1000);
            const delay = Math.pow(2, attempt) * baseDelay + Math.random() * 2000;
            
            console.warn(`Attempt ${attempt} failed for chunk. Retrying in ${Math.round(delay)}ms...`, err);
            
            if (isRateLimit) {
              setError(`All API keys exhausted. Waiting ${Math.round(delay/1000)}s before retrying...`);
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
      
      // Increased concurrency to 2 for faster generation while staying within safe limits
      const CONCURRENCY_LIMIT = 2;
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
        // Show the actual error message to help diagnose the issue
        const displayMsg = err.message || "Something went wrong while generating your voice. Please try again later.";
        setError(displayMsg);
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
      let attempt = 0;
      const maxRetries = 10;
      let processedText = "";
      let base64Audio = "";

      while (attempt < maxRetries) {
        const baseKey = userApiKey || process.env.GEMINI_API_KEY;
        const allKeys = baseKey?.split(',').map(k => k.trim()).filter(k => k.length > 0) || [];
        
        let apiKey = getAvailableApiKey();
        if (!apiKey) {
          const baseKey = userApiKey || process.env.GEMINI_API_KEY;
          const allKeys = baseKey?.split(',').map(k => k.trim()).filter(k => k.length > 0) || [];
          if (allKeys.length > 0 && exhaustedKeysRef.current.size >= allKeys.length) {
            throw new Error("429: All API keys exhausted.");
          }
          throw new Error("API Key not configured. Please add your key in API Settings.");
        }

        try {
          const ai = new GoogleGenAI({ apiKey });
          
          if (!processedText) {
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

            processedText = result.text;
            console.log("Transcription result:", processedText);
            
            if (!processedText || processedText.trim().length === 0) {
              throw new Error("The AI could not hear any speech in the audio. Please try a clearer recording.");
            }
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
          
          const systemInstruction = `You are an elite, world-class professional voice actor and narrator. Your task is to provide a stunningly realistic, human-like, and emotionally resonant performance in ${targetLanguage === 'hi' ? 'Hindi' : 'English'}. 
              
          PERFORMANCE GUIDELINES:
          - Use natural human prosody, complex intonation, and realistic rhythm.
          - Incorporate subtle, natural breathing and micro-pauses where appropriate to sound 100% human.
          - Avoid any robotic, monotone, or repetitive cadence.
          - For ${targetLanguage === 'hi' ? 'Hindi' : 'English'}, ensure perfect native pronunciation, natural flow, and cultural nuance.
          - Sound like a real person speaking in a high-end professional studio, not a computer.
          - Pay close attention to the emotional weight of the text.
          
          TECHNICAL STANDARDS:
          - NO background noise, hums, or digital artifacts.
          - NO robotic glitches, metallic sounds, or synthetic "buzzing".
          - Ensure crystal-clear, 48kHz studio-quality audio.
          `;

          console.log(`Generating TTS with voice: ${targetVoice}`);
          const ttsResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: processedText }] }],
            config: {
              systemInstruction: systemInstruction,
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: targetVoice as any },
                },
              },
            },
          });

          base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
          if (!base64Audio) throw new Error("Voice generation failed. The text might be too complex or the service is temporarily unavailable.");
          
          break; // Success!

        } catch (err: any) {
          attempt++;
          const errStr = err.message || JSON.stringify(err);
          const isRateLimit = errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota");
          
          if (isRateLimit) {
            markKeyAsExhausted(apiKey);
            console.warn(`API Key ${apiKey.substring(0, 8)}... exhausted during dubbing. Switching...`);
            
            const baseKey = userApiKey || process.env.GEMINI_API_KEY;
            const allKeys = baseKey?.split(',').map(k => k.trim()).filter(k => k.length > 0) || [];
            if (exhaustedKeysRef.current.size < allKeys.length) {
              attempt--;
              continue;
            }
          }
          
          if (attempt >= maxRetries) throw err;
          
          const delay = Math.pow(2, attempt) * 2000 + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

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

  const handleCaptioning = async () => {
    if (!captionFile) {
      setError("Please upload a video file first.");
      return;
    }

    if (!currentUser) {
      setError("Please login to use this feature.");
      setErrorType('auth');
      return;
    }

    const captionCost = 10;
    if (userProfile && userProfile.credits < captionCost && !isWhitelisted(currentUser.email)) {
      setError(`Insufficient credits. You need ${captionCost} credits for AI Captioning.`);
      setIsPricingModalOpen(true);
      return;
    }

    setIsCaptioning(true);
    setCaptionProgress(5);
    setCaptionStep("Analyzing video audio...");

    try {
      let attempt = 0;
      const maxRetries = 10;
      let srtContent = "";

      while (attempt < maxRetries) {
        const baseKey = userApiKey || process.env.GEMINI_API_KEY;
        const allKeys = baseKey?.split(',').map(k => k.trim()).filter(k => k.length > 0) || [];
        
        let apiKey = getAvailableApiKey();
        if (!apiKey) {
          const baseKey = userApiKey || process.env.GEMINI_API_KEY;
          const allKeys = baseKey?.split(',').map(k => k.trim()).filter(k => k.length > 0) || [];
          if (allKeys.length > 0 && exhaustedKeysRef.current.size >= allKeys.length) {
            throw new Error("429: All API keys exhausted.");
          }
          throw new Error("API Key not configured.");
        }

        try {
          const ai = new GoogleGenAI({ apiKey });

          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result.split(',')[1]);
            };
            reader.readAsDataURL(captionFile);
          });
          const fileBase64 = await base64Promise;

          setCaptionProgress(30);
          setCaptionStep("Generating time-synced captions...");

          const prompt = `Analyze the attached video's audio and generate time-synced captions in SRT format. 
          Return ONLY the SRT content. Ensure the timing is accurate. 
          If the language is Hindi, provide the captions in Hindi script.
          Style requested: ${captionStyle}.`;

          const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{
              parts: [
                { inlineData: { data: fileBase64, mimeType: captionFile.type } },
                { text: prompt }
              ]
            }]
          });

          srtContent = result.text;
          if (!srtContent || srtContent.trim().length === 0) {
            throw new Error("Failed to generate captions. Please try a clearer video.");
          }
          
          break; // Success!

        } catch (err: any) {
          attempt++;
          const errStr = err.message || JSON.stringify(err);
          const isRateLimit = errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota");
          
          if (isRateLimit) {
            markKeyAsExhausted(apiKey);
            console.warn(`API Key ${apiKey.substring(0, 8)}... exhausted during captioning. Switching...`);
            
            const baseKey = userApiKey || process.env.GEMINI_API_KEY;
            const allKeys = baseKey?.split(',').map(k => k.trim()).filter(k => k.length > 0) || [];
            if (exhaustedKeysRef.current.size < allKeys.length) {
              attempt--;
              continue;
            }
          }
          
          if (attempt >= maxRetries) throw err;
          
          const delay = Math.pow(2, attempt) * 2000 + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      setCaptionResult({ srt: srtContent, videoUrl: URL.createObjectURL(captionFile) });
      setCaptionProgress(100);
      setCaptionStep("Complete!");

      // Deduct credits
      await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        },
        body: JSON.stringify({
          text: "AI Captioning Generation",
          voice: "System",
          style: captionStyle,
          speed: 1,
          pitch: 1,
          audioData: "caption_gen",
          creditCost: captionCost
        })
      });

      // Refresh profile
      const profileRes = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${await currentUser.getIdToken()}` }
      });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setUserProfile(profile);
      }

    } catch (err: any) {
      console.error("Captioning error:", err);
      setError(err.message || "Failed to generate captions.");
    } finally {
      setIsCaptioning(false);
    }
  };

  const deleteHistoryItem = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this generation?")) return;
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
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }
    } catch (err: any) {
      console.error("Failed to delete history item:", err);
      setError(`Delete failed: ${err.message}`);
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

              {/* API Configuration Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">API Configuration</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                          <Key size={18} />
                        </div>
                        <span className="text-sm font-medium">Gemini API Keys</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {userApiKey && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-100 rounded-full">
                            <div className={`w-1.5 h-1.5 rounded-full ${exhaustedCount === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-[9px] font-bold text-zinc-600 uppercase">
                              {userApiKey.split(',').filter(k => k.trim()).length - exhaustedCount} Active
                            </span>
                          </div>
                        )}
                        {exhaustedCount > 0 && (
                          <button 
                            onClick={() => {
                              exhaustedKeysRef.current.clear();
                              setExhaustedCount(0);
                            }}
                            className="p-1.5 hover:bg-zinc-100 rounded-lg text-amber-500 transition-all"
                            title="Reset Exhausted Keys"
                          >
                            <RefreshCw size={14} />
                          </button>
                        )}
                        <a 
                          href="https://aistudio.google.com/app/apikey" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-blue-500 hover:underline uppercase"
                        >
                          Get Keys
                        </a>
                      </div>
                    </div>
                    <textarea
                      value={userApiKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUserApiKey(val);
                        localStorage.setItem('voxnova_api_key', val);
                        exhaustedKeysRef.current.clear(); // Reset exhausted keys ref
                        setExhaustedCount(0); // Reset exhausted keys count
                      }}
                      placeholder="Enter multiple API keys separated by commas..."
                      className="w-full h-24 p-3 text-xs bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none font-mono"
                    />
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Pro Tip: Enter 10-20 free API keys separated by commas. Our system will automatically switch to the next key if one hits a rate limit, ensuring continuous generation.
                    </p>
                  </div>
                </div>
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
                    className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-xl border border-zinc-100 text-xs font-medium transition-all"
                  >
                    About Us
                  </button>
                  <button 
                    onClick={() => { setShowSettings(false); setShowContact(true); }}
                    className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-xl border border-zinc-100 text-xs font-medium transition-all"
                  >
                    Contact
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
                          onClick={() => deleteHistoryItem(item.id)}
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

  const handleDeleteHistory = async (id: number) => {
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
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
            <Sparkles size={20} />
            Text to Speech Voice
          </button>
          <button 
            onClick={() => { setActiveTab('dubbing'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dubbing' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
          >
            <LangIcon size={20} />
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
            onClick={() => { setActiveTab('script-writer'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'script-writer' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
          >
            <Sparkles size={20} />
            Smart Workspace
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
                    placeholder="Enter your script here... (up to 5,000 characters)"
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
                            animate={{ strokeDashoffset: 100 - (text.length / 5000) * 100 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-zinc-500">
                        {isWhitelisted(currentUser?.email || '') ? 'Unlimited' : `${(userProfile?.credits || 0).toLocaleString()} credits remaining`}
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

                <div className="flex flex-col md:flex-row gap-4">
                  <button 
                    onClick={handleViralMagic}
                    disabled={isPolishing || !text}
                    className="flex-1 py-4 px-6 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-900/10"
                  >
                    {isPolishing ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Sparkles size={20} className="text-emerald-400" />
                    )}
                    {isPolishing ? 'Polishing...' : 'Viral Magic (AI Polish)'}
                  </button>

                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !text || !selectedVoice}
                    className="flex-[2] py-4 px-6 bg-emerald-500 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/20"
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
                <h2 className="text-3xl font-display font-bold text-zinc-900">AI Dubbing</h2>
                <p className="text-zinc-500">Translate and dub your audio into different languages with professional AI voices.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 border-zinc-100">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">1. Upload File</label>
                    <div 
                      onClick={() => document.getElementById('audio-upload')?.click()}
                      className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${dubbingFile ? 'border-emerald-500/50 bg-emerald-50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}`}
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
                          <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600">
                            <Music size={32} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-emerald-600">{dubbingFile.name}</p>
                            <p className="text-xs text-zinc-500">{(dubbingFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = URL.createObjectURL(dubbingFile);
                              const audio = new Audio(url);
                              audio.play();
                            }}
                            className="mt-2 px-4 py-1 bg-zinc-100 rounded-full text-[10px] hover:bg-zinc-200 transition-all flex items-center gap-2 text-zinc-600"
                          >
                            <Play size={10} /> Preview Upload
                          </button>
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

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">2. Target Language</label>
                    <select 
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-sm focus:outline-none focus:border-emerald-500 transition-all text-zinc-900"
                    >
                      <option value="hi" className="bg-white">Hindi</option>
                      <option value="bn" className="bg-white">Bengali</option>
                      <option value="mr" className="bg-white">Marathi</option>
                      <option value="te" className="bg-white">Telugu</option>
                      <option value="ta" className="bg-white">Tamil</option>
                      <option value="gu" className="bg-white">Gujarati</option>
                      <option value="kn" className="bg-white">Kannada</option>
                      <option value="en" className="bg-white">English</option>
                      <option value="es" className="bg-white">Spanish</option>
                      <option value="fr" className="bg-white">French</option>
                    </select>
                  </div>
                </div>

                <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 border-zinc-100">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">3. Select Voice</label>
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
                        setError("Please upload an audio or video file first to start dubbing.");
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
                          a.download = `dubbed-${Date.now()}.wav`;
                          a.click();
                        }}
                        className="p-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all text-zinc-600"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-zinc-100 rounded-2xl">
                    <p className="text-sm text-zinc-600 italic mb-4">"{dubbingResult.text}"</p>
                    <audio src={dubbingResult.audioUrl} controls className="w-full h-10 accent-emerald-500" />
                  </div>
                </motion.div>
              )}

              <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2 text-zinc-900">
                  <Sparkles size={16} className="text-emerald-500" /> How it works
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Our AI will analyze your uploaded audio, transcribe the content, and then re-generate it using your selected target voice. For dubbing, it will also translate the content into your chosen language while maintaining the original meaning.
                </p>
              </div>
            </motion.div>
          ) : activeTab === 'script-writer' ? (
            <motion.div 
              key="script-writer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col md:flex-row gap-0 -mx-4 -mb-8 bg-white relative min-h-screen"
            >
              {/* History Sidebar - Gemini Style */}
              <AnimatePresence>
                {isHistorySidebarOpen && (
                  <>
                    {/* Mobile Overlay Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsHistorySidebarOpen(false)}
                      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
                    />
                    <motion.div
                      initial={{ x: -300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -300, opacity: 0 }}
                      className="absolute md:relative left-0 top-0 bottom-0 w-[280px] md:w-[300px] bg-zinc-50 border-r border-zinc-100 flex flex-col overflow-hidden h-full z-40 shadow-2xl md:shadow-none"
                    >
                      <div className="p-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between md:hidden mb-2">
                          <span className="text-sm font-bold text-zinc-900">History</span>
                          <button onClick={() => setIsHistorySidebarOpen(false)} className="p-2 hover:bg-zinc-200 rounded-full">
                            <X size={20} />
                          </button>
                        </div>
                        <button 
                          onClick={() => {
                            setCurrentScriptId(null);
                            setChatMessages([]);
                            setViralScript('');
                            if (window.innerWidth < 768) setIsHistorySidebarOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-3 bg-zinc-200/50 hover:bg-zinc-200 rounded-full text-zinc-600 transition-all text-sm font-medium"
                        >
                          <Plus size={18} />
                          New Chat
                        </button>
                      </div>

                    <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
                      <div className="px-4 py-2 flex items-center gap-2">
                        <History size={14} className="text-zinc-400" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">History</span>
                      </div>
                      {scriptHistory.length === 0 ? (
                        <div className="px-4 py-8 text-center space-y-2">
                          <div className="text-zinc-300 flex justify-center"><PenTool size={24} /></div>
                          <p className="text-[10px] text-zinc-400">No scripts yet</p>
                        </div>
                      ) : (
                        scriptHistory.map((script) => (
                          <div 
                            key={script.id}
                            className={`group flex items-center gap-3 px-4 py-2.5 rounded-full cursor-pointer transition-all relative ${currentScriptId === script.id ? 'bg-emerald-500/10 text-emerald-700' : 'hover:bg-zinc-200/50 text-zinc-600'}`}
                            onClick={() => {
                              handleOpenScript(script);
                              if (window.innerWidth < 768) setIsHistorySidebarOpen(false);
                            }}
                          >
                            <div className="text-xs font-medium truncate flex-1">{script.title}</div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newTitle = prompt("Rename script:", script.title);
                                  if (newTitle) handleRenameScript(script.id, newTitle);
                                }}
                                className="p-1 hover:bg-zinc-200 rounded text-zinc-400"
                              >
                                <Edit2 size={10} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm("Delete this script?")) handleDeleteScript(script.id);
                                }}
                                className="p-1 hover:bg-red-50 text-red-400 rounded"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-4 border-t border-zinc-100 space-y-1">
                      <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-200/50 rounded-full text-zinc-600 transition-all text-xs">
                        <HelpCircle size={14} /> Help
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-200/50 rounded-full text-zinc-600 transition-all text-xs">
                        <Settings2 size={14} /> Settings
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

              {/* Main Chat Workspace */}
              <div className="flex-1 flex flex-col min-w-0 bg-white relative">
                {/* Header - Exact Gemini Style */}
                <div className="h-16 border-b border-zinc-100 flex items-center justify-between px-4 bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsHistorySidebarOpen(!isHistorySidebarOpen)}
                      className="p-2 hover:bg-zinc-100 rounded-full text-zinc-600 transition-all"
                    >
                      <Menu size={24} />
                    </button>
                    <div className="flex flex-col">
                      <h1 className="text-base md:text-lg font-bold text-zinc-900 leading-none">
                        Smart <span className="text-emerald-500">Workspace</span>
                      </h1>
                      <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest mt-1">
                        AI Powered Content Studio
                      </p>
                    </div>
                  </div>

                    <div className="flex items-center gap-1">
                      {chatMessages.length > 0 && (
                        <>
                          <button 
                            onClick={() => {
                              const newTitle = prompt("Rename this workspace:", currentScriptId ? scriptHistory.find(s => s.id === currentScriptId)?.title : 'Smart Workspace');
                              if (newTitle && currentScriptId) handleRenameScript(currentScriptId, newTitle);
                            }}
                            className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 transition-all active:scale-90"
                            title="Rename"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button 
                            onClick={() => {
                              setChatMessages([]);
                              setViralScript('');
                              setCurrentScriptId(null);
                              setChatInput('');
                              showToast("Workspace cleared!");
                            }}
                            className="p-2 hover:bg-red-50 rounded-full text-red-500 transition-all active:scale-90"
                            title="Clear Workspace"
                          >
                            <Trash2 size={20} />
                          </button>
                          <button 
                            onClick={() => {
                              const shareUrl = window.location.href;
                              navigator.clipboard.writeText(shareUrl);
                              showToast("Link copied to clipboard!");
                            }}
                            className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 transition-all active:scale-90"
                            title="Share"
                          >
                            <Share2 size={20} />
                          </button>
                        </>
                      )}
                      <div className="relative">
                        <button 
                          onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                          className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 transition-all active:scale-90"
                        >
                          <MoreVertical size={20} />
                        </button>
                        <AnimatePresence>
                          {isMoreMenuOpen && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute right-0 mt-2 w-48 bg-white border border-zinc-100 rounded-2xl shadow-2xl py-2 z-50"
                            >
                              <button 
                                onClick={() => {
                                  const text = chatMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
                                  const blob = new Blob([text], { type: 'text/plain' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `script-export-${Date.now()}.txt`;
                                  a.click();
                                  setIsMoreMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 flex items-center gap-2"
                              >
                                <Download size={16} /> Export as Text
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                </div>

                {/* Mode Switcher - Directly below header */}
                <div className="bg-white border-b border-zinc-100 py-4 flex justify-center sticky top-16 z-10">
                  <div className="flex flex-wrap items-center justify-center gap-3 p-2 bg-zinc-50 border border-zinc-100 rounded-[2rem] shadow-sm">
                    <button 
                      onClick={() => setScriptTone('viral')}
                      className={`px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${scriptTone === 'viral' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'}`}
                    >
                      Viral
                    </button>
                    <button 
                      onClick={() => setScriptTone('storytelling')}
                      className={`px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${scriptTone === 'storytelling' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'}`}
                    >
                      Storytelling
                    </button>
                    <button 
                      onClick={() => setScriptTone('educational')}
                      className={`px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${scriptTone === 'educational' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'}`}
                    >
                      Education
                    </button>
                    <div className="w-px h-6 bg-zinc-200 mx-2" />
                    <button 
                      onClick={() => setIsWebResearchEnabled(!isWebResearchEnabled)}
                      className={`px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${isWebResearchEnabled ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'}`}
                    >
                      <Globe size={14} /> Web Search
                    </button>
                  </div>
                </div>

                {/* Chat Messages Area - Single Scrollable Page */}
                <div className="flex-1 overflow-y-auto px-4 py-8 md:px-20 bg-zinc-50/30 scroll-smooth">
                  <div className="max-w-4xl mx-auto space-y-12 pb-20">

                        {chatMessages.length === 0 ? (
                          <>
                            {/* Large Blank Box for Guidance */}
                            <div className="w-full p-12 bg-white border-2 border-dashed border-zinc-200 rounded-[3rem] flex flex-col items-center justify-center text-center min-h-[200px]">
                              {/* Blank box as requested */}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                            {[
                              { icon: <TrendingUp size={18} />, text: "Create Script", prompt: "Write a high-engagement script for a video about..." },
                              { icon: <ImageIcon size={18} />, text: "Create Thumbnail", prompt: "Generate a high-CTR thumbnail image for a video about..." },
                              { icon: <PenTool size={18} />, text: "Writing Help", prompt: "Help me write a compelling story about..." },
                              { icon: <Zap size={18} />, text: "Deep Research", prompt: "Perform deep research on the topic of..." }
                            ].map((item, i) => (
                              <button 
                                key={i}
                                onClick={() => {
                                  setChatInput(item.prompt);
                                  chatInputRef.current?.focus();
                                }}
                                className="p-6 bg-white border border-zinc-100 rounded-[2rem] text-sm font-medium text-zinc-700 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5 transition-all text-left flex items-start gap-4 group"
                              >
                                <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-colors">
                                  {item.icon}
                                </div>
                                <span className="pt-1">{item.text}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="space-y-10">
                          {chatMessages.map((msg, i) => (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              key={i} 
                              className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                          <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold shadow-sm ${msg.role === 'user' ? 'bg-zinc-900 text-white' : 'bg-emerald-500 text-white'}`}>
                            {msg.role === 'user' ? (userProfile?.displayName?.[0] || 'U') : <Sparkles size={20} />}
                          </div>
                          <div className={`flex-1 space-y-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block w-full group relative ${msg.role === 'user' ? 'bg-white p-6 rounded-[2rem] rounded-tr-none shadow-sm border border-zinc-100' : 'bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-zinc-100'}`}>
                              {msg.role === 'user' && (
                                <button 
                                  onClick={() => {
                                    setChatInput(msg.content);
                                    chatInputRef.current?.focus();
                                  }}
                                  className="absolute -left-10 top-2 p-2 opacity-0 group-hover:opacity-100 hover:bg-zinc-100 rounded-full text-zinc-400 transition-all"
                                  title="Edit message"
                                >
                                  <Edit2 size={14} />
                                </button>
                              )}
                              {msg.type === 'image' ? (
                                <div className="space-y-4">
                                  <img 
                                    src={msg.imageUrl} 
                                    alt="Generated AI" 
                                    className="rounded-2xl w-full aspect-video object-cover shadow-xl border border-zinc-100"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="flex justify-between items-center">
                                    <p className="text-xs text-zinc-500 font-medium italic">{msg.content}</p>
                                    <button 
                                      onClick={() => {
                                        const a = document.createElement('a');
                                        a.href = msg.imageUrl!;
                                        a.download = `viral-image-${Date.now()}.png`;
                                        a.click();
                                      }}
                                      className="p-2 hover:bg-zinc-100 rounded-xl text-emerald-500 transition-all"
                                    >
                                      <Download size={16} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="prose prose-lg prose-zinc max-w-none leading-relaxed text-zinc-800">
                                  <Markdown>{msg.content + (isWritingScript && msg.role === 'model' && i === chatMessages.length - 1 ? ' ●' : '')}</Markdown>
                                  {msg.role === 'model' && (
                                    <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-4">
                                      <button 
                                        onClick={() => {
                                          navigator.clipboard.writeText(msg.content);
                                          showToast("Copied to clipboard!");
                                        }}
                                        className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 transition-all"
                                        title="Copy text"
                                      >
                                        <Copy size={16} />
                                      </button>
                                      <button 
                                        onClick={() => {
                                          setText(msg.content);
                                          setActiveTab('generate');
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                                      >
                                        <Volume2 size={14} /> Use for Voice
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {(isWritingScript || isGeneratingImage) && (
                        <div className="flex gap-6">
                          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <Sparkles size={20} className="animate-pulse" />
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4">
                              <Loader2 className="animate-spin text-emerald-500" size={20} />
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-zinc-900">{isGeneratingImage ? 'Generating High-CTR Thumbnail...' : 'Smart Workspace is thinking...'}</p>
                                <p className="text-xs text-zinc-400">{isGeneratingImage ? 'Applying cinematic lighting and psychological hooks...' : 'Writing movie-level script with psychological hooks...'}</p>
                              </div>
                            </div>
                            <button 
                              onClick={stopGeneration}
                              className="px-4 py-2 bg-white border border-zinc-200 rounded-full text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all flex items-center gap-2"
                            >
                              <Square size={12} fill="currentColor" /> Stop
                            </button>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  )}

                  {/* Gemini Style Inline Input Bar */}
                    <div className="pt-10">
                      <motion.div 
                        layout
                        initial={false}
                        animate={{ 
                          y: isInputFocused ? -12 : 0,
                          scale: isInputFocused ? 1.01 : 1,
                          boxShadow: isInputFocused ? '0 20px 40px -10px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="relative group"
                      >
                        <div className={`absolute inset-0 bg-zinc-900/5 blur-3xl rounded-[2.5rem] transition-all duration-500 ${isInputFocused ? 'opacity-100 bg-emerald-500/10' : 'opacity-0'}`} />
                        {/* File Preview */}
                        <AnimatePresence>
                          {filePreview && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="mb-4 relative inline-block"
                            >
                              <img 
                                src={filePreview} 
                                alt="Upload preview" 
                                className="h-32 w-auto rounded-2xl border-2 border-emerald-500/20 shadow-lg object-cover"
                              />
                              <button 
                                onClick={removeFile}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className={`
                          relative bg-white border rounded-[2.5rem] p-4 md:p-6 flex items-end gap-3 md:gap-4 transition-all w-full
                          ${isInputFocused ? 'border-emerald-500/40 shadow-2xl ring-8 ring-emerald-500/5' : 'border-zinc-200 shadow-lg hover:border-zinc-300'}
                        `}>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <input 
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileSelect}
                              accept="image/*"
                              className="hidden"
                            />
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              className={`p-3 md:p-4 hover:bg-zinc-100 rounded-full transition-all active:scale-95 ${fileToUpload ? 'text-emerald-500 bg-emerald-50' : 'text-zinc-400'}`}
                              title="Upload Image"
                            >
                              <Plus size={24} />
                            </button>
                            <div className="relative">
                              <button 
                                onClick={() => setIsFeatureMenuOpen(!isFeatureMenuOpen)}
                                className="p-3 md:p-4 hover:bg-zinc-100 rounded-full text-zinc-400 transition-all active:scale-95"
                                title="Features"
                              >
                                <div className="flex flex-col gap-1">
                                  <div className="w-6 h-0.5 bg-current rounded-full" />
                                  <div className="w-6 h-0.5 bg-current rounded-full" />
                                </div>
                              </button>
                              <AnimatePresence>
                                {isFeatureMenuOpen && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: -20, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="absolute bottom-full left-0 mb-4 w-64 bg-white border border-zinc-100 rounded-3xl shadow-2xl py-4 z-50"
                                  >
                                    <div className="px-4 pb-2 mb-2 border-b border-zinc-50">
                                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">AI Features</p>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        setChatInput("Perform deep research on a trending topic and provide insights.");
                                        chatInputRef.current?.focus();
                                        setIsFeatureMenuOpen(false);
                                      }}
                                      className="w-full text-left px-6 py-3 text-sm text-zinc-600 hover:bg-zinc-50 flex items-center gap-3"
                                    >
                                      <Globe size={16} className="text-blue-500" /> Deep Research
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setChatInput("Help me write a compelling story for my next video.");
                                        chatInputRef.current?.focus();
                                        setIsFeatureMenuOpen(false);
                                      }}
                                      className="w-full text-left px-6 py-3 text-sm text-zinc-600 hover:bg-zinc-50 flex items-center gap-3"
                                    >
                                      <PenTool size={16} className="text-emerald-500" /> Writing Help
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setChatInput("Generate a high-CTR thumbnail image for a video about...");
                                        chatInputRef.current?.focus();
                                        setIsFeatureMenuOpen(false);
                                      }}
                                      className="w-full text-left px-6 py-3 text-sm text-zinc-600 hover:bg-zinc-50 flex items-center gap-3"
                                    >
                                      <ImageIcon size={16} className="text-purple-500" /> Thumbnail Maker
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <button 
                              onClick={() => handleGenerateImage(chatInput || "A viral YouTube thumbnail")}
                              className="p-3 md:p-4 hover:bg-emerald-50 rounded-full text-emerald-500 transition-all active:scale-95"
                              title="Generate Thumbnail"
                            >
                              <Sparkles size={24} />
                            </button>
                          </div>

                          <textarea
                            ref={chatInputRef}
                            value={chatInput}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(false)}
                            onChange={(e) => {
                              setChatInput(e.target.value);
                              // Auto-resize
                              e.target.style.height = 'auto';
                              e.target.style.height = `${Math.max(e.target.scrollHeight, 180)}px`;
                            }}
                            onKeyDown={(e) => {
                              // Enter key only adds a new line, sending is handled by the button
                              if (e.key === 'Enter' && !e.shiftKey) {
                                // Default behavior for textarea is adding a new line
                                // We explicitly do NOT call handleViralScriptWriter here
                              }
                            }}
                            placeholder="Describe your question..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-xl md:text-2xl py-6 md:py-8 px-4 md:px-6 min-h-[180px] md:min-h-[220px] max-h-[600px] resize-none leading-relaxed min-w-0"
                            rows={1}
                          />

                          <div className="flex items-center gap-4 pb-2 pr-2 flex-shrink-0">
                            <button 
                              onClick={() => setIsProMode(!isProMode)}
                              className={`hidden md:block px-8 py-3 border rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm ${isProMode ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-100'}`}
                            >
                              {isProMode ? 'Pro' : 'Fast'}
                            </button>
                            {isWritingScript || isGeneratingImage ? (
                              <button 
                                onClick={stopGeneration}
                                className="p-5 md:p-6 rounded-full bg-red-500 text-white shadow-lg shadow-red-500/20 transition-all flex-shrink-0 active:scale-90"
                              >
                                <Square size={28} fill="currentColor" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleViralScriptWriter()}
                                disabled={(!chatInput.trim() && !fileToUpload) || isWritingScript || isGeneratingImage}
                                className={`p-5 md:p-6 rounded-full transition-all ${(chatInput.trim() || fileToUpload) && !isWritingScript && !isGeneratingImage ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                              >
                                <ArrowUp size={28} />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'captions' ? (
            <motion.div 
              key="captions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-zinc-900">AI Video Captions</h2>
                <p className="text-zinc-500">Generate stylish, time-synced captions for your videos automatically.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 border-zinc-100">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">1. Upload Video</label>
                    <div 
                      onClick={() => document.getElementById('video-upload-captions')?.click()}
                      className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${captionFile ? 'border-emerald-500/50 bg-emerald-50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}`}
                    >
                      <input 
                        type="file" id="video-upload-captions" hidden accept="video/*" 
                        onChange={(e) => {
                          setCaptionFile(e.target.files?.[0] || null);
                          setCaptionResult(null);
                        }}
                      />
                      {captionFile ? (
                        <>
                          <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600">
                            <Video size={32} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-emerald-600">{captionFile.name}</p>
                            <p className="text-xs text-zinc-500">{(captionFile.size / (1024 * 1024)).toFixed(2)} MB</p>
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

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">2. Select Animation Style</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'fade', name: 'Fade In', color: 'from-blue-400 to-blue-600', preview: 'Smooth & Professional' },
                        { id: 'pop', name: 'Pop Up', color: 'from-purple-400 to-purple-600', preview: 'High Energy & Viral' },
                        { id: 'karaoke', name: 'Karaoke', color: 'from-emerald-400 to-emerald-600', preview: 'Word-by-Word Sync' },
                        { id: 'glow', name: 'Glow', color: 'from-orange-400 to-orange-600', preview: 'Cinematic Highlights' }
                      ].map((anim) => (
                        <button
                          key={anim.id}
                          onClick={() => setCaptionAnimation(anim.id as any)}
                          className={`relative overflow-hidden p-6 rounded-3xl border-2 transition-all text-left ${captionAnimation === anim.id ? 'border-emerald-500 bg-emerald-50/50' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
                        >
                          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${anim.color} opacity-5 blur-2xl`} />
                          <div className="relative space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-bold ${captionAnimation === anim.id ? 'text-emerald-700' : 'text-zinc-900'}`}>{anim.name}</span>
                              {captionAnimation === anim.id && <Check size={16} className="text-emerald-500" />}
                            </div>
                            <div className="p-3 bg-zinc-900 rounded-xl overflow-hidden relative h-12 flex items-center justify-center">
                              <motion.span 
                                animate={captionAnimation === anim.id ? 
                                  (anim.id === 'pop' ? { scale: [1, 1.2, 1] } : 
                                   anim.id === 'fade' ? { opacity: [0, 1] } :
                                   anim.id === 'glow' ? { textShadow: ["0 0 0px #fff", "0 0 10px #fff", "0 0 0px #fff"] } :
                                   { x: [-20, 20] }) : {}}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className={`text-[10px] font-bold text-white text-center ${anim.id === 'karaoke' ? 'bg-gradient-to-r from-emerald-400 to-white bg-clip-text text-transparent' : ''}`}
                              >
                                {anim.preview}
                              </motion.span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">3. AI Visual Emphasis</label>
                      <button 
                        onClick={handleAnalyzeCaptions}
                        disabled={isAnalyzingCaptions || !text}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 disabled:opacity-50"
                      >
                        {isAnalyzingCaptions ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                        AI Suggest Highlights
                      </button>
                    </div>
                    
                    {aiHighlights.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        {aiHighlights.map((h, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 rounded-lg bg-white border border-zinc-200 text-[10px] font-bold flex items-center gap-1 shadow-sm"
                            style={{ color: h.color }}
                          >
                            {h.word} {h.emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handleCaptioning}
                    disabled={isCaptioning || !captionFile}
                    className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCaptioning ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        {captionStep} ({captionProgress}%)
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Generate Captions
                      </>
                    )}
                  </button>
                </div>

                <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 border-zinc-100">
                  <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest">Preview & Export</label>
                  
                  {captionResult ? (
                    <div className="space-y-6">
                      <div className="aspect-video bg-zinc-900 rounded-3xl overflow-hidden relative group">
                        <video src={captionResult.videoUrl} controls className="w-full h-full object-contain" />
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-zinc-900">SRT Content</h4>
                          <button 
                            onClick={() => {
                              const blob = new Blob([captionResult.srt], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `captions-${Date.now()}.srt`;
                              a.click();
                            }}
                            className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                          >
                            <Download size={14} />
                            Download SRT
                          </button>
                        </div>
                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 h-48 overflow-y-auto">
                          <pre className="text-[10px] font-mono text-zinc-500 whitespace-pre-wrap">
                            {captionResult.srt}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
                      <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300">
                        <Video size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-zinc-400">No Video Processed</p>
                        <p className="text-xs text-zinc-400">Upload a video and click generate to see captions here.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2 text-zinc-900">
                  <Sparkles size={16} className="text-emerald-500" /> Pro Tip
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  For the best results with "Bold Hindi" style, ensure your video has clear audio. Our AI will automatically detect the language and generate time-synced SRT files that you can use in any video editor.
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
                          <span className="px-2 py-0.5 bg-zinc-100 rounded text-[10px] font-bold uppercase tracking-wider text-zinc-600">{item.voice_name}</span>
                          <span className="px-2 py-0.5 bg-zinc-50 rounded text-[10px] text-zinc-400 uppercase tracking-wider">{item.style}</span>
                          <span className="text-[10px] text-zinc-500">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-zinc-600 line-clamp-2 italic">"{item.text}"</p>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => playFromHistory(item.audio_data, item.id)}
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
                          onClick={() => downloadAudio(item.audio_data, `voice-${item.id}`)}
                          className="p-3 hover:bg-zinc-100 rounded-xl transition-all text-zinc-400 hover:text-zinc-600"
                        >
                          <Download size={20} />
                        </button>
                        <button 
                          onClick={() => handleDeleteHistory(item.id)}
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

        {/* Contact Section - Above Why Choose VoxNova Text to Speech */}
        <section className="max-w-4xl mx-auto py-16 px-6">
          <div className="glass-panel p-10 rounded-[3rem] border-zinc-100 bg-zinc-50/50 space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-display font-bold text-zinc-900">Get in Touch</h2>
              <p className="text-zinc-500">Have questions or need support? We're here to help you create amazing content.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-emerald-600">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Email Support</p>
                    <p className="text-xs text-zinc-500">Response within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-blue-600">
                    <Globe size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Community</p>
                    <p className="text-xs text-zinc-500">Join our creator network</p>
                  </div>
                </div>
                <div className="pt-6">
                  <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSeTJ4HGSwYNxAYwHwa_OTayYQfY3marHFgLHwHPe_M1yT5bEQ/viewform?embedded=true"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={18} />
                    Open Google Form
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-white h-[300px]">
                  <iframe 
                    src="https://docs.google.com/forms/d/e/1FAIpQLSeTJ4HGSwYNxAYwHwa_OTayYQfY3marHFgLHwHPe_M1yT5bEQ/viewform?embedded=true" 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    marginHeight={0} 
                    marginWidth={0}
                  >
                    Loading…
                  </iframe>
                </div>
                <p className="text-[10px] text-zinc-400 text-center uppercase tracking-widest">Official Support Form</p>
              </div>
            </div>
          </div>
        </section>

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

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-500 uppercase tracking-widest">Name</label>
                      <input 
                        required
                        type="text" 
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500 transition-all text-zinc-900"
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
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500 transition-all text-zinc-900"
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
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500 transition-all resize-none text-zinc-900"
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
                    <p className="text-center text-emerald-600 text-sm font-bold animate-bounce">Message sent successfully!</p>
                  )}
                </form>

                <div className="pt-8 border-t border-zinc-100 space-y-4">
                  <p className="text-sm text-zinc-500 text-center">Alternatively, you can reach us via:</p>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <a href="https://docs.google.com/forms/d/e/1FAIpQLSeTJ4HGSwYNxAYwHwa_OTayYQfY3marHFgLHwHPe_M1yT5bEQ/viewform?embedded=true" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-full hover:bg-zinc-100 transition-all text-sm text-zinc-600">
                      <ExternalLink size={16} /> Google Form
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
                {VOICES.filter(v => v.name.toLowerCase().includes(voiceSearchTerm.toLowerCase())).map((voice) => (
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
