# LabDesk 2.0 — Django REST Framework + React

Sistema de seguimiento de incidencias de laboratorio: responsables, ubicación, fecha límite,
historial de comentarios, alertas de vencimiento y dashboard. Persistencia en SQLite.

## Requisitos
- Python 3.10+ y pip
- Node.js 18+ y npm

## 1. Backend (Terminal A)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # fish: source .venv/bin/activate.fish
                                 # Windows PowerShell: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate         # crea/actualiza las tablas (incluye LabDesk 2.0)
python manage.py seed --reset    # carga 5 incidencias de prueba con comentarios
python manage.py runserver
```
API: http://127.0.0.1:8000/api/incidencias/

## 2. Frontend (Terminal B)
```bash
cd frontend
npm install
npm run dev
```
Web: http://localhost:5173

## Endpoints
| Método | URL | Operación |
|---|---|---|
| GET | /api/incidencias/ | Listar |
| POST | /api/incidencias/ | Crear |
| PUT | /api/incidencias/{id}/ | Editar |
| PATCH | /api/incidencias/{id}/ | Cambiar estado |
| DELETE | /api/incidencias/{id}/ | Eliminar |
| GET | /api/incidencias/{id}/comentarios/ | Historial de comentarios |
| POST | /api/incidencias/{id}/comentarios/ | Agregar comentario |

## Reglas de alertas
- **Vencida**: `fecha_limite` ya pasó y el estado no es `resuelto`.
- **Próxima a vencer**: vence en las próximas 24 h y no está resuelta.
- Una incidencia resuelta nunca se muestra como vencida.
- Porcentaje de resolución = resueltas / total × 100 (0 % si no hay incidencias).

## Estructura
```
backend/incidencias/   models.py, serializers.py, views.py, management/commands/seed.py
frontend/src/          api.js, utils.js, App.jsx, components/ (Dashboard, IncidenciaForm, IncidenciaCard, Detalle)
```

Proyecto académico local: sin autenticación, no desplegar con DEBUG=True.
