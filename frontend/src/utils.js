export const ETIQUETA_ESTADO = { pendiente: 'Pendiente', en_proceso: 'En proceso', resuelto: 'Resuelto' }
export const ETIQUETA_CAT = { hardware: 'Hardware', software: 'Software', red: 'Red / Internet' }

const DIA_MS = 24 * 60 * 60 * 1000

// Devuelve 'vencida', 'proxima' o null. Una incidencia resuelta nunca se alerta.
export function alertaVencimiento(item, ahora = new Date()) {
  if (!item.fecha_limite || item.estado === 'resuelto') return null
  const diferencia = new Date(item.fecha_limite) - ahora
  if (diferencia < 0) return 'vencida'
  if (diferencia <= DIA_MS) return 'proxima'
  return null
}

export function formatearFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })
}

// ISO del servidor -> valor para <input type="datetime-local">
export function aInputFecha(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

// Texto y tipo del "reloj" de vencimiento de cada incidencia.
// Usa la misma regla que alertaVencimiento: una resuelta nunca se muestra como vencida.
export function textoVencimiento(item, ahora = new Date()) {
  if (item.estado === 'resuelto') return { texto: 'Resuelta', tipo: 'resuelta' }
  if (!item.fecha_limite) return { texto: 'Sin fecha límite', tipo: 'ninguna' }
  const dif = new Date(item.fecha_limite) - ahora
  const abs = Math.abs(dif)
  const horas = Math.floor(abs / (60 * 60 * 1000))
  const dias = Math.floor(horas / 24)
  const minutos = Math.max(1, Math.floor(abs / 60000))
  const cantidad = dias >= 1 ? `${dias} d` : horas >= 1 ? `${horas} h` : `${minutos} min`
  if (dif < 0) return { texto: `Venció hace ${cantidad}`, tipo: 'vencida' }
  return { texto: `Vence en ${cantidad}`, tipo: dif <= DIA_MS ? 'proxima' : 'normal' }
}
