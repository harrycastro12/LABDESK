from django.db.models import Count
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Incidencia
from .serializers import IncidenciaSerializer, ComentarioSerializer


class IncidenciaViewSet(viewsets.ModelViewSet):
    queryset = Incidencia.objects.annotate(
        total_comentarios=Count('comentarios')
    ).order_by('-creado_en')
    serializer_class = IncidenciaSerializer

    # GET  /api/incidencias/<id>/comentarios/  -> historial
    # POST /api/incidencias/<id>/comentarios/  -> nuevo comentario
    @action(detail=True, methods=['get', 'post'], url_path='comentarios')
    def comentarios(self, request, pk=None):
        incidencia = self.get_object()
        if request.method == 'POST':
            serializer = ComentarioSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(incidencia=incidencia)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        serializer = ComentarioSerializer(incidencia.comentarios.all(), many=True)
        return Response(serializer.data)
