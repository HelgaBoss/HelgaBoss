import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Goals API
export const goalsApi = {
  getAll: (year) => api.get('/goals', { params: year ? { year } : {} }),
  getOne: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  updateProgress: (id, value) => api.put(`/goals/${id}/progress?value=${value}`),
};

// Milestones API
export const milestonesApi = {
  add: (goalId, data) => api.post(`/goals/${goalId}/milestones`, data),
  toggle: (goalId, milestoneId) => api.put(`/goals/${goalId}/milestones/${milestoneId}/toggle`),
  delete: (goalId, milestoneId) => api.delete(`/goals/${goalId}/milestones/${milestoneId}`),
};

// Habits API
export const habitsApi = {
  getAll: () => api.get('/habits'),
  create: (data) => api.post('/habits', data),
  complete: (id, date) => api.put(`/habits/${id}/complete`, { date }),
  delete: (id) => api.delete(`/habits/${id}`),
};

export default api;
