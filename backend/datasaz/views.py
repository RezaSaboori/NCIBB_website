import httpx
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

_ONTOLOGY_BASE = getattr(settings, "ONTOLOGY_API_URL", "http://127.0.0.1:5175")


@api_view(["GET"])
@permission_classes([AllowAny])
def autocomplete_proxy(request):
    """
    Server-side proxy to the Ontology Autocomplete FastAPI service.
    Forwards q / limit / mode query params; returns the JSON response as-is.
    Keeps the FastAPI port off the public network and independent of VS Code tunnels.
    """
    params = {k: v for k, v in request.query_params.items() if k in ("q", "limit", "mode")}

    try:
        with httpx.Client(timeout=8.0) as client:
            resp = client.get(f"{_ONTOLOGY_BASE}/autocomplete", params=params)
        return Response(resp.json(), status=resp.status_code)
    except httpx.TimeoutException:
        return Response({"detail": "Ontology service timed out."}, status=status.HTTP_504_GATEWAY_TIMEOUT)
    except httpx.RequestError:
        return Response({"detail": "Ontology service unreachable."}, status=status.HTTP_502_BAD_GATEWAY)