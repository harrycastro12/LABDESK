const BASE = 'http://127.0.0.1:8000/api/incidencias/'

async function pedir(url, opciones = {}) {
  let r
  try {
    r = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opciones })
  } catch {
    throw new Error('No se pudo conectar con Django. ¿Está encendido en el puerto 8000?')
  }
  if (!r.ok) {
    let detalle = ''
    try {
      const j = await r.json()
      detalle = Object.entries(j)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
        .join(' | ')
    } catch { /* sin cuerpo JSON */ }
    throw new Error(detalle || `Error ${r.status}`)
  }
  if (r.status === 204) return null
  return r.json()
}

const json = (metodo, datos) => ({ method: metodo, body: JSON.stringify(datos) })

export const listar = () => pedir(BASE)
export const crear = (datos) => pedir(BASE, json('POST', datos))
export const actualizar = (id, datos) => pedir(`${BASE}${id}/`, json('PUT', datos))
export const cambiarEstado = (id, estado) => pedir(`${BASE}${id}/`, json('PATCH', { estado }))
export const eliminar = (id) => pedir(`${BASE}${id}/`, { method: 'DELETE' })
export const listarComentarios = (id) => pedir(`${BASE}${id}/comentarios/`)
export const crearComentario = (id, datos) => pedir(`${BASE}${id}/comentarios/`, json('POST', datos))
