from rest_framework import serializers
from .models import Incidencia, Comentario


class IncidenciaSerializer(serializers.ModelSerializer):
    total_comentarios = serializers.SerializerMethodField()

    class Meta:
        model = Incidencia
        fields = '__all__'
        read_only_fields = ['id', 'creado_en']

    def get_total_comentarios(self, obj):
        # viene anotado desde la vista; si no, se calcula
        if hasattr(obj, 'total_comentarios'):
            return obj.total_comentarios
        return obj.comentarios.count()


class ComentarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comentario
        fields = ['id', 'incidencia', 'autor', 'texto', 'creado_en']
        read_only_fields = ['id', 'incidencia', 'creado_en']
        extra_kwargs = {'autor': {'required': False, 'allow_blank': True}}

    def validate_autor(self, value):
        return value.strip() or 'Anónimo'
