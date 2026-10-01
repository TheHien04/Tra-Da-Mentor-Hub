import axios from 'axios';
import env from '../config/env';
import { clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from '../lib/secureStorage';
import { handleError } from '../utils/errorHandler';
import type { AnalyticsSnapshot } from '../lib/analyticsCompute';
import type { components } from '../types/openapi';

type Schemas = components['schemas'];

export type Mentor = Schemas['Mentor'];
export type Mentee = Schemas['Mentee'];
export type Group = Schemas['Group'];
export type Slot = Schemas['Slot'];
export type SessionLog = Schemas['SessionLog'];
export type Activity = Schemas['Activity'];

/** UI contracts. Fields match the OpenAPI schemas and stay required for callers. */
export interface InviteRecord {
  token: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  status: 'active' | 'expired' | 'used';
  link: string;
}

export interface AppNotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  href?: string | null;
  read: boolean;
  createdAt: string;
}

export interface MatchSuggestion {
  mentorId: string;
  mentorName: string;
  menteeId: string;
  menteeName: string;
  score: number;
  matchedSkills: string[];
  reasons: string[];
  reasonCodes?: { code: 'skills' | 'track' | 'capacity' | 'profile'; skills?: string[] }[];
  capacity: { active: number; max: number };
}

export interface Testimonial {
  _id: string;
  menteeName: string;
  mentorName: string;
  content: string;
  rating: number;
  track: 'career' | 'personal' | 'soft_skills';
  date: string;
  status: 'PUBLISHED' | 'PENDING' | 'REJECTED';
}
export type AdminIntegrations = Schemas['AdminIntegrations'];
export type IntegrationChannelStatus = Schemas['IntegrationChannelStatus'];
export type BroadcastDelivery = Schemas['BroadcastDelivery'];

type MentorList = Mentor[] | Schemas['PagedMentors'];
type MenteeList = Mentee[] | Schemas['PagedMentees'];
type GroupList = Group[] | Schemas['PagedGroups'];

const API_URL = env.apiUrl;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise: Promise<string> | null = null;

async function refreshSession(): Promise<string> {
  const refreshToken = getRefreshToken();
  const response = await axios.post(
    `${env.apiUrl}/auth/refresh`,
    refreshToken ? { refreshToken } : {},
    { withCredentials: true }
  );
  const accessToken = response.data?.data?.accessToken as string | undefined;
  const nextRefresh = (response.data?.data?.refreshToken as string | undefined) || refreshToken || '';
  if (!accessToken) throw new Error('Refresh failed');
  setAuthTokens(accessToken, nextRefresh);
  return accessToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const url = String(original?.url || '');
    const isCredentialCall = /\/auth\/(login|refresh|register)/.test(url);
    if (error.response?.status === 401 && original && !original._retry && !isCredentialCall) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshSession().finally(() => {
            refreshPromise = null;
          });
        }
        const accessToken = await refreshPromise;
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (refreshError) {
        clearAuthTokens();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.assign('/login');
        }
        return Promise.reject(refreshError);
      }
    }
    handleError(error, false);
    return Promise.reject(error);
  }
);

// Mentor API
export interface ListParams {
  q?: string;
  page?: number;
  limit?: number;
  track?: string;
  mentorshipType?: string;
  duration?: string;
  capacity?: 'active' | 'full' | 'none';
  expertise?: string;
  applicationStatus?: string;
}

export interface Paged<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export const mentorApi = {
  getAll: (params?: ListParams) => api.get<MentorList>('/mentors', { params }),
  getById: (id: string) => api.get<Mentor>(`/mentors/${id}`),
  getMenteesByMentorId: (id: string) => api.get<Mentee[]>(`/mentors/${id}/mentees`),
  getGroupsByMentorId: (id: string) => api.get<Group[]>(`/mentors/${id}/groups`),
  create: (data: Schemas['MentorWrite']) => api.post<Mentor>('/mentors', data),
  update: (id: string, data: Schemas['MentorWrite']) => api.patch<Mentor>(`/mentors/${id}`, data),
  delete: (id: string) => api.delete(`/mentors/${id}`),
};

// Mentee API
export const menteeApi = {
  getAll: (params?: ListParams) => api.get<MenteeList>('/mentees', { params }),
  getById: (id: string) => api.get<Mentee>(`/mentees/${id}`),
  create: (data: Schemas['MenteeWrite']) => api.post<Mentee>('/mentees', data),
  update: (id: string, data: Schemas['MenteeWrite']) => api.patch<Mentee>(`/mentees/${id}`, data),
  updateApplicationStatus: (id: string, applicationStatus: string) =>
    api.patch<Mentee>(`/mentees/${id}/application-status`, { applicationStatus } satisfies Schemas['ApplicationStatusWrite']),
  delete: (id: string) => api.delete(`/mentees/${id}`),
};

