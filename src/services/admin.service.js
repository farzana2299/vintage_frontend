import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const adminApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const adminLogin = (payload) => adminApi.post('/admin/login', payload);

export const adminChangePassword = (payload) => adminApi.patch('/admin/change-password', payload);