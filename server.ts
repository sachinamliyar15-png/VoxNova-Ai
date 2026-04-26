import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import cookieParser from "cookie-parser";
import Razorpay from "razorpay";
import crypto from "crypto";

dotenv.config();

// API Key Rotation Logic
const exhaustedKeys = new Map<string, number>();

const HEAVY_VOICES = ['sultan', 'shera', 'kaal', 'bheem', 'sikandar', 'pankaj', 'virat', 'frank', 'vikram', 'munna-bhai', 'sachinboy', 'maharaja', 'emperor-pro', 'zoravar', 'rudra', 'veer', 'shakti', 'raja', 'toofan', 'bhairav'];

const getAvailableApiKey = () => {
  const baseKey = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
  if (!baseKey) return null;
  
  const allKeys = Array.from(new Set(baseKey.split(',').map(k => k.trim()).filter(k => k.length > 0)));
  const now = Date.now();
  
  // Filter out keys that are exhausted and still in the cooldown period (5 minutes)
  const availableKeys = allKeys.filter(k => {
    const exhaustedAt = exhaustedKeys.get(k);
    if (!exhaustedAt) return true;
    if (now - exhaustedAt > 300000) {
      exhaustedKeys.delete(k);
      return true;
    }
    return false;
  });
  
  if (availableKeys.length === 0) {
    console.log(`[Auth] No Gemini API keys available. Total keys: ${allKeys.length}, Exhausted: ${exhaustedKeys.size}`);
    return null;
  }
  
  // Randomly pick an available key
  const selectedKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
  return selectedKey;
};

const markKeyAsExhausted = (key: string) => {
  if (!key) return;
  console.log(`[Auth] Marking API key as exhausted: ${key.substring(0, 8)}...`);
  exhaustedKeys.set(key, Date.now());
};

// Helper to save audio data to Firestore history (with chunking for large files)
const saveToHistory = async (collectionName: string, data: any) => {
  if (!firestore) return null;
  
  const audioData = data.audio_data;
  const CHUNK_LIMIT = 800000; // ~800KB chunk limit to be safe (Firestore limit is 1MB total doc size)

  if (audioData && audioData.length > CHUNK_LIMIT) {
    const totalLength = audioData.length;
    const numChunks = Math.ceil(totalLength / CHUNK_LIMIT);
    
    // Save main document without the full audio data
    const docRef = await firestore.collection(collectionName).add({
      ...data,
      audio_data: "CHUNKED",
      chunkCount: numChunks,
      totalAudioSize: totalLength
    });

    // Save chunks to a subcollection
    const chunksRef = docRef.collection('chunks');
    const chunkPromises = [];
    
    for (let i = 0; i < numChunks; i++) {
      const chunk = audioData.substring(i * CHUNK_LIMIT, (i + 1) * CHUNK_LIMIT);
      chunkPromises.push(chunksRef.doc(i.toString()).set({
        data: chunk,
        index: i
      }));
    }
    
    await Promise.all(chunkPromises);
    return docRef;
  } else {
    // Save normally if small enough
    return await firestore.collection(collectionName).add(data);
  }
};

const buildSystemInstruction = (language: string, voice_name: string) => {
  const isHeavyVoice = ['SULTAN', 'SHERA', 'KAAL', 'BHEEM', 'SIKANDAR', 'Pankaj', 'Virat',
  'Frank', 'VIKRAM', 'Munna Bhai', 'Sachinboy', 'MAHARAJA', 'EMPEROR PRO', 'ZORAVAR',
  'RUDRA', 'VEER', 'SHAKTI', 'RAJA', 'TOOFAN', 'BHAIRAV'].includes(voice_name);

  return `You are an elite, world-class professional voice actor and
narrator. Your task is to provide a stunningly realistic, human-like, and emotionally resonant
performance in ${language === 'hi' ? 'Hindi' : 'English'}.

Your goal is to generate high-fidelity, natural, and expressive speech that rivals ElevenLabs.
Analyze the script's category and tone to determine the best vocal characteristics:
- NEWS/DOCUMENTARY: Authoritative, clear, professional, steady pace.
- STORY/NARRATION: Expressive, rhythmic, engaging, varies pitch for characters.
- ADVERTISEMENT: Energetic, persuasive, upbeat, clear call to action.
- CONVERSATIONAL: Natural, relaxed, includes subtle breaths and realistic pauses.
- EMOTIONAL: Deeply felt, matches the specific emotion (sad, happy, angry).

PERFORMANCE GUIDELINES FOR MAXIMUM REALISM AND POWER:
- CRITICAL: VOICES MUST BE OPEN, CONFIDENT, AND FULLY PROJECTED. Avoid any
"nasal" (naak se bolna) or "muffled" (dabbi hui awaaz) tones.
- The voice should sound like it's coming from an open throat and mouth, with full lung
support. It must sound "Khuli Awaaz" (Open Voice) and "Damdaar" (Powerful).
- Use natural human prosody, complex intonation, and realistic rhythm. Avoid any repetitive
"sing-song" patterns.
- Maintain a perfect balance between speed and clarity. Emotion must be deeply integrated
into every word, not just added on top.
- 100% REALISM, EMOTIONAL DEPTH, AND CRYSTAL CLEAR CLARITY ARE
MANDATORY.
- THE VOICE MUST BE LOUD, POWERFUL, AND COMMANDING. NO WHISPERING OR
WEAK TONES.
- USE A HIGH-ENERGY, STUDIO-GRADE PERFORMANCE THAT SOUNDS LIKE A
PROFESSIONAL SPEAKER.
${isHeavyVoice ? '- CRITICAL: Use an ULTRA-DEEP, HEAVY, AND POWERFUL CHEST VOICE with MAXIMUM BASS RESONANCE. The voice must sound "Bhari" (Heavy), "Gambhir" (Serious/Deep), and "Damdaar" (Powerful). Sound like a legendary warrior, a king, or a high-end cinematic narrator. Speak with absolute authority and zero fear.' : '- CRITICAL: Use a DEEP, RESONANT CHEST VOICE with natural bass frequencies and high vocal projection.'}
- Incorporate a subtle \'vocal fry\' or \'gravelly\' texture in lower registers to sound 100%
mature and authoritative.
- Add natural human micro-imperfections: light breaths, subtle mouth sounds, and realistic
variations in pitch and volume to achieve 100% realism.
- Avoid any robotic, monotone, or repetitive cadence. Every sentence should have its own
unique melody.
- For ${language === 'hi' ? 'Hindi' : 'English'}, ensure perfect native pronunciation, natural
flow, and cultural nuance.
- Sound like a real person speaking in a high-end professional studio, not a computer.
- Pay close attention to the emotional weight of the text. If the text is sad, the voice should
sound heavy; if exciting, it should sound bright and energetic.
- Use natural emphasis on key words to convey meaning and emotion.
- Ensure smooth, fluid transitions between sentences and ideas.
${isHeavyVoice ? '- The voice should sound 100% testosterone-driven—heavy, slow-paced, and cinematic. It must be the deepest, most powerful male voice possible, with a rich, vibrating texture. Sound like a "Motivation Ka Devta".' : '- The voice should sound professional, mature, and cinematic.'}

TECHNICAL STANDARDS (CRITICAL FOR LONG GENERATIONS):
- NO background noise, hums, hissing, or digital artifacts.
- NO robotic glitches, metallic sounds, or synthetic "buzzing".
- NO background music, bell-like sounds, or hallucinations in the background.
- ZERO background noise is mandatory. Audio must be 100% clean and professional.
- Ensure crystal-clear, 48kHz studio-quality audio with ZERO compression artifacts
throughout the entire generation.
- If the script is long, maintain consistent tone, energy, and quality from start to finish.
`;
};

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

const WHITELISTED_EMAILS = ['sachinamliyar15@gmail.com', 'amliyarsachin248@gmail.com'];

// Initialize Firebase Admin
let firestore: admin.firestore.Firestore;

