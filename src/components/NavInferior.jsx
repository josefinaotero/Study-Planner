import Icono from './Icono';

const ITEMS = [
  { id: 'inicio', texto: 'Inicio', icono: 'inicio' },
  { id: 'calendario', texto: 'Calendario', icono: 'calendario' },
  { id: 'metas', texto: 'Metas', icono: 'meta' },
  { id: 'pomodoro', texto: 'Pomodoro', icono: 'reloj' },
  { id: 'notas', texto: 'Notas', icono: 'notas' },
  { id: 'nuevo', texto: 'Nuevo examen', corto: 'Examen', icono: 'mas' },
];

export default function NavInferior({ vista, onCambiar }) {
  return (
    <nav className="nav" aria-label="Principal">
      <p className="nav__marca">Planificador</p>
      {ITEMS.map((it) => (
        <button
          key={it.id}
          className={vista === it.id ? 'nav__btn nav__btn--on' : 'nav__btn'}
          onClick={() => onCambiar(it.id)}
          aria-current={vista === it.id ? 'page' : undefined}
          aria-label={it.texto}
        >
          <Icono n={it.icono} />
          <span className="nav__largo" aria-hidden="true">{it.texto}</span>
          <span className="nav__corto" aria-hidden="true">{it.corto || it.texto}</span>
        </button>
      ))}
    </nav>
  );
}
