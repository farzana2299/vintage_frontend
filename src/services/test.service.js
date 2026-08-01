import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const testApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

testApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mandatory tests are auto-created by the backend when a student registers.
// createTest supports manually scheduling an additional test on top of those.
export const getTests = (params = {}) => testApi.get('/tests', { params });
export const getTestById = (id) => testApi.get(`/test/${id}`);
export const createTest = (payload) => testApi.post('/test', payload);
export const updateTest = (id, payload) => testApi.patch(`/test/${id}`, payload);
export const getTestHistory = (id) => testApi.get(`/test/${id}/history`);
