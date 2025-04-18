import axios from 'axios';

// Set base URL for all axios requests
axios.defaults.baseURL = https://entrance-exam-backend-whlx.onrender.com;

// Add request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios; 
