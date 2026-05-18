export type TrackId =
  | 'tech'
  | 'economics'
  | 'marketing'
  | 'hr'
  | 'sales'
  | 'social'
  | 'business'
  | 'education'
  | 'startup'
  | 'design';

export const TRACK_IDS: TrackId[] = [
  'tech',
  'economics',
  'marketing',
  'hr',
  'sales',
  'social',
  'business',
  'education',
  'startup',
  'design',
];

export function normalizeTrack(track?: string): TrackId {
  if (track && TRACK_IDS.includes(track as TrackId)) return track as TrackId;
  return 'tech';
}

export function trackLabel(track?: string): string {
  const labels: Record<TrackId, string> = {
    tech: 'Technology',
    economics: 'Economics',
    marketing: 'Marketing',
    hr: 'Human Resources',
    sales: 'Sales',
    social: 'Social Studies',
    business: 'Business',
    education: 'Education',
    startup: 'Startup',
    design: 'Design',
  };
  return labels[normalizeTrack(track)];
}

/** Stable avatar tone when track is unknown (0–7). */
export function avatarToneFromName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 8;
}

export function avatarClassName(name: string, track?: string): string {
  if (track && TRACK_IDS.includes(track as TrackId)) {
    return `avatar--track-${track}`;
  }
  return `avatar--tone-${avatarToneFromName(name)}`;
}

export function trackPillClassName(track?: string, size: 'sm' | 'md' | 'lg' = 'md'): string {
  const id = normalizeTrack(track);
  return `track-pill track-pill--${id} track-pill--${size}`;
}
