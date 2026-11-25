import { useState } from 'react';
import { CATALOGO, TIPOS } from '../utils/plan';
import { diasHasta, hoyISO, masUnAnio, formatoCorto } from '../utils/fechas';

const OTRA = '__otra__';

function Opciones({ nombre, valores, actual, onElegir }) {
  return (
    <div className="opciones">
      {valores.map((v) => (
        <label key={v.valor} className="opcion">
          <input type="radio" name={nombre} value={v.valor} checked={actual === v.valor} onChange={() => onElegir(v.valor)} />
          <span>{v.texto}</span>
        </label>
      ))}
    </div>
  );
}

export default function FormExamen({ materiaInicial = '', onGuardar }) {
  const enCatalogo = CATALOGO.some((m) => m.nombre === materiaInicial);
  const [materia, setMateria] = useState(materiaInicial ? (enCatalogo ? materiaInicial : OTRA) : '');
  const [otra, setOtra] = useState(enCatalogo ? '' : materiaInicial);
  const [tipo, setTipo] = useState('');
  const [fecha, setFecha] = useState('');
  const [texto, setTexto] = useState('');
  const [errores, setErrores] = useState({});

  const lista = texto.split('\n').map((t) => t.trim()).filter(Boolean);
  const dias = fecha && diasHasta(fecha) <= 365 ? Math.max(diasHasta(fecha), 1) : 0;
  const porDia = dias && lista.length ? Math.ceil(lista.length / dias) : 0;

  function enviar(e) {
    e.preventDefault();
    const nombre = materia === OTRA ? otra.trim() : materia;
    const err = {};
    if (!nombre) err.materia = materia === OTRA ? 'Escribí el nombre de la materia.' : 'Elegí una materia.';
    if (!tipo) err.tipo = 'Elegí el tipo de examen.';
    if (!fecha) err.fecha = 'Elegí la fecha del examen.';
    else if (diasHasta(fecha) < 0) err.fecha = 'La fecha ya pasó. Elegí una de hoy en adelante.';
    else if (fecha > masUnAnio()) err.fecha = `Elegí una fecha dentro del próximo año (hasta el ${formatoCorto(masUnAnio())}).`;
    if (lista.length === 0) err.temas = 'Agregá al menos un tema, uno por línea.';
    setErrores(err);
    if (Object.keys(err).length) return;
    onGuardar({
      materia: nombre,
      colorCatalogo: CATALOGO.find((m) => m.nombre === nombre)?.color,
      tipo,
      fecha,
      temas: lista.map((n, i) => ({ id: `t${i}`, nombre: n, estado: 'pendiente' })),
    });
  }

  return (
    <>
      <header className="saludo"><h1>Nuevo examen</h1></header>
      <form className="form" onSubmit={enviar} noValidate>
        <label>
          Materia
          <select value={materia} onChange={(e) => setMateria(e.target.value)} aria-invalid={!!errores.materia}>
            <option value="">Elegí una materia…</option>
            {CATALOGO.map((m) => <option key={m.nombre} value={m.nombre}>{m.nombre}</option>)}
            <option value={OTRA}>Otra…</option>
          </select>
          {materia === OTRA && (
            <input value={otra} onChange={(e) => setOtra(e.target.value)} placeholder="Nombre de la materia" aria-label="Nombre de la materia" aria-invalid={!!errores.materia} />
          )}
          {errores.materia && <span className="error" role="alert">{errores.materia}</span>}
        </label>

        <fieldset>
          <legend>Tipo de examen</legend>
          <Opciones nombre="tipo" actual={tipo} onElegir={setTipo} valores={TIPOS.map((t) => ({ valor: t, texto: t }))} />
          {errores.tipo && <span className="error" role="alert">{errores.tipo}</span>}
        </fieldset>

        <label>
          Fecha del examen
          <input type="date" min={hoyISO()} max={masUnAnio()} value={fecha} onChange={(e) => setFecha(e.target.value)} aria-invalid={!!errores.fecha} />
          <small className="ayuda">Podés elegir hasta un año desde hoy.</small>
          {errores.fecha && <span className="error" role="alert">{errores.fecha}</span>}
        </label>

        <label>
          Temas (uno por línea)
          <textarea rows="6" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={'Revolución Industrial\nPrimera Guerra Mundial'} aria-invalid={!!errores.temas} />
          {errores.temas && <span className="error" role="alert">{errores.temas}</span>}
        </label>

        {porDia > 0 && (
          <p className="aviso">
            {lista.length} {lista.length === 1 ? 'tema' : 'temas'} en {dias} {dias === 1 ? 'día' : 'días'}: unos {porDia} por día.
          </p>
        )}
        <button className="btn" type="submit">Guardar examen</button>
      </form>
    </>
  );
}
