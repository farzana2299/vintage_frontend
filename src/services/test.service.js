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

// Tests are auto-created by the backend when a student's vehicle class is set at registration.
export const getTestsSummary = (params = {}) => testApi.get('/tests/summary', { params });
export const getTestsByStudentId = (studentId) => testApi.get(`/test/student/${studentId}`);

// Bulk-assigns one date to every currently-undated Pending test for a student (first RTO visit).
export const scheduleInitialTestDates = (studentId, payload) =>
  testApi.patch(`/test/student/${studentId}/schedule`, payload);

// Sets/changes the date for a single test — used both for a plain reschedule
// and for retaking a Failed test.
export const updateTestDate = (testId, payload) => testApi.patch(`/test/${testId}/reschedule`, payload);

// Records Passed/Failed + remarks for a single test.
export const recordTestResult = (testId, payload) => testApi.patch(`/test/${testId}/result`, payload);

export const getTestHistory = (testId) => testApi.get(`/test/${testId}/history`);
