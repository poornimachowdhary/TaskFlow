import api from './api';

export interface Project {
  id: number;
  name: string;
  description: string;
  created_by: number;
  members: User[];
  labels: Label[];
  task_count: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'scrum_master' | 'employee';
  avatar?: string;
  date_joined: string;
}

export interface Label {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  project: number;
  assigned_to?: User;
  assigned_to_id?: number;
  created_by: User;
  status: 'todo' | 'in_progress' | 'code_review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  labels: Label[];
  label_ids?: number[];
  due_date?: string;
  estimated_hours?: number;
  actual_hours: number;
  task_id: string;
  comments: Comment[];
  activity_logs: ActivityLog[];
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  description: string;
  user: User;
  old_value?: string;
  new_value?: string;
  timestamp: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  project: number;
  assigned_to_id?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  label_ids?: number[];
  due_date?: string;
  estimated_hours?: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  assigned_to_id?: number;
  status?: 'todo' | 'in_progress' | 'code_review' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  label_ids?: number[];
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  member_ids?: number[];
}

export interface CreateLabelData {
  name: string;
  color: string;
}

export interface CreateCommentData {
  content: string;
}

export const taskService = {
  // Projects
  async getProjects(): Promise<Project[]> {
    const response = await api.get('/projects/');
    return response.data.results || response.data;
  },

  async getProject(id: number): Promise<Project> {
    const response = await api.get(`/projects/${id}/`);
    return response.data;
  },

  async createProject(data: CreateProjectData): Promise<Project> {
    const response = await api.post('/projects/', data);
    return response.data;
  },

  async updateProject(id: number, data: Partial<CreateProjectData>): Promise<Project> {
    const response = await api.patch(`/projects/${id}/`, data);
    return response.data;
  },

  async deleteProject(id: number): Promise<void> {
    await api.delete(`/projects/${id}/`);
  },

  // Tasks
  async getTasks(projectId?: number, status?: string): Promise<Task[]> {
    const params = new URLSearchParams();
    if (projectId) params.append('project', projectId.toString());
    if (status) params.append('status', status);
    
    const response = await api.get(`/tasks/?${params.toString()}`);
    return response.data.results || response.data;
  },

  async getTask(id: number): Promise<Task> {
    const response = await api.get(`/tasks/${id}/`);
    return response.data;
  },

  async createTask(data: CreateTaskData): Promise<Task> {
    const response = await api.post('/tasks/', data);
    return response.data;
  },

  async updateTask(id: number, data: UpdateTaskData): Promise<Task> {
    const response = await api.patch(`/tasks/${id}/`, data);
    return response.data;
  },

  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}/`);
  },

  async updateTaskStatus(taskId: number, status: string): Promise<Task> {
    const response = await api.patch('/tasks/status-update/', {
      task_id: taskId,
      status: status,
    });
    return response.data;
  },

  async searchTasks(query: string, projectId?: number): Promise<Task[]> {
    const params = new URLSearchParams({ q: query });
    if (projectId) params.append('project', projectId.toString());
    
    const response = await api.get(`/tasks/search/?${params.toString()}`);
    return response.data.tasks;
  },

  // Kanban Board
  async getKanbanData(projectId: number): Promise<Record<string, any>> {
    const response = await api.get(`/kanban/${projectId}/`);
    return response.data;
  },

  // Comments
  async getComments(taskId: number): Promise<Comment[]> {
    const response = await api.get(`/tasks/${taskId}/comments/`);
    return response.data.results || response.data;
  },

  async createComment(taskId: number, data: CreateCommentData): Promise<Comment> {
    const response = await api.post(`/tasks/${taskId}/comments/`, data);
    return response.data;
  },

  // Labels
  async getLabels(projectId: number): Promise<Label[]> {
    const response = await api.get(`/projects/${projectId}/labels/`);
    return response.data.results || response.data;
  },

  async createLabel(projectId: number, data: CreateLabelData): Promise<Label> {
    const response = await api.post(`/projects/${projectId}/labels/`, data);
    return response.data;
  },

  // Analytics
  async getAnalytics(projectId?: number): Promise<any> {
    const params = projectId ? `?project=${projectId}` : '';
    const response = await api.get(`/analytics/dashboard/${params}`);
    return response.data;
  },

  async trackBehavior(actionType: string, taskId?: number, duration?: number, metadata?: any): Promise<void> {
    await api.post('/analytics/behavior/', {
      action_type: actionType,
      task: taskId,
      duration_seconds: duration,
      metadata: metadata || {},
    });
  },
};
