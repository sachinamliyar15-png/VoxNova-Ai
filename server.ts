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
const exhaustedKeys = new Set<string>();

const getAvailableApiKey = () => {
  const baseKey = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
  if (!baseKey) return null;
  
  const allKeys = baseKey.split(',').map(k => k.trim()).filter(k => k.length > 0);
  const availableKeys = allKeys.filter(k => !exhaustedKeys.has(k));
  
  if (availableKeys.length === 0) {
    return null;
  }
  
  // Randomly pick an available key
  return availableKeys[Math.floor(Math.random() * availableKeys.length)];
};

const markKeyAsExhausted = (key: string) => {
  if (!key) return;
  exhaustedKeys.add(key);
  
  // Clear exhausted keys after 2 minutes
  setTimeout(() => {
    exhaustedKeys.delete(key);
  }, 120000);
};

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Initialize Firebase Admin
let firestore: admin.firestore.Firestore;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    if (admin.apps.length === 0) {
      // Robust private key parsing
      let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";
      
      // Trim whitespace and handle potential wrapping quotes
      privateKey = privateKey.trim();
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
      }
      
      // Replace escaped newlines with actual newlines
      // This handles the common case where the key is provided as a single line with \n strings
      // We use a global regex to replace all occurrences of \n (escaped) with actual newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      // If the key still doesn't have actual newlines, it might be double-escaped or just a single line
      if (!privateKey.includes('\n') && privateKey.includes(' ')) {
        // Some systems might replace newlines with spaces, though rare for PEM
        // But more likely it's just one long string that needs the headers/footers fixed
      }

      // Ensure the key has the correct PEM headers and footers
      if (privateKey && !privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
      }
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log("Firebase Admin initialized successfully");
    }
  } catch (error) {
    console.error("Firebase Admin init error:", error);
  }
}

