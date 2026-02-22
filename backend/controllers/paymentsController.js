// backend/controllers/paymentsController.js
import User from '../models/User.js';
import logger from '../config/logger.js';
import {
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  constructWebhookEvent,
} from '../utils/stripe.js';
import env from '../config/env.js';

/**
 * Create Stripe checkout session
 * POST /api/payments/create-checkout
 */
export const createCheckout = async (req, res) => {
  try {
    const { plan } = req.body; // 'pro' or 'premium'
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine price ID based on plan
    let priceId;
    if (plan === 'pro') {
      priceId = env.stripeProPriceId;
    } else if (plan === 'premium') {
      priceId = env.stripePremiumPriceId;
    } else {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    if (!priceId) {
      return res.status(500).json({ message: 'Stripe price ID not configured' });
    }

    // Create checkout session
    const session = await createCheckoutSession({
      userId: user._id,
      email: user.email,
      priceId,
      successUrl: `${env.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${env.frontendUrl}/pricing`,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    logger.error(`Create checkout error: ${error.message}`);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
};

/**
 * Create customer portal session
 * POST /api/payments/portal
 */
export const createPortal = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || !user.subscription.stripeCustomerId) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    const session = await createPortalSession({
      customerId: user.subscription.stripeCustomerId,
      returnUrl: `${env.frontendUrl}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (error) {
    logger.error(`Create portal error: ${error.message}`);
    res.status(500).json({ message: 'Failed to create portal session' });
  }
};

/**
 * Get subscription status
 * GET /api/payments/subscription
 */
export const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      plan: user.subscription.plan,
      status: user.subscription.status,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
    });
  } catch (error) {
    logger.error(`Get subscription error: ${error.message}`);
    res.status(500).json({ message: 'Failed to get subscription' });
  }
};

/**
 * Stripe webhook handler
 * POST /api/payments/webhook
 */
export const handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const event = constructWebhookEvent(req.body, signature);

  if (!event) {
    return res.status(400).json({ message: 'Webhook signature verification failed' });
  }

  logger.info(`Stripe webhook received: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        // Get subscription details
        const subscription = await getSubscription(subscriptionId);
        const plan = subscription.items.data[0].price.id === env.stripeProPriceId ? 'pro' : 'premium';

        // Update user subscription
        await User.findByIdAndUpdate(userId, {
          'subscription.plan': plan,
          'subscription.status': 'active',
          'subscription.stripeCustomerId': customerId,
          'subscription.stripeSubscriptionId': subscriptionId,
          'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        });

        logger.info(`Subscription activated for user ${userId}: ${plan}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata.userId;

        await User.findByIdAndUpdate(userId, {
          'subscription.status': subscription.status,
          'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        });

        logger.info(`Subscription updated for user ${userId}: ${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata.userId;

        await User.findByIdAndUpdate(userId, {
          'subscription.plan': 'free',
          'subscription.status': 'cancelled',
          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        });

        logger.info(`Subscription cancelled for user ${userId}`);
        break;
      }

      default:
        logger.info(`Unhandled webhook event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error(`Webhook handling error: ${error.message}`);
    res.status(500).json({ message: 'Webhook handling failed' });
  }
};
