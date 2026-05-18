import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { queryKeys } from './keys';

export function useAdminIntegrations() {
  return useQuery({
    queryKey: queryKeys.adminIntegrations,
    queryFn: async () => {
      const res = await adminApi.integrations();
      return res.data.data;
    },
  });
}
