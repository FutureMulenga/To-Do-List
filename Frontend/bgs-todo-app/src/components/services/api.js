import axios from 'axios';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Adjust this to match your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API service methods
export const authService = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const todoService = {
  getTasks: () => api.get('/auth/tasks/'),
  getTask: (id) => api.get(`/tasks/${id}`),
  addTask: (taskData) => api.post('/auth/tasks/', taskData), 
  updateTask: (id, task) => api.put(`/auth/tasks/${id}/`, task),
  deleteTask: (id) => api.delete(`/auth/tasks/${id}`),
};

export default api;