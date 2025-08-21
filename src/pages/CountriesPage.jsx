// // src/pages/CountriesPage.jsx
// import { useState, useEffect } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import { useCrudPaginated } from '../hooks/useCrudPaginated';
// import { countriesService } from '../services/countriesService';
// import CrudModal from '../components/CrudModal';
// import PageContence from '../components/PageContence';
// import { useDebounce } from '../hooks/useDebounce';
// import { useQuery } from '@tanstack/react-query'; 


// export default function CountriesPage() {
//     const { t } = useTranslation();
    
//     // Champs utilisés par CrudModal pour les modes 'create' et 'edit'
//     const fields = [
//         { name: 'name', label: t('crud.name'), type: 'text', required: true },
//         { name: 'code', label: t('crud.code'), type: 'text', required: true },
//     ];

//     // Définissez le tableau des champs de vue ICI, à l'intérieur du composant.
//     const ViewFields = [
//         { name: 'name', label: t('crud.name') },
//         { name: 'code', label: t('crud.code') },
//         { name: 'referenceNumber', label: t('crud.reference_number') },
//         { name: 'isActive', label: t('crud.status'), accessor: (item) => (item.isActive ? t('crud.active') : t('crud.inactive')) },
//         { name: 'creator', label: t('crud.creator'), accessor: (item) => item.creator?.username || 'N/A' },
//         { name: 'updator', label: t('crud.updator'), accessor: (item) => item.updator?.username || 'N/A' },
//         { name: 'createdAt', label: t('crud.created_at'), accessor: (item) => new Date(item.createdAt).toLocaleString() },
//         { name: 'updatedAt', label: t('crud.updated_at'), accessor: (item) => new Date(item.updatedAt).toLocaleString() },
//         { 
//             name: 'towns', 
//             label: t('crud.city')+'(s)', 
//             accessor: (item) => {
//                 if (!item.towns || item.towns.length === 0) {
//                     return t('crud.no_elements');
//                 }
//                 const townNames = item.towns.map(town => town.name).join(', ');
//                 return `${item.towns.length} ${t('crud.city')+'(s)'} : ${townNames}`;
//             }
//         },
//     ];

//     /* -------------------------------------------------
//         1) Paramètres d’URL et état des filtres
//     -------------------------------------------------- */
//     const [searchParams, setSearchParams] = useSearchParams();

//     const [search, setSearch] = useState(searchParams.get('search') || '');
//     const debouncedSearch = useDebounce(search, 700);
//     const isActive = searchParams.get('isActive') !== 'false';
//     const page = Number(searchParams.get('page') || 1);
//     const limit = Number(searchParams.get('limit') || 10);

//     /* -------------------------------------------------
//         2) Hook CRUD + pagination pour la liste
//     -------------------------------------------------- */
//     const {
//         items,
//         pagination,
//         isLoading,
//         create,
//         update,
//         delete: softDelete,
//         restore,
//     } = useCrudPaginated(countriesService, 'countries', {
//         search: debouncedSearch,
//         isActive,
//         page,
//         limit,
//     });

//     /* -------------------------------------------------
//         3) États de la modale et pour la requête de détails
//     -------------------------------------------------- */
//     const [modal, setModal] = useState({ open: false, mode: 'create', item: null });
//     const [selectedCountryId, setSelectedCountryId] = useState(null);

//     /* -------------------------------------------------
//         4) Requête pour les détails d'un pays
//     -------------------------------------------------- */
//     const {
//         data: countryDetails,
//         isLoading: isLoadingDetails
//     } = useQuery({
//         queryKey: ['country', selectedCountryId],
//         queryFn: () => countriesService.getCountryById(selectedCountryId),
//         enabled: !!selectedCountryId,
//     });

//     /* -------------------------------------------------
//         5) Gestion de la modale
//     -------------------------------------------------- */
//     const openModal = (mode, item = null) => {
//         // Conditionnel : si le mode est 'create', initialisez l'item à un objet vide
//         const selectedItem = mode === 'create' ? {} : item; 

//         setModal({ open: true, mode, item: selectedItem });
        
//         if (mode === 'view' && item) {
//             setSelectedCountryId(item.id);
//         } else {
//             setSelectedCountryId(null);
//         }
//     };

