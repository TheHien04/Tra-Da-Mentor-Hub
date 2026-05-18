import { useQuery } from '@tanstack/react-query';
import { menteeApi } from '../../services/api';
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
