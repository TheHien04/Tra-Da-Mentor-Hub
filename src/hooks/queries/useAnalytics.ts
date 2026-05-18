import { useQuery } from '@tanstack/react-query';
import { analyticsApi, type AnalyticsPeriod } from '../../services/api';
import { queryKeys } from './keys';

export function useAnalyticsSummary(period: AnalyticsPeriod, locale: string) {
  return useQuery({
    queryKey: queryKeys.analytics(period, locale),
    queryFn: async () => {
      const res = await analyticsApi.getSummary(period, locale);
      return res.data.data;
    },
    staleTime: 60_000,
  });
}
