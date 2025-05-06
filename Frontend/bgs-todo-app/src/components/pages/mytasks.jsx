import React, { useState, useCallback } from 'react';
import AddTask from './addtasks';
import TodoItem from './todolist';
import '../assets/css/mytasks.css';

const Mytasks = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTaskAdded = useCallback(() => {
    // Force a refresh of the TodoItem component
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  return (
    <div className="task-manager">
      <AddTask onTaskAdded={handleTaskAdded} />
      <TodoItem key={refreshKey} />
    </div>
  );
};

export default Mytasks;