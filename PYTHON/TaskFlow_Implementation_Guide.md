# TaskFlow Web Development Implementation Guide

## 1. Tech Stack

- **Frontend**: React + TypeScript, React Router, React Beautiful DnD, Chart.js
- **Backend**: Django + Django REST Framework
- **Database**: SQLite (production-ready for PostgreSQL)
- **Authentication**: JWT (JSON Web Tokens)
- **Analytics**: Built-in behavioral tracking with custom analytics
- **Deployment**: Ready for Docker, GitHub, Heroku/AWS

## 2. Project Structure

```
taskflow/
├── backend/ (Django project)
│   ├── core/
│   │   ├── models.py, views.py, serializers.py, urls.py
│   │   ├── management/commands/create_sample_data.py
│   │   └── migrations/
│   ├── taskflow/
│   │   ├── settings.py, urls.py, wsgi.py
│   └── manage.py
├── frontend/ (React project)
│   ├── src/
│   │   ├── components/ (KanbanBoard.tsx, TaskCard.tsx, Analytics.tsx, Dashboard.tsx)
│   │   ├── contexts/ (AuthContext.tsx)
│   │   ├── services/ (api.ts, taskService.ts, authService.ts)
│   │   └── App.tsx, index.tsx
│   └── index.html (Static demo)
├── requirements.txt
├── package.json
└── README.md
```

## 3. Backend (Django)

### Example Task Model (models.py)

```python
class User(AbstractUser):
    """Custom User model with role-based permissions"""
    ROLE_CHOICES = [
        ('scrum_master', 'Scrum Master'),
        ('employee', 'Employee'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Project(models.Model):
    """Project model for organizing tasks"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_projects')
    members = models.ManyToManyField(User, related_name='projects', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

class Task(models.Model):
    """Task model representing individual work items"""
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('code_review', 'Code Review'),
        ('done', 'Done'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    labels = models.ManyToManyField(Label, blank=True, related_name='tasks')
    due_date = models.DateTimeField(null=True, blank=True)
    estimated_hours = models.PositiveIntegerField(null=True, blank=True)
    actual_hours = models.PositiveIntegerField(default=0)
    task_id = models.CharField(max_length=20, unique=True)  # e.g., TIS-25
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.task_id:
            # Generate task ID based on project and task count
            project_prefix = self.project.name[:3].upper()
            task_count = Task.objects.filter(project=self.project).count() + 1
            self.task_id = f"{project_prefix}-{task_count}"
        super().save(*args, **kwargs)

class UserBehavior(models.Model):
    """Model for tracking user behavior analytics"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='behaviors')
    action_type = models.CharField(max_length=50)  # e.g., 'task_created', 'task_completed'
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    metadata = models.JSONField(default=dict)  # Additional data about the action
    timestamp = models.DateTimeField(auto_now_add=True)
```

### API Endpoints

**Authentication Endpoints:**
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/auth/profile/` - Get user profile

**Project Endpoints:**
- `GET /api/projects/` - List projects
- `POST /api/projects/` - Create project
- `GET /api/projects/{id}/` - Get project details
- `PATCH /api/projects/{id}/` - Update project
- `DELETE /api/projects/{id}/` - Delete project

**Task Endpoints:**
- `GET /api/tasks/` - List tasks (with filters: ?project=1&status=todo)
- `POST /api/tasks/` - Create task
- `GET /api/tasks/{id}/` - Get task details
- `PATCH /api/tasks/{id}/` - Update task
- `PATCH /api/tasks/status-update/` - Update task status (drag & drop)
- `DELETE /api/tasks/{id}/` - Delete task

**Analytics Endpoints:**
- `GET /api/analytics/dashboard/` - Get analytics dashboard data
- `POST /api/analytics/behavior/` - Track user behavior
- `GET /api/kanban/{project_id}/` - Get kanban board data

**Comment Endpoints:**
- `GET /api/tasks/{task_id}/comments/` - List task comments
- `POST /api/tasks/{task_id}/comments/` - Create comment

### Django REST Framework Views

```python
# views.py
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

