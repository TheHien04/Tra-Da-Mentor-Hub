import { useQuery } from '@tanstack/react-query';
import { matchingApi, type MatchSuggestion } from '../../services/api';
import { unwrapList } from '../../lib/apiHelpers';
import { queryKeys } from './keys';

export function useMatchSuggestions(params?: {
  menteeId?: string;
  mentorId?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.matchSuggestions(params as Record<string, string | number>),
    queryFn: async () => {
      const res = await matchingApi.suggestions(params);
      const data = res.data?.data ?? unwrapList<MatchSuggestion>(res);
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useMatchExplain(mentorId?: string, menteeId?: string, enabled = false) {
  return useQuery({
    queryKey: ['matching', 'explain', mentorId, menteeId],
    queryFn: async () => {
      const res = await matchingApi.explain({ mentorId: mentorId!, menteeId: menteeId! });
      return res.data.data as {
        explanation: string;
        source: 'openai' | 'rules';
        match: MatchSuggestion;
      };
    },
    enabled: Boolean(enabled && mentorId && menteeId),
  });
}

