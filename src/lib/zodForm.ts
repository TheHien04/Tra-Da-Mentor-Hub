import type { ZodError, ZodSchema } from 'zod';

type TFn = (key: string, options?: Record<string, unknown>) => string;

const ZOD_KEY_MAP: Record<string, string> = {
  'Name required': 'validation.nameRequired',
  'Name must be at least 3 characters': 'validation.nameMin',
  'Invalid email': 'validation.emailInvalid',
  'Email is required': 'validation.emailRequired',
  'At least one expertise required': 'validation.expertiseRequired',
  'Phone needs at least 10 digits': 'validation.phoneInvalid',
  'Min 1 mentee slot': 'validation.maxMenteesMin',
  'School is required': 'validation.schoolRequired',
  '0–100 only': 'validation.progressRange',
  'Description must be at least 10 characters': 'validation.descriptionMin',
  'Select a mentor': 'validation.mentorRequired',
};

export function zodFieldErrors(error: ZodError, t: TFn): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field !== 'string') continue;
    const msg = issue.message;
    const key = ZOD_KEY_MAP[msg];
    out[field] = key ? t(key) : msg;
  }
  return out;
}

export function parseForm<T>(
  schema: ZodSchema<T>,
  data: unknown,
  t: TFn
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  return { success: false, errors: zodFieldErrors(result.error, t) };
}
