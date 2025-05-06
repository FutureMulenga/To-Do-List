import React, { useState, useEffect } from 'react';
import { Calendar, Flag, Tag, AlertCircle, X } from 'lucide-react';
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
    dueDate: '',
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

  //updting task
  // Note: The API should return the updated task object after a successful update
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
      setError('Failed to update task: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  //deteleting task
  // Note: The API should return a success message or status code after deletion
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

  const handleEditClick = (task) => {
    setEditingTask(task.id);
    setEditForm({
      title: task.title,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority || 'medium',
      category: task.category || ''
    });
  };

  const handleEditSubmit = async (id) => {
    try {
      await updateTask(id, editForm);
      setEditingTask(null);
      fetchTasks(); // Refresh the task list
    } catch (err) {
      setError('Failed to update task: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDueDate = (dueDate) => {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if due date is today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    // Check if due date is tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    // Format other dates
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const groupTasks = (tasks) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return {
      today: tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      }),
      upcoming: tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate > today && taskDate <= nextWeek;
      }),
      later: tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate > nextWeek;
      }),
      noDueDate: tasks.filter(task => !task.dueDate)
    };
  };

  const renderTaskGroup = (tasks, title) => {
    if (!tasks || tasks.length === 0) return null;

    return (
      <div className="task-group">
        <h2 className="task-group-title">{title}</h2>
        {tasks.map(task => (
          <div key={task.id} className={`todo-item ${task.completed ? 'completed' : ''}`}>
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
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})}
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
                      {task.dueDate && (
                        <span className={`todo-due-date ${
                          new Date(task.dueDate) < new Date() && !task.completed 
                            ? 'overdue' 
                            : new Date(task.dueDate).toDateString() === new Date().toDateString() 
                              ? 'due-today'
                              : ''
                        }`}>
                          <Calendar size={14} className="inline-icon" />
                          {formatDueDate(task.dueDate)}
                          {new Date(task.dueDate) < new Date() && !task.completed && (
                            <AlertCircle size={14} className="ml-1 inline-icon text-red-500" />
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
          {renderTaskGroup(groupedTasks.today, "Today's Tasks")}
          {renderTaskGroup(groupedTasks.upcoming, "This Week's Tasks")}
          {renderTaskGroup(groupedTasks.later, "Upcoming Tasks")}
          {renderTaskGroup(groupedTasks.noDueDate, "Tasks without Due Date")}
        </>
      )}
    </div>
  );
};

export default TodoItem;