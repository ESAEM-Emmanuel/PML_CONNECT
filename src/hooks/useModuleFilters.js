// import { useState, useEffect, useMemo } from 'react';
// import { useSearchParams } from 'react-router-dom';

// /**
//  * Un hook personnalisé pour gérer les filtres et les paramètres de l'URL.
//  */
// export function useModuleFilters(moduleKey) {
//   const [searchParams, setSearchParams] = useSearchParams();

//   // État local pour le terme de recherche avec un délai (debounce)
//   const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

//   // L'effet de debounce pour la barre de recherche
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       // Mettre à jour l'URL avec le terme de recherche débobiné
//       setSearchParams((prev) => {
//         const next = new URLSearchParams(prev);
//         if (searchTerm) {
//           next.set('search', searchTerm);
//         } else {
//           next.delete('search');
//         }
//         // IMPORTANT : On ne réinitialise la page que si le terme de recherche a changé.
//         // On s'assure que le paramètre `search` est bien géré, mais on laisse la pagination tranquille.
//         if (next.get('page') === null) {
//           next.set('page', '1');
//         }
//         return next;
//       }, { replace: true });
//     }, 700);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [searchTerm, setSearchParams]);

//   // Gère la mise à jour de l'état de la barre de recherche
//   const handleSearchChange = (newSearchTerm) => {
//     setSearchTerm(newSearchTerm);
//     // On réinitialise la page à 1 ici pour s'assurer qu'un nouveau terme
//     // de recherche commence toujours à la première page.
//     setSearchParams((prev) => {
//       const next = new URLSearchParams(prev);
//       next.set('page', '1');
//       return next;
//     }, { replace: true });
//   };
  
  

//   const handleIsActiveToggle = () => {
//     setSearchParams((prev) => {
//       const next = new URLSearchParams(prev);
//       const currentlyActive = next.get('isActive') === 'true';
//       next.set('isActive', currentlyActive ? 'false' : 'true');
//       next.set('page', '1'); // Réinitialiser la page à 1 à chaque changement de filtre
//       return next;
//     });
//   };

//   const handleApplyFilters = (newFilters) => {
//     setSearchParams((prev) => {
//       const next = new URLSearchParams(prev);
      
//       Object.keys(newFilters).forEach(key => {
//         if (newFilters[key] !== undefined && newFilters[key] !== null && newFilters[key] !== '' && newFilters[key] !== false) {
//           next.set(key, newFilters[key]);
//         } else {
//           next.delete(key);
//         }
//       });
      
//       // On s'assure que le filtre isActive est toujours présent
//       if (prev.get('isActive') !== null) {
//           next.set('isActive', prev.get('isActive'));
//       }
      
//       next.set('page', '1'); // Réinitialiser la page à 1 lors de l'application de filtres
//       return next;
//     });
//   };

//   const handleResetFilters = () => {
//     setSearchParams((prev) => {
//       const next = new URLSearchParams();
//       // On garde isActive et search lors du reset
//       if (prev.get('isActive') !== null) {
//         next.set('isActive', prev.get('isActive'));
//       }
//       if (prev.get('search') !== null) {
//         next.set('search', prev.get('search'));
//       }
//       return next;
//     });
//   };

//   const handlePage = (page) => {
//     setSearchParams((prev) => {
//       const next = new URLSearchParams(prev);
//       next.set('page', page);
//       return next;
//     });
//   };

//   return {
//     searchParams,
//     searchTerm,
//     handleSearchChange,
//     handleIsActiveToggle,
//     handleApplyFilters,
//     handleResetFilters,
//     handlePage,
//   };
// }

// // src/hooks/useModuleFilters.js
// import { useState, useEffect, useMemo } from 'react';
// import { useSearchParams } from 'react-router-dom';

// /**
//  * Un hook personnalisé pour gérer les filtres et les paramètres de l'URL.
//  */
// export function useModuleFilters(moduleKey) {
//   const [searchParams, setSearchParams] = useSearchParams();

//   // État local pour le terme de recherche avec un délai (debounce)
//   const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

