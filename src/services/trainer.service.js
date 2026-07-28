import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const trainerApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

trainerApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getTrainers = (params = {}) => trainerApi.get('/trainers', { params });
export const getActiveTrainers = (params = {}) => trainerApi.get('/trainers/active', { params });
export const getTrainerById = (id) => trainerApi.get(`/trainer/${id}`);
export const createTrainer = (payload) => trainerApi.post('/trainer', payload);
export const updateTrainer = (id, payload) => trainerApi.patch(`/trainer/${id}`, payload);
export const deleteTrainer = (id) => trainerApi.delete(`/trainer/${id}`);
