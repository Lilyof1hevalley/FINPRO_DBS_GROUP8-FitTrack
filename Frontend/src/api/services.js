import api from './client'

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data),
  getStats: () => api.get('/users/me/stats'),
}

export const workoutAPI = {
  getSessions: (params) => api.get('/workouts', { params }),
  getSession: (id) => api.get(`/workouts/${id}`),
  createSession: (data) => api.post('/workouts', data),
  updateSession: (id, data) => api.patch(`/workouts/${id}`, data),
  deleteSession: (id) => api.delete(`/workouts/${id}`),
  addLog: (sessionId, data) => api.post(`/workouts/${sessionId}/logs`, data),
  addLogsBulk: (sessionId, logs) => api.post(`/workouts/${sessionId}/logs/bulk`, { logs }),
  deleteLog: (sessionId, logId) => api.delete(`/workouts/${sessionId}/logs/${logId}`),
}

export const exerciseAPI = {
  getAll: (params) => api.get('/exercises', { params }),
  getOne: (id) => api.get(`/exercises/${id}`),
}

export const progressAPI = {
  strengthOverTime: (params) => api.get('/progress/strength', { params }),
  weeklyVolume: (params) => api.get('/progress/volume', { params }),
  personalRecords: () => api.get('/progress/personal-records'),
  workoutFrequency: (params) => api.get('/progress/frequency', { params }),
}

export const recommendationAPI = {
  fetch: (params) => api.get('/recommendations', { params }),
  getCached: () => api.get('/recommendations/cached'),
}
