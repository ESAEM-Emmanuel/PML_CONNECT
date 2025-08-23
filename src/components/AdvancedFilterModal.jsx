// src/components/AdvancedFilterModal.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AutocompleteInput from './AutocompleteInput';

const AdvancedFilterModal = ({
  isOpen,
  onClose,
  onApply,
  onReset,
  filterFields,
  initialFilters = {},
  users,
}) => {
  const { t } = useTranslation();
  
  // Utilise directement les props comme état, ce qui évite les problèmes de double source de vérité
  const [currentFilters, setCurrentFilters] = useState(initialFilters);

  // Synchronise l'état local du filtre avec les props initiales.
  useEffect(() => {
    setCurrentFilters(initialFilters);
  }, [initialFilters]);

  // Gère les changements de valeur pour les champs de filtre standards
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value,
    }));
  };
  
  // Gère la sélection dans le champ Autocomplete
  const handleAutocompleteChange = (name, id) => {
    setCurrentFilters((prev) => ({
      ...prev,
      [name]: id,
    }));
  };

  const handleApply = () => {
    onApply(currentFilters);
    onClose();
  };

  const handleReset = () => {
    setCurrentFilters({});
    onReset();
    onClose();
  };
  
  const otherFields = filterFields.filter(field => field.name !== 'search' && field.name !== 'isActive');

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box w-11/12 max-w-4xl">
        <div className="card-body">
          <button className="btn btn-sm btn-circle absolute right-2 top-2" onClick={onClose}>
            ✕
          </button>
          <h3 className="card-title text-lg font-semibold border-b pb-2 mb-4">
            {t('crud.advanced_filters')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {otherFields.map((field) => (
              <div key={field.name} className="form-control">
                <label className="label">
                  <span className="label-text font-medium">{field.label}</span>
                </label>
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={currentFilters[field.name] || ''}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="">{t('crud.select_option')}</option>
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'autocomplete' ? (
                  <AutocompleteInput
                    placeholder={field.label}
                    items={users}
                    onSelect={(id, name) => handleAutocompleteChange(field.name, id)}
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.label}
                    value={currentFilters[field.name] || ''}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="modal-action">
            <button className="btn btn-outline" onClick={handleReset}>
              {t('crud.reset')}
            </button>
            <button className="btn btn-primary" onClick={handleApply}>
              {t('crud.apply')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilterModal;