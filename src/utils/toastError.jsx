// src/utils/toastError.js
import toast from 'react-hot-toast';

export function toastApiError(err) {
  const message =
    err?.response?.data?.message ||   // message de l’API
    err?.message ||                   // message Axios
    'Erreur serveur';
  toast.error(message);
}