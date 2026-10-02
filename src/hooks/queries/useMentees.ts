import { useQuery } from '@tanstack/react-query';
import { menteeApi, type ListParams, type Paged } from '../../services/api';
import { unwrapList } from '../../lib/apiHelpers';
import { queryKeys } from './keys';

export function useMentees() {
  return useQuery({
    queryKey: queryKeys.mentees,
    queryFn: async () =>
      unwrapList<{
        _id: string;
        name?: string;
        email?: string;
        school?: string;
        track?: string;
        interests?: string[];
        progress?: number;
        avatarUrl?: string;
      }>(await menteeApi.getAll()),
  });
}

export interface MenteeDirectoryRow {
  _id: string;
  name: string;
  email: string;
  school?: string;
  track?: string;
  interests?: string[];
  progress: number;
  avatarUrl?: string;
}

export function useMenteeDirectory(params: ListParams) {
  return useQuery({
    queryKey: ['mentees', 'directory', params],
    queryFn: async () => {
      const res = await menteeApi.getAll({ ...params, page: params.page || 1, limit: params.limit || 12 });
      return res.data as unknown as Paged<MenteeDirectoryRow>;
    },
  });
}
