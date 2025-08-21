// src/services/towns.service.js
import API from './api'; // <= ton intercepteur

const BASE = '/towns'; // on peut factoriser

export const townsService = {
  // READ (lecture paginée avec filtres)
  getAll: (params) => API.get(BASE, { params }),

  //Lecture d'un vile et de ses détail
  getCountryById: (id) => API.get(`${BASE}/${id}`),
    
  // CREATE
  create: (payload) => API.post(`${BASE}/create`, payload),

  // UPDATE
  update: (id, payload) => API.put(`${BASE}/${id}`, payload),

  // DELETE (soft delete)
  delete: (id) => API.delete(`${BASE}/${id}`),

  // RESTORE (patch)
  restore: (id, payload) => API.patch(`${BASE}/${id}`, payload),
  // NOTE : Si vous avez un endpoint pour un pays unique,
};

export default townsService;