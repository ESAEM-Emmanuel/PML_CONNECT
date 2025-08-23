import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Un hook personnalisé pour gérer les filtres et les paramètres de l'URL.
 */
export function useModuleFilters(moduleKey) {
  const [searchParams, setSearchParams] = useSearchParams();

  // État local pour le terme de recherche avec un délai (debounce)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // L'effet de debounce pour la barre de recherche
  useEffect(() => {
    const handler = setTimeout(() => {
      // Mettre à jour l'URL avec le terme de recherche débobiné
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (searchTerm) {
          next.set('search', searchTerm);
        } else {
          next.delete('search');
        }
        // IMPORTANT : On ne réinitialise la page que si le terme de recherche a changé.
        // On s'assure que le paramètre `search` est bien géré, mais on laisse la pagination tranquille.
        if (next.get('page') === null) {
          next.set('page', '1');
        }
        return next;
      }, { replace: true });
    }, 700);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, setSearchParams]);

  // Gère la mise à jour de l'état de la barre de recherche
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    // On réinitialise la page à 1 ici pour s'assurer qu'un nouveau terme
    // de recherche commence toujours à la première page.
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', '1');
      return next;
    }, { replace: true });
  };
  

  const handleIsActiveToggle = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const currentlyActive = next.get('isActive') === 'true';
      next.set('isActive', currentlyActive ? 'false' : 'true');
      next.set('page', '1'); // Réinitialiser la page à 1 à chaque changement de filtre
      return next;
    });
  };

  const handleApplyFilters = (newFilters) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      
      Object.keys(newFilters).forEach(key => {
        if (newFilters[key] !== undefined && newFilters[key] !== null && newFilters[key] !== '' && newFilters[key] !== false) {
          next.set(key, newFilters[key]);
        } else {
          next.delete(key);
        }
      });
      
      // On s'assure que le filtre isActive est toujours présent
      if (prev.get('isActive') !== null) {
          next.set('isActive', prev.get('isActive'));
      }
      
      next.set('page', '1'); // Réinitialiser la page à 1 lors de l'application de filtres
      return next;
    });
  };

  const handleResetFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      // On garde isActive et search lors du reset
      if (prev.get('isActive') !== null) {
        next.set('isActive', prev.get('isActive'));
      }
      if (prev.get('search') !== null) {
        next.set('search', prev.get('search'));
      }
      return next;
    });
  };

  const handlePage = (page) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', page);
      return next;
    });
  };

  return {
    searchParams,
    searchTerm,
    handleSearchChange,
    handleIsActiveToggle,
    handleApplyFilters,
    handleResetFilters,
    handlePage,
  };
}