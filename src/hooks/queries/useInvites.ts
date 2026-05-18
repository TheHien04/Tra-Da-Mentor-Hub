import { useQuery } from '@tanstack/react-query';
import { invitesApi, type InviteRecord } from '../../services/api';
import { queryKeys } from './keys';

export function useInvites() {
  return useQuery({
    queryKey: queryKeys.invites,
    queryFn: async () => {
      const res = await invitesApi.list();
      const body = res.data as { data?: InviteRecord[] };
      return body?.data ?? [];
    },
  });
}
