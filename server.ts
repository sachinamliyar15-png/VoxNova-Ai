import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Database
let db: Database.Database;
try {
  db = new Database("history.db");
  console.log("Database initialized successfully");
  db.exec(`
    CREATE TABLE IF NOT EXISTS generations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT,
      voice_name TEXT,
      style TEXT,
      speed REAL,
      pitch REAL,
      audio_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
} catch (dbInitError) {
  console.error("Database initialization failed:", dbInitError);
  // Fallback to memory db if file db fails
  db = new Database(":memory:");
  console.log("Using memory database as fallback");
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Save generation to history
app.post(["/api/save", "/api/save/"], async (req, res) => {
  const { text, voice, style, speed, pitch, audioData } = req.body;

  if (!audioData) {
    return res.status(400).json({ error: "Audio data is required" });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO generations (text, voice_name, style, speed, pitch, audio_data)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(text, voice, style, speed, pitch, audioData);
    res.json({ id: info.lastInsertRowid });
  } catch (dbError: any) {
    console.error("Database save error:", dbError);
    res.status(500).json({ error: dbError.message });
  }
});

app.get(["/api/history", "/api/history/"], (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM generations ORDER BY created_at DESC LIMIT 50").all();
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/history/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM generations WHERE id = ?").run(req.params.id);
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
