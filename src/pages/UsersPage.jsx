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
    const { user } = useAuth();
    const isAdmin = user && (user.isAdmin);
    const isAdminOrStaff = user && (user.isAdmin || user.isStaff);
    const isCompanyAdmin = user && (user.profilsOwner?.[0]?.rank === "ADMIN");
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
    // const fields = useMemo(
    //     () => [
    //         { name: 'username', label: t('crud.username'), type: 'text', required: true },
    //         { name: 'lastName', label: t('crud.last_name'), type: 'text', required: true },
    //         {
    //             name: 'gender',
    //             label: t('auth.gender'),
    //             type: 'select',
    //             required: true,
    //             options: [
    //                 { value: 'MALE', label: t('gender.male') },
    //                 { value: 'FEMALE', label: t('gender.female') }
    //             ]
    //         },
    //         { name: 'firstName', label: t('crud.first_name'), type: 'text', required: false },
    //         { name: 'email', label: t('crud.email'), type: 'email', required: true },
    //         { name: 'phone', label: t('crud.phone'), type: 'tel', required: true },
    //         { name: 'countryId', label: t('crud.country'), type: 'autocomplete', required: true, autocompleteProps: { items: countryOptions, onSelect: (id, name) => setSelectedCountry({ id, name }) } },
    //         { name: 'townId', label: t('crud.city'), type: 'autocomplete', required: true, autocompleteProps: { items: townsOptions, onSelect: (id, name) => setSelectedCity({ id, name }) } },
    //         {
    //             name: 'rank',
    //             label: t('crud.rank'),
    //             type: 'select',
    //             required: false,
    //             options: [
    //                 { value: 'GENERAL_MANAGER', label: t('crud.general_manager') },
    //                 { value: 'HUMAN_RESOURCES_MANAGER', label: t('crud.human_resources_manager') },
    //                 { value: 'IT_MANAGER', label: t('crud.it_manager') },
    //                 { value: 'ADMIN', label: t('crud.admin') },
    //                 { value: 'COLLABORATOR', label: t('crud.commaborator') }
    //             ]
    //         },
    //         {
    //             name: 'category',
    //             label: t('crud.category_profil'),
    //             type: 'select',
    //             required: false,
    //             options: [
    //                 { value: 'CLASSIC', label: t('crud.classic') },
    //                 { value: 'PREMIUM', label: t('crud.premium') },
    //                 { value: 'GOLD', label: t('crud.gold') }
    //             ]
    //         },
            
    //         ...(isCompanyAdmin === 'admin' ? [
    //             { name: 'companyId', label: t('crud.company'), type: 'autocomplete', required: false, value: user.profilsOwner.companyId },
    //             { name: 'businessSector', label: t('crud.business_sector'), type: 'text', value: user.profilsOwner.businessSector },
    //             {
    //                 name: 'category',
    //                 label: t('crud.category_profil'),
    //                 type: 'select',
    //                 required: false,
    //                 options: [
    //                     { value: 'CLASSIC', label: t('crud.classic') },
    //                     { value: 'PREMIUM', label: t('crud.premium') },
    //                     { value: 'GOLD', label: t('crud.gold') },
    //                     { value: 'PRIVATE_CLUB', label: t('crud.private_club') }
    //                 ]
    //             },
    //         ] : []),
            
    //         ...(isAdminOrStaff === 'admin' ? [
    //             { name: 'companyId', label: t('crud.company'), type: 'autocomplete', required: false, autocompleteProps: { items: companyOptions, onSelect: (id, name) => setSelectedCompany({ id, name }) } },
    //             { name: 'businessSector', label: t('crud.business_sector'), type: 'text', required: false },
    //             {
    //                 name: 'category',
    //                 label: t('crud.category_profil'),
    //                 type: 'select',
    //                 required: false,
    //                 options: [
    //                     { value: 'CLASSIC', label: t('crud.classic') },
    //                     { value: 'PREMIUM', label: t('crud.premium') },
    //                     { value: 'GOLD', label: t('crud.gold') },
    //                     { value: 'PRIVATE_CLUB', label: t('crud.private_club') }
    //                 ]
    //             },
    //         ] : []),

    //         ...(isAdmin === 'admin' ? [
    //             { name: 'isStaff', label: t('crud.is_staff'), type: 'text', required: false },
    //             { name: 'isAdmin', label: t('crud.is_admin'), type: 'text', required: false }
    //         ] : []),
    //         { name: 'function', label: t('crud.function'), type: 'text' },
    //         { name: 'photo', label: t('crud.picture'), type: 'file' },
    //         // Le champ 'code' est inclus si l'utilisateur est admin
    //         {
    //             name: 'password',
    //             label: t('crud.password'),
    //             type: 'password',
    //             required: true,
    //         },
    //         {
    //             name: 'passwordConfirm',
    //             label: t('crud.password_confirm'),
    //             type: 'password',
    //             required: true,
    //             customProps: {
    //                 validate: (value, formValues) => value === formValues.password || t('errors.password_mismatch')
    //             }
    //         },

    //     ],
    //     [companyOptions, countryOptions, townsOptions, t, modal.mode]
    // );
    const fields = useMemo(
        () => [
            { name: 'username', label: t('crud.username'), type: 'text', required: true },
            { name: 'lastName', label: t('crud.last_name'), type: 'text', required: true },
            {
                name: 'gender',
                label: t('auth.gender'),
                type: 'select',
                required: true,
                options: [
                    { value: 'MALE', label: t('gender.male') },
                    { value: 'FEMALE', label: t('gender.female') }
                ]
            },
            { name: 'firstName', label: t('crud.first_name'), type: 'text', required: false },
            { name: 'email', label: t('crud.email'), type: 'email', required: true },
            { name: 'phone', label: t('crud.phone'), type: 'tel', required: true },
            { name: 'countryId', label: t('crud.country'), type: 'autocomplete', required: true, autocompleteProps: { items: countryOptions, onSelect: (id, name) => setSelectedCountry({ id, name }) } },
            { name: 'townId', label: t('crud.city'), type: 'autocomplete', required: true, autocompleteProps: { items: townsOptions, onSelect: (id, name) => setSelectedCity({ id, name }) } },
            {
                name: 'rank',
                label: t('crud.rank'),
                type: 'select',
                required: false,
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
                required: false,
                options: [
                    { value: 'CLASSIC', label: t('crud.classic') },
                    { value: 'PREMIUM', label: t('crud.premium') },
                    { value: 'GOLD', label: t('crud.gold') }
                ]
            },
            
            ...(isCompanyAdmin ? [
                { name: 'companyId', label: t('crud.company'), type: 'autocomplete', required: false, value: user.profilsOwner?.[0]?.companyId },
                { name: 'businessSector', label: t('crud.business_sector'), type: 'text', value: user.profilsOwner?.[0]?.businessSector },
                {
                    name: 'category',
                    label: t('crud.category_profil'),
                    type: 'select',
                    required: false,
                    options: [
                        { value: 'CLASSIC', label: t('crud.classic') },
                        { value: 'PREMIUM', label: t('crud.premium') },
                        { value: 'GOLD', label: t('crud.gold') },
                        { value: 'PRIVATE_CLUB', label: t('crud.private_club') }
                    ]
                },
            ] : []),
            
            ...(isAdminOrStaff ? [
                { name: 'companyId', label: t('crud.company'), type: 'autocomplete', required: false, autocompleteProps: { items: companyOptions, onSelect: (id, name) => setSelectedCompany({ id, name }) } },
                { name: 'businessSector', label: t('crud.business_sector'), type: 'text', required: false },
                {
                    name: 'category',
                    label: t('crud.category_profil'),
                    type: 'select',
                    required: false,
                    options: [
                        { value: 'CLASSIC', label: t('crud.classic') },
                        { value: 'PREMIUM', label: t('crud.premium') },
                        { value: 'GOLD', label: t('crud.gold') },
                        { value: 'PRIVATE_CLUB', label: t('crud.private_club') }
                    ]
                },
            ] : []),
    
            ...(isAdmin ? [
                { name: 'isStaff', label: t('crud.is_staff'), type: 'checkbox', required: false },
                { name: 'isAdmin', label: t('crud.is_admin'), type: 'checkbox', required: false }
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
            ] : [])
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
            { name: 'gender', label: t('crud.gender') },
            { name: 'name', label: t('crud.name') },
            { name: 'town', label: t('crud.city'), accessor: (item) => item.town?.name || 'N/A' },
            { name: 'town', label: t('crud.city'), accessor: (item) => item.town?.name || 'N/A' },
            { name: 'photo', label: t('crud.photo'), accessor: (item) => item.media?.[0] ? <img src={item.media[0]} alt="Logo" className="w-16 h-16 object-contain" /> : 'N/A' },
            
            { name: 'rank', label: t('crud.rank'), accessor: (item) => item?.profilsOwner?.[0]?.rank || 'N/A' },
            { name: 'category', label: t('crud.category'), accessor: (item) => item?.profilsOwner?.[0]?.category || 'N/A' },
            { name: 'businessSector', label: t('crud.businessSector'), accessor: (item) => item?.profilsOwner?.[0]?.businessSector || 'N/A' },
            { name: 'function', label: t('crud.function'), accessor: (item) => item?.profilsOwner?.[0]?.function || 'N/A' },
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
                    item?.profilsOwner?.[0] .isApproved ? (
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
            { name: 'employees', label: `${t('crud.employee')}(s)`, accessor: (item) => `(${item.employees?.length ?? 0}) ${item.employees?.map((employee) => employee.owner.username).join(', ')}` || t('crud.no_elements') },
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
                companyId: item.companyId,
                countryId: item.town?.countryId,
                townId: item.townId,
                address: item.address,
                email: item.email,
                phone: item.phone,
                nui: item.nui,
                media: item.media,
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
    // const handleSave = useCallback(
    //     async (data) => {
    //         let mediaUrls = [];
    //         let logoFile = null;
    //         if (data.media && data.media instanceof File) {
    //             logoFile = data.media;
    //         } else if (Array.isArray(data.media)) {
    //             mediaUrls = data.media;
    //         }
    //         try {
    //             if (logoFile) {
    //                 const formData = new FormData();
    //                 formData.append('files', logoFile);
    //                 const uploadResponse = await uploadFilesService.createFiles(formData);
    //                 if (uploadResponse.data.success && uploadResponse.data.result.length > 0) {
    //                     mediaUrls = uploadResponse.data.result.map(file => file.url);
    //                 } else {
    //                     throw new Error(t('errors.upload_failed'));
    //                 }
    //             }
    //             const mediaPayload = mediaUrls || [];
    //             if (modal.mode === 'create') {
    //                 const itemPayload = {
    //                     username: data.email,
    //                     lastName: data.name,
    //                     email: data.email,
    //                     phone: data.phone,
    //                     photo: mediaPayload[0] || '',
    //                     townId: data.townId,
    //                     password: data.password,
    //                     isActive: true,
    //                 };
    //                 const newItem = await usersService.create(itemPayload);
    //                 const newItemId = newItem.data?.result?.id;
    //                 if (!newItemId) {
    //                     throw new Error('User creation failed. No ID returned.');
    //                 }
                    
    //                 const profilePayload = {
    //                     ownerId: newItemId,
    //                     companyId: data.companyId || '',
    //                     rank: data.rank || '',
    //                     businessSector: data.businessSector || '',
    //                     function: data.function || '',
    //                 };
    //                 await profilsService.create(profilePayload);
    //                 toast.success(t('crud.creation_success'));
    //                 closeModal();
    //             } else {
    //                 const updatePayload = {
    //                     name: data.name,
    //                     businessSector: data.businessSector,
    //                     townId: data.townId,
    //                     address: data.address,
    //                     nui: data.nui,
    //                     email: data.email,
    //                     phone: data.phone,
    //                     media: mediaPayload,
    //                 };
    //                 // 1. Appel de la mise à jour
    //                 await update({ id: modal.id, payload: updatePayload }); 
                    
    //                 // 2. Si la mise à jour réussit, fermez la modale et affichez un toast
    //                 toast.success(t('crud.update_success'));
    //                 closeModal();
    //             }
    //         } catch (error) {
    //             console.error("Erreur lors de la sauvegarde :", error);
    //             toast.error(error.response?.data?.message || error.message || t('crud.creation_error'));
    //         }
    //     },
    //     [modal.mode, modal.id, t, closeModal,profilsService.create, update]
    // );
    const handleSave = useCallback(
        async (data) => {
          let mediaUrls = [];
          let logoFile = null;
      
          if (data.photo && data.photo instanceof File) {
            logoFile = data.photo;
          } else if (typeof data.photo === 'string') {
            mediaUrls = [data.photo];
          }
      
          try {
            if (logoFile) {
              const formData = new FormData();
              formData.append('files', logoFile);
              const uploadResponse = await uploadFilesService.createFiles(formData);
              if (uploadResponse.data.success && uploadResponse.data.result.length > 0) {
                mediaUrls = uploadResponse.data.result.map(file => file.url);
              } else {
                throw new Error(t('errors.upload_failed'));
              }
            }
      
            if (modal.mode === 'create') {
              const userPayload = {
                username: data.username,
                lastName: data.lastName,
                firstName: data.firstName || undefined,
                email: data.email,
                phone: data.phone,
                gender: data.gender,
                townId: data.townId,
                password: data.password,
                photo: mediaUrls[0] || undefined,
                isStaff: data.isStaff || false,
                isAdmin: data.isAdmin || false,
                isActive: true,
              };
      
              const newUser = await usersService.register(userPayload); // ✅ endpoint /register
              const newUserId = newUser.data?.result?.id;
      
              if (!newUserId) {
                throw new Error('User creation failed. No ID returned.');
              }
      
              const isAllowedToCreateProfile = isAdminOrStaff;
      
              if (isAllowedToCreateProfile) {
                const profilePayload = {
                  ownerId: newUserId,
                  companyId: data.companyId || undefined,
                  rank: data.rank || undefined,
                  category: data.category || undefined,
                  businessSector: data.businessSector || undefined,
                  function: data.function || undefined,
                };
      
                await profilsService.create(profilePayload); // ✅ endpoint /create
              }
      
              toast.success(t('crud.creation_success'));
              closeModal();
            }
      
            // 🔧 TODO: Mode édition - à adapter selon votre endpoint de mise à jour utilisateur
            else {
              const updatePayload = {
                lastName: data.lastName,
                firstName: data.firstName || undefined,
                email: data.email,
                phone: data.phone,
                gender: data.gender,
                townId: data.townId,
                photo: mediaUrls[0] || undefined,
                isStaff: data.isStaff,
                isAdmin: data.isAdmin,
                isActive: true,
              };
      
              await update({ id: modal.id, payload: updatePayload }); // ✅ endpoint PUT /users/:id
              toast.success(t('crud.update_success'));
              closeModal();
            }
          } catch (error) {
            console.error('Erreur lors de la sauvegarde :', error);
            toast.error(error.response?.data?.message || error.message || t('crud.creation_error'));
          }
        },
        [modal.mode, modal.id, t, closeModal, profilsService.create, update, isAdminOrStaff]
    );

    const handleRestore = useCallback((item) => restore({ id: item.id }), [restore]);
    const handelApproder = useCallback((item) => update({ id: item.id, payload: {"isApproved": true} }), [update]);

    // Configuration des champs pour les filtres avancés
    const filterFields = useMemo(
        () => [
            { name: 'search', label: t('crud.search'), type: 'text' },
            { name: 'limit', label: t('crud.limit'), type: 'number' },
            { name: 'referenceNumber', label: t('crud.reference_number'), type: 'text' },
            { name: 'username', label: t('crud.username'), type: 'text' },
            { name: 'lastName', label: t('crud.last_name'), type: 'text' },
            { name: 'email', label: t('crud.email'), type: 'email' },
            { name: 'phone', label: t('crud.phone'), type: 'text' },
            { name: 'townId', label: t('crud.city'), type: 'autocomplete', autocompleteProps: { items: townsOptions } },
            { name: 'isApproved', label: t('crud.abrobation'), type: 'bool' },
            { name: 'createdAtStart', label: t('crud.created_at_start'), type: 'date' },
            { name: 'createdAtEnd', label: t('crud.created_at_end'), type: 'date' },
            { name: 'updatedAtStart', label: t('crud.updated_at_start'), type: 'date' },
            { name: 'updatedAtEnd', label: t('crud.updated_at_end'), type: 'date' },
            { name: 'creatorId', label: t('crud.creator'), type: 'autocomplete', autocompleteProps: { items: userOptions } },
            { name: 'updatorId', label: t('crud.updator'), type: 'autocomplete', autocompleteProps: { items: userOptions } },
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
        username: item.username || 'N/A',
        lastName: item.lastName || 'N/A',
        firstName: item.firstName || 'N/A',
        gender: item.gender || 'N/A',
        email: item.email,
        phone: item.phone,
        businessSector: item?.profilsOwner?.[0]?.businessSector || 'N/A',
        rank: item?.profilsOwner?.[0]?.rank || 'N/A',
        category: item?.category?.[0]?.rank || 'N/A',
        function: item?.category?.[0]?.function || 'N/A',
        town: item.town?.name || 'N/A',
        isStaff: item.isStaff ? t('1') : t('0'),
        isAdmin: item.isAdmin ? t('1') : t('0'),
        isApproved: item?.profilsOwner?.[0]?.isApproved ? t('1') : t('0'),
        isActive: item.isActive ? t('1') : t('0'),
        creator: item.creator?.username || 'N/A',
        updator: item.updator?.username || 'N/A',
        validator: item?.profilsOwner?.[0]?.validator?.username || 'N/A',
        createdAt: new Date(item.createdAt).toLocaleString(),
        updatedAt: new Date(item.updatedAt).toLocaleString(),
        approvedAt: item.approvedAt ? new Date( item?.profilsOwner?.[0].approvedAt).toLocaleString() : 'N/A',
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
        // { label: `${t('crud.employee')}(s)`, key: 'employees' },
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
                                <tr key={c.id} className={`hover ${c.profilsOwner?.[0]?.isApproved ? '' : 'bg-secondary'}`}>
                                    <td className="w-24 font-mono text-sm">{c.referenceNumber}</td>
                                    <td className="max-w-xs truncate" title={c.username}>
                                        <span className="font-medium">{c.username}</span>
                                    </td>
                                    <td className="max-w-xs truncate" title={c.gender}>
                                        <span className="font-medium">{c.gender}</span>
                                    </td>
                                    <td className="max-w-xs truncate" title={c.profilsOwner?.[0]?.category}>
                                        {c.profilsOwner?.[0]?.category}
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