// Group API
export const groupApi = {
  getAll: (params?: ListParams) => api.get<GroupList>('/groups', { params }),
  getById: (id: string) => api.get<Group>(`/groups/${id}`),
  getByIdFull: (id: string) => api.get<Group>(`/groups/${id}/full`),
  getMenteesByGroupId: (id: string) => api.get<Mentee[]>(`/groups/${id}/mentees`),
  create: (data: Schemas['GroupWrite']) => api.post<Group>('/groups', data),
  update: (id: string, data: Schemas['GroupWrite']) => api.patch<Group>(`/groups/${id}`, data),
  delete: (id: string) => api.delete(`/groups/${id}`),
  addMenteeToGroup: (groupId: string, menteeId: string) => api.post(`/groups/${groupId}/mentees/${menteeId}`),
  removeMenteeFromGroup: (groupId: string, menteeId: string) => api.delete(`/groups/${groupId}/mentees/${menteeId}`),
};

// Activities API
export const activitiesApi = {
  getAll: (limit?: number) => api.get<Activity[]>(`/activities${limit ? `?limit=${limit}` : ''}`),
  create: (data: Activity) => api.post<Activity>('/activities', data),
};

// Slots API (mentor thêm slot rảnh, mentee chọn – meetingLink: paste Google Meet)
export const slotsApi = {
  getAll: (params?: { mentorId?: string; menteeId?: string; availableOnly?: string }) =>
    api.get<Slot[]>('/slots', { params }),
  create: (data: Schemas['SlotWrite']) => api.post<Slot>('/slots', data),
  book: (slotId: string, menteeId?: string) =>
    api.patch<Slot>(`/slots/${slotId}/book`, menteeId ? { menteeId } : {}),
  cancelBooking: (slotId: string) => api.delete<Slot>(`/slots/${slotId}/booking`),
  remove: (slotId: string) => api.delete(`/slots/${slotId}`),
  update: (slotId: string, data: Schemas['SlotPatch']) => api.patch<Slot>(`/slots/${slotId}`, data),
};

// Session Logs API (CRM sau buổi mentoring)
export const sessionLogsApi = {
  getAll: (params?: { mentorId?: string; menteeId?: string }) =>
    api.get<SessionLog[]>('/session-logs', { params }),
  getNeedsSupport: () => api.get<SessionLog[]>('/session-logs/needs-support'),
  createOrUpdate: (data: Schemas['SessionLogWrite']) => api.post<SessionLog>('/session-logs', data),
};

export const invitesApi = {
  create: (data: Schemas['InviteWrite']) => api.post<InviteRecord>('/invites', data),
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
  explain: (params: { mentorId: string; menteeId: string }) =>
    api.get<Schemas['MatchExplain']>('/matching/explain', { params }),
};

export const calendarApi = {
  connect: () => api.get<Schemas['CalendarConnect']>('/calendar/connect'),
  getStatus: () => api.get<Schemas['CalendarStatus']>('/calendar/status'),
  createEvent: (data: Schemas['CalendarEventWrite']) => api.post('/calendar/create-event', data),
  syncSlot: (slotId: string) => api.post<Schemas['CalendarSyncResult']>(`/calendar/sync-slot/${slotId}`),
};

// Auth API
export const authApi = {
  login: (credentials: Schemas['LoginRequest']) => api.post<Schemas['AuthTokens']>('/auth/login', credentials),
  register: (userData: Schemas['RegisterRequest']) => api.post<Schemas['AuthTokens']>('/auth/register', userData),
  logout: () => api.post<Schemas['Ok']>('/auth/logout'),
  getProfile: () => api.get<Schemas['ProfileResponse']>('/auth/profile'),
  forgotPassword: (email: string) =>
    api.post<Schemas['Ok']>('/auth/forgot-password', { email } satisfies Schemas['EmailRequest']),
  resetPassword: (token: string, data: Schemas['ResetPasswordRequest']) =>
    api.post(`/auth/reset-password/${token}`, data),
  verifyEmail: (token: string) => api.get(`/auth/verify-email/${token}`),
};

export const paymentsApi = {
  createCheckout: (plan: string) =>
    api.post('/payments/create-checkout', { plan } satisfies Schemas['CheckoutRequest']),
};

export const testimonialsApi = {
  getAll: (params?: { status?: string; track?: string; q?: string }) =>
    api.get<Testimonial[]>('/testimonials', { params }),
  create: (data: Schemas['TestimonialWrite']) => api.post<Testimonial>('/testimonials', data),
  update: (id: string, data: Schemas['TestimonialPatch']) => api.patch<Testimonial>(`/testimonials/${id}`, data),
  delete: (id: string) => api.delete(`/testimonials/${id}`),
};

export type BroadcastChannel = NonNullable<Schemas['BroadcastRequest']['channel']>;

export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'all';

export const uploadsApi = {
  avatar: (payload: Schemas['AvatarUpload']) => api.post<Schemas['AvatarUploadResult']>('/uploads/avatar', payload),
};

export const analyticsApi = {
  getSummary: (period: AnalyticsPeriod = '90d', locale?: string) =>
    api.get<{ success: boolean; data: AnalyticsSnapshot }>('/analytics/summary', {
      params: { period, locale },
    }),
};

export const adminApi = {
  integrations: () =>
    api.get<{ success: boolean; data: AdminIntegrations }>('/admin/integrations'),
  broadcasts: () => api.get<{ success: boolean; data: AppNotification[] }>('/admin/broadcasts'),
  broadcast: (data: Schemas['BroadcastRequest']) =>
    api.post<{
      success: boolean;
      data: { delivery: BroadcastDelivery; channel: string };
    }>('/admin/broadcast', data),
};

/** Axios instance — use named APIs when possible */
export default api;
