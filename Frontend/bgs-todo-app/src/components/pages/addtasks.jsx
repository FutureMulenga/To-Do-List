/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Calendar, Flag, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../assets/css/tasks.css';

const AddTask = ({ onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { addTask } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    setIsSubmitting(true);
    
    
    // Format the date properly for the API
    const formattedDate = dueDate ? new Date(dueDate).toISOString() : null;

    // Create task object matching backend model
     const taskData = {
        title: title.trim(),
        completed: false,
        due_date: formattedDate,
        priority,
        category: category.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(), 
      };

    try {
      await addTask(taskData);
      // Reset form
      setTitle('');
      setDueDate('');
      setPriority('medium');
      setCategory('');
      
      // Notify parent component
      onTaskAdded?.();
    } catch (error) {
      setError(error.message);
    }
  };

  // Get priority color
  const getPriorityColor = (priorityValue) => {
    switch (priorityValue) {
      case 'high':
        return 'text-red-500 border-red-500';
      case 'medium':
        return 'text-yellow-500 border-yellow-500';
      case 'low':
        return 'text-green-500 border-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-task-form">
      <div className="basic-fields">
        <input
          type="text"
          placeholder="Add a new task..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value.trim()) setError('');
          }}
          className={`task-input ${error ? 'input-error' : ''}`}
          aria-label="Task title"
          disabled={isSubmitting}
        />
        <button 
          type="submit" 
          className="add-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Task'}
        </button>
      </div>
      
      {error && <div className="error-message" role="alert">{error}</div>}
      
      <div className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
        {showAdvanced ? (
          <>
            <ChevronUp size={16} /> Hide advanced options
          </>
        ) : (
          <>
            <ChevronDown size={16} /> Show advanced options
          </>
        )}
      </div>
      
      {showAdvanced && (
        <div className="advanced-fields">
          <div className="field-group">
            <label htmlFor="dueDate">
              <Calendar size={16} className="field-icon" />
              Due Date:
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="date-input"
              aria-label="Due date"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="field-group">
            <label htmlFor="priority">
              <Flag size={16} className="field-icon" />
              Priority:
            </label>
            <div className="priority-buttons">
              <button
                type="button"
                className={`priority-btn low ${priority === 'low' ? 'active' : ''}`}
                onClick={() => setPriority('low')}
                aria-label="Low priority"
                disabled={isSubmitting}
              >
                Low
              </button>
              <button
                type="button"
                className={`priority-btn medium ${priority === 'medium' ? 'active' : ''}`}
                onClick={() => setPriority('medium')}
                aria-label="Medium priority"
                disabled={isSubmitting}
              >
                Medium
              </button>
              <button
                type="button"
                className={`priority-btn high ${priority === 'high' ? 'active' : ''}`}
                onClick={() => setPriority('high')}
                aria-label="High priority"
                disabled={isSubmitting}
              >
                High
              </button>
            </div>
          </div>
          
          <div className="field-group">
            <label htmlFor="category">
              <Tag size={16} className="field-icon" />
              Category:
            </label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Work, Personal, Shopping"
              className="category-input"
              aria-label="Category"
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}
    </form>
  );
};

export default AddTask;