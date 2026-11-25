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
import LoginGoogle from './components/LoginGoogle';
import Onboarding from './components/Onboarding';
import { useFirestore } from './hooks/useFirestore';
import { ESTADOS, aplanar, atrasadosDe, codigoNuevo, colorNuevo } from './utils/plan';
import { hoyISO } from './utils/fechas';
import { usePomodoro, mmss, MODOS } from './hooks/usePomodoro';
import { escucharSesion, cerrarSesion, firebaseListo } from './firebase';

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

export default function App() {
  const [usuario, setUsuario] = useState(undefined);
  const [onboardingVisto, setOnboardingVisto] = useState(() => {
    try { return localStorage.getItem('onboarding') === 'ok'; } catch { return false; }
  });
  const [sesiones, setSesiones] = useState([]);
  const [vista, setVista] = useState('inicio');
  const [materiaId, setMateriaId] = useState(null);
  const [examenId, setExamenId] = useState(null);
  const [preMateria, setPreMateria] = useState('');
  const [pomoMateria, setPomoMateria] = useState('');
  const [aviso, setAviso] = useState('');
  const [tema, setTema] = useState(() => {
    try { const g = localStorage.getItem('tema'); if (g) return g; } catch { /* sin almacenamiento */ }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  });

  const {
    materias, metas, cargando,
    guardarMaterias, eliminarMateria,
    guardarMetas, eliminarMeta,
  } = useFirestore(usuario?.uid);

  const pomo = usePomodoro((modo) => {
    if (modo === 'enfoque') {
      setSesiones((prev) => [...prev, { id: crypto.randomUUID(), fecha: hoyISO(), materiaId: pomoMateria, minutos: MODOS.enfoque.min }]);
      setAviso('¡Pomodoro completado! Tomate un descanso.');
    } else {
      setAviso('Terminó el descanso.');
    }
    pitido();
  });

  useEffect(() => {
    if (!firebaseListo) { setUsuario(null); return; }
    const dejarDeEscuchar = escucharSesion((u) => setUsuario(u ?? null));
    return dejarDeEscuchar;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = tema === 'oscuro' ? 'dark' : 'light';
    try { localStorage.setItem('tema', tema); } catch { /* sin almacenamiento */ }
  }, [tema]);

  useEffect(() => {
    document.title = pomo.corriendo ? `${mmss(pomo.restante)} · Study Planner` : 'Study Planner';
  }, [pomo.corriendo, pomo.restante]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(''), 2600);
    return () => clearTimeout(t);
  }, [aviso]);

  // ── Pantallas previas ──────────────────────────────────────────
  if (usuario === undefined) {
    return (
      <div className="app" style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
        <span style={{ opacity: 0.4, fontSize: '0.9rem' }}>Study Planner…</span>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="login-wrapper" data-theme={tema === 'oscuro' ? 'dark' : 'light'}>
        <LoginGoogle onLogin={setUsuario} />
      </div>
    );
  }

  if (!onboardingVisto) {
    return (
      <div className="login-wrapper" data-theme={tema === 'oscuro' ? 'dark' : 'light'}>
        <Onboarding onTerminar={() => {
          try { localStorage.setItem('onboarding', 'ok'); } catch { /* sin storage */ }
          setOnboardingVisto(true);
        }} />
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="app" style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
        <span style={{ opacity: 0.4, fontSize: '0.9rem' }}>Cargando tus datos…</span>
      </div>
    );
  }

  // ── Helpers ───────────────────────────────────────────────────
  const examenes = aplanar(materias);
  const materiaAbierta = materias.find((m) => m.id === materiaId);
  const examenAbierto = examenes.find((e) => e.id === examenId);

  const abrirMateria = (id) => { setMateriaId(id); setVista('materia'); };
  const abrirExamen = (id) => { setExamenId(id); setVista('examen'); };
  const nuevoExamen = (nombreMateria = '') => { setPreMateria(nombreMateria); setVista('nuevo'); };

  // ── Acciones sincronizadas con Firestore ───────────────────────
  const agregar = ({ materia, colorCatalogo, tipo, fecha, temas }) => {
    const examen = { id: crypto.randomUUID(), tipo, fecha, creado: hoyISO(), temas };
    const existente = materias.find((m) => m.nombre === materia);
    const id = existente ? existente.id : crypto.randomUUID();
    const nuevas = existente
      ? materias.map((m) => (m.id === id ? { ...m, examenes: [...m.examenes, examen] } : m))
      : [...materias, { id, nombre: materia, color: colorCatalogo || colorNuevo(materias.length), codigo: codigoNuevo(), miembros: [usuario.uid], examenes: [examen] }];
    guardarMaterias(nuevas);
    setAviso('Examen guardado');
    abrirMateria(id);
  };

  const cambiarExamen = (mId, eId, fn) =>
    materias.map((m) => (m.id !== mId ? m : { ...m, examenes: m.examenes.map((e) => (e.id !== eId ? e : fn(e))) }));

  const avanzar = (mId, eId, tId) => {
    const nuevas = cambiarExamen(mId, eId, (e) => ({
      ...e,
      temas: e.temas.map((t) => (t.id !== tId ? t : { ...t, estado: ESTADOS[(ESTADOS.indexOf(t.estado) + 1) % ESTADOS.length] })),
    }));
    guardarMaterias(nuevas);
  };

  const guardarNota = (mId, eId, nota) => {
    const nuevas = cambiarExamen(mId, eId, (e) => {
      const { nota: _anterior, ...resto } = e;
      return nota === null ? resto : { ...resto, nota };
    });
    guardarMaterias(nuevas);
    setAviso(nota === null ? 'Nota quitada' : 'Nota guardada');
  };

  const reacomodar = (soloExamenId) => {
    const ids = soloExamenId ? new Set([soloExamenId]) : new Set(atrasadosDe(examenes).map((t) => t.examen.id));
    const nuevas = materias.map((m) => ({ ...m, examenes: m.examenes.map((e) => (ids.has(e.id) ? { ...e, creado: hoyISO() } : e)) }));
    guardarMaterias(nuevas);
    setAviso('Plan reacomodado desde hoy');
  };

  const handleEliminarExamen = (mId, eId) => {
    const nuevas = materias.map((m) => (m.id === mId ? { ...m, examenes: m.examenes.filter((e) => e.id !== eId) } : m));
    guardarMaterias(nuevas);
    setAviso('Examen eliminado');
    abrirMateria(mId);
  };

  const agregarMeta = ({ titulo, materiaId: mId, fecha }) => {
    const nueva = { id: crypto.randomUUID(), titulo, materiaId: mId, fecha, hecha: false };
    guardarMetas([...metas, nueva]);
    setAviso('Meta agregada');
  };

  const alternarMeta = (id) => {
    const nuevas = metas.map((g) => (g.id === id ? { ...g, hecha: !g.hecha } : g));
    guardarMetas(nuevas);
  };

  const handleEliminarMeta = (id) => {
    eliminarMeta(id);
    setAviso('Meta eliminada');
  };

  const handleEliminarMateria = (id) => {
    eliminarMateria(id);
    const metasActualizadas = metas.map((g) => (g.materiaId === id ? { ...g, materiaId: '' } : g));
    guardarMetas(metasActualizadas);
    if (pomoMateria === id) setPomoMateria('');
    setAviso('Materia eliminada');
    setVista('inicio');
  };

  async function handleCerrarSesion() {
    await cerrarSesion();
    setUsuario(null);
  }

  const navActiva = vista === 'materia' || vista === 'examen' ? 'inicio' : vista;

  return (
    <div className="app">
      <main className={`vista-${vista}`}>
        {vista === 'inicio' && <Inicio materias={materias} examenes={examenes} metas={metas} usuario={usuario} onCerrarSesion={handleCerrarSesion} onIrMetas={() => setVista('metas')} onAlternarMeta={alternarMeta} onReacomodar={reacomodar} onAbrirMateria={abrirMateria} onAvanzar={avanzar} onNuevo={nuevoExamen} />}
        {vista === 'metas' && <Metas metas={metas} materias={materias} onAgregar={agregarMeta} onAlternar={alternarMeta} onEliminar={handleEliminarMeta} />}
        {vista === 'pomodoro' && <Pomodoro materias={materias} pomo={pomo} materiaId={pomoMateria} onMateria={setPomoMateria} sesiones={sesiones} />}
        {vista === 'notas' && <Notas materias={materias} onAbrirExamen={abrirExamen} />}
        {vista === 'calendario' && <Calendario examenes={examenes} onAbrir={abrirExamen} />}
        {vista === 'nuevo' && <FormExamen key={preMateria} materiaInicial={preMateria} onGuardar={agregar} />}
        {vista === 'materia' && materiaAbierta && (
          <DetalleMateria materia={materiaAbierta} onVolver={() => setVista('inicio')} onAbrirExamen={abrirExamen} onAgregar={nuevoExamen} onEliminar={handleEliminarMateria} />
        )}
        {vista === 'examen' && examenAbierto && (
          <DetalleExamen examen={examenAbierto} onVolver={() => abrirMateria(examenAbierto.materiaId)} onAvanzar={avanzar} onEliminar={handleEliminarExamen} onNota={guardarNota} onReacomodar={reacomodar} />
        )}
      </main>
      <button className="tema-btn" onClick={() => setTema(tema === 'oscuro' ? 'claro' : 'oscuro')} aria-label={tema === 'oscuro' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} title={tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}>
        <Icono n={tema === 'oscuro' ? 'sol' : 'luna'} tam={20} />
      </button>
      {aviso && <div className="toast" role="status">{aviso}</div>}
      <NavInferior vista={navActiva} onCambiar={(v) => (v === 'nuevo' ? nuevoExamen() : setVista(v))} />
    </div>
  );
}
