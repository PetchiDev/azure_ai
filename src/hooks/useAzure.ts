import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as azureService from '../features/resources/services/azureService';
import { useAuthStore } from '../store/useStore';

const QUERY_KEYS = {
  RESOURCES: 'azure_resources',
  BILLING: 'azure_billing',
  ACTIVITIES: 'azure_activities',
  SUBSCRIPTIONS: 'azure_subscriptions',
};

export const useSubscriptions = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUBSCRIPTIONS],
    queryFn: azureService.getSubscriptions,
  });
};

export const useResources = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.RESOURCES],
    queryFn: azureService.getResources,
    select: (data) => (data || []).map((res: any) => ({
      ...res,
      id: res.id,
      name: res.name || res.displayName,
      type: res.type.split('/').pop().toLowerCase(),
      status: 'Healthy', // Real status would require individual GETs
      location: res.location,
    })),
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
      // For blobs/functions, we'd need more specific service calls
      return Promise.reject('Creation for this type not yet fully implemented for real API');
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