//   // L'effet de debounce pour la barre de recherche
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setSearchParams((prev) => {
//         const next = new URLSearchParams(prev);
//         if (searchTerm) {
//           next.set('search', searchTerm);
//         } else {
//           next.delete('search');
//         }
//         if (next.get('page') === null) {
//           next.set('page', '1');
//         }
//         return next;
//       }, { replace: true });
//     }, 700);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [searchTerm, setSearchParams]);

//   // Gère la mise à jour de l'état de la barre de recherche
//   const handleSearchChange = (newSearchTerm) => {
//     setSearchTerm(newSearchTerm);
//     setSearchParams((prev) => {
//       const next = new URLSearchParams(prev);
//       next.set('page', '1');
//       return next;
//     }, { replace: true });
//   };
  
//   const handleIsActiveToggle = () => {
//     setSearchParams((prev) => {
//       const next = new URLSearchParams(prev);
//       const currentlyActive = next.get('isActive') === 'true';
//       next.set('isActive', currentlyActive ? 'false' : 'true');
//       next.set('page', '1');
//       return next;
//     });
//   };

//   const handleApplyFilters = (newFilters) => {
//     setSearchParams((prev) => {
//       const next = new URLSearchParams(prev);
      
//       Object.keys(newFilters).forEach(key => {
//         if (newFilters[key] !== undefined && newFilters[key] !== null && newFilters[key] !== '' && newFilters[key] !== false) {
//           next.set(key, newFilters[key]);
//         } else {
//           next.delete(key);
//         }
//       });
      
//       if (prev.get('isActive') !== null) {
//           next.set('isActive', prev.get('isActive'));
//       }
      
//       next.set('page', '1');
//       return next;
//     });
//   };

//   const handleResetFilters = () => {
//     setSearchParams((prev) => {
//       const next = new URLSearchParams();
//       if (prev.get('isActive') !== null) {
//         next.set('isActive', prev.get('isActive'));
//       }
//       if (prev.get('search') !== null) {
//         next.set('search', prev.get('search'));
//       }
//       return next;
//     });
//   };

//   const handlePage = (page) => {
//     setSearchParams((prev) => {
//       const next = new URLSearchParams(prev);
//       next.set('page', page);
//       return next;
//     });
//   };

//   const hasAdvancedFilters = useMemo(() => {
//     const ignoredKeys = ['page', 'search', 'isActive'];
//     return Array.from(searchParams.keys()).some(key => !ignoredKeys.includes(key));
//   }, [searchParams]);

//   return {
//     searchParams,
//     searchTerm,
//     hasAdvancedFilters,
//     handleSearchChange,
//     handleIsActiveToggle,
//     handleApplyFilters,
//     handleResetFilters,
//     handlePage,
//   };
// }
// src/hooks/useModuleFilters.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook personnalisé pour gérer les filtres et les paramètres de l'URL avec un "debounce".
 * Le "debounce" est une technique qui retarde l'exécution d'une fonction jusqu'à ce
 * qu'un certain temps se soit écoulé sans qu'elle soit appelée à nouveau. Cela est
 * particulièrement utile pour les champs de recherche, afin d'éviter d'envoyer
 * une requête API à chaque frappe de l'utilisateur.
 */
export function useModuleFilters(moduleKey) {
  const [searchParams, setSearchParams] = useSearchParams();

  // État local pour le terme de recherche. Il est mis à jour immédiatement
  // à chaque frappe pour une saisie fluide de l'utilisateur.
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // L'effet de "debounce" pour la barre de recherche.
  // Cet effet se déclenche uniquement lorsque 'searchTerm' change.
  useEffect(() => {
    // On définit un délai de 700ms avant de mettre à jour l'URL.
    // Si l'utilisateur tape un autre caractère avant la fin du délai,
    // le timer précédent est annulé et un nouveau est créé.
    const handler = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (searchTerm) {
          next.set('search', searchTerm);
        } else {
          next.delete('search');
        }
        // On réinitialise la page à 1 à chaque nouvelle recherche
        next.set('page', '1');
        return next;
      }, { replace: true });
    }, 700);

    // Fonction de nettoyage (cleanup) qui annule le timer.
    // Cela empêche la mise à jour de l'URL si le composant se démonte
    // ou si l'utilisateur continue de taper.
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, setSearchParams]);

  // Gère la mise à jour de l'état local de la barre de recherche.
  // Cela n'a aucun impact sur l'URL directement, ce qui rend l'input fluide.
  const handleSearchChange = useCallback((newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  }, []);

  // Gère le basculement de l'état "actif/inactif"
  const handleIsActiveToggle = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const currentlyActive = next.get('isActive') === 'true';
      next.set('isActive', currentlyActive ? 'false' : 'true');
      next.set('page', '1'); // Réinitialise la page
      return next;
    });
  }, [setSearchParams]);

  // Gère l'application des filtres avancés
  const handleApplyFilters = useCallback((newFilters) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      
      // Ajoute ou met à jour les filtres
      Object.keys(newFilters).forEach(key => {
        const value = newFilters[key];
        // On vérifie les valeurs "falsy" pour les supprimer de l'URL
        if (value !== undefined && value !== null && value !== '' && value !== false) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      });
      
      // On s'assure que le filtre 'isActive' n'est pas perdu
      if (prev.get('isActive') !== null) {
          next.set('isActive', prev.get('isActive'));
      }
      
      next.set('page', '1'); // Réinitialise la page
      return next;
    });
  }, [setSearchParams]);

  // Gère la réinitialisation des filtres avancés, en conservant
  // uniquement 'search' et 'isActive'.
  const handleResetFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      if (prev.get('isActive') !== null) {
        next.set('isActive', prev.get('isActive'));
      }
      // On ne réinitialise le searchTerm que dans l'URL, l'état local reste inchangé
      if (prev.get('search') !== null) {
        next.set('search', prev.get('search'));
      }
      return next;
    });
  }, [setSearchParams]);

  // Gère la navigation entre les pages
  const handlePage = useCallback((page) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', page);
      return next;
    });
  }, [setSearchParams]);

  // Vérifie s'il y a des filtres avancés actifs (mémoïsé pour la performance)
  const hasAdvancedFilters = useMemo(() => {
    const ignoredKeys = ['page', 'search', 'isActive'];
    return Array.from(searchParams.keys()).some(key => !ignoredKeys.includes(key));
  }, [searchParams]);

  return {
    searchParams,
    searchTerm,
    hasAdvancedFilters,
    handleSearchChange,
    handleIsActiveToggle,
    handleApplyFilters,
    handleResetFilters,
    handlePage,
  };
}