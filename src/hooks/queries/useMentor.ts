import { useQuery } from '@tanstack/react-query';
import { mentorApi } from '../../services/api';
import { queryKeys } from './keys';

export function useMentor(id: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.mentors, id] as const,
    queryFn: async () => {
      const res = await mentorApi.getById(id!);
      return res.data as {
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
      };
    },
    enabled: Boolean(id),
  });
}
