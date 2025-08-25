// // src/pages/CountriesPage.jsx
// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { useTranslation } from 'react-i18next';
// import { SlidersHorizontal } from 'lucide-react'; // Importation de l'icône

// // HOOKS PERSONNALISÉS
// import { useModuleFilters } from '../hooks/useModuleFilters';
// import { useCrudPaginated } from '../hooks/useCrudPaginated';

// // SERVICE API
// import { countriesService } from '../services/countriesService';
// import { usersService } from '../services/usersService';

// // COMPOSANTS RÉUTILISABLES
// import CrudModal from '../components/CrudModal';
// import PageContence from '../components/PageContence';
// import ExportToExcel from '../components/ExportToExcel';
// import AdvancedFilterModal from '../components/AdvancedFilterModal';

// import 'react-toastify/dist/ReactToastify.css';

// export default function CountriesPage() {
//   const { t } = useTranslation();

//   // 1) CONFIGURATION DES CHAMPS DU FORMULAIRE ET DE LA VUE
//   const fields = useMemo(
//     () => [
//       { name: 'name', label: t('crud.name'), type: 'text', required: true },
//       { name: 'code', label: t('crud.code'), type: 'text', required: true },
//     ],
//     [t]
//   );

//   const ViewFields = useMemo(
//     () => [
//       { name: 'name', label: t('crud.name') },
//       { name: 'code', label: t('crud.code') },
//       { name: 'referenceNumber', label: t('crud.reference_number') },
//       {
//         name: 'isActive',
//         label: t('crud.status'),
//         accessor: (item) => (item.isActive ? t('crud.active') : t('crud.inactive')),
//       },
//       { name: 'creator', label: t('crud.creator'), accessor: (item) => item.creator?.username || 'N/A' },
//       { name: 'updator', label: t('crud.updator'), accessor: (item) => item.updator?.username || 'N/A' },
//       { name: 'createdAt', label: t('crud.created_at'), accessor: (item) => new Date(item.createdAt).toLocaleString() },
//       { name: 'updatedAt', label: t('crud.updated_at'), accessor: (item) => new Date(item.updatedAt).toLocaleString() },
//       {
//         name: 'towns',
//         label: `${t('crud.city')}(s)`,
//         accessor: (item) => {
//           if (!item.towns || item.towns.length === 0) return t('crud.no_elements');
//           const names = item.towns.map((town) => town.name).join(', ');
//           return `${item.towns.length} ${t('crud.city')}(s) : ${names}`;
//         },
//       },
//     ],
//     [t]
//   );

//   // 2) HOOK POUR GÉRER L'ÉTAT DES FILTRES DE L'URL
//   const {
//     searchParams,
//     handleSearchChange,
//     handleIsActiveToggle,
//     handleApplyFilters,
//     handleResetFilters,
//     handlePage,
//   } = useModuleFilters('countries');

//   // 3) PRÉPARATION DES PARAMÈTRES POUR LA REQUÊTE API
//   const queryParams = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

//   // 4) LOGIQUE DE GESTION CRUD AVEC PAGINATION ET FILTRES
//   const {
//     items,
//     pagination,
//     isLoading,
//     create,
//     update,
//     softDelete,
//     restore,
//   } = useCrudPaginated(countriesService, 'countries', queryParams);

//   // 5) GESTION DE LA MODALE
//   const [modal, setModal] = useState({ open: false, mode: 'create', item: null, id: null });
//   const [selectedCountryId, setSelectedCountryId] = useState(null);
//   const [modalKey, setModalKey] = useState(0);
//   const [showAdvancedFilterModal, setShowAdvancedFilterModal] = useState(false);

//   // 6) RÉCUPÉRATION DES DONNÉES UTILISATEUR POUR L'AUTOCOMPLÉTION
//   const { data: usersData, isLoading: isUsersLoading } = useQuery({
//     queryKey: ['usersList'],
//     queryFn: () => usersService.getAll(),
//   });
//   const users = usersData?.data?.result?.data?.map(user => ({ id: user.id, name: user.username })) || [];

//   // RÉCUPÉRATION DES DÉTAILS D'UN PAYS POUR LA VUE "VIEW"
//   const { data: countryDetails, isLoading: isLoadingDetails } = useQuery({
//     queryKey: ['country', selectedCountryId],
//     queryFn: () => countriesService.getCountryById(selectedCountryId),
//     enabled: !!selectedCountryId,
//   });

//   // 7) ACTIONS SUR LA MODALE
//   const openModal = useCallback((mode, item = null) => {
//     let initialFormState = {};
//     let itemId = null;

//     if (mode === 'edit' && item) {
//       initialFormState = { name: item.name, code: item.code };
//       itemId = item.id;
//     } else if (mode === 'view' && item) {
//       initialFormState = item;
//       itemId = item.id;
//       setSelectedCountryId(item.id);
//     } else {
//       setSelectedCountryId(null);
//     }

//     setModal({ open: true, mode, item: initialFormState, id: itemId });
//     setModalKey((prev) => prev + 1);
//   }, []);

//   const closeModal = useCallback(() => {
//     setModal({ open: false, mode: 'create', item: null, id: null });
//     setSelectedCountryId(null);
//   }, []);

//   const handleSave = useCallback(
//     (data) => {
//       const payload = { name: data.name, code: data.code };
//       modal.mode === 'create' ? create(payload) : update({ id: modal.id, payload });
//       closeModal();
//     },
//     [modal.mode, modal.id, create, update, closeModal]
//   );

//   const handleRestore = useCallback((item) => restore({ id: item.id }), [restore]);

//   // 8) CONFIGURATION DES CHAMPS AVANCÉS
//   const filterFields = useMemo(
//     () => [
//       { name: 'search', label: t('crud.search'), type: 'text' },
//       { name: 'limit', label: t('crud.limit'), type: 'number' },
//       { name: 'referenceNumber', label: t('crud.reference_number'), type: 'text' },
//       { name: 'name', label: t('crud.name'), type: 'text' },
//       { name: 'code', label: t('crud.code'), type: 'text' },
//       { name: 'createdAtStart', label: t('crud.created_at_start'), type: 'date' },
//       { name: 'createdAtEnd', label: t('crud.created_at_end'), type: 'date' },
//       { name: 'updatedAtStart', label: t('crud.updated_at_start'), type: 'date' },
//       { name: 'updatedAtEnd', label: t('crud.updated_at_end'), type: 'date' },
//       { name: 'creatorId', label: t('crud.creator'), type: 'autocomplete' },
//       { name: 'updatorId', label: t('crud.updator'), type: 'autocomplete' },
//       {
//         name: 'sortBy',
//         label: t('crud.sort_by'),
//         type: 'select',
//         options: [
//           { value: 'referenceNumber', label: t('crud.reference_number') },
//           { value: 'name', label: t('crud.name') },
//           { value: 'code', label: t('crud.code') },
//           { value: 'isActive', label: t('crud.status') },
//           { value: 'createdAt', label: t('crud.created_at') },
//           { value: 'updatedAt', label: t('crud.updated_at') },
//         ],
//       },
//       {
//         name: 'order',
//         label: t('crud.order'),
//         type: 'select',
//         options: [
//           { value: 'asc', label: t('crud.asc') },
//           { value: 'desc', label: t('crud.desc') },
//         ],
//       },
//     ],
//     [t]
//   );

//   // 9) DONNÉES ET EN-TÊTES POUR L'EXPORT EXCEL
//   const excelData = useMemo(
//     () =>
//       items.map((item) => ({
//         referenceNumber: item.referenceNumber,
//         name: item.name,
//         code: item.code,
//         isActive: item.isActive ? t('crud.active') : t('crud.inactive'),
//         creator: item.creator?.username || 'N/A',
//         updator: item.updator?.username || 'N/A',
//         createdAt: new Date(item.createdAt).toLocaleString(),
//         updatedAt: new Date(item.updatedAt).toLocaleString(),
//         towns: item.towns?.map((town) => town.name).join(', ') || t('crud.no_elements'),
//       })),
//     [items, t]
//   );

//   const excelHeaders = useMemo(
//     () => [
//       { label: t('crud.reference_number'), key: 'referenceNumber' },
//       { label: t('crud.name'), key: 'name' },
//       { label: t('crud.code'), key: 'code' },
//       { label: t('crud.status'), key: 'isActive' },
//       { label: t('crud.creator'), key: 'creator' },
//       { label: t('crud.updator'), key: 'updator' },
//       { label: t('crud.created_at'), key: 'createdAt' },
//       { label: t('crud.updated_at'), key: 'updatedAt' },
//       { label: `${t('crud.city')}(s)`, key: 'towns' },
//     ],
//     [t]
//   );

//   const excelFilename = useMemo(() => `countries-${new Date().toISOString().slice(0, 10)}.csv`, []);

//   // 10) SYNCHRONISATION DE L'ÉTAT DÉTAILLÉ POUR LA MODALE
//   useEffect(() => {
//     if (countryDetails && modal.mode === 'view') {
//       const detailed = countryDetails?.data?.result || null;
//       if (detailed) setModal((prev) => ({ ...prev, item: detailed }));
//     }
//   }, [countryDetails, modal.mode]);

//   if (isLoading || isUsersLoading || isLoadingDetails) return <p className="text-center mt-10">{t('loading')}</p>;

//   return (
//     <PageContence>
//       <div className="p-4 max-w-7xl mx-auto">
//         {/* En-tête de la page */}
//         <div className="flex justify-between items-center mb-4">
//           <h1 className="text-2xl font-bold">{t('modul_title.country')}</h1>
//           <button className="btn btn-primary" onClick={() => openModal('create')}>
//             {t('crud.create')}
//           </button>
//         </div>

//         {/* Barre de recherche et de filtres */}
//         <div className="flex gap-4 items-center mb-4">
//           <input
//             placeholder={t('crud.search')}
//             className="input input-bordered"
//             value={searchParams.get('search') || ''}
//             onChange={(e) => handleSearchChange(e.target.value)}
//           />

//           <label className="label cursor-pointer flex gap-2">
//             <span className="label-text">{t('crud.is_active')}</span>
//             <input
//               type="checkbox"
//               className="toggle"
//               checked={searchParams.get('isActive') === 'true'}
//               onChange={handleIsActiveToggle}
//             />
//           </label>

//           {/* Bouton pour ouvrir la modale des filtres avancés */}
//           <button className="btn btn-ghost" onClick={() => setShowAdvancedFilterModal(true)}>
//             <SlidersHorizontal size={24} />
//             {t('crud.advanced_filters')}
//           </button>

//           <ExportToExcel data={excelData} filename={excelFilename} headers={excelHeaders} />
//         </div>

