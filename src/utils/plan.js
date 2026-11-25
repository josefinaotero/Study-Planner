import { diasHasta, sumarDias, hoyISO, sumarDesde, diasEntre } from './fechas';

export const ESTADOS = ['pendiente', 'visto', 'repasado', 'dominado'];
export const ETIQUETA = { pendiente: 'Pendiente', visto: 'Visto', repasado: 'Repasado', dominado: 'Dominado' };

export const COLORES = {
  violeta: { bg: '#6D4AFF', fg: '#FFFFFF' },
  coral: { bg: '#FF6B5E', fg: '#FFFFFF' },
  ambar: { bg: '#FFC24B', fg: '#1B1740' },
  verde: { bg: '#4FBF6B', fg: '#10301A' },
};

// Porcentaje de avance: cada tema suma según su estado (0, 1/3, 2/3, 1).
export function progreso(examen) {
  if (!examen.temas.length) return 0;
  const suma = examen.temas.reduce((a, t) => a + ESTADOS.indexOf(t.estado), 0);
  return Math.round((suma / (examen.temas.length * 3)) * 100);
}

// Reparte los temas no dominados entre hoy y el día anterior al examen.
// Se recalcula desde hoy en cada render: si te atrasás, el plan se reacomoda solo.
export function armarPlan(examen) {
  const faltan = diasHasta(examen.fecha);
  if (faltan < 0) return [];
  const pendientes = examen.temas.filter((t) => t.estado !== 'dominado');
  const dias = Math.max(faltan, 1);
  const porDia = Math.max(Math.ceil(pendientes.length / dias), 1);
  return pendientes.map((t, i) => ({
    ...t,
    fecha: sumarDias(Math.min(Math.floor(i / porDia), dias - 1)),
  }));
}

export function temasDeHoy(examenes) {
  const hoy = hoyISO();
  return examenes.flatMap((e) =>
    armarPlan(e)
      .filter((t) => t.fecha === hoy)
      .map((t) => ({ ...t, examen: e }))
  );
}

const ROTACION = ['violeta', 'coral', 'ambar', 'verde'];
const NOMBRES = ['Matemática', 'Física', 'Química', 'Biología', 'Historia', 'Lengua y Literatura', 'Inglés', 'Economía', 'Derecho', 'Psicología', 'Estadística', 'Programación', 'Desarrollo Frontend', 'Diseño de interacción', 'Comunicación audiovisual', 'Edición de video'];
export const CATALOGO = NOMBRES.map((nombre, i) => ({ nombre, color: ROTACION[i % ROTACION.length] }));
export const colorNuevo = (cantidad) => ROTACION[cantidad % ROTACION.length];
export const TIPOS = ['1er parcial', '2do parcial', 'Recuperatorio', 'Final', 'Trabajo práctico'];

export const codigoNuevo = () => Math.random().toString(36).slice(2, 8).toUpperCase();

// Convierte materias con exámenes anidados en una lista plana de exámenes.
export const aplanar = (materias) =>
  materias.flatMap((m) => m.examenes.map((e) => ({ ...e, materiaId: m.id, materia: m.nombre, color: m.color })));

export const progresoMateria = (m) =>
  m.examenes.length ? Math.round(m.examenes.reduce((a, e) => a + progreso(e), 0) / m.examenes.length) : 0;

export const proximoExamen = (m) =>
  [...m.examenes].filter((e) => diasHasta(e.fecha) >= 0).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];

// Plan original: reparte todos los temas desde el día en que se creó (o reacomodó) el examen.
// Un tema está atrasado si debía verse antes de hoy y sigue pendiente.
export function temasAtrasados(examen) {
  if (diasHasta(examen.fecha) < 0 || !examen.temas.length) return [];
  const base = examen.creado || hoyISO();
  const dias = Math.max(diasEntre(base, examen.fecha), 1);
  const porDia = Math.ceil(examen.temas.length / dias);
  const hoy = hoyISO();
  return examen.temas.filter((t, i) => {
    const prevista = sumarDesde(base, Math.min(Math.floor(i / porDia), dias - 1));
    return t.estado === 'pendiente' && prevista < hoy;
  });
}
export const atrasadosDe = (examenes) =>
  examenes.flatMap((e) => temasAtrasados(e).map((t) => ({ ...t, examen: e })));

// Notas
const media = (lista) => (lista.length ? lista.reduce((a, b) => a + b, 0) / lista.length : null);
export const promedioMateria = (m) => media(m.examenes.filter((e) => typeof e.nota === 'number').map((e) => e.nota));
export const promedioGeneral = (materias) => media(materias.map(promedioMateria).filter((p) => p !== null));
export const fmtNota = (n) =>
  n === null || n === undefined ? '—' : n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
