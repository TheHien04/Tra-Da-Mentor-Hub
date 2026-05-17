import crypto from 'crypto';
import User from '../models/User.js';
import env from '../config/env.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { ensureCrmProfileForUser } from '../services/crmProfileSync.js';
import { verifyOAuthState } from '../lib/oauthState.js';
import logger from '../config/logger.js';

const FRONTEND_URL = env.frontendUrl;

function getRedirectUri() {
  return `${env.baseUrl}/api/auth/google/callback`;
}

async function exchangeCodeForTokens(code) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      redirect_uri: getRedirectUri(),
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google token exchange failed: ${err}`);
  }
  return res.json();
}

async function fetchGoogleUser(accessToken) {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch Google user profile');
  return res.json();
}

export async function handleGoogleCallback(req, res) {
  try {
    const { code, state } = req.query;
    if (!verifyOAuthState(state)) {
      logger.warn('Google OAuth CSRF state mismatch');
      return res.redirect(`${FRONTEND_URL}/login?error=google_csrf`);
    }
    if (!code) {
      return res.redirect(`${FRONTEND_URL}/login?error=google_no_code`);
    }

    const tokens = await exchangeCodeForTokens(code);
    const googleUser = await fetchGoogleUser(tokens.access_token);
    const email = googleUser.email?.toLowerCase().trim();
    if (!email) {
      return res.redirect(`${FRONTEND_URL}/login?error=google_no_email`);
    }

    let user = await User.findOne({ email });
    if (!user && googleUser.id) {
      user = await User.findOne({ googleId: googleUser.id });
    }

    if (!user) {
      const role = 'user';
      user = await User.create({
        email,
        name: googleUser.name || email.split('@')[0],
        password: crypto.randomBytes(32).toString('hex'),
        role,
        googleId: googleUser.id,
        emailVerified: Boolean(googleUser.verified_email),
        avatar: googleUser.picture || null,
      });
    } else {
      if (!user.googleId && googleUser.id) user.googleId = googleUser.id;
      if (googleUser.picture && !user.avatar) user.avatar = googleUser.picture;
      user.emailVerified = user.emailVerified || Boolean(googleUser.verified_email);
      await user.save();
    }

    const crmIds = await ensureCrmProfileForUser({
      email: user.email,
      name: user.name,
      role: user.role,
      userId: user._id.toString(),
    });

    const accessToken = generateAccessToken(user._id, user.email, user.role);
    const refreshToken = generateRefreshToken(user._id);
    await user.addRefreshToken(refreshToken);
    await user.updateLastLogin();

    const userPayload = {
      ...user.toJSON(),
      ...crmIds,
    };

    const params = new URLSearchParams({
      accessToken,
      refreshToken,
      user: JSON.stringify(userPayload),
    });

    logger.info(`Google SSO login: ${email}`);
    return res.redirect(`${FRONTEND_URL}/auth/callback?${params.toString()}`);
  } catch (error) {
    logger.error('Google callback error:', error);
    return res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
  }
}
