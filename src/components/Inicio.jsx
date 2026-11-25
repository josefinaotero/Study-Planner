import Icono from './Icono';
import { COLORES, progresoMateria, proximoExamen, temasDeHoy, atrasadosDe, ETIQUETA } from '../utils/plan';
import { diasHasta, textoDias } from '../utils/fechas';

export default function Inicio({ materias, examenes, metas, onAbrirMateria, onAvanzar, onNuevo, onIrMetas, onAlternarMeta, onReacomodar }) {
  const hoy = temasDeHoy(examenes);
  const atrasados = atrasadosDe(examenes);
  const pendientes = metas.filter((m) => !m.hecha).sort((a, b) => (a.fecha || '9999').localeCompare(b.fecha || '9999')).slice(0, 3);

  return (
    <>
      <header className="saludo">
        <p>Buen día</p>
        <h1>Tu plan de estudio</h1>
        <div className="acciones">
          <button className="btn" onClick={() => onNuevo()}><Icono n="mas" tam={18} /> Agregar examen</button>
          <button className="btn btn--sec" onClick={onIrMetas}><Icono n="meta" tam={18} /> Agregar meta</button>
        </div>
      </header>

      {atrasados.length > 0 && (
        <section className="alerta" aria-labelledby="h-atraso">
          <div>
            <strong id="h-atraso">{atrasados.length === 1 ? 'Tenés 1 tema atrasado' : `Tenés ${atrasados.length} temas atrasados`}</strong>
            <ul>
              {atrasados.slice(0, 3).map((t) => (
                <li key={`${t.examen.id}-${t.id}`}>{t.nombre} <small>· {t.examen.materia}, {t.examen.tipo}</small></li>
              ))}
            </ul>
            {atrasados.length > 3 && <small>y {atrasados.length - 3} más</small>}
          </div>
          <button className="btn btn--alerta" onClick={() => onReacomodar()}>Reacomodar plan</button>
        </section>
      )}

      <div className="inicio">
        <section className="inicio__hoy" aria-labelledby="h-hoy">
          <h2 id="h-hoy">Hoy toca</h2>
          {hoy.length === 0 ? (
            <p className="vacio">No hay temas para hoy. Agregá un examen y armamos el plan.</p>
          ) : (
            <ul className="lista">
              {hoy.map((t) => (
                <li key={`${t.examen.id}-${t.id}`} className="fila">
                  <span className="punto" style={{ background: COLORES[t.examen.color].bg }} />
                  <div className="fila__texto">
                    <strong>{t.nombre}</strong>
                    <small>{t.examen.materia} · {t.examen.tipo}</small>
                  </div>
                  <button className="chip" onClick={() => onAvanzar(t.examen.materiaId, t.examen.id, t.id)} aria-label={`Avanzar ${t.nombre}, estado actual ${ETIQUETA[t.estado]}`}>
                    {ETIQUETA[t.estado]}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="inicio__metas" aria-labelledby="h-metas-i">
          <h2 id="h-metas-i">Metas pendientes</h2>
          {pendientes.length === 0 ? (
            <p className="vacio">No tenés metas pendientes.</p>
          ) : (
            <ul className="lista">
              {pendientes.map((m) => (
                <li key={m.id} className="fila">
                  <label className="meta">
                    <input type="checkbox" checked={m.hecha} onChange={() => onAlternarMeta(m.id)} />
                    <span className="fila__texto"><strong>{m.titulo}</strong></span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <button className="enlace" onClick={onIrMetas}>Ver todas las metas</button>
        </section>

        <section className="inicio__materias" aria-labelledby="h-mat">
          <h2 id="h-mat">Materias</h2>
          {materias.length === 0 ? (
            <div className="vacio">
              <p>Todavía no agregaste ninguna materia.</p>
              <button className="btn" onClick={() => onNuevo()}>Agregar examen</button>
            </div>
          ) : (
            <div className="grilla">
              {materias.map((m) => {
                const c = COLORES[m.color];
                const p = progresoMateria(m);
                const prox = proximoExamen(m);
                const n = m.examenes.length;
                return (
                  <button key={m.id} className="tarjeta" style={{ background: c.bg, color: c.fg }} onClick={() => onAbrirMateria(m.id)}>
                    <span className="tarjeta__dias">{prox ? `${prox.tipo} · ${textoDias(diasHasta(prox.fecha)).toLowerCase()}` : 'Sin exámenes próximos'}</span>
                    <span className="tarjeta__nombre">{m.nombre}</span>
                    <span className="barra" role="img" aria-label={`Progreso ${p}%`}>
                      <span style={{ width: `${p}%`, background: c.fg }} />
                    </span>
                    <span className="tarjeta__pie">{p}% · {n} {n === 1 ? 'examen' : 'exámenes'}</span>
                    <span className="tarjeta__flecha" style={{ color: c.bg }}><Icono n="flecha" tam={16} /></span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
