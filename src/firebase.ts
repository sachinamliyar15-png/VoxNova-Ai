import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";

// Import the Firebase configuration
let firebaseConfig: any = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Initialize Firebase SDK with a fallback to prevent blank screen
// If you see a blank screen, please accept Firebase terms in the settings.
const isConfigValid = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "pl-key" && firebaseConfig.apiKey !== "";

const app = initializeApp(isConfigValid ? firebaseConfig : {
  apiKey: "pl-key",
  authDomain: "pl-domain",
  projectId: "pl-id",
  storageBucket: "pl-bucket",
  messagingSenderId: "pl-sender",
  appId: "pl-app-id"
});
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Analytics is only supported in browser environments and with a valid config
let analytics: any;
if (typeof window !== 'undefined' && isConfigValid) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    // Silent fail for analytics if config is still being set up
  }
}

export { auth, googleProvider, analytics, logEvent, db };
