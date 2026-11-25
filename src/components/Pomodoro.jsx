import { MODOS, mmss } from '../hooks/usePomodoro';
import { hoyISO } from '../utils/fechas';

const R = 90;
const CIRC = 2 * Math.PI * R;

export default function Pomodoro({ materias, pomo, materiaId, onMateria, sesiones }) {
  const total = MODOS[pomo.modo].min * 60;
  const hoy = sesiones.filter((s) => s.fecha === hoyISO());
  const minHoy = hoy.reduce((a, s) => a + s.minutos, 0);
  const porMateria = [...materias.map((m) => ({ id: m.id, nombre: m.nombre })), { id: '', nombre: 'Sin materia' }]
    .map((m) => ({ ...m, min: sesiones.filter((s) => s.materiaId === m.id).reduce((a, s) => a + s.minutos, 0) }))
    .filter((m) => m.min > 0);

  return (
    <>
      <header className="saludo">
        <p>{hoy.length} {hoy.length === 1 ? 'pomodoro' : 'pomodoros'} hoy · {minHoy} min</p>
        <h1>Pomodoro</h1>
      </header>

      <div className="pomo">
        <div className="opciones" role="group" aria-label="Modo del temporizador">
          {Object.entries(MODOS).map(([id, m]) => (
            <button key={id} className={`opcion-btn${pomo.modo === id ? ' opcion-btn--on' : ''}`} aria-pressed={pomo.modo === id} onClick={() => pomo.cambiarModo(id)}>
              {m.texto} · {m.min} min
            </button>
          ))}
        </div>

        <div className="anillo" role="timer" aria-label={`Quedan ${mmss(pomo.restante)}`}>
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r={R} className="anillo__fondo" />
            <circle cx="100" cy="100" r={R} className="anillo__avance" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pomo.restante / total)} transform="rotate(-90 100 100)" />
          </svg>
          <span className="anillo__tiempo">{mmss(pomo.restante)}</span>
        </div>

        <label className="pomo__materia">
          ¿Qué estás estudiando?
          <select value={materiaId} onChange={(e) => onMateria(e.target.value)}>
            <option value="">Sin materia</option>
            {materias.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </label>

        <div className="acciones">
          {pomo.corriendo ? (
            <button className="btn" onClick={pomo.pausar}>Pausar</button>
          ) : (
            <button className="btn" onClick={pomo.iniciar}>{pomo.restante < total ? 'Continuar' : 'Iniciar'}</button>
          )}
          <button className="btn btn--sec" onClick={pomo.reiniciar}>Reiniciar</button>
        </div>
      </div>

      <section aria-labelledby="h-tiempo">
        <h2 id="h-tiempo">Tiempo estudiado por materia</h2>
        {porMateria.length === 0 ? (
          <p className="vacio">Completá un pomodoro de enfoque y va a aparecer acá.</p>
        ) : (
          <ul className="lista">
            {porMateria.map((m) => (
              <li key={m.id || 'x'} className="fila"><div className="fila__texto"><strong>{m.nombre}</strong></div><span className="chip chip--fijo">{m.min} min</span></li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
