import { addDoc, collection, deleteDoc, doc, onSnapshot, query, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

const col = (nombre) => collection(db, nombre);
const lista = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

// ---- Consultas en tiempo real (devuelven la función para cancelar la suscripción)
export const escucharMaterias = (uid, alCambiar, alFallar) =>
  onSnapshot(query(col('materias'), where('miembros', 'array-contains', uid)), (s) => alCambiar(lista(s)), alFallar);
export const escucharMetas = (uid, alCambiar, alFallar) =>
  onSnapshot(query(col('metas'), where('uid', '==', uid)), (s) => alCambiar(lista(s)), alFallar);
export const escucharSesiones = (uid, alCambiar, alFallar) =>
  onSnapshot(query(col('sesiones'), where('uid', '==', uid)), (s) => alCambiar(lista(s)), alFallar);

// ---- Materias (los exámenes viven dentro del documento de la materia)
export const crearMateria = ({ id, ...datos }) => setDoc(doc(db, 'materias', id), datos);
export const guardarExamenes = (materiaId, examenes) => updateDoc(doc(db, 'materias', materiaId), { examenes });

export function reacomodarExamenes(cambios) {
  const lote = writeBatch(db);
  cambios.forEach(({ materiaId, examenes }) => lote.update(doc(db, 'materias', materiaId), { examenes }));
  return lote.commit();
}

// Borra la materia y deja "General" las metas que la usaban.
export function borrarMateria(id, metasAfectadas) {
  const lote = writeBatch(db);
  lote.delete(doc(db, 'materias', id));
  metasAfectadas.forEach((g) => lote.update(doc(db, 'metas', g.id), { materiaId: '' }));
  return lote.commit();
}

// ---- Metas
export const crearMeta = (uid, meta) => addDoc(col('metas'), { ...meta, uid });
export const actualizarMeta = (id, datos) => updateDoc(doc(db, 'metas', id), datos);
export const borrarMeta = (id) => deleteDoc(doc(db, 'metas', id));

// ---- Sesiones de pomodoro
export const crearSesion = (uid, sesion) => addDoc(col('sesiones'), { ...sesion, uid });
