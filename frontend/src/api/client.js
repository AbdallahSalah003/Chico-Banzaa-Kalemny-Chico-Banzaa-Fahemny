import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_BASE = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json' 
  },
});

const apiClient2 = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json' 
  },
});

const attachToken = (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
};

apiClient.interceptors.request.use(attachToken, (error) => Promise.reject(error));
apiClient2.interceptors.request.use(attachToken, (error) => Promise.reject(error));


export default apiClient;

export { apiClient2 };