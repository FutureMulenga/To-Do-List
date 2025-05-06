import React, { useState, useEffect } from 'react';
import { Briefcase, User, Layers, Plus, Calendar, Flag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../assets/css/categories.css';

const Categories = () => {
  const { getTasks, updateTask } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'work':
        return <Briefcase className="category-icon" />;
      case 'personal':
        return <User className="category-icon" />;
      default:
        return <Layers className="category-icon" />;
    }
  };

  const handleTaskComplete = async (id, completed) => {
    if (updating) return;
    
    try {
      setUpdating(true);
      await updateTask(id, { completed });
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed } : task
      ));
    } catch (err) {
      setError('Failed to update task: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleAddTask = (category) => {
    // Navigate to add task page with pre-selected category
    navigate('/task', { state: { category } });
  };

  const groupedTasks = {
    work: tasks.filter(task => task.category?.toLowerCase() === 'work'),
    personal: tasks.filter(task => task.category?.toLowerCase() === 'personal'),
    others: tasks.filter(task => !task.category || !['work', 'personal'].includes(task.category.toLowerCase()))
  };

  const renderTaskList = (categoryTasks, category) => (
    <div className="category-section" key={category}>
      <div className="category-header">
        {getCategoryIcon(category)}
        <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
        <span className="task-count">{categoryTasks.length} tasks</span>
      </div>

      <div className="tasks-grid">
        {categoryTasks.map(task => (
          <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
            <div className="task-header">
              <h3>{task.title}</h3>
              {task.priority && (
                <span className={`priority-badge ${task.priority}`}>
                  <Flag size={14} />
                  {task.priority}
                </span>
              )}
            </div>
            
            {task.dueDate && (
              <div className="task-due-date">
                <Calendar size={14} />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            
            <div className="task-actions">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleTaskComplete(task.id, !task.completed)}
                className="task-checkbox"
                disabled={updating}
              />
              {updating && <span className="updating-status">Updating...</span>}
            </div>
          </div>
        ))}
        
        <button 
          className="add-task-card"
          onClick={() => handleAddTask(category)}
          disabled={updating}
        >
          <Plus size={24} />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );

  if (loading) return <div className="loading">Loading categories...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="categories-container">
      {renderTaskList(groupedTasks.work, 'work')}
      {renderTaskList(groupedTasks.personal, 'personal')}
      {renderTaskList(groupedTasks.others, 'others')}
    </div>
  );
};

export default Categories;