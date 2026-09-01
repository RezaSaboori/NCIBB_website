import httpx
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .serializers import DatayabSearchSerializer
from .services import search_databases


@api_view(["POST"])
@permission_classes([AllowAny])
def datayab_search(request):
    """Semantic (RAG) search over the databases catalog via Ollama + ChromaDB."""
    serializer = DatayabSearchSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        results = search_databases(
            serializer.validated_data["query"],
            top_k=serializer.validated_data.get("top_k"),
        )
    except httpx.TimeoutException:
        return Response({"detail": "Ollama service timed out."}, status=status.HTTP_504_GATEWAY_TIMEOUT)
    except httpx.RequestError:
        return Response({"detail": "Ollama service unreachable."}, status=status.HTTP_502_BAD_GATEWAY)
    except RuntimeError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    return Response({"results": results, "count": len(results)})