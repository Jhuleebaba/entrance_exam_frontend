import axios from 'axios';

// Set base URL for all axios requests based on environment
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:10000'; // default to backend port 10000
console.log(`Axios baseURL set to: ${baseURL}`); // Log the URL being used
axios.defaults.baseURL = baseURL;

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