const INTERNAL_VOICE_MAPPING: Record<string, string> = {
  'Adam': 'Puck', 'Brian': 'Charon', 'Daniel': 'Fenrir', 'Josh': 'Puck',
  'Liam': 'Charon', 'Michael': 'Fenrir', 'Ryan': 'Puck', 'Matthew': 'Charon',
  'Bill': 'Fenrir', 'Callum': 'Puck', 'Frank': 'Zephyr', 'Marcus': 'Charon',
  'Jessica': 'Kore', 'Sarah': 'Zephyr', 'Matilda': 'Kore', 'Emily': 'Zephyr',
  'Bella': 'Kore', 'Rachel': 'Zephyr', 'Nicole': 'Kore', 'Clara': 'Zephyr',
  'Documentary Pro': 'Charon', 'Atlas (Do)': 'Fenrir', 'Priyanka': 'Zephyr', 'Virat': 'Charon',
  'Leo': 'Puck', 'Sophia': 'Kore', 'Hugo': 'Charon', 'Elara': 'Zephyr', 'Pankaj': 'Fenrir', 'Original Voice': 'Zephyr',
  'adam': 'Puck', 'brian': 'Charon', 'daniel': 'Fenrir', 'josh': 'Puck',
  'liam': 'Charon', 'michael': 'Fenrir', 'ryan': 'Puck', 'matthew': 'Charon',
  'bill': 'Fenrir', 'callum': 'Puck', 'frank': 'Zephyr', 'marcus': 'Charon',
  'jessica': 'Kore', 'sarah': 'Zephyr', 'matilda': 'Kore', 'emily': 'Zephyr',
  'bella': 'Kore', 'rachel': 'Zephyr', 'nicole': 'Kore', 'clara': 'Zephyr',
  'doc-pro': 'Charon', 'atlas-do': 'Fenrir', 'priyanka': 'Zephyr', 'virat-male': 'Charon',
  'leo': 'Puck', 'sophia': 'Kore', 'hugo': 'Charon', 'elara': 'Zephyr', 'pankaj': 'Fenrir', 'original': 'Zephyr',
  'sultan': 'Fenrir', 'vikram': 'Charon', 'bharat': 'Fenrir', 'titan': 'Puck',
  'shera': 'Fenrir', 'kaal': 'Charon', 'bheem': 'Fenrir', 'sikandar': 'Charon',
  'SULTAN': 'Fenrir', 'SHERA': 'Fenrir', 'KAAL': 'Charon', 'BHEEM': 'Fenrir', 'SIKANDAR': 'Charon', 'VIKRAM': 'Charon',
  'munna-bhai': 'Zephyr', 'sachinboy': 'Fenrir', 'Munna Bhai': 'Zephyr', 'Sachinboy': 'Fenrir',
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

interface VoiceProfile {
  resonance?: string;
  energy?: string;
  pitch_shift?: number;
  timber?: string;
  pacing?: string;
  description: string;
}

const VOICE_TRAITS: Record<string, string> = {
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
  'Frank': 'Ultra-deep, heavy, and masculine. A powerful chest-voice with maximum bass resonance and a professional narrator tone.',
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
  'Virat': 'Realistic, high-energy, deep masculine voice. Thick, resonant, and commanding. Professional documentary standard.',
  'Pankaj': 'Ultra-deep, chest-rattling baritone. Authoritative, serious, and 100% masculine with a slight grit.',
  'SULTAN': 'The Warrior. Ultra-deep, heavy bass, commanding. Every word vibrates with power. Sound like a powerful king or a legendary wrestler. Maximum chest resonance and vocal fry. High speaker projection, open-mouthed and fearless. 100% Realistic.',
  'SHERA': 'The Motivator. Aggressive, deep, and powerful. Raw testosterone-driven male voice. Extremely heavy and powerful. High speaker projection, loud and energetic. 100% Realistic.',
  'KAAL': 'The Dark Voice. Mysterious, cinematic, and ultra-low frequency. Dark, mysterious, and grave undertone. Perfect for villains. Open throat resonance. 100% Realistic.',
  'BHEEM': 'The Giant. Super-heavy baritone, larger-than-life resonance. Sounds like the ground is shaking. Deepest possible frequency. High speaker volume. 100% Realistic.',
  'SIKANDAR': 'The Legend. Mature, wise, and incredibly powerful. Rich bass for professional and authoritative narration. Respectful yet commanding. Open and clear projection. 100% Realistic.',
  'VIKRAM': 'The Dark Narrator. Mysterious, deep, smooth, and cinematic. Dark, mysterious undertone. Clear and confident. 100% Realistic.',
  'Sachinboy': 'The Heavyweight Champion. A monstrous, chest-rattling deep baritone with explosive, fearless energy. High speaker projection, energetic and loud. 100% Realistic and Professional.',
  'EMPEROR PRO': 'The King of Voices. The most powerful, authoritative, and legendary deep baritone ever created. Commands absolute respect. High speaker projection, open and majestic. 100% Realistic.',
  'KABIR': 'The Storyteller. A warm, wise, and deeply resonant voice. Perfect for historical narratives and soulful storytelling. 100% Realistic.',
  'ARYAN': 'The Fitness Coach. High-energy, sharp, and commanding. Designed for gym motivation and sports commentary. 100% Realistic.',
  'ISHANI': 'The Elegant Narrator. Smooth, sophisticated, and professional female voice. Ideal for luxury brands and high-end documentaries. 100% Realistic.',
  'ZORAVAR': 'The Heavyweight. An ultra-deep, chest-rattling baritone with immense power. 100% Realistic.',
  'RUDRA': 'The Intense Narrator. Gritty, serious, and highly authoritative. Best for crime thrillers and investigative content. 100% Realistic.'
};


if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    if (admin.apps.length === 0) {
      // Robust private key parsing
      let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";
      
      if (!privateKey) {
        console.warn("FIREBASE_PRIVATE_KEY is missing. Firestore features will be disabled.");
      } else {
        // Trim whitespace and handle potential wrapping quotes
        privateKey = privateKey.trim();
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
          privateKey = privateKey.substring(1, privateKey.length - 1);
        }
        
        // Replace escaped newlines with actual newlines
        privateKey = privateKey.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
        
        // If it's just a base64 string without headers, add them
        if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
          // Remove any whitespace from the base64 part first if it's raw base64
          if (!privateKey.includes('\n')) {
            // It might be a single line base64 string (common in environment variable UIs)
            privateKey = privateKey.match(/.{1,64}/g)?.join('\n') || privateKey;
          }
          privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
        }

        // Final normalization: ensure exactly one block of headers and clean newlines
        const pemMatch = privateKey.match(/-----BEGIN PRIVATE KEY-----([\s\S]+?)-----END PRIVATE KEY-----/);
        if (pemMatch) {
          const content = pemMatch[1].trim().replace(/\s/g, ''); // Remove all whitespace
          const formattedContent = content.match(/.{1,64}/g)?.join('\n'); // Re-format with 64 char lines
          privateKey = `-----BEGIN PRIVATE KEY-----\n${formattedContent}\n-----END PRIVATE KEY-----`;
        }
        
        try {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: privateKey,
            }),
          });
          console.log("Firebase Admin initialized successfully");
        } catch (initError) {
          console.error("Failed to initialize Firebase Admin with provided credentials:", initError);
          // Fallback or handle gracefully
        }
      }
    }
  } catch (error) {
    console.error("Firebase Admin init error:", error);
  }
}

