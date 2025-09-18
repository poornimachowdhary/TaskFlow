import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskService, Project } from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';
import { FaRocket, FaUsers, FaTasks, FaChartBar } from 'react-icons/fa';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await taskService.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
          Welcome back, {user?.first_name}!
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#dbeafe',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <FaRocket style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Active Projects</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                {projects.length}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#f0fdf4',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <FaTasks style={{ color: '#10b981' }} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Total Tasks</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                {projects.reduce((sum, project) => sum + project.task_count, 0)}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#fef3c7',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <FaUsers style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Team Members</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                {projects.reduce((sum, project) => sum + project.members.length, 0)}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#f3e8ff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <FaChartBar style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Productivity</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                85%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>Your Projects</h2>
          <Link to="/analytics" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#1e3a8a',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <FaChartBar />
            View Analytics
          </Link>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {projects.map((project) => (
            <div key={project.id} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                  {project.name}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                  {project.description || 'No description available'}
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Tasks</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                    {project.task_count}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Members</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                    {project.members.length}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Created</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  to={`/board/${project.id}`}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    background: '#1e3a8a',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textAlign: 'center',
                    transition: 'background 0.2s ease'
                  }}
                >
                  Open Board
                </Link>
                <Link
                  to={`/analytics?project=${project.id}`}
                  style={{
                    padding: '8px 12px',
                    background: '#f3f4f6',
                    color: '#374151',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <FaChartBar />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <FaRocket style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              No projects yet
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              {user?.role === 'scrum_master' 
                ? 'Create your first project to get started'
                : 'You haven\'t been added to any projects yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
