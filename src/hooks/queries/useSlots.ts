import { useQuery } from '@tanstack/react-query';
import { slotsApi } from '../../services/api';
import { unwrapList } from '../../lib/apiHelpers';
import { queryKeys } from './keys';

export interface SlotRow {
  _id: string;
  mentorId: string;
  date: string;
  time: string;
  duration: number;
  meetingLink?: string;
  bookedBy: string | null;
  menteeId?: string | null;
  googleCalendarEventId?: string | null;
}

export function useSlots(params?: { mentorId?: string }) {
  return useQuery({
    queryKey: queryKeys.slots(params),
    queryFn: async () => {
      const res = await slotsApi.getAll(params);
      const list = Array.isArray(res.data) ? res.data : unwrapList<SlotRow>(res);
      return list as SlotRow[];
    },
  });
}
