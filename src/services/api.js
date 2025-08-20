// // src/api/interceptor.js
// import axios from 'axios';


// const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: false // on envoie le refresh via body, pas via cookie
// });

// let isRefreshing = false;
// let subscribers = [];

// function onRefreshed(token) {
//   subscribers.forEach(cb => cb(token));
//   subscribers = [];
// }

// function addSubscriber(cb) {
//   subscribers.push(cb);
// }

// /* -------------------------------------------------
//    Intercepteur requête : injection token
// -------------------------------------------------- */
// api.interceptors.request.use(config => {
//   const token = localStorage.getItem('accessToken');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// /* -------------------------------------------------
//    Intercepteur réponse : refresh + gestion erreurs
// -------------------------------------------------- */
// api.interceptors.response.use(
//   res => res,
//   async error => {
//     const { config, response } = error;

//     // 1) Tentative de refresh uniquement sur 401 et non déjà en cours
//     if (response?.status === 401 && !config._retry) {
//       config._retry = true;

//       if (!isRefreshing) {
//         isRefreshing = true;
//         const refreshToken = localStorage.getItem('refreshToken');

//         // Pas de refreshToken → on sort
//         if (!refreshToken) {
//           localStorage.clear();
//           window.location.href = '/login';
//           return Promise.reject(error);
//         }

//         try {
//           const { data } = await axios.post(
//             `${API_URL}/users/refresh`,
//             { refreshToken }
//           );

//           const newAccessToken = data?.result?.token;
//           if (newAccessToken) {
//             localStorage.setItem('accessToken', newAccessToken);
//             onRefreshed(newAccessToken);
//           }
//         } catch (refreshErr) {
//           // Capture du message d’erreur renvoyé par l’API
//           const apiError =
//             refreshErr?.response?.data?.message ||
//             refreshErr.message ||
//             'Session expirée';

//           // Nettoyage + redirection
//           localStorage.clear();
//           window.location.href = '/login';

//           // On rejette avec le libellé métier
//           return Promise.reject(new Error(apiError));
//         } finally {
//           isRefreshing = false;
//         }
//       }

//       // Requêtes en attente : on les rejoue avec le nouveau token
//       return new Promise(resolve => {
//         addSubscriber(token => {
//           config.headers.Authorization = `Bearer ${token}`;
//           resolve(api(config));
//         });
//       });
//     }

//     // 2) Autre code d’erreur (400, 403, 404, 500…)
//     const apiMessage =
//       response?.data?.message ||
//       response?.statusText ||
//       error.message ||
//       'Erreur inconnue';

//     // On enveloppe pour que vos composants puissent l’afficher
//     return Promise.reject(new Error(apiMessage));
//   }
// );

// export default api;
// src/api/interceptor.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Instance axios commune
const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,//on envoie le refresh via body, pas via cookie
});

let isRefreshing = false;   // flag pour éviter plusieurs refresh en parallèle
let subscribers = [];       // requêtes en attente pendant le refresh

/* -------------------------------------------------
   1) Intercepteur REQUEST
   → injection automatique du Bearer token
-------------------------------------------------- */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    // On n’ajoute pas "Bearer null"
    if (token && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* -------------------------------------------------
   2) Intercepteur RESPONSE
   → gestion du refresh token + erreurs
-------------------------------------------------- */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;

    // Seulement sur 401 et si on n’a pas encore tenté un refresh
    if (response?.status === 401 && !config._retry) {
      config._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = localStorage.getItem('refreshToken');

        // Pas de refreshToken → on quitte proprement
        if (!refreshToken || refreshToken === 'null') {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          // Demande un nouvel accessToken
          const { data } = await axios.post(
            `${API_URL}/users/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } },
          );

          const newAccessToken = data?.result?.token;
          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
            // Relance toutes les requêtes en attente
            onRefreshed(newAccessToken);
          } else {
            throw new Error('Token absent dans la réponse');
          }
        } catch (refreshErr) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      // Requête en attente : on la rejoue avec le nouveau token
      return new Promise((resolve) => {
        addSubscriber((token) => {
          config.headers.Authorization = `Bearer ${token}`;
          resolve(api(config));
        });
      });
    }

    // Autres erreurs : on laisse remonter
    const apiMessage =
      response?.data?.message ||
      response?.statusText ||
      error.message ||
      'Erreur inconnue';
    return Promise.reject(new Error(apiMessage));
  },
);

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */
function onRefreshed(token) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}
function addSubscriber(cb) {
  subscribers.push(cb);
}

export default api;