import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdvancedFilter = ({ onSearchChange, onApply, onReset, filterFields, initialFilters = {} }) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});

  // Synchronise l'état local du filtre avec les props initiales.
  // Cela garantit que les filtres de l'URL sont affichés dans le formulaire.
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Sépare les champs pour la disposition
  const searchField = filterFields.find(field => field.name === 'search');
  const otherFields = filterFields.filter(field => field.name !== 'search' && field.name !== 'isActive');
  const isActiveField = filterFields.find(field => field.name === 'isActive');

  // Gère les changements dans le formulaire des filtres avancés.
  // Note: La barre de recherche rapide est gérée par le composant parent.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleApplyFilters = () => {
    onApply(filters);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    const emptyFilters = filterFields.reduce((acc, field) => {
      // Pour le reset, on garde isActive, et search est déjà géré par l'input rapide
      if (field.name !== 'isActive' && field.name !== 'search') {
        acc[field.name] = field.type === 'checkbox' ? false : '';
      }
      return acc;
    }, {});
    
    setFilters(initialFilters); // Réinitialise l'état local avec les filtres initiaux de l'URL
    onReset(); // Appelle la fonction de réinitialisation du parent pour mettre à jour l'URL
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Barre de recherche et bouton de filtres avancés */}
      <div className="flex gap-4 items-center">
        {/* L'input de recherche rapide est géré par le composant parent (CountriesPage) */}
        
        {/* Bouton pour afficher/cacher les filtres avancés */}
        <button
          className="btn btn-ghost"
          onClick={() => setShowFilters(!showFilters)}
          title={t('crud.advanced_filters')}
        >
          <SlidersHorizontal size={24} />
        </button>
      </div>

      {/* Contenu des filtres avancés (visible si showFilters est vrai) */}
      {showFilters && (
        <div className="bg-base-100 shadow-xl p-4 rounded-lg transition-all duration-300">
          <h3 className="font-semibold text-lg border-b pb-2 mb-4">{t('crud.advanced_filters')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Rendu des autres champs (sauf 'search' et 'isActive') */}
            {otherFields.map(field => (
              <div key={field.name} className="form-control">
                <label className="label">
                  <span className="label-text">{field.label}</span>
                </label>
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    className="select select-bordered w-full"
                    value={filters[field.name] || ''}
                    onChange={handleChange}
                  >
                    <option value="">{t('crud.all')}</option>
                    {field.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={field.name}
                    type={field.type}
                    className="input input-bordered w-full"
                    value={filters[field.name] || ''}
                    onChange={handleChange}
                    placeholder={field.label}
                  />
                )}
              </div>
            ))}
            
            {/* Rendu du champ 'isActive' si défini */}
            {isActiveField && (
              <div className="flex items-center gap-2">
                <label className="label cursor-pointer flex items-center gap-2">
                  <span className="label-text">{t('crud.show_active_only')}</span>
                  <input
                    name="isActive"
                    type="checkbox"
                    className="toggle"
                    checked={filters.isActive === 'true'} // L'état vient de l'URL (chaîne)
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, isActive: e.target.checked ? 'true' : 'false' }));
                    }}
                  />
                </label>
              </div>
            )}
          </div>
          
          {/* Boutons d'action */}
          <div className="flex justify-end gap-2 mt-4">
            <button className="btn btn-sm btn-ghost" onClick={handleResetFilters}>
              {t('crud.reset')}
            </button>
            <button className="btn btn-sm btn-primary" onClick={handleApplyFilters}>
              {t('crud.apply')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilter;