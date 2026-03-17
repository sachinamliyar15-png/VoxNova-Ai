import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import admin from "firebase-admin";
import cookieParser from "cookie-parser";
import Razorpay from "razorpay";
import crypto from "crypto";

dotenv.config();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Initialize Firebase Admin
if (process.env.FIREBASE_PROJECT_ID) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log("Firebase Admin initialized");
  } catch (error) {
    console.error("Firebase Admin init error:", error);
  }
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
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

// User Profile & Credit Reset Logic
app.get("/api/user/profile", authenticate, (req: any, res) => {
  const userId = req.user.uid;
  const email = req.user.email || '';
  const domain = email.split('@')[1]?.toLowerCase();

  if (domain && BLOCKED_DOMAINS.includes(domain)) {
    return res.status(403).json({ error: 'Temporary email addresses are not allowed. Please use a permanent email.' });
  }

  let user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;

  if (!user) {
    // Create new user
    db.prepare("INSERT INTO users (id, email, display_name) VALUES (?, ?, ?)")
      .run(userId, req.user.email, req.user.name || '');
    user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  }

  // Monthly Credit Reset Logic (Free tier only)
  const lastReset = new Date(user.last_reset);
  const now = new Date();
  if (user.plan === 'free' && (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear())) {
    db.prepare("UPDATE users SET credits = 20000, last_reset = CURRENT_TIMESTAMP WHERE id = ?").run(userId);
    user.credits = 20000;
  }

  res.json(user);
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
        db.prepare("UPDATE users SET plan = ?, credits = credits + ? WHERE id = ?")
          .run(plan, planCredits[plan], userId);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: "Database update failed" });
      }
    } else {
      res.status(400).json({ error: "Invalid signature" });
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
    const user = db.prepare("SELECT credits FROM users WHERE id = ?").get(userId) as any;
    if (!user || user.credits < creditCost) {
      return res.status(403).json({ error: "Insufficient credits" });
    }

    db.transaction(() => {
      // Deduct credits
      db.prepare("UPDATE users SET credits = credits - ? WHERE id = ?").run(creditCost, userId);
      
      // Save generation
      const stmt = db.prepare(`
        INSERT INTO generations (user_id, text, voice_name, style, speed, pitch, audio_data)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(userId, text, voice, style, speed, pitch, audioData);
    })();

    res.json({ success: true });
  } catch (dbError: any) {
    console.error("Database save error:", dbError);
    res.status(500).json({ error: dbError.message });
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
