import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import admin from "firebase-admin";
import cookieParser from "cookie-parser";
import Razorpay from "razorpay";
import crypto from "crypto";

dotenv.config();

// API Key Rotation Logic
const exhaustedKeys = new Map<string, number>();

const getAvailableApiKey = () => {
  const baseKey = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
  if (!baseKey) return null;
  
  const allKeys = Array.from(new Set(baseKey.split(',').map(k => k.trim()).filter(k => k.length > 0)));
  const now = Date.now();
  
  // Filter out keys that are exhausted and still in the cooldown period (2 minutes)
  const availableKeys = allKeys.filter(k => {
    const exhaustedAt = exhaustedKeys.get(k);
    if (!exhaustedAt) return true;
    if (now - exhaustedAt > 120000) {
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

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Initialize Firebase Admin
let firestore: admin.firestore.Firestore;

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
  'rudra': 'Fenrir', 'RUDRA': 'Fenrir'
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
        privateKey = privateKey.replace(/\\n/g, '\n');
        
        // Ensure the key has the correct PEM headers and footers
        if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
          privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
        }
        
        if (!privateKey.includes('-----END PRIVATE KEY-----')) {
          privateKey = `${privateKey}\n-----END PRIVATE KEY-----`;
        }

        // Final cleanup: ensure no double headers/footers and correct newline placement
        privateKey = privateKey.replace(/(-----BEGIN PRIVATE KEY-----)+/g, '-----BEGIN PRIVATE KEY-----');
        privateKey = privateKey.replace(/(-----END PRIVATE KEY-----)+/g, '-----END PRIVATE KEY-----');
        
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
    
    firestore = admin.firestore();
    if (databaseId) {
      console.log(`Firestore initialized. Note: Using default database for admin SDK (databaseId ${databaseId} was provided but admin.firestore() currently uses default).`);
    } else {
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

app.use(express.json({ limit: '100mb' })); // Increased limit for video files
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
const guestRateLimit = new Map<string, { count: number, lastReset: number }>();

const checkGuestLimit = (ip: string) => {
  const now = Date.now();
  const limit = guestRateLimit.get(ip);
  
  if (!limit || now - limit.lastReset > 24 * 60 * 60 * 1000) {
    // Reset limit every 24 hours
    guestRateLimit.set(ip, { count: 1, lastReset: now });
    return true;
  }
  
  if (limit.count >= 10) { // 10 generations per day for guests
    return false;
  }
  
  limit.count++;
  guestRateLimit.set(ip, limit);
  return true;
};

// Generate Speech via Gemini API (Guest)
app.post("/api/generate-speech-guest", async (req: any, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  if (!checkGuestLimit(ip)) {
    return res.status(429).json({ 
      error: "Guest limit reached (10 generations per day). Please sign up for unlimited access and 20,000 free monthly credits!" 
    });
  }

  const { text, voice_name, style, speed, pitch, language, studioClarity, pause } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  // Limit text length for guests to prevent abuse
  if (text.length > 200) {
    return res.status(400).json({ error: "Guest scripts are limited to 200 characters. Please sign up for longer scripts." });
  }

  const maxRetries = 15;
  let attempt = 0;

  while (attempt < maxRetries) {
    const apiKey = getAvailableApiKey();
    
    if (!apiKey) {
      return res.status(503).json({ error: "All Gemini API keys are currently exhausted. Please try again in a few minutes." });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const voiceMapping: Record<string, string> = {
        'Adam': 'Puck', 'Brian': 'Charon', 'Daniel': 'Fenrir', 'Josh': 'Puck',
        'Liam': 'Charon', 'Michael': 'Fenrir', 'Ryan': 'Puck', 'Matthew': 'Charon',
        'Bill': 'Fenrir', 'Callum': 'Puck', 'Frank': 'Zephyr', 'Marcus': 'Charon',
        'Jessica': 'Kore', 'Sarah': 'Zephyr', 'Matilda': 'Kore', 'Emily': 'Zephyr',
        'Bella': 'Kore', 'Rachel': 'Zephyr', 'Nicole': 'Kore', 'Clara': 'Zephyr',
        'Documentary Pro': 'Charon', 'Atlas (Do)': 'Fenrir', 'Priyanka': 'Zephyr', 'Virat': 'Charon',
        'SULTAN': 'Fenrir', 'SHERA': 'Fenrir', 'KAAL': 'Charon', 'BHEEM': 'Fenrir', 'SIKANDAR': 'Charon',
        'EMPEROR PRO': 'Fenrir', 'KABIR': 'Charon', 'ARYAN': 'Puck', 'ISHANI': 'Kore', 'ZORAVAR': 'Fenrir', 'RUDRA': 'Fenrir',
        'Munna Bhai': 'Zephyr', 'Sachinboy': 'Fenrir', 'MAHARAJA': 'Fenrir'
      };

      const targetVoice = voiceMapping[voice_name] || 'Puck';
      
      const isHeavyVoice = ['SULTAN', 'SHERA', 'KAAL', 'BHEEM', 'SIKANDAR', 'Pankaj', 'Virat', 'Frank', 'VIKRAM', 'Munna Bhai', 'Sachinboy', 'MAHARAJA', 'EMPEROR PRO', 'ZORAVAR', 'RUDRA'].includes(voice_name);
      
      const systemInstruction = `You are an elite, world-class professional voice actor and narrator. Your task is to provide a stunningly realistic, human-like, and emotionally resonant performance in ${language === 'hi' ? 'Hindi' : 'English'}. 
      
      Your goal is to generate high-fidelity, natural, and expressive speech that rivals ElevenLabs.
      Analyze the script's category and tone to determine the best vocal characteristics:
      - NEWS/DOCUMENTARY: Authoritative, clear, professional, steady pace.
      - STORY/NARRATION: Expressive, rhythmic, engaging, varies pitch for characters.
      - ADVERTISEMENT: Energetic, persuasive, upbeat, clear call to action.
      - CONVERSATIONAL: Natural, relaxed, includes subtle breaths and realistic pauses.
      - EMOTIONAL: Deeply felt, matches the specific emotion (sad, happy, angry).
      
      PERFORMANCE GUIDELINES:
      - Use natural human prosody, complex intonation, and realistic rhythm.
      - Maintain a perfect balance between speed and clarity. Emotion must be deeply integrated into every word.
      - 100% REALISM AND EMOTIONAL DEPTH ARE MANDATORY.
      ${isHeavyVoice ? '- CRITICAL: Use an ULTRA-DEEP, HEAVY, AND POWERFUL CHEST VOICE with MAXIMUM BASS RESONANCE. The voice must sound "Bhari" (Heavy), "Gambhir" (Serious/Deep), and "Damdaar" (Powerful). Sound like a legendary warrior or a king.' : '- CRITICAL: Use a DEEP CHEST VOICE with BASS RESONANCE.'}
      - Incorporate a vibrating 'gravelly' texture (vocal fry) in every word to sound 100% mature and authoritative.
      - Add subtle, natural human imperfections like light breaths and realistic mouth sounds to achieve 100% realism.
      - Avoid any robotic, monotone, or repetitive cadence.
      - For ${language === 'hi' ? 'Hindi' : 'English'}, ensure perfect native pronunciation, natural flow, and cultural nuance.
      - Sound like a real person speaking in a high-end professional studio, not a computer.
      - Pay close attention to the emotional weight of the text.
      - Use natural emphasis on key words to convey meaning and emotion.
      - Ensure smooth transitions between sentences and ideas.
      ${isHeavyVoice ? '- The voice should sound 100% testosterone-driven—heavy, slow-paced, and cinematic. It must be the deepest, most powerful male voice possible.' : '- The voice should sound professional, mature, and cinematic.'}
      
      TECHNICAL STANDARDS (CRITICAL FOR LONG GENERATIONS):
      - NO background noise, hums, hissing, or digital artifacts.
      - NO robotic glitches, metallic sounds, or synthetic "buzzing".
      - NO background music, bell-like sounds, or hallucinations in the background.
      - ZERO background noise is mandatory. Audio must be 100% clean and professional.
      - Ensure crystal-clear, 48kHz studio-quality audio throughout the entire generation.
      - If the script is long, maintain consistent tone and quality from start to finish.
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
        'SULTAN': 'The Warrior. Ultra-deep, heavy bass, commanding. Every word vibrates with power. Sound like a powerful king or a legendary wrestler. Maximum chest resonance and vocal fry. 100% Realistic.',
        'SHERA': 'The Motivator. Aggressive, deep, and powerful. Raw testosterone-driven male voice. Extremely heavy and powerful. 100% Realistic.',
        'KAAL': 'The Dark Voice. Mysterious, cinematic, and ultra-low frequency. Dark, mysterious, and grave undertone. Perfect for villains. 100% Realistic.',
        'BHEEM': 'The Giant. Super-heavy baritone, larger-than-life resonance. Sounds like the ground is shaking. Deepest possible frequency. 100% Realistic.',
        'SIKANDAR': 'The Legend. Mature, wise, and incredibly powerful. Rich bass for professional and authoritative narration. Respectful yet commanding. 100% Realistic.',
        'VIKRAM': 'The Dark Narrator. Mysterious, deep, smooth, and cinematic. Dark, mysterious undertone. 100% Realistic.',
        'Sachinboy': 'The Heavyweight Champion. A monstrous, chest-rattling deep baritone with explosive, fearless energy. 100% Realistic and Professional.',
        'EMPEROR PRO': 'The King of Voices. The most powerful, authoritative, and legendary deep baritone ever created. Commands absolute respect. 100% Realistic.',
        'KABIR': 'The Storyteller. A warm, wise, and deeply resonant voice. Perfect for historical narratives and soulful storytelling. 100% Realistic.',
        'ARYAN': 'The Fitness Coach. High-energy, sharp, and commanding. Designed for gym motivation and sports commentary. 100% Realistic.',
        'ISHANI': 'The Elegant Narrator. Smooth, sophisticated, and professional female voice. Ideal for luxury brands and high-end documentaries. 100% Realistic.',
        'ZORAVAR': 'The Heavyweight. An ultra-deep, chest-rattling baritone with immense power. 100% Realistic.',
        'RUDRA': 'The Intense Narrator. Gritty, serious, and highly authoritative. Best for crime thrillers and investigative content. 100% Realistic.'
      };

      promptPrefix += `${voiceTraits[voice_name] || ''} `;

      promptPrefix += `
      CRITICAL PERFORMANCE GUIDELINES FOR 100% REALISM:
      1. NATURAL PROSODY: Avoid a flat or robotic monotone. Vary the pitch, volume, and rhythm naturally based on the content's meaning. Use rising and falling intonation to sound conversational.
      2. HUMAN-LIKE PAUSES: Add subtle, natural pauses at commas, periods, and between major ideas. Use micro-pauses for emphasis and to simulate natural thought processes.
      3. EMOTIONAL INFLECTION: Infuse the voice with genuine emotion that matches the script's context (e.g., excitement, gravity, warmth, curiosity). The emotion should feel "lived-in" and authentic.
      4. CLEAR ARTICULATION: Ensure every word is pronounced clearly but naturally, avoiding over-enunciation that sounds artificial. Use natural elisions where appropriate for a native-like flow.
      5. BREATHING & TEXTURE: Aim for a voice that sounds like it's coming from a human throat, with natural vocal texture, subtle breathing, and realistic mouth sounds where they add to the realism.
      6. NATIVE FLOW: For ${language === 'hi' ? 'Hindi' : 'English'}, use the natural flow, idioms, and emphasis patterns of a native speaker. The rhythm should be fluid and effortless.
      `;

      if (language === 'hi') {
        promptPrefix += "CRITICAL: For Hindi, ensure natural 'Schwa deletion' where appropriate, correct aspiration of consonants, and natural sentence-ending intonation. Avoid a 'reading' tone; instead, sound like a native speaker in a natural conversation. ";
      }

      if (style === 'professional-auto') {
        try {
          const analysisResponse = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ parts: [{ text: `Analyze the following script and determine its category (e.g., Documentary, Fitness, Motivation, Story, News, Corporate) and the ideal vocal tone, pace, and emotional weight. Provide a brief professional instruction for a voice actor to perform this script perfectly.
            
            SCRIPT:
            ${text}` }] }]
          });
          const analysis = analysisResponse.text;
          promptPrefix += `PROFESSIONAL SCRIPT ANALYSIS & INSTRUCTIONS: ${analysis} 
          CRITICAL: Perform this script with 100% realism, matching the analyzed tone and category perfectly. Use natural human prosody and emotional depth. `;
        } catch (analysisError) {
          console.error("Script analysis failed, falling back to general professional style:", analysisError);
          promptPrefix += "Use a highly professional, balanced, and realistic narrator tone suitable for this script. ";
        }
      }

      if (style === 'documentary' || style === 'doc-pro' || voice_name === 'Documentary Pro' || style === 'cinematic' || style === 'authoritative') {
        promptPrefix += `You are a world-class cinematic ${style === 'authoritative' ? 'authoritative' : 'documentary'} narrator. Your voice is deep, mature, intelligent, and ${style === 'authoritative' ? 'highly authoritative' : 'cinematic'}, similar to National Geographic or a premium Netflix documentary. 
        
        CRITICAL INSTRUCTIONS FOR THIS PERFORMANCE:
        1. BASE TONE: ${style === 'authoritative' ? 'Commanding, serious, and powerful' : 'Calm, deep, and controlled'} storytelling with perfect ${language === 'hi' ? 'Hindi' : 'English'} native pronunciation.
        2. EMOTIONAL MODULATION: 
           - For normal parts: ${style === 'authoritative' ? 'Firm and decisive' : 'Calm, steady, and informative'}.
           - For suspense: Slow down slightly, add dramatic pauses, and sound mysterious.
           - For intense/war parts: Sound stronger, brave, and commanding.
           - For emotional parts: Sound warm, respectful, and inspiring.
           - For big reveals: Pause briefly before the sentence, then speak slower and deeper for impact.
        3. DELIVERY: Natural storytelling flow, NOT robotic. Use human-like pauses, subtle breathing, and natural emphasis.
        4. PACING: ${style === 'authoritative' ? 'Slow and deliberate' : 'Medium pace generally'}, but slow down for dramatic effect.
        5. QUALITY: Studio-grade, clean audio. NO background noise or glitches.`;
      } else if (style === 'emotional') {
        promptPrefix += `Use a voice filled with deep feeling, expression, and appropriate pauses to convey profound emotion. `;
      } else if (style === 'storytelling') {
        promptPrefix += `Use a rhythmic, engaging, and warm tone to bring the narrative to life. `;
      } else if (style === 'motivational') {
        promptPrefix += `Use a strong, inspiring, and energetic tone to uplift and empower the audience. `;
      }

      if (pitch > 1.3) promptPrefix += "Use a very high, bright, and sharp pitch. ";
      else if (pitch > 1.1) promptPrefix += "Use a slightly higher, more youthful and energetic pitch. ";
      else if (pitch < 0.7) promptPrefix += "Use a very deep, bassy, and low-frequency pitch. ";
      else if (pitch < 0.9) promptPrefix += "Use a slightly deeper, more mature and resonant pitch. ";

      promptPrefix += `CRITICAL: Speak at exactly ${speed}x speed. `;
      
      // Voice-specific speed normalization
      if (['Puck', 'Charon'].includes(targetVoice)) {
        promptPrefix += "Note: This voice is naturally brisk, so ensure the pacing feels controlled and not rushed. ";
      } else if (['Fenrir'].includes(targetVoice)) {
        promptPrefix += "Note: This voice is naturally slow and deep, so ensure it doesn't become too sluggish. ";
      }

      if (speed >= 1.4) {
        promptPrefix += "PERFORMANCE: Deliver a professional, high-energy, and fast-paced narration. Maintain absolute naturalness, clarity, and perfect articulation. This is a high-speed, professional Level 2 narrator style. ";
      } else if (speed > 1.0) {
        promptPrefix += "PERFORMANCE: Deliver a professional, brisk, and energetic narration. The pace should be slightly faster than normal but still feel completely natural and easy to follow. Perfect for engaging social media content. ";
      } else if (speed <= 0.7) {
        promptPrefix += "PERFORMANCE: Deliver a professional, steady, and deliberate narration. The pace should be slightly slower than normal to emphasize every word, while maintaining a natural flow and professional tone. ";
      } else if (speed < 1.0) {
        promptPrefix += "PERFORMANCE: Deliver a professional, calm, and steady narration. The pace should be relaxed and clear, perfect for educational or long-form storytelling content. ";
      } else {
        promptPrefix += "PERFORMANCE: Deliver a professional, brisk, and natural performance. The narrator should speak with perfect clarity and articulation, at a pace that is naturally fast but conversational and engaging. This is a professional Level 1 narrator style. ";
      }
      
      if (pause > 0.1) {
        promptPrefix += `Add a natural pause of exactly ${pause} seconds between every sentence and major phrase to ensure clarity and professional pacing. `;
      }
      
      promptPrefix += "CRITICAL: The audio must be 100% clean with ZERO background noise, ZERO hissing, and ZERO static. ";
      
      const currentPrompt = attempt === 0 
        ? `${systemInstruction}\n\n${promptPrefix}\n\nSCRIPT TO PERFORM:\n${text}\n\nCRITICAL: Some voices have a naturally faster or slower base pace. You MUST adjust the character's natural speed to ensure the FINAL output matches the requested ${speed}x speed perfectly. If the voice is naturally slow, speed it up more; if naturally fast, slow it down to hit the target pace. Respect all punctuation and deliver the script with natural, professional flow.`
        : `CRITICAL: The previous attempt sounded slightly robotic. Please deliver a MORE HUMAN, MORE REALISTIC performance for this script in ${language === 'hi' ? 'Hindi' : 'English'}. Use natural breathing and prosody:\n\n${text}`;

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

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        return res.json({ audioData });
      } else {
        throw new Error("No audio data generated");
      }
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
      console.error(`TTS Attempt ${attempt + 1} failed:`, errorMessage);
      
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("exhausted") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("404") || errorMessage.includes("NOT_FOUND")) {
        if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("exhausted") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
          markKeyAsExhausted(apiKey);
        }
        attempt++;
        // Add a small delay before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      return res.status(500).json({ error: errorMessage });
    }
  }

  res.status(503).json({ error: "Failed to generate speech after multiple attempts with different API keys." });
});

// Generate Speech via Gemini API (Authenticated)
app.post("/api/generate-speech", maybeAuthenticate, async (req: any, res) => {
  const { text, voice_name, style, speed, pitch, language, studioClarity, pause } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  // Rate limit for guests
  if (!req.user) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    if (!checkGuestLimit(ip as string)) {
      return res.status(429).json({ error: "Daily limit reached for guest users. Please sign up for more." });
    }
  }

  const maxRetries = 15;
  let attempt = 0;

  while (attempt < maxRetries) {
    const apiKey = getAvailableApiKey();
    
    if (!apiKey) {
      return res.status(503).json({ error: "All Gemini API keys are currently exhausted. Please try again in a few minutes." });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const targetVoice = INTERNAL_VOICE_MAPPING[voice_name] || 'Puck';
      
      const isHeavyVoice = ['SULTAN', 'SHERA', 'KAAL', 'BHEEM', 'SIKANDAR', 'Pankaj', 'Virat', 'Frank', 'VIKRAM', 'Munna Bhai', 'Sachinboy', 'MAHARAJA', 'EMPEROR PRO', 'ZORAVAR', 'RUDRA'].includes(voice_name);
      
      const systemInstruction = `You are an elite, world-class professional voice actor and narrator. Your task is to provide a stunningly realistic, human-like, and emotionally resonant performance in ${language === 'hi' ? 'Hindi' : 'English'}. 
      
      Your goal is to generate high-fidelity, natural, and expressive speech that rivals ElevenLabs.
      Analyze the script's category and tone to determine the best vocal characteristics:
      - NEWS/DOCUMENTARY: Authoritative, clear, professional, steady pace.
      - STORY/NARRATION: Expressive, rhythmic, engaging, varies pitch for characters.
      - ADVERTISEMENT: Energetic, persuasive, upbeat, clear call to action.
      - CONVERSATIONAL: Natural, relaxed, includes subtle breaths and realistic pauses.
      - EMOTIONAL: Deeply felt, matches the specific emotion (sad, happy, angry).
      
      PERFORMANCE GUIDELINES:
      - Use natural human prosody, complex intonation, and realistic rhythm.
      - Maintain a perfect balance between speed and clarity. Emotion must be deeply integrated into every word.
      - 100% REALISM AND EMOTIONAL DEPTH ARE MANDATORY.
      ${isHeavyVoice ? '- CRITICAL: Use an ULTRA-DEEP, HEAVY, AND POWERFUL CHEST VOICE with MAXIMUM BASS RESONANCE. The voice must sound "Bhari" (Heavy), "Gambhir" (Serious/Deep), and "Damdaar" (Powerful). Sound like a legendary warrior or a king.' : '- CRITICAL: Use a DEEP CHEST VOICE with BASS RESONANCE.'}
      - Incorporate a vibrating 'gravelly' texture (vocal fry) in every word to sound 100% mature and authoritative.
      - Add subtle, natural human imperfections like light breaths and realistic mouth sounds to achieve 100% realism.
      - Avoid any robotic, monotone, or repetitive cadence.
      - For ${language === 'hi' ? 'Hindi' : 'English'}, ensure perfect native pronunciation, natural flow, and cultural nuance.
      - Sound like a real person speaking in a high-end professional studio, not a computer.
      - Pay close attention to the emotional weight of the text.
      - Use natural emphasis on key words to convey meaning and emotion.
      - Ensure smooth transitions between sentences and ideas.
      ${isHeavyVoice ? '- The voice should sound 100% testosterone-driven—heavy, slow-paced, and cinematic. It must be the deepest, most powerful male voice possible.' : '- The voice should sound professional, mature, and cinematic.'}
      
      TECHNICAL STANDARDS (CRITICAL FOR LONG GENERATIONS):
      - NO background noise, hums, hissing, or digital artifacts.
      - NO robotic glitches, metallic sounds, or synthetic "buzzing".
      - NO background music, bell-like sounds, or hallucinations in the background.
      - ZERO background noise is mandatory. Audio must be 100% clean and professional.
      - Ensure crystal-clear, 48kHz studio-quality audio throughout the entire generation.
      - If the script is long, maintain consistent tone and quality from start to finish.
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
        'SULTAN': 'The Warrior. Ultra-deep, heavy bass, commanding. Every word vibrates with power. Sound like a powerful king or a legendary wrestler. Maximum chest resonance and vocal fry. 100% Realistic.',
        'SHERA': 'The Motivator. Aggressive, deep, and powerful. Raw testosterone-driven male voice. Extremely heavy and powerful. 100% Realistic.',
        'KAAL': 'The Dark Voice. Mysterious, cinematic, and ultra-low frequency. Dark, mysterious, and grave undertone. Perfect for villains. 100% Realistic.',
        'BHEEM': 'The Giant. Super-heavy baritone, larger-than-life resonance. Sounds like the ground is shaking. Deepest possible frequency. 100% Realistic.',
        'SIKANDAR': 'The Legend. Mature, wise, and incredibly powerful. Rich bass for professional and authoritative narration. Respectful yet commanding. 100% Realistic.',
        'VIKRAM': 'The Dark Narrator. Mysterious, deep, smooth, and cinematic. Dark, mysterious undertone. 100% Realistic.',
        'Sachinboy': 'The Heavyweight Champion. A monstrous, chest-rattling deep baritone with explosive, fearless energy. 100% Realistic and Professional.',
        'EMPEROR PRO': 'The King of Voices. The most powerful, authoritative, and legendary deep baritone ever created. Commands absolute respect. 100% Realistic.',
        'KABIR': 'The Storyteller. A warm, wise, and deeply resonant voice. Perfect for historical narratives and soulful storytelling. 100% Realistic.',
        'ARYAN': 'The Fitness Coach. High-energy, sharp, and commanding. Designed for gym motivation and sports commentary. 100% Realistic.',
        'ISHANI': 'The Elegant Narrator. Smooth, sophisticated, and professional female voice. Ideal for luxury brands and high-end documentaries. 100% Realistic.',
        'ZORAVAR': 'The Heavyweight. An ultra-deep, chest-rattling baritone with immense power. 100% Realistic.',
        'RUDRA': 'The Intense Narrator. Gritty, serious, and highly authoritative. Best for crime thrillers and investigative content. 100% Realistic.'
      };

      promptPrefix += `${voiceTraits[voice_name] || ''} `;

      promptPrefix += `
      CRITICAL PERFORMANCE GUIDELINES FOR 100% REALISM:
      1. NATURAL PROSODY: Avoid a flat or robotic monotone. Vary the pitch, volume, and rhythm naturally based on the content's meaning. Use rising and falling intonation to sound conversational.
      2. HUMAN-LIKE PAUSES: Add subtle, natural pauses at commas, periods, and between major ideas. Use micro-pauses for emphasis and to simulate natural thought processes.
      3. EMOTIONAL INFLECTION: Infuse the voice with genuine emotion that matches the script's context (e.g., excitement, gravity, warmth, curiosity). The emotion should feel "lived-in" and authentic.
      4. CLEAR ARTICULATION: Ensure every word is pronounced clearly but naturally, avoiding over-enunciation that sounds artificial. Use natural elisions where appropriate for a native-like flow.
      5. BREATHING & TEXTURE: Aim for a voice that sounds like it's coming from a human throat, with natural vocal texture, subtle breathing, and realistic mouth sounds where they add to the realism.
      6. NATIVE FLOW: For ${language === 'hi' ? 'Hindi' : 'English'}, use the natural flow, idioms, and emphasis patterns of a native speaker. The rhythm should be fluid and effortless.
      `;

      if (language === 'hi') {
        promptPrefix += "CRITICAL: For Hindi, ensure natural 'Schwa deletion' where appropriate, correct aspiration of consonants, and natural sentence-ending intonation. Avoid a 'reading' tone; instead, sound like a native speaker in a natural conversation. ";
      }

      if (style === 'professional-auto') {
        try {
          const analysisResponse = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ parts: [{ text: `Analyze the following script and determine its category (e.g., Documentary, Fitness, Motivation, Story, News, Corporate) and the ideal vocal tone, pace, and emotional weight. Provide a brief professional instruction for a voice actor to perform this script perfectly.
            
            SCRIPT:
            ${text}` }] }]
          });
          const analysis = analysisResponse.text;
          promptPrefix += `PROFESSIONAL SCRIPT ANALYSIS & INSTRUCTIONS: ${analysis} 
          CRITICAL: Perform this script with 100% realism, matching the analyzed tone and category perfectly. Use natural human prosody and emotional depth. `;
        } catch (analysisError) {
          console.error("Script analysis failed, falling back to general professional style:", analysisError);
          promptPrefix += "Use a highly professional, balanced, and realistic narrator tone suitable for this script. ";
        }
      }

      if (style === 'documentary' || style === 'doc-pro' || voice_name === 'Documentary Pro' || style === 'cinematic' || style === 'authoritative') {
        promptPrefix += `You are a world-class cinematic ${style === 'authoritative' ? 'authoritative' : 'documentary'} narrator. Your voice is deep, mature, intelligent, and ${style === 'authoritative' ? 'highly authoritative' : 'cinematic'}, similar to National Geographic or a premium Netflix documentary. 
        
        CRITICAL INSTRUCTIONS FOR THIS PERFORMANCE:
        1. BASE TONE: ${style === 'authoritative' ? 'Commanding, serious, and powerful' : 'Calm, deep, and controlled'} storytelling with perfect ${language === 'hi' ? 'Hindi' : 'English'} native pronunciation.
        2. EMOTIONAL MODULATION: 
           - For normal parts: ${style === 'authoritative' ? 'Firm and decisive' : 'Calm, steady, and informative'}.
           - For suspense: Slow down slightly, add dramatic pauses, and sound mysterious.
           - For intense/war parts: Sound stronger, brave, and commanding.
           - For emotional parts: Sound warm, respectful, and inspiring.
           - For big reveals: Pause briefly before the sentence, then speak slower and deeper for impact.
        3. DELIVERY: Natural storytelling flow, NOT robotic. Use human-like pauses, subtle breathing, and natural emphasis.
        4. PACING: ${style === 'authoritative' ? 'Slow and deliberate' : 'Medium pace generally'}, but slow down for dramatic effect.
        5. QUALITY: Studio-grade, clean audio. NO background noise or glitches.`;
      } else if (style === 'emotional') {
        promptPrefix += `Use a voice filled with deep feeling, expression, and appropriate pauses to convey profound emotion. `;
      } else if (style === 'storytelling') {
        promptPrefix += `Use a rhythmic, engaging, and warm tone to bring the narrative to life. `;
      } else if (style === 'motivational') {
        promptPrefix += `Use a strong, inspiring, and energetic tone to uplift and empower the audience. `;
      }

      if (pitch > 1.3) promptPrefix += "Use a very high, bright, and sharp pitch. ";
      else if (pitch > 1.1) promptPrefix += "Use a slightly higher, more youthful and energetic pitch. ";
      else if (pitch < 0.7) promptPrefix += "Use a very deep, bassy, and low-frequency pitch. ";
      else if (pitch < 0.9) promptPrefix += "Use a slightly deeper, more mature and resonant pitch. ";
      else promptPrefix += "Use a natural, medium, and perfectly balanced pitch. ";

      promptPrefix += `CRITICAL: Speak at exactly ${speed}x speed. `;
      
      // Voice-specific speed normalization
      if (['Puck', 'Charon'].includes(targetVoice)) {
        promptPrefix += "Note: This voice is naturally brisk, so ensure the pacing feels controlled and not rushed. ";
      } else if (['Fenrir'].includes(targetVoice)) {
        promptPrefix += "Note: This voice is naturally slow and deep, so ensure it doesn't become too sluggish. ";
      }

      if (speed >= 1.4) {
        promptPrefix += "PERFORMANCE: Deliver a professional, high-energy, and fast-paced narration. Maintain absolute naturalness, clarity, and perfect articulation. This is a high-speed, professional Level 2 narrator style. ";
      } else if (speed > 1.0) {
        promptPrefix += "PERFORMANCE: Deliver a professional, brisk, and energetic narration. The pace should be slightly faster than normal but still feel completely natural and easy to follow. Perfect for engaging social media content. ";
      } else if (speed <= 0.7) {
        promptPrefix += "PERFORMANCE: Deliver a professional, steady, and deliberate narration. The pace should be slightly slower than normal to emphasize every word, while maintaining a natural flow and professional tone. ";
      } else if (speed < 1.0) {
        promptPrefix += "PERFORMANCE: Deliver a professional, calm, and steady narration. The pace should be relaxed and clear, perfect for educational or long-form storytelling content. ";
      } else {
        promptPrefix += "PERFORMANCE: Deliver a professional, brisk, and natural performance. The narrator should speak with perfect clarity and articulation, at a pace that is naturally fast but conversational and engaging. This is a professional Level 1 narrator style. ";
      }
      
      if (pause > 0) {
        promptPrefix += `Add a natural pause of exactly ${pause} seconds between every sentence and major phrase to ensure clarity and professional pacing. `;
      }
      
      promptPrefix += "CRITICAL: The audio must be 100% clean with ZERO background noise, ZERO hissing, and ZERO static. ";

      // Split text into chunks for parallel processing if it's long
      const CHUNK_SIZE = 800; // characters
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
      const CONCURRENCY = 5;

      for (let i = 0; i < chunks.length; i += CONCURRENCY) {
        const batch = chunks.slice(i, i + CONCURRENCY);
        const batchPromises = batch.map(async (chunk, idx) => {
          const currentPrompt = attempt === 0 
            ? `${systemInstruction}\n\n${promptPrefix}\n\nSCRIPT TO PERFORM:\n${chunk}\n\nCRITICAL: Some voices have a naturally faster or slower base pace. You MUST adjust the character's natural speed to ensure the FINAL output matches the requested ${speed}x speed perfectly. If the voice is naturally slow, speed it up more; if naturally fast, slow it down to hit the target pace. Respect all punctuation and deliver the script with natural, professional flow.`
            : `CRITICAL: The previous attempt sounded slightly robotic. Please deliver a MORE HUMAN, MORE REALISTIC performance for this script in ${language === 'hi' ? 'Hindi' : 'English'}. Use natural breathing and prosody:\n\n${chunk}`;

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

          const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
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
            await firestore.collection('voice_history').add({
              userId: req.user.uid,
              text,
              voice_name,
              style,
              speed,
              pitch,
              language,
              audio_data: audioData, // Save audio data for history playback
              timestamp: admin.firestore.FieldValue.serverTimestamp()
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
      
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("exhausted") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("404") || errorMessage.includes("NOT_FOUND")) {
        if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("exhausted") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
          markKeyAsExhausted(apiKey);
        }
        attempt++;
        // Add a small delay before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      return res.status(500).json({ error: errorMessage });
    }
  }

  res.status(503).json({ error: "Failed to generate speech after multiple attempts with different API keys." });
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

  const targetVoice = INTERNAL_VOICE_MAPPING[voice_id] || voice_id;
  
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
      
      // Step 1: Transcribe
      const prompt = `Transcribe this audio/video exactly as it is. Return ONLY the transcribed text, no other commentary.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview", // Using gemini-3-flash-preview for more stable audio processing
        contents: [
          { parts: [{ text: prompt }, { inlineData: { data: base64Data, mimeType } }] }
        ]
      });

      const transcribedText = result.text?.trim();
      if (!transcribedText) throw new Error("Failed to transcribe audio");

      console.log(`[Voice Changer] Transcribed text: ${transcribedText.substring(0, 50)}...`);

      // Step 2: Generate Speech in Target Voice
      const isHeavyVoice = ['sultan', 'shera', 'kaal', 'bheem', 'sikandar', 'pankaj', 'virat', 'frank', 'vikram', 'munna-bhai', 'sachinboy', 'maharaja'].includes(voice_id.toLowerCase());
      
      const ttsSystemInstruction = `You are an elite, world-class professional voice actor and narrator. Your task is to provide a stunningly realistic, human-like, and emotionally resonant performance in ${targetLanguage}. 
      
      Your goal is to generate high-fidelity, natural, and expressive speech that rivals ElevenLabs.
      
      PERFORMANCE GUIDELINES:
      - Use natural human prosody, complex intonation, and realistic rhythm.
      - Maintain a perfect balance between speed and clarity. Emotion must be deeply integrated into every word.
      ${isHeavyVoice ? '- CRITICAL: Use an ULTRA-DEEP CHEST VOICE with MAXIMUM BASS RESONANCE. The voice must sound like it is coming from the deep chest of a powerful, large-framed man. Sound 100% "Mardana" (Masculine) and authoritative.' : '- CRITICAL: Use a DEEP CHEST VOICE with BASS RESONANCE.'}
      - Incorporate a vibrating 'gravelly' texture (vocal fry) in every word to sound 100% mature and authoritative.
      - Add subtle, natural human imperfections like light breaths and realistic mouth sounds to achieve 100% realism.
      - Avoid any robotic, monotone, or repetitive cadence.
      - Sound like a real person speaking in a high-end professional studio, not a computer.
      - Pay close attention to the emotional weight of the text.
      - 100% REALISM IS MANDATORY.
      - Use natural emphasis on key words to convey meaning and emotion.
      - Ensure smooth transitions between sentences and ideas.
      ${isHeavyVoice ? '- The voice should sound 100% testosterone-driven—heavy, slow-paced, and cinematic. It must be the deepest, most powerful male voice possible. Sound like a legendary warrior or a king.' : '- The voice should sound professional, mature, and cinematic.'}
      
      TECHNICAL STANDARDS:
      - NO background noise, hums, or digital artifacts.
      - NO robotic glitches, metallic sounds, or synthetic "buzzing".
      - NO background music, bell-like sounds, or hallucinations in the background.
      - Ensure crystal-clear, 48kHz studio-quality audio.
      `;

      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: transcribedText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: ttsSystemInstruction,
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: targetVoice as any }
            }
          }
        }
      });

      const audioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!audioData) throw new Error("Failed to generate speech in target voice");

      // Convert PCM to WAV
      const pcmBuffer = Buffer.from(audioData, 'base64');
      const wavBuffer = addWavHeader(pcmBuffer, 24000);
      const finalAudioData = wavBuffer.toString('base64');

      // Save to history if firestore is available
      if (firestore && userId) {
        try {
          await firestore.collection('voice_history').add({
            userId,
            text: transcribedText,
            voice_name: voice_id,
            mode,
            targetLanguage,
            audio_data: finalAudioData,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        } catch (saveErr) {
          console.error("Failed to save voice changer history:", saveErr);
        }
      }

      return res.json({ audioData: finalAudioData, text: transcribedText });
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
      console.error(`Voice Changer Attempt ${attempt + 1} failed:`, errorMessage);
      
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("exhausted") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("404") || errorMessage.includes("NOT_FOUND")) {
        if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("exhausted") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
          markKeyAsExhausted(apiKey);
        }
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      return res.status(500).json({ error: errorMessage });
    }
  }

  res.status(503).json({ error: "Failed to process voice change after multiple attempts." });
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

  const maxRetries = 15;
  let attempt = 0;

  while (attempt < maxRetries) {
    const apiKey = getAvailableApiKey();
    if (!apiKey) {
      return res.status(503).json({ error: "All Gemini API keys are currently exhausted. Please try again in a few minutes." });
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
      
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("exhausted") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("404") || errorMessage.includes("NOT_FOUND")) {
        if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("exhausted") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
          markKeyAsExhausted(apiKey);
        }
        attempt++;
        // Add a small delay before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      return res.status(500).json({ error: errorMessage });
    }
  }

  res.status(503).json({ error: "Failed to generate image after multiple attempts with different API keys." });
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

  const maxRetries = 15;
  let attempt = 0;

  while (attempt < maxRetries) {
    const apiKey = getAvailableApiKey();
    if (!apiKey) return res.status(503).json({ error: "All Gemini API keys are currently exhausted. Please try again later or provide more API keys in settings." });

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say: Hi, I'm ${voice_name}. I'm one of the professional voices at VoxNova.` }] }],
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
      
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("exhausted") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("404") || errorMessage.includes("NOT_FOUND")) {
        if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("exhausted") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
          markKeyAsExhausted(apiKey);
        }
        attempt++;
        // Add a small delay before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      return res.status(500).json({ error: errorMessage });
    }
  }

  res.status(503).json({ error: "Failed to generate preview after multiple attempts. This is likely due to API quota limits. Please try again later or provide more API keys in settings." });
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

    const category = result.text.trim();
    
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
app.post(["/api/save", "/api/save/"], authenticate, async (req: any, res) => {
  const { text, voice, style, speed, pitch, audioData, creditCost } = req.body;
  const userId = req.user.uid;

  if (!audioData) {
    return res.status(400).json({ error: "Audio data is required" });
  }

  try {
    if (!firestore) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }
    const userRef = firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists || (userDoc.data()?.credits || 0) < creditCost) {
      return res.status(403).json({ error: "Insufficient credits" });
    }

    // Deduct credits
    const isPremiumVoice = ['Bella', 'Documentary Pro', 'Pankaj', 'SULTAN', 'SHERA', 'KAAL', 'BHEEM', 'SIKANDAR', 'VIKRAM', 'Munna Bhai', 'Sachinboy', 'MAHARAJA'].includes(voice);
    const isFreePlan = !userDoc.data()?.plan || userDoc.data()?.plan === 'free';
    
    const updateData: any = {
      credits: admin.firestore.FieldValue.increment(-creditCost)
    };

    if (isPremiumVoice && isFreePlan) {
      updateData.premium_usage_count = admin.firestore.FieldValue.increment(1);
    }

    await userRef.update(updateData);
    
      // Save to Firestore (History)
      // Check audio data size (Firestore limit is 1MB per document)
      // Base64 overhead is ~33%, so 1MB base64 is ~750KB binary.
      // We'll cap it at 800KB to be safe.
      const audioSizeKB = Math.round(audioData.length / 1024);
      const audioToSave = audioData.length > 800000 ? null : audioData;
      
      if (!audioToSave) {
        console.warn(`[History] Audio data too large (${audioSizeKB}KB) to save in Firestore. Skipping audio_data.`);
      }

      await firestore.collection('voice_history').add({
        userId,
        text,
        voice_name: voice,
        style,
        speed,
        pitch,
        audio_data: audioToSave,
        audio_size_kb: audioSizeKB,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({ success: true });
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
      
      let scriptInstruction = "";
      if (language === 'Hindi') {
        if (scriptType === 'hinglish') {
          scriptInstruction = "CRITICAL: Write the Hindi captions using English script (Hinglish). Example: 'Namaste dosto' instead of 'नमस्ते दोस्तों'.";
        } else {
          scriptInstruction = "CRITICAL: Write the Hindi captions using Devanagari script (Hindi). Example: 'नमस्ते दोस्तों'.";
        }
      }

      const prompt = `Transcribe the following video/audio at a word-level with EXTREMELY PRECISE timestamps. 
      The content is primarily in ${language}.
      ${scriptInstruction}
      ${translateToEnglish ? "CRITICAL: Translate the spoken content into English for the captions. The output 'word' field must be in English." : ""}
      
      Return the result as a JSON array of objects, where each object has "word", "start" (in seconds), and "end" (in seconds).
      Example: [{"word": "hello", "start": 0.52, "end": 0.88}, ...]
      
      CRITICAL FOR SYNC: 
      1. The timestamps MUST be perfectly aligned with the audio. 
      2. Use exactly 3 decimal places for maximum precision.
      3. If a word is spoken quickly, ensure the start and end times reflect that.
      4. DO NOT skip any words.
      5. Ensure the "start" time is exactly when the word begins and "end" time is exactly when the speaker finishes that word.
      6. COMPENSATE FOR ANY AI LATENCY: The timestamps must be absolute relative to the start of the file.
      
      Correct any grammatical errors or misspellings in the transcription.
      Support both Hindi and English (Hinglish if mixed).
      Only return the JSON array, no other text.`;

      const mimeType = videoData.startsWith('data:') 
        ? videoData.split(';')[0].split(':')[1] 
        : "video/mp4";

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: videoData.split(',')[1] || videoData
                }
              }
            ]
          }
        ]
      });

      const responseText = result.text;
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (!jsonMatch) {
        throw new Error("Failed to parse word-level timestamps from AI response");
      }

      const words = JSON.parse(jsonMatch[0]);

      // Save to Firestore history
      if (firestore) {
        await firestore.collection('caption_history').add({
          userId,
          words,
          language,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return res.json({ words });
    } catch (error: any) {
      console.error(`[Captions] Attempt ${attempt + 1} failed:`, error.message);
      if (error.message.includes("429") || error.message.includes("quota")) {
        markKeyAsExhausted(apiKey);
        attempt++;
        continue;
      }
      return res.status(500).json({ error: error.message });
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
      .orderBy('timestamp', 'desc')
      .limit(500)
      .get();

    const captionHistory = await firestore.collection('caption_history')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(500)
      .get();

    const history = [
      ...voiceHistory.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          type: 'voice', 
          ...data,
          created_at: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      }),
      ...captionHistory.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          type: 'caption', 
          ...data,
          created_at: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      })
    ].sort((a: any, b: any) => {
      const timeA = a.timestamp?.toMillis() || 0;
      const timeB = b.timestamp?.toMillis() || 0;
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
