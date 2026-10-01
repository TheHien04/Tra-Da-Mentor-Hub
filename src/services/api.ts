import axios from 'axios';
import env from '../config/env';
import { clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from '../lib/secureStorage';
import { handleError } from '../utils/errorHandler';
import type { AnalyticsSnapshot } from '../lib/analyticsCompute';

const API_URL = env.apiUrl;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
  if (!refreshToken) throw new Error('No refresh token');
  const response = await axios.post(`${env.apiUrl}/auth/refresh`, { refreshToken });
  const accessToken = response.data?.data?.accessToken as string | undefined;
  const nextRefresh = (response.data?.data?.refreshToken as string | undefined) || refreshToken;
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
  getAll: (params?: ListParams) => api.get<Paged<Record<string, unknown>> | Record<string, unknown>[]>('/mentors', { params }),
  getById: (id: string) => api.get(`/mentors/${id}`),
  getMenteesByMentorId: (id: string) => api.get(`/mentors/${id}/mentees`),
  getGroupsByMentorId: (id: string) => api.get(`/mentors/${id}/groups`),
  create: (data: Record<string, unknown>) => api.post('/mentors', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/mentors/${id}`, data),
  delete: (id: string) => api.delete(`/mentors/${id}`)
};

// Mentee API
export const menteeApi = {
  getAll: (params?: ListParams) => api.get('/mentees', { params }),
  getById: (id: string) => api.get(`/mentees/${id}`),
  create: (data: Record<string, unknown>) => api.post('/mentees', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/mentees/${id}`, data),
  updateApplicationStatus: (id: string, applicationStatus: string) =>
    api.patch(`/mentees/${id}/application-status`, { applicationStatus }),
  delete: (id: string) => api.delete(`/mentees/${id}`)
};

