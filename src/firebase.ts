import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Import the Firebase configuration from the applet config file
// We use a dynamic import to handle cases where the file might be missing
let firebaseConfig: any = {
  apiKey: "placeholder",
  authDomain: "placeholder",
  projectId: "placeholder",
  appId: "placeholder",
  firestoreDatabaseId: "(default)"
};

// This is a bit tricky in Vite, but we can try to use import.meta.glob or similar
// For now, we'll just use a try-catch with a dynamic import if possible
// Or better yet, just use environment variables if they exist
if (import.meta.env.VITE_FIREBASE_API_KEY) {
  firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)"
  };
}

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
const googleProvider = new GoogleAuthProvider();

// Analytics is only supported in browser environments
let analytics: any;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn("Analytics initialization failed:", error);
  }
}

export { auth, googleProvider, analytics, logEvent, db };