//     const closeModal = () => {
//         setModal({ open: false, mode: 'create', item: null });
//         setSelectedCountryId(null);
//     };

//     const handleSave = (data) => {
//         // Crée un objet "payload" contenant seulement les champs pertinents pour l'API
//         const payload = {
//             name: data.name,
//             code: data.code,
//         };
        
//         modal.mode === 'create'
//             ? create(payload) // pour la création
//             : update({ id: modal.item.id, payload }); // pour la mise à jour
            
//         closeModal();
//     };

//     const handleRestore = (item) => restore({ id: item.id });

//     /* -------------------------------------------------
//         6) Effets de bord
//     -------------------------------------------------- */
//     // Met à jour l'URL lorsque les filtres changent
//     useEffect(() => {
//         setSearchParams({ search: debouncedSearch, isActive, page: 1, limit });
//     }, [debouncedSearch, isActive, limit, setSearchParams]);

//     // Met à jour l'état de la modale avec les détails du pays une fois chargés
//     useEffect(() => {
//         if (countryDetails && modal.mode === 'view') {
//             const detailedItem = countryDetails?.data?.result || null;
//             if (detailedItem) {
//                 setModal(prev => ({ ...prev, item: detailedItem }));
//             }
//         }
//     }, [countryDetails, modal.mode]);

//     /* -------------------------------------------------
//         7) Gestion de la pagination
//     -------------------------------------------------- */
//     const handlePage = (newPage) =>
//         setSearchParams({ search: debouncedSearch, isActive, page: newPage, limit });

//     /* -------------------------------------------------
//         8) Rendu
//     -------------------------------------------------- */
//     if (isLoading) return <p className="text-center mt-10">{t('loading')}</p>;

//     return (
//         <PageContence>
//             <div className="p-4 max-w-7xl mx-auto">
//                 {/* En-tête */}
//                 <div className="flex justify-between items-center mb-4">
//                     <h1 className="text-2xl font-bold">{t('modul_title.country')}</h1>
//                     <button className="btn btn-primary" onClick={() => openModal('create')}>
//                         {t('crud.create')}
//                     </button>
//                 </div>

//                 {/* Filtres */}
//                 <div className="flex gap-4 mb-4">
//                     <input
//                         placeholder={t('crud.search')}
//                         className="input input-bordered"
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                     />
//                     <label className="label cursor-pointer">
//                         <span className="label-text">{t('crud.active')}</span>
//                         <input
//                             type="checkbox"
//                             className="toggle"
//                             checked={isActive}
//                             onChange={(e) => setSearchParams({ search: debouncedSearch, isActive: e.target.checked, page: 1, limit })}
//                         />
//                     </label>
//                 </div>

//                 {/* Table */}
//                 <div className="overflow-x-auto">
//                     <table className="table w-full">
//                         <thead>
//                             <tr>
//                                 <th>{t('crud.reference_number')}</th>
//                                 <th>{t('crud.name')}</th>
//                                 <th>{t('crud.code')}</th>
//                                 <th>{t('crud.city')}(s)</th>
//                                 <th>{t('crud.actions')}</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {items.map((c) => (
//                                 <tr key={c.id}>
//                                     <td>{c.referenceNumber}</td>
//                                     <td>{c.name}</td>
//                                     <td>{c.code}</td>
//                                     <td>{c.towns?.length || 0}</td>
//                                     <td className="flex gap-2">
//                                         <button className="btn btn-sm" onClick={() => openModal('view', c)}>
//                                             {t('crud.view')}
//                                         </button>
//                                         <button className="btn btn-sm" onClick={() => openModal('edit', c)}>
//                                             {t('crud.edit')}
//                                         </button>
//                                         {c.isActive ? (
//                                             <button
//                                                 className="btn btn-sm btn-error"
//                                                 onClick={() => softDelete(c.id)}
//                                             >
//                                                 {t('crud.delete')}
//                                             </button>
//                                         ) : (
//                                             <button
//                                                 className="btn btn-sm btn-success"
//                                                 onClick={() => handleRestore(c)}
//                                             >
//                                                 {t('crud.restore')}
//                                             </button>
//                                         )}
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* Pagination */}
//                 {pagination.totalPages > 1 && (
//                     <div className="btn-group mt-4">
//                         {Array.from({ length: pagination.totalPages }, (_, i) => (
//                             <button
//                                 key={i + 1}
//                                 className={`btn ${page === i + 1 ? 'btn-active' : ''}`}
//                                 onClick={() => handlePage(i + 1)}
//                             >
//                                 {i + 1}
//                             </button>
//                         ))}
//                     </div>
//                 )}

