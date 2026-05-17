import type { AuthUser } from '../types/auth';

export function getUserId(user: AuthUser | null | undefined): string | undefined {
  return user?._id;
}

/** Mentee document id for slot booking / session logs */
export function getMenteeProfileId(user: AuthUser | null | undefined): string | undefined {
  return user?.menteeId;
}

export function normalizeAuthUser(raw: Record<string, unknown>): AuthUser {
  const _id = String(raw._id ?? raw.id ?? '');
  const menteeData = raw.menteeData as { _id?: string } | undefined;
  const mentorData = raw.mentorData as { _id?: string } | undefined;
  return {
    _id,
    email: String(raw.email ?? ''),
    name: String(raw.name ?? ''),
    role: (raw.role as AuthUser['role']) || 'user',
    avatar: raw.avatar as string | undefined,
    menteeId: (raw.menteeId as string) || menteeData?._id,
    mentorId: (raw.mentorId as string) || mentorData?._id,
  };
}
