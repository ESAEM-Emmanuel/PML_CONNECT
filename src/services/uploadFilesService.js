// src/services/uploadFiles.service.js
import API from './api'; // <= ton intercepteur

const BASE = '/files'; // on peut factoriser

export const uploadFilesService = {
  /* CREATE ---------------------------------------------------------- */
  createFiles: (payload) =>
    API.post(`${BASE}/upload`, payload),

};

export default uploadFilesService;