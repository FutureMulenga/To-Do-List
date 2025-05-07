import React, { useState, useEffect } from 'react';
import { Calendar, Flag, Tag, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../assets/css/todoitem.css';

const TodoItem = () => {
  const { getTasks, updateTask, deleteTask } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    due_date: '',
    priority: '',
    category: ''
  });
  
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const tasksData = await getTasks();
      setTasks(tasksData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch tasks');
      setLoading(false);
    }
  };

  // Updating task
  const handleUpdate = async (id, updatedTask) => {
    try {
      setLoading(true);
      // Call the API to update the task
      await updateTask(id, updatedTask);
      
      // Update local state only after successful API call
      const updatedTasks = tasks.map(task => 
        task.id === id ? { ...task, ...updatedTask } : task
      );
      setTasks(updatedTasks);
    } catch (err) {
      console.error("Update error:", err);
      setError('Failed to update task: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Deleting task
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      // Call the API to delete the task
      await deleteTask(id);
      
      // Update local state only after successful API call
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      setError('Failed to delete task: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Editing task
  const handleEditClick = (task) => {
    setEditingTask(task.id);
    setEditForm({
      title: task.title,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      priority: task.priority || 'medium',
      category: task.category || ''
    });
  };

  const handleEditSubmit = async (id) => {
    try {
      // Format date properly for Django
      const formData = { ...editForm };
      if (formData.due_date) {
        // Ensure date is in correct ISO format with time for Django
        formData.due_date = `${formData.due_date}T00:00:00Z`;
      }
      
      await updateTask(id, formData);
      setEditingTask(null);
      fetchTasks(); // Refresh the task list
    } catch (err) {
      console.error("Edit submit error:", err);
      setError('Failed to update task: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDueDate = (dueDate) => {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if due date is today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    // Check if due date is tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    // Check if due date was yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Format other dates
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  // Calculate how many days a task is overdue
  const getDaysOverdue = (dueDate) => {
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Group tasks by due date
  const groupTasks = (tasks) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return {
      overdue: tasks.filter(task => {
        if (!task.due_date || task.completed) return false;
        const taskDate = new Date(task.due_date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate < today;
      }),
      today: tasks.filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      }),
      upcoming: tasks.filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate > today && taskDate <= nextWeek;
      }),
      later: tasks.filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate > nextWeek;
      }),
      completed: tasks.filter(task => task.completed),
      noDueDate: tasks.filter(task => !task.due_date && !task.completed)
    };
  };

  // Handle extending due date for overdue tasks
  const handleExtendDueDate = async (task, days) => {
    try {
      const newDueDate = new Date();
      newDueDate.setDate(newDueDate.getDate() + days);
      
      // Format for Django API
      const formattedDate = newDueDate.toISOString().split('T')[0] + 'T00:00:00Z';
      
      await updateTask(task.id, { due_date: formattedDate });
      fetchTasks(); // Refresh the task list
    } catch (err) {
      console.error("Extend due date error:", err);
      setError('Failed to extend due date: ' + (err.response?.data?.message || err.message));
    }
  };

  // Render task groups
  const renderTaskGroup = (tasks, title, isOverdue = false) => {
    if (!tasks || tasks.length === 0) return null;

    return (
      <div className={`task-group ${isOverdue ? 'overdue-group' : ''}`}>
        <h2 className={`task-group-title ${isOverdue ? 'overdue-title' : ''}`}>
          {title}
          {isOverdue && <span className="overdue-count">{tasks.length}</span>}
        </h2>
        {tasks.map(task => (
          <div key={task.id} className={`todo-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue-item' : ''}`}>
            {editingTask === task.id ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="edit-input"
                  placeholder="Task title"
                />
                <input
                  type="date"
                  value={editForm.due_date}
                  onChange={(e) => setEditForm({...editForm, due_date: e.target.value})}
                  className="edit-input"
                />
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                  className="edit-input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  className="edit-input"
                  placeholder="Category"
                />
                <div className="edit-actions">
                  <button 
                    onClick={() => handleEditSubmit(task.id)}
                    className="save-btn"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setEditingTask(null)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="todo-content">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleUpdate(task.id, { completed: !task.completed })}
                    className="todo-checkbox"
                  />
                  <div className="todo-details">
                    <span className="todo-title">{task.title}</span>
                    
                    <div className="todo-metadata">
                      {task.due_date && (
                        <span className={`todo-due-date ${
                          new Date(task.due_date) < new Date() && !task.completed 
                            ? 'overdue' 
                            : new Date(task.due_date).toDateString() === new Date().toDateString() 
                              ? 'due-today'
                              : ''
                        }`}>
                          <Calendar size={14} className="inline-icon" />
                          {formatDueDate(task.due_date)}
                          {isOverdue && (
                            <span className="overdue-days">
                              <Clock size={14} className="inline-icon" />
                              {getDaysOverdue(task.due_date)} {getDaysOverdue(task.due_date) === 1 ? 'day' : 'days'} overdue
                            </span>
                          )}
                        </span>
                      )}
                      
                      {task.priority && (
                        <span className={`todo-priority ${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                          <Flag size={14} className="inline-icon" />
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      )}
                      
                      {task.category && (
                        <span className="todo-category">
                          <Tag size={14} className="inline-icon" />
                          {task.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="todo-actions">
                  {isOverdue && (
                    <div className="overdue-actions">
                      <button 
                        onClick={() => handleExtendDueDate(task, 1)} 
                        className="extend-btn"
                        title="Extend to tomorrow"
                      >
                        +1 Day
                      </button>
                      <button 
                        onClick={() => handleExtendDueDate(task, 7)} 
                        className="extend-btn"
                        title="Extend by one week"
                      >
                        +1 Week
                      </button>
                    </div>
                  )}
                  <button onClick={() => handleEditClick(task)} className="edit-btn">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="todo-list-loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="todo-list-error">{error}</div>;
  }

  const groupedTasks = groupTasks(tasks);

  return (
    <div className="todo-list">
      {tasks.length === 0 ? (
        <div className="no-tasks">No tasks found. Add a task to get started!</div>
      ) : (
        <>
          {renderTaskGroup(groupedTasks.overdue, "Overdue Tasks", true)}
          {renderTaskGroup(groupedTasks.today, "Today's Tasks")}
          {renderTaskGroup(groupedTasks.upcoming, "This Week's Tasks")}
          {renderTaskGroup(groupedTasks.later, "Upcoming Tasks")}
          {renderTaskGroup(groupedTasks.noDueDate, "Tasks without Due Date")}
          {renderTaskGroup(groupedTasks.completed, "Completed Tasks")}
        </>
      )}
    </div>
  );
};

export default TodoItem;