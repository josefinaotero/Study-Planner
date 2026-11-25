import { useEffect, useRef, useState } from 'react';

export const MODOS = {
  enfoque: { texto: 'Enfoque', min: 25 },
  corto: { texto: 'Descanso corto', min: 5 },
  largo: { texto: 'Descanso largo', min: 15 },
};

export const mmss = (seg) => `${String(Math.floor(seg / 60)).padStart(2, '0')}:${String(seg % 60).padStart(2, '0')}`;

// El tiempo se calcula contra la hora de finalización, así no se desfasa si la pestaña queda en segundo plano.
export function usePomodoro(onTermina) {
  const [modo, setModo] = useState('enfoque');
  const [restante, setRestante] = useState(MODOS.enfoque.min * 60);
  const [corriendo, setCorriendo] = useState(false);
  const fin = useRef(0);
  const alTerminar = useRef(onTermina);

  useEffect(() => { alTerminar.current = onTermina; });

  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => {
      const r = Math.max(0, Math.round((fin.current - Date.now()) / 1000));
      setRestante(r);
      if (r === 0) {
        setCorriendo(false);
        alTerminar.current(modo);
      }
    }, 250);
    return () => clearInterval(id);
  }, [corriendo, modo]);

  const iniciar = () => { fin.current = Date.now() + restante * 1000; setCorriendo(true); };
  const pausar = () => setCorriendo(false);
  const cambiarModo = (m) => { setCorriendo(false); setModo(m); setRestante(MODOS[m].min * 60); };
  const reiniciar = () => { setCorriendo(false); setRestante(MODOS[modo].min * 60); };

  return { modo, restante, corriendo, iniciar, pausar, cambiarModo, reiniciar };
}
