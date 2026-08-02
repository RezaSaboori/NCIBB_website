from rest_framework import serializers
from .models import DatasazProject


class DatasazProjectSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)

    class Meta:
        model = DatasazProject
        fields = [
            'id', 'owner', 'owner_name', 'name', 'estimated_count',
            'current_step', 'status', 'step2_definition',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'owner', 'owner_name', 'created_at', 'updated_at']