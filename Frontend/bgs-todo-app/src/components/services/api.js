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
  updateUser: (id, userData) => api.put('/auth/user/update/', userData),
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
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const todoService = {
  getTasks: () => api.get('/tasks/tasks/'),
  getTask: (id) => api.get(`/tasks/tasks/${id}`),
  addTask: (taskData) => api.post('/tasks/tasks/', taskData), 
  updateTask: (id, task) => api.put(`/tasks/tasks/${id}/`, task),
  deleteTask: (id) => api.delete(`/tasks/tasks/${id}`),
};

export default api;