//                 {/* Modale unique */}
//                 <CrudModal
//                     isOpen={modal.open}
//                     onClose={closeModal}
//                     title={t(`crud.${modal.mode}`)}
//                     fields={fields} 
//                     viewFields={ViewFields} 
//                     initialData={modal.item}
//                     onSubmit={handleSave}
//                     mode={modal.mode}
//                     isLoading={isLoadingDetails}
//                 />
//             </div>
//         </PageContence>
//     );
// }

// // src/pages/CountriesPage.jsx
// import { useState, useEffect } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import { useCrudPaginated } from '../hooks/useCrudPaginated';
// import { countriesService } from '../services/countriesService';
// import CrudModal from '../components/CrudModal';
// import PageContence from '../components/PageContence';
// import { useDebounce } from '../hooks/useDebounce';
// import { useQuery } from '@tanstack/react-query'; 


// export default function CountriesPage() {
//     const { t } = useTranslation();
    
//     // Champs utilisés par CrudModal pour les modes 'create' et 'edit'
//     const fields = [
//         { name: 'name', label: t('crud.name'), type: 'text', required: true },
//         { name: 'code', label: t('crud.code'), type: 'text', required: true },
//     ];

//     // Définissez le tableau des champs de vue ICI, à l'intérieur du composant.
//     const ViewFields = [
//         { name: 'name', label: t('crud.name') },
//         { name: 'code', label: t('crud.code') },
//         { name: 'referenceNumber', label: t('crud.reference_number') },
//         { name: 'isActive', label: t('crud.status'), accessor: (item) => (item.isActive ? t('crud.active') : t('crud.inactive')) },
//         { name: 'creator', label: t('crud.creator'), accessor: (item) => item.creator?.username || 'N/A' },
//         { name: 'updator', label: t('crud.updator'), accessor: (item) => item.updator?.username || 'N/A' },
//         { name: 'createdAt', label: t('crud.created_at'), accessor: (item) => new Date(item.createdAt).toLocaleString() },
//         { name: 'updatedAt', label: t('crud.updated_at'), accessor: (item) => new Date(item.updatedAt).toLocaleString() },
//         { 
//             name: 'towns', 
//             label: t('crud.city')+'(s)', 
//             accessor: (item) => {
//                 if (!item.towns || item.towns.length === 0) {
//                     return t('crud.no_elements');
//                 }
//                 const townNames = item.towns.map(town => town.name).join(', ');
//                 return `${item.towns.length} ${t('crud.city')+'(s)'} : ${townNames}`;
//             }
//         },
//     ];

//     /* -------------------------------------------------
//         1) Paramètres d’URL et état des filtres
//     -------------------------------------------------- */
//     const [searchParams, setSearchParams] = useSearchParams();

//     const [search, setSearch] = useState(searchParams.get('search') || '');
//     const debouncedSearch = useDebounce(search, 700);
//     const isActive = searchParams.get('isActive') !== 'false';
//     const page = Number(searchParams.get('page') || 1);
//     const limit = Number(searchParams.get('limit') || 10);

//     /* -------------------------------------------------
//         2) Hook CRUD + pagination pour la liste
//     -------------------------------------------------- */
//     const {
//         items,
//         pagination,
//         isLoading,
//         create,
//         update,
//         delete: softDelete,
//         restore,
//     } = useCrudPaginated(countriesService, 'countries', {
//         search: debouncedSearch,
//         isActive,
//         page,
//         limit,
//     });

//     /* -------------------------------------------------
//         3) États de la modale et pour la requête de détails
//     -------------------------------------------------- */
//     const [modal, setModal] = useState({ open: false, mode: 'create', item: null });
//     const [selectedCountryId, setSelectedCountryId] = useState(null);
//     const [modalKey, setModalKey] = useState(0);

//     /* -------------------------------------------------
//         4) Requête pour les détails d'un pays
//     -------------------------------------------------- */
//     const {
//         data: countryDetails,
//         isLoading: isLoadingDetails
//     } = useQuery({
//         queryKey: ['country', selectedCountryId],
//         queryFn: () => countriesService.getCountryById(selectedCountryId),
//         enabled: !!selectedCountryId,
//     });

