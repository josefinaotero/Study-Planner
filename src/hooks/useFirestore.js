import { useEffect, useState, useRef } from 'react';
import {
  collection, doc, setDoc, deleteDoc,
  onSnapshot, writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Sincroniza materias y metas con Firestore.
 * - Lee en tiempo real con onSnapshot.
 * - Escribe con funciones que receptan el nuevo estado completo.
 */
export function useFirestore(uid) {
  const [materias, setMaterias] = useState(null); // null = cargando
  const [metas, setMetas] = useState(null);
  const listosRef = useRef({ materias: false, metas: false });

  useEffect(() => {
    if (!uid || !db) return;

    const refMaterias = collection(db, 'usuarios', uid, 'materias');
    const refMetas    = collection(db, 'usuarios', uid, 'metas');

    const unsubMaterias = onSnapshot(refMaterias, (snap) => {
      const datos = snap.docs.map((d) => d.data());
      setMaterias(datos);
      listosRef.current.materias = true;
    });

    const unsubMetas = onSnapshot(refMetas, (snap) => {
      const datos = snap.docs.map((d) => d.data());
      setMetas(datos);
      listosRef.current.metas = true;
    });

    return () => { unsubMaterias(); unsubMetas(); };
  }, [uid]);

  /** Guarda la lista completa de materias en Firestore (batch). */
  async function guardarMaterias(nuevas) {
    if (!uid || !db) return;
    const batch = writeBatch(db);
    nuevas.forEach((m) => {
      const ref = doc(db, 'usuarios', uid, 'materias', m.id);
      batch.set(ref, m);
    });
    await batch.commit();
  }

  /** Elimina una materia por id. */
  async function eliminarMateria(id) {
    if (!uid || !db) return;
    await deleteDoc(doc(db, 'usuarios', uid, 'materias', id));
  }

  /** Guarda la lista completa de metas en Firestore (batch). */
  async function guardarMetas(nuevas) {
    if (!uid || !db) return;
    const batch = writeBatch(db);
    nuevas.forEach((m) => {
      const ref = doc(db, 'usuarios', uid, 'metas', m.id);
      batch.set(ref, m);
    });
    await batch.commit();
  }

  /** Elimina una meta por id. */
  async function eliminarMeta(id) {
    if (!uid || !db) return;
    await deleteDoc(doc(db, 'usuarios', uid, 'metas', id));
  }

  const cargando = materias === null || metas === null;

  return {
    materias: materias ?? [],
    metas: metas ?? [],
    cargando,
    guardarMaterias,
    eliminarMateria,
    guardarMetas,
    eliminarMeta,
  };
}
