import React, { useState } from 'react';
import { Task } from '../services/taskService';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getLabelClass = (labelName: string) => {
    const labelMap: Record<string, string> = {
      'SPACE TRAVEL PARTNERS': 'label-space-travel',
      'Local Mars Office': 'label-mars-office',
      'SeeSpaceEZ Plus': 'label-seespaceez',
      'Large Team Support': 'label-large-team',
    };
    return labelMap[labelName] || 'label-space-travel';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '🔴';
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '🔴';
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'priority-urgent';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
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
                className={`task-label ${getLabelClass(label.name)}`}
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
          <div className={`priority-icon ${getPriorityClass(task.priority)}`}>
            {getPriorityIcon(task.priority)}
          </div>
          {task.estimated_hours && (
            <span className="task-estimate">{task.estimated_hours}</span>
          )}
        </div>

        {/* Task Footer */}
        <div className="task-footer">
          <span className="task-id">{task.task_id}</span>
          {task.assigned_to && (
            <div style={{ 
              fontSize: '12px', 
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: '#666'
              }}>
                {task.assigned_to.first_name.charAt(0).toUpperCase()}
              </div>
              {task.assigned_to.first_name}
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div style={{ 
            marginTop: '12px', 
            paddingTop: '12px', 
            borderTop: '1px solid #f0f0f0',
            fontSize: '12px',
            color: '#666'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Description:</strong> {task.description || 'No description'}
            </div>
            {task.due_date && (
              <div style={{ marginBottom: '8px' }}>
                <strong>Due:</strong> {new Date(task.due_date).toLocaleDateString()}
              </div>
            )}
            <div style={{ marginBottom: '8px' }}>
              <strong>Priority:</strong> {task.priority.toUpperCase()}
            </div>
            {task.actual_hours > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <strong>Actual Hours:</strong> {task.actual_hours}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
