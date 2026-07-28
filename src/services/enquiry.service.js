import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const enquiryApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});
// Add token to requests
enquiryApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getEnquiries = (params = {}) => enquiryApi.get('/enquiries', { params });
export const getEnquiryById = (id) => enquiryApi.get(`/enquiry/${id}`);
export const createEnquiry = (payload) => enquiryApi.post('/enquiry', payload);
export const updateEnquiry = (id, payload) => enquiryApi.patch(`/enquiry/${id}`, payload);
export const deleteEnquiry = (id) => enquiryApi.delete(`/enquiry/${id}`);
