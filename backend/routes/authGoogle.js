import express from 'express';
import env from '../config/env.js';
import { createOAuthState } from '../lib/oauthState.js';
import { handleGoogleCallback } from '../controllers/googleAuthController.js';

const router = express.Router();

router.get('/google', (req, res) => {
  if (!env.googleClientId || !env.googleClientSecret) {
    return res.status(501).json({
      success: false,
      message: 'Google SSO is not configured.',
    });
  }

  const baseUrl = env.baseUrl;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  const state = createOAuthState();
  const scope = 'email profile';
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', env.googleClientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scope);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('state', state);
  res.redirect(url.toString());
});

router.get('/google/callback', handleGoogleCallback);

export default router;
