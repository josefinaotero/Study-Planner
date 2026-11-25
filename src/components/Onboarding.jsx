import { useState } from 'react';

const SLIDES = [
  {
    icono: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="20" fill="#6D4AFF" opacity=".12"/>
        <path d="M20 32h24M32 20v24" stroke="#6D4AFF" strokeWidth="3" strokeLinecap="round"/>
        <rect x="18" y="18" width="28" height="28" rx="8" stroke="#6D4AFF" strokeWidth="2.5"/>
      </svg>
    ),
    titulo: 'Agregá tus exámenes',
    descripcion: 'Creá un examen por materia, elegí la fecha y sumá los temas que tenés que estudiar. La app arma el plan automáticamente.',
  },
  {
    icono: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="20" fill="#6D4AFF" opacity=".12"/>
        <circle cx="32" cy="32" r="14" stroke="#6D4AFF" strokeWidth="2.5"/>
        <path d="M32 24v8l5 3" stroke="#6D4AFF" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    titulo: 'Seguí tu progreso',
    descripcion: 'Cada tema tiene tres estados: Pendiente → Visto → Repasado → Dominado. Avanzá de a uno y la barra de progreso se actualiza sola.',
  },
  {
    icono: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="20" fill="#6D4AFF" opacity=".12"/>
        <rect x="18" y="22" width="28" height="22" rx="4" stroke="#6D4AFF" strokeWidth="2.5"/>
        <path d="M24 18v8M40 18v8M18 30h28" stroke="#6D4AFF" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    titulo: 'Pomodoro y metas',
    descripcion: 'Usá el temporizador Pomodoro para estudiar en bloques de 25 minutos. Sumá metas con fecha para no perder el foco.',
  },
  {
    icono: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="20" fill="#6D4AFF" opacity=".12"/>
        <path d="M20 44l8-8 6 6 10-14" stroke="#6D4AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="44" cy="22" r="6" fill="#6D4AFF" opacity=".2" stroke="#6D4AFF" strokeWidth="2"/>
        <path d="M42 22l1.5 1.5L46 20" stroke="#6D4AFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    titulo: '¡Todo listo!',
    descripcion: 'Tu plan se sincroniza automáticamente con tu cuenta de Google. Podés entrar desde cualquier dispositivo y seguir donde lo dejaste.',
  },
];

export default function Onboarding({ onTerminar }) {
  const [slide, setSlide] = useState(0);
  const ultima = slide === SLIDES.length - 1;
  const { icono, titulo, descripcion } = SLIDES[slide];

  return (
    <div className="ob-pantalla">
      <div className="ob-card">
        {/* Progreso */}
        <div className="ob-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`ob-dot${i === slide ? ' ob-dot--on' : ''}`}
              onClick={() => setSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Contenido */}
        <div className="ob-slide" key={slide}>
          <div className="ob-icono">{icono}</div>
          <h2 className="ob-titulo">{titulo}</h2>
          <p className="ob-desc">{descripcion}</p>
        </div>

        {/* Acciones */}
        <div className="ob-acciones">
          {!ultima && (
            <button className="ob-skip" onClick={onTerminar}>
              Saltar
            </button>
          )}
          <button
            className={`btn ob-next${ultima ? ' ob-next--full' : ''}`}
            onClick={() => (ultima ? onTerminar() : setSlide((s) => s + 1))}
          >
            {ultima ? '¡Empezar!' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  );
}