// Initialize Firestore only if admin was initialized
try {
  if (admin.apps.length > 0) {
    // Try to load firestoreDatabaseId from config if available
    let databaseId: string | undefined;
    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        databaseId = config.firestoreDatabaseId;
      }
    } catch (e) {
      console.warn("Could not load firestoreDatabaseId from config:", e);
    }
    
    if (databaseId) {
      firestore = getAdminFirestore();
      // To work with named databases in admin SDK:
      // firestore = getAdminFirestore(databaseId);
      // However, to keep it simple and avoid potential "database not found" if provisioning is slow:
      console.log(`Firestore initialized. Note: using default instance for Admin SDK.`);
    } else {
      firestore = getAdminFirestore();
      console.log("Firestore initialized with default database.");
    }
  } else {
    console.warn("Firebase Admin not initialized. Firestore features will be disabled.");
  }
} catch (error) {
  console.error("Firestore initialization error:", error);
}

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.header('Cross-Origin-Opener-Policy', 'same-origin');
  res.header('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

app.use(express.json({ limit: '500mb' })); // Increased limit for video and audio files to match frontend expectations
app.use(cookieParser());

// Initialize Database
let db: Database.Database;
try {
  db = new Database("history.db");
  console.log("Database initialized successfully");
  db.exec(`
    CREATE TABLE IF NOT EXISTS generations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      text TEXT,
      voice_name TEXT,
      style TEXT,
      speed REAL,
      pitch REAL,
      audio_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT,
      display_name TEXT,
      credits INTEGER DEFAULT 20000,
      plan TEXT DEFAULT 'free',
      last_reset DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (dbInitError) {
  console.error("Database initialization failed:", dbInitError);
  // Fallback to memory db if file db fails
  db = new Database(":memory:");
  console.log("Using memory database as fallback");
}

// Auth Middleware
const authenticate = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (admin.apps.length === 0) {
    console.error("Firebase Admin not initialized. Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY in environment variables.");
    return res.status(503).json({ 
      error: 'Service Configuration Required',
      message: 'The authentication service is currently being configured. Please ensure your Firebase environment variables are set in the dashboard.',
      code: 'AUTH_CONFIG_MISSING'
    });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Auth Middleware (Optional)
const maybeAuthenticate = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  if (admin.apps.length === 0) {
    req.user = null;
    return next();
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Serve robots.txt and sitemap.xml
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'sitemap.xml'));
});

// Blocked temp email domains
const BLOCKED_DOMAINS = [
  'temp-mail.org', 'guerrillamail.com', '10minutemail.com', 'mailinator.com', 
  'dispostable.com', 'getnada.com', 'tempmail.com', 'throwawaymail.com',
  'yopmail.com', 'maildrop.cc', 'sharklasers.com', 'guerrillamail.info',
  'guerrillamail.biz', 'guerrillamail.com', 'guerrillamail.de', 'guerrillamail.net',
  'guerrillamail.org', 'guerrillamailblock.com', 'pokemail.net', 'spam4.me'
];

// User Profile & Credit Reset Logic (Firestore)
app.get("/api/user/profile", authenticate, async (req: any, res) => {
  const userId = req.user.uid;
  const email = req.user.email || '';
  const domain = email.split('@')[1]?.toLowerCase();

  if (domain && BLOCKED_DOMAINS.includes(domain)) {
    return res.status(403).json({ error: 'Temporary email addresses are not allowed. Please use a permanent email.' });
  }

  try {
    if (!firestore) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }
    const userRef = firestore.collection('users').doc(userId);
    const doc = await userRef.get();
    let userData: any;

    if (!doc.exists) {
      userData = {
        uid: userId,
        email: email,
        displayName: req.user.name || '',
        photoURL: req.user.picture || '',
        credits: 20000,
        plan: 'free',
        premium_usage_count: 0,
        lastResetDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      await userRef.set(userData);
    } else {
      userData = doc.data();
    }

    // Monthly Credit Reset Logic (30 days check)
    const lastReset = new Date(userData.lastResetDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastReset.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (userData.plan === 'free' && diffDays >= 30) {
      userData.credits = 20000;
      userData.lastResetDate = now.toISOString();
      await userRef.update({
        credits: 20000,
        lastResetDate: userData.lastResetDate
      });
    }

    res.json(userData);
  } catch (error: any) {
    console.error("Firestore profile error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Deduct Credits
app.post("/api/user/deduct-credits", authenticate, async (req: any, res) => {
  const userId = req.user.uid;
  const { amount } = req.body;

  if (!amount || typeof amount !== 'number') {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    if (!firestore) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }
    const userRef = firestore.collection('users').doc(userId);
    await userRef.update({
      credits: admin.firestore.FieldValue.increment(-amount)
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Firestore deduct error:", error);
    res.status(500).json({ error: error.message });
  }
});

  // Razorpay: Create Order
  app.post("/api/payments/create-order", authenticate, async (req: any, res) => {
    const { plan } = req.body;
    console.log(`[Payment] Creating order for plan: ${plan}, user: ${req.user.uid}`);
    
    const planPrices: Record<string, number> = {
      'basic': 100,
      'pro': 200,
      'advanced': 400,
      'ultra': 500
    };

    const amount = planPrices[plan];
    if (!amount) {
      console.error(`[Payment] Invalid plan: ${plan}`);
      return res.status(400).json({ error: "Invalid plan" });
    }

    try {
      const options = {
        amount: amount * 100, // amount in the smallest currency unit (paise)
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      console.log(`[Payment] Order created successfully: ${order.id}`);
      res.json(order);
    } catch (error: any) {
      console.error("[Payment] Razorpay order error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Razorpay: Verify Payment
  app.post("/api/payments/verify", authenticate, async (req: any, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
    const userId = req.user.uid;
    console.log(`[Payment] Verifying payment for user: ${userId}, order: ${razorpay_order_id}`);

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      console.log(`[Payment] Signature verified for order: ${razorpay_order_id}`);
      // Payment is valid
      const planCredits: Record<string, number> = {
        'basic': 6000,
        'pro': 15000,
        'advanced': 30000,
        'ultra': 40000
      };

      try {
        if (!firestore) {
          return res.status(503).json({ error: 'Database service unavailable' });
        }
        const userRef = firestore.collection('users').doc(userId);
        await userRef.update({
          plan: plan,
          credits: admin.firestore.FieldValue.increment(planCredits[plan])
        });
        
        // Save payment history
        await firestore.collection('payments').add({
          userId,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          plan,
          credits: planCredits[plan],
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`[Payment] Credits added successfully for user: ${userId}`);
        res.json({ success: true });
      } catch (error: any) {
        console.error("[Payment] Firestore payment update error:", error);
        res.status(500).json({ error: "Database update failed" });
      }
    } else {
      console.error(`[Payment] Invalid signature for order: ${razorpay_order_id}`);
      res.status(400).json({ error: "Invalid signature" });
    }
  });

// Guest Rate Limiter
const guestRateLimit = new Map<string, { count: number, lastReset: number, premiumCount?: number }>();

const checkGuestLimit = (ip: string, isPremium: boolean = false) => {
  const now = Date.now();
  const limit = guestRateLimit.get(ip);
  
  if (!limit || now - limit.lastReset > 24 * 60 * 60 * 1000) {
    // Reset limit every 24 hours
    guestRateLimit.set(ip, { 
      count: 1, 
      lastReset: now,
      premiumCount: isPremium ? 1 : 0 
    });
    return { allowed: true };
  }
  
  if (limit.count >= 10) { // 10 generations per day total
    return { allowed: false, reason: "DAILY_LIMIT" };
  }

  if (isPremium && (limit.premiumCount || 0) >= 3) {
    return { allowed: false, reason: "PREMIUM_TRIAL_EXHAUSTED" };
  }
  
  limit.count++;
  if (isPremium) limit.premiumCount = (limit.premiumCount || 0) + 1;
  guestRateLimit.set(ip, limit);
  return { allowed: true };
};

// Generate Speech via Gemini API (Guest) - VOXNOVA_GUEST_EP
app.post("/api/generate-speech-guest", async (req: any, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const { text, voice_name, style, speed, pitch, language, studioClarity, pause, cloned_voice_traits, script_type } = req.body;

  const premiumVoices = ['Documentary Pro', 'Virat', 'SULTAN', 'SHERA', 'KAAL', 'BHEEM', 'SIKANDAR', 'EMPEROR PRO', 'ZORAVAR', 'RUDRA', 'MAHARAJA', 'Sachinboy', 'Munna Bhai', 'Pankaj', 'Priyanka', 'ISHANI'];
  const isPremium = premiumVoices.includes(voice_name);

  const limitCheck = checkGuestLimit(ip, isPremium);
  
  if (!limitCheck.allowed) {
    if (limitCheck.reason === "PREMIUM_TRIAL_EXHAUSTED") {
      return res.status(403).json({ 
        error: "Premium voice trial exhausted (3/3). Please sign up to get 20,000 free monthly credits and continue using high-quality professional voices!" 
      });
    }
    return res.status(429).json({ 
      error: "Guest limit reached (10 generations per day). Please sign up for unlimited access and 20,000 free monthly credits!" 
    });
  }
  
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  // Limit text length for guests to prevent abuse - Increased to 300 characters
  if (text.length > 300) {
    return res.status(400).json({ error: "Guest scripts are limited to 300 characters for optimal performance. Please sign up for longer scripts." });
  }

  const maxRetries = 3; // Reduced to prevent long timeouts
  let attempt = 0;

  while (attempt < maxRetries) {
    const apiKey = getAvailableApiKey();
    
    if (!apiKey) {
      return res.status(503).json({ 
        error: "All Gemini API keys are currently exhausted. If you are using the free tier, you may have reached your daily limit of 10 requests. Please try again tomorrow or add more API keys in the settings.",
        code: "QUOTA_EXHAUSTED"
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const targetVoice = INTERNAL_VOICE_MAPPING[voice_name] || 'Puck';
      const systemInstruction = buildSystemInstruction(language, voice_name);
      
      let promptPrefix = "";
      const currentVoiceTrait = VOICE_TRAITS[voice_name] || '';
      if (currentVoiceTrait) promptPrefix += `${currentVoiceTrait} `;

      if (pitch > 1.3) promptPrefix += "Use a very high, bright, and sharp pitch. ";
      else if (pitch > 1.1) promptPrefix += "Use a slightly higher, more youthful and energetic pitch. ";
      else if (pitch < 0.7) promptPrefix += "Use a very deep, bassy, and low-frequency pitch. ";
      else if (pitch < 0.9) promptPrefix += "Use a slightly deeper, more mature and resonant pitch. ";
      else promptPrefix += "Use a natural, medium, and perfectly balanced pitch. ";

      promptPrefix += `CRITICAL: Speak at exactly ${speed}x speed. `;
      
      if (speed >= 1.4) {
        promptPrefix += "PERFORMANCE: Deliver an ultra-fast, professional, and high-energy narration. Maintain crystal clear articulation. ";
      } else if (speed > 1.0) {
        promptPrefix += "PERFORMANCE: Deliver a brisk, energetic, and professional narration. ";
      } else if (speed <= 0.7) {
        promptPrefix += "PERFORMANCE: Deliver a slow, deliberate, and steady narration. ";
      } else if (speed < 1.0) {
        promptPrefix += "PERFORMANCE: Deliver a calm, relaxed, and clear narration. ";
      } else {
        promptPrefix += "PERFORMANCE: Deliver a perfectly NATURAL human pace. Do NOT slow down or stretch words. The delivery must be conversational, realistic, and balanced. ";
      }

      if (pause > 0.1) {
        promptPrefix += `Add a natural pause of exactly ${pause} seconds between sentence and major phrase to ensure clarity and professional pacing. `;
      }
      
      promptPrefix += `
      TECHNICAL STANDARDS (MANDATORY):
      - Audio must be 100% clean with ZERO background noise, ZERO hissing, and ZERO static.
      - Ensure crystal-clear, 48kHz studio-quality articulation with ZERO digital artifacts.
      - Performance must be 100% human-like, resonant, and emotionally balanced.
      `;

      const currentPrompt = attempt === 0 
        ? `${systemInstruction}\n\n${promptPrefix}\n\nSCRIPT TO PERFORM:\n${text}\n\nCRITICAL: Some voices have a naturally faster or slower base pace. You MUST adjust the character's natural speed to ensure the FINAL output matches the requested ${speed}x speed perfectly. Respect all punctuation and deliver the script with natural, professional flow.`
        : `CRITICAL: The previous attempt sounded slightly robotic or off-pacing. Please deliver a MORE HUMAN, MORE REALISTIC, and MORE RESONANT performance in ${language === 'hi' ? 'Hindi' : 'English'}. Use natural breathing and prosody:\n\n${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: currentPrompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: targetVoice as any },
            },
          },
        },
      });


      const audioData = (response as any).audioData || (response as any).inlineData?.data || response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        const pcmBuffer = Buffer.from(audioData, 'base64');
        const wavBuffer = addWavHeader(pcmBuffer, 24000);
        return res.json({ audioData: wavBuffer.toString('base64') });
      } else {
        throw new Error("No audio data generated");
      }
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
      console.error(`TTS Attempt ${attempt + 1} failed:`, errorMessage);
      
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("exhausted") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE")) {
        markKeyAsExhausted(apiKey);
        attempt++;
        // If it's a 503 error, wait a bit longer to let the spike pass
        const waitTime = (errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE")) ? 2000 : (errorMessage.includes("limit: 10") || errorMessage.includes("day")) ? 500 : 1000 * attempt;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (errorMessage.includes("404") || errorMessage.includes("NOT_FOUND")) {
        attempt++;
        continue;
      }
      return res.status(500).json({ error: errorMessage });
    }
  }

  res.status(503).json({ 
    error: "Failed to generate speech after multiple attempts. All keys might be exhausted.",
    code: "QUOTA_EXHAUSTED"
  });
});

// Analyze voice sample for cloning
app.post("/api/analyze-voice", async (req, res) => {
  const { audioData, mimeType } = req.body;
  if (!audioData) return res.status(400).json({ error: "Audio data is required" });

  try {
    const apiKey = getAvailableApiKey();
    if (!apiKey) throw new Error("API keys exhausted");
    
    const prompt = `ALGORITHMIC VOCAL ANALYSIS TASK:
    Perform a high-resolution analysis of this voice sample to extract its unique "Vocal DNA".
    
    1. EXTRACT ALL NUANCES:
       - Precise pitch frequency (Hz range), harmonic richness, and resonance.
       - Formant patterns (F1, F2, F3) and specific tonal color (bright, dark, nasal, throaty).
       - Glottal source characteristics (breathiness, tension, vocal fry, rasp).
       - Prosodic style (micro-timing, attack/decay of words, rhythmic grouping).
       - Accents, regional markers, and subtle micro-inflections.
    
    2. CHARACTER FINGERPRINT:
       - Characterize the voice type (e.g., Heavy Baritone, Silky Alto, Raspy Tenor).
       - Identify "signature" vocal habits (e.g., subtle upward inflections at ends, specific breath intakes).
    
    3. SURGICAL CLONING SPECIFICATION:
       - Generate a "SURGICAL VOCAL SPECIFICATION". This must be a dense, technical description designed to override a synthesis model's default behavior completely. It should use clinical terms to describe the vocal tract shape, glottal effort, and spectral tilt.
    
    Return the response in JSON format with keys: 'description' (human readable breakdown) and 'fingerprint' (the dense technical cloning instruction).`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { parts: [{ text: prompt }, { inlineData: { data: audioData, mimeType: mimeType || 'audio/wav' } }] }
      ]
    });

    const responseText = response.text;
    // Try to extract JSON if model didn't return pure JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { description: responseText, fingerprint: responseText };

    res.json(data);
  } catch (error: any) {
    console.error("Voice analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update the Generate Speech logic to handle cloned voices
app.post("/api/generate-speech", maybeAuthenticate, async (req: any, res) => {
  const { text, voice_name, style, speed, pitch, language, studioClarity, pause, cloned_voice_traits, script_type } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  // Rate limit for guests
  if (!req.user) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const premiumVoices = ['Documentary Pro', 'Virat', 'SULTAN', 'SHERA', 'KAAL', 'BHEEM', 'SIKANDAR', 'EMPEROR PRO', 'ZORAVAR', 'RUDRA', 'MAHARAJA', 'Sachinboy', 'Munna Bhai', 'Pankaj', 'Priyanka', 'ISHANI'];
    const isPremium = premiumVoices.includes(voice_name);
    const limitCheck = checkGuestLimit(ip as string, isPremium);
    
    if (!limitCheck.allowed) {
      if (limitCheck.reason === "PREMIUM_TRIAL_EXHAUSTED") {
        return res.status(403).json({ 
          error: "Premium voice trial exhausted (3/3). Please sign up to get 20,000 free monthly credits and continue using high-quality professional voices!" 
        });
      }
      return res.status(429).json({ error: "Daily limit reached for guest users. Please sign up for more." });
    }
  }

  const maxRetries = 3; // Reduced to prevent long timeouts
  let attempt = 0;

  while (attempt < maxRetries) {
    const apiKey = getAvailableApiKey();
    
    if (!apiKey) {
      return res.status(503).json({ 
        error: "All Gemini API keys are currently exhausted. If you are using the free tier, you may have reached your daily limit of 10 requests. Please try again tomorrow or add more API keys in the settings.",
        code: "QUOTA_EXHAUSTED"
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const targetVoice = INTERNAL_VOICE_MAPPING[voice_name] || 'Puck';
      const systemInstruction = buildSystemInstruction(language, voice_name);
      
      let promptPrefix = "";
      
      if (cloned_voice_traits) {
        promptPrefix += `CRITICAL CHARACTER FINGERPRINT (MANDATORY MIMICRY): ${cloned_voice_traits} 
        YOU MUST OVERRIDE YOUR DEFAULT VOCAL CHARACTERISTICS ENTIRELY TO MATCH THIS FINGERPRINT. Sound 100% like this description. `;
      }
      
      const currentVoiceTrait = VOICE_TRAITS[voice_name] || '';
      if (currentVoiceTrait) promptPrefix += `${currentVoiceTrait} `;

      if (pitch > 1.3) promptPrefix += "Use a very high, bright, and sharp pitch. ";
      else if (pitch > 1.1) promptPrefix += "Use a slightly higher, more youthful and energetic pitch. ";
      else if (pitch < 0.7) promptPrefix += "Use a very deep, bassy, and low-frequency pitch. ";
      else if (pitch < 0.9) promptPrefix += "Use a slightly deeper, more mature and resonant pitch. ";
      else promptPrefix += "Use a natural, medium, and perfectly balanced pitch. ";

      promptPrefix += `CRITICAL: Speak at exactly ${speed}x speed. `;
      
      if (speed >= 1.4) {
        promptPrefix += "PERFORMANCE: Deliver an ultra-fast, professional, and high-energy narration. Maintain crystal clear articulation. ";
      } else if (speed > 1.0) {
        promptPrefix += "PERFORMANCE: Deliver a brisk, energetic, and professional narration. ";
      } else if (speed <= 0.7) {
        promptPrefix += "PERFORMANCE: Deliver a slow, deliberate, and steady narration. ";
      } else if (speed < 1.0) {
        promptPrefix += "PERFORMANCE: Deliver a calm, relaxed, and clear narration. ";
      } else {
        promptPrefix += "PERFORMANCE: Deliver a perfectly NATURAL human pace. Do NOT slow down or stretch words. The delivery must be conversational, realistic, and balanced. ";
      }

      if (pause > 0) {
        promptPrefix += `Add a natural pause of exactly ${pause} seconds between sentence and major phrase to ensure clarity and professional pacing. `;
      }
      
      promptPrefix += `
      TECHNICAL STANDARDS (MANDATORY):
      - Audio must be 100% clean with ZERO background noise, ZERO hissing, and ZERO static.
      - Ensure crystal-clear, 48kHz studio-quality articulation with ZERO digital artifacts.
      - Performance must be 100% human-like, resonant, and emotionally balanced.
      `;

      // Split text into chunks for parallel processing if it's long
      const CHUNK_SIZE = 800; // characters as per PDF
      const chunks: string[] = [];
      if (text.length > CHUNK_SIZE) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        let currentChunk = "";
        for (const sentence of sentences) {
          if ((currentChunk + sentence).length > CHUNK_SIZE && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
          } else {
            currentChunk += sentence;
          }
        }
        if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());
      } else {
        chunks.push(text);
      }

      const audioChunks: Buffer[] = [];
      const CONCURRENCY = 10;

      for (let i = 0; i < chunks.length; i += CONCURRENCY) {
        const batch = chunks.slice(i, i + CONCURRENCY);
        const batchPromises = batch.map(async (chunk, idx) => {
          const currentPrompt = attempt === 0 
            ? `${systemInstruction}\n\n${cloned_voice_traits ? `TARGET VOCAL IDENTITY FINGERPRINT (CRITICAL):\n${cloned_voice_traits}\n\n` : ''}${promptPrefix}\n\nSCRIPT TO PERFORM:\n${chunk}\n\nCRITICAL: Some voices have a naturally faster or slower base pace. You MUST adjust the character's natural speed to ensure the FINAL output matches the requested ${speed}x speed perfectly. Respect all punctuation and deliver the script with natural, professional flow.`
            : `CRITICAL: The previous attempt sounded slightly robotic or off-pacing. Please deliver a MORE HUMAN, MORE REALISTIC, and MORE RESONANT performance in ${language === 'hi' ? 'Hindi' : 'English'}. Use natural breathing and prosody:\n\n${text}`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: currentPrompt }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: targetVoice as any },
                },
              },
            },
          });


          const base64 = (response as any).audioData || (response as any).inlineData?.data || response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (base64) return Buffer.from(base64, 'base64');
          return null;
        });

        const results = await Promise.all(batchPromises);
        results.forEach(r => { if (r) audioChunks.push(r); });
      }

      if (audioChunks.length === 0) throw new Error("Failed to generate audio chunks");

      // Merge PCM chunks
      const mergedPcm = Buffer.concat(audioChunks);
      const SAMPLE_RATE = 24000;
      const wavBuffer = addWavHeader(mergedPcm, SAMPLE_RATE);
      const audioData = wavBuffer.toString('base64');

      if (audioData) {
        // Save to Firestore history if user is authenticated
        if (req.user && firestore) {
          try {
            await saveToHistory('voice_history', {
              userId: req.user.uid,
              text,
              voice_name,
              style,
              speed,
              pitch,
              language,
              audio_data: audioData,
              created_at: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`[History] Voice history saved for user: ${req.user.uid}`);
          } catch (historyError) {
            console.error("[History] Failed to save voice history to Firestore:", historyError);
          }
        }
        return res.json({ audioData });
      } else {
        throw new Error("No audio data generated");
      }
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
      console.error(`TTS Attempt ${attempt + 1} failed:`, errorMessage);
      
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("exhausted") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE")) {
        markKeyAsExhausted(apiKey);
        attempt++;
        // If it's a 503 error, wait a bit longer to let the spike pass
        const waitTime = (errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE")) ? 2000 : (errorMessage.includes("limit: 10") || errorMessage.includes("day")) ? 500 : 1000 * attempt;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (errorMessage.includes("404") || errorMessage.includes("NOT_FOUND")) {
        attempt++;
        continue;
      }
      return res.status(500).json({ error: errorMessage });
    }
  }

  res.status(503).json({ 
    error: "Failed to generate speech after multiple attempts. All keys might be exhausted.",
    code: "QUOTA_EXHAUSTED"
  });
});

