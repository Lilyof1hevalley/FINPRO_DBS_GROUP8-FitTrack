import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fittrack_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fittrack_token')
      localStorage.removeItem('fittrack_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data),
  getStats: () => api.get('/users/me/stats'),
}

export const workoutApi = {
  create: (data) => api.post('/workouts', data),
  getAll: (params) => api.get('/workouts', { params }),
  getById: (id) => api.get(`/workouts/${id}`),
  update: (id, data) => api.patch(`/workouts/${id}`, data),
  remove: (id) => api.delete(`/workouts/${id}`),
  addLog: (sessionId, data) => api.post(`/workouts/${sessionId}/logs`, data),
  addLogsBulk: (sessionId, data) => api.post(`/workouts/${sessionId}/logs/bulk`, data),
  deleteLog: (sessionId, logId) => api.delete(`/workouts/${sessionId}/logs/${logId}`),
}

export const progressApi = {
  strength: (params) => api.get('/progress/strength', { params }),
  volume: (params) => api.get('/progress/volume', { params }),
  personalRecords: () => api.get('/progress/personal-records'),
  frequency: (params) => api.get('/progress/frequency', { params }),
}

export const exerciseApi = {
  getAll: (params) => api.get('/exercises', { params }),
  getById: (id) => api.get(`/exercises/${id}`),
}

export const recommendationApi = {
  fetch: (params) => api.get('/recommendations', { params }),
  cached: () => api.get('/recommendations/cached'),
}

export default api
