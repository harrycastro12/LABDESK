import { useEffect, useState } from 'react'
import { aInputFecha } from '../utils'

const vacio = {
  titulo: '',
  descripcion: '',
  categoria: 'hardware',
  prioridad: 'media',
  estado: 'pendiente',
  responsable: '',
  ubicacion: '',
  fecha_limite: '',
}

export default function IncidenciaForm({ editando, guardando, onGuardar, onCancelar }) {
  const [form, setForm] = useState(vacio)
  const [errorLocal, setErrorLocal] = useState('')

  useEffect(() => {
    if (editando) {
      setForm({
        titulo: editando.titulo,
        descripcion: editando.descripcion,
        categoria: editando.categoria,
        prioridad: editando.prioridad,
        estado: editando.estado,
        responsable: editando.responsable || '',
        ubicacion: editando.ubicacion || '',
        fecha_limite: aInputFecha(editando.fecha_limite),
      })
    } else {
      setForm(vacio)
    }
    setErrorLocal('')
  }, [editando])

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function enviar(e) {
    e.preventDefault()
    if (!form.titulo.trim() || !form.descripcion.trim()) {
      return setErrorLocal('El título y la descripción son obligatorios.')
    }
    setErrorLocal('')
    const datos = {
      ...form,
      fecha_limite: form.fecha_limite ? new Date(form.fecha_limite).toISOString() : null,
    }
    const ok = await onGuardar(datos)
    if (ok) setForm(vacio)
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <h2>{editando ? `Editar incidencia #${editando.id}` : 'Nueva incidencia'}</h2>
      {errorLocal && <div className="error">{errorLocal}</div>}

      <label>
        Título *
        <input name="titulo" value={form.titulo} onChange={cambiar} maxLength={120} required />
      </label>
      <label>
        Descripción *
        <textarea name="descripcion" value={form.descripcion} onChange={cambiar} rows={3} required />
      </label>

      <div className="fila">
        <label>
          Categoría
          <select name="categoria" value={form.categoria} onChange={cambiar}>
            <option value="hardware">Hardware</option>
            <option value="software">Software</option>
            <option value="red">Red / Internet</option>
          </select>
        </label>
        <label>
          Prioridad
          <select name="prioridad" value={form.prioridad} onChange={cambiar}>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </label>
        <label>
          Estado
          <select name="estado" value={form.estado} onChange={cambiar}>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En proceso</option>
            <option value="resuelto">Resuelto</option>
          </select>
        </label>
      </div>

      <div className="fila">
        <label>
          Responsable
          <input name="responsable" value={form.responsable} onChange={cambiar} maxLength={100} />
        </label>
        <label>
          Ubicación
          <input name="ubicacion" value={form.ubicacion} onChange={cambiar} maxLength={100} placeholder="Ej: Laboratorio 2" />
        </label>
        <label>
          Fecha límite
          <input type="datetime-local" name="fecha_limite" value={form.fecha_limite} onChange={cambiar} />
        </label>
      </div>

      <div className="acciones">
        <button type="submit" className="btn btn-primario" disabled={guardando}>
          {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear incidencia'}
        </button>
        <button type="button" className="btn" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  )
}
