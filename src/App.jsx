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
  const [usuario, setUsuario] = useState(undefined); // undefined = cargando, null = no logueado
  const [onboardingVisto, setOnboardingVisto] = useState(() => {
    try { return localStorage.getItem('onboarding') === 'ok'; } catch { return false; }
  });
  const [materias, setMaterias] = useState([]);
  const [metas, setMetas] = useState([]);
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

  const pomo = usePomodoro((modo) => {
    if (modo === 'enfoque') {
      setSesiones((prev) => [...prev, { id: crypto.randomUUID(), fecha: hoyISO(), materiaId: pomoMateria, minutos: MODOS.enfoque.min }]);
      setAviso('¡Pomodoro completado! Tomate un descanso.');
    } else {
      setAviso('Terminó el descanso.');
    }
    pitido();
  });

  // Escuchar cambios de sesión de Firebase
  useEffect(() => {
    if (!firebaseListo) {
      console.info('Firebase sin configurar: completá el archivo .env');
      setUsuario(null);
      return;
    }
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

  // Pantalla de carga mientras Firebase resuelve la sesión
  if (usuario === undefined) {
    return (
      <div className="app" style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
        <span style={{ opacity: 0.4, fontSize: '0.9rem' }}>Study Planner…</span>
      </div>
    );
  }

  // Si no hay sesión, mostrar pantalla de login
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
    setMaterias((prev) =>
      existente
        ? prev.map((m) => (m.id === id ? { ...m, examenes: [...m.examenes, examen] } : m))
        : [...prev, { id, nombre: materia, color: colorCatalogo || colorNuevo(prev.length), codigo: codigoNuevo(), miembros: ['yo'], examenes: [examen] }]
    );
    setAviso('Examen guardado');
    abrirMateria(id);
  };

  const cambiarExamen = (mId, eId, fn) =>
    setMaterias((prev) => prev.map((m) => (m.id !== mId ? m : { ...m, examenes: m.examenes.map((e) => (e.id !== eId ? e : fn(e))) })));

  const avanzar = (mId, eId, tId) =>
    cambiarExamen(mId, eId, (e) => ({
      ...e,
      temas: e.temas.map((t) => (t.id !== tId ? t : { ...t, estado: ESTADOS[(ESTADOS.indexOf(t.estado) + 1) % ESTADOS.length] })),
    }));

  const guardarNota = (mId, eId, nota) => {
    cambiarExamen(mId, eId, (e) => {
      const { nota: _anterior, ...resto } = e;
      return nota === null ? resto : { ...resto, nota };
    });
    setAviso(nota === null ? 'Nota quitada' : 'Nota guardada');
  };

  const reacomodar = (soloExamenId) => {
    const ids = soloExamenId ? new Set([soloExamenId]) : new Set(atrasadosDe(examenes).map((t) => t.examen.id));
    setMaterias((prev) => prev.map((m) => ({ ...m, examenes: m.examenes.map((e) => (ids.has(e.id) ? { ...e, creado: hoyISO() } : e)) })));
    setAviso('Plan reacomodado desde hoy');
  };

  const eliminarExamen = (mId, eId) => {
    setMaterias((prev) => prev.map((m) => (m.id === mId ? { ...m, examenes: m.examenes.filter((e) => e.id !== eId) } : m)));
    setAviso('Examen eliminado');
    abrirMateria(mId);
  };

  const agregarMeta = ({ titulo, materiaId: mId, fecha }) => {
    setMetas((prev) => [...prev, { id: crypto.randomUUID(), titulo, materiaId: mId, fecha, hecha: false }]);
    setAviso('Meta agregada');
  };
  const alternarMeta = (id) => setMetas((prev) => prev.map((g) => (g.id === id ? { ...g, hecha: !g.hecha } : g)));
  const eliminarMeta = (id) => {
    setMetas((prev) => prev.filter((g) => g.id !== id));
    setAviso('Meta eliminada');
  };

  const eliminarMateria = (id) => {
    setMaterias((prev) => prev.filter((m) => m.id !== id));
    setMetas((prev) => prev.map((g) => (g.materiaId === id ? { ...g, materiaId: '' } : g)));
    if (pomoMateria === id) setPomoMateria('');
    setAviso('Materia eliminada');
    setVista('inicio');
  };

  const navActiva = vista === 'materia' || vista === 'examen' ? 'inicio' : vista;

  async function handleCerrarSesion() {
    await cerrarSesion();
    setUsuario(null);
  }

  return (
    <div className="app">
      <main className={`vista-${vista}`}>
        {vista === 'inicio' && <Inicio materias={materias} examenes={examenes} metas={metas} usuario={usuario} onCerrarSesion={handleCerrarSesion} onIrMetas={() => setVista('metas')} onAlternarMeta={alternarMeta} onReacomodar={reacomodar} onAbrirMateria={abrirMateria} onAvanzar={avanzar} onNuevo={nuevoExamen} />}
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
      </main>
      <button className="tema-btn" onClick={() => setTema(tema === 'oscuro' ? 'claro' : 'oscuro')} aria-label={tema === 'oscuro' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} title={tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}>
        <Icono n={tema === 'oscuro' ? 'sol' : 'luna'} tam={20} />
      </button>
      {aviso && <div className="toast" role="status">{aviso}</div>}
      <NavInferior vista={navActiva} onCambiar={(v) => (v === 'nuevo' ? nuevoExamen() : setVista(v))} />
    </div>
  );
}
