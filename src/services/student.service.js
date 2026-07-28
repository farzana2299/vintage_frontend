import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const studentApi = axios.create({
  baseURL,
});

studentApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getStudents = (params = {}) => studentApi.get('/students', { params });
export const getActiveStudents = (params = {}) => studentApi.get('/students/active', { params });
export const getStudentById = (id) => studentApi.get(`/student/${id}`);
export const createStudent = (payload) => {
  // Use FormData to support photo upload
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return studentApi.post('/student', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const updateStudent = (id, payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return studentApi.patch(`/student/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteStudent = (id) => studentApi.delete(`/student/${id}`);
