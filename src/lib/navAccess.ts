export type AppRole = 'user' | 'mentor' | 'mentee' | 'admin';

const RULES: { prefix: string; roles: AppRole[] }[] = [
  { prefix: '/admin', roles: ['admin'] },
  { prefix: '/mentors/add', roles: ['admin'] },
  { prefix: '/mentees/add', roles: ['admin'] },
  { prefix: '/groups/add', roles: ['mentor', 'admin'] },
  { prefix: '/applications', roles: ['mentor', 'admin'] },
  { prefix: '/analytics', roles: ['mentor', 'admin'] },
  { prefix: '/insights', roles: ['mentor', 'admin'] },
  { prefix: '/mentees', roles: ['mentor', 'mentee', 'admin'] },
  { prefix: '/mentors', roles: ['mentor', 'mentee', 'admin'] },
  { prefix: '/groups', roles: ['mentor', 'mentee', 'admin'] },
  { prefix: '/schedule', roles: ['mentor', 'mentee', 'admin'] },
  { prefix: '/slots', roles: ['mentor', 'mentee', 'admin'] },
  { prefix: '/session-logs', roles: ['mentor', 'mentee', 'admin'] },
  { prefix: '/testimonials', roles: ['mentor', 'mentee', 'admin'] },
  { prefix: '/', roles: ['user', 'mentor', 'mentee', 'admin'] },
];

export function canAccessPath(role: string | undefined, path: string): boolean {
  const current = (role || 'user') as AppRole;
  if (current === 'admin') return true;
  const match = RULES.find((rule) =>
    rule.prefix === '/' ? path === '/' : path === rule.prefix || path.startsWith(`${rule.prefix}/`)
  );
  if (!match) return true;
  return match.roles.includes(current);
}

export function can(role: string | undefined, action: 'managePeople' | 'deleteRecords' | 'viewOps' | 'bookSlot' | 'openSlot') {
  const current = role || 'user';
  if (current === 'admin') return true;
  if (action === 'deleteRecords' || action === 'managePeople') return false;
  if (action === 'viewOps') return current === 'mentor';
  if (action === 'bookSlot') return current === 'mentee';
  if (action === 'openSlot') return current === 'mentor';
  return false;
}
