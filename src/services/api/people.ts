import api from './client';
import type { Activity, Group, ListParams, Mentee, Mentor, Schemas } from './contracts';

type MentorList = Mentor[] | Schemas['PagedMentors'];
type MenteeList = Mentee[] | Schemas['PagedMentees'];
type GroupList = Group[] | Schemas['PagedGroups'];

export const mentorApi = {
  getAll: (params?: ListParams) => api.get<MentorList>('/mentors', { params }),
  getById: (id: string) => api.get<Mentor>(`/mentors/${id}`),
  getMenteesByMentorId: (id: string) => api.get<Mentee[]>(`/mentors/${id}/mentees`),
  getGroupsByMentorId: (id: string) => api.get<Group[]>(`/mentors/${id}/groups`),
  create: (data: Schemas['MentorWrite']) => api.post<Mentor>('/mentors', data),
  update: (id: string, data: Schemas['MentorWrite']) => api.patch<Mentor>(`/mentors/${id}`, data),
  delete: (id: string) => api.delete(`/mentors/${id}`),
};

export const menteeApi = {
  getAll: (params?: ListParams) => api.get<MenteeList>('/mentees', { params }),
  getById: (id: string) => api.get<Mentee>(`/mentees/${id}`),
  create: (data: Schemas['MenteeWrite']) => api.post<Mentee>('/mentees', data),
  update: (id: string, data: Schemas['MenteeWrite']) => api.patch<Mentee>(`/mentees/${id}`, data),
  updateApplicationStatus: (
    id: string,
    applicationStatus: Schemas['ApplicationStatusWrite']['applicationStatus']
  ) =>
    api.patch<Mentee>(`/mentees/${id}/application-status`, {
      applicationStatus,
    } satisfies Schemas['ApplicationStatusWrite']),
  delete: (id: string) => api.delete(`/mentees/${id}`),
};

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

export const activitiesApi = {
  getAll: (limit?: number) => api.get<Activity[]>(`/activities${limit ? `?limit=${limit}` : ''}`),
  create: (data: Activity) => api.post<Activity>('/activities', data),
};
