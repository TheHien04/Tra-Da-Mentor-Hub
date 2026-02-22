// src/pages/PricingPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './PricingPage.css';

export const PricingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        'Up to 3 mentees',
        'Basic scheduling',
        'Email notifications',
        'Community support',
      ],
      highlighted: false,
      buttonText: 'Current Plan',
      disabled: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For growing mentorship programs',
      features: [
        'Unlimited mentees',
        'Advanced scheduling',
        'Google Calendar integration',
        'Analytics dashboard',
        'Priority support',
        'Custom branding',
      ],
      highlighted: true,
      buttonText: 'Upgrade to Pro',
      disabled: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$99',
      period: '/month',
      description: 'For enterprise-level programs',
      features: [
        'Everything in Pro',
        'White-label solution',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
        'Advanced security',
      ],
      highlighted: false,
      buttonText: 'Upgrade to Premium',
      disabled: false,
    },
  ];

  const handleSubscribe = async (planId: string) => {
    if (!state.isAuthenticated) {
      toast.info('Please login to subscribe');
      navigate('/login');
      return;
    }

    if (planId === 'free') return;

    setLoading(planId);

    try {
      const response = await api.post('/payments/create-checkout', { plan: planId });
      
      // Redirect to Stripe Checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create checkout session');
      setLoading(null);
    }
  };

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1>Choose Your Plan</h1>
        <p>Flexible pricing to match your mentorship program needs</p>
      </div>

      <div className="pricing-cards">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}
          >
            {plan.highlighted && <div className="badge">Most Popular</div>}
            
            <div className="plan-header">
              <h3>{plan.name}</h3>
              <div className="price">
                {plan.price}
                <span className="period">{plan.period}</span>
              </div>
              <p className="description">{plan.description}</p>
            </div>

            <ul className="features-list">
              {plan.features.map((feature, index) => (
                <li key={index}>
                  <span className="checkmark">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`btn ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleSubscribe(plan.id)}
              disabled={plan.disabled || loading === plan.id}
            >
              {loading === plan.id ? 'Processing...' : plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="pricing-footer">
        <p>All plans include a 14-day free trial. No credit card required.</p>
        <p>Need a custom plan? <a href="mailto:sales@mentor-platform.com">Contact Sales</a></p>
      </div>
    </div>
  );
};
