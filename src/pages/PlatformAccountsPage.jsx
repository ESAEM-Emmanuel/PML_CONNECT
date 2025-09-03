// src/pages/PlatformAccountsPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';

// HOOKS PERSONNALISÉS
import { useModuleFilters } from '../hooks/useModuleFilters';
import { useCrudPaginated } from '../hooks/useCrudPaginated';
import { useAuth } from '../context/AuthContext';

// SERVICE API
import { platformAccountsService } from '../services/platformAccountsService';
import { usersService } from '../services/usersService';

// COMPOSANTS RÉUTILISABLES
import CrudModal from '../components/CrudModal';
import PageContence from '../components/PageContence';
import ExportToExcel from '../components/ExportToExcel';
import AdvancedFilterModal from '../components/AdvancedFilterModal';
// import { paymentMethodLabels } from '../utils/paymentMethodLabels.js';

import 'react-toastify/dist/ReactToastify.css';

export default function PlatformAccountsPage() {
  const { t } = useTranslation();
  const { userRole } = useAuth();
  const paymentMethodLabels = {
    WALLETS: 'payment_methods.wallets',
    PAYMENT_CARDS: 'payment_methods.payment_cards',
    CRYPTOMONNAIES: 'payment_methods.cryptomonnaies',
    MOBILE_PAYMENT: 'payment_methods.mobile_payment',
    PAYMENT_PMLCOIN: 'payment_methods.pmlcoin',
  };

  // DÉFINITION DES CHAMPS POUR LA MODALE DE CRÉATION/ÉDITION
  const fields = useMemo(
    () => [
      
      {
        name: 'paymentMethod',
        label: t('crud.payment_method'),
        type: 'select',
        required: true,
        options: [
            { value: 'MOBILE_PAYMENT', label: t('payment_methods.mobile_payment') },
            { value: 'PAYMENT_CARDS', label: t('payment_methods.payment_cards') },
            { value: 'WALLETS', label: t('payment_methods.wallets') },
            { value: 'CRYPTOMONNAIES', label: t('payment_methods.cryptomonnaies') }
        ]
      },
      { name: 'operator', label: t('crud.operator'), type: 'text', required: true },
      { name: 'accountNumber', label: t('crud.account_number'), type: 'text' },
    ],
    [t]
  );

  // DÉFINITION DES CHAMPS POUR LA VUE DÉTAILLÉE
  const ViewFields = useMemo(
    () => [
      // { name: 'paymentMethod', label: t('crud.payment_method') },
      {
        name: 'paymentMethod',
        label: t('crud.payment_method'),
        accessor: (item) => t(paymentMethodLabels[item.paymentMethod] || item.paymentMethod),
      },
      { name: 'operator', label: t('crud.operator') },
      { name: 'accountNumber', label: t('crud.account_number') },
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
    ],
    [t]
  );

  // GESTION DES FILTRES DE L'URL
  const {
    searchParams,
    searchTerm,
    handleSearchChange,
    handleIsActiveToggle,
    handleApplyFilters,
    handleResetFilters,
    handlePage,
    hasAdvancedFilters,
  } = useModuleFilters('countries');

  const queryParams = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

  // LOGIQUE DE GESTION CRUD AVEC PAGINATION ET FILTRES
  const {
    items,
    pagination,
    isLoading,
    isFetching,
    create,
    update,
    softDelete,
    restore,
  } = useCrudPaginated(platformAccountsService, 'platform_accounts', queryParams);

  // GESTION DE LA MODALE
  const [modal, setModal] = useState({ open: false, mode: 'create', item: null, id: null });
  const [selectedItemId, setselectedItemId] = useState(null);
  const [modalKey, setModalKey] = useState(0);
  const [showAdvancedFilterModal, setShowAdvancedFilterModal] = useState(false);

  // RÉCUPÉRATION DES DONNÉES UTILISATEUR POUR L'AUTOCOMPLÉTION
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['usersList'],
    queryFn: () => usersService.getAll({ isActive: true, limit: -1 }),
  });
  const users = usersData?.data?.result?.data?.map(user => ({ id: user.id, name: user.username })) || [];

  // CRÉATION DE L'OBJET DE MAPPING pour AdvancedFilterModal
  const autocompleteData = useMemo(() => ({
    creatorId: users,
    updatorId: users,
  }), [users]);

  // RÉCUPÉRATION DES DÉTAILS D'UN PAYS POUR LA VUE "VIEW"
  const { data: itemDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['country', selectedItemId],
    queryFn: () => platformAccountsService.getById(selectedItemId),
    enabled: !!selectedItemId,
  });

  // ACTIONS SUR LA MODALE
  const openModal = useCallback((mode, item = null) => {
    let initialFormState = {};
    let itemId = null;

    if (mode === 'edit' && item) {
      initialFormState = { paymentMethod: item.paymentMethod, operator: item.operator, accountNumber: item.accountNumber };
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
        async (data) => {
        let mediaUrls = [];
    
        try {

            // --- Construction dynamique du payload ---
            let payload = { paymentMethod: data.paymentMethod };
    
            if (data.operator) {
            payload.operator = data.operator;
            }
    
            if (data.accountNumber) {
            payload.accountNumber = data.accountNumber;
            }
    
            if (modal.mode === "create") {
            create(payload);
            } else {
            // en update → n'envoyer QUE ce qui a changé
            update({ id: modal.id, payload });
            }
    
            closeModal();
        } catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
            toast.error(
            error.response?.data?.message ||
                error.message ||
                t("crud.creation_error")
            );
        }
        },
        [modal, closeModal, create, update, t]
    );
  

  const handleRestore = useCallback((item) => restore({ id: item.id }), [restore]);

  // CONFIGURATION DES CHAMPS AVANCÉS pour AdvancedFilterModal
  const filterFields = useMemo(
    () => [
      { name: 'search', label: t('crud.search'), type: 'text' },
      { name: 'limit', label: t('crud.limit'), type: 'number' },
      { name: 'referenceNumber', label: t('crud.reference_number'), type: 'text' },
      {
        name: 'paymentMethod',
        label: t('crud.payment_method'),
        type: 'select',
        options: [
            { value: 'MOBILE_PAYMENT', label: t('payment_methods.mobile_payment') },
            { value: 'PAYMENT_CARDS', label: t('payment_methods.payment_cards') },
            { value: 'WALLETS', label: t('payment_methods.wallets') },
            { value: 'CRYPTOMONNAIES', label: t('payment_methods.cryptomonnaies') }
        ]
      },
      { name: 'operator', label: t('crud.operator'), type: 'text' },
      { name: 'accountNumber', label: t('crud.account_number'), type: 'text' },
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
          { value: 'paymentMethod', label: t('crud.payment_method') },
          { value: 'operator', label: t('crud.operator') },
          { value: 'accountNumber', label: t('crud.account_number') },
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

  // DONNÉES ET EN-TÊTES POUR L'EXPORT EXCEL
  const excelData = useMemo(
    () =>
      items.map((item) => ({
        referenceNumber: item.referenceNumber,
        paymentMethod: t(paymentMethodLabels[item.paymentMethod] || item.paymentMethod),
        operator: item.operator,
        accountNumber: item.accountNumber,
        isActive: item.isActive ? t('crud.active') : t('crud.inactive'),
        creator: item.creator?.username || 'N/A',
        updator: item.updator?.username || 'N/A',
        createdAt: new Date(item.createdAt).toLocaleString(),
        updatedAt: new Date(item.updatedAt).toLocaleString(),
      })),
    [items, t]
  );

  const excelHeaders = useMemo(
    () => [
      { label: t('crud.reference_number'), key: 'referenceNumber' },
      { label: t('crud.payment_method'), key: 'paymentMethod' },
      { label: t('crud.operator'), key: 'operator' },
      { label: t('crud.account_number'), key: 'accountNumber' },
      { label: t('crud.status'), key: 'isActive' },
      { label: t('crud.creator'), key: 'creator' },
      { label: t('crud.updator'), key: 'updator' },
      { label: t('crud.created_at'), key: 'createdAt' },
      { label: t('crud.updated_at'), key: 'updatedAt' },
    ],
    [t]
  );

  const excelFilename = useMemo(() => `countries-${new Date().toISOString().slice(0, 10)}.csv`, []);

  // SYNCHRONISATION DE L'ÉTAT DÉTAILLÉ POUR LA MODALE
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
            <h1 className="text-2xl font-bold">{t('modul_title.platform_account')}</h1>
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
                <th>{t('crud.payment_method')}</th>
                <th>{t('crud.operator')}</th>
                <th>{t('crud.account_number')}</th>
                <th>{t('crud.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.referenceNumber}</td>
                  <td>{t(paymentMethodLabels[c.paymentMethod] || c.paymentMethod)}</td>
                  <td>{c.operator}</td>
                  <td>{c.accountNumber}</td>
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
          autocompleteData={autocompleteData} // Correct
        />
      </div>
    </PageContence>
  );
}