//     /* -------------------------------------------------
//         5) Gestion de la modale
//     -------------------------------------------------- */
//     const openModal = (mode, item = null) => {
//         let initialFormState = {};
//         if (mode === 'edit' && item) {
//             initialFormState = {
//                 name: item.name,
//                 code: item.code,
//             };
//         } else if (mode === 'view' && item) {
//             initialFormState = item;
//             setSelectedCountryId(item.id);
//         } else {
//             setSelectedCountryId(null);
//         }
        
//         setModal({ open: true, mode, item: initialFormState });
//         setModalKey(prev => prev + 1);
//     };

//     const closeModal = () => {
//         setModal({ open: false, mode: 'create', item: null });
//         setSelectedCountryId(null);
//     };

//     const handleSave = (data) => {
//         const payload = {
//             name: data.name,
//             code: data.code,
//         };
        
//         modal.mode === 'create'
//             ? create(payload)
//             : update({ id: modal.item.id, payload });
            
//         closeModal();
//     };

//     const handleRestore = (item) => restore({ id: item.id });

//     /* -------------------------------------------------
//         6) Effets de bord
//     -------------------------------------------------- */
//     // ✨ Met à jour les paramètres d'URL UNIQUEMENT lorsque les filtres changent
//     useEffect(() => {
//         setSearchParams(prev => ({
//             ...Object.fromEntries(prev),
//             search: debouncedSearch,
//             isActive: isActive,
//             // Ne pas écraser la page actuelle si les filtres ne changent pas
//             page: 1, // On revient à la première page lors d'une nouvelle recherche/filtre
//         }));
//     }, [debouncedSearch, isActive]); // Dépendances modifiées

//     // Met à jour l'état de la modale avec les détails du pays une fois chargés
//     useEffect(() => {
//         if (countryDetails && modal.mode === 'view') {
//             const detailedItem = countryDetails?.data?.result || null;
//             if (detailedItem) {
//                 setModal(prev => ({ ...prev, item: detailedItem }));
//             }
//         }
//     }, [countryDetails, modal.mode]);

//     /* -------------------------------------------------
//         7) Gestion de la pagination
//     -------------------------------------------------- */
//     // ✨ Cette fonction est maintenant autonome pour la page
//     const handlePage = (newPage) => {
//         setSearchParams(prev => ({
//             ...Object.fromEntries(prev),
//             page: newPage,
//         }));
//     };

//     /* -------------------------------------------------
//         8) Rendu
//     -------------------------------------------------- */
//     if (isLoading) return <p className="text-center mt-10">{t('loading')}</p>;

//     return (
//         <PageContence>
//             <div className="p-4 max-w-7xl mx-auto">
//                 {/* En-tête */}
//                 <div className="flex justify-between items-center mb-4">
//                     <h1 className="text-2xl font-bold">{t('modul_title.country')}</h1>
//                     <button className="btn btn-primary" onClick={() => openModal('create')}>
//                         {t('crud.create')}
//                     </button>
//                 </div>

//                 {/* Filtres */}
//                 <div className="flex gap-4 mb-4">
//                     <input
//                         placeholder={t('crud.search')}
//                         className="input input-bordered"
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                     />
//                     <label className="label cursor-pointer">
//                         <span className="label-text">{t('crud.active')}</span>
//                         <input
//                             type="checkbox"
//                             className="toggle"
//                             checked={isActive}
//                             onChange={(e) => setSearchParams({ search: debouncedSearch, isActive: e.target.checked, page: 1, limit })}
//                         />
//                     </label>
//                 </div>

