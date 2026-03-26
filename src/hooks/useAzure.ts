import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as azureService from '@/api/services/azureService';
import { useAuthStore } from '@/store/useAuthStore';
import { QUERY_KEYS } from '@/constants/queryKeys';

export const useSubscriptions = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUBSCRIPTIONS],
    queryFn: azureService.getSubscriptions,
  });
};

export const useResources = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.RESOURCES],
    queryFn: async () => {
      const [resources, groups] = await Promise.all([
        azureService.getResources(),
        azureService.getResourceGroups(),
      ]);
      return [...(groups || []), ...(resources || [])];
    },
    select: (data) => (data || []).map((res: any) => {
      const isRG = !res.type || res.type.toLowerCase().includes('resourcegroups');
      return {
        ...res,
        id: res.id,
        name: res.name || res.displayName,
        type: isRG ? 'Resource Group' : res.type.split('/').pop().toLowerCase(),
        status: 'Healthy',
        location: res.location,
      };
    }),
  });
};

export const useBilling = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.BILLING],
    queryFn: azureService.getBillingDetails,
  });
};

export const useActivities = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ACTIVITIES],
    queryFn: azureService.getActivityLogs,
  });
};

export const useCreateResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, data }: { type: string; data: any }) => {
      if (type === 'apps') return azureService.createAppRegistration(data);
      return Promise.reject('Creation for this type not yet fully implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RESOURCES] });
    },
  });
};

export const useDeleteResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resourceId: string) => azureService.deleteResource(resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RESOURCES] });
    },
  });
};
