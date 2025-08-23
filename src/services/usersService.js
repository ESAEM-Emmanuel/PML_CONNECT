// src/services/users.service.js
import API from './api';

const BASE = '/users';

export const usersService = {
  // READ (lecture paginée avec filtres)
  getAll: (params) => API.get(BASE, { params }),
  
  // READ (lecture par ID)
  getCountryById: (id) => API.get(`${BASE}/${id}`),

  // CREATE
  create: (payload) => API.post(`${BASE}/create`, payload),

  // UPDATE
  update: (id, payload) => API.put(`${BASE}/${id}`, payload),

  // DELETE (soft delete)
  delete: (id) => API.delete(`${BASE}/${id}`),

  // RESTORE (patch)
  restore: (id, payload) => API.patch(`${BASE}/${id}`, payload),
};