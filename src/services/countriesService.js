// // src/services/countries.service.js
// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_BASE_URL; // ex: https://172.19.120.38:5000/api

// /* ----------------------------------------------------------------------
//    Instance Axios avec intercepteur automatique
// ---------------------------------------------------------------------- */
// const api = axios.create({
//   baseURL: API_URL,
//   headers: { 'Content-Type': 'application/json' }
// });

// // Injecte automatiquement le token dans chaque requête
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('accessToken');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// /* ----------------------------------------------------------------------
//    Service Countries
// ---------------------------------------------------------------------- */
// export const countriesService = {
//   /* Create ----------------------------------------------------------- */
//   createCountry: (payload) =>
//     api.post('/countries/create', payload),

//   /* Read ------------------------------------------------------------- */
//   /* limit = -1 renvoie tous les pays ; isActive = true par défaut */
//   /* READ : tous les filtres possibles passés via params ----------- */
//   getCountries: (params = {}) =>
//     api.get('/countries', {
//       params: {
//         ...params // <= écrase/ajoute tout ce que l’on passe
//       }
//     }),

//   getCountryById: (id) =>
//     api.get(`/countries/${id}`),

//   /* Update ----------------------------------------------------------- */
//   updateCountry: (id, payload) =>
//     api.put(`/countries/${id}`, payload),

//   /* Delete ----------------------------------------------------------- */
//   deleteCountry: (id) =>
//     api.delete(`/countries/${id}`),

//   /* Soft-delete / restore via PATCH si ton API le supporte ----------- */
//   patchCountry: (id, payload) =>
//     api.patch(`/countries/${id}`, payload)
// };

// export default countriesService;

// src/services/countries.service.js
import API from './api'; // <= ton intercepteur

const BASE = '/countries'; // on peut factoriser

export const countriesService = {
  /* CREATE ---------------------------------------------------------- */
  createCountry: (payload) =>
    API.post(`${BASE}/create`, payload),

  /* READ ------------------------------------------------------------- */
  getCountries: (params = {}) =>
    API.get(BASE, { params }),

  getCountryById: (id) =>
    API.get(`${BASE}/${id}`),

  /* UPDATE ----------------------------------------------------------- */
  updateCountry: (id, payload) =>
    API.put(`${BASE}/${id}`, payload),

  /* DELETE ----------------------------------------------------------- */
  deleteCountry: (id) =>
    API.delete(`${BASE}/${id}`),

  /* PATCH (soft delete / restore) ------------------------------------ */
  patchCountry: (id, payload) =>
    API.patch(`${BASE}/${id}`, payload)
};

export default countriesService;