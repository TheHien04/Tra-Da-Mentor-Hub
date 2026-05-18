import { useQuery } from '@tanstack/react-query';
import { mentorApi } from '../../services/api';
import { unwrapList } from '../../lib/apiHelpers';
import { queryKeys } from './keys';

export function useMentors() {
  return useQuery({
    queryKey: queryKeys.mentors,
    queryFn: async () =>
      unwrapList<{
        _id: string;
        name?: string;
        email?: string;
        track?: string;
        expertise?: string[];
        mentees?: string[];
        maxMentees?: number;
        avatarUrl?: string;
      }>(await mentorApi.getAll()),
  });
}
