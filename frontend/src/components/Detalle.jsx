import { useEffect, useState } from 'react'
import { crearComentario, listarComentarios } from '../api'
import { alertaVencimiento, ETIQUETA_CAT, ETIQUETA_ESTADO, formatearFecha, textoVencimiento } from '../utils'

export default function Detalle({ incidencia, onCerrar, onCambio }) {
  const [comentarios, setComentarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [autor, setAutor] = useState('')
  const [texto, setTexto] = useState('')

  useEffect(() => {
    let activo = true
    setCargando(true)
    listarComentarios(incidencia.id)
      .then((d) => activo && (setComentarios(d), setError('')))
      .catch((e) => activo && setError(e.message))
      .finally(() => activo && setCargando(false))
    return () => { activo = false }
  }, [incidencia.id])

  async function enviar(e) {
    e.preventDefault()
    if (!texto.trim()) return setError('Escribe un comentario.')
    setEnviando(true)
    try {
      const nuevo = await crearComentario(incidencia.id, { autor, texto })
      setComentarios([nuevo, ...comentarios])
      setTexto('')
      setError('')
      onCambio()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const alerta = alertaVencimiento(incidencia)
  const venc = textoVencimiento(incidencia)

  return (
    <div className="fondo-modal" onClick={onCerrar}>
      <div className="modal tarjeta" onClick={(e) => e.stopPropagation()}>
        <div className="incidencia-top">
          <h2>{incidencia.titulo}</h2>
          <button className="btn" onClick={onCerrar}>Cerrar</button>
        </div>

        <div className="badges">
          {alerta === 'vencida' && <span className="badge alerta-vencida">Vencida</span>}
          {alerta === 'proxima' && <span className="badge alerta-proxima">Próxima a vencer</span>}
          <span className={`badge est-${incidencia.estado}`}>{ETIQUETA_ESTADO[incidencia.estado]}</span>
          <span className={`badge prio-${incidencia.prioridad}`}>{incidencia.prioridad}</span>
        </div>

        <div className={`reloj reloj-${venc.tipo}`}><strong>{venc.texto}</strong></div>
        <p>{incidencia.descripcion}</p>
        <ul className="datos-lista">
          <li><strong>Categoría:</strong> {ETIQUETA_CAT[incidencia.categoria]}</li>
          <li><strong>Responsable:</strong> {incidencia.responsable || '—'}</li>
          <li><strong>Ubicación:</strong> {incidencia.ubicacion || '—'}</li>
          <li><strong>Fecha límite:</strong> {formatearFecha(incidencia.fecha_limite)}</li>
          <li><strong>Creada:</strong> {formatearFecha(incidencia.creado_en)}</li>
        </ul>

        <h3>Historial de comentarios</h3>
        {error && <div className="error">{error}</div>}

        <form className="form-comentario" onSubmit={enviar}>
          <input value={autor} onChange={(e) => setAutor(e.target.value)} placeholder="Tu nombre (opcional)" maxLength={100} />
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={2} placeholder="Escribe una acción o novedad..." />
          <button className="btn btn-primario" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Agregar comentario'}
          </button>
        </form>

        {cargando && <p className="vacio">Cargando comentarios...</p>}
        {!cargando && comentarios.length === 0 && <p className="vacio">Aún no hay comentarios.</p>}
        <ul className="comentarios">
          {comentarios.map((c) => (
            <li key={c.id}>
              <div className="comentario-cab">
                <strong>{c.autor}</strong>
                <span>{formatearFecha(c.creado_en)}</span>
              </div>
              <p>{c.texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
