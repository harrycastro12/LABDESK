import { alertaVencimiento } from '../utils'

// Anillo de progreso (SVG). 0–100.
function Anillo({ valor }) {
  const r = 38
  const c = 2 * Math.PI * r
  return (
    <svg className="anillo" viewBox="0 0 100 100" role="img" aria-label={`${valor} % resuelto`}>
      <circle cx="50" cy="50" r={r} className="anillo-fondo" />
      <circle cx="50" cy="50" r={r} className="anillo-valor" strokeDasharray={c} strokeDashoffset={c - (c * valor) / 100} transform="rotate(-90 50 50)" />
      <text x="50" y="56" textAnchor="middle" className="anillo-texto">{valor}%</text>
    </svg>
  )
}

export default function Dashboard({ datos }) {
  const total = datos.length
  const cuenta = (campo, valor) => datos.filter((x) => x[campo] === valor).length

  const pendientes = cuenta('estado', 'pendiente')
  const proceso = cuenta('estado', 'en_proceso')
  const resueltos = cuenta('estado', 'resuelto')
  const vencidas = datos.filter((x) => alertaVencimiento(x) === 'vencida').length
  const proximas = datos.filter((x) => alertaVencimiento(x) === 'proxima').length
  const porcentaje = total === 0 ? 0 : Math.round((resueltos / total) * 100)

  const prioridades = [
    ['alta', 'Alta'],
    ['media', 'Media'],
    ['baja', 'Baja'],
  ]

  return (
    <section className="dashboard" aria-label="Resumen">
      <div className="kpis">
        <div className="kpi kpi-total"><span>{total}</span>Total</div>
        <div className="kpi kpi-pendiente"><span>{pendientes}</span>Pendientes</div>
        <div className="kpi kpi-proceso"><span>{proceso}</span>En proceso</div>
        <div className="kpi kpi-resuelto"><span>{resueltos}</span>Resueltos</div>
      </div>

      <div className="paneles">
        <div className="tarjeta panel panel-anillo">
          <Anillo valor={porcentaje} />
          <div>
            <h3>Porcentaje de resolución</h3>
            <p className="dato-suave">{resueltos} de {total} incidencias resueltas</p>
          </div>
        </div>

        <div className="tarjeta panel">
          <h3>Vencimientos</h3>
          <div className="venc">
            <div className="venc-item venc-rojo"><strong>{vencidas}</strong><span>vencidas</span></div>
            <div className="venc-item venc-ambar"><strong>{proximas}</strong><span>vencen en 24 h</span></div>
          </div>
        </div>

        <div className="tarjeta panel">
          <h3>Por prioridad</h3>
          {prioridades.map(([clave, etiqueta]) => {
            const n = cuenta('prioridad', clave)
            const ancho = total === 0 ? 0 : (n / total) * 100
            return (
              <div key={clave} className="fila-barra">
                <span>{etiqueta}</span>
                <div className="barra"><div className={`barra-relleno prio-fondo-${clave}`} style={{ width: `${ancho}%` }} /></div>
                <strong>{n}</strong>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
