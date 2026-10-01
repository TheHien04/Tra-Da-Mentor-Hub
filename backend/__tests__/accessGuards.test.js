import { describe, it, expect } from '@jest/globals';
import { pickFields, redactMentor, redactMentee } from '../lib/profileFields.js';
import { parseSlotInput } from '../lib/slotInput.js';
import { upsertSessionLog } from '../services/sessionLogStore.js';
import { createTestimonial, listTestimonials, safeSearchPattern } from '../services/testimonialStore.js';
import { parseDataUrl } from '../controllers/uploadController.js';

describe('profile field guards', () => {
  it('drops privileged keys a client must not set', () => {
    const picked = pickFields(
      { name: 'An', userId: 'attacker', mentees: ['x'], phone: '0912345678' },
      ['name', 'phone']
    );
    expect(picked).toEqual({ name: 'An', phone: '0912345678' });
  });

  it('hides a mentor phone and user id from other people', () => {
    const row = { _id: 'm1', name: 'An', phone: '0912345678', userId: 'u1', email: 'a@example.com' };
    const hidden = redactMentor(row, { role: 'mentee', menteeId: '101' });
    expect(hidden.phone).toBeUndefined();
    expect(hidden.userId).toBeUndefined();
    expect(hidden.email).toBe('a@example.com');
    expect(redactMentor(row, { isAdmin: true }).phone).toBe('0912345678');
  });

  it('shows a mentee phone only to the assigned mentor', () => {
    const row = { _id: '101', phone: '0900000000', userId: 'u2', mentorId: 'm1' };
    expect(redactMentee(row, { role: 'mentor', mentorId: 'm1' }).phone).toBe('0900000000');
    expect(redactMentee(row, { role: 'mentor', mentorId: 'm1' }).userId).toBeUndefined();
    expect(redactMentee(row, { role: 'mentor', mentorId: 'm9' }).phone).toBeUndefined();
  });
});

describe('slot input', () => {
  it('rejects past times, bad links, and out-of-range durations', () => {
    expect(parseSlotInput({ date: '2020-01-01', time: '09:00', duration: 60 }).error).toBe('SLOT_PAST');
    expect(
      parseSlotInput({
        date: '2099-01-01',
        time: '09:00',
        duration: 60,
        meetingLink: 'javascript:alert(1)',
      }).error
    ).toBe('VALIDATION');
    expect(parseSlotInput({ date: '2099-01-01', time: '09:00', duration: 5 }).error).toBe('VALIDATION');
    expect(parseSlotInput({ date: '2099-02-31', time: '09:00', duration: 60 }).error).toBe('VALIDATION');
    const ok = parseSlotInput({
      date: '2099-01-01',
      time: '09:00',
      duration: 60,
      meetingLink: 'https://meet.google.com/abc',
    });
    expect(ok.meetingLink).toBe('https://meet.google.com/abc');
  });
});

describe('session log writes', () => {
  it('does not wipe the other side when only one role updates', async () => {
    const first = await upsertSessionLog({
      mentorId: 'm-guard',
      menteeId: 'e-guard',
      sessionDate: '2020-01-02',
      topic: 'Intro',
      mentorScore: 4,
      menteeScore: 5,
      menteeNeedsSupport: true,
      completedByMentee: true,
    });
    expect(first.created).toBe(true);
    const second = await upsertSessionLog({
      mentorId: 'm-guard',
      menteeId: 'e-guard',
      sessionDate: '2020-01-02',
      topic: 'Intro revised',
      mentorScore: 9,
    });
    expect(second.created).toBe(false);
    expect(second.log.mentorScore).toBe(5);
    expect(second.log.menteeScore).toBe(5);
    expect(second.log.menteeNeedsSupport).toBe(true);
    expect(second.log.completedByMentee).toBe(true);
  });
});

describe('testimonials and uploads', () => {
  it('escapes search text and clamps a rating', async () => {
    const created = await createTestimonial({
      menteeName: 'Lan',
      mentorName: 'An',
      content: 'Useful',
      rating: 99,
      status: 'PUBLISHED',
    });
    expect(created.rating).toBe(5);
    await expect(listTestimonials({ q: '(', status: 'PUBLISHED' })).resolves.toEqual(expect.any(Array));
    expect(() => safeSearchPattern('('.repeat(40))).not.toThrow();
    expect(safeSearchPattern('(').test('(')).toBe(true);
  });

  it('rejects an image whose bytes do not match the declared type', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    const good = parseDataUrl(`data:image/png;base64,${png.toString('base64')}`);
    expect(good.ext).toBe('.png');
    const fake = parseDataUrl(`data:image/png;base64,${Buffer.from('not-a-real-png').toString('base64')}`);
    expect(fake).toBeNull();
  });
});
