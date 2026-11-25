import { sumarDias } from '../utils/fechas';

const temas = (lista, estados = []) =>
  lista.map((nombre, i) => ({ id: `t${i}`, nombre, estado: estados[i] || 'pendiente' }));

// Datos de muestra. Cada materia tiene un código de invitación y una lista de miembros
// (se usarán para los colaboradores cuando conectemos Firestore).
export const ejemplo = () => [
  {
    id: 'm1', nombre: 'Historia', color: 'coral', codigo: 'HIS482', miembros: ['yo'],
    examenes: [
      { id: 'e5', tipo: '1er parcial', creado: sumarDias(-40), fecha: sumarDias(-20), nota: 6, temas: temas(['Edad Moderna', 'Ilustración', 'Revolución Francesa'], ['dominado', 'dominado', 'dominado']) },
      { id: 'e1', tipo: '2do parcial', creado: sumarDias(-3), fecha: sumarDias(9), temas: temas(['Revolución Industrial', 'Primera Guerra Mundial', 'Crisis del 30', 'Segunda Guerra Mundial', 'Guerra Fría', 'Descolonización'], ['visto', 'pendiente']) },
    ],
  },
  {
    id: 'm2', nombre: 'Matemática', color: 'ambar', codigo: 'MAT715', miembros: ['yo'],
    examenes: [
      { id: 'e6', tipo: 'Trabajo práctico', creado: sumarDias(-30), fecha: sumarDias(-15), nota: 8.5, temas: temas(['Funciones', 'Gráficos'], ['dominado', 'dominado']) },
      { id: 'e2', tipo: '1er parcial', creado: sumarDias(-2), fecha: sumarDias(4), temas: temas(['Límites', 'Derivadas', 'Regla de la cadena', 'Integrales'], ['dominado', 'repasado']) },
      { id: 'e4', tipo: 'Final', creado: sumarDias(-1), fecha: sumarDias(70), temas: temas(['Series', 'Ecuaciones diferenciales']) },
    ],
  },
  {
    id: 'm3', nombre: 'Diseño de interacción', color: 'violeta', codigo: 'DIS903', miembros: ['yo'],
    examenes: [
      { id: 'e3', tipo: 'Trabajo práctico', creado: sumarDias(-1), fecha: sumarDias(16), temas: temas(['Heurísticas de Nielsen', 'Wireframes', 'Prototipado', 'Test de usabilidad', 'Accesibilidad']) },
    ],
  },
];

export const ejemploMetas = () => [
  { id: 'g1', titulo: 'Repasar derivadas antes del parcial', materiaId: 'm2', fecha: sumarDias(3), hecha: false },
  { id: 'g2', titulo: 'Estudiar 3 temas de Historia esta semana', materiaId: 'm1', fecha: sumarDias(6), hecha: false },
  { id: 'g3', titulo: 'Armar un resumen de las heurísticas', materiaId: 'm3', fecha: '', hecha: true },
];
