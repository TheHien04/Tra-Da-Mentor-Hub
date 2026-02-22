import axios from 'axios';
import { handleError } from '../utils/errorHandler';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    const token = localStorage.getItem('accessToken');
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
  create: (data: any) => api.post('/mentors', data),
  update: (id: string, data: any) => api.patch(`/mentors/${id}`, data),
  delete: (id: string) => api.delete(`/mentors/${id}`)
};

// Mentee API
export const menteeApi = {
  getAll: () => api.get('/mentees'),
  getById: (id: string) => api.get(`/mentees/${id}`),
  create: (data: any) => api.post('/mentees', data),
  update: (id: string, data: any) => api.patch(`/mentees/${id}`, data),
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
  create: (data: any) => api.post('/groups', data),
  update: (id: string, data: any) => api.patch(`/groups/${id}`, data),
  delete: (id: string) => api.delete(`/groups/${id}`),
  addMenteeToGroup: (groupId: string, menteeId: string) => api.post(`/groups/${groupId}/mentees/${menteeId}`),
  removeMenteeFromGroup: (groupId: string, menteeId: string) => api.delete(`/groups/${groupId}/mentees/${menteeId}`)
};

// Activities API
export const activitiesApi = {
  getAll: (limit?: number) => api.get(`/activities${limit ? `?limit=${limit}` : ''}`),
  create: (data: any) => api.post('/activities', data)
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

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  register: (userData: { name: string; email: string; password: string; role?: string }) => 
    api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile')
};

export default {
  mentorApi,
  menteeApi,
  groupApi,
  activitiesApi,
  authApi
};
