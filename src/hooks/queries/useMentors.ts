import { useQuery } from '@tanstack/react-query';
import { mentorApi, type ListParams, type Paged } from '../../services/api';
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

export interface MentorDirectoryRow {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  track?: string;
  expertise?: string[];
  mentees?: string[];
  maxMentees?: number;
  bio?: string;
  mentorshipType?: string;
  duration?: string;
  avatarUrl?: string;
}

export function useMentorDirectory(params: ListParams) {
  return useQuery({
    queryKey: ['mentors', 'directory', params],
    queryFn: async () => {
      const res = await mentorApi.getAll({ ...params, page: params.page || 1, limit: params.limit || 12 });
      return res.data as unknown as Paged<MentorDirectoryRow>;
    },
  });
}
