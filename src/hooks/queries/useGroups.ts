import { useQuery } from '@tanstack/react-query';
import { groupApi } from '../../services/api';
import { unwrapList } from '../../lib/apiHelpers';
import { queryKeys } from './keys';

export function useGroups() {
  return useQuery({
    queryKey: queryKeys.groups,
    queryFn: async () => unwrapList<{ _id: string; name?: string }>(await groupApi.getAll()),
  });
}
