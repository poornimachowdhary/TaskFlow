# TaskFlow: Behavior-Driven Task Management Platform

A full-stack web application that combines traditional task management with behavioral analytics to help teams optimize their productivity. Built with Django REST API backend and React frontend.

## 🚀 Features

### Core Task Management
- **Kanban Board**: Visual task management with drag-and-drop functionality
- **Task Cards**: Rich task cards with labels, priorities, estimates, and assignments
- **Project Management**: Organize tasks by projects with team member management
- **Role-Based Access**: Scrum Master and Employee roles with appropriate permissions
- **Real-time Updates**: Live task status updates and activity tracking

### Behavioral Analytics
- **User Behavior Tracking**: Monitor task interactions, completion patterns, and time spent
- **Productivity Metrics**: Track completion rates, productivity scores, and team performance
- **Analytics Dashboard**: Visual charts and insights to identify productivity trends
- **Optimization Suggestions**: Data-driven recommendations for workflow improvements

### User Interface
- **Modern Design**: Clean, responsive interface matching the provided design
- **Intuitive Navigation**: Easy-to-use sidebar and navigation system
- **Search & Filtering**: Quick task search and filtering capabilities
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

### Backend
- **Django 4.2**: Python web framework
- **Django REST Framework**: API development
- **SQLite**: Database (easily configurable for PostgreSQL)
- **JWT Authentication**: Secure token-based authentication
- **CORS Support**: Cross-origin resource sharing for frontend integration

### Frontend
- **React 18**: Modern JavaScript framework
- **TypeScript**: Type-safe JavaScript
- **React Beautiful DnD**: Drag and drop functionality
- **Chart.js**: Data visualization
- **Styled Components**: CSS-in-JS styling

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- pip (Python package manager)
- npm (Node package manager)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r ../requirements.txt
   ```

3. **Run database migrations:**
   ```bash
   python manage.py migrate
   ```

4. **Create sample data:**
   ```bash
   python manage.py create_sample_data
   ```

5. **Start the Django server:**
   ```bash
   python manage.py runserver
   ```

   The API will be available at `http://localhost:8000/api/`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3000/`

### Quick Demo

For a quick demo without setting up the full environment, open `frontend/index.html` in your browser. This provides a static version of the Kanban board interface.

## 🔐 Demo Credentials

The application comes with pre-configured demo accounts:

- **Scrum Master**: `scrum_master` / `password123`
- **Employee 1**: `employee1` / `password123`
- **Employee 2**: `employee2` / `password123`

## 📊 Sample Data

The application includes sample data that matches the provided design:

- **Project**: "Teams in Space" - A software project for space exploration team management
- **Tasks**: 13+ sample tasks across different statuses (To Do, In Progress, Code Review, Done)
- **Labels**: Color-coded labels for different categories (Space Travel Partners, Local Mars Office, etc.)
- **Users**: Multiple users with different roles and permissions

## 🎯 Key Features Demonstrated

### 1. Kanban Board Interface
- **Exact Design Match**: Replicates the provided image with precise styling
- **Drag & Drop**: Tasks can be moved between columns
- **Task Cards**: Rich cards with labels, priorities, estimates, and IDs
- **Column Headers**: Status columns with task counts

### 2. Task Management
- **Task Creation**: Add new tasks with full details
- **Status Updates**: Move tasks through workflow stages
- **Priority System**: Visual priority indicators
- **Label System**: Color-coded categorization
- **Assignment**: Assign tasks to team members

### 3. User Roles & Permissions
- **Scrum Master**: Full project management capabilities
- **Employee**: Task-focused view with limited permissions
- **Role-based UI**: Different interfaces based on user role

### 4. Analytics & Insights
- **Behavior Tracking**: Monitor user interactions and patterns
- **Productivity Metrics**: Track completion rates and performance
- **Visual Dashboard**: Charts and graphs for data visualization
- **Optimization Tips**: Data-driven suggestions for improvement

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/token/` - Login
- `POST /api/auth/token/refresh/` - Refresh token
- `GET /api/auth/profile/` - Get user profile

### Projects
- `GET /api/projects/` - List projects
- `POST /api/projects/` - Create project
- `GET /api/projects/{id}/` - Get project details
- `PATCH /api/projects/{id}/` - Update project

### Tasks
- `GET /api/tasks/` - List tasks
- `POST /api/tasks/` - Create task
- `GET /api/tasks/{id}/` - Get task details
- `PATCH /api/tasks/{id}/` - Update task
- `PATCH /api/tasks/status-update/` - Update task status

### Analytics
- `GET /api/analytics/dashboard/` - Get analytics dashboard
- `POST /api/analytics/behavior/` - Track user behavior

## 🎨 Design System

The application follows a consistent design system:

- **Primary Color**: #1e3a8a (Blue)
- **Success Color**: #10b981 (Green)
- **Warning Color**: #f59e0b (Orange)
- **Error Color**: #ef4444 (Red)
- **Background**: #f5f5f5 (Light Gray)
- **Text**: #1f2937 (Dark Gray)

## 🚀 Deployment

### Backend Deployment
1. Set up a PostgreSQL database
2. Update `DATABASES` in `settings.py`
3. Set `DEBUG = False`
4. Configure static files serving
5. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the React app: `npm run build`
2. Serve the build folder with a web server
3. Update API URLs for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Acknowledgments

- Design inspiration from modern task management tools
- Django and React communities for excellent documentation
- Open source libraries that made this project possible

---

**TaskFlow** - Where task management meets behavioral insights! 🚀# TaskFlow
