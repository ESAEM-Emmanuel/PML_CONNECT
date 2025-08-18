import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data } = await authService.me()
        setUser(data)
      } catch {
        // not logged
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, [])

  // AuthContext.jsx
  const login = async (values) => {
    try {
      console.log("values:", values);
      const response = await authService.login(values);
      // VÉRIFIEZ CETTE LIGNE
      console.log("Réponse de l'API:", response);
      const data = response.data;

      // Affiche le contenu complet de la réponse pour le débogage
      console.log("Réponse de l'API :", data);

      // Vérifie si la connexion a réussi
      // Attention : la valeur peut être `true` ou `"true"` selon l'API
      if (data?.success === true) { 
        // Si c'est un succès, on stocke les informations
        localStorage.setItem('accessToken', data?.result?.token);
        localStorage.setItem('refreshToken', data?.result?.refreshToken);
        setUser(data?.result?.user);
        toast.success('Connecté avec succès !');
        return { success: true };
      } else {
        // Gère le cas où l'API répond mais la connexion a échoué
        const errorMessage = data?.message || 'Échec de la connexion.';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

    } catch (error) {
      // Gère les erreurs de la requête elle-même (ex: serveur injoignable)
      const errorMessage = error.response?.data?.message || 'Une erreur inattendue est survenue.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }
  

  const signup = async (values) => {
    console.log("values:", values);
    const response = await authService.signup(values);
    // VÉRIFIEZ CETTE LIGNE
    console.log("Réponse de l'API:", response);
    const data = response.data;

    // Affiche le contenu complet de la réponse pour le débogage
    console.log("Réponse de l'API :", data);
    toast.success('Compte créé')
  }

  const forgotPassword = async (values) => {
    await authService.forgotPassword(values)
    toast.success('Email de réinitialisation envoyé')
  }

  const logout = async () => {
    try { await authService.logout() } catch {}
    localStorage.removeItem('accessToken')
    setUser(null)
    toast('Déconnecté')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, forgotPassword, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)