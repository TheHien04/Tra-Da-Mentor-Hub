// backend/utils/stripe.js
import Stripe from 'stripe';
import logger from '../config/logger.js';

// Initialize Stripe only if API key is present
let stripe = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
  logger.warn('Stripe API key not configured. Payment features will be disabled.');
}

/**
 * Check if Stripe is configured
 */
const checkStripeConfigured = () => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }
};

/**
 * Create Stripe checkout session for subscription
 */
const createCheckoutSession = async ({ userId, email, priceId, successUrl, cancelUrl }) => {
  checkStripeConfigured();
  
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId.toString(),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          userId: userId.toString(),
        },
      },
    });

    logger.info(`Stripe checkout session created: ${session.id} for user ${userId}`);
    return session;
  } catch (error) {
    logger.error(`Failed to create Stripe checkout session: ${error.message}`);
    throw error;
  }
};

/**
 * Create Stripe customer portal session
 */
const createPortalSession = async ({ customerId, returnUrl }) => {
  checkStripeConfigured();
  
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    logger.info(`Stripe portal session created for customer ${customerId}`);
    return session;
  } catch (error) {
    logger.error(`Failed to create Stripe portal session: ${error.message}`);
    throw error;
  }
};

/**
 * Get subscription details
 */
const getSubscription = async (subscriptionId) => {
  checkStripeConfigured();
  
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    logger.error(`Failed to retrieve subscription: ${error.message}`);
    throw error;
  }
};

/**
 * Cancel subscription
 */
const cancelSubscription = async (subscriptionId) => {
  checkStripeConfigured();
  
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    logger.info(`Subscription cancelled: ${subscriptionId}`);
    return subscription;
  } catch (error) {
    logger.error(`Failed to cancel subscription: ${error.message}`);
    throw error;
  }
};

/**
 * Construct webhook event from raw body
 */
const constructWebhookEvent = (payload, signature) => {
  checkStripeConfigured();
  
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    logger.warn('Stripe webhook secret not configured');
    return null;
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  } catch (error) {
    logger.error(`Webhook signature verification failed: ${error.message}`);
    return null;
  }
};

export {
  stripe,
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  cancelSubscription,
  constructWebhookEvent,
};
