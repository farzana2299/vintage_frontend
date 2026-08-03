import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const incomeApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

incomeApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getIncomes = (params = {}) => incomeApi.get('/incomes', { params });
export const getIncomeById = (id) => incomeApi.get(`/income/${id}`);
export const createIncome = (payload) => incomeApi.post('/income', payload);
export const updateIncome = (id, payload) => incomeApi.patch(`/income/${id}`, payload);
export const deleteIncome = (id) => incomeApi.delete(`/income/${id}`);

// params: { period: 'daily' | 'monthly' | 'yearly', date? }
export const getIncomeSummary = (params = {}) => incomeApi.get('/income/summary', { params });
