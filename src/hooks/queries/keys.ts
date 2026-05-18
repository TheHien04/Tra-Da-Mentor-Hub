export const queryKeys = {
  mentors: ['mentors'] as const,
  mentees: ['mentees'] as const,
  slots: (params?: Record<string, string>) => ['slots', params ?? {}] as const,
  calendarStatus: ['calendar', 'status'] as const,
  matchSuggestions: (params?: Record<string, string | number>) =>
    ['matching', 'suggestions', params ?? {}] as const,
  adminIntegrations: ['admin', 'integrations'] as const,
  analytics: (period: string, locale: string) => ['analytics', 'summary', period, locale] as const,
  groups: ['groups'] as const,
  activities: (limit: number) => ['activities', limit] as const,
  testimonials: ['testimonials'] as const,
  sessionLogs: ['sessionLogs'] as const,
  invites: ['invites'] as const,
  adminBroadcasts: ['admin', 'broadcasts'] as const,
};
