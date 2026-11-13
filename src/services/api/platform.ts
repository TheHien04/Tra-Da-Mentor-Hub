import type { AnalyticsSnapshot } from '../../lib/analyticsCompute';
import api from './client';
import type {
  AdminIntegrations,
  AnalyticsPeriod,
  AppNotification,
  BroadcastDelivery,
  Schemas,
  Testimonial,
} from './contracts';

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
  changePassword: (data: { currentPassword: string; password: string; confirmPassword: string }) =>
    api.post<{ success: boolean }>('/auth/change-password', data),
  exportAccount: () => api.get<{ success: boolean; data: Record<string, unknown> }>('/auth/export'),
  deleteAccount: (password: string) => api.delete<{ success: boolean }>('/auth/account', { data: { password } }),
};

export const testimonialsApi = {
  getAll: (params?: { status?: string; track?: string; q?: string }) =>
    api.get<Testimonial[]>('/testimonials', { params }),
  create: (data: Schemas['TestimonialWrite']) => api.post<Testimonial>('/testimonials', data),
  update: (id: string, data: Schemas['TestimonialPatch']) => api.patch<Testimonial>(`/testimonials/${id}`, data),
  delete: (id: string) => api.delete(`/testimonials/${id}`),
};

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
  integrations: () => api.get<{ success: boolean; data: AdminIntegrations }>('/admin/integrations'),
  broadcasts: () => api.get<{ success: boolean; data: AppNotification[] }>('/admin/broadcasts'),
  broadcast: (data: Schemas['BroadcastRequest'], idempotencyKey?: string) =>
    api.post<{
      success: boolean;
      data: { delivery: BroadcastDelivery; channel: string };
    }>('/admin/broadcast', data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    }),
  audit: () =>
    api.get<{
      success: boolean;
      data: {
        _id: string;
        at: string;
        action: string;
        entity: string;
        entityId: string | null;
        actorRole: string | null;
        summary?: string | null;
      }[];
    }>('/admin/audit'),
};
