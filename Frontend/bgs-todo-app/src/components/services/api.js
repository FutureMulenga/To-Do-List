import axios from 'axios';
import isTokenExpired from '../utility/tokenExpired'; 

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});



// interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (isTokenExpired(token)) {

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject('Token expired');
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add this after your request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      if (isTokenExpired(token)) {
        // Token is expired, clear storage and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject('Token expired');
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// AUTH API service methods
export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login/', credentials);
      // Store token immediately after successful login
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Add logging to debug token storage
        console.log('Token stored successfully:', response.data.token.substring(0, 20) + '...');
      }
      return response;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },
  register: (userData) => api.post('/auth/register/', userData),
  updateUser: (userData) => api.put('/auth/user/update/', userData),
  refreshUserData: async (userId) => {
    try {
      const response = await api.get(`/auth/users/${userId}/`);
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to refresh user data' };
    }
  },
  checkAuthStatus: () => {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      authService.logout();
      return false;
    }
    return true;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};


// TASK API service methods
export const todoService = {
  getTasks: () => api.get('/tasks/tasks/'),
  getTask: (id) => api.get(`/tasks/tasks/${id}`),
  addTask: (taskData) => api.post('/tasks/tasks/', taskData), 
  updateTask: (id, task) => api.put(`/tasks/tasks/${id}/`, task),
  deleteTask: (id) => api.delete(`/tasks/tasks/${id}`),
};

export default api;