import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";

// Configuration detection from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)';

// Validation helper
const missingKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value && key !== 'measurementId')
  .map(([key]) => key);

if (missingKeys.length > 0 && typeof window !== 'undefined') {
  console.warn(`Firebase Check: Missing ${missingKeys.length} config keys. Ensure VITE_FIREBASE_* environment variables are set in Settings.`);
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
