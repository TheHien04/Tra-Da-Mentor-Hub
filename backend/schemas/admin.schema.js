import { z } from 'zod';

export const broadcastSchema = z.object({
  audience: z.enum(['all', 'mentors', 'mentees']).default('all'),
  subject: z.string().trim().max(160).optional(),
  message: z.string().trim().min(1).max(5000),
  channel: z.enum(['in_app', 'email', 'zalo', 'both', 'all', 'email_zalo']).default('in_app'),
});
