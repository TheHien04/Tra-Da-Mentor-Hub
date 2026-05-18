import env from '../config/env';

/** Resolve relative upload paths to full URL in dev (API on another port) */
export function resolveAssetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  if (env.isProd) return path;
  const base = env.apiUrl.replace(/\/api\/?$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
