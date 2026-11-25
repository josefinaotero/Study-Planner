import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Los valores vienen del archivo .env (ver .env.example). Se leen con import.meta.env.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Si falta alguna variable, la app sigue funcionando con datos de muestra.
export const firebaseListo = Object.values(config).every(Boolean);

const app = firebaseListo ? initializeApp(config) : null;
export const auth = app ? getAuth(app) : null; // identifica a cada visitante
export const db = app ? getFirestore(app) : null; // Cloud Firestore

// Devuelve el usuario actual; si no hay sesión, entra como anónimo.
export function asegurarSesion() {
  if (!auth) return Promise.reject(new Error('Falta configurar Firebase en el archivo .env'));
  return new Promise((resolve, reject) => {
    const dejarDeEscuchar = onAuthStateChanged(auth, (usuario) => {
      if (usuario) {
        dejarDeEscuchar();
        resolve(usuario);
      } else {
        signInAnonymously(auth).catch((error) => {
          dejarDeEscuchar();
          reject(error);
        });
      }
    });
  });
}
