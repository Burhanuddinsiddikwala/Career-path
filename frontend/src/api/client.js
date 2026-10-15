import axios from 'axios'

// In development, default to local backend port 5000; in production, use VITE_API_URL or relative path for proxy
const rawApiUrl = import.meta.env.VITE_API_URL
const API_BASE = rawApiUrl !== undefined 
  ? rawApiUrl 
  : (import.meta.env.DEV ? 'http://127.0.0.1:5000' : '')

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to inject Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('careerpath_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))

// Response interceptor to handle session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected route, clear token
      const isAuthCheck = error.config.url.includes('/api/auth/login') || error.config.url.includes('/api/auth/register')
      if (!isAuthCheck) {
        localStorage.removeItem('careerpath_token')
        localStorage.removeItem('careerpath_user')
      }
    }
    return Promise.reject(error)
  }
)

export default api
