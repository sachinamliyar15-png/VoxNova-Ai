import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import admin from "firebase-admin";
import cookieParser from "cookie-parser";

dotenv.config();

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

// User Profile & Credit Reset Logic
app.get("/api/user/profile", authenticate, (req: any, res) => {
  const userId = req.user.uid;
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

// Purchase Credits (Mock)
app.post("/api/user/purchase", authenticate, (req: any, res) => {
  const { plan, credits } = req.body;
  const userId = req.user.uid;

  try {
    db.prepare("UPDATE users SET plan = ?, credits = credits + ? WHERE id = ?")
      .run(plan, credits, userId);
    res.json({ success: true });
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
