import httpx
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404

from .models import DatasazProject
from .serializers import DatasazProjectSerializer

_ONTOLOGY_BASE = getattr(settings, "ONTOLOGY_API_URL", "http://127.0.0.1:5175")


@api_view(["GET"])
@permission_classes([AllowAny])
def autocomplete_proxy(request):
    """
    Server-side proxy to the Ontology Autocomplete FastAPI service.
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


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def project_list(request):
    """List all projects for the authenticated user, or create a new one."""
    if request.method == "GET":
        projects = DatasazProject.objects.filter(owner=request.user)
        serializer = DatasazProjectSerializer(projects, many=True)
        return Response(serializer.data)

    serializer = DatasazProjectSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(owner=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def project_detail(request, pk):
    """Retrieve, partially update, or delete a single datasaz project."""
    project = get_object_or_404(DatasazProject, pk=pk, owner=request.user)

    if request.method == "GET":
        return Response(DatasazProjectSerializer(project).data)

    if request.method == "PATCH":
        serializer = DatasazProjectSerializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    project.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def save_step(request, pk):
    """
    Save the state for a specific step and advance current_step if needed.
    Body: { "step": 1|2|3|4, "data": { ...step-specific payload } }
    """
    project = get_object_or_404(DatasazProject, pk=pk, owner=request.user)
    step = request.data.get("step")
    data = request.data.get("data", {})

    if step not in [1, 2, 3, 4]:
        return Response({"detail": "Invalid step."}, status=status.HTTP_400_BAD_REQUEST)

    if step == 1:
        project.name = data.get("name", project.name)
        project.estimated_count = data.get("estimated_count", project.estimated_count)
        if project.status == "draft":
            project.status = "step1_complete"

    elif step == 2:
        project.step2_definition = data.get("definition", project.step2_definition)
        project.status = "step2_complete"

    project.current_step = max(project.current_step, step)
    project.save()
    return Response(DatasazProjectSerializer(project).data)