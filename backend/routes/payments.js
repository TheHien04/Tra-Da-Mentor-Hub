// backend/routes/payments.js
import express from 'express';
import auth from '../middleware/auth.js';
import * as paymentsController from '../controllers/paymentsController.js';

const router = express.Router();

/**
 * @route   POST /api/payments/create-checkout
 * @desc    Create Stripe checkout session
 * @access  Private
 */
router.post('/create-checkout', auth, paymentsController.createCheckout);

/**
 * @route   POST /api/payments/portal
 * @desc    Create customer portal session
 * @access  Private
 */
router.post('/portal', auth, paymentsController.createPortal);

/**
 * @route   GET /api/payments/subscription
 * @desc    Get subscription status
 * @access  Private
 */
router.get('/subscription', auth, paymentsController.getSubscriptionStatus);

/**
 * @route   POST /api/payments/webhook
 * @desc    Stripe webhook endpoint
 * @access  Public (verified via Stripe signature)
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentsController.handleWebhook
);

export default router;
