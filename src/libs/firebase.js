import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase Configuration
 * Initializes the Firebase application instance and exports
 * the authentication and Firestore database services.
 * * Configuration values are loaded from environment variables (VITE_*).
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Export Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);