import React, { useEffect, useState } from 'react';
import { CheckCircle, Circle, ListTodo } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../assets/css/dashboard.css';

const Dashboard = () => {
  const { isAuthenticated, getTasks } = useAuth(); 
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    fetchTaskStats();
  }, []);
  
  
  const fetchTaskStats = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const tasks = await getTasks();
      
      const taskStats = {
        total: tasks.length,
        completed: tasks.filter(task => task.completed).length,
        pending: tasks.filter(task => !task.completed).length
      };
      
      setStats(taskStats);
      setError(null);
    } catch (err) {
      setError('Failed to fetch task statistics');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">Loading dashboard...</div>
      </div>
    );
  }
  

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">{error}</div>
      </div>
    );
  }
  
  
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Task Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card total">
          <ListTodo size={24} />
          <div className="stat-info">
            <h3>Total Tasks</h3>
            <span className="stat-number">{stats.total}</span>
          </div>
        </div>
        
        <div className="stat-card completed">
          <CheckCircle size={24} />
          <div className="stat-info">
            <h3>Completed</h3>
            <span className="stat-number">{stats.completed}</span>
          </div>
        </div>
        
        <div className="stat-card pending">
          <Circle size={24} />
          <div className="stat-info">
            <h3>Pending</h3>
            <span className="stat-number">{stats.pending}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;