//                 {/* Table */}
//                 <div className="overflow-x-auto">
//                     <table className="table w-full">
//                         <thead>
//                             <tr>
//                                 <th>{t('crud.reference_number')}</th>
//                                 <th>{t('crud.name')}</th>
//                                 <th>{t('crud.code')}</th>
//                                 <th>{t('crud.city')}(s)</th>
//                                 <th>{t('crud.actions')}</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {items.map((c) => (
//                                 <tr key={c.id}>
//                                     <td>{c.referenceNumber}</td>
//                                     <td>{c.name}</td>
//                                     <td>{c.code}</td>
//                                     <td>{c.towns?.length || 0}</td>
//                                     <td className="flex gap-2">
//                                         <button className="btn btn-sm" onClick={() => openModal('view', c)}>
//                                             {t('crud.view')}
//                                         </button>
//                                         <button className="btn btn-sm" onClick={() => openModal('edit', c)}>
//                                             {t('crud.edit')}
//                                         </button>
//                                         {c.isActive ? (
//                                             <button
//                                                 className="btn btn-sm btn-error"
//                                                 onClick={() => softDelete(c.id)}
//                                             >
//                                                 {t('crud.delete')}
//                                             </button>
//                                         ) : (
//                                             <button
//                                                 className="btn btn-sm btn-success"
//                                                 onClick={() => handleRestore(c)}
//                                             >
//                                                 {t('crud.restore')}
//                                             </button>
//                                         )}
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* Pagination */}
//                 {pagination.totalPages > 1 && (
//                     <div className="btn-group mt-4">
//                         {Array.from({ length: pagination.totalPages }, (_, i) => (
//                             <button
//                                 key={i + 1}
//                                 className={`btn ${page === i + 1 ? 'btn-active' : ''}`}
//                                 onClick={() => handlePage(i + 1)}
//                             >
//                                 {i + 1}
//                             </button>
//                         ))}
//                     </div>
//                 )}

//                 {/* Modale unique */}
//                 <CrudModal
//                     key={modalKey}
//                     isOpen={modal.open}
//                     onClose={closeModal}
//                     title={t(`crud.${modal.mode}`)}
//                     fields={fields} 
//                     viewFields={ViewFields} 
//                     initialData={modal.item}
//                     onSubmit={handleSave}
//                     mode={modal.mode}
//                     isLoading={isLoadingDetails}
//                 />
//             </div>
//         </PageContence>
//     );
// }

// src/pages/CountriesPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCrudPaginated } from '../hooks/useCrudPaginated';
import { countriesService } from '../services/countriesService';
import CrudModal from '../components/CrudModal';
import PageContence from '../components/PageContence';
import { useDebounce } from '../hooks/useDebounce';
import { useQuery } from '@tanstack/react-query'; 


