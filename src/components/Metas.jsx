import { useState } from 'react';
import Icono from './Icono';
import { COLORES } from '../utils/plan';
import { diasHasta, hoyISO, masUnAnio, formatoCorto, textoDias } from '../utils/fechas';

export default function Metas({ metas, materias, onAgregar, onAlternar, onEliminar }) {
  const [titulo, setTitulo] = useState('');
  const [materiaId, setMateriaId] = useState('');
  const [fecha, setFecha] = useState('');
  const [errores, setErrores] = useState({});

  const hechas = metas.filter((m) => m.hecha).length;
  const pct = metas.length ? Math.round((hechas / metas.length) * 100) : 0;
  const ordenadas = [...metas].sort((a, b) => Number(a.hecha) - Number(b.hecha) || (a.fecha || '9999').localeCompare(b.fecha || '9999'));

  function enviar(e) {
    e.preventDefault();
    const err = {};
    if (!titulo.trim()) err.titulo = 'Escribí la meta.';
    else if (titulo.trim().length > 80) err.titulo = 'Usá hasta 80 caracteres.';
    if (fecha && diasHasta(fecha) < 0) err.fecha = 'La fecha ya pasó. Elegí una de hoy en adelante.';
    else if (fecha && fecha > masUnAnio()) err.fecha = `Elegí una fecha dentro del próximo año (hasta el ${formatoCorto(masUnAnio())}).`;
    setErrores(err);
    if (Object.keys(err).length) return;
    onAgregar({ titulo: titulo.trim(), materiaId, fecha });
    setTitulo(''); setMateriaId(''); setFecha('');
  }

  return (
    <>
      <header className="saludo">
        <p>{metas.length ? `${hechas} de ${metas.length} cumplidas` : 'Sin metas todavía'}</p>
        <h1>Metas de estudio</h1>
      </header>
      {metas.length > 0 && <span className="mini mini--grande" role="img" aria-label={`${pct}% de metas cumplidas`}><span style={{ width: `${pct}%` }} /></span>}

      <form className="form form--meta" onSubmit={enviar} noValidate>
        <label>
          Nueva meta
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Terminar el resumen de Historia" maxLength={90} aria-invalid={!!errores.titulo} />
          {errores.titulo && <span className="error" role="alert">{errores.titulo}</span>}
        </label>
        <label>
          Materia (opcional)
          <select value={materiaId} onChange={(e) => setMateriaId(e.target.value)}>
            <option value="">General (sin materia)</option>
            {materias.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </label>
        <label>
          Fecha límite (opcional)
          <input type="date" min={hoyISO()} max={masUnAnio()} value={fecha} onChange={(e) => setFecha(e.target.value)} aria-invalid={!!errores.fecha} />
          {errores.fecha && <span className="error" role="alert">{errores.fecha}</span>}
        </label>
        <button className="btn" type="submit"><Icono n="mas" tam={18} /> Agregar meta</button>
      </form>

      <section aria-labelledby="h-metas">
        <h2 id="h-metas">Tus metas</h2>
        {ordenadas.length === 0 ? (
          <p className="vacio">Agregá tu primera meta, por ejemplo “repasar 2 temas por día”.</p>
        ) : (
          <ul className="lista">
            {ordenadas.map((m) => {
              const mat = materias.find((x) => x.id === m.materiaId);
              return (
                <li key={m.id} className={`fila${m.hecha ? ' fila--ok' : ''}`}>
                  <label className="meta">
                    <input type="checkbox" checked={m.hecha} onChange={() => onAlternar(m.id)} />
                    <span className="fila__texto">
                      <strong className={m.hecha ? 'tachado' : ''}>{m.titulo}</strong>
                      <small>
                        {mat ? <><i className="punto punto--chico" style={{ background: COLORES[mat.color].bg }} /> {mat.nombre}</> : 'General'}
                        {m.fecha && ` · ${formatoCorto(m.fecha)} (${textoDias(diasHasta(m.fecha)).toLowerCase()})`}
                      </small>
                    </span>
                  </label>
                  <button className="icono-btn" onClick={() => onEliminar(m.id)} aria-label={`Eliminar meta ${m.titulo}`}><Icono n="basura" tam={18} /></button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
