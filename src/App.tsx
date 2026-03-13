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
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Modality } from "@google/genai";
import { VOICES, Voice, Generation } from './types';
import { AdSlot } from './components/AdSlot';
import { auth, googleProvider } from './firebase';
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
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [showShareToast, setShowShareToast] = useState(false);
  const [userApiKey, setUserApiKey] = useState<string>(() => localStorage.getItem('voxnova_api_key') || '');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

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
      await signInWithPopup(auth, googleProvider);
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

  const saveApiKey = (key: string) => {
    localStorage.setItem('voxnova_api_key', key);
    setUserApiKey(key);
    setIsKeyModalOpen(false);
    setError(null);
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

  const openKeyDialog = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
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

  const handleGenerate = async () => {
    if (!currentUser) {
      setError("Please login to generate voiceovers.");
      return;
    }
    if (!text.trim()) return;

    // Calculate credit cost (1 credit per 10 characters)
    const creditCost = Math.ceil(text.length / 10);
    
    // Check for premium voice restriction
    if (selectedVoice.isPremium && (!userProfile || userProfile.plan === 'free')) {
      setError(`The voice "${selectedVoice.name}" is a Premium feature. Please upgrade your plan to access high-quality cinematic voices.`);
      setIsPricingModalOpen(true);
      return;
    }

    if (userProfile && userProfile.credits < creditCost) {
      setError(`Insufficient credits. You need ${creditCost} credits but only have ${userProfile.credits}.`);
      setIsPricingModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    const maxRetries = 3;
    let attempt = 0;

    const generateWithRetry = async (chunkText: string): Promise<string> => {
      let attempt = 0;
      const maxRetries = 8; // Increased retries for rate limits

      while (attempt < maxRetries) {
        try {
          const apiKey = userApiKey || process.env.GEMINI_API_KEY;
          if (!apiKey) {
            throw new Error("Gemini API Key is not configured. Please enter your API key by clicking the 'Key' icon.");
          }

          const ai = new GoogleGenAI({ apiKey });
          
          const voiceMapping: Record<string, string> = {
            'Adam': 'Puck', 'Brian': 'Charon', 'Daniel': 'Fenrir', 'Josh': 'Puck',
            'Liam': 'Charon', 'Michael': 'Fenrir', 'Ryan': 'Puck', 'Matthew': 'Charon',
            'Bill': 'Fenrir', 'Callum': 'Puck', 'Frank': 'Charon', 'Marcus': 'Fenrir',
            'Jessica': 'Kore', 'Sarah': 'Zephyr', 'Matilda': 'Kore', 'Emily': 'Zephyr',
            'Bella': 'Kore', 'Rachel': 'Zephyr', 'Nicole': 'Kore', 'Clara': 'Zephyr',
            'Documentary Pro': 'Charon'
          };

          const targetVoice = voiceMapping[selectedVoice.name] || 'Puck';
          
          let promptPrefix = `You are a world-class professional voice actor. Your task is to provide a highly realistic, human-like, and emotionally resonant performance in ${language === 'hi' ? 'Hindi' : 'English'}. 
          
          PERFORMANCE GUIDELINES:
          - Use natural human prosody, intonation, and rhythm.
          - Incorporate subtle, natural breathing where appropriate.
          - Avoid a robotic, monotone, or repetitive cadence.
          - For ${language === 'hi' ? 'Hindi' : 'English'}, ensure perfect native pronunciation and natural flow.
          - Sound like a real person speaking in a professional studio, not a computer.
          
          TECHNICAL STANDARDS:
          - NO background noise, hums, or digital artifacts.
          - NO robotic glitches or metallic sounds.
          - Ensure crystal-clear, studio-quality audio.
          `;
          
          if (studioClarity) {
            promptPrefix += "CRITICAL: Apply professional noise reduction and denoising. Ensure zero background hum, zero robotic artifacts, and zero background music. The audio must be crystal clear and studio-quality. ";
          }
          
          const voiceTraits: Record<string, string> = {
            'Adam': 'Deep, resonant, and authoritative. A voice of power and experience.',
            'Brian': 'Calm, steady, and trustworthy. Perfect for corporate or educational content.',
            'Daniel': 'Clear, news-like, and highly articulate. A professional broadcast voice.',
            'Josh': 'Young, energetic, and friendly. A modern, youthful conversational tone.',
            'Liam': 'Warm, empathetic, and gentle. A voice that feels like a close friend.',
            'Michael': 'Mature, wise, and sophisticated. A voice of gravitas and intelligence.',
            'Ryan': 'Casual, upbeat, and conversational. Natural and relatable.',
            'Matthew': 'Deep, cinematic, and dramatic. A voice built for movie trailers.',
            'Bill': 'Gravelly, experienced, and rugged. A voice with character and grit.',
            'Callum': 'Refined, polite, and sophisticated with a clear professional tone.',
            'Frank': 'Classic narrator style. Trustworthy, balanced, and clear.',
            'Marcus': 'Strong, motivational, and powerful. Inspiring and commanding.',
            'Jessica': 'Clear, bright, and professional. A modern corporate voice.',
            'Sarah': 'Soft, soothing, and gentle. Perfect for meditation or calm stories.',
            'Matilda': 'Intelligent, articulate, and formal. A voice of precision.',
            'Emily': 'Youthful, cheerful, and friendly. High energy and approachable.',
            'Bella': 'Expressive, emotional, and dramatic. Full of feeling.',
            'Rachel': 'Confident, modern, and sleek. A voice for the digital age.',
            'Nicole': 'Warm, maternal, and comforting. A voice of care.',
            'Clara': 'Elegant, sophisticated, and smooth. A voice of luxury.',
            'Documentary Pro': 'The ultimate documentary narrator. Deep, mature, and cinematic.'
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

      // 4. Save to History (Backend) - Store the first chunk or a combined version if not too large
      // For history, we'll store the combined base64 if it's under a reasonable limit
      let finalBase64 = "";
      if (totalPcmLength < 5 * 1024 * 1024) { // 5MB limit for history storage
        // Avoid spread operator to prevent "Maximum call stack size exceeded"
        let binary = '';
        const bytes = new Uint8Array(mergedPcm.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        finalBase64 = window.btoa(binary);
      } else {
        // If too large, just store the first chunk's base64 as a placeholder or a message
        finalBase64 = "LONG_AUDIO_DATA_TOO_LARGE_FOR_HISTORY";
      }

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
        setError("Invalid API Key (गलत API Key): Please select a valid key using the 'Update API Key' button. (कृपया 'Update API Key' बटन का उपयोग करके एक सही की चुनें।)");
        setHasApiKey(false);
      } else if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota")) {
        setError("Quota Exceeded (कोटा खत्म हो गया है): Gemini API limit reached. I am retrying with longer delays. To fix this immediately, please use a paid API key by clicking the 'Key' icon at the top right. (Gemini API की लिमिट खत्म हो गई है। मैं फिर से कोशिश कर रहा हूँ, लेकिन इसे तुरंत ठीक करने के लिए कृपया अपना खुद का API Key इस्तेमाल करें।)");
      } else if (errStr.includes("500") || errStr.includes("INTERNAL")) {
        setError("AI Server Error (सर्वर त्रुटि): The AI model encountered a temporary error. Retrying... (AI मॉडल में तकनीकी खराबी आई है, हम फिर se कोशिश कर रहे हैं।)");
      } else if (errStr.includes("Rpc failed") || errStr.includes("xhr error")) {
        setError("Network Error (नेटवर्क समस्या): Please check your internet connection. (कृपया अपना इंटरनेट कनेक्शन चेक करें और फिर से कोशिश करें।)");
      } else {
        setError(err.message || "An unexpected error occurred (एक अनपेक्षित त्रुटि हुई है।)");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const playFromHistory = (audioData: string) => {
    try {
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
      audio.play().catch(e => {
        console.error("History playback failed:", e);
        setError("Playback failed. Your browser might be blocking auto-play or the audio format is unsupported.");
      });
      
      // Cleanup URL after some time
      setTimeout(() => URL.revokeObjectURL(audioUrl), 60000);
    } catch (err: any) {
      console.error("Error playing from history:", err);
      setError("Failed to process audio for playback.");
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0a0a0a] text-zinc-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <Mic className="text-black w-6 h-6" />
          </div>
          <h1 className="text-xl font-display font-bold tracking-tight">VoxNova</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('generate')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'generate' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            <Sparkles size={20} />
            Generate
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            <History size={20} />
            History
          </button>
          <button 
            onClick={() => setShowVoiceLibrary(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Library size={20} />
            Voice Library
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Share2 size={20} />
            Share App
          </button>
          <button 
            onClick={() => setIsKeyModalOpen(true)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${userApiKey ? 'text-emerald-400' : 'text-zinc-400'} hover:text-white hover:bg-white/5`}
          >
            <Key size={20} />
            API Settings
          </button>
          <button 
            onClick={() => setIsPricingModalOpen(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-yellow-400 hover:text-white hover:bg-yellow-500/10 transition-all border border-yellow-500/20"
          >
            <Crown size={20} />
            Premium Plans
          </button>
          <button 
            onClick={() => setIsDeployModalOpen(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-500/10 transition-all border border-emerald-500/20"
          >
            <TrendingUp size={20} />
            Earn & Deploy
          </button>
        </nav>

        <div className="mt-4">
          <AdSlot id="sidebar-ad" className="h-32" label="Sponsor" />
        </div>

        <div className="mt-auto p-4 glass-panel rounded-2xl">
          {currentUser ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={currentUser.photoURL || ''} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{currentUser.displayName}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                    {userProfile?.plan || 'Free'} Plan
                  </p>
                </div>
                <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
              <div className="pt-3 border-t border-white/5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Credits</span>
                  <span className="text-xs font-mono text-emerald-400">{userProfile?.credits?.toLocaleString() || 0}</span>
                </div>
                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    style={{ width: `${Math.min(100, ((userProfile?.credits || 0) / 20000) * 100)}%` }} 
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
            Link copied to clipboard! (लिंक कॉपी हो गया है!)
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Key Modal */}
      <AnimatePresence>
        {isKeyModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-display font-bold">API Settings</h3>
                <button onClick={() => setIsKeyModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Enter your Gemini API key to bypass shared limits. Your key is stored locally in your browser.
                </p>
                
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Gemini API Key</label>
                  <div className="relative">
                    <input 
                      type="password"
                      value={userApiKey}
                      onChange={(e) => setUserApiKey(e.target.value)}
                      placeholder="Paste your API key here..."
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                    <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700" size={16} />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => saveApiKey(userApiKey)}
                    className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-all"
                  >
                    Save Key
                  </button>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('voxnova_api_key');
                      setUserApiKey('');
                      setIsKeyModalOpen(false);
                    }}
                    className="px-4 py-3 border border-white/10 rounded-xl text-zinc-500 hover:text-white transition-all"
                  >
                    Clear
                  </button>
                </div>

                <p className="text-[10px] text-zinc-600 text-center">
                  Don't have a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline">Get one for free here</a>
                </p>
              </div>
            </motion.div>
          </div>
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
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 10,000 Credits</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> High Quality Voices</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> No Expiry</li>
                  </ul>
                  <button onClick={() => purchaseCredits('basic', 10000)} className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all">Buy Now</button>
                </div>

                {/* Pro Plan */}
                <div className="p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 space-y-6 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[8px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">Best Value</div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold">Pro</h4>
                    <div className="text-3xl font-display font-bold">₹200</div>
                  </div>
                  <ul className="text-xs text-zinc-400 space-y-3 flex-1">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 25,000 Credits</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> High Quality Voices</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Priority Support</li>
                  </ul>
                  <button onClick={() => purchaseCredits('pro', 25000)} className="w-full py-3 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-all">Buy Now</button>
                </div>

                {/* Ultra Plan */}
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-6 flex flex-col">
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold">Ultra</h4>
                    <div className="text-3xl font-display font-bold">₹500</div>
                  </div>
                  <ul className="text-xs text-zinc-400 space-y-3 flex-1">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 75,000 Credits</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> All Premium Features</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Custom Voice Profiles</li>
                  </ul>
                  <button onClick={() => purchaseCredits('ultra', 75000)} className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all">Buy Now</button>
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

      {/* Deployment & Monetization Modal */}
      <AnimatePresence>
        {isDeployModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 space-y-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                    <TrendingUp size={24} />
                  </div>
                  <h3 className="text-2xl font-display font-bold">Earn & Deploy Guide</h3>
                </div>
                <button onClick={() => setIsDeployModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-[10px] tracking-widest">
                    <Globe size={14} /> Step 1: Go Public
                  </div>
                  <h4 className="text-lg font-bold">Free Deployment</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Use <b>Cloud Run</b> for the best experience. Since this app has a server, static hosts like GitHub Pages won't work.
                  </p>
                  <ul className="text-xs text-zinc-500 space-y-2 list-disc pl-4">
                    <li>Click <b>Deploy</b> in AI Studio menu.</li>
                    <li>Or use <b>Render.com</b> (Free tier).</li>
                    <li>Connect your GitHub repo to Render.</li>
                  </ul>
                </div>

                <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div className="flex items-center gap-2 text-yellow-400 font-bold uppercase text-[10px] tracking-widest">
                    <DollarSign size={14} /> Step 2: Monetize
                  </div>
                  <h4 className="text-lg font-bold">Start Earning</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    I have already added <b>AdSense Slots</b> to your app. Once you have a domain, apply for AdSense.
                  </p>
                  <ul className="text-xs text-zinc-500 space-y-2 list-disc pl-4">
                    <li>Add your AdSense code to the slots.</li>
                    <li>Offer "Premium" voices for paid users.</li>
                    <li>Sell API access to other developers.</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl space-y-3">
                <h4 className="font-bold text-emerald-400 flex items-center gap-2">
                  <Sparkles size={16} /> Pro Tip for Income
                </h4>
                <p className="text-sm text-zinc-300">
                  Create a YouTube channel or Instagram page showing how to use this tool for Hindi/English voiceovers. Put your website link in the bio to drive traffic and increase ad revenue!
                </p>
              </div>

              <button 
                onClick={() => setIsDeployModalOpen(false)}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition-all shadow-xl shadow-white/5"
              >
                Got it, let's build!
              </button>
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
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <X size={16} className="shrink-0" />
                      <span className="flex-1 leading-relaxed">{error}</span>
                    </div>
                    {(error.includes("Quota") || error.includes("API key") || error.includes("कोटा")) && (
                      <button 
                        onClick={openKeyDialog}
                        className="w-fit px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors flex items-center gap-2 shadow-lg shadow-red-500/20"
                      >
                        <Key size={14} />
                        Update API Key (API Key अपडेट करें)
                      </button>
                    )}
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-panel p-4 rounded-2xl space-y-3">
                    <label className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Volume2 size={14} /> Voice
                    </label>
                    <select 
                      value={selectedVoice.id}
                      onChange={(e) => setSelectedVoice(VOICES.find(v => v.id === e.target.value) || VOICES[0])}
                      className="w-full bg-transparent text-sm focus:outline-none cursor-pointer"
                    >
                      {VOICES.map(v => (
                        <option key={v.id} value={v.id} className="bg-zinc-900">
                          {v.name} ({v.gender}) {v.isPremium ? '💎' : ''}
                        </option>
                      ))}
                    </select>
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
                    onClick={handleGenerate}
                    disabled={isGenerating || !text.trim()}
                    className="flex-1 btn-primary h-14"
                  >
                    {isGenerating ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={18} />
                          <span className="font-bold">Generating...</span>
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
                        onClick={() => audioRef.current?.play()}
                        className="w-14 h-14 glass-panel rounded-xl flex items-center justify-center hover:bg-white/5 transition-all"
                      >
                        <Play size={24} />
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

                <AdSlot id="main-content-ad" className="mt-8" />

                {currentAudio && (
                  <audio 
                    ref={audioRef} 
                    src={currentAudio} 
                    className="hidden" 
                  />
                )}
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
                          onClick={() => playFromHistory(item.audio_data)}
                          className="p-3 hover:bg-white/5 rounded-xl transition-all text-zinc-400 hover:text-white"
                        >
                          <Play size={20} />
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
      </main>

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
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-display font-bold">Voice Library</h3>
                  <p className="text-zinc-500 text-sm">Explore and preview 20 professional AI voices.</p>
                </div>
                <button 
                  onClick={() => setShowVoiceLibrary(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {VOICES.map((voice) => (
                  <div 
                    key={voice.id}
                    onClick={() => {
                      setSelectedVoice(voice);
                      setShowVoiceLibrary(false);
                    }}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer group ${selectedVoice.id === voice.id ? 'bg-white/10 border-white/20' : 'bg-zinc-800/50 border-white/5 hover:border-white/10'}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center font-display font-bold text-xl group-hover:scale-110 transition-transform">
                        {voice.name[0]}
                      </div>
                      {selectedVoice.id === voice.id && (
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <Check size={14} className="text-black" />
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-lg">{voice.name}</h4>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">{voice.gender}</p>
                    <p className="text-sm text-zinc-400 line-clamp-2">{voice.description}</p>
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
          <span>Status: Online</span>
          <span>Model: Gemini 2.5 TTS</span>
        </div>
        <div className="hidden md:block">
          © 2026 VoxNova AI • Professional Voice Synthesis
        </div>
      </footer>
    </div>
  );
}
