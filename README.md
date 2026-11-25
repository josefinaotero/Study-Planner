# Planificador de estudio

Aplicación web hecha con React + Vite para organizar exámenes, temas, metas, sesiones de pomodoro y notas.
Los datos se guardan en Cloud Firestore y cada visitante se identifica con Firebase Authentication (acceso anónimo).

## Ejecutar en local

1. `npm install`
2. Copiar `.env.example` como `.env` y completar los valores de `firebaseConfig`
   (Firebase Console → Configuración del proyecto → Tus apps).
3. `npm run dev` (reiniciar el servidor si se cambia el `.env`).

## Configurar Firebase

1. Crear un proyecto y registrar una app web (`</>`).
2. Authentication → Método de acceso → habilitar **Anónimo**.
3. Firestore Database → crear base (Standard, `(default)`, región `southamerica-east1`, modo producción).
4. Firestore → Reglas → pegar el contenido de `firestore.rules` y **Publicar**.
   Las reglas no se actualizan al desplegar en Vercel: se publican siempre desde Firebase.

## Estructura de datos

- `materias`: `nombre`, `color`, `codigo`, `miembros` (uids), `examenes` (cada uno con `tipo`, `fecha`, `creado`, `nota` opcional y `temas`).
- `metas`: `uid`, `titulo`, `materiaId`, `fecha`, `hecha`.
- `sesiones`: `uid`, `fecha`, `materiaId`, `minutos`.

## Publicar en Vercel

Importar el repositorio (preset Vite, build `npm run build`, salida `dist`), cargar las cuatro variables `VITE_FIREBASE_*`
en Settings → Environment Variables (Production) y agregar el dominio de Vercel en
Firebase → Authentication → Configuración → Dominios autorizados.
