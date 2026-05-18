import { useQuery } from '@tanstack/react-query';
import { sessionLogsApi } from '../../services/api';
import { queryKeys } from './keys';

export interface SessionLogRow {
  _id: string;
  mentorId: string;
  menteeId: string;
  sessionDate: string;
  topic: string;
  mentorScore?: number | null;
  menteeScore?: number | null;
  mentorNeedsSupport?: boolean;
  menteeNeedsSupport?: boolean;
}

export function useSessionLogs() {
  return useQuery({
    queryKey: queryKeys.sessionLogs,
    queryFn: async () => {
      const res = await sessionLogsApi.getAll();
      const data = res.data;
      return (Array.isArray(data) ? data : []) as SessionLogRow[];
    },
  });
}
