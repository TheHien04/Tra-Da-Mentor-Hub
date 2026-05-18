import { useQuery } from '@tanstack/react-query';
import { adminApi, type AppNotification } from '../../services/api';
import { queryKeys } from './keys';

export function useAdminBroadcasts() {
  return useQuery({
    queryKey: queryKeys.adminBroadcasts,
    queryFn: async () => {
      const res = await adminApi.broadcasts();
      const body = res.data as { data?: AppNotification[] };
      return body?.data ?? [];
    },
  });
}
