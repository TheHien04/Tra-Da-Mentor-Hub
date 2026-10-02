import { describe, expect, it } from 'vitest';
import { progressQuery } from '../directoryFilters';

describe('progressQuery', () => {
  it('skips the filter when every band is selected', () => {
    expect(
      progressQuery({ 'just-started': true, 'in-progress': true, completed: true })
    ).toBeUndefined();
  });

  it('skips the filter when nothing is selected', () => {
    expect(progressQuery({})).toBeUndefined();
  });

  it('sends only the selected bands', () => {
    expect(progressQuery({ 'just-started': true, completed: true })).toBe('just-started,completed');
  });
});