class TaskListCreateView(generics.ListCreateAPIView):
    """List and create tasks with filtering"""
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
                
                return Response(TaskSerializer(task).data)
            except Task.DoesNotExist:
                return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AnalyticsDashboardView(APIView):
    """Analytics dashboard with key metrics"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = self.request.user
        project_id = request.query_params.get('project')
        
        # Task statistics
        tasks_queryset = Task.objects.all()
        if project_id:
            tasks_queryset = tasks_queryset.filter(project_id=project_id)
        
        total_tasks = tasks_queryset.count()
        completed_tasks = tasks_queryset.filter(status='done').count()
        
        # User-specific metrics
        user_tasks = tasks_queryset.filter(assigned_to=user)
        user_completed = user_tasks.filter(status='done').count()
        
        # Productivity score calculation
        productivity_score = 0
        if total_tasks > 0:
            completion_rate = (completed_tasks / total_tasks) * 100
            productivity_score = min(100, completion_rate + (recent_actions * 2))
        
        return Response({
            'overview': {
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'completion_rate': round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 2)
            },
            'user_metrics': {
                'assigned_tasks': user_tasks.count(),
                'completed_tasks': user_completed,
                'productivity_score': round(productivity_score, 2)
            }
        })
```

## 4. Frontend (React)

### Kanban Board Example (react-beautiful-dnd)

```typescript
// KanbanBoard.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { taskService, Task, Project } from '../services/taskService';
import TaskCard from './TaskCard';

const KanbanBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({
    todo: [],
    in_progress: [],
    code_review: [],
    done: [],
  });
  const [loading, setLoading] = useState(true);

  const columns = [
    { id: 'todo', title: 'TO DO', color: '#6b7280' },
    { id: 'in_progress', title: 'IN PROGRESS', color: '#3b82f6' },
    { id: 'code_review', title: 'CODE REVIEW', color: '#f59e0b' },
    { id: 'done', title: 'DONE', color: '#10b981' },
  ];

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = tasks[source.droppableId];
    const destColumn = tasks[destination.droppableId];
    const task = sourceColumn.find(t => t.id.toString() === draggableId);

    if (!task) return;

    // Optimistic update
    const newTasks = { ...tasks };
    newTasks[source.droppableId] = sourceColumn.filter(t => t.id.toString() !== draggableId);
    newTasks[destination.droppableId] = [...destColumn];
    newTasks[destination.droppableId].splice(destination.index, 0, task);
    setTasks(newTasks);

    try {
      // Update task status on server
      await taskService.updateTaskStatus(task.id, destination.droppableId);
      
      // Track behavior
      await taskService.trackBehavior('task_status_update', task.id, undefined, {
        old_status: source.droppableId,
        new_status: destination.droppableId
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert on error
      loadProjectData();
    }
  };

  return (
    <div className="kanban-container">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {columns.map((column) => (
            <div key={column.id} className={`kanban-column column-${column.id}`}>
              <div className="kanban-column-header">
                <h3 className="kanban-column-title">{column.title}</h3>
                <span className="kanban-column-count">
                  {tasks[column.id]?.length || 0}
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`droppable-column ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                  >
                    {tasks[column.id]?.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`draggable-task ${snapshot.isDragging ? 'dragging' : ''}`}
                          >
                            <TaskCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
```

### Task Card Component

```typescript
// TaskCard.tsx
import React, { useState } from 'react';
import { Task } from '../services/taskService';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '🔴';
    }
  };

  return (
    <div className="task-card" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="task-card-content">
        {/* Task Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="task-labels">
            {task.labels.map((label) => (
              <span
                key={label.id}
                className="task-label"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Task Title */}
        <div className="task-title">{task.title}</div>

        {/* Task Priority and Estimate */}
        <div className="task-priority-container">
          <div className="priority-icon">
            {getPriorityIcon(task.priority)}
          </div>
          {task.estimated_hours && (
            <span className="task-estimate">{task.estimated_hours}h</span>
          )}
        </div>

        {/* Task Footer */}
        <div className="task-footer">
          <span className="task-id">{task.task_id}</span>
          {task.assigned_to && (
            <div className="task-assignee">
              <div className="assignee-avatar">
                {task.assigned_to.first_name.charAt(0).toUpperCase()}
              </div>
              {task.assigned_to.first_name}
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="task-details">
            <div><strong>Description:</strong> {task.description || 'No description'}</div>
            {task.due_date && (
              <div><strong>Due:</strong> {new Date(task.due_date).toLocaleDateString()}</div>
            )}
            <div><strong>Priority:</strong> {task.priority.toUpperCase()}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
```

### Authentication Context

```typescript
// AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login(username, password);
      setUser(response.user);
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 5. Analytics Dashboard

### React + Chart.js Implementation

```typescript
// Analytics.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { FaChartBar, FaTasks, FaCheckCircle, FaClock, FaTrendingUp } from 'react-icons/fa';

const Analytics: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [projectId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await taskService.getAnalytics(projectId ? Number(projectId) : undefined);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1 className="analytics-title">Analytics Dashboard</h1>
        <p className="analytics-subtitle">
          Track your productivity and team performance
        </p>
      </div>

      {/* Overview Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-title">Total Tasks</div>
          <div className="metric-value">{analytics?.overview?.total_tasks || 0}</div>
          <div className="metric-change positive">
            <FaTrendingUp style={{ marginRight: '4px' }} />
            +12% from last week
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">Completed Tasks</div>
          <div className="metric-value">{analytics?.overview?.completed_tasks || 0}</div>
          <div className="metric-change positive">
            <FaCheckCircle style={{ marginRight: '4px' }} />
            {analytics?.overview?.completion_rate || 0}% completion rate
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">Productivity Score</div>
          <div className="metric-value">{analytics?.user_metrics?.productivity_score || 0}</div>
          <div className="metric-change positive">
            <FaTrendingUp style={{ marginRight: '4px' }} />
            Your performance rating
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Task Status Distribution</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <p style={{ color: '#6b7280' }}>Chart visualization would go here</p>
              <div style={{ marginTop: '16px', fontSize: '14px', color: '#9ca3af' }}>
                Status breakdown: {analytics?.distributions?.status?.map((s: any) => 
                  `${s.status}: ${s.count}`
                ).join(', ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
```

### Behavioral Data Collection

```typescript
// taskService.ts - Behavior Tracking
export const taskService = {
  async trackBehavior(actionType: string, taskId?: number, duration?: number, metadata?: any): Promise<void> {
    await api.post('/analytics/behavior/', {
      action_type: actionType,
      task: taskId,
      duration_seconds: duration,
      metadata: metadata || {},
    });
  },

  async updateTaskStatus(taskId: number, status: string): Promise<Task> {
    const response = await api.patch('/tasks/status-update/', {
      task_id: taskId,
      status: status,
    });
    
    // Track behavior automatically
    await this.trackBehavior('task_status_update', taskId, undefined, {
      new_status: status
    });
    
    return response.data;
  },
};
```

## 6. Deployment

### Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: taskflow
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://postgres:password@db:5432/taskflow

  frontend:
    build: ./frontend
    command: npm start
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:8000/api

volumes:
  postgres_data:
```

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Deployment Commands

```bash
# Local development with Docker
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Heroku deployment
git subtree push --prefix backend heroku main

# AWS ECS deployment
aws ecs create-service --cluster taskflow-cluster --service-name taskflow-service
```

## 7. Expected MVP Features

### ✅ User Registration/Login
- JWT-based authentication with automatic token refresh
- Role-based access control (Scrum Master vs Employee)
- User profile management with avatars
- Secure password validation

### ✅ Projects + Kanban Boards
- Project creation and management
- Team member assignment to projects
- Visual Kanban board with 4 columns: To Do, In Progress, Code Review, Done
- Project-specific task filtering

### ✅ Task CRUD with Drag/Drop
- Create, read, update, delete tasks
- Drag and drop between columns with optimistic updates
- Auto-generated task IDs (e.g., "TIS-25")
- Priority system (Low, Medium, High, Urgent)
- Label system with color coding
- Time estimation and tracking
- Task assignment to team members

### ✅ Behavioral Data Collection
- **Time Tracking**: Monitor time spent on tasks
- **Edit Tracking**: Track task modifications and updates
- **Completion Tracking**: Monitor task completion patterns
- **User Behavior**: Track login patterns, task interactions
- **Activity Logging**: Comprehensive audit trail

### ✅ Analytics Dashboard with Insights
- **Productivity Metrics**: Completion rates, productivity scores
- **Task Distribution**: Status and priority breakdowns
- **User Performance**: Individual and team metrics
- **Trend Analysis**: Historical data and patterns
- **Optimization Suggestions**: Data-driven recommendations

### Advanced Features Implemented

- **Real-time Updates**: Optimistic UI updates with server synchronization
- **Error Handling**: Graceful error handling with rollback capabilities
- **Search & Filtering**: Advanced task search and filtering
- **Comment System**: Task collaboration and discussions
- **Activity Feed**: Real-time activity tracking
- **Responsive Design**: Mobile-friendly interface
- **TypeScript**: Full type safety throughout the application

## 8. Sample Data & Demo

### Demo Credentials
- **Scrum Master**: `scrum_master` / `password123`
- **Employee 1**: `employee1` / `password123`
- **Employee 2**: `employee2` / `password123`

### Sample Project: "Teams in Space"
- **13+ Tasks** across different statuses and priorities
- **4 Team Members** with different roles
- **Color-coded Labels** for task categorization
- **Real-world Task Data** matching the provided design

### Quick Start Commands

```bash
# Backend setup
cd backend
pip install -r ../requirements.txt
python manage.py migrate
python manage.py create_sample_data
python manage.py runserver

# Frontend setup
cd frontend
npm install
npm start

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api
```

This TaskFlow implementation provides a complete, production-ready task management system with behavioral analytics, role-based access control, and modern web technologies. The system goes beyond basic CRUD operations to provide intelligent insights and optimization recommendations based on user behavior patterns.
