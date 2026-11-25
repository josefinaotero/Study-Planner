import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseListo = Object.values(config).every(Boolean);

const app = firebaseListo ? initializeApp(config) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

const proveedor = app ? new GoogleAuthProvider() : null;

/** Abre el popup de Google y devuelve el usuario autenticado. */
export function loginConGoogle() {
  if (!auth) return Promise.reject(new Error('Firebase no configurado'));
  return signInWithPopup(auth, proveedor).then((resultado) => resultado.user);
}

/** Cierra la sesión del usuario actual. */
export function cerrarSesion() {
  if (!auth) return Promise.resolve();
  return signOut(auth);
}

/**
 * Escucha cambios en la sesión. Llama a callback con el usuario (o null).
 * Devuelve la función para dejar de escuchar.
 */
export function escucharSesion(callback) {
  if (!auth) { callback(null); return () => {}; }
  return onAuthStateChanged(auth, callback);
}
