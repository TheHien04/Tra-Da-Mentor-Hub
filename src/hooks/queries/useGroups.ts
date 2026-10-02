import { useQuery } from '@tanstack/react-query';
import { groupApi, type ListParams, type Paged } from '../../services/api';
import { unwrapList } from '../../lib/apiHelpers';
import { queryKeys } from './keys';

export function useGroups() {
  return useQuery({
    queryKey: queryKeys.groups,
    queryFn: async () => unwrapList<{ _id: string; name?: string }>(await groupApi.getAll()),
  });
}

export function useGroupDirectory(params: ListParams) {
  return useQuery({
    queryKey: ['groups', 'directory', params],
    queryFn: async () => {
      const res = await groupApi.getAll({ ...params, page: params.page || 1, limit: params.limit || 12 });
      return res.data as unknown as Paged<{
        _id: string;
        name: string;
        description?: string;
        mentor?: { name: string };
        mentees?: string[];
        maxSize?: number;
        frequency?: string;
        dayOfWeek?: string;
        time?: string;
        meetingSchedule?: { frequency: string; dayOfWeek: string; time: string };
      }>;
    },
  });
}
