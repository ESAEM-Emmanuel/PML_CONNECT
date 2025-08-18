// src/services/towns.service.js
import API from './api'; // <= ton intercepteur

const BASE = '/towns'; // on peut factoriser

export const townsService = {
  /* CREATE ---------------------------------------------------------- */
  createTown: (payload) =>
    API.post(`${BASE}/create`, payload),

  /* READ ------------------------------------------------------------- */
  getTowns: (params = {}) =>
    API.get(BASE, { params }),

  getTownById: (id) =>
    API.get(`${BASE}/${id}`),

  /* UPDATE ----------------------------------------------------------- */
  updateTown: (id, payload) =>
    API.put(`${BASE}/${id}`, payload),

  /* DELETE ----------------------------------------------------------- */
  deleteTown: (id) =>
    API.delete(`${BASE}/${id}`),

  /* PATCH (soft delete / restore) ------------------------------------ */
  patchTown: (id, payload) =>
    API.patch(`${BASE}/${id}`, payload)
};

export default townsService;