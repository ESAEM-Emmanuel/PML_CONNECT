// src/api/interceptor.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false // on envoie le refresh via body, pas via cookie
});

let isRefreshing = false;
let subscribers = [];

function onRefreshed(token) {
  subscribers.forEach(cb => cb(token));
  subscribers = [];
}

function addSubscriber(cb) {
  subscribers.push(cb);
}

/* -------------------------------------------------
   Intercepteur requête : injection token
-------------------------------------------------- */
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* -------------------------------------------------
   Intercepteur réponse : refresh + gestion erreurs
-------------------------------------------------- */
api.interceptors.response.use(
  res => res,
  async error => {
    const { config, response } = error;

    // 1) Tentative de refresh uniquement sur 401 et non déjà en cours
    if (response?.status === 401 && !config._retry) {
      config._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = localStorage.getItem('refreshToken');

        // Pas de refreshToken → on sort
        if (!refreshToken) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          const { data } = await axios.post(
            `${API_URL}/users/refresh`,
            { refreshToken }
          );

          const newAccessToken = data?.result?.token;
          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
            onRefreshed(newAccessToken);
          }
        } catch (refreshErr) {
          // Capture du message d’erreur renvoyé par l’API
          const apiError =
            refreshErr?.response?.data?.message ||
            refreshErr.message ||
            'Session expirée';

          // Nettoyage + redirection
          localStorage.clear();
          window.location.href = '/login';

          // On rejette avec le libellé métier
          return Promise.reject(new Error(apiError));
        } finally {
          isRefreshing = false;
        }
      }

      // Requêtes en attente : on les rejoue avec le nouveau token
      return new Promise(resolve => {
        addSubscriber(token => {
          config.headers.Authorization = `Bearer ${token}`;
          resolve(api(config));
        });
      });
    }

    // 2) Autre code d’erreur (400, 403, 404, 500…)
    const apiMessage =
      response?.data?.message ||
      response?.statusText ||
      error.message ||
      'Erreur inconnue';

    // On enveloppe pour que vos composants puissent l’afficher
    return Promise.reject(new Error(apiMessage));
  }
);

export default api;