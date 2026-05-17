import axios from 'axios';
import env from '../config/env';
import { getAccessToken } from '../lib/secureStorage';
import { handleError } from '../utils/errorHandler';

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

// Add error interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Use centralized error handler
    handleError(error, false); // Don't show toast here, let components decide
    return Promise.reject(error);
  }
);

// Mentor API
export const mentorApi = {
  getAll: () => api.get('/mentors'),
  getById: (id: string) => api.get(`/mentors/${id}`),
  getMenteesByMentorId: (id: string) => api.get(`/mentors/${id}/mentees`),
  getGroupsByMentorId: (id: string) => api.get(`/mentors/${id}/groups`),
  create: (data: Record<string, unknown>) => api.post('/mentors', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/mentors/${id}`, data),
  delete: (id: string) => api.delete(`/mentors/${id}`)
};

// Mentee API
export const menteeApi = {
  getAll: () => api.get('/mentees'),
  getById: (id: string) => api.get(`/mentees/${id}`),
  create: (data: Record<string, unknown>) => api.post('/mentees', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/mentees/${id}`, data),
  updateApplicationStatus: (id: string, applicationStatus: string) =>
    api.patch(`/mentees/${id}/application-status`, { applicationStatus }),
  delete: (id: string) => api.delete(`/mentees/${id}`)
};

// Group API
export const groupApi = {
  getAll: () => api.get('/groups'),
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
  book: (slotId: string, menteeId: string) =>
    api.patch(`/slots/${slotId}/book`, { menteeId }),
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
export const invitesApi = {
  create: (data: { email: string; role?: string }) => api.post('/invites', data),
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
  list: (userId?: string) => api.get('/notifications', { params: { userId } }),
  markRead: (id: string, userId?: string) =>
    api.patch(`/notifications/${id}/read`, { userId }),
  markAllRead: (userId?: string) => api.post('/notifications/read-all', { userId }),
};

export const matchingApi = {
  suggestions: (params?: { menteeId?: string; mentorId?: string; limit?: number }) =>
    api.get('/matching/suggestions', { params }),
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

export const adminApi = {
  broadcast: (data: {
    audience: 'all' | 'mentors' | 'mentees';
    subject?: string;
    message: string;
    channel?: 'email' | 'zalo' | 'both';
  }) => api.post('/admin/broadcast', data),
};

/** Axios instance — use named APIs when possible */
export default api;
