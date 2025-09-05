// // src/components/AdvancedFilterModal.jsx

// import React, { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
// import AutocompleteInput from './AutocompleteInput';

// const AdvancedFilterModal = ({
//   isOpen,
//   onClose,
//   onApply,
//   onReset,
//   filterFields,
//   initialFilters = {},
//   users,
// }) => {
//   const { t } = useTranslation();
  
//   // Utilise directement les props comme état, ce qui évite les problèmes de double source de vérité
//   const [currentFilters, setCurrentFilters] = useState(initialFilters);

//   // Synchronise l'état local du filtre avec les props initiales.
//   useEffect(() => {
//     setCurrentFilters(initialFilters);
//   }, [initialFilters]);

//   // Gère les changements de valeur pour les champs de filtre standards
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setCurrentFilters((prev) => ({
//       ...prev,
//       [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value,
//     }));
//   };
  
//   // Gère la sélection dans le champ Autocomplete
//   const handleAutocompleteChange = (name, id) => {
//     setCurrentFilters((prev) => ({
//       ...prev,
//       [name]: id,
//     }));
//   };

//   const handleApply = () => {
//     onApply(currentFilters);
//     onClose();
//   };

//   const handleReset = () => {
//     setCurrentFilters({});
//     onReset();
//     onClose();
//   };
  
//   const otherFields = filterFields.filter(field => field.name !== 'search' && field.name !== 'isActive');

//   return (
//     <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
//       <div className="modal-box w-11/12 max-w-4xl">
//         <div className="card-body">
//           <button className="btn btn-sm btn-circle absolute right-2 top-2" onClick={onClose}>
//             ✕
//           </button>
//           <h3 className="card-title text-lg font-semibold border-b pb-2 mb-4">
//             {t('crud.advanced_filters')}
//           </h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//             {otherFields.map((field) => (
//               <div key={field.name} className="form-control">
//                 <label className="label">
//                   <span className="label-text font-medium">{field.label}</span>
//                 </label>
//                 {field.type === 'select' ? (
//                   <select
//                     name={field.name}
//                     value={currentFilters[field.name] || ''}
//                     onChange={handleChange}
//                     className="select select-bordered w-full"
//                   >
//                     <option value="">{t('crud.select_option')}</option>
//                     {field.options.map((option) => (
//                       <option key={option.value} value={option.value}>
//                         {option.label}
//                       </option>
//                     ))}
//                   </select>
//                 ) : field.type === 'autocomplete' ? (
//                   <AutocompleteInput
//                     placeholder={field.label}
//                     items={users}
//                     onSelect={(id, name) => handleAutocompleteChange(field.name, id)}
//                   />
//                 ) : (
//                   <input
//                     type={field.type}
//                     name={field.name}
//                     placeholder={field.label}
//                     value={currentFilters[field.name] || ''}
//                     onChange={handleChange}
//                     className="input input-bordered w-full"
//                   />
//                 )}
//               </div>
//             ))}
//           </div>
//           <div className="modal-action">
//             <button className="btn btn-outline" onClick={handleReset}>
//               {t('crud.reset')}
//             </button>
//             <button className="btn btn-primary" onClick={handleApply}>
//               {t('crud.apply')}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdvancedFilterModal;
// src/components/AdvancedFilterModal.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AutocompleteInput from './AutocompleteInput';

/**
 * Composant de modale pour les filtres de recherche avancés.
 *
 * @param {object} props - Les props du composant.
 * @param {boolean} props.isOpen - Indique si la modale est ouverte.
 * @param {function} props.onClose - Fonction pour fermer la modale.
 * @param {function} props.onApply - Fonction de rappel pour appliquer les filtres.
 * @param {function} props.onReset - Fonction de rappel pour réinitialiser les filtres.
 * @param {Array<object>} props.filterFields - Un tableau d'objets décrivant les champs de filtre.
 * @param {object} [props.initialFilters={}] - Les filtres initiaux à charger.
 * @param {object} [props.autocompleteData={}] - Un objet de mapping pour les options d'autocomplétion.
 * * Les clés de autocompleteData doivent correspondre aux noms des champs de type 'autocomplete'
 * dans filterFields (ex: { countryId: [...], creatorId: [...] }).
 */
const AdvancedFilterModal = ({
  isOpen,
  onClose,
  onApply,
  onReset,
  filterFields,
  initialFilters = {},
  autocompleteData = {}, // Reçoit l'objet de mapping pour l'autocomplétion
}) => {
  const { t } = useTranslation();

  // État local des filtres, initialisé avec les props.
  const [currentFilters, setCurrentFilters] = useState(initialFilters);

  // Synchronise l'état local lorsque les filtres initiaux changent.
  useEffect(() => {
    setCurrentFilters(initialFilters);
  }, [initialFilters]);

  // Gère les changements de valeur pour les champs de filtre standards (text, number, date, select).
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value,
    }));
  };
  
  // Gère la sélection dans le champ Autocomplete.
  const handleAutocompleteChange = (name, id) => {
    setCurrentFilters((prev) => ({
      ...prev,
      [name]: id,
    }));
  };

  // Gère l'application des filtres.
  const handleApply = () => {
    onApply(currentFilters);
    onClose();
  };

  // Gère la réinitialisation des filtres.
  const handleReset = () => {
    // Réinitialise l'état local et appelle la fonction de réinitialisation du parent.
    setCurrentFilters({});
    onReset();
    onClose();
  };
  
  // Filtre les champs pour le rendu (en excluant 'search' et 'isActive').
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
                {/* Rendu dynamique basé sur le type de champ */}
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
                    // Utilisation de l'objet autocompleteData pour obtenir la bonne liste
                    items={autocompleteData[field.name] || []}
                    onSelect={(id, name) => handleAutocompleteChange(field.name, id)}
                  />
                ) : field.type === 'checkbox' ? (
                  <label className="cursor-pointer label">
                    {/* <span className="label-text">{field.label}</span> */}
                    <input
                      type="checkbox"
                      name={field.name}
                      checked={currentFilters[field.name] === 'true'}
                      onChange={handleChange}
                      className="checkbox checkbox-primary"
                    />
                  </label>
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