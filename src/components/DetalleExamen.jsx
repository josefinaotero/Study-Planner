import { useState } from 'react';
import Icono from './Icono';
import { COLORES, ETIQUETA, armarPlan, progreso, temasAtrasados, fmtNota } from '../utils/plan';
import { diasHasta, formatoLargo, hoyISO } from '../utils/fechas';

function FormNota({ examen, onNota }) {
  const [valor, setValor] = useState(typeof examen.nota === 'number' ? String(examen.nota).replace('.', ',') : '');
  const [error, setError] = useState('');

  if (diasHasta(examen.fecha) > 0) return <p className="aviso">Vas a poder cargar la nota desde el día del examen.</p>;

  function guardar(e) {
    e.preventDefault();
    const n = Number(valor.trim().replace(',', '.'));
    if (valor.trim() === '' || Number.isNaN(n) || n < 0 || n > 10) {
      setError('Ingresá una nota entre 0 y 10.');
      return;
    }
    setError('');
    onNota(examen.materiaId, examen.id, Math.round(n * 100) / 100);
  }

  return (
    <form className="form form--meta" onSubmit={guardar} noValidate>
      <label>
        Nota obtenida (0 a 10)
        <input inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Ej: 7,5" aria-invalid={!!error} />
        {error && <span className="error" role="alert">{error}</span>}
      </label>
      {typeof examen.nota === 'number' && (
        <p className="aviso">Nota guardada: {fmtNota(examen.nota)} · {examen.nota >= 4 ? 'Aprobado' : 'Desaprobado'}</p>
      )}
      <div className="acciones">
        <button className="btn" type="submit">Guardar nota</button>
        {typeof examen.nota === 'number' && (
          <button type="button" className="btn btn--sec" onClick={() => { setValor(''); onNota(examen.materiaId, examen.id, null); }}>Quitar nota</button>
        )}
      </div>
    </form>
  );
}

export default function DetalleExamen({ examen, onVolver, onAvanzar, onEliminar, onNota, onReacomodar }) {
  const c = COLORES[examen.color];
  const p = progreso(examen);
  const faltan = diasHasta(examen.fecha);
  const plan = armarPlan(examen);
  const atrasados = new Set(temasAtrasados(examen).map((t) => t.id));
  const dominados = examen.temas.filter((t) => t.estado === 'dominado');
  const porDia = plan.reduce((acc, t) => ({ ...acc, [t.fecha]: [...(acc[t.fecha] || []), t] }), {});

  function borrar() {
    if (window.confirm(`¿Eliminar el examen ${examen.tipo} de ${examen.materia}? No se puede deshacer.`)) onEliminar(examen.materiaId, examen.id);
  }

  return (
    <>
      <button className="volver" onClick={onVolver}><Icono n="atras" tam={18} /> Volver</button>
      <header className="portada" style={{ background: c.bg, color: c.fg }}>
        <small>{examen.tipo}</small>
        <h1>{examen.materia}</h1>
        <p>{faltan < 0 ? 'El examen ya pasó' : faltan === 0 ? 'Rendís hoy' : `Rendís el ${formatoLargo(examen.fecha)}`}</p>
        <span className="barra" role="img" aria-label={`Progreso ${p}%`}><span style={{ width: `${p}%`, background: c.fg }} /></span>
        <small>{p}% de avance · {dominados.length} de {examen.temas.length} temas dominados</small>
      </header>

      {atrasados.size > 0 && (
        <section className="alerta" aria-label="Temas atrasados">
          <div>
            <strong>{atrasados.size === 1 ? '1 tema atrasado' : `${atrasados.size} temas atrasados`}</strong>
            <small>Debías verlos antes de hoy y siguen pendientes.</small>
          </div>
          <button className="btn btn--alerta" onClick={() => onReacomodar(examen.id)}>Reacomodar plan</button>
        </section>
      )}

      <section aria-labelledby="h-plan">
        <h2 id="h-plan">Plan por día</h2>
        <p className="aviso">El plan se recalcula desde hoy: si te atrasás, los temas se reparten en los días que quedan.</p>
        {Object.keys(porDia).length === 0 ? (
          <p className="vacio">{faltan < 0 ? 'Este examen ya pasó.' : '¡Dominaste todos los temas!'}</p>
        ) : (
          Object.entries(porDia).map(([fecha, temas]) => (
            <div key={fecha} className="dia">
              <h3>{fecha === hoyISO() ? 'Hoy' : formatoLargo(fecha)}</h3>
              <ul className="lista">
                {temas.map((t) => (
                  <li key={t.id} className="fila">
                    <div className="fila__texto">
                      <strong>{t.nombre}</strong>
                      {atrasados.has(t.id) && <small className="atraso">Atrasado</small>}
                    </div>
                    <button className="chip" onClick={() => onAvanzar(examen.materiaId, examen.id, t.id)} aria-label={`Avanzar ${t.nombre}, estado actual ${ETIQUETA[t.estado]}`}>{ETIQUETA[t.estado]}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      {dominados.length > 0 && (
        <section aria-labelledby="h-dom">
          <h2 id="h-dom">Dominados</h2>
          <ul className="lista">
            {dominados.map((t) => (
              <li key={t.id} className="fila fila--ok">
                <div className="fila__texto"><strong>{t.nombre}</strong></div>
                <button className="chip chip--ok" onClick={() => onAvanzar(examen.materiaId, examen.id, t.id)} aria-label={`Volver a pendiente ${t.nombre}`}>Dominado</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="h-nota">
        <h2 id="h-nota">Nota</h2>
        <FormNota key={examen.id} examen={examen} onNota={onNota} />
      </section>

      <button className="btn btn--peligro" onClick={borrar}><Icono n="basura" tam={18} /> Eliminar examen</button>
    </>
  );
}
