// import { createContext, useContext, useEffect, useState } from 'react'
// import { authService } from '../services/authService'
// import toast from 'react-hot-toast'

// export const AuthContext = createContext(null)

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const bootstrap = async () => {
//       const token = localStorage.getItem('accessToken');
//       if (!token || token === 'null') {
//         setLoading(false);
//         return;
//       }
  
//       try {
//         const { data } = await authService.me();
//         console.log('me ok', data);
//         setUser(data?.result);
//       } catch {
//         console.error('me ko', err);
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     bootstrap();
//   }, []); // <- vide : exécuté une seule fois après le montage

//   // AuthContext.jsx
//   const login = async (values) => {
//     try {
//       console.log("values:", values);
//       const response = await authService.login(values);
//       // VÉRIFIEZ CETTE LIGNE
//       console.log("Réponse de l'API:", response);
//       const data = response.data;

//       // Affiche le contenu complet de la réponse pour le débogage
//       console.log("Réponse de l'API :", data);

//       // Vérifie si la connexion a réussi
//       // Attention : la valeur peut être `true` ou `"true"` selon l'API
//       if (data?.success === true) { 
//         // Si c'est un succès, on stocke les informations
//         localStorage.setItem('accessToken', data?.result?.token);
//         localStorage.setItem('refreshToken', data?.result?.refreshToken);
//         setUser(data?.result?.user);
//         toast.success('Connecté avec succès !');
//         return { success: true };
//       } else {
//         // Gère le cas où l'API répond mais la connexion a échoué
//         const errorMessage = data?.message || 'Échec de la connexion.';
//         toast.error(errorMessage);
//         return { success: false, error: errorMessage };
//       }

//     } catch (error) {
//       // Gère les erreurs de la requête elle-même (ex: serveur injoignable)
//       const errorMessage = error.response?.data?.message || 'Une erreur inattendue est survenue.';
//       toast.error(errorMessage);
//       return { success: false, error: errorMessage };
//     }
//   }
  

//   const signup = async (values) => {
//     console.log("values:", values);
//     const response = await authService.signup(values);
//     // VÉRIFIEZ CETTE LIGNE
//     console.log("Réponse de l'API:", response);
//     const data = response.data;

//     // Affiche le contenu complet de la réponse pour le débogage
//     console.log("Réponse de l'API :", data);
//     toast.success('Compte créé')
//   }

//   const reset = async ({ token, password }) => {
//     const { data } = await authService.reset({ token, password });
//     if (data?.success) {
//       toast.success(t('auth.reset_success'));
//       return { success: true };
//     }
//     toast.error(data?.message || 'Erreur');
//     return { success: false };
//   }

//   const forgotPassword = async (values) => {
//     await authService.forgotPassword(values)
//     toast.success('Email de réinitialisation envoyé')
//   }


//   const logout = async () => {
//     try {
//       await authService.logout();
//     } catch {}
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     setUser(null);
//     toast('Déconnecté');
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, signup, forgotPassword, reset, logout }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export const useAuth = () => useContext(AuthContext)
// src/context/AuthContext.jsx  (version corrigée & commentée)
import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------
     1)  Chargement initial de l’utilisateur
         (exécuté une seule fois après le montage)
  -------------------------------------------------- */
  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token || token === 'null') {
        setLoading(false);
        return;
      }

      try {
        const { data } = await authService.me();
        setUser(data?.result);
      } catch (err) {
        console.error('me ko', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  /* -------------------------------------------------
     2)  Connexion
  -------------------------------------------------- */
  const login = async (values) => {
    try {
      const response = await authService.login(values);
      const data = response.data;

      if (data?.success === true) {
        localStorage.setItem('accessToken', data?.result?.token);
        localStorage.setItem('refreshToken', data?.result?.refreshToken);
        setUser(data?.result?.user);
        toast.success('Connecté avec succès !');
        return { success: true };
      } else {
        const errorMessage = data?.message || 'Échec de la connexion.';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Erreur inconnue';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /* -------------------------------------------------
     3)  Inscription
  -------------------------------------------------- */
  const signup = async (values) => {
    try {
      const { data } = await authService.signup(values);
      if (data?.success) {
        toast.success('Compte créé');
      } else {
        toast.error(data?.message || 'Erreur lors de la création');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Erreur inconnue');
    }
  };

  /* -------------------------------------------------
     4)  Réinitialisation du mot de passe
  -------------------------------------------------- */
  const reset = async ({ token, password }) => {
    try {
      const { data } = await authService.reset({ token, password });
      if (data?.success) {
        toast.success('Mot de passe réinitialisé');
        return { success: true };
      } else {
        toast.error(data?.message || 'Erreur');
        return { success: false };
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Erreur inconnue');
      return { success: false };
    }
  };

  /* -------------------------------------------------
     5)  Mot de passe oublié
  -------------------------------------------------- */
  const forgotPassword = async (values) => {
    try {
      await authService.forgotPassword(values);
      toast.success('Email de réinitialisation envoyé');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Erreur inconnue');
    }
  };

  /* -------------------------------------------------
     6)  Déconnexion
  -------------------------------------------------- */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Erreur lors de la déconnexion');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      toast('Déconnecté');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, forgotPassword, reset, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);