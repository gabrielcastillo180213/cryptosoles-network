import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 CONFIGURACIÓN DE FIREBASE — Finanzas en Juego
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBSfvAIYZkGb91Ds7FMi_XVFINvF_x46sg",
  authDomain: "finanzasenjuego-a31dd.firebaseapp.com",
  projectId: "finanzasenjuego-a31dd",
  storageBucket: "finanzasenjuego-a31dd.firebasestorage.app",
  messagingSenderId: "847105120435",
  appId: "1:847105120435:web:a5d30380c0b3a3c69f78c6",
  measurementId: "G-K5Y7L9C5MT",
};
// ─────────────────────────────────────────────────────────────────────────────

export const FIREBASE_CONFIGURED = true;

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _provider: GoogleAuthProvider | null = null;

try {
  _app = initializeApp(firebaseConfig);
  _auth = getAuth(_app);
  _db = getFirestore(_app);
  _provider = new GoogleAuthProvider();
} catch (e) {
  console.error("Firebase init error:", e);
}

export const auth = _auth;
export const db = _db;
export const googleProvider = _provider;
