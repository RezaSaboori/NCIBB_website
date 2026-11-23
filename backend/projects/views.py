from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from .models import Project, ProjectTask, ProjectComment, ProjectFile
from .serializers import (
    ProjectSerializer, 
    ProjectListSerializer, 
    ProjectCreateUpdateSerializer,
    ProjectTaskSerializer,
    ProjectTaskCreateUpdateSerializer,
    ProjectCommentSerializer,
    ProjectCommentCreateUpdateSerializer,
    ProjectFileSerializer
)
from authentication.permissions import IsOwnerOrReadOnly
from apps.user_management.access import is_admin
from django.shortcuts import get_object_or_404


def accessible_project(user, project_id):
    projects = Project.objects.all()
    if not is_admin(user):
        projects = projects.filter(Q(owner=user) | Q(collaborators=user)).distinct()
    return get_object_or_404(projects, pk=project_id)


class ProjectListView(generics.ListCreateAPIView):
    serializer_class = ProjectListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'priority', 'owner']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'start_date', 'end_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if is_admin(user):
            return Project.objects.all()
        return Project.objects.filter(
            Q(owner=user) | Q(collaborators=user)
        ).distinct()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProjectCreateUpdateSerializer
        return ProjectListSerializer
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProjectCreateUpdateSerializer
        return ProjectSerializer
    
    def get_queryset(self):
        user = self.request.user
        if is_admin(user):
            return Project.objects.all()
        return Project.objects.filter(
            Q(owner=user) | Q(collaborators=user)
        ).distinct()


class ProjectTaskListView(generics.ListCreateAPIView):
    serializer_class = ProjectTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'assigned_to']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        project_id = self.kwargs['project_id']
        user = self.request.user
        
        # Check if user has access to the project
        try:
            project = Project.objects.get(id=project_id)
            if not is_admin(user) and project.owner != user and user not in project.collaborators.all():
                return ProjectTask.objects.none()
            return ProjectTask.objects.filter(project=project)
        except Project.DoesNotExist:
            return ProjectTask.objects.none()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProjectTaskCreateUpdateSerializer
        return ProjectTaskSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['project'] = accessible_project(self.request.user, self.kwargs['project_id'])
        return context


class ProjectTaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs['project_id']
        user = self.request.user
        
        # Check if user has access to the project
        try:
            project = Project.objects.get(id=project_id)
            if not is_admin(user) and project.owner != user and user not in project.collaborators.all():
                return ProjectTask.objects.none()
            return ProjectTask.objects.filter(project=project)
        except Project.DoesNotExist:
            return ProjectTask.objects.none()


class ProjectCommentListView(generics.ListCreateAPIView):
    serializer_class = ProjectCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering = ['-created_at']
    
    def get_queryset(self):
        project_id = self.kwargs['project_id']
        user = self.request.user
        
        # Check if user has access to the project
        try:
            project = Project.objects.get(id=project_id)
            if not is_admin(user) and project.owner != user and user not in project.collaborators.all():
                return ProjectComment.objects.none()
            return ProjectComment.objects.filter(project=project)
        except Project.DoesNotExist:
            return ProjectComment.objects.none()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProjectCommentCreateUpdateSerializer
        return ProjectCommentSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['project'] = accessible_project(self.request.user, self.kwargs['project_id'])
        return context


class ProjectFileListView(generics.ListCreateAPIView):
    serializer_class = ProjectFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['-created_at']
    
    def get_queryset(self):
        project_id = self.kwargs['project_id']
        user = self.request.user
        
        # Check if user has access to the project
        try:
            project = Project.objects.get(id=project_id)
            if not is_admin(user) and project.owner != user and user not in project.collaborators.all():
                return ProjectFile.objects.none()
            return ProjectFile.objects.filter(project=project)
        except Project.DoesNotExist:
            return ProjectFile.objects.none()
    
    def perform_create(self, serializer):
        project = Project.objects.get(id=self.kwargs['project_id'])
        serializer.save(project=project, uploaded_by=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def project_stats_view(request):
    """Get project statistics for dashboard"""
    user = request.user
    
    if is_admin(user):
        projects = Project.objects.all()
    else:
        projects = Project.objects.filter(
            Q(owner=user) | Q(collaborators=user)
        ).distinct()
    
    stats = {
        'total_projects': projects.count(),
        'active_projects': projects.filter(status='active').count(),
        'completed_projects': projects.filter(status='completed').count(),
        'draft_projects': projects.filter(status='draft').count(),
        'overdue_projects': sum(1 for p in projects.filter(status='active') if p.is_overdue),
    }
    
    return Response(stats)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_collaborator_view(request, project_id):
    """Add collaborator to project"""
    try:
        project = Project.objects.get(id=project_id)
        
        # Check if user is owner or admin
        if project.owner != request.user and not is_admin(request.user):
            return Response(
                {"error": "Only project owner or admin can add collaborators"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {"error": "user_id is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from authentication.models import User
        try:
            user = User.objects.get(id=user_id)
            project.collaborators.add(user)
            return Response({
                "message": f"Successfully added {user.get_full_name()} as collaborator"
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
    except Project.DoesNotExist:
        return Response(
            {"error": "Project not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )