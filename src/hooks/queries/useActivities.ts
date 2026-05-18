import { useQuery } from '@tanstack/react-query';
import { activitiesApi } from '../../services/api';
import { unwrapList } from '../../lib/apiHelpers';
import { queryKeys } from './keys';

export function useActivities(limit = 6) {
  return useQuery({
    queryKey: queryKeys.activities(limit),
    queryFn: async () =>
      unwrapList<{
        _id: string;
        type?: string;
        message?: string;
        description?: string;
        createdAt?: string;
        timestamp?: string | Date;
      }>(await activitiesApi.getAll(limit)),
  });
}
