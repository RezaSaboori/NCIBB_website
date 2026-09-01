import json

from django.http import StreamingHttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .graph import stream_datayab_search
from .serializers import DatayabSearchSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def datayab_search(request):
    """Semantic (RAG) search over the databases catalog; streams agent progress as SSE."""
    serializer = DatayabSearchSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def event_stream():
        for event in stream_datayab_search(
            serializer.validated_data["query"],
            top_k=serializer.validated_data.get("top_k"),
        ):
            yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"

    response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response