//         {/* Tableau des pays */}
//         <div className="overflow-x-auto">
//           <table className="table w-full">
//             <thead>
//               <tr>
//                 <th>{t('crud.reference_number')}</th>
//                 <th>{t('crud.name')}</th>
//                 <th>{t('crud.code')}</th>
//                 <th>{t('crud.city')}(s)</th>
//                 <th>{t('crud.actions')}</th>
//               </tr>
//             </thead>
//             <tbody>
//               {items.map((c) => (
//                 <tr key={c.id}>
//                   <td>{c.referenceNumber}</td>
//                   <td>{c.name}</td>
//                   <td>{c.code}</td>
//                   <td>{c.towns?.length || 0}</td>
//                   <td className="flex gap-2">
//                     <button className="btn btn-sm" onClick={() => openModal('view', c)}>
//                       {t('crud.view')}
//                     </button>
//                     <button className="btn btn-sm" onClick={() => openModal('edit', c)}>
//                       {t('crud.edit')}
//                     </button>
//                     {c.isActive ? (
//                       <button className="btn btn-sm btn-error" onClick={() => softDelete(c.id)}>
//                         {t('crud.delete')}
//                       </button>
//                     ) : (
//                       <button className="btn btn-sm btn-success" onClick={() => handleRestore(c)}>
//                         {t('crud.restore')}
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {pagination.totalPages > 1 && (
//           <div className="btn-group mt-4">
//             {Array.from({ length: pagination.totalPages }, (_, i) => (
//               <button
//                 key={i + 1}
//                 className={`btn ${Number(pagination.currentPage) === i + 1 ? 'btn-active' : ''}`}
//                 onClick={() => handlePage(String(i + 1))}
//               >
//                 {i + 1}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* Composant de modale CRUD */}
//         <CrudModal
//           key={modalKey}
//           isOpen={modal.open}
//           onClose={closeModal}
//           title={t(`crud.${modal.mode}`)}
//           fields={fields}
//           viewFields={ViewFields}
//           initialData={modal.item}
//           onSubmit={handleSave}
//           mode={modal.mode}
//           isLoading={isLoadingDetails}
//         />

//         {/* Modale des filtres avancés */}
//         <AdvancedFilterModal
//           isOpen={showAdvancedFilterModal}
//           onClose={() => setShowAdvancedFilterModal(false)}
//           onApply={handleApplyFilters}
//           onReset={handleResetFilters}
//           filterFields={filterFields}
//           initialFilters={Object.fromEntries(searchParams.entries())}
//           users={users}
//         />
//       </div>
//     </PageContence>
//   );
// }
// src/pages/CountriesPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';

// HOOKS PERSONNALISÉS
import { useModuleFilters } from '../hooks/useModuleFilters';
import { useCrudPaginated } from '../hooks/useCrudPaginated';

// SERVICE API
import { countriesService } from '../services/countriesService';
import { usersService } from '../services/usersService';

// COMPOSANTS RÉUTILISABLES
import CrudModal from '../components/CrudModal';
import PageContence from '../components/PageContence';
import ExportToExcel from '../components/ExportToExcel';
import AdvancedFilterModal from '../components/AdvancedFilterModal';

import 'react-toastify/dist/ReactToastify.css';

export default function CountriesPage() {
  const { t } = useTranslation();

  // 1) CONFIGURATION DES CHAMPS DU FORMULAIRE ET DE LA VUE
  const fields = useMemo(
    () => [
      { name: 'name', label: t('crud.name'), type: 'text', required: true },
      { name: 'code', label: t('crud.code'), type: 'text', required: true },
    ],
    [t]
  );

  const ViewFields = useMemo(
    () => [
      { name: 'name', label: t('crud.name') },
      { name: 'code', label: t('crud.code') },
      { name: 'referenceNumber', label: t('crud.reference_number') },
      {
        name: 'isActive',
        label: t('crud.status'),
        accessor: (item) => (item.isActive ? t('crud.active') : t('crud.inactive')),
      },
      { name: 'creator', label: t('crud.creator'), accessor: (item) => item.creator?.username || 'N/A' },
      { name: 'updator', label: t('crud.updator'), accessor: (item) => item.updator?.username || 'N/A' },
      { name: 'createdAt', label: t('crud.created_at'), accessor: (item) => new Date(item.createdAt).toLocaleString() },
      { name: 'updatedAt', label: t('crud.updated_at'), accessor: (item) => new Date(item.updatedAt).toLocaleString() },
      {
        name: 'towns',
        label: `${t('crud.city')}(s)`,
        accessor: (item) => {
          if (!item.towns || item.towns.length === 0) return t('crud.no_elements');
          const names = item.towns.map((town) => town.name).join(', ');
          return `${item.towns.length} ${t('crud.city')}(s) : ${names}`;
        },
      },
    ],
    [t]
  );

  // 2) HOOK POUR GÉRER L'ÉTAT DES FILTRES DE L'URL
  const {
    searchParams,
    handleSearchChange,
    handleIsActiveToggle,
    handleApplyFilters,
    handleResetFilters,
    handlePage,
  } = useModuleFilters('countries');

  // 3) PRÉPARATION DES PARAMÈTRES POUR LA REQUÊTE API
  const queryParams = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

  // 4) LOGIQUE DE GESTION CRUD AVEC PAGINATION ET FILTRES
  const {
    items,
    pagination,
    isLoading,
    create,
    update,
    softDelete,
    restore,
  } = useCrudPaginated(countriesService, 'countries', queryParams);

  // 5) GESTION DE LA MODALE
  const [modal, setModal] = useState({ open: false, mode: 'create', item: null, id: null });
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [modalKey, setModalKey] = useState(0);
  const [showAdvancedFilterModal, setShowAdvancedFilterModal] = useState(false);

  // 6) RÉCUPÉRATION DES DONNÉES UTILISATEUR POUR L'AUTOCOMPLÉTION
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['usersList'],
    queryFn: () => usersService.getAll(),
  });
  const users = usersData?.data?.result?.data?.map(user => ({ id: user.id, name: user.username })) || [];

  // RÉCUPÉRATION DES DÉTAILS D'UN PAYS POUR LA VUE "VIEW"
  const { data: countryDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['country', selectedCountryId],
    queryFn: () => countriesService.getCountryById(selectedCountryId),
    enabled: !!selectedCountryId,
  });

  // 7) ACTIONS SUR LA MODALE
  const openModal = useCallback((mode, item = null) => {
    let initialFormState = {};
    let itemId = null;

    if (mode === 'edit' && item) {
      initialFormState = { name: item.name, code: item.code };
      itemId = item.id;
    } else if (mode === 'view' && item) {
      initialFormState = item;
      itemId = item.id;
      setSelectedCountryId(item.id);
    } else {
      setSelectedCountryId(null);
    }

    setModal({ open: true, mode, item: initialFormState, id: itemId });
    setModalKey((prev) => prev + 1);
  }, []);

  const closeModal = useCallback(() => {
    setModal({ open: false, mode: 'create', item: null, id: null });
    setSelectedCountryId(null);
  }, []);

  const handleSave = useCallback(
    (data) => {
      const payload = { name: data.name, code: data.code };
      modal.mode === 'create' ? create(payload) : update({ id: modal.id, payload });
      closeModal();
    },
    [modal.mode, modal.id, create, update, closeModal]
  );

  const handleRestore = useCallback((item) => restore({ id: item.id }), [restore]);

  // 8) CONFIGURATION DES CHAMPS AVANCÉS
  const filterFields = useMemo(
    () => [
      { name: 'search', label: t('crud.search'), type: 'text' },
      { name: 'limit', label: t('crud.limit'), type: 'number' },
      { name: 'referenceNumber', label: t('crud.reference_number'), type: 'text' },
      { name: 'name', label: t('crud.name'), type: 'text' },
      { name: 'code', label: t('crud.code'), type: 'text' },
      { name: 'createdAtStart', label: t('crud.created_at_start'), type: 'date' },
      { name: 'createdAtEnd', label: t('crud.created_at_end'), type: 'date' },
      { name: 'updatedAtStart', label: t('crud.updated_at_start'), type: 'date' },
      { name: 'updatedAtEnd', label: t('crud.updated_at_end'), type: 'date' },
      { name: 'creatorId', label: t('crud.creator'), type: 'autocomplete' },
      { name: 'updatorId', label: t('crud.updator'), type: 'autocomplete' },
      {
        name: 'sortBy',
        label: t('crud.sort_by'),
        type: 'select',
        options: [
          { value: 'referenceNumber', label: t('crud.reference_number') },
          { value: 'name', label: t('crud.name') },
          { value: 'code', label: t('crud.code') },
          { value: 'isActive', label: t('crud.status') },
          { value: 'createdAt', label: t('crud.created_at') },
          { value: 'updatedAt', label: t('crud.updated_at') },
        ],
      },
      {
        name: 'order',
        label: t('crud.order'),
        type: 'select',
        options: [
          { value: 'asc', label: t('crud.asc') },
          { value: 'desc', label: t('crud.desc') },
        ],
      },
    ],
    [t]
  );

  // 9) DONNÉES ET EN-TÊTES POUR L'EXPORT EXCEL
  const excelData = useMemo(
    () =>
      items.map((item) => ({
        referenceNumber: item.referenceNumber,
        name: item.name,
        code: item.code,
        isActive: item.isActive ? t('crud.active') : t('crud.inactive'),
        creator: item.creator?.username || 'N/A',
        updator: item.updator?.username || 'N/A',
        createdAt: new Date(item.createdAt).toLocaleString(),
        updatedAt: new Date(item.updatedAt).toLocaleString(),
        towns: item.towns?.map((town) => town.name).join(', ') || t('crud.no_elements'),
      })),
    [items, t]
  );

  const excelHeaders = useMemo(
    () => [
      { label: t('crud.reference_number'), key: 'referenceNumber' },
      { label: t('crud.name'), key: 'name' },
      { label: t('crud.code'), key: 'code' },
      { label: t('crud.status'), key: 'isActive' },
      { label: t('crud.creator'), key: 'creator' },
      { label: t('crud.updator'), key: 'updator' },
      { label: t('crud.created_at'), key: 'createdAt' },
      { label: t('crud.updated_at'), key: 'updatedAt' },
      { label: `${t('crud.city')}(s)`, key: 'towns' },
    ],
    [t]
  );

  const excelFilename = useMemo(() => `countries-${new Date().toISOString().slice(0, 10)}.csv`, []);

  // 10) SYNCHRONISATION DE L'ÉTAT DÉTAILLÉ POUR LA MODALE
  useEffect(() => {
    if (countryDetails && modal.mode === 'view') {
      const detailed = countryDetails?.data?.result || null;
      if (detailed) setModal((prev) => ({ ...prev, item: detailed }));
    }
  }, [countryDetails, modal.mode]);

  if (isLoading || isUsersLoading || isLoadingDetails) return <p className="text-center mt-10">{t('loading')}</p>;
  console.log(pagination);

  return (
    <PageContence>
      <div className="p-4 max-w-7xl mx-auto">
        {/* En-tête de la page */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{t('modul_title.country')}</h1>
            <span className="text-md text-gray-500">
              ({t('crud.total_items', { count: pagination.totalItems })})
            </span>
          </div>
          <button className="btn btn-primary" onClick={() => openModal('create')}>
            {t('crud.create')}
          </button>
        </div>

        {/* Barre de recherche et de filtres */}
        <div className="flex gap-4 items-center mb-4">
          <input
            placeholder={t('crud.search')}
            className="input input-bordered"
            value={searchParams.get('search') || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
          />

          <label className="label cursor-pointer flex gap-2">
            <span className="label-text">{t('crud.is_active')}</span>
            <input
              type="checkbox"
              className={`toggle ${searchParams.get('isActive') === 'true' ? 'toggle-primary' : ''}`}
              checked={searchParams.get('isActive') === 'true'}
              onChange={handleIsActiveToggle}
            />
          </label>

          {/* Bouton pour ouvrir la modale des filtres avancés */}
          <button className="btn btn-ghost" onClick={() => setShowAdvancedFilterModal(true)}>
            <SlidersHorizontal size={24} />
            {t('crud.advanced_filters')}
          </button>

          <ExportToExcel data={excelData} filename={excelFilename} headers={excelHeaders} />
        </div>

        {/* Tableau des pays */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>{t('crud.reference_number')}</th>
                <th>{t('crud.name')}</th>
                <th>{t('crud.code')}</th>
                <th>{t('crud.city')}(s)</th>
                <th>{t('crud.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.referenceNumber}</td>
                  <td>{c.name}</td>
                  <td>{c.code}</td>
                  <td>{c.towns?.length || 0}</td>
                  <td className="flex gap-2">
                    <button className="btn btn-sm" onClick={() => openModal('view', c)}>
                      {t('crud.view')}
                    </button>
                    <button className="btn btn-sm" onClick={() => openModal('edit', c)}>
                      {t('crud.edit')}
                    </button>
                    {c.isActive ? (
                      <button className="btn btn-sm btn-error" onClick={() => softDelete(c.id)}>
                        {t('crud.delete')}
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-success" onClick={() => handleRestore(c)}>
                        {t('crud.restore')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-4">
            {/* Affichage de la page actuelle et du nombre total de pages */}
            <span className="text-sm">
              {t('crud.page_of_total', { page: pagination.currentPage, total: pagination.totalPages })}
            </span>
            <div className="btn-group">
              {/* Bouton pour la page précédente */}
              <button
                className="btn"
                onClick={() => handlePage(String(pagination.currentPage - 1))}
                disabled={pagination.currentPage <= 1}
              >
                «
              </button>
              {/* Boutons pour les pages */}
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`btn ${Number(pagination.currentPage) === i + 1 ? 'btn-active' : ''}`}
                  onClick={() => handlePage(String(i + 1))}
                >
                  {i + 1}
                </button>
              ))}
              {/* Bouton pour la page suivante */}
              <button
                className="btn"
                onClick={() => handlePage(String(pagination.currentPage + 1))}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                »
              </button>
            </div>
          </div>
        )}

        {/* Composant de modale CRUD */}
        <CrudModal
          key={modalKey}
          isOpen={modal.open}
          onClose={closeModal}
          title={t(`crud.${modal.mode}`)}
          fields={fields}
          viewFields={ViewFields}
          initialData={modal.item}
          onSubmit={handleSave}
          mode={modal.mode}
          isLoading={isLoadingDetails}
        />

        {/* Modale des filtres avancés */}
        <AdvancedFilterModal
          isOpen={showAdvancedFilterModal}
          onClose={() => setShowAdvancedFilterModal(false)}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          filterFields={filterFields}
          initialFilters={Object.fromEntries(searchParams.entries())}
          users={users}
        />
      </div>
    </PageContence>
  );
}