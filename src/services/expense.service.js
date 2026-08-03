import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const expenseApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

expenseApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getExpenses = (params = {}) => expenseApi.get('/expenses', { params });
export const getExpenseById = (id) => expenseApi.get(`/expense/${id}`);
export const createExpense = (payload) => expenseApi.post('/expense', payload);
export const updateExpense = (id, payload) => expenseApi.patch(`/expense/${id}`, payload);
export const deleteExpense = (id) => expenseApi.delete(`/expense/${id}`);

// params: { period: 'daily' | 'monthly' | 'yearly' }
export const getExpenseSummary = (params = {}) => expenseApi.get('/expense/summary', { params });
