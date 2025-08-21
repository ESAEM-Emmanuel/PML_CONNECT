// src/hooks/useCrudPaginated.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useCrudPaginated(service, key, filters = {}) {
  const queryClient = useQueryClient();
  const { search, isActive, page, limit } = filters;

  /* -------------------------------------------------
     Construction des paramètres :
     on retire les clés vides ou non définies
  -------------------------------------------------- */
  const params = {
    // search non envoyé si vide ou undefined
    ...(search && search.trim() && { search }),
    // isActive envoyé seulement si fourni
    ...(isActive !== undefined && { isActive }),
    // page et limit toujours envoyés (valeurs par défaut 1 / 10)
    page,
    limit,
  };

  /* -------------------------------------------------
     Requête paginée + filtres
  -------------------------------------------------- */
  const { data, isLoading, refetch } = useQuery({
    queryKey: [key, params],
    queryFn: () => service.getAll(params),
  });

  /* -------------------------------------------------
     Extraction des données
  -------------------------------------------------- */
  console.log(data);
//   const items        = data?.result?.data || [];
//   const pagination   = data?.result?.pagination || {};
const items = data?.data?.result?.data || [];
const pagination = data?.data?.result?.pagination || {};

  /* -------------------------------------------------
     Mutations CRUD
  -------------------------------------------------- */
  const createMutation = useMutation({ mutationFn: service.create, onSuccess: () => queryClient.invalidateQueries([key]) });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }) => service.update(id, payload), onSuccess: () => queryClient.invalidateQueries([key]) });
  const deleteMutation = useMutation({ mutationFn: service.delete, onSuccess: () => queryClient.invalidateQueries([key]) });
  const restoreMutation = useMutation({ mutationFn: ({ id }) => service.restore(id, {}), onSuccess: () => queryClient.invalidateQueries([key]) });

  return {
    items,
    pagination,
    isLoading,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    restore: restoreMutation.mutate,
    refetch,
  };
}