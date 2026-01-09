import axios from 'axios'

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://clinic-jvls.onrender.com',
  timeout: 10000,
  withCredentials: true, // ✅ Include credentials (cookies or auth headers) if backend requires
})

// Log base URL for debugging
console.log('Using API Base URL:', import.meta.env.VITE_API_BASE_URL ?? 'https://clinic-jvls.onrender.com')

// Intercept responses for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns structured error
    if (error.response?.data?.detail) {
      return Promise.reject(new Error(error.response.data.detail))
    }
    // Otherwise, return original error
    return Promise.reject(error)
  },
)

export default api
