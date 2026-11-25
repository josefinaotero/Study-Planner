const pad = (n) => String(n).padStart(2, '0');

export const aISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const deISO = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const hoyISO = () => aISO(new Date());
export const sumarDias = (n) => {
  const h = new Date();
  return aISO(new Date(h.getFullYear(), h.getMonth(), h.getDate() + n));
};
export const diasHasta = (iso) => Math.round((deISO(iso) - deISO(hoyISO())) / 86400000);
export const formatoCorto = (iso) =>
  deISO(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }).replace('.', '');
export const formatoLargo = (iso) =>
  deISO(iso).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

// Límite del calendario: un año desde hoy.
export const masUnAnio = () => {
  const h = new Date();
  return aISO(new Date(h.getFullYear() + 1, h.getMonth(), h.getDate()));
};
export const textoDias = (n) =>
  n < 0 ? 'Ya pasó' : n === 0 ? 'Es hoy' : n === 1 ? 'Falta 1 día' : `Faltan ${n} días`;

export const sumarDesde = (iso, n) => {
  const d = deISO(iso);
  return aISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
};
export const diasEntre = (desde, hasta) => Math.round((deISO(hasta) - deISO(desde)) / 86400000);