// Generate Image via Gemini API
app.post("/api/voice-changer", maybeAuthenticate, async (req: any, res) => {
  const { fileData, voice_id, mode, targetLanguage = 'English', sourceLanguage = 'Auto' } = req.body;
  const userId = req.user?.uid;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const creditCost = 10; // Fixed cost for voice changing/dubbing

  if (!fileData) return res.status(400).json({ error: "File data is required" });
  if (!voice_id) return res.status(400).json({ error: "Voice ID is required" });

  // Check file size for guests (100MB limit)
  if (!userId) {
    const base64Length = fileData.length - (fileData.indexOf(',') + 1);
    const sizeInBytes = (base64Length * 3) / 4;
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    if (sizeInBytes > maxSize) {
      return res.status(400).json({ error: "Guest uploads are limited to 100MB. Please sign up for larger files." });
    }

    if (!checkGuestLimit(ip)) {
      return res.status(429).json({ 
        error: "Guest limit reached (10 generations per day). Please sign up for unlimited access and 20,000 free monthly credits!" 
      });
    }
  }

  try {
    if (userId && firestore) {
      const userRef = firestore.collection('users').doc(userId);
      const userDoc = await userRef.get();
      if (!userDoc.exists || (userDoc.data()?.credits || 0) < creditCost) {
        return res.status(403).json({ error: "Insufficient credits" });
      }
      await userRef.update({
        credits: admin.firestore.FieldValue.increment(-creditCost)
      });
    }
  } catch (err: any) {
    console.error("Credit deduction failed:", err);
    return res.status(500).json({ error: "Failed to process credits" });
  }

  const initialTargetVoice = INTERNAL_VOICE_MAPPING[voice_id] || voice_id;
  
  // Extract base64 data and mime type
  const matches = fileData.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) return res.status(400).json({ error: "Invalid file data format" });
  
  const mimeType = matches[1];
  const base64Data = matches[2];

  const maxRetries = 15;
  let attempt = 0;

  while (attempt < maxRetries) {
    const apiKey = getAvailableApiKey();
    if (!apiKey) return res.status(503).json({ error: "All Gemini API keys are currently exhausted." });

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Step 1: Transcribe with Performance Capture
      const prompt = `Transcribe the following audio/video exactly. 
      CRITICAL: Also analyze the vocal characteristics of the speaker.
      Include a "performance_metadata" section at the end that describes:
      1. TONE: (e.g., Aggressive, Kind, Neutral, Emotional)
      2. PACE: (e.g., Fast, Slow, Moderate)
      3. EMPHASIS: (Where did the speaker put stress?)
      
      Return the transcription followed by the performance metadata. 
      If there is no speech, return an empty string.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { parts: [{ text: prompt }, { inlineData: { data: base64Data, mimeType } }] }
        ]
      });

      const fullTranscribedContent = result.text?.trim();
      if (!fullTranscribedContent) {
        console.log("[Voice Changer] No text transcribed or transcription failed.");
        return res.status(400).json({ error: "Could not detect any speech in the uploaded file. Please ensure the audio is clear." });
      }

      // Separate text from metadata for the TTS step
      const logicMatch = fullTranscribedContent.match(/(?:performance_metadata|PERFORMANCE METADATA):?([\s\S]+)$/i);
      const performanceTraits = logicMatch ? logicMatch[1].trim() : "Natural and engaging.";
      const transcribedText = fullTranscribedContent.replace(/(?:performance_metadata|PERFORMANCE METADATA):?[\s\S]+$/i, '').trim();

      console.log(`[Voice Changer] Transcribed text: ${transcribedText.substring(0, 50)}...`);
      console.log(`[Voice Changer] Performance Traits detected: ${performanceTraits}`);

      // Step 2: Generate Speech in Target Voice
      const currentTargetVoice = INTERNAL_VOICE_MAPPING[voice_id] || INTERNAL_VOICE_MAPPING[voice_id.toLowerCase()] || voice_id;
      
      const lookupVoice = (voice_id || '').trim();
      const profile_desc = VOICE_TRAITS[lookupVoice] || 
                      VOICE_TRAITS[Object.keys(VOICE_TRAITS).find(k => k.toLowerCase() === lookupVoice.toLowerCase()) || ''] ||
                      "Balanced professional voice.";

      const userPitch = req.body.pitch || 1.0;
      const ttsSystemInstruction = buildSystemInstruction(targetLanguage === 'Hindi' ? 'hi' : 'en', voice_id);
      
      const performancePrompt = `
      CRITICAL PERFORMANCE FINGERPRINT (MANDATORY MIMICRY):
      ${performanceTraits}
      
      CRITICAL TRANSFORMATION:
      YOU MUST ADAPT THE ABOVE PERFORMANCE INTO THE VOICE OF ${voice_id}.
      - DO NOT keep the original speaker's vocal tone.
      - YOU MUST change the vocal identity ENTIRELY to ${voice_id}.
      - CHARACTER DNA: ${profile_desc}
      - MIMIC the timing and emotion, but VOICED BY ${voice_id}.
      
      The result must be: The EMOTION of the original speaker, but 100% THE VOICE of ${voice_id}.
      
      CRITICAL: Use a very natural, balanced pace. PROJECT the voice forward as if exhaling naturally while speaking. Do NOT pull the voice inward or swallow it. Speak with an open, projected tone. Do not drag. Do not shout. Deliver a professional studio performance.
      `;

      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `${ttsSystemInstruction}\n\n${performancePrompt}\n\nSCRIPT TO PERFORM:\n${transcribedText}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: currentTargetVoice as any }
            }
          }
        }
      });


      const audioData = (ttsResponse as any).audioData || (ttsResponse as any).inlineData?.data || ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!audioData) throw new Error("Failed to generate speech in target voice");

      // Convert PCM to WAV
      const pcmBuffer = Buffer.from(audioData, 'base64');
      const wavBuffer = addWavHeader(pcmBuffer, 24000);
      const finalAudioData = wavBuffer.toString('base64');

      // Save to history if firestore is available
      if (firestore && userId) {
        try {
          await saveToHistory('voice_history', {
            userId,
            text: transcribedText,
            voice_name: voice_id,
            mode,
            targetLanguage,
            audio_data: finalAudioData,
            created_at: admin.firestore.FieldValue.serverTimestamp()
          });
        } catch (saveErr) {
          console.error("Failed to save voice changer history:", saveErr);
        }
      }

      return res.json({ audioData: finalAudioData, transcribedText: transcribedText });
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
      console.error(`Voice Changer Attempt ${attempt + 1} failed:`, errorMessage);
      
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("exhausted") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE")) {
        markKeyAsExhausted(apiKey);
        attempt++;
        const waitTime = (errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE")) ? 2000 : (errorMessage.includes("limit: 10") || errorMessage.includes("day")) ? 500 : 1000 * attempt;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (errorMessage.includes("404") || errorMessage.includes("NOT_FOUND")) {
        attempt++;
        continue;
      }
      return res.status(500).json({ error: errorMessage });
    }
  }

  res.status(503).json({ 
    error: "Failed to process voice change after multiple attempts. All API keys might be exhausted for today.",
    code: "QUOTA_EXHAUSTED"
  });
});

