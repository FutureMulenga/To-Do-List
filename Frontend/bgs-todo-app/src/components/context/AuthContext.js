import React, { createContext, useReducer} from 'react';
import { authService, todoService } from '../services/api';

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

// Create context
export const AuthContext = createContext(initialState);

// Action types
const ADD_TASK_START = 'ADD_TASK_START';
const ADD_TASK_SUCCESS = 'ADD_TASK_SUCCESS';
const ADD_TASK_ERROR = 'ADD_TASK_ERROR';
const FETCH_TASKS_START = 'FETCH_TASKS_START';
const FETCH_TASKS_SUCCESS = 'FETCH_TASKS_SUCCESS';
const FETCH_TASKS_ERROR = 'FETCH_TASKS_ERROR';
const UPDATE_TASK_START = 'UPDATE_TASK_START';
const UPDATE_TASK_SUCCESS = 'UPDATE_TASK_SUCCESS';
const UPDATE_TASK_ERROR = 'UPDATE_TASK_ERROR';
const DELETE_TASK_START = 'DELETE_TASK_START';
const DELETE_TASK_SUCCESS = 'DELETE_TASK_SUCCESS';
const DELETE_TASK_ERROR = 'DELETE_TASK_ERROR';

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {

    // Add these cases to your authReducer
case FETCH_TASKS_START:
  return {
    ...state,
    loading: true,
    error: null
  };
case FETCH_TASKS_SUCCESS:
  return {
    ...state,
    tasks: action.payload,
    loading: false,
    error: null
  };
case FETCH_TASKS_ERROR:
  return {
    ...state,
    loading: false,
    error: action.payload
  };
case UPDATE_TASK_START:
  return {
    ...state,
    loading: true,
    error: null
  };
case UPDATE_TASK_SUCCESS:
  return {
    ...state,
    tasks: state.tasks?.map(task => 
      task.id === action.payload.id ? action.payload : task
    ),
    loading: false,
    error: null
  };
case UPDATE_TASK_ERROR:
  return {
    ...state,
    loading: false,
    error: action.payload
  };
case DELETE_TASK_START:
  return {
    ...state,
    loading: true,
    error: null
  };
case DELETE_TASK_SUCCESS:
  return {
    ...state,
    tasks: state.tasks?.filter(task => task.id !== action.payload),
    loading: false,
    error: null
  };
case DELETE_TASK_ERROR:
  return {
    ...state,
    loading: false,
    error: action.payload
  };
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case ADD_TASK_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    case ADD_TASK_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null
      };
    case ADD_TASK_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // login function
  const login = async (username, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login({ username, password });
      const { user, token } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });
      
      return true;
    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error.response?.data?.message || 'Login failed'
      });
      return false;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'REGISTER_START' });
    try {
      
      const response = await authService.register(userData);
      const { user, token } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: { user, token }
      });
      
      return true;
    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error.response?.data?.message || 'Registration failed'
      });
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  //the function for sending the task to the backend
  const addTask = async (taskData) => {
    dispatch({ type: ADD_TASK_START });
    try {
      const response = await todoService.addTask(taskData);
      dispatch({
        type: ADD_TASK_SUCCESS,
        payload: response.data
      });
      return response.data;
    } catch (error) {
      dispatch({
        type: ADD_TASK_ERROR,
        payload: error.response?.data?.message || 'Failed to create task'
      });
      throw error;
    }
  };

  const getTasks = async () => {
    dispatch({ type: FETCH_TASKS_START });
    try {
      const response = await todoService.getTasks();
      dispatch({
        type: FETCH_TASKS_SUCCESS,
        payload: response.data
      });
      return response.data;
    } catch (error) {
      dispatch({
        type: FETCH_TASKS_ERROR,
        payload: error.response?.data?.message || 'Failed to fetch tasks'
      });
      throw error;
    }
  };

  const updateTask = async (id, taskData) => {
    dispatch({ type: UPDATE_TASK_START });
    try {
      const response = await todoService.updateTask(id, taskData);
      dispatch({
        type: UPDATE_TASK_SUCCESS,
        payload: response.data
      });
      return response.data;
    } catch (error) {
      dispatch({
        type: UPDATE_TASK_ERROR,
        payload: error.response?.data?.message || 'Failed to update task'
      });
      throw error;
    }
  };

  const deleteTask = async (id) => {
    dispatch({ type: DELETE_TASK_START });
    try {
      await todoService.deleteTask(id);
      dispatch({
        type: DELETE_TASK_SUCCESS,
        payload: id
      });
      return true;
    } catch (error) {
      dispatch({
        type: DELETE_TASK_ERROR,
        payload: error.response?.data?.message || 'Failed to delete task'
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      addTask,
      getTasks,
      updateTask,
      deleteTask
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};