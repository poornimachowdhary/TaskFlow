from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

urlpatterns = [
    # Authentication
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/profile/', views.UserProfileView.as_view(), name='profile'),
    
    # Projects
    path('projects/', views.ProjectListCreateView.as_view(), name='project-list'),
    path('projects/<int:pk>/', views.ProjectDetailView.as_view(), name='project-detail'),
    path('projects/<int:project_id>/labels/', views.LabelListCreateView.as_view(), name='label-list'),
    
    # Tasks
    path('tasks/', views.TaskListCreateView.as_view(), name='task-list'),
    path('tasks/<int:pk>/', views.TaskDetailView.as_view(), name='task-detail'),
    path('tasks/status-update/', views.TaskStatusUpdateView.as_view(), name='task-status-update'),
    path('tasks/search/', views.search_tasks, name='task-search'),
    
    # Comments
    path('tasks/<int:task_id>/comments/', views.CommentListCreateView.as_view(), name='comment-list'),
    
    # Analytics
    path('analytics/dashboard/', views.AnalyticsDashboardView.as_view(), name='analytics-dashboard'),
    path('analytics/behavior/', views.UserBehaviorTrackingView.as_view(), name='behavior-tracking'),
    
    # Kanban Board
    path('kanban/<int:project_id>/', views.kanban_board_data, name='kanban-board'),
]