app.post("/api/generate-image", maybeAuthenticate, async (req: any, res) => {
  const { prompt, aspectRatio } = req.body;
  const userId = req.user?.uid;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const creditCost = 20;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // Check guest limit for images
  if (!userId) {
    if (!checkGuestLimit(ip)) {
      return res.status(429).json({ 
        error: "Guest limit reached (10 generations per day). Please sign up for unlimited access and 20,000 free monthly credits!" 
      });
    }
  }

  try {
    if (userId && firestore) {
      const userRef = firestore.collection('users').doc(userId);
      const userDoc = await userRef.get();
      if (!userDoc.exists || (userDoc.data()?.credits || 0) < creditCost) {
        return res.status(403).json({ error: "Insufficient credits" });
      }
      await userRef.update({
        credits: admin.firestore.FieldValue.increment(-creditCost)
      });
    }
  } catch (err: any) {
    console.error("Credit deduction failed:", err);
    return res.status(500).json({ error: "Failed to process credits" });
  }

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    const apiKey = getAvailableApiKey();
    if (!apiKey) {
      return res.status(503).json({ 
        error: "All Gemini API keys are currently exhausted. If you are using the free tier, you may have reached your daily limit. Please try again tomorrow or add more API keys in the settings.",
        code: "QUOTA_EXHAUSTED"
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const imagePrompt = `World-class professional YouTube thumbnail, high-CTR, cinematic lighting, psychological hook visual. ${prompt}. 8k resolution, cinematic composition, vibrant colors, trending on ArtStation style, highly detailed, sharp focus.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ text: imagePrompt }],
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || '16:9',
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
      return res.json({ imageUrl });
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
      console.error(`Image generation attempt ${attempt + 1} failed:`, errorMessage);
      
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("exhausted") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE")) {
        markKeyAsExhausted(apiKey);
        attempt++;
        const waitTime = (errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE")) ? 2000 : (errorMessage.includes("limit: 10") || errorMessage.includes("day")) ? 500 : 1000 * attempt;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (errorMessage.includes("404") || errorMessage.includes("NOT_FOUND")) {
        attempt++;
        continue;
      }
      return res.status(500).json({ error: errorMessage });
    }
  }

  res.status(503).json({ 
    error: "Failed to generate image after multiple attempts. All API keys might be exhausted.",
    code: "QUOTA_EXHAUSTED"
  });
});

// Helper to add WAV header to PCM data
function addWavHeader(pcmData: Buffer, sampleRate: number): Buffer {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmData.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // Mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // Byte rate
  header.writeUInt16LE(2, 32); // Block align
  header.writeUInt16LE(16, 34); // Bits per sample
  header.write('data', 36);
  header.writeUInt32LE(pcmData.length, 40);
  return Buffer.concat([header, pcmData]);
}

// Preview Voice via Gemini API
app.post("/api/preview-voice", async (req: any, res) => {
  const { voice_id, voice_name } = req.body;
  if (!voice_id) return res.status(400).json({ error: "Voice ID is required" });
  if (voice_id === 'original') return res.status(400).json({ error: "Original Voice preview is not available." });

  const targetVoice = INTERNAL_VOICE_MAPPING[voice_id] || INTERNAL_VOICE_MAPPING[voice_name] || voice_id;

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    const apiKey = getAvailableApiKey();
    if (!apiKey) {
      return res.status(503).json({ 
        error: "All Gemini API keys are currently exhausted. If you are using the free tier, you may have reached your daily limit. Please try again tomorrow or add more API keys in the settings.",
        code: "QUOTA_EXHAUSTED"
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const languagePreviews: Record<string, string> = {
        'arav-neutral-pro': 'आज हम एक ऐसी चीज़ के बारे में बात करेंगे जो आपकी ज़िंदगी को बेहतर बना सकती है। अगर आप इसे सही तरीके से समझ लें, तो इसका असर लंबे समय तक रहेगा।',
        'dev-deep-real': 'कई बार हम चीज़ों को हल्के में ले लेते हैं। लेकिन सच यह है कि छोटे decisions ही बड़े परिणाम तय करते हैं।',
        'neel-soft-connect': 'देखो, अगर आप थोड़ा सा ध्यान दें, तो ये चीज़ काफी आसान हो सकती है। बस consistency बनाए रखना ज़रूरी है।',
        'raj-classic-narrator': 'उस दिन जो हुआ, उसने सब कुछ बदल दिया। किसी ने सोचा भी नहीं था कि एक छोटा सा फैसला इतनी बड़ी कहानी बन जाएगा।',
        'tamil-preview': 'வணக்கம், நான் வோக்ஸ்நோவாவின் தொழில்முறை குரல்களில் ஒருவன். உங்கள் வீடியோக்களுக்கு சிறந்த குரலை வழங்க நான் தயார்.'
      };

      const previewText = languagePreviews[voice_id] || (req.body.language === 'ta' ? languagePreviews['tamil-preview'] : `Say: Hi, I'm ${voice_name}. I'm one of the professional voices at VoxNova.`);

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: previewText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: targetVoice as any }
            }
          }
        }
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("No audio data returned from Gemini");
      
      // Convert PCM to WAV
      const pcmBuffer = Buffer.from(base64Audio, 'base64');
      const wavBuffer = addWavHeader(pcmBuffer, 24000);
      return res.json({ audioData: wavBuffer.toString('base64') });
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
      console.error(`Preview voice attempt ${attempt + 1} failed:`, errorMessage);
      
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("exhausted") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE")) {
        markKeyAsExhausted(apiKey);
        attempt++;
        const waitTime = (errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE")) ? 2000 : (errorMessage.includes("limit: 10") || errorMessage.includes("day")) ? 500 : 1000 * attempt;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (errorMessage.includes("404") || errorMessage.includes("NOT_FOUND")) {
        attempt++;
        continue;
      }
      return res.status(500).json({ error: errorMessage });
    }
  }

  res.status(503).json({ 
    error: "Failed to generate preview after multiple attempts. All API keys might be exhausted.",
    code: "QUOTA_EXHAUSTED"
  });
});
// Classify Script to suggest a voice
app.post("/api/classify-script", maybeAuthenticate, async (req: any, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  const apiKey = getAvailableApiKey();
  if (!apiKey) return res.status(503).json({ error: "API keys exhausted" });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Analyze the following script and suggest the best voice category from this list: "Motivational", "Mysterious", "Legendary", "Professional", "Energetic".
    Script: "${text}"
    Return ONLY the category name.`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const category = result.text?.trim() || "Professional";
    
    // Map category to voice ID
    let suggestedVoiceId = 'leo';
    if (category.includes("Motivational")) suggestedVoiceId = 'sultan';
    else if (category.includes("Mysterious")) suggestedVoiceId = 'vikram';
    else if (category.includes("Legendary")) suggestedVoiceId = 'bharat';
    else if (category.includes("Professional")) suggestedVoiceId = 'pankaj';
    else if (category.includes("Energetic")) suggestedVoiceId = 'titan';

    res.json({ category, suggestedVoiceId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Save generation to history & Deduct Credits
app.post("/api/voice-changer-save", authenticate, async (req: any, res) => {
  const { transcribedText, voice_id, audioData, creditCost } = req.body;
  const userId = req.user.uid;

  try {
    if (!firestore) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }
    const userRef = firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    const userEmail = req.user.email;
    const isWhitelisted = userEmail && WHITELISTED_EMAILS.includes(userEmail);

    if (!userDoc.exists || ((userDoc.data()?.credits || 0) < (creditCost || 0) && !isWhitelisted)) {
      return res.status(403).json({ error: "Insufficient credits" });
    }

    // Deduct credits
    if (!isWhitelisted) {
      await userRef.update({
        credits: admin.firestore.FieldValue.increment(-(creditCost || 0))
      });
    }

    // Save to History using chunked helper
    try {
      await saveToHistory('voice_history', {
        userId,
        text: transcribedText,
        voice_name: voice_id,
        audio_data: audioData,
        mode: 'convert',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
      res.json({ success: true });
    } catch (saveError) {
      console.error("Failed to chunks audio for voice changer:", saveError);
      res.status(500).json({ error: "Failed to save audio history. Please try a shorter script." });
    }
  } catch (error: any) {
    console.error("Failed to save voice changer history:", error);
    res.status(500).json({ error: "Failed to save history" });
  }
});

app.post(["/api/save", "/api/save/"], authenticate, async (req: any, res) => {
  const { text, voice, style, speed, pitch, audioData, creditCost, type, words } = req.body;
  const userId = req.user.uid;

  if (!audioData && type !== 'caption') {
    return res.status(400).json({ error: "Audio data is required" });
  }

  try {
    if (!firestore) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }
    const userRef = firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const userEmail = req.user.email;
    const isWhitelisted = userEmail && WHITELISTED_EMAILS.includes(userEmail);
    
    if (!userDoc.exists || ((userData?.credits || 0) < (creditCost || 0) && !isWhitelisted)) {
      return res.status(403).json({ error: "Insufficient credits" });
    }

    // Deduct credits if not whitelisted
    const isPremiumVoice = voice && ['Bella', 'Documentary Pro', 'Pankaj', 'SULTAN', 'SHERA', 'KAAL', 'BHEEM', 'SIKANDAR', 'VIKRAM', 'Munna Bhai', 'Sachinboy', 'MAHARAJA'].includes(voice);
    const isFreePlan = !userData?.plan || userData?.plan === 'free';
    
    const updateData: any = {};
    if (!isWhitelisted) {
      updateData.credits = admin.firestore.FieldValue.increment(-(creditCost || 0));
      if (isPremiumVoice && isFreePlan) {
        updateData.premium_usage_count = admin.firestore.FieldValue.increment(1);
      }
    }

    if (Object.keys(updateData).length > 0) {
      await userRef.update(updateData);
    }
    
      // Save to Firestore (History)
      const collectionName = type === 'caption' ? 'caption_history' : 'voice_history';
      const docRef = await saveToHistory(collectionName, {
        userId,
        text: text || '',
        voice_name: voice || (type === 'caption' ? 'Captions' : 'Unknown'),
        style: style || 'Default',
        speed: speed || 1.0,
        pitch: pitch || 1.0,
        audio_data: audioData || null,
        type: type || 'tts',
        words: words || null,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({ success: true, id: docRef ? docRef.id : null });
  } catch (error: any) {
    console.error("Database save error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generate Captions via Gemini API
app.post("/api/generate-captions", maybeAuthenticate, async (req: any, res) => {
  const { videoData, language, scriptType = 'hindi', translateToEnglish = false } = req.body;
  const userId = req.user?.uid;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const creditCost = 5;

  if (!videoData) {
    return res.status(400).json({ error: "Video data is required" });
  }

  // Check file size for guests (100MB limit)
  if (!userId) {
    const base64Length = videoData.length - (videoData.indexOf(',') + 1);
    const sizeInBytes = (base64Length * 3) / 4;
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    if (sizeInBytes > maxSize) {
      return res.status(400).json({ error: "Guest uploads are limited to 100MB. Please sign up for larger files." });
    }

    if (!checkGuestLimit(ip)) {
      return res.status(429).json({ 
        error: "Guest limit reached (10 generations per day). Please sign up for unlimited access and 20,000 free monthly credits!" 
      });
    }
  }

  try {
    if (userId && firestore) {
      const userRef = firestore.collection('users').doc(userId);
      const userDoc = await userRef.get();
      if (!userDoc.exists || (userDoc.data()?.credits || 0) < creditCost) {
        return res.status(403).json({ error: "Insufficient credits" });
      }
      await userRef.update({
        credits: admin.firestore.FieldValue.increment(-creditCost)
      });
    }
  } catch (err: any) {
    console.error("Credit deduction failed:", err);
    return res.status(500).json({ error: "Failed to process credits" });
  }

  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    const apiKey = getAvailableApiKey();
    if (!apiKey) {
      return res.status(503).json({ error: "All Gemini API keys are currently exhausted." });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const scriptInstruction = language === 'Hindi' 
        ? (scriptType === 'hinglish' ? "CRITICAL: Write the Hindi captions using English script (Hinglish). Example: 'Namaste dosto'." : "CRITICAL: Write the Hindi captions using Devanagari script (Hindi). Example: 'नमस्ते दोस्तों'.")
        : "";

      const prompt = `Transcribe this video precisely with word-level timestamps in seconds.
      
      CONTENT LANGUAGE: ${language}.
      ${scriptInstruction}
      ${translateToEnglish ? "CRITICAL: Output the transcription translated in English." : ""}
      
      OUTPUT FORMAT: A JSON array of word objects.
      Schema: [{"word": string, "start": number, "end": number}]
      
      Return ONLY the JSON array. NO MARKDOWN. NO text outside the array.`;

      const videoBase64 = videoData.split(',')[1] || videoData;
      
      console.log(`[Captions] Processing with Gemini 3 for ${language}...`);

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "video/mp4",
                  data: videoBase64
                }
              }
            ]
          }
        ],
        config: {
          temperature: 0.1,
          responseMimeType: "application/json",
        }
      });


      let responseText = "";
      try {
        // Handle GenerateContentResponse structure
        const anyResult = result as any;
        if (typeof anyResult.text === 'function') {
          responseText = anyResult.text();
        } else if (anyResult.response && typeof anyResult.response.text === 'function') {
           responseText = anyResult.response.text();
        } else {
           responseText = anyResult.text || "";
        }
      } catch (e) {
         console.error("[Captions] AI Content extraction error:", e);
         responseText = (result as any).text || "";
      }

      if (!responseText) {
        throw new Error("AI returned empty transcription result.");
      }

      let words;
      try {
        // Find the broad JSON array pattern
        const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          words = JSON.parse(jsonMatch[0]);
        } else {
          // Try cleaning markdown
          const cleaned = responseText.trim().replace(/^```json\s*|```$/g, '');
          words = JSON.parse(cleaned);
        }
      } catch (e) {
        console.error("[Captions] Parsing failed. Raw response:", responseText.substring(0, 500));
        throw new Error("Transcription format error. Please try again.");
      }

      if (!Array.isArray(words)) {
        throw new Error("Invalid format: AI response was not an array.");
      }

      console.log(`[Captions] Successfully generated ${words.length} words.`);
      
      // Save to history (Background)
      if (firestore) {
        saveToHistory('caption_history', {
          userId,
          words,
          language,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        }).catch(e => console.error("History save failed:", e));
      }

      return res.status(200).json({ words });
    } catch (error: any) {
      console.error(`[Captions] Attempt ${attempt + 1} failed:`, error.message);
      
      if (error.message?.includes("Resource has been exhausted") || error.message?.includes("429")) {
        markKeyAsExhausted(apiKey);
        attempt++;
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }

      if (error.message?.includes("deadlines") || error.message?.includes("timeout") || error.message?.includes("504")) {
         attempt++;
         await new Promise(r => setTimeout(r, 2000));
         continue;
      }
      
      return res.status(500).json({ 
        error: "Transcription failed", 
        message: error.message || "An unexpected error occurred during processing."
      });
    }
  }

  res.status(503).json({ error: "Failed to generate captions after multiple attempts." });
});

app.get(["/api/history", "/api/history/"], authenticate, async (req: any, res) => {
  const userId = req.user.uid;
  try {
    if (!firestore) {
      // Fallback to SQLite if Firestore is not available
      const rows = db.prepare("SELECT * FROM generations WHERE user_id = ? ORDER BY created_at DESC LIMIT 50").all(userId);
      return res.json(rows);
    }

    const voiceHistory = await firestore.collection('voice_history')
      .where('userId', '==', userId)
      .limit(500)
      .get();

    const captionHistory = await firestore.collection('caption_history')
      .where('userId', '==', userId)
      .limit(500)
      .get();

    const history = [
      ...voiceHistory.docs.map(doc => {
        const data = doc.data();
        // Handle migration from 'timestamp' to 'created_at'
        const rawDate = data.created_at || data.timestamp;
        let isoDate = new Date().toISOString();
        if (rawDate) {
          if (typeof rawDate.toDate === 'function') {
            isoDate = rawDate.toDate().toISOString();
          } else if (typeof rawDate === 'string') {
            isoDate = rawDate;
          } else if (rawDate._seconds) {
            isoDate = new Date(rawDate._seconds * 1000).toISOString();
          }
        }
        return { 
          id: doc.id, 
          type: 'voice', 
          ...data,
          created_at: isoDate
        };
      }),
      ...captionHistory.docs.map(doc => {
        const data = doc.data();
        const rawDate = data.created_at || data.timestamp;
        let isoDate = new Date().toISOString();
        if (rawDate) {
          if (typeof rawDate.toDate === 'function') {
            isoDate = rawDate.toDate().toISOString();
          } else if (typeof rawDate === 'string') {
            isoDate = rawDate;
          } else if (rawDate._seconds) {
            isoDate = new Date(rawDate._seconds * 1000).toISOString();
          }
        }
        return { 
          id: doc.id, 
          type: 'caption', 
          ...data,
          created_at: isoDate
        };
      })
    ].sort((a: any, b: any) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });

    res.json(history);
  } catch (error: any) {
    console.error("[History] Fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/history/:id", authenticate, async (req: any, res) => {
  const userId = req.user.uid;
  const { id } = req.params;
  const { type } = req.query; // 'voice' or 'caption'

  try {
    if (firestore && type) {
      const collectionName = type === 'voice' ? 'voice_history' : 'caption_history';
      const docRef = firestore.collection(collectionName).doc(id);
      const doc = await docRef.get();
      
      if (doc.exists && doc.data()?.userId === userId) {
        await docRef.delete();
        return res.json({ success: true });
      }
    }

    // Fallback or SQLite
    db.prepare("DELETE FROM generations WHERE id = ? AND user_id = ?").run(id, userId);
    res.json({ success: true });
  } catch (error: any) {
    console.error("[History] Delete error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Error Handler (Always return JSON for API requests)
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global Error Handler:", err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    error: err.message || "An unexpected error occurred",
    code: err.code || "INTERNAL_ERROR"
  });
});

// Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
