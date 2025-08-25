// src/pages/CitiesPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';

// HOOKS PERSONNALISÉS
import { useModuleFilters } from '../hooks/useModuleFilters';
import { useCrudPaginated } from '../hooks/useCrudPaginated';
import { useAuth } from '../context/AuthContext';

// SERVICE API
import { townsService } from '../services/townsService';
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
  const { userRole } = useAuth();
   // RÉCUPÉRATION DES PAYS POUR L'AUTOCOMPLÉTION
   // Pays
  const { data: resCountries } = useQuery({
    queryKey: ['countriesList'],
    queryFn: () => countriesService.getAll({ isActive: true, limit: -1 }),
  });
  const countries = useMemo(() => resCountries?.data?.result?.data || [], [resCountries]);
  const countryOptions = useMemo(() => countries.map(country => ({ id: country.id, name: country.name })), [countries]);

  // Utilisateurs
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['usersList'],
    queryFn: () => usersService.getAll({ isActive: true, limit: -1 }),
  });
  const users = usersData?.data?.result?.data?.map(user => ({ id: user.id, name: user.username })) || [];
  const userOptions = useMemo(() => usersData?.data?.result?.data?.map(user => ({ id: user.id, name: user.username })) || [], [usersData]);


  // NOUVEAU: Création de l'objet de mapping pour les options d'autocomplétion
  const autocompleteOptions = useMemo(() => ({
    countryId: countryOptions,
    creatorId: userOptions,
    updatorId: userOptions,
  }), [countryOptions, userOptions]);

  const fields = useMemo(
    () => [
      { name: 'name', label: t('crud.name'), type: 'text', required: true },
      { 
        name: 'countryId', 
        label: t('crud.country'), 
        type: 'autocomplete', 
        required: true,
        autocompleteProps: {
          items: countries,
          onSelect: (id, name) => setSelectedCountry({ id, name }),
        }
      },
    ],
    [countries, t]
  );

  const ViewFields = useMemo(
    () => [
      { name: 'name', label: t('crud.name') },
      { name: 'country', label: t('crud.country'), accessor: (item) => item.country?.name || 'N/A' },
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
        name: 'citizens',
        label: `${t('crud.citizen')}(s)`,
        accessor: (item) => {
          if (!item.citizens || item.citizens.length === 0) return t('crud.no_elements');
          const names = item.citizens.map((citizen) => citizen.username).join(', ');
          return `${item.citizens.length} ${t('crud.citizen')}(s) : ${names}`;
        },
      },
    ],
    [t]
  );

  // 2) HOOK POUR GÉRER L'ÉTAT DES FILTRES DE L'URL
  // On récupère `searchTerm` pour l'utiliser comme valeur de l'input de recherche
  const {
    searchParams,
    searchTerm,
    handleSearchChange,
    handleIsActiveToggle,
    handleApplyFilters,
    handleResetFilters,
    handlePage,
    hasAdvancedFilters,
  } = useModuleFilters('towns');

  // 3) PRÉPARATION DES PARAMÈTRES POUR LA REQUÊTE API
  const queryParams = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

  // 4) LOGIQUE DE GESTION CRUD AVEC PAGINATION ET FILTRES
  const {
    items,
    pagination,
    isLoading,
    isFetching,
    create,
    update,
    softDelete,
    restore,
  } = useCrudPaginated(townsService, 'towns', queryParams);

  // 5) GESTION DE LA MODALE
  const [modal, setModal] = useState({ open: false, mode: 'create', item: null, id: null });
  const [selectedItemId, setselectedItemId] = useState(null);
  const [modalKey, setModalKey] = useState(0);
  const [showAdvancedFilterModal, setShowAdvancedFilterModal] = useState(false);

  

  // RÉCUPÉRATION DES DÉTAILS D'UN PAYS POUR LA VUE "VIEW"
  const { data: itemDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['country', selectedItemId],
    queryFn: () => townsService.getById(selectedItemId),
    enabled: !!selectedItemId,
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
      setselectedItemId(item.id);
    } else {
      setselectedItemId(null);
    }

    setModal({ open: true, mode, item: initialFormState, id: itemId });
    setModalKey((prev) => prev + 1);
  }, []);

  const closeModal = useCallback(() => {
    setModal({ open: false, mode: 'create', item: null, id: null });
    setselectedItemId(null);
  }, []);

  const handleSave = useCallback(
    (data) => {
      const payload = { name: data.name, countryId: data.countryId };
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
      { name: 'countryId', label: t('crud.country'), type: 'autocomplete' },
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
        country: item.country?.name || 'N/A',
        isActive: item.isActive ? t('crud.active') : t('crud.inactive'),
        creator: item.creator?.username || 'N/A',
        updator: item.updator?.username || 'N/A',
        createdAt: new Date(item.createdAt).toLocaleString(),
        updatedAt: new Date(item.updatedAt).toLocaleString(),
        citizens: item.citizens?.map((citizen) => citizen.username).join(', ') || t('crud.no_elements'),
      })),
    [items, t]
  );

  const excelHeaders = useMemo(
    () => [
      { label: t('crud.reference_number'), key: 'referenceNumber' },
      { label: t('crud.name'), key: 'name' },
      { label: t('crud.country'), key: 'country' },
      { label: t('crud.status'), key: 'isActive' },
      { label: t('crud.creator'), key: 'creator' },
      { label: t('crud.updator'), key: 'updator' },
      { label: t('crud.created_at'), key: 'createdAt' },
      { label: t('crud.updated_at'), key: 'updatedAt' },
      { label: `${t('crud.citizen')}(s)`, key: 'citizens' },
    ],
    [t]
  );

  const excelFilename = useMemo(() => `countries-${new Date().toISOString().slice(0, 10)}.csv`, []);

  // 10) SYNCHRONISATION DE L'ÉTAT DÉTAILLÉ POUR LA MODALE
  useEffect(() => {
    if (itemDetails && modal.mode === 'view') {
      const detailed = itemDetails?.data?.result || null;
      if (detailed) setModal((prev) => ({ ...prev, item: detailed }));
    }
  }, [itemDetails, modal.mode]);

  if (isLoading || isUsersLoading || isLoadingDetails) return <p className="text-center mt-10">{t('loading')}</p>;

  return (
    <PageContence>
      <div className="p-4 max-w-7xl mx-auto">
        {/* En-tête de la page */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{t('modul_title.city')}</h1>
            <span className="text-md text-gray-500">
              ({pagination.totalItems})
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
            // UTILISATION DU NOUVEL ÉTAT LOCAL searchTerm pour une saisie fluide
            value={searchTerm}
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
          <button
            className={`btn ${hasAdvancedFilters ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowAdvancedFilterModal(true)}
          >
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
                <th>{t('crud.country')}</th>
                <th>{t('crud.citizen')}(s)</th>
                <th>{t('crud.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.referenceNumber}</td>
                  <td>{c.name}</td>
                  <td>{c.code}</td>
                  <td>{c.citizens?.length || 0}</td>
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
            <span className="text-sm">
              {t('crud.page_of_total', { page: pagination.currentPage, total: pagination.totalPages })}
            </span>
            <div className="btn-group">
              <button
                className="btn"
                onClick={() => handlePage(String(pagination.currentPage - 1))}
                disabled={pagination.currentPage <= 1}
              >
                «
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`btn ${Number(pagination.currentPage) === i + 1 ? 'btn-active' : ''}`}
                  onClick={() => handlePage(String(i + 1))}
                >
                  {i + 1}
                </button>
              ))}
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
            autocompleteData={autocompleteOptions} // On passe l'objet unique
            />
      </div>
    </PageContence>
  );
}