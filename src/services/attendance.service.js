import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const attendanceApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

attendanceApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAttendances = (params = {}) => attendanceApi.get('/attendances', { params });
export const getAttendanceStudentsSummary = (params = {}) =>
  attendanceApi.get('/attendance/students', { params });
export const getAttendanceByStudentId = (studentId) =>
  attendanceApi.get(`/attendance/student/${studentId}`);
export const getAttendanceById = (id) => attendanceApi.get(`/attendance/${id}`);
export const createAttendance = (payload) => attendanceApi.post('/attendance', payload);
export const updateAttendance = (id, payload) => attendanceApi.patch(`/attendance/${id}`, payload);
export const deleteAttendance = (id) => attendanceApi.delete(`/attendance/${id}`);
