// src/pages/CompaniesPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, MoreVertical, Eye, Edit, Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';

// HOOKS PERSONNALISÉS
import { useModuleFilters } from '../hooks/useModuleFilters';
import { useCrudPaginated } from '../hooks/useCrudPaginated';
import { useAuth } from '../context/AuthContext';

// SERVICE API
import { companiesService } from '../services/companiesService';
import { townsService } from '../services/townsService';
import { countriesService } from '../services/countriesService';
import { usersService } from '../services/usersService';
// import { profilsService } from '../services/profilsService';
import { uploadFilesService } from '../services/uploadFilesService';

// COMPOSANTS RÉUTILISABLES
import CrudModal from '../components/CrudModal';
import PageContence from '../components/PageContence';
import ExportToExcel from '../components/ExportToExcel';
import AdvancedFilterModal from '../components/AdvancedFilterModal';
import { CheckCircle, XCircle } from 'lucide-react';

import 'react-toastify/dist/ReactToastify.css';

export default function CompaniesPage() {
    // 1. Déclarations d'état et de hooks personnalisés
    // L'ordre est crucial : tout ce qui est utilisé par d'autres fonctions doit être déclaré en premier.
    const { t } = useTranslation();
    const { userRole } = useAuth();
    const {
        searchParams,
        searchTerm,
        handleSearchChange,
        handleIsActiveToggle,
        handleApplyFilters,
        handleResetFilters,
        handlePage,
        hasAdvancedFilters,
    } = useModuleFilters('companies');

    const [modal, setModal] = useState({ open: false, mode: 'create', item: null, id: null });
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [modalKey, setModalKey] = useState(0);
    const [showAdvancedFilterModal, setShowAdvancedFilterModal] = useState(false);

    // 2. Récupération des données avec React Query
    const { data: resCountries } = useQuery({ queryKey: ['countriesList'], queryFn: () => countriesService.getAll({ isActive: true, limit: -1 }) });
    const { data: resTowns } = useQuery({
        queryKey: ['citiesList', selectedCountry?.id],
        queryFn: () => townsService.getAll({ countryId: selectedCountry?.id, isActive: true, limit: -1 }),
        enabled: !!selectedCountry?.id,
    });
    const { data: usersData, isLoading: isUsersLoading } = useQuery({ queryKey: ['usersList'], queryFn: () => usersService.getAll({ isActive: true, limit: -1 }) });
    const { data: itemDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['company', selectedItemId],
        queryFn: () => companiesService.getById(selectedItemId),
        enabled: !!selectedItemId,
    });

    // 3. Logique de pagination et CRUD
    const queryParams = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
    const {
        items,
        pagination,
        isLoading,
        create,
        update,
        softDelete,
        restore,
    } = useCrudPaginated(companiesService, 'companies', queryParams);

    // 4. Fonctions et variables mémorisées (useMemo, useCallback)
    const countries = useMemo(() => resCountries?.data?.result?.data || [], [resCountries]);
    const countryOptions = useMemo(() => countries.map(country => ({ id: country.id, name: country.name })), [countries]);
    const towns = resTowns?.data?.result?.data || [];
    const townsOptions = useMemo(() => towns.map(town => ({ id: town.id, name: town.name })), [towns]);
    const userOptions = useMemo(() => usersData?.data?.result?.data?.map(user => ({ id: user.id, name: user.username })) || [], [usersData]);
    const autocompleteOptions = useMemo(() => ({
        countryId: countryOptions,
        townId: townsOptions,
        creatorId: userOptions,
        updatorId: userOptions,
        approvedById: userOptions,
    }), [countryOptions, townsOptions, userOptions]);
    
    // Définition des champs du formulaire
    const fields = useMemo(
        () => [
            { name: 'name', label: t('crud.name'), type: 'text', required: true },
            { name: 'businessSector', label: t('crud.business_sector'), type: 'text', required: true },
            { name: 'countryId', label: t('crud.country'), type: 'autocomplete', required: true, autocompleteProps: { items: countryOptions, onSelect: (id, name) => setSelectedCountry({ id, name }) } },
            { name: 'townId', label: t('crud.city'), type: 'autocomplete', required: true, autocompleteProps: { items: townsOptions, onSelect: (id, name) => setSelectedCity({ id, name }) } },
            { name: 'address', label: t('crud.address'), type: 'text', required: true },
            { name: 'nui', label: t('crud.nui'), type: 'text', required: true },
            { name: 'email', label: t('crud.email'), type: 'email', required: true },
            { name: 'media', label: t('crud.logo'), type: 'file' },
            { name: 'phone', label: t('crud.phone'), type: 'tel', required: true },
            ...(modal.mode === 'create' ? [
                {
                    name: 'password',
                    label: t('crud.password'),
                    type: 'password',
                    required: true,
                },
                {
                    name: 'passwordConfirm',
                    label: t('crud.password_confirm'),
                    type: 'password',
                    required: true,
                    customProps: {
                        validate: (value, formValues) => value === formValues.password || t('errors.password_mismatch')
                    }
                },
            ] : []),
        ],
        [countryOptions, townsOptions, t, modal.mode]
    );

    // Champs pour la vue détaillée
    const ViewFields = useMemo(
        () => [
            { name: 'name', label: t('crud.name') },
            { name: 'businessSector', label: t('crud.business_sector') },
            { name: 'town', label: t('crud.city'), accessor: (item) => item.town?.name || 'N/A' },
            { name: 'referenceNumber', label: t('crud.reference_number') },
            { name: 'address', label: t('crud.address') },
            { name: 'email', label: t('crud.email') },
            { name: 'nui', label: t('crud.nui') },
            { name: 'phone', label: t('crud.phone') },
            { name: 'media', label: t('crud.logo'), accessor: (item) => item.media?.[0] ? <img src={item.media[0]} alt="Logo" className="w-16 h-16 object-contain" /> : 'N/A' },
            { 
                name: 'isActive', 
                label: t('crud.status'), 
                accessor: (item) => (
                    item.isActive ? (
                        <div className="tooltip tooltip-right" data-tip={t('crud.active')}>
                            <CheckCircle size={24} className="text-green-500" />
                        </div>
                    ) : (
                        <div className="tooltip tooltip-right" data-tip={t('crud.inactive')}>
                            <XCircle size={24} className="text-red-500" />
                        </div>
                    )
                ) 
            },
            { 
                name: 'isApproved', 
                label: t('crud.is_approved'), 
                accessor: (item) => (
                    item.isApproved ? (
                        <div className="tooltip tooltip-right" data-tip={t('crud.approved')}>
                            <CheckCircle size={24} className="text-green-500" />
                        </div>
                    ) : (
                        <div className="tooltip tooltip-right" data-tip={t('crud.pending_approval')}>
                            <XCircle size={24} className="text-red-500" />
                        </div>
                    )
                ) 
            },
            { name: 'creator', label: t('crud.creator'), accessor: (item) => item.creator?.username || 'N/A' },
            { name: 'updator', label: t('crud.updator'), accessor: (item) => item.updator?.username || 'N/A' },
            { name: 'validator', label: t('crud.validator'), accessor: (item) => item.validator?.username || 'N/A' },
            { name: 'createdAt', label: t('crud.created_at'), accessor: (item) => new Date(item.createdAt).toLocaleString() },
            { name: 'updatedAt', label: t('crud.updated_at'), accessor: (item) => new Date(item.updatedAt).toLocaleString() },
            { name: 'approvedAt', label: t('crud.approved_at'), accessor: (item) => item.approvedAt ? new Date(item.approvedAt).toLocaleString() : 'N/A' },
            { name: 'employees', label: `${t('crud.employee')}(s)`, accessor: (item) => `(${item.employees?.length ?? 0}) ${item.employees?.map((employee) => employee.username).join(', ')}` || t('crud.no_elements') },
        ],
        [t]
    );

    // Fonction pour ouvrir la modale
    const openModal = useCallback((mode, item = null) => {
        let initialFormState = {};
        let itemId = null;
        if (mode === 'edit' && item) {
            initialFormState = {
                name: item.name,
                businessSector: item.businessSector,
                countryId: item.town?.countryId,
                townId: item.townId,
                address: item.address,
                email: item.email,
                phone: item.phone,
                nui: item.nui,
                media: item.media,
            };
            setSelectedCountry({ id: item.town?.countryId });
            setSelectedCity({ id: item.townId });
            itemId = item.id;
        } else if (mode === 'view' && item) {
            initialFormState = item;
            itemId = item.id;
            setSelectedItemId(item.id);
        } else {
            setSelectedItemId(null);
        }
        setModal({ open: true, mode, item: initialFormState, id: itemId });
        setModalKey((prev) => prev + 1);
    }, []);

    // Fonction pour fermer la modale
    const closeModal = useCallback(() => {
        setModal({ open: false, mode: 'create', item: null, id: null });
        setSelectedItemId(null);
    }, []);

    // Fonction de sauvegarde (Création/Mise à jour)

    const handleSave = useCallback(
        async (data) => {
            let mediaUrls = [];
            
            try {
                // Gestion améliorée des médias
                if (data.media) {
                    if (data.media instanceof File) {
                        const formData = new FormData();
                        formData.append('files', data.media);
                        const uploadResponse = await uploadFilesService.createFiles(formData);
                        
                        if (uploadResponse.data.success && uploadResponse.data.result.length > 0) {
                            mediaUrls = uploadResponse.data.result.map(file => file.url);
                        } else {
                            throw new Error(t('errors.upload_failed'));
                        }
                    } else if (Array.isArray(data.media)) {
                        // Vérifier si c'est un tableau d'URLs ou de Files
                        const hasFiles = data.media.some(item => item instanceof File);
                        if (hasFiles) {
                            // Upload des fichiers
                            const formData = new FormData();
                            data.media.forEach(file => formData.append('files', file));
                            const uploadResponse = await uploadFilesService.createFiles(formData);
                            
                            if (uploadResponse.data.success) {
                                mediaUrls = uploadResponse.data.result.map(file => file.url);
                            } else {
                                throw new Error(t('errors.upload_failed'));
                            }
                        } else {
                            // Utiliser directement comme URLs
                            mediaUrls = data.media;
                        }
                    }
                }
    
                const mediaPayload = mediaUrls;
    
                if (modal.mode === 'create') {
                    const companyPayload = {
                        name: data.name,
                        businessSector: data.businessSector,
                        townId: data.townId,
                        address: data.address,
                        email: data.email,
                        nui: data.nui,
                        phone: data.phone,
                        media: mediaPayload,
                    };
                    
                    // const newCompany = await companiesService.create(companyPayload);
                    const newCompany = await create(companyPayload);
                    const companyId = newCompany.data?.result?.id;
                    
                    if (!companyId) {
                        throw new Error('Company creation failed. No ID returned.');
                    }
    
                    const userPayload = {
                        username: data.email,
                        lastName: data.name,
                        email: data.email,
                        phone: data.phone,
                        photo: mediaPayload[0] || '',
                        townId: data.townId,
                        password: data.password,
                        companyId: companyId,
                        rank: 'ADMIN',
                        businessSector: data.businessSector,
                        function: t('crud.administrator'),
                        isActive: true,
                    };
                    
                    await usersService.create(userPayload);
                    toast.success(t('crud.creation_success'));
                } else {
                    const updatePayload = {
                        name: data.name,
                        businessSector: data.businessSector,
                        townId: data.townId,
                        address: data.address,
                        nui: data.nui,
                        email: data.email,
                        phone: data.phone,
                        media: mediaPayload,
                    };
                    
                    await update({ id: modal.id, payload: updatePayload });
                    toast.success(t('crud.update_success'));
                }
                
                closeModal();
            } catch (error) {
                console.error("Erreur lors de la sauvegarde :", error);
                toast.error(error.response?.data?.message || error.message || t('crud.creation_error'));
            }
        },
        [modal.mode, modal.id, t, closeModal, update, create, uploadFilesService.createFiles]
    );

    const handleRestore = useCallback((item) => restore({ id: item.id }), [restore]);
    const handelApproder = useCallback((item) => update({ id: item.id, payload: {"isApproved": true} }), [update]);

    // Configuration des champs pour les filtres avancés
    const filterFields = useMemo(
        () => [
            { name: 'search', label: t('crud.search'), type: 'text' },
            { name: 'limit', label: t('crud.limit'), type: 'number' },
            { name: 'referenceNumber', label: t('crud.reference_number'), type: 'text' },
            { name: 'name', label: t('crud.name'), type: 'text' },
            { name: 'businessSector', label: t('crud.business_sector'), type: 'text' },
            { name: 'address', label: t('crud.address'), type: 'text' },
            { name: 'email', label: t('crud.email'), type: 'email' },
            { name: 'phone', label: t('crud.phone'), type: 'text' },
            { name: 'nui', label: t('crud.nui'), type: 'text' },
            { name: 'townId', label: t('crud.city'), type: 'autocomplete', autocompleteProps: { items: townsOptions } },
            { name: 'isApproved', label: t('crud.abrobation'), type: 'bool' },
            { name: 'createdAtStart', label: t('crud.created_at_start'), type: 'date' },
            { name: 'createdAtEnd', label: t('crud.created_at_end'), type: 'date' },
            { name: 'updatedAtStart', label: t('crud.updated_at_start'), type: 'date' },
            { name: 'updatedAtEnd', label: t('crud.updated_at_end'), type: 'date' },
            { name: 'approvedAtStart', label: t('crud.validate_at_start'), type: 'date' },
            { name: 'approvedAtEnd', label: t('crud.validate_at_end'), type: 'date' },
            { name: 'creatorId', label: t('crud.creator'), type: 'autocomplete', autocompleteProps: { items: userOptions } },
            { name: 'updatorId', label: t('crud.updator'), type: 'autocomplete', autocompleteProps: { items: userOptions } },
            { name: 'approvedById', label: t('crud.validator'), type: 'autocomplete', autocompleteProps: { items: userOptions } },
            {
                name: 'sortBy',
                label: t('crud.sort_by'),
                type: 'select',
                options: [
                    { value: 'referenceNumber', label: t('crud.reference_number') },
                    { value: 'name', label: t('crud.name') },
                    { value: 'businessSector', label: t('crud.business_sector') },
                    { value: 'address', label: t('crud.address') },
                    { value: 'email', label: t('crud.email') },
                    { value: 'phone', label: t('crud.phone') },
                    { value: 'nui', label: t('crud.nui') },
                    { value: 'isApproved', label: t('crud.is_approved') },
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
        [t, townsOptions, userOptions]
    );

    // Données et en-têtes pour l'export Excel
    const excelData = useMemo(() => items.map((item) => ({
        referenceNumber: item.referenceNumber,
        name: item.name,
        town: item.town?.name || 'N/A',
        email: item.email,
        nui: item.nui,
        phone: item.phone,
        address: item.address,
        isApproved: item.isApproved ? t('1') : t('0'),
        isActive: item.isActive ? t('1') : t('0'),
        creator: item.creator?.username || 'N/A',
        updator: item.updator?.username || 'N/A',
        validator: item.validator?.username || 'N/A',
        createdAt: new Date(item.createdAt).toLocaleString(),
        updatedAt: new Date(item.updatedAt).toLocaleString(),
        approvedAt: item.approvedAt ? new Date(item.approvedAt).toLocaleString() : 'N/A',
        employees: item.employees?.map((employee) => employee.username).join(', ') || t('crud.no_elements'),
    })), [items, t]);

    const excelHeaders = useMemo(() => [
        { label: t('crud.reference_number'), key: 'referenceNumber' },
        { label: t('crud.name'), key: 'name' },
        { label: t('crud.city'), key: 'town' },
        { label: t('crud.email'), key: 'email' },
        { label: t('crud.nui'), key: 'nui' },
        { label: t('crud.phone'), key: 'phone' },
        { label: t('crud.address'), key: 'address' },
        { label: t('crud.is_approved'), key: 'isApproved' },
        { label: t('crud.status'), key: 'isActive' },
        { label: t('crud.creator'), key: 'creator' },
        { label: t('crud.updator'), key: 'updator' },
        { label: t('crud.validator'), key: 'validator' },
        { label: t('crud.created_at'), key: 'createdAt' },
        { label: t('crud.updated_at'), key: 'updatedAt' },
        { label: t('crud.approved_at'), key: 'approvedAt' },
        { label: `${t('crud.employee')}(s)`, key: 'employees' },
    ], [t]);

    const excelFilename = useMemo(() => `companies-${new Date().toISOString().slice(0, 10)}.csv`, []);

    useEffect(() => {
        if (itemDetails && modal.mode === 'view') {
            const detailed = itemDetails?.data?.result || null;
            if (detailed) setModal((prev) => ({ ...prev, item: detailed }));
        }
    }, [itemDetails, modal.mode]);

    if (isLoading || isUsersLoading) {
        return <p className="text-center mt-10">{t('loading')}</p>;
    }

    // 5. Rendu du composant
    return (
        <PageContence>
            <div className="p-4 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{t('modul_title.company')}</h1>
                        <span className="text-md text-gray-500">
                            ({pagination.totalItems})
                        </span>
                    </div>
                    <button className="btn btn-primary" onClick={() => openModal('create')}>
                        {t('crud.create')}
                    </button>
                </div>
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
                    <button
                        className={`btn ${hasAdvancedFilters ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setShowAdvancedFilterModal(true)}
                    >
                        <SlidersHorizontal size={24} />
                        {t('crud.advanced_filters')}
                    </button>
                    <ExportToExcel data={excelData} filename={excelFilename} headers={excelHeaders} />
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>{t('crud.reference_number')}</th>
                                <th>{t('crud.name')}</th>
                                <th>{t('crud.business_sector')}</th>
                                <th>{t('crud.phone')}</th>
                                <th>{t('crud.address')}</th>
                                <th>{t('crud.employee')}</th>
                                <th>{t('crud.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((c) => (
                                // <tr key={c.id} className="hover">
                                <tr key={c.id} className={`hover ${c.isApproved ? '' : 'bg-secondary'}`}>
                                    <td className="w-24 font-mono text-sm">{c.referenceNumber}</td>
                                    <td className="max-w-xs truncate" title={c.name}>
                                        <span className="font-medium">{c.name}</span>
                                    </td>
                                    <td className="max-w-xs truncate" title={c.businessSector}>
                                        {c.businessSector}
                                    </td>
                                    <td className="w-32 font-mono text-sm">{c.phone}</td>
                                    <td className="max-w-xs truncate" title={c.address}>
                                        {c.address}
                                    </td>
                                    <td className="w-20 text-center">
                                            {c.employees?.length || 0}
                                    </td>
                                    <td className="w-16">
                                        <div className="dropdown dropdown-left">
                                            <button className="btn btn-xs btn-ghost" tabIndex={0}>
                                                <MoreVertical size={16} />
                                            </button>
                                            <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
                                                <li>
                                                    <button onClick={() => openModal('view', c)} className="text-sm">
                                                        <Eye size={14} /> {t('crud.view')}
                                                    </button>
                                                </li>
                                                <li>
                                                    <button onClick={() => openModal('edit', c)} className="text-sm">
                                                        <Edit size={14} /> {t('crud.edit')}
                                                    </button>
                                                </li>
                                                <li>
                                                    <button onClick={() => handelApproder(c)} className="text-sm">
                                                        <CheckCircle size={14} /> {t('crud.approved')}
                                                    </button>
                                                </li>
                                                <li>
                                                    {c.isActive ? (
                                                        <button onClick={() => softDelete(c.id)} className="text-sm text-error">
                                                            <Trash2 size={14} /> {t('crud.delete')}
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleRestore(c)} className="text-sm text-success">
                                                            <RotateCcw size={14} /> {t('crud.restore')}
                                                        </button>
                                                    )}
                                                </li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <span className="text-sm">
                            {t('crud.page_of_total', { page: pagination.currentPage, total: pagination.totalPages })}
                        </span>
                        <div className="btn-group">
                            <button className="btn" onClick={() => handlePage(String(pagination.currentPage - 1))} disabled={pagination.currentPage <= 1}>
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
                            <button className="btn" onClick={() => handlePage(String(pagination.currentPage + 1))} disabled={pagination.currentPage >= pagination.totalPages}>
                                »
                            </button>
                        </div>
                    </div>
                )}
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
                <AdvancedFilterModal
                    isOpen={showAdvancedFilterModal}
                    onClose={() => setShowAdvancedFilterModal(false)}
                    onApply={handleApplyFilters}
                    onReset={handleResetFilters}
                    filterFields={filterFields}
                    initialFilters={Object.fromEntries(searchParams.entries())}
                    autocompleteData={autocompleteOptions}
                />
            </div>
        </PageContence>
    );
}