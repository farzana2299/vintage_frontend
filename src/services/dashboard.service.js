import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const dashboardApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

dashboardApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// One aggregated call for the whole dashboard — all 11 sections share the
// same date-range/vehicle-class/test-status filters, so they're fetched together.
// params: { fromDate, toDate, vehicleClass, testStatus }
export const getDashboard = (params = {}) => dashboardApi.get('/dashboard', { params });

// Count of students who haven't attended their road safety class within a date range.
// params: { fromDate, toDate }
export const getRoadSafetyPendingCount = (params = {}) =>
  dashboardApi.get('/dashboard/road-safety-pending', { params });
