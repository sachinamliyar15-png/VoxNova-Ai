import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";

// Configuration detection
let firebaseConfig: any = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)';

// Fallback to internal config values if environment variables are missing (for local preview)
// These values are from the recently regenerated firebase-applet-config.json
if (!firebaseConfig.apiKey) {
  firebaseConfig = {
    projectId: "project-5af7b913-73a3-47c7-a18",
    appId: "1:912588463800:web:698cde336bc224e75ade4d",
    apiKey: "AIzaSyB3lkN6tukuUrizFSFFcksHGDHOfnLc2JA",
    authDomain: "project-5af7b913-73a3-47c7-a18.firebaseapp.com",
    storageBucket: "project-5af7b913-73a3-47c7-a18.firebasestorage.app",
    messagingSenderId: "912588463800",
    measurementId: ""
  };
  firestoreDatabaseId = "ai-studio-4ddf8720-d514-4c80-b8c6-13eb67738dba";
}

// Validation helper
const missingKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value && key !== 'measurementId')
  .map(([key]) => key);

if (missingKeys.length > 0 && typeof window !== 'undefined' && !import.meta.env.PROD) {
  console.warn(`Firebase Check: Missing ${missingKeys.length} config keys. Attempting connection anyway.`);
}

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use experimentalForceLongPolling to handle potentially restrictive network environments (like some iframes or sandboxes)
let db;
try {
  // Try to initialize with settings first
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, firestoreDatabaseId === '(default)' ? undefined : firestoreDatabaseId);
} catch (error) {
  // If already initialized or other error, fallback to getFirestore
  db = getFirestore(app, firestoreDatabaseId === '(default)' ? undefined : firestoreDatabaseId);
}

const googleProvider = new GoogleAuthProvider();

// Analytics is only supported in browser environments
let analytics: any;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    // Silent fail for analytics
  }
}

export { auth, googleProvider, analytics, logEvent, db };