// Initialize Firestore only if admin was initialized
try {
  if (admin.apps.length > 0) {
    firestore = admin.firestore();
  } else {
    console.warn("Firebase Admin not initialized. Firestore features will be disabled.");
  }
} catch (error) {
  console.error("Firestore initialization error:", error);
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' })); // Increased limit for video files
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
    return res.status(500).json({ 
      error: 'Authentication service unavailable. Please ensure server-side Firebase environment variables are configured correctly in your deployment dashboard (e.g., Render/Vercel).' 
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

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
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
    
    const planPrices: Record<string, number> = {
      'basic': 100,
      'pro': 200,
      'advanced': 400,
      'ultra': 500
    };

    const amount = planPrices[plan];
    if (!amount) return res.status(400).json({ error: "Invalid plan" });

    try {
      const options = {
        amount: amount * 100, // amount in the smallest currency unit (paise)
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error: any) {
      console.error("Razorpay order error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Razorpay: Verify Payment
  app.post("/api/payments/verify", authenticate, async (req: any, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
    const userId = req.user.uid;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
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
        res.json({ success: true });
      } catch (error: any) {
        console.error("Firestore payment update error:", error);
        res.status(500).json({ error: "Database update failed" });
      }
    } else {
      res.status(400).json({ error: "Invalid signature" });
    }
  });

// Generate Speech via Gemini API
app.post("/api/generate-speech", authenticate, async (req: any, res) => {
  const { text, voice_name, style, speed, pitch, language, studioClarity, pause } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
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
        'Documentary Pro': 'Charon', 'Atlas (Do)': 'Fenrir', 'Priyanka': 'Zephyr', 'Virat': 'Charon'
      };

      const targetVoice = voiceMapping[voice_name] || 'Puck';
      
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

      promptPrefix += `${voiceTraits[voice_name] || ''} `;

      if (style === 'documentary' || style === 'doc-pro' || voice_name === 'Documentary Pro') {
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

      if (pitch > 1.3) promptPrefix += "Use a very high, bright, and sharp pitch. ";
      else if (pitch > 1.1) promptPrefix += "Use a slightly higher, more youthful and energetic pitch. ";
      else if (pitch < 0.7) promptPrefix += "Use a very deep, bassy, and low-frequency pitch. ";
      else if (pitch < 0.9) promptPrefix += "Use a slightly deeper, more mature and resonant pitch. ";

      promptPrefix += `CRITICAL: Speak at exactly ${speed}x speed. `;
      if (speed > 1.5) promptPrefix += "Speak at a very fast, rapid-fire pace. ";
      else if (speed > 1.1) promptPrefix += "Speak at a brisk, energetic pace. ";
      else if (speed < 0.7) promptPrefix += "Speak at a very slow, drawn-out, and deliberate pace. ";
      else if (speed < 0.9) promptPrefix += "Speak at a slightly slower, more measured pace. ";
      else promptPrefix += "Speak at a natural, medium pace. ";
      
      if (pause > 0.1) {
        promptPrefix += `Add a natural pause of approximately ${pause} seconds between sentences and major phrases to ensure clarity and professional pacing. `;
      }
      
      const currentPrompt = attempt === 0 
        ? `${promptPrefix}\n\nSCRIPT TO PERFORM:\n${text}`
        : `CRITICAL: The previous attempt sounded slightly robotic. Please deliver a MORE HUMAN, MORE REALISTIC performance for this script in ${language === 'hi' ? 'Hindi' : 'English'}. Use natural breathing and prosody:\n\n${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
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

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        return res.json({ audioData });
      } else {
        throw new Error("No audio data generated");
      }
    } catch (error: any) {
      console.error(`TTS Attempt ${attempt + 1} failed:`, error.message);
      if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("exhausted")) {
        markKeyAsExhausted(apiKey);
        attempt++;
        continue;
      }
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(503).json({ error: "Failed to generate speech after multiple attempts with different API keys." });
});

// Polish Script via Gemini API
app.post("/api/polish-script", authenticate, async (req: any, res) => {
  const { text, language } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  const apiKey = getAvailableApiKey();
  if (!apiKey) return res.status(503).json({ error: "All Gemini API keys are currently exhausted." });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `Rewrite and optimize the following script for a high-retention social media video (Shorts/Reels style). 
      Make it punchy, engaging, and viral-ready. 
      Maintain the original language (${language === 'hi' ? 'Hindi' : 'English'}).
      Keep it under 5,000 characters.
      Return ONLY the optimized script. Do not include any notes or explanations.

      SCRIPT:
      ${text}` }] }]
    });
    res.json({ polishedText: response.text });
  } catch (error: any) {
    console.error("Polish script error:", error.message);
    if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("exhausted")) {
      markKeyAsExhausted(apiKey);
    }
    res.status(500).json({ error: error.message });
  }
});

// Analyze Captions via Gemini API
app.post("/api/analyze-captions", authenticate, async (req: any, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  const apiKey = getAvailableApiKey();
  if (!apiKey) return res.status(503).json({ error: "All Gemini API keys are currently exhausted." });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `Analyze the following script and suggest 'Visual Emphasis Points' for video captions. 
      Identify keywords or phrases that should be highlighted with specific colors, emojis, or font-size increases based on the emotional tone.
      
      Return ONLY a JSON array of objects with this structure:
      [
        { "word": "keyword", "color": "hex_color", "emoji": "🔥", "size": "large|normal" }
      ]
      
      SCRIPT:
      ${text}` }] }],
      config: { responseMimeType: "application/json" }
    });
    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Analyze captions error:", error.message);
    if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("exhausted")) {
      markKeyAsExhausted(apiKey);
    }
    res.status(500).json({ error: error.message });
  }
});

// Generate Script via Gemini API (Streaming)
app.post("/api/generate-script", authenticate, async (req: any, res) => {
  const { messages, isWebResearchEnabled } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages are required" });
  }

  const apiKey = getAvailableApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: "All Gemini API keys are currently exhausted. Please try again in a few minutes." });
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

    const contents = messages.map((m: any) => {
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
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of stream) {
      const chunkText = chunk.text || '';
      res.write(chunkText);
    }
    res.end();
  } catch (error: any) {
    console.error("Script generation error:", error.message);
    if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("exhausted")) {
      markKeyAsExhausted(apiKey);
    }
    res.status(500).json({ error: error.message });
  }
});

// Generate Image via Gemini API
app.post("/api/generate-image", authenticate, async (req: any, res) => {
  const { prompt, aspectRatio } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

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
    res.json({ imageUrl });
  } catch (error: any) {
    console.error("Image generation error:", error.message);
    if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("exhausted")) {
      markKeyAsExhausted(apiKey);
    }
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

    // Deduct credits in Firestore
    await userRef.update({
      credits: admin.firestore.FieldValue.increment(-creditCost)
    });
    
    // Save generation in SQLite (History)
    const stmt = db.prepare(`
      INSERT INTO generations (user_id, text, voice_name, style, speed, pitch, audio_data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(userId, text, voice, style, speed, pitch, audioData);

    res.json({ success: true });
  } catch (error: any) {
    console.error("Database save error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get(["/api/history", "/api/history/"], authenticate, (req: any, res) => {
  const userId = req.user.uid;
  try {
    const rows = db.prepare("SELECT * FROM generations WHERE user_id = ? ORDER BY created_at DESC LIMIT 50").all(userId);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/history/:id", authenticate, (req: any, res) => {
  const userId = req.user.uid;
  try {
    db.prepare("DELETE FROM generations WHERE id = ? AND user_id = ?").run(req.params.id, userId);
    res.json({ success: true });
  } catch (error: any) {
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
