// src/hooks/useCrudPaginated.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useMemo } from 'react';

export function useCrudPaginated(service, key, filters = {}) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const params = useMemo(() => {
    const { search, isActive, page, limit, ...restOfFilters } = filters;

    const filteredParams = {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      ...restOfFilters,
    };

    if (search && search.trim()) {
      filteredParams.search = search;
    }

    if (isActive !== undefined && isActive !== null) {
      filteredParams.isActive = isActive === 'true';
    }

    return filteredParams;
  }, [filters]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [key, params],
    queryFn: () => {
      return service.getAll(params);
    },
    staleTime: 60 * 1000,
    keepPreviousData: true,
  });

  const items = data?.data?.result?.data || [];
  const backendPagination = data?.data?.result?.pagination || {};
  const pagination = {
    currentPage: backendPagination.page || backendPagination.currentPage || 1,
    totalPages: backendPagination.totalPages || 1,
    totalItems: backendPagination.total || 0,
  };

  const createMutation = useMutation({
    mutationFn: service.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [key] });
      toast.success(t('crud.create_success'));
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('crud.create_error'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => service.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [key] });
      toast.success(t('crud.update_success'));
    },
    onError: (err) => toast.error(err.response?.data?.message || t('crud.update_error')),
  });

  const softDeleteMutation = useMutation({
    mutationFn: (id) => service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [key] });
      toast.success(t('crud.delete_success'));
    },
    onError: (err) => toast.error(err.response?.data?.message || t('crud.delete_error')),
  });

  const restoreMutation = useMutation({
    mutationFn: ({ id }) => service.restore(id, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [key] });
      toast.success(t('crud.restore_success'));
    },
    onError: (err) => toast.error(err.response?.data?.message || t('crud.restore_error')),
  });

  return {
    items,
    pagination,
    isLoading,
    isFetching,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    softDelete: softDeleteMutation.mutate,
    restore: restoreMutation.mutate,
  };
}

// // src/hooks/useCrudPaginated.js 
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
// import { useTranslation } from 'react-i18next'; 
// import { toast } from 'react-toastify'; 
// import { useMemo } from 'react'; 
 
// export function useCrudPaginated(service, key, filters = {}) { 
//   const queryClient = useQueryClient(); 
//   const { t } = useTranslation(); 
 
//   const params = useMemo(() => { 
//     const { search, isActive, page, limit, ...restOfFilters } = filters; 
 
//     const filteredParams = { 
//       page: Number(page) || 1, 
//       limit: Number(limit) || 10, 
//       ...restOfFilters, 
//     }; 
 
//     if (search && search.trim()) { 
//       filteredParams.search = search; 
//     } 
 
//     if (isActive !== undefined && isActive !== null) { 
//       filteredParams.isActive = isActive === 'true'; 
//     } 
 
//     return filteredParams; 
//   }, [filters]); 
 
//   const { data, isLoading, isFetching } = useQuery({ 
//     queryKey: [key, params], 
//     queryFn: () => { 
//       return service.getAll(params); 
//     }, 
//     staleTime: 60 * 1000, 
//     keepPreviousData: true, 
//   }); 
 
//   const items = data?.data?.result?.data || []; 
//   const backendPagination = data?.data?.result?.pagination || {}; 
//   const pagination = { 
//     currentPage: backendPagination.page || backendPagination.currentPage || 1, 
//     totalPages: backendPagination.totalPages || 1, 
//     totalItems: backendPagination.total || 0, 
//   }; 
 
//   // ------------------------------------------------- 
//   // Mutations CRUD (modifiées pour utiliser les messages de l'API) 
//   // ------------------------------------------------- 
//   const createMutation = useMutation({ 
//     mutationFn: service.create, 
//     onSuccess: (response) => { 
//       queryClient.invalidateQueries({ queryKey: [key] }); 
//       toast.success(response.data?.message || t('crud.create_success')); 
//     }, 
//     onError: (err) => { 
//       toast.error(err.response?.data?.message || t('crud.create_error')); 
//     }, 
//   }); 
 
//   const updateMutation = useMutation({ 
//     mutationFn: ({ id, payload }) => service.update(id, payload), 
//     onSuccess: (response) => { 
//       queryClient.invalidateQueries({ queryKey: [key] }); 
//       console.log(response.data);
//       toast.success(response.data?.message || t('crud.update_success')); 
//     }, 
//     onError: (err) => toast.error(err.response?.data?.message || t('crud.update_error')), 
//   }); 
 
//   const softDeleteMutation = useMutation({ 
//     mutationFn: (id) => service.delete(id), 
//     onSuccess: (response) => { 
//       queryClient.invalidateQueries({ queryKey: [key] }); 
//       toast.success(response.data?.message || t('crud.delete_success')); 
//     }, 
//     onError: (err) => toast.error(err.response?.data?.message || t('crud.delete_error')), 
//   }); 
 
//   const restoreMutation = useMutation({ 
//     mutationFn: ({ id }) => service.restore(id, {}), 
//     onSuccess: (response) => { 
//       queryClient.invalidateQueries({ queryKey: [key] }); 
//       toast.success(response.data?.message || t('crud.restore_success')); 
//     }, 
//     onError: (err) => toast.error(err.response?.data?.message || t('crud.restore_error')), 
//   }); 
 
//   return { 
//     items, 
//     pagination, 
//     isLoading, 
//     isFetching, 
//     create: createMutation.mutate, 
//     update: updateMutation.mutate, 
//     softDelete: softDeleteMutation.mutate, 
//     restore: restoreMutation.mutate, 
//   }; 
// }