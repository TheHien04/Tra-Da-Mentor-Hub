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

export default {
  mentorApi,
  menteeApi,
  groupApi,
  activitiesApi
};
