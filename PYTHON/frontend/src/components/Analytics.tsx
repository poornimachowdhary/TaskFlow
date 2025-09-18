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

  if (loading) {
    return (
      <div className="analytics-container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <FaChartBar style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
            No analytics data available
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Start working on tasks to see your productivity insights
          </p>
        </div>
      </div>
    );
  }

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
          <div className="metric-value">{analytics.overview?.total_tasks || 0}</div>
          <div className="metric-change positive">
            <FaTrendingUp style={{ marginRight: '4px' }} />
            +12% from last week
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">Completed Tasks</div>
          <div className="metric-value">{analytics.overview?.completed_tasks || 0}</div>
          <div className="metric-change positive">
            <FaCheckCircle style={{ marginRight: '4px' }} />
            {analytics.overview?.completion_rate || 0}% completion rate
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">In Progress</div>
          <div className="metric-value">{analytics.overview?.in_progress_tasks || 0}</div>
          <div className="metric-change">
            <FaClock style={{ marginRight: '4px' }} />
            Active work items
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">Productivity Score</div>
          <div className="metric-value">{analytics.user_metrics?.productivity_score || 0}</div>
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
                Status breakdown: {analytics.distributions?.status?.map((s: any) => 
                  `${s.status}: ${s.count}`
                ).join(', ')}
              </div>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Priority Distribution</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
              <p style={{ color: '#6b7280' }}>Priority chart would go here</p>
              <div style={{ marginTop: '16px', fontSize: '14px', color: '#9ca3af' }}>
                Priority breakdown: {analytics.distributions?.priority?.map((p: any) => 
                  `${p.priority}: ${p.count}`
                ).join(', ')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Metrics */}
      <div className="chart-card" style={{ marginBottom: '32px' }}>
        <h3 className="chart-title">Your Performance</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
              {analytics.user_metrics?.assigned_tasks || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Tasks Assigned to You</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
              {analytics.user_metrics?.completed_tasks || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Tasks Completed</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', marginBottom: '8px' }}>
              {analytics.user_metrics?.in_progress_tasks || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Currently Working On</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6', marginBottom: '8px' }}>
              {analytics.recent_activity?.user_actions_this_week || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Actions This Week</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="chart-card">
        <h3 className="chart-title">Recent Activity</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
              {analytics.recent_activity?.tasks_completed_this_week || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Tasks completed this week</div>
          </div>
          
          <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
              {analytics.recent_activity?.total_user_actions || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total actions performed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
