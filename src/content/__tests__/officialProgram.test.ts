import { describe, expect, it } from 'vitest';
import {
  OFFICIAL_APPLICATION_URL,
  OFFICIAL_SERVICES_URL,
  programContent,
} from '../officialProgram';

describe('official program catalogue', () => {
  it('keeps the four published Vietnamese programs and fees', () => {
    expect(programContent.vi.packages.map(({ id, price }) => ({ id, price }))).toEqual([
      { id: 'mentoring-8-week', price: '1.299.000₫' },
      { id: 'mentoring-4-week', price: '899.000₫' },
      { id: 'group-mentoring', price: '399.000₫' },
      { id: 'mentee-community', price: '499.000₫' },
    ]);
  });

  it('keeps locale catalogues structurally aligned', () => {
    expect(programContent.en.packages.map((program) => program.id)).toEqual(
      programContent.vi.packages.map((program) => program.id)
    );
    expect(programContent.en.process).toHaveLength(4);
    expect(programContent.vi.process).toHaveLength(4);
    expect(programContent.en.journey).toHaveLength(5);
    expect(programContent.vi.journey).toHaveLength(5);
  });

  it('links only to the canonical service page and application form', () => {
    expect(OFFICIAL_SERVICES_URL).toBe('https://www.tradamentor.com/dich-vu');
    expect(OFFICIAL_APPLICATION_URL).toBe('https://forms.gle/WNNDMoiHvf7oMGPq7');
  });
});