export default function CountriesPage() {
    const { t } = useTranslation();
    
    // Champs utilisés par CrudModal pour les modes 'create' et 'edit'
    const fields = [
        { name: 'name', label: t('crud.name'), type: 'text', required: true },
        { name: 'code', label: t('crud.code'), type: 'text', required: true },
    ];

    // Définissez le tableau des champs de vue ICI, à l'intérieur du composant.
    const ViewFields = [
        { name: 'name', label: t('crud.name') },
        { name: 'code', label: t('crud.code') },
        { name: 'referenceNumber', label: t('crud.reference_number') },
        { name: 'isActive', label: t('crud.status'), accessor: (item) => (item.isActive ? t('crud.active') : t('crud.inactive')) },
        { name: 'creator', label: t('crud.creator'), accessor: (item) => item.creator?.username || 'N/A' },
        { name: 'updator', label: t('crud.updator'), accessor: (item) => item.updator?.username || 'N/A' },
        { name: 'createdAt', label: t('crud.created_at'), accessor: (item) => new Date(item.createdAt).toLocaleString() },
        { name: 'updatedAt', label: t('crud.updated_at'), accessor: (item) => new Date(item.updatedAt).toLocaleString() },
        { 
            name: 'towns', 
            label: t('crud.city')+'(s)', 
            accessor: (item) => {
                if (!item.towns || item.towns.length === 0) {
                    return t('crud.no_elements');
                }
                const townNames = item.towns.map(town => town.name).join(', ');
                return `${item.towns.length} ${t('crud.city')+'(s)'} : ${townNames}`;
            }
        },
    ];

    /* -------------------------------------------------
        1) Paramètres d’URL et état des filtres
    -------------------------------------------------- */
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const debouncedSearch = useDebounce(search, 700);
    const isActive = searchParams.get('isActive') !== 'false';
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);

    /* -------------------------------------------------
        2) Hook CRUD + pagination pour la liste
    -------------------------------------------------- */
    const {
        items,
        pagination,
        isLoading,
        create,
        update,
        delete: softDelete,
        restore,
    } = useCrudPaginated(countriesService, 'countries', {
        search: debouncedSearch,
        isActive,
        page,
        limit,
    });

    /* -------------------------------------------------
        3) États de la modale et pour la requête de détails
    -------------------------------------------------- */
    const [modal, setModal] = useState({ open: false, mode: 'create', item: null, id: null }); // ✨ Ajout de l'ID
    const [selectedCountryId, setSelectedCountryId] = useState(null);
    const [modalKey, setModalKey] = useState(0);

    /* -------------------------------------------------
        4) Requête pour les détails d'un pays
    -------------------------------------------------- */
    const {
        data: countryDetails,
        isLoading: isLoadingDetails
    } = useQuery({
        queryKey: ['country', selectedCountryId],
        queryFn: () => countriesService.getCountryById(selectedCountryId),
        enabled: !!selectedCountryId,
    });

    /* -------------------------------------------------
        5) Gestion de la modale
    -------------------------------------------------- */
    const openModal = (mode, item = null) => {
        let initialFormState = {};
        let itemId = null;

        if (mode === 'edit' && item) {
            initialFormState = {
                name: item.name,
                code: item.code,
            };
            itemId = item.id; // ✨ On stocke l'ID
        } else if (mode === 'view' && item) {
            initialFormState = item;
            itemId = item.id;
            setSelectedCountryId(item.id);
        } else {
            setSelectedCountryId(null);
        }
        
        setModal({ open: true, mode, item: initialFormState, id: itemId }); // ✨ On passe l'ID à l'état
        setModalKey(prev => prev + 1);
    };

    const closeModal = () => {
        setModal({ open: false, mode: 'create', item: null, id: null }); // ✨ Réinitialisation de l'ID
        setSelectedCountryId(null);
    };

    const handleSave = (data) => {
        const payload = {
            name: data.name,
            code: data.code,
        };
        
        modal.mode === 'create'
            ? create(payload)
            : update({ id: modal.id, payload }); // ✨ On utilise l'ID de l'état
            
        closeModal();
    };

    const handleRestore = (item) => restore({ id: item.id });

    /* -------------------------------------------------
        6) Effets de bord
    -------------------------------------------------- */
    useEffect(() => {
        setSearchParams(prev => ({
            ...Object.fromEntries(prev),
            search: debouncedSearch,
            isActive: isActive,
            page: 1,
        }));
    }, [debouncedSearch, isActive]);

    useEffect(() => {
        if (countryDetails && modal.mode === 'view') {
            const detailedItem = countryDetails?.data?.result || null;
            if (detailedItem) {
                setModal(prev => ({ ...prev, item: detailedItem }));
            }
        }
    }, [countryDetails, modal.mode]);

    /* -------------------------------------------------
        7) Gestion de la pagination
    -------------------------------------------------- */
    const handlePage = (newPage) => {
        setSearchParams(prev => ({
            ...Object.fromEntries(prev),
            page: newPage,
        }));
    };

    /* -------------------------------------------------
        8) Rendu
    -------------------------------------------------- */
    if (isLoading) return <p className="text-center mt-10">{t('loading')}</p>;

    return (
        <PageContence>
            <div className="p-4 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">{t('modul_title.country')}</h1>
                    <button className="btn btn-primary" onClick={() => openModal('create')}>
                        {t('crud.create')}
                    </button>
                </div>
                <div className="flex gap-4 mb-4">
                    <input
                        placeholder={t('crud.search')}
                        className="input input-bordered"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <label className="label cursor-pointer">
                        <span className="label-text">{t('crud.active')}</span>
                        <input
                            type="checkbox"
                            className="toggle"
                            checked={isActive}
                            onChange={(e) => setSearchParams({ search: debouncedSearch, isActive: e.target.checked, page: 1, limit })}
                        />
                    </label>
                </div>
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
                                            <button
                                                className="btn btn-sm btn-error"
                                                onClick={() => softDelete(c.id)}
                                            >
                                                {t('crud.delete')}
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => handleRestore(c)}
                                            >
                                                {t('crud.restore')}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {pagination.totalPages > 1 && (
                    <div className="btn-group mt-4">
                        {Array.from({ length: pagination.totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                className={`btn ${page === i + 1 ? 'btn-active' : ''}`}
                                onClick={() => handlePage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
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
            </div>
        </PageContence>
    );
}