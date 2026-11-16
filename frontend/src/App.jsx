import { useEffect, useState } from 'react'
import { actualizar, cambiarEstado, crear, eliminar, listar } from './api'
import { alertaVencimiento } from './utils'
import Dashboard from './components/Dashboard'
import IncidenciaForm from './components/IncidenciaForm'
import IncidenciaCard from './components/IncidenciaCard'
import Detalle from './components/Detalle'
import Icon from './components/Icon'

const FILTROS_ESTADO = [
  ['todos', 'Todas'],
  ['pendiente', 'Pendientes'],
  ['en_proceso', 'En proceso'],
  ['resuelto', 'Resueltas'],
]

export default function App() {
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [formAbierto, setFormAbierto] = useState(false)
  const [detalleId, setDetalleId] = useState(null)

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroPrioridad, setFiltroPrioridad] = useState('todas')
  const [soloVencidas, setSoloVencidas] = useState(false)

  async function cargar() {
    try {
      setDatos(await listar())
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  function cerrarForm() {
    setFormAbierto(false)
    setEditandoId(null)
  }

  async function guardar(datosForm) {
    setGuardando(true)
    try {
      if (editandoId === null) await crear(datosForm)
      else await actualizar(editandoId, datosForm)
      cerrarForm()
      await cargar()
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarEstadoItem(id, estado) {
    try {
      await cambiarEstado(id, estado)
      await cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  async function eliminarItem(id) {
    if (!window.confirm('¿Eliminar la incidencia?')) return
    try {
      await eliminar(id)
      if (editandoId === id) cerrarForm()
      if (detalleId === id) setDetalleId(null)
      await cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  function editarItem(id) {
    setEditandoId(id)
    setFormAbierto(true)
  }

  const editando = datos.find((x) => x.id === editandoId) || null
  const detalle = datos.find((x) => x.id === detalleId) || null

  const filtrados = datos.filter((item) => {
    const texto = `${item.titulo} ${item.descripcion} ${item.responsable} ${item.ubicacion}`.toLowerCase()
    return (
      texto.includes(busqueda.toLowerCase()) &&
      (filtroEstado === 'todos' || item.estado === filtroEstado) &&
      (filtroPrioridad === 'todas' || item.prioridad === filtroPrioridad) &&
      (!soloVencidas || alertaVencimiento(item) === 'vencida')
    )
  })

  return (
    <>
      <header className="cabecera">
        <div className="cabecera-in">
          <div className="marca">
            <span className="marca-icono"><Icon name="flask" size={24} /></span>
            <div>
              <h1>LabDesk <span>2.0</span></h1>
              <p>Seguimiento de incidencias del laboratorio</p>
            </div>
          </div>
          <button className="btn btn-primario btn-nuevo" onClick={() => { setEditandoId(null); setFormAbierto(true) }}>
            <Icon name="plus" size={18} /> Nueva incidencia
          </button>
        </div>
      </header>

      <main className="contenedor">
        {error && (
          <div className="error" role="alert">
            {error} <button className="link" onClick={() => setError('')}>cerrar</button>
          </div>
        )}

        <Dashboard datos={datos} />

        <section className="barra-herramientas" aria-label="Filtros">
          <div className="buscador">
            <Icon name="search" size={18} />
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por título, responsable o ubicación" aria-label="Buscar incidencias" />
          </div>
          <div className="chips" role="group" aria-label="Estado">
            {FILTROS_ESTADO.map(([valor, texto]) => (
              <button key={valor} className={`chip ${filtroEstado === valor ? 'activo' : ''}`} aria-pressed={filtroEstado === valor} onClick={() => setFiltroEstado(valor)}>
                {texto}
              </button>
            ))}
          </div>
          <select value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value)} aria-label="Prioridad">
            <option value="todas">Todas las prioridades</option>
            <option value="baja">Prioridad baja</option>
            <option value="media">Prioridad media</option>
            <option value="alta">Prioridad alta</option>
          </select>
          <label className={`interruptor ${soloVencidas ? 'activo' : ''}`}>
            <input type="checkbox" checked={soloVencidas} onChange={(e) => setSoloVencidas(e.target.checked)} />
            <span className="pista"><span className="perilla" /></span>
            Solo vencidas
          </label>
        </section>

        <p className="conteo">{filtrados.length} de {datos.length} incidencias</p>

        <section className="lista">
          {cargando && <p className="vacio">Cargando incidencias...</p>}
          {!cargando && filtrados.length === 0 && (
            <p className="vacio">
              {datos.length === 0 ? 'Todavía no hay incidencias. Crea la primera con "Nueva incidencia".' : 'Ninguna incidencia coincide con los filtros.'}
            </p>
          )}
          {filtrados.map((item) => (
            <IncidenciaCard
              key={item.id}
              item={item}
              onDetalle={setDetalleId}
              onEditar={editarItem}
              onEliminar={eliminarItem}
              onEstado={cambiarEstadoItem}
            />
          ))}
        </section>
      </main>

      {formAbierto && (
        <div className="fondo-modal" onClick={cerrarForm}>
          <div className="modal tarjeta" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <IncidenciaForm editando={editando} guardando={guardando} onGuardar={guardar} onCancelar={cerrarForm} />
          </div>
        </div>
      )}

      {detalle && <Detalle incidencia={detalle} onCerrar={() => setDetalleId(null)} onCambio={cargar} />}
    </>
  )
}
