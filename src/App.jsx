import { useEffect, useState } from 'react';
import Inicio from './components/Inicio';
import Calendario from './components/Calendario';
import FormExamen from './components/FormExamen';
import Metas from './components/Metas';
import Pomodoro from './components/Pomodoro';
import Notas from './components/Notas';
import DetalleMateria from './components/DetalleMateria';
import DetalleExamen from './components/DetalleExamen';
import NavInferior from './components/NavInferior';
import Icono from './components/Icono';
import { ESTADOS, aplanar, atrasadosDe, codigoNuevo, colorNuevo } from './utils/plan';
import { hoyISO } from './utils/fechas';
import { usePomodoro, mmss, MODOS } from './hooks/usePomodoro';
import { asegurarSesion, firebaseListo } from './firebase';
import * as datos from './db';

function pitido() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.frequency.value = 880;
    vol.gain.value = 0.15;
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch { /* sin audio disponible */ }
}

function Estado({ titulo, texto }) {
  return (
    <div className="vacio" role="status">
      <strong>{titulo}</strong>
      {texto && <p>{texto}</p>}
    </div>
  );
}

export default function App() {
  const [uid, setUid] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [metas, setMetas] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [listo, setListo] = useState({ materias: false, metas: false, sesiones: false });
  const [errorConexion, setErrorConexion] = useState('');
  const [pendientes, setPendientes] = useState(0);
  const [vista, setVista] = useState('inicio');
  const [materiaId, setMateriaId] = useState(null);
  const [examenId, setExamenId] = useState(null);
  const [preMateria, setPreMateria] = useState('');
  const [pomoMateria, setPomoMateria] = useState('');
  const [aviso, setAviso] = useState(null);
  const [tema, setTema] = useState(() => {
    try { const g = localStorage.getItem('tema'); if (g) return g; } catch { /* sin almacenamiento */ }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  });

  const mostrar = (texto, tipo = 'ok') => setAviso({ texto, tipo });

  // Ejecuta una operación de Firestore e informa si salió bien o falló.
  const ejecutar = async (accion, mensajeOk) => {
    setPendientes((n) => n + 1);
    try {
      await accion();
      if (mensajeOk) mostrar(mensajeOk);
    } catch (e) {
      console.error(e);
      mostrar('No se pudo guardar el cambio. Revisá tu conexión y las reglas de Firestore.', 'error');
    } finally {
      setPendientes((n) => n - 1);
    }
  };

  const pomo = usePomodoro((modo) => {
    if (modo === 'enfoque') {
      ejecutar(() => datos.crearSesion(uid, { fecha: hoyISO(), materiaId: pomoMateria, minutos: MODOS.enfoque.min }));
      mostrar('¡Pomodoro completado! Tomate un descanso.');
    } else {
      mostrar('Terminó el descanso.');
    }
    pitido();
  });

  // Sesión anónima
  useEffect(() => {
    if (!firebaseListo) return;
    asegurarSesion()
      .then((u) => setUid(u.uid))
      .catch((e) =>
        setErrorConexion(
          e.code === 'auth/operation-not-allowed'
            ? 'Falta habilitar Authentication → Anónimo en la consola de Firebase.'
            : `No se pudo iniciar sesión (${e.code || e.message}). Revisá el archivo .env.`
        )
      );
  }, []);

  // Datos en tiempo real desde Firestore
  useEffect(() => {
    if (!uid) return;
    const falla = (e) =>
      setErrorConexion(`No se pudieron leer los datos (${e.code || e.message}). Revisá que las reglas de Firestore estén publicadas.`);
    const marcar = (k) => setListo((p) => ({ ...p, [k]: true }));
    const cortar = [
      datos.escucharMaterias(uid, (l) => { setMaterias(l); marcar('materias'); }, falla),
      datos.escucharMetas(uid, (l) => { setMetas(l); marcar('metas'); }, falla),
      datos.escucharSesiones(uid, (l) => { setSesiones(l); marcar('sesiones'); }, falla),
    ];
    return () => cortar.forEach((f) => f());
  }, [uid]);

  useEffect(() => {
    document.documentElement.dataset.theme = tema === 'oscuro' ? 'dark' : 'light';
    try { localStorage.setItem('tema', tema); } catch { /* sin almacenamiento */ }
  }, [tema]);

  useEffect(() => {
    document.title = pomo.corriendo ? `${mmss(pomo.restante)} · Planificador` : 'Planificador de estudio';
  }, [pomo.corriendo, pomo.restante]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), aviso.tipo === 'error' ? 6000 : 2600);
    return () => clearTimeout(t);
  }, [aviso]);

  const examenes = aplanar(materias);
  const materiaAbierta = materias.find((m) => m.id === materiaId);
  const examenAbierto = examenes.find((e) => e.id === examenId);

  const abrirMateria = (id) => { setMateriaId(id); setVista('materia'); };
  const abrirExamen = (id) => { setExamenId(id); setVista('examen'); };
  const nuevoExamen = (nombreMateria = '') => { setPreMateria(nombreMateria); setVista('nuevo'); };

  const agregar = ({ materia, colorCatalogo, tipo, fecha, temas }) => {
    const examen = { id: crypto.randomUUID(), tipo, fecha, creado: hoyISO(), temas };
    const existente = materias.find((m) => m.nombre === materia);
    const id = existente ? existente.id : crypto.randomUUID();
    ejecutar(
      () =>
        existente
          ? datos.guardarExamenes(id, [...existente.examenes, examen])
          : datos.crearMateria({ id, nombre: materia, color: colorCatalogo || colorNuevo(materias.length), codigo: codigoNuevo(), miembros: [uid], examenes: [examen] }),
      'Examen guardado'
    );
    abrirMateria(id);
  };

  const cambiarExamen = (mId, eId, fn, mensajeOk) => {
    const m = materias.find((x) => x.id === mId);
    if (!m) return;
    ejecutar(() => datos.guardarExamenes(mId, m.examenes.map((e) => (e.id === eId ? fn(e) : e))), mensajeOk);
  };

  const avanzar = (mId, eId, tId) =>
    cambiarExamen(mId, eId, (e) => ({
      ...e,
      temas: e.temas.map((t) => (t.id !== tId ? t : { ...t, estado: ESTADOS[(ESTADOS.indexOf(t.estado) + 1) % ESTADOS.length] })),
    }));

  const guardarNota = (mId, eId, nota) =>
    cambiarExamen(
      mId,
      eId,
      (e) => {
        const { nota: _anterior, ...resto } = e;
        return nota === null ? resto : { ...resto, nota };
      },
      nota === null ? 'Nota quitada' : 'Nota guardada'
    );

  // Reinicia el plan desde hoy para los exámenes con temas atrasados (o solo para uno).
  const reacomodar = (soloExamenId) => {
    const ids = soloExamenId ? new Set([soloExamenId]) : new Set(atrasadosDe(examenes).map((t) => t.examen.id));
    const cambios = materias
      .filter((m) => m.examenes.some((e) => ids.has(e.id)))
      .map((m) => ({ materiaId: m.id, examenes: m.examenes.map((e) => (ids.has(e.id) ? { ...e, creado: hoyISO() } : e)) }));
    if (cambios.length) ejecutar(() => datos.reacomodarExamenes(cambios), 'Plan reacomodado desde hoy');
  };

  const eliminarExamen = (mId, eId) => {
    const m = materias.find((x) => x.id === mId);
    if (!m) return;
    ejecutar(() => datos.guardarExamenes(mId, m.examenes.filter((e) => e.id !== eId)), 'Examen eliminado');
    abrirMateria(mId);
  };

  const eliminarMateria = (id) => {
    ejecutar(() => datos.borrarMateria(id, metas.filter((g) => g.materiaId === id)), 'Materia eliminada');
    if (pomoMateria === id) setPomoMateria('');
    setVista('inicio');
  };

  const agregarMeta = ({ titulo, materiaId: mId, fecha }) =>
    ejecutar(() => datos.crearMeta(uid, { titulo, materiaId: mId, fecha, hecha: false }), 'Meta agregada');
  const alternarMeta = (id) => {
    const g = metas.find((x) => x.id === id);
    if (g) ejecutar(() => datos.actualizarMeta(id, { hecha: !g.hecha }));
  };
  const eliminarMeta = (id) => ejecutar(() => datos.borrarMeta(id), 'Meta eliminada');

  const navActiva = vista === 'materia' || vista === 'examen' ? 'inicio' : vista;
  const bloqueo = !firebaseListo ? 'Falta configurar Firebase: completá el archivo .env (ver .env.example) y reiniciá el servidor.' : errorConexion;
  const cargando = !bloqueo && !(listo.materias && listo.metas && listo.sesiones);

  return (
    <div className="app">
      <main className={`vista-${vista}`}>
        {bloqueo ? (
          <Estado titulo="No se pudo conectar con Firebase" texto={bloqueo} />
        ) : cargando ? (
          <Estado titulo="Cargando tus datos…" />
        ) : (
          <>
            {vista === 'inicio' && <Inicio materias={materias} examenes={examenes} metas={metas} onIrMetas={() => setVista('metas')} onAlternarMeta={alternarMeta} onReacomodar={reacomodar} onAbrirMateria={abrirMateria} onAvanzar={avanzar} onNuevo={nuevoExamen} />}
            {vista === 'metas' && <Metas metas={metas} materias={materias} onAgregar={agregarMeta} onAlternar={alternarMeta} onEliminar={eliminarMeta} />}
            {vista === 'pomodoro' && <Pomodoro materias={materias} pomo={pomo} materiaId={pomoMateria} onMateria={setPomoMateria} sesiones={sesiones} />}
            {vista === 'notas' && <Notas materias={materias} onAbrirExamen={abrirExamen} />}
            {vista === 'calendario' && <Calendario examenes={examenes} onAbrir={abrirExamen} />}
            {vista === 'nuevo' && <FormExamen key={preMateria} materiaInicial={preMateria} onGuardar={agregar} />}
            {vista === 'materia' && materiaAbierta && (
              <DetalleMateria materia={materiaAbierta} onVolver={() => setVista('inicio')} onAbrirExamen={abrirExamen} onAgregar={nuevoExamen} onEliminar={eliminarMateria} />
            )}
            {vista === 'examen' && examenAbierto && (
              <DetalleExamen examen={examenAbierto} onVolver={() => abrirMateria(examenAbierto.materiaId)} onAvanzar={avanzar} onEliminar={eliminarExamen} onNota={guardarNota} onReacomodar={reacomodar} />
            )}
          </>
        )}
      </main>
      <button className="tema-btn" onClick={() => setTema(tema === 'oscuro' ? 'claro' : 'oscuro')} aria-label={tema === 'oscuro' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} title={tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}>
        <Icono n={tema === 'oscuro' ? 'sol' : 'luna'} tam={20} />
      </button>
      {(aviso || pendientes > 0) && (
        <div className={`toast${aviso && aviso.tipo === 'error' ? ' toast--error' : ''}`} role={aviso && aviso.tipo === 'error' ? 'alert' : 'status'}>
          {aviso ? aviso.texto : 'Guardando…'}
        </div>
      )}
      <NavInferior vista={navActiva} onCambiar={(v) => (v === 'nuevo' ? nuevoExamen() : setVista(v))} />
    </div>
  );
}
