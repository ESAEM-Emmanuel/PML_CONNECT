// src/pages/UsersPage.jsx
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
import { usersService } from '../services/usersService';
import { profilsService } from '../services/profilsService';
import { companiesService } from '../services/companiesService';
import { townsService } from '../services/townsService';
import { countriesService } from '../services/countriesService';
import { uploadFilesService } from '../services/uploadFilesService';

// COMPOSANTS RÉUTILISABLES
import CrudModal from '../components/CrudModal';
import PageContence from '../components/PageContence';
import ExportToExcel from '../components/ExportToExcel';
import AdvancedFilterModal from '../components/AdvancedFilterModal';
import { CheckCircle, XCircle } from 'lucide-react';

import 'react-toastify/dist/ReactToastify.css';

export default function UsersPage() {
    // 1. Déclarations d'état et de hooks personnalisés
    // L'ordre est crucial : tout ce qui est utilisé par d'autres fonctions doit être déclaré en premier.
    const { t } = useTranslation();
    const RankListLabels = {
        GENERAL_MANAGER: 'crud.general_manager',
        HUMAN_RESOURCES_MANAGER: 'crud.human_resources_manager',
        IT_MANAGER: 'crud.it_manager',
        OPERATIONS_MANAGER: 'crud.operations_manager',
        ADMIN: 'crud.admin',
        COLLABORATOR: 'crud.collaborator',
    };
    const categoryProfileLabels = {
        CLASSIC: 'crud.classic',
        PREMIUM: 'crud.premium',
        GOLD: 'crud.gold',
        PRIVATE_CLUB: 'crud.private_club',
    };
    const GenderLabels = {
        MALE: 'crud.male',
        FEMAL: 'crud.female',
    };
    const { user } = useAuth();
    const isAdmin = user && (user.isAdmin);
    const isAdminOrStaff = user && (user.isAdmin || user.isStaff);
    const isCompanyAdmin = user && (user?.rank === "ADMIN");
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
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [modalKey, setModalKey] = useState(0);
    const [showAdvancedFilterModal, setShowAdvancedFilterModal] = useState(false);

    // 2. Récupération des données avec React Query
    const { data: resCompanies } = useQuery({ queryKey: ['companiesList'], queryFn: () => companiesService.getAll({ isActive: true, limit: -1 }) });
    const { data: resCountries } = useQuery({ queryKey: ['countriesList'], queryFn: () => countriesService.getAll({ isActive: true, limit: -1 }) });
    const { data: resTowns } = useQuery({
        queryKey: ['citiesList', selectedCountry?.id],
        queryFn: () => townsService.getAll({ countryId: selectedCountry?.id, isActive: true, limit: -1 }),
        enabled: !!selectedCountry?.id,
    });
    const { data: usersData, isLoading: isUsersLoading } = useQuery({ queryKey: ['usersList'], queryFn: () => usersService.getAll({ isActive: true, limit: -1 }) });
    const { data: itemDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['company', selectedItemId],
        queryFn: () => usersService.getById(selectedItemId),
        enabled: !!selectedItemId,
    });

    // 3. Logique de pagination et CRUD
    const queryParams = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
    const {
        items,
        pagination,
        isLoading,
        create ,
        update,
        softDelete,
        restore,
    } = useCrudPaginated(usersService, 'users', queryParams);

    // 4. Fonctions et variables mémorisées (useMemo, useCallback)
    const companies = useMemo(() => resCompanies?.data?.result?.data || [], [resCompanies]);
    const companyOptions = useMemo(() => companies.map(company => ({ id: company.id, name: company.name })), [companies]);
    const countries = useMemo(() => resCountries?.data?.result?.data || [], [resCountries]);
    const countryOptions = useMemo(() => countries.map(country => ({ id: country.id, name: country.name })), [countries]);
    const towns = resTowns?.data?.result?.data || [];
    const townsOptions = useMemo(() => towns.map(town => ({ id: town.id, name: town.name })), [towns]);
    const userOptions = useMemo(() => usersData?.data?.result?.data?.map(user => ({ id: user.id, name: user.username })) || [], [usersData]);
    const autocompleteOptions = useMemo(() => ({
        companyId: companyOptions,
        countryId: countryOptions,
        townId: townsOptions,
        creatorId: userOptions,
        updatorId: userOptions,
        approvedById: userOptions,
    }), [companyOptions,countryOptions, townsOptions, userOptions]);
    
    // Définition des champs du formulaire
    const categoryOptions = [
        { value: 'CLASSIC', label: t('crud.classic') },
        { value: 'PREMIUM', label: t('crud.premium') },
        { value: 'GOLD', label: t('crud.gold') },
      ];
      
      // Si admin/staff → ajoute PRIVATE_CLUB
      if (isAdminOrStaff) {
        categoryOptions.push({ value: 'PRIVATE_CLUB', label: t('crud.private_club') });
      }
    const fields = useMemo(
        () => [
            { name: 'username', label: t('crud.username'), type: 'text', required: true },
            { name: 'lastName', label: t('crud.last_name'), type: 'text', required: true },
            { name: 'firstName', label: t('crud.first_name'), type: 'text' },
            { name: 'email', label: t('crud.email'), type: 'email', required: true },
            { name: 'phone', label: t('crud.phone'), type: 'tel', required: true },
            {
                name: 'gender',
                label: t('auth.gender'),
                type: 'select',
                options: [
                    { value: 'MALE', label: t('gender.male') },
                    { value: 'FEMALE', label: t('gender.female') }
                ]
            },
            { name: 'countryId', label: t('crud.country'), type: 'autocomplete', required: true, autocompleteProps: { items: countryOptions, onSelect: (id, name) => setSelectedCountry({ id, name }) } },
            { name: 'townId', label: t('crud.city'), type: 'autocomplete', required: true, autocompleteProps: { items: townsOptions, onSelect: (id, name) => setSelectedCity({ id, name }) } },
            {
                name: 'rank',
                label: t('crud.rank'),
                type: 'select',
                options: [
                    { value: 'GENERAL_MANAGER', label: t('crud.general_manager') },
                    { value: 'HUMAN_RESOURCES_MANAGER', label: t('crud.human_resources_manager') },
                    { value: 'IT_MANAGER', label: t('crud.it_manager') },
                    { value: 'ADMIN', label: t('crud.admin') },
                    { value: 'COLLABORATOR', label: t('crud.collaborator') }
                ]
            },
            {
                name: 'category',
                label: t('crud.category_profil'),
                type: 'select',
                options: categoryOptions,
            },
            
            ...(isCompanyAdmin ? [
                { name: 'companyId', label: t('crud.company'), type: 'autocomplete', value: user?.companyId },
                { name: 'businessSector', label: t('crud.business_sector'), type: 'text', value: user?.businessSector },
            ] : []),
            
            ...(isAdminOrStaff ? [
                { name: 'companyId', label: t('crud.company'), type: 'autocomplete', autocompleteProps: { items: companyOptions, onSelect: (id, name) => setSelectedCompany({ id, name }) } },
                { name: 'businessSector', label: t('crud.business_sector'), type: 'text' },
            ] : []),
    
            ...(isAdmin ? [
                { name: 'isStaff', label: t('crud.is_staff'), type: 'checkbox' },
                { name: 'isAdmin', label: t('crud.is_admin'), type: 'checkbox' }
            ] : []),
            
            { name: 'function', label: t('crud.function'), type: 'text' },
            { name: 'photo', label: t('crud.picture'), type: 'file' },
            
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
                }
            ] : []),
            ...(modal.mode === 'edit' ? [
                {
                    name: 'oldPassword',
                    label: t('crud.old_password'),
                    type: 'password',
                    required: true,
                },
                {
                    name: 'newPassword',
                    label: t('crud.new_password'),
                    type: 'password',
                    required: true,
                },
                {
                    name: 'confirmNewPassword',
                    label: t('crud.confirm_new_password'),
                    type: 'password',
                    required: true,
                    customProps: {
                        validate: (value, formValues) => value === formValues.password || t('errors.password_mismatch')
                    }
                },
            ] : []),
        ],
        [companyOptions, countryOptions, townsOptions, t, modal.mode, isAdmin, isAdminOrStaff, isCompanyAdmin, user]
    );

    // Champs pour la vue détaillée
    const ViewFields = useMemo(
        () => [
            { name: 'username', label: t('crud.username') },
            { name: 'lastName', label: t('crud.last_name') },
            { name: 'firstName', label: t('crud.first_name') },
            { name: 'email', label: t('crud.email') },
            { name: 'phone', label: t('crud.phone') },
            {
                name: 'gender',
                label: t('crud.gender'),
                accessor: (item) => t(GenderLabels[item.gender] || item.gender)|| 'N/A',
            },
            { name: 'businessSector', label: t('crud.business_sector') },
            { name: 'function', label: t('crud.function') },
            { name: 'town', label: t('crud.city'), accessor: (item) => item.town?.name || 'N/A' },
            {
                name: 'rank',
                label: t('crud.rank'),
                accessor: (item) => t(RankListLabels[item.rank] || item.rank),
            },
            {
                name: 'category',
                label: t('crud.category'),
                accessor: (item) => t(categoryProfileLabels[item.category] || item.category),
            },
            { name: 'photo', label: t('crud.picture'), accessor: (item) => item?.photo? <img src={item.photo} alt="Image" className="w-16 h-16 object-contain" /> : 'N/A' },
            { 
                name: 'isStaff', 
                label: t('crud.is_staff'), 
                accessor: (item) => (
                    item.isStaff ? (
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
                name: 'isAdmin', 
                label: t('crud.is_admin'), 
                accessor: (item) => (
                    item.isAdmin ? (
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
                    item?.isApproved ? (
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
        ],
        [t]
    );

    // Fonction pour ouvrir la modale
    const openModal = useCallback((mode, item = null) => {
        let initialFormState = {};
        let itemId = null;
        if (mode === 'edit' && item) {
            initialFormState = {
                username: item.username,
                lastName: item.lastName,
                email: item.email,
                phone: item.phone,
                townId: item.townId,
                firstName: item.firstName,
                gender: item.gender,
                isStaff: item.isStaff,
                isAdmin: item.isAdmin,
                rank: item.rank,
                businessSector: item.businessSector,
                companyId: item.companyId,
                function: item.function,
                countryId: item.town?.countryId,
                category: item.category,
                isActive: item.isActive,
                photo: item.photo,
            };
            setSelectedCompany({ id: item.town?.companyId });
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
            // Un tableau pour stocker les URLs des fichiers après l'upload.
            let mediaUrls = [];
            
            try {
                // --- Étape 1 : Gestion de l'upload des fichiers si une photo est présente.
                if (data.photo) {
                    // Si la photo est un seul fichier (nouvel upload).
                    if (data.photo instanceof File) {
                        const formData = new FormData();
                        formData.append('files', data.photo);
                        
                        // Appelle le service d'upload pour créer un nouveau fichier.
                        const uploadResponse = await uploadFilesService.createFiles(formData);
                        
                        if (uploadResponse.data.success && uploadResponse.data.result.length > 0) {
                            // Récupère l'URL du fichier depuis la réponse et la stocke.
                            mediaUrls = uploadResponse.data.result.map(file => file.url);
                        } else {
                            throw new Error(t('errors.upload_failed'));
                        }
                    } 
                    // Si la photo est un tableau de fichiers ou d'URLs (mise à jour).
                    else if (Array.isArray(data.photo)) {
                        // Vérifie si le tableau contient au moins un objet File (un fichier à uploader).
                        const hasFiles = data.photo.some(item => item instanceof File);
                        
                        if (hasFiles) {
                            // S'il y a des fichiers, prépare le `FormData` et les uploade.
                            const formData = new FormData();
                            data.photo.forEach(file => {
                                if (file instanceof File) {
                                    formData.append('files', file);
                                }
                            });
                            
                            const uploadResponse = await uploadFilesService.createFiles(formData);
                            
                            if (uploadResponse.data.success) {
                                // Récupère les nouvelles URLs.
                                const newMediaUrls = uploadResponse.data.result.map(file => file.url);
                                // Combine les nouvelles URLs avec les anciennes qui n'ont pas été modifiées.
                                const existingUrls = data.photo.filter(item => typeof item === 'string');
                                mediaUrls = [...existingUrls, ...newMediaUrls];
                            } else {
                                throw new Error(t('errors.upload_failed'));
                            }
                        } else {
                            // S'il n'y a pas de nouveaux fichiers, utilise simplement les URLs existantes.
                            mediaUrls = data.photo;
                        }
                    } else if (typeof data.photo === 'string') {
                         // Si la photo est déjà une URL (pas de nouvel upload).
                        mediaUrls = [data.photo];
                    }
                }
    
                // --- Étape 2 : Préparation du payload final pour la sauvegarde.
                let payload = {
                    username: data.username,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone,
                    townId: data.townId,
                };
    
                // Ajoute les champs optionnels au payload uniquement s'ils existent.
                if (data.firstName) payload.firstName = data.firstName;
                if (data.password) payload.password = data.password;
                if (data.gender) payload.gender = data.gender;
                if (data.isStaff !== undefined) payload.isStaff = data.isStaff;
                if (data.isAdmin !== undefined) payload.isAdmin = data.isAdmin;
                if (data.rank) payload.rank = data.rank;
                if (data.businessSector) payload.businessSector = data.businessSector;
                if (data.function) payload.function = data.function;
                if (data.companyId) payload.companyId = data.companyId;
                if (data.category) payload.category = data.category;
                if (data.isActive !== undefined) payload.isActive = data.isActive;
    
                // Ajoute les URLs de la photo au payload final.
                if (mediaUrls.length > 0) {
                    payload.photo = mediaUrls[0];
                } else {
                    // Gère le cas où aucune photo n'est fournie (pour le clear).
                    payload.photo = null;
                }
    
                // --- Étape 3 : Appel de la fonction de création ou de mise à jour.
                if (modal.mode === "create") {
                    await create(payload);
                    toast.success(t('crud.creation_success'));
                } else {
                    await update({ id: modal.id, payload });
                    toast.success(t('crud.update_success'));
                }
    
                // Ferme la modale une fois l'opération terminée avec succès.
                closeModal();
    
            } catch (error) {
                // Gère les erreurs lors de l'upload ou de la sauvegarde.
                console.error('Erreur lors de la sauvegarde :', error);
                toast.error(error.response?.data?.message || error.message || t('crud.creation_error'));
            }
        },
        // Dépendances de `useCallback` pour s'assurer que la fonction est toujours à jour.
        [modal.mode, modal.id, t, closeModal, create, update]
    );

    const handleRestore = useCallback((item) => restore({ id: item.id }), [restore]);
    const handelApproder = useCallback((item) => update({ id: item.id, payload: {"isApproved": true} }), [update]);

    const filterFields = useMemo(
        () => [
            { name: 'search', label: t('crud.search'), type: 'text' },
            { name: 'limit', label: t('crud.limit'), type: 'number' },
            { name: 'referenceNumber', label: t('crud.reference_number'), type: 'text' },
            { name: 'username', label: t('crud.username'), type: 'text' },
            { name: 'lastName', label: t('crud.last_name'), type: 'text' },
            { name: 'firstName', label: t('crud.first_name'), type: 'text' },
            { name: 'email', label: t('crud.email'), type: 'email' },
            { name: 'phone', label: t('crud.phone'), type: 'text' },
            {
                name: 'gender',
                label: t('auth.gender'),
                type: 'select',
                options: [
                    { value: 'MALE', label: t('gender.male') },
                    { value: 'FEMALE', label: t('gender.female') }
                ]
            },
            { name: 'countryId', label: t('crud.country'), type: 'autocomplete', required: true, autocompleteProps: { items: countryOptions, onSelect: (id, name) => setSelectedCountry({ id, name }) } },
            { name: 'townId', label: t('crud.city'), type: 'autocomplete', required: true, autocompleteProps: { items: townsOptions, onSelect: (id, name) => setSelectedCity({ id, name }) } },
            {
                name: 'rank',
                label: t('crud.rank'),
                type: 'select',
                options: [
                    { value: 'GENERAL_MANAGER', label: t('crud.general_manager') },
                    { value: 'HUMAN_RESOURCES_MANAGER', label: t('crud.human_resources_manager') },
                    { value: 'IT_MANAGER', label: t('crud.it_manager') },
                    { value: 'ADMIN', label: t('crud.admin') },
                    { value: 'COLLABORATOR', label: t('crud.collaborator') }
                ]
            },
            
            ...(isCompanyAdmin ? [
                { name: 'companyId', label: t('crud.company'), type: 'autocomplete', value: user?.companyId },
                { name: 'businessSector', label: t('crud.business_sector'), type: 'text', value: user?.businessSector },
            ] : []),
            
            ...(isAdminOrStaff ? [
                { name: 'companyId', label: t('crud.company'), type: 'autocomplete', autocompleteProps: { items: companyOptions, onSelect: (id, name) => setSelectedCompany({ id, name }) } },
                { name: 'businessSector', label: t('crud.business_sector'), type: 'text' },
                
            ] : []),
            {
                name: 'category',
                label: t('crud.category_profil'),
                type: 'select',
                options: categoryOptions,
            },
    
            ...(isAdmin ? [
                { name: 'isStaff', label: t('crud.is_staff'), type: 'checkbox' },
                { name: 'isAdmin', label: t('crud.is_admin'), type: 'checkbox' }
            ] : []),
            { name: 'function', label: t('crud.function'), type: 'text' },
            { name: 'isApproved', label: t('crud.abrobation'), type: 'bool' },
            { name: 'createdAtStart', label: t('crud.created_at_start'), type: 'date' },
            { name: 'createdAtEnd', label: t('crud.created_at_end'), type: 'date' },
            { name: 'updatedAtStart', label: t('crud.updated_at_start'), type: 'date' },
            { name: 'updatedAtEnd', label: t('crud.updated_at_end'), type: 'date' },
            { name: 'approvedAtStart', label: t('crud.approved_at_start'), type: 'date' },
            { name: 'approvedAtEnd', label: t('crud.approved_at_end'), type: 'date' },
            { name: 'creatorId', label: t('crud.creator'), type: 'autocomplete', autocompleteProps: { items: userOptions } },
            { name: 'updatorId', label: t('crud.updator'), type: 'autocomplete', autocompleteProps: { items: userOptions } },
            {
                name: 'sortBy',
                label: t('crud.sort_by'),
                type: 'select',
                options: [
                    { value: 'referenceNumber', label: t('crud.reference_number') },
                    { value: 'username', label: t('crud.username') },
                    { value: 'lastName', label: t('crud.last_name') },
                    { value: 'firstName', label: t('crud.first_name') },
                    { value: 'email', label: t('crud.email') },
                    { value: 'phone', label: t('crud.phone') },
                    { value: 'gender', label: t('crud.gender') },
                    { value: 'townId', label: t('crud.city') },
                    { value: 'rank', label: t('crud.rank') },
                    { value: 'category', label: t('crud.category_profil') },
                    { value: 'companyId', label: t('crud.company') },
                    { value: 'businessSector', label: t('crud.business_sector') },
                    { value: 'function', label: t('crud.function') },
                    { value: 'isApproved', label: t('crud.is_approved') },
                    { value: 'isActive', label: t('crud.status') },
                    { value: 'approvedA', label: t('crud.approved_at') },
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
        [t, companyOptions, countryOptions, townsOptions, isAdmin, isAdminOrStaff, isCompanyAdmin, user, userOptions]
    );

    // Données et en-têtes pour l'export Excel
    const excelData = useMemo(() => items.map((item) => ({
        referenceNumber: item.referenceNumber,
        username: item.username || 'N/A',
        lastName: item.lastName || 'N/A',
        firstName: item.firstName || 'N/A',
        gender: t(GenderLabels[item.gender] || item.gender) || 'N/A',
        email: item.email,
        phone: item.phone,
        businessSector: item?.businessSector || 'N/A',
        rank: t(RankListLabels[item.rank] || item.rank) || 'N/A',
        category: t(categoryProfileLabels[item.category] || item.category) || 'N/A',
        function: item?.function?.[0]?.function || 'N/A',
        town: item.town?.name || 'N/A',
        isStaff: item.isStaff ? t('1') : t('0'),
        isAdmin: item.isAdmin ? t('1') : t('0'),
        isApproved: item?.isApproved ? t('1') : t('0'),
        isActive: item.isActive ? t('1') : t('0'),
        creator: item.creator?.username || 'N/A',
        updator: item.updator?.username || 'N/A',
        validator: item?.validator?.username || 'N/A',
        createdAt: new Date(item.createdAt).toLocaleString() || 'N/A',
        updatedAt: new Date(item.updatedAt).toLocaleString() || 'N/A',
        approvedAt: new Date(item.approvedAt).toLocaleString() || 'N/A',
    })), [items, t]);

    const excelHeaders = useMemo(() => [
        { label: t('crud.reference_number'), key: 'referenceNumber' },
        { label: t('crud.username'), key: 'username' },
        { label: t('crud.last_name'), key: 'lastName' },
        { label: t('crud.first_name'), key: 'firstName' },
        { label: t('crud.gender'), key: 'gender' },
        { label: t('crud.email'), key: 'email' },
        { label: t('crud.phone'), key: 'phone' },
        { label: t('crud.business_sector'), key: 'businessSector' },
        { label: t('crud.rank'), key: 'rank' },
        { label: t('crud.category'), key: 'category' },
        { label: t('crud.function'), key: 'function' },
        { label: t('crud.city'), key: 'town' },
        { label: t('crud.is_staff'), key: 'isStaff' },
        { label: t('crud.is_admin'), key: 'isAdmin' },
        { label: t('crud.is_approved'), key: 'isApproved' },
        { label: t('crud.status'), key: 'isActive' },
        { label: t('crud.creator'), key: 'creator' },
        { label: t('crud.updator'), key: 'updator' },
        { label: t('crud.validator'), key: 'validator' },
        { label: t('crud.created_at'), key: 'createdAt' },
        { label: t('crud.updated_at'), key: 'updatedAt' },
        { label: t('crud.approved_at'), key: 'approvedAt' },
    ], [t]);

    const excelFilename = useMemo(() => `users-${new Date().toISOString().slice(0, 10)}.csv`, []);

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
                                <th>{t('crud.username')}</th>
                                <th>{t('crud.gender')}</th>
                                <th>{t('crud.category')}</th>
                                <th>{t('crud.subscription')}</th>
                                <th>{t('crud.sponsor')}</th>
                                <th>{t('crud.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((c) => (
                                // <tr key={c.id} className="hover">
                                <tr key={c.id} className={`hover ${!c?.isApproved && c?.category === 'PRIVATE_CLUB' ? 'bg-secondary' : ''}`}>
                                    <td className="w-24 font-mono text-sm">{c.referenceNumber}</td>
                                    <td className="max-w-xs truncate" title={c.username}>
                                        <span className="font-medium">{c.username}</span>
                                    </td>
                                    <td className="max-w-xs truncate" title={c.gender}>
                                        <span className="font-medium">{t(GenderLabels[c.gender] || c.gender) || 'N/A'}</span>
                                    </td>
                                    <td className="max-w-xs truncate" title={c?.category}>
                                        {t(categoryProfileLabels[c.category] || c.category) || 'N/A'}
                                    </td>
                                    
                                    <td className="w-20 text-center">
                                            {c.subscriptionsCreator?.length || 0}
                                    </td>
                                    <td className="w-20 text-center">
                                            {c.sponsorsCreator?.length || 0}
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