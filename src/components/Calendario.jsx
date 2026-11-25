import { useState } from 'react';
import Icono from './Icono';
import { COLORES } from '../utils/plan';
import { aISO, hoyISO, diasHasta, formatoCorto } from '../utils/fechas';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function Calendario({ examenes, onAbrir }) {
  const [mes, setMes] = useState(() => {
    const h = new Date();
    return new Date(h.getFullYear(), h.getMonth(), 1);
  });
  const hoy = hoyISO();
  const vacias = (mes.getDay() + 6) % 7;
  const total = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  const titulo = mes.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  const cambiar = (n) => setMes(new Date(mes.getFullYear(), mes.getMonth() + n, 1));

  const celdas = [...Array(vacias).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const proximos = examenes.filter((e) => diasHasta(e.fecha) >= 0).sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <>
      <header className="saludo"><h1>Calendario</h1></header>
      <div className="cal-cols">
      <section className="cal" aria-label={`Calendario de ${titulo}`}>
        <div className="cal__cabeza">
          <button className="icono-btn" onClick={() => cambiar(-1)} aria-label="Mes anterior"><Icono n="atras" tam={18} /></button>
          <strong>{titulo}</strong>
          <button className="icono-btn icono-btn--der" onClick={() => cambiar(1)} aria-label="Mes siguiente"><Icono n="atras" tam={18} /></button>
        </div>
        <div className="cal__grilla">
          {DIAS.map((d) => <span key={d} className="cal__dia-sem">{d}</span>)}
          {celdas.map((n, i) => {
            if (!n) return <span key={`v${i}`} />;
            const iso = aISO(new Date(mes.getFullYear(), mes.getMonth(), n));
            const delDia = examenes.filter((e) => e.fecha === iso);
            const c = delDia.length ? COLORES[delDia[0].color] : null;
            return (
              <button key={iso} className={`cal__num${iso === hoy ? ' cal__num--hoy' : ''}`} style={c ? { background: c.bg, color: c.fg } : undefined} disabled={!delDia.length} onClick={() => onAbrir(delDia[0].id)} aria-label={delDia.length ? `${n}: ${delDia.map((e) => e.materia).join(', ')}` : String(n)}>
                {n}
                {delDia.length > 1 && <i className="cal__mas">+{delDia.length - 1}</i>}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="h-prox">
        <h2 id="h-prox">Próximos exámenes</h2>
        {proximos.length === 0 ? (
          <p className="vacio">No tenés exámenes por delante.</p>
        ) : (
          <ul className="lista">
            {proximos.map((e) => (
              <li key={e.id}>
                <button className="fila fila--btn" onClick={() => onAbrir(e.id)}>
                  <span className="fecha-bloque" style={{ background: COLORES[e.color].bg, color: COLORES[e.color].fg }}>{formatoCorto(e.fecha)}</span>
                  <div className="fila__texto"><strong>{e.materia}</strong><small>{e.tipo} · {e.temas.length} temas</small></div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      </div>
    </>
  );
}
