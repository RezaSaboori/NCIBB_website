from rest_framework import serializers


class DatayabSearchSerializer(serializers.Serializer):
    query = serializers.CharField(max_length=500, trim_whitespace=True)
    top_k = serializers.IntegerField(required=False, min_value=1, max_value=50)