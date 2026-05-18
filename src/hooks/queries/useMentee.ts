import { useQuery } from '@tanstack/react-query';
import { menteeApi } from '../../services/api';
import { queryKeys } from './keys';

export function useMentee(id: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.mentees, id] as const,
    queryFn: async () => {
      const res = await menteeApi.getById(id!);
      return res.data as {
        _id: string;
        name: string;
        email: string;
        phone?: string;
        progress?: number;
        school?: string;
        track?: string;
        interests?: string[];
        mentorId?: string;
        mentor?: string;
        groupId?: string;
        group?: string;
        avatarUrl?: string;
      };
    },
    enabled: Boolean(id),
  });
}
