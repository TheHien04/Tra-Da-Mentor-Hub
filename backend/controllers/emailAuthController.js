// backend/controllers/emailAuthController.js
/**
 * Email Authentication Controller
 * Handle email verification and password reset
 */

import User from '../models/User.js';
import logger from '../config/logger.js';
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
} from '../utils/emailService.js';

/**
 * Send email verification
 * POST /api/auth/send-verification
 */
export async function sendVerificationEmail(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified',
      });
    }

    // Generate verification token
    const token = await user.generateEmailVerificationToken();
    await user.save();

    // Send email
    await sendEmailVerification(user, token);

    logger.info(`Verification email sent to: ${user.email}`);

    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error) {
    logger.error('Send verification email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email',
    });
  }
}

/**
 * Verify email with token
 * GET /api/auth/verify-email/:token
 */
export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    // Mark as verified
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    logger.info(`Email verified for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
    });
  }
}

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent user enumeration
    if (!user) {
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      return res.json({
        success: true,
        message: 'If that email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const token = await user.generatePasswordResetToken();
    await user.save();

    // Send email
    await sendPasswordResetEmail(user, token);

    logger.info(`Password reset email sent to: ${user.email}`);

    res.json({
      success: true,
      message: 'If that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
    });
  }
}

/**
 * Reset password with token
 * POST /api/auth/reset-password/:token
 */
export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Validate passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    logger.info(`Password reset successful для user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
    });
  }
}

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
export async function resendVerification(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified',
      });
    }

    // Generate new token
    const token = await user.generateEmailVerificationToken();
    await user.save();

    // Send email
    await sendEmailVerification(user, token);

    logger.info(`Verification email resent to: ${user.email}`);

    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
    });
  }
}
