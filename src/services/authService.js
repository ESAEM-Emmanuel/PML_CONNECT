// services/authService.js
import axios from 'axios'
import api from './api'; // ton intercepteur axios

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const authService = {
  login: (values) => axios.post(`${API_URL}/users/login`, values),
  me: () => axios.get(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
  }),
  // signup: (values) => axios.post(`${API_URL}/users/register`, values),
  signup: (payload) =>
    api.post('/users/register', payload),
  forgotPassword: (values) => axios.post(`${API_URL}/users/forgot-password`, values),
  logout: () => axios.post(`${API_URL}/users/logout`)
}
