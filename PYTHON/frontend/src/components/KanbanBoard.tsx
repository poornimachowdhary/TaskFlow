import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { taskService, Task, Project } from '../services/taskService';
import TaskCard from './TaskCard';
import { FaSearch, FaFilter } from 'react-icons/fa';

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
  const [searchQuery, setSearchQuery] = useState('');

  const columns = [
    { id: 'todo', title: 'TO DO', color: '#6b7280' },
    { id: 'in_progress', title: 'IN PROGRESS', color: '#3b82f6' },
    { id: 'code_review', title: 'CODE REVIEW', color: '#f59e0b' },
    { id: 'done', title: 'DONE', color: '#10b981' },
  ];

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projectData, kanbanData] = await Promise.all([
        taskService.getProject(Number(projectId)),
        taskService.getKanbanData(Number(projectId))
      ]);
      
      setProject(projectData);
      setTasks(kanbanData);
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="kanban-container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p>Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <h1 className="kanban-title">Board</h1>
        <div className="kanban-controls">
          <div className="search-bar">
            <FaSearch style={{ color: '#666', marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <select className="quick-filters">
            <option>Quick Filters</option>
            <option>My Tasks</option>
            <option>Recently Updated</option>
            <option>High Priority</option>
          </select>
        </div>
      </div>

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
