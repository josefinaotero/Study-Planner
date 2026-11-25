import { COLORES, promedioMateria, promedioGeneral, fmtNota } from '../utils/plan';
import { diasHasta, formatoCorto } from '../utils/fechas';

function estado(e) {
  if (typeof e.nota === 'number') return `Nota ${fmtNota(e.nota)} · ${e.nota >= 4 ? 'Aprobado' : 'Desaprobado'}`;
  return diasHasta(e.fecha) > 0 ? 'Todavía no rendiste' : 'Sin nota cargada';
}

export default function Notas({ materias, onAbrirExamen }) {
  const general = promedioGeneral(materias);
  const conNota = materias.filter((m) => promedioMateria(m) !== null).length;

  return (
    <>
      <header className="saludo">
        <p>Notas y promedio</p>
        <h1>Notas</h1>
      </header>

      <section className="resumen" aria-label="Promedio general">
        <span className="resumen__num">{fmtNota(general)}</span>
        <span>Promedio general{conNota ? ` · ${conNota} ${conNota === 1 ? 'materia' : 'materias'} con nota` : ''}</span>
      </section>

      {materias.map((m) => {
        const prom = promedioMateria(m);
        const ex = [...m.examenes].sort((a, b) => a.fecha.localeCompare(b.fecha));
        return (
          <section key={m.id} aria-labelledby={`n-${m.id}`}>
            <h2 id={`n-${m.id}`} className="titulo-materia">
              <span><i className="punto punto--chico" style={{ background: COLORES[m.color].bg }} /> {m.nombre}</span>
              <span className="promedio">Promedio {fmtNota(prom)}</span>
            </h2>
            {ex.length === 0 ? (
              <p className="vacio">Sin exámenes.</p>
            ) : (
              <ul className="lista">
                {ex.map((e) => (
                  <li key={e.id}>
                    <button className="fila fila--btn" onClick={() => onAbrirExamen(e.id)}>
                      <span className="fecha-bloque" style={{ background: COLORES[m.color].bg, color: COLORES[m.color].fg }}>{formatoCorto(e.fecha)}</span>
                      <div className="fila__texto"><strong>{e.tipo}</strong><small>{estado(e)}</small></div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
      {materias.length === 0 && <p className="vacio">Agregá una materia para empezar a cargar notas.</p>}
    </>
  );
}
