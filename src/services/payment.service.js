import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const paymentApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

paymentApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getPayments = (params = {}) => paymentApi.get('/payments', { params });
export const getPaymentStudentsSummary = (params = {}) =>
  paymentApi.get('/payment/students', { params });
export const getPaymentsByStudentId = (studentId) =>
  paymentApi.get(`/payment/student/${studentId}`);
export const getPaymentById = (id) => paymentApi.get(`/payment/${id}`);
export const createPayment = (payload) => paymentApi.post('/payment', payload);
export const updatePayment = (id, payload) => paymentApi.patch(`/payment/${id}`, payload);
export const deletePayment = (id) => paymentApi.delete(`/payment/${id}`);
