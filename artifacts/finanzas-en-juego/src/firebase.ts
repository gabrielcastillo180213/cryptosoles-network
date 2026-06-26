import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 CONFIGURACIÓN DE FIREBASE
// Pega aquí las llaves de tu proyecto desde Firebase Console:
// (Configuración del proyecto → Tus apps → Configuración del SDK web)
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};
// ─────────────────────────────────────────────────────────────────────────────

export const FIREBASE_CONFIGURED =
  !!firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10;

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _provider: GoogleAuthProvider | null = null;

if (FIREBASE_CONFIGURED) {
  try {
    _app = initializeApp(firebaseConfig);
    _auth = getAuth(_app);
    _db = getFirestore(_app);
    _provider = new GoogleAuthProvider();
  } catch (e) {
    console.warn("Firebase init failed:", e);
  }
}

export const auth = _auth;
export const db = _db;
export const googleProvider = _provider;
