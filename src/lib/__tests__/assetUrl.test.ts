import { describe, expect, it, vi } from 'vitest';

vi.mock('../../config/env', () => ({
  default: {
    apiUrl: 'http://localhost:5000/api',
    isProd: false,
    isDev: true,
  },
}));

import { resolveAssetUrl } from '../assetUrl';

describe('resolveAssetUrl', () => {
  it('prefixes relative paths in development', () => {
    expect(resolveAssetUrl('/uploads/avatars/x.jpg')).toBe(
      'http://localhost:5000/uploads/avatars/x.jpg'
    );
  });

  it('returns absolute urls unchanged', () => {
    expect(resolveAssetUrl('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png');
  });

  it('returns undefined for empty', () => {
    expect(resolveAssetUrl('')).toBeUndefined();
  });
});
