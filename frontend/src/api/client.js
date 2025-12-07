import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Adjust based on backend auth expectation (Devise usually uses Authorization header or cookie)
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
