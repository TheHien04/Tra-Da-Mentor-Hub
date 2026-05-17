/**
 * Resolve public app URL from PaaS env (Railway, Render, Fly).
 * Lets you deploy without manually setting CORS_ORIGIN on first deploy.
 */
export function resolvePlatformPublicUrl() {
  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railwayDomain) {
    return `https://${railwayDomain.replace(/^https?:\/\//, "")}`;
  }

  const railwayStatic = process.env.RAILWAY_STATIC_URL?.trim();
  if (railwayStatic) {
    return railwayStatic.replace(/\/$/, "");
  }

  const renderUrl = process.env.RENDER_EXTERNAL_URL?.trim();
  if (renderUrl) {
    return renderUrl.replace(/\/$/, "");
  }

  const flyApp = process.env.FLY_APP_NAME?.trim();
  if (flyApp) {
    return `https://${flyApp}.fly.dev`;
  }

  return null;
}
