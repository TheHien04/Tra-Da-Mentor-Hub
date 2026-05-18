import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { parseForm, zodFieldErrors } from '../zodForm';
import { addGroupFormSchema } from '../../schemas/forms';

const t = (key: string) => `tr:${key}`;

describe('parseForm', () => {
  it('returns field errors for invalid group form', () => {
    const result = parseForm(addGroupFormSchema, { name: 'ab', mentorId: '' }, t);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.name).toBeDefined();
      expect(result.errors.mentorId).toBe('tr:validation.mentorRequired');
    }
  });

  it('passes valid group form', () => {
    const result = parseForm(
      addGroupFormSchema,
      {
        name: 'Tea Mentors',
        mentorId: 'm1',
        frequency: 'Weekly',
        dayOfWeek: 'Monday',
        time: '19:00',
      },
      t
    );
    expect(result.success).toBe(true);
  });
});

describe('zodFieldErrors', () => {
  it('maps known messages to i18n keys', () => {
    const schema = z.object({ email: z.string().email('Invalid email') });
    const parsed = schema.safeParse({ email: 'bad' });
    if (parsed.success) throw new Error('expected fail');
    const errors = zodFieldErrors(parsed.error, t);
    expect(errors.email).toBe('tr:validation.emailInvalid');
  });
});