// Group API
export const groupApi = {
  getAll: (params?: ListParams) => api.get('/groups', { params }),
  getById: (id: string) => api.get(`/groups/${id}`),
  getByIdFull: (id: string) => api.get(`/groups/${id}/full`),
  getMenteesByGroupId: (id: string) => api.get(`/groups/${id}/mentees`),
  create: (data: Record<string, unknown>) => api.post('/groups', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/groups/${id}`, data),
  delete: (id: string) => api.delete(`/groups/${id}`),
  addMenteeToGroup: (groupId: string, menteeId: string) => api.post(`/groups/${groupId}/mentees/${menteeId}`),
  removeMenteeFromGroup: (groupId: string, menteeId: string) => api.delete(`/groups/${groupId}/mentees/${menteeId}`)
};

// Activities API
export const activitiesApi = {
  getAll: (limit?: number) => api.get(`/activities${limit ? `?limit=${limit}` : ''}`),
  create: (data: Record<string, unknown>) => api.post('/activities', data)
};

// Slots API (mentor thêm slot rảnh, mentee chọn – meetingLink: paste Google Meet)
export const slotsApi = {
  getAll: (params?: { mentorId?: string; menteeId?: string; availableOnly?: string }) =>
    api.get('/slots', { params }),
  create: (data: { mentorId: string; date: string; time: string; duration: number; meetingLink?: string }) =>
    api.post('/slots', data),
  book: (slotId: string, menteeId?: string) =>
    api.patch(`/slots/${slotId}/book`, menteeId ? { menteeId } : {}),
  cancelBooking: (slotId: string) => api.delete(`/slots/${slotId}/booking`),
  remove: (slotId: string) => api.delete(`/slots/${slotId}`),
  update: (slotId: string, data: { date?: string; time?: string; duration?: number; meetingLink?: string }) =>
    api.patch(`/slots/${slotId}`, data),
};

// Session Logs API (CRM sau buổi mentoring)
export const sessionLogsApi = {
  getAll: (params?: { mentorId?: string; menteeId?: string }) =>
    api.get('/session-logs', { params }),
  getNeedsSupport: () => api.get('/session-logs/needs-support'),
  createOrUpdate: (data: {
    mentorId: string;
    menteeId: string;
    sessionDate: string;
    topic: string;
    mentorScore?: number;
    menteeScore?: number;
    mentorNeedsSupport?: boolean;
    mentorSupportReason?: string;
    menteeNeedsSupport?: boolean;
    menteeSupportReason?: string;
    completedByMentor?: boolean;
    completedByMentee?: boolean;
  }) => api.post('/session-logs', data)
};

// Invites API (admin mời user – trả link; gửi email thật cần SMTP)
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

export const invitesApi = {
  create: (data: { email: string; role?: string }) =>
    api.post<{ success: boolean; link: string; token: string } & InviteRecord>('/invites', data),
  list: () => api.get<{ success: boolean; data: InviteRecord[] }>('/invites'),
  revoke: (token: string) => api.delete(`/invites/${token}`),
  validate: (token: string) => api.get(`/invites/validate/${token}`),
};

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
  capacity: { active: number; max: number };
}

export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

export const matchingApi = {
  suggestions: (params?: { menteeId?: string; mentorId?: string; limit?: number }) =>
    api.get('/matching/suggestions', { params }),
  explain: (params: { mentorId: string; menteeId: string }) =>
    api.get('/matching/explain', { params }),
};

export const calendarApi = {
  connect: () => api.get<{ authUrl: string }>('/calendar/connect'),
  getStatus: () => api.get<{ connected: boolean }>('/calendar/status'),
  createEvent: (data: Record<string, unknown>) => api.post('/calendar/create-event', data),
  syncSlot: (slotId: string) =>
    api.post<{
      success?: boolean;
      meetLink?: string;
      htmlLink?: string;
      alreadySynced?: boolean;
      slot?: Record<string, unknown>;
    }>(`/calendar/sync-slot/${slotId}`),
};

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, data: { password: string; confirmPassword: string }) =>
    api.post(`/auth/reset-password/${token}`, data),
  verifyEmail: (token: string) => api.get(`/auth/verify-email/${token}`),
};

export const paymentsApi = {
  createCheckout: (plan: string) => api.post('/payments/create-checkout', { plan }),
};

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

export const testimonialsApi = {
  getAll: (params?: { status?: string; track?: string; q?: string }) =>
    api.get('/testimonials', { params }),
  create: (data: Omit<Testimonial, '_id' | 'status' | 'date'> & { status?: Testimonial['status'] }) =>
    api.post('/testimonials', data),
  update: (id: string, data: Partial<Pick<Testimonial, 'status' | 'rating' | 'content' | 'track'>>) =>
    api.patch(`/testimonials/${id}`, data),
  delete: (id: string) => api.delete(`/testimonials/${id}`),
};

export type IntegrationChannelStatus = {
  ready: boolean;
  envVars: string[];
  needsRecipients?: boolean;
};

export interface AdminIntegrations {
  inApp: boolean;
  email: boolean;
  zalo: boolean;
  zaloToken?: boolean;
  zaloRecipients: number;
  googleCalendar: boolean;
  openai: boolean;
  stripe: boolean;
  channels?: {
    inApp: IntegrationChannelStatus;
    email: IntegrationChannelStatus;
    zalo: IntegrationChannelStatus;
  };
}

export type BroadcastChannel = 'in_app' | 'email' | 'zalo' | 'email_zalo' | 'both';

export interface BroadcastDelivery {
  inApp: boolean;
  email?: { success: boolean; sent?: number; message?: string } | null;
  zalo?: { success: boolean; sent?: number; message?: string } | null;
}

export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'all';

export const uploadsApi = {
  avatar: (payload: { entityType: 'mentor' | 'mentee'; entityId: string; dataUrl: string }) =>
    api.post<{ success: boolean; data: { avatarUrl: string } }>('/uploads/avatar', payload),
};

export const analyticsApi = {
  getSummary: (period: AnalyticsPeriod = '90d', locale?: string) =>
    api.get<{ success: boolean; data: AnalyticsSnapshot }>('/analytics/summary', {
      params: { period, locale },
    }),
};

export const adminApi = {
  integrations: () => api.get<{ success: boolean; data: AdminIntegrations }>('/admin/integrations'),
  broadcasts: () => api.get<{ success: boolean; data: AppNotification[] }>('/admin/broadcasts'),
  broadcast: (data: {
    audience: 'all' | 'mentors' | 'mentees';
    subject?: string;
    message: string;
    channel?: BroadcastChannel;
  }) =>
    api.post<{
      success: boolean;
      data: { delivery: BroadcastDelivery; channel: string };
    }>('/admin/broadcast', data),
};

/** Axios instance — use named APIs when possible */
export default api;
