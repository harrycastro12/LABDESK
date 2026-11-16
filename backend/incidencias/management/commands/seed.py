from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from incidencias.models import Incidencia, Comentario

# (título, descripción, categoría, prioridad, estado, responsable, ubicación,
#  horas hasta la fecha límite [negativo = ya pasó, None = sin fecha], comentarios)
DATOS = [
    ('PC no enciende', 'La computadora de la estación 3 no da señal al presionar el botón de encendido.',
     'hardware', 'alta', 'pendiente', 'Carlos Quispe', 'Laboratorio 1', -24,
     [('Carlos Quispe', 'Se revisó el cable de poder, está en buen estado.'),
      ('Laura Vega', 'Se pidió una fuente de poder nueva al almacén.')]),
    ('Python no abre', 'Al ejecutar Python en la PC 7 aparece un error y se cierra la ventana.',
     'software', 'media', 'en_proceso', 'Laura Vega', 'Laboratorio 2', 6,
     [('Laura Vega', 'Se está reinstalando Python 3.12.')]),
    ('Wi-Fi lento', 'La red del laboratorio va muy lenta y las páginas tardan en cargar.',
     'red', 'alta', 'pendiente', 'Mario Ríos', 'Laboratorio 1', 48, []),
    ('Teclado defectuoso', 'Algunas teclas del teclado de la PC 12 no responden.',
     'hardware', 'baja', 'resuelto', 'Carlos Quispe', 'Laboratorio 3', -72,
     [('Carlos Quispe', 'Teclado reemplazado, funciona correctamente.')]),
    ('Navegador desactualizado', 'El navegador de la PC 5 está desactualizado y muestra advertencias.',
     'software', 'media', 'resuelto', 'Mario Ríos', 'Laboratorio 2', -48,
     [('Mario Ríos', 'Navegador actualizado a la última versión.')]),
    ('Proyector sin imagen', 'El proyector del aula enciende pero no muestra la señal de la laptop.',
     'hardware', 'media', 'pendiente', 'Laura Vega', 'Aula Magna', -48,
     [('Laura Vega', 'Se probó con otro cable HDMI, sigue sin señal.')]),
    ('Sin internet en Laboratorio 3', 'Ninguna PC del laboratorio 3 tiene conexión a internet.',
     'red', 'alta', 'en_proceso', 'Mario Ríos', 'Laboratorio 3', 3,
     [('Mario Ríos', 'El switch del laboratorio no responde, se está revisando.')]),
    ('Mouse no responde', 'El mouse de la PC 9 se queda congelado constantemente.',
     'hardware', 'baja', 'pendiente', 'Carlos Quispe', 'Laboratorio 1', 72, []),
    ('Visual Studio Code no instala', 'El instalador de VS Code falla al 80% en la PC 14.',
     'software', 'media', 'pendiente', 'Laura Vega', 'Laboratorio 2', -6, []),
    ('Impresora atascada', 'La impresora de secretaría tiene papel atascado y no imprime.',
     'hardware', 'media', 'resuelto', 'Carlos Quispe', 'Secretaría', -24,
     [('Carlos Quispe', 'Se retiró el papel atascado y se limpió el rodillo.')]),
    ('Antivirus bloquea Python', 'El antivirus marca como amenaza los scripts de Python de los alumnos.',
     'software', 'alta', 'en_proceso', 'Laura Vega', 'Laboratorio 2', 20,
     [('Laura Vega', 'Se agregó la carpeta de trabajo a las exclusiones.')]),
    ('Cable de red dañado', 'El cable de red de la PC 3 está cortado cerca del conector.',
     'red', 'media', 'resuelto', 'Mario Ríos', 'Laboratorio 1', -12,
     [('Mario Ríos', 'Se cambió el cable y se probó la conexión.')]),
    ('Monitor parpadea', 'El monitor de la PC 11 parpadea cada pocos segundos.',
     'hardware', 'alta', 'en_proceso', 'Carlos Quispe', 'Laboratorio 3', 96,
     [('Carlos Quispe', 'Se cambió el cable VGA, el parpadeo continúa.')]),
    ('Licencia de Office vencida', 'Office pide activar licencia en todas las PC de dirección.',
     'software', 'baja', 'pendiente', 'Laura Vega', 'Dirección', None, []),
    ('Router sin energía', 'El router principal de la sala de servidores se apagó y no vuelve a encender.',
     'red', 'alta', 'resuelto', 'Mario Ríos', 'Sala de servidores', -96,
     [('Mario Ríos', 'Se reemplazó el adaptador de corriente.')]),
]


class Command(BaseCommand):
    help = 'Carga las incidencias de prueba (usa --reset para borrar y recargar)'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='Borra todo y vuelve a cargar')

    def handle(self, *args, **opts):
        # Usuario de prueba para el login (solo desarrollo académico)
        User = get_user_model()
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@labdesk.local', 'admin123')
            self.stdout.write('Usuario creado: admin / admin123')

        if opts['reset']:
            Incidencia.objects.all().delete()
        elif Incidencia.objects.exists():
            self.stdout.write('Ya hay datos. Usa: python manage.py seed --reset')
            return

        ahora = timezone.now()
        for t, d, c, p, e, resp, ubi, horas, comentarios in DATOS:
            limite = None if horas is None else ahora + timedelta(hours=horas)
            inc = Incidencia.objects.create(
                titulo=t, descripcion=d, categoria=c, prioridad=p, estado=e,
                responsable=resp, ubicacion=ubi, fecha_limite=limite,
            )
            for autor, texto in comentarios:
                Comentario.objects.create(incidencia=inc, autor=autor, texto=texto)

        self.stdout.write(self.style.SUCCESS(f'{len(DATOS)} incidencias creadas.'))