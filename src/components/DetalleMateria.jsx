import Icono from './Icono';
import { COLORES, progreso, progresoMateria, promedioMateria, fmtNota } from '../utils/plan';
import { diasHasta, formatoCorto, textoDias } from '../utils/fechas';

export default function DetalleMateria({ materia, onVolver, onAbrirExamen, onAgregar, onEliminar }) {
  const c = COLORES[materia.color];
  const p = progresoMateria(materia);
  const prom = promedioMateria(materia);
  const examenes = [...materia.examenes].sort((a, b) => a.fecha.localeCompare(b.fecha));

  function borrar() {
    if (window.confirm(`¿Eliminar ${materia.nombre} con todos sus exámenes? No se puede deshacer.`)) onEliminar(materia.id);
  }

  return (
    <>
      <button className="volver" onClick={onVolver}><Icono n="atras" tam={18} /> Volver</button>
      <header className="portada" style={{ background: c.bg, color: c.fg }}>
        <h1>{materia.nombre}</h1>
        <p>{examenes.length} {examenes.length === 1 ? 'examen' : 'exámenes'}</p>
        <span className="barra" role="img" aria-label={`Progreso ${p}%`}><span style={{ width: `${p}%`, background: c.fg }} /></span>
        <small>{p}% de avance promedio</small>
        {prom !== null && <small>Promedio de notas: {fmtNota(prom)}</small>}
      </header>

      <section aria-labelledby="h-ex">
        <h2 id="h-ex">Exámenes</h2>
        {examenes.length === 0 ? (
          <p className="vacio">Esta materia todavía no tiene exámenes.</p>
        ) : (
          <ul className="lista">
            {examenes.map((e) => (
              <li key={e.id}>
                <button className="fila fila--btn" onClick={() => onAbrirExamen(e.id)}>
                  <span className="fecha-bloque" style={{ background: c.bg, color: c.fg }}>{formatoCorto(e.fecha)}</span>
                  <div className="fila__texto">
                    <strong>{e.tipo}</strong>
                    <small>{e.temas.length} temas · {textoDias(diasHasta(e.fecha)).toLowerCase()}{typeof e.nota === 'number' && ` · nota ${fmtNota(e.nota)}`}</small>
                    <span className="mini" role="img" aria-label={`Progreso ${progreso(e)}%`}><span style={{ width: `${progreso(e)}%` }} /></span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
        <button className="btn btn--bloque" onClick={() => onAgregar(materia.nombre)}><Icono n="mas" tam={18} /> Agregar examen</button>
      </section>

      <button className="btn btn--peligro" onClick={borrar}><Icono n="basura" tam={18} /> Eliminar materia</button>
    </>
  );
}
