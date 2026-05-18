import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calendarApi } from '../../services/api';
import { queryKeys } from './keys';

export function useCalendarStatus() {
  return useQuery({
    queryKey: queryKeys.calendarStatus,
    queryFn: async () => {
      const res = await calendarApi.getStatus();
      return res.data as { connected: boolean };
    },
  });
}

export function useConnectCalendar() {
  return useMutation({
    mutationFn: async () => {
      const res = await calendarApi.connect();
      const url = res.data?.authUrl;
      if (!url) throw new Error('No auth URL');
      window.location.href = url;
    },
  });
}

export function useSyncSlotToCalendar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slotId: string) => calendarApi.syncSlot(slotId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}
