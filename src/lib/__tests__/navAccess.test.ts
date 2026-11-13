import { describe, expect, it } from 'vitest';
import { can, canAccessPath } from '../navAccess';

describe('navigation access policy', () => {
  it('keeps privileged pages away from unapproved users', () => {
    expect(canAccessPath('user', '/groups')).toBe(false);
    expect(canAccessPath('user', '/analytics')).toBe(false);
    expect(canAccessPath('mentor', '/admin/audit')).toBe(false);
  });

  it('allows mentor and mentee workflows without granting admin access', () => {
    expect(canAccessPath('mentor', '/analytics')).toBe(true);
    expect(canAccessPath('mentee', '/slots')).toBe(true);
    expect(canAccessPath('mentee', '/mentees')).toBe(false);
    expect(canAccessPath('mentee', '/applications')).toBe(false);
  });

  it('maps operational actions to the intended role', () => {
    expect(can('mentor', 'openSlot')).toBe(true);
    expect(can('mentor', 'bookSlot')).toBe(false);
    expect(can('mentee', 'bookSlot')).toBe(true);
    expect(can('mentee', 'managePeople')).toBe(false);
    expect(can('admin', 'deleteRecords')).toBe(true);
  });
});
