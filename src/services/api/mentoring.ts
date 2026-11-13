import api from './client';
import type {
  AppNotification,
  InviteRecord,
  MatchSuggestion,
  Schemas,
  SessionLog,
  Slot,
} from './contracts';

export const slotsApi = {
  getAll: (params?: { mentorId?: string; menteeId?: string; availableOnly?: string }) =>
    api.get<Slot[]>('/slots', { params }),
  create: (data: Schemas['SlotWrite']) => api.post<Slot>('/slots', data),
  book: (slotId: string, menteeId?: string, idempotencyKey?: string) =>
    api.patch<Slot>(`/slots/${slotId}/book`, menteeId ? { menteeId } : {}, {
      headers: {
        'Idempotency-Key': idempotencyKey || globalThis.crypto?.randomUUID?.() || `${Date.now()}-${slotId}`,
      },
    }),
  cancelBooking: (slotId: string) => api.delete<Slot>(`/slots/${slotId}/booking`),
  remove: (slotId: string) => api.delete(`/slots/${slotId}`),
  update: (slotId: string, data: Schemas['SlotPatch']) => api.patch<Slot>(`/slots/${slotId}`, data),
};

export const sessionLogsApi = {
  getAll: (params?: { mentorId?: string; menteeId?: string }) =>
    api.get<SessionLog[]>('/session-logs', { params }),
  getNeedsSupport: () => api.get<SessionLog[]>('/session-logs/needs-support'),
  createOrUpdate: (data: Schemas['SessionLogWrite']) => api.post<SessionLog>('/session-logs', data),
};

export const invitesApi = {
  create: (data: Schemas['InviteWrite'], idempotencyKey?: string) =>
    api.post<InviteRecord>('/invites', data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    }),
  list: () => api.get<{ success: boolean; data: InviteRecord[] }>('/invites'),
  revoke: (token: string) => api.delete(`/invites/${token}`),
  validate: (token: string) => api.get<InviteRecord>(`/invites/validate/${token}`),
};

export const notificationsApi = {
  list: () => api.get<{ success: boolean; data: AppNotification[] }>('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post<Schemas['Ok']>('/notifications/read-all'),
};

export const matchingApi = {
  suggestions: (params?: { menteeId?: string; mentorId?: string; limit?: number }) =>
    api.get<{ success: boolean; data: MatchSuggestion[] }>('/matching/suggestions', { params }),
  explain: (params: { mentorId: string; menteeId: string; lang?: string }) =>
    api.get<Schemas['MatchExplain']>('/matching/explain', { params }),
};

export const calendarApi = {
  connect: () => api.get<Schemas['CalendarConnect']>('/calendar/connect'),
  getStatus: () => api.get<Schemas['CalendarStatus']>('/calendar/status'),
  createEvent: (data: Schemas['CalendarEventWrite']) => api.post('/calendar/create-event', data),
  syncSlot: (slotId: string) => api.post<Schemas['CalendarSyncResult']>(`/calendar/sync-slot/${slotId}`),
};
