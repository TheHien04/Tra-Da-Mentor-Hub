// src/types/models.ts
/**
 * Core domain models
 * Used in API, components, and state management
 */

// Track enum - Career tracks available
export type Track =
  | "tech"
  | "design"
  | "business"
  | "sales"
  | "marketing"
  | "hr"
  | "education"
  | "startup"
  | "social"
  | "economics";

export type MentorshipType = "GROUP" | "ONE_ON_ONE";
export type Duration = "SHORT_TERM" | "LONG_TERM" | "MEDIUM_TERM";

// ============= USER / MENTOR / MENTEE =============

export interface BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  track: Track;
  bio?: string;
}

export interface Mentor extends User {
  expertise: string[];
  maxMentees: number;
  mentees: string[]; // mentee IDs
  groups: string[]; // group IDs
  mentorshipType: MentorshipType;
  duration: Duration;
}

export interface Mentee extends User {
  school?: string;
  interests: string[];
  progress: number; // 0-100
  mentorId?: string;
  groupId?: string;
  mentorshipType: MentorshipType;
  goals?: string[];
}

// ============= GROUP =============

export interface MeetingSchedule {
  frequency: "Weekly" | "Bi-weekly" | "Monthly";
  dayOfWeek: string;
  time: string; // HH:MM format
}

export interface Group extends BaseEntity {
  name: string;
  description: string;
  topic: string;
  mentorId: string;
  mentees: string[]; // mentee IDs
  maxCapacity: number;
  meetingSchedule?: MeetingSchedule;
}

// ============= ACTIVITY FEED =============

export type ActivityType =
  | "mentor_created"
  | "mentee_created"
  | "mentor_created_group"
  | "mentee_joined_group"
  | "mentee_progress_updated"
  | "mentor_assigned"
  | "group_created";

export interface Activity extends BaseEntity {
  type: ActivityType;
  actor: {
    id: string;
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  description: string;
  timestamp: Date;
}

// ============= STATISTICS =============

export interface DashboardStats {
  totalMentors: number;
  totalMentees: number;
  totalGroups: number;
  mentorsAtCapacity: number;
  menteesCompleted: number;
  menteesInProgress: number;
  menteesJustStarted: number;
}

export interface TrendingSkill {
  skill: string;
  count: number;
  percentage: number;
}
