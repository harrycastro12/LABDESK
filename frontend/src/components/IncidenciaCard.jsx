import { alertaVencimiento, ETIQUETA_CAT, ETIQUETA_ESTADO, textoVencimiento } from '../utils'
import Icon from './Icon'

const ESTADOS = ['pendiente', 'en_proceso', 'resuelto']

export default function IncidenciaCard({ item, onDetalle, onEditar, onEliminar, onEstado }) {
  const alerta = alertaVencimiento(item)
  const venc = textoVencimiento(item)

  return (
    <article className={`tarjeta incidencia riel-${item.prioridad} ${alerta === 'vencida' ? 'borde-vencida' : ''}`}>
      <div className="incidencia-top">
        <h3>{item.titulo}</h3>
        <span className={`badge prio-${item.prioridad}`}>{item.prioridad}</span>
      </div>

      <p className="desc">{item.descripcion}</p>

      <div className="meta">
        <span className="cat">{ETIQUETA_CAT[item.categoria]}</span>
        <span><Icon name="user" />{item.responsable || 'Sin responsable'}</span>
        <span><Icon name="pin" />{item.ubicacion || 'Sin ubicación'}</span>
        <span><Icon name="chat" />{item.total_comentarios ?? 0}</span>
      </div>

      <div className={`reloj reloj-${venc.tipo}`}>
        <Icon name="clock" />
        <strong>{venc.texto}</strong>
        {alerta === 'vencida' && <span className="reloj-aviso">Vencida</span>}
        {alerta === 'proxima' && <span className="reloj-aviso">Próxima a vencer</span>}
      </div>

      <div className="incidencia-pie">
        <div className="segmentado" role="group" aria-label="Cambiar estado">
          {ESTADOS.map((e) => (
            <button
              key={e}
              className={`seg seg-${e} ${item.estado === e ? 'activo' : ''}`}
              aria-pressed={item.estado === e}
              onClick={() => item.estado !== e && onEstado(item.id, e)}
            >
              {ETIQUETA_ESTADO[e]}
            </button>
          ))}
        </div>
        <div className="acciones">
          <button className="btn" onClick={() => onDetalle(item.id)}>Detalle</button>
          <button className="btn" onClick={() => onEditar(item.id)}>Editar</button>
          <button className="btn btn-peligro" onClick={() => onEliminar(item.id)}>Eliminar</button>
        </div>
      </div>
    </article>
  )
}
