import type { components } from '../../types/openapi';

export type Schemas = components['schemas'];
export type Mentor = Schemas['Mentor'];
export type Mentee = Schemas['Mentee'];
export type Group = Schemas['Group'];
export type Slot = Schemas['Slot'];
export type SessionLog = Schemas['SessionLog'];
export type Activity = Schemas['Activity'];
export type AdminIntegrations = Schemas['AdminIntegrations'];
export type IntegrationChannelStatus = Schemas['IntegrationChannelStatus'];
export type BroadcastDelivery = Schemas['BroadcastDelivery'];

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
  factors?: { skills: number; track: number; capacity: number };
  reasonCodes?: { code: 'skills' | 'track' | 'capacity' | 'profile'; skills?: string[] }[];
  capacity: { active: number; max: number };
}

export interface Testimonial {
  _id: string;
  menteeName: string;
  mentorName: string;
  content: string;
  contentEn?: string | null;
  contentVi?: string | null;
  rating: number;
  track: 'career' | 'personal' | 'soft_skills';
  date: string;
  status: 'PUBLISHED' | 'PENDING' | 'REJECTED';
}

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
  school?: string;
  progress?: string;
  progressMin?: string;
  progressMax?: string;
  frequency?: string;
  mentorName?: string;
}

export interface Paged<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export type BroadcastChannel = NonNullable<Schemas['BroadcastRequest']['channel']>;
export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'all';
