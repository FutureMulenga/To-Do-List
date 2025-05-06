import React, { useEffect, useState } from 'react';
import { CheckCircle, Circle, ListTodo } from 'lucide-react';
import '../assets/css/dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



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