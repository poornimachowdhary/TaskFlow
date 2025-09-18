from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta
import json

from .models import User, Project, Task, Label, Comment, ActivityLog, UserBehavior
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer,
    ProjectSerializer, TaskSerializer, CommentSerializer, 
    ActivityLogSerializer, UserBehaviorSerializer, TaskStatusUpdateSerializer,
    LabelSerializer
)


class RegisterView(APIView):
    """User registration endpoint"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """User login endpoint"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            # Log login behavior
            UserBehavior.objects.create(
                user=user,
                action_type='user_login',
                metadata={'ip_address': request.META.get('REMOTE_ADDR')}
            )
            
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile management"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ProjectListCreateView(generics.ListCreateAPIView):
    """List and create projects"""
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'scrum_master':
            return Project.objects.filter(Q(created_by=user) | Q(members=user)).distinct()
        else:
            return Project.objects.filter(members=user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Project detail, update, and delete"""
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'scrum_master':
            return Project.objects.filter(Q(created_by=user) | Q(members=user)).distinct()
        else:
            return Project.objects.filter(members=user)


class TaskListCreateView(generics.ListCreateAPIView):
    """List and create tasks"""
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.request.query_params.get('project')
        status_filter = self.request.query_params.get('status')
        
        queryset = Task.objects.select_related('project', 'assigned_to', 'created_by').prefetch_related('labels', 'comments')
        
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by user permissions
        user = self.request.user
        if user.role == 'employee':
            queryset = queryset.filter(project__members=user)
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Task detail, update, and delete"""
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'scrum_master':
            return Task.objects.filter(project__created_by=user)
        else:
            return Task.objects.filter(project__members=user)


class TaskStatusUpdateView(APIView):
    """Update task status with drag and drop"""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        serializer = TaskStatusUpdateSerializer(data=request.data)
        if serializer.is_valid():
            task_id = serializer.validated_data['task_id']
            new_status = serializer.validated_data['status']
            
            try:
                task = Task.objects.get(id=task_id)
                old_status = task.status
                task.status = new_status
                task.save()
                
                # Log the status change
                ActivityLog.objects.create(
                    task=task,
                    user=request.user,
                    action='status_changed',
                    description=f'Status changed from {old_status} to {new_status}',
                    old_value=old_status,
                    new_value=new_status
                )
                
                # Log behavior
                UserBehavior.objects.create(
                    user=request.user,
                    action_type='task_status_update',
                    task=task,
                    metadata={'old_status': old_status, 'new_status': new_status}
                )
                
                return Response(TaskSerializer(task).data)
            except Task.DoesNotExist:
                return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentListCreateView(generics.ListCreateAPIView):
    """List and create comments for a task"""
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        task_id = self.kwargs['task_id']
        return Comment.objects.filter(task_id=task_id).select_related('author')

    def perform_create(self, serializer):
        task_id = self.kwargs['task_id']
        task = Task.objects.get(id=task_id)
        serializer.save(author=self.request.user, task=task)
        
        # Log comment creation
        ActivityLog.objects.create(
            task=task,
            user=self.request.user,
            action='commented',
            description=f'Added comment: {serializer.validated_data["content"][:50]}...'
        )


class LabelListCreateView(generics.ListCreateAPIView):
    """List and create labels for a project"""
    serializer_class = LabelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        return Label.objects.filter(project_id=project_id)

    def perform_create(self, serializer):
        project_id = self.kwargs['project_id']
        project = Project.objects.get(id=project_id)
        serializer.save(project=project)


class AnalyticsDashboardView(APIView):
    """Analytics dashboard with key metrics"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = self.request.user
        project_id = request.query_params.get('project')
        
        # Base queryset
        tasks_queryset = Task.objects.all()
        if project_id:
            tasks_queryset = tasks_queryset.filter(project_id=project_id)
        
        # Task statistics
        total_tasks = tasks_queryset.count()
        completed_tasks = tasks_queryset.filter(status='done').count()
        in_progress_tasks = tasks_queryset.filter(status='in_progress').count()
        todo_tasks = tasks_queryset.filter(status='todo').count()
        
        # User-specific metrics
        user_tasks = tasks_queryset.filter(assigned_to=user)
        user_completed = user_tasks.filter(status='done').count()
        user_in_progress = user_tasks.filter(status='in_progress').count()
        
        # Time-based analytics
        now = timezone.now()
        last_week = now - timedelta(days=7)
        last_month = now - timedelta(days=30)
        
        recent_completions = tasks_queryset.filter(
            status='done',
            updated_at__gte=last_week
        ).count()
        
        # Priority distribution
        priority_stats = tasks_queryset.values('priority').annotate(count=Count('id'))
        
        # Status distribution
        status_stats = tasks_queryset.values('status').annotate(count=Count('id'))
        
        # User behavior analytics
        user_behaviors = UserBehavior.objects.filter(user=user)
        total_actions = user_behaviors.count()
        recent_actions = user_behaviors.filter(timestamp__gte=last_week).count()
        
        # Productivity score (simple calculation)
        productivity_score = 0
        if total_tasks > 0:
            completion_rate = (completed_tasks / total_tasks) * 100
            productivity_score = min(100, completion_rate + (recent_actions * 2))
        
        return Response({
            'overview': {
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'in_progress_tasks': in_progress_tasks,
                'todo_tasks': todo_tasks,
                'completion_rate': round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 2)
            },
            'user_metrics': {
                'assigned_tasks': user_tasks.count(),
                'completed_tasks': user_completed,
                'in_progress_tasks': user_in_progress,
                'productivity_score': round(productivity_score, 2)
            },
            'recent_activity': {
                'tasks_completed_this_week': recent_completions,
                'user_actions_this_week': recent_actions,
                'total_user_actions': total_actions
            },
            'distributions': {
                'priority': list(priority_stats),
                'status': list(status_stats)
            }
        })


class UserBehaviorTrackingView(APIView):
    """Track user behavior for analytics"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        data['user'] = request.user.id
        
        serializer = UserBehaviorSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def kanban_board_data(request, project_id):
    """Get data for Kanban board view"""
    try:
        project = Project.objects.get(id=project_id)
        
        # Check if user has access to this project
        user = request.user
        if user.role == 'employee' and user not in project.members.all():
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get tasks grouped by status
        tasks_by_status = {}
        for status_code, status_name in Task.STATUS_CHOICES:
            tasks = Task.objects.filter(
                project=project,
                status=status_code
            ).select_related('assigned_to', 'created_by').prefetch_related('labels')
            
            tasks_by_status[status_code] = {
                'name': status_name,
                'count': tasks.count(),
                'tasks': TaskSerializer(tasks, many=True).data
            }
        
        return Response(tasks_by_status)
    
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_tasks(request):
    """Search tasks across projects"""
    query = request.query_params.get('q', '')
    project_id = request.query_params.get('project')
    
    if not query:
        return Response({'tasks': []})
    
    queryset = Task.objects.filter(
        Q(title__icontains=query) | Q(description__icontains=query)
    )
    
    if project_id:
        queryset = queryset.filter(project_id=project_id)
    
    # Filter by user permissions
    user = request.user
    if user.role == 'employee':
        queryset = queryset.filter(project__members=user)
    
    tasks = queryset.select_related('project', 'assigned_to').prefetch_related('labels')[:20]
    
    return Response({
        'tasks': TaskSerializer(tasks, many=True).data
    })
