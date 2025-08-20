// services/authService.js
import api from './api'; // ton intercepteur axios

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const authService = {
  login: (values) => api.post(`${API_URL}/users/login`, values),

  me: () => api.get(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
  }),

  signup: (payload) =>
    api.post('/users/register', payload),

  forgotPassword: (values) => api.post(`${API_URL}/users/forgot-password`, values),

  // services/authService.js
  reset: ({ token, password }) =>
  api.post(`/users/reset-password/${token}`, { password }),

  logout: () =>
  api.post(
    `${API_URL}/users/logout`,
    { token: localStorage.getItem('accessToken') },
    { headers: { 'Content-Type': 'application/json' } }
  ),

}
