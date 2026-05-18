import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineCreditCard } from 'react-icons/hi2';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { toast } from 'react-toastify';
import { paymentsApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { AuthPageFooter } from '../components/AuthPageFooter';
import './AuthPage.css';

const PLAN_IDS = ['free', 'pro', 'premium'] as const;
const PLAN_META: Record<
  (typeof PLAN_IDS)[number],
  { priceUsd: string; priceVnd: string; highlighted: boolean; disabled: boolean }
> = {
  free: { priceUsd: '$0', priceVnd: '0₫', highlighted: false, disabled: true },
  pro: { priceUsd: '$29', priceVnd: '699.000₫', highlighted: true, disabled: false },
  premium: { priceUsd: '$99', priceVnd: '2.399.000₫', highlighted: false, disabled: false },
};

export const PricingPage = () => {
  const { t, i18n } = useAppTranslation();
  const useVnd = i18n.language === 'vi';
  const navigate = useNavigate();
  const { state } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = useMemo(
    () =>
      PLAN_IDS.map((id) => ({
        id,
        ...PLAN_META[id],
        price: useVnd ? PLAN_META[id].priceVnd : PLAN_META[id].priceUsd,
        name: t(`pages.pricing.plans.${id}.name`),
        description: t(`pages.pricing.plans.${id}.description`),
        buttonText: t(`pages.pricing.plans.${id}.button`),
        features: t(`pages.pricing.plans.${id}.features`, { returnObjects: true }) as string[],
      })),
    [t, useVnd]
  );

  const handleSubscribe = async (planId: string) => {
    if (!state.isAuthenticated) {
      toast.info(t('pages.pricing.loginToSubscribe'));
      navigate('/login');
      return;
    }
    if (planId === 'free') return;

    setLoading(planId);
    try {
      const response = await paymentsApi.createCheckout(planId);
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t('pages.pricing.checkoutFailed'));
      setLoading(null);
    }
  };

  return (
    <div className="auth-page auth-page--pricing">
      <div className="auth-shell auth-shell-pricing">
        <header className="pricing-header">
          <div className="auth-icon mx-auto mb-4">
            <HiOutlineCreditCard className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="auth-title">{t('pages.pricing.title')}</h1>
          <p className="auth-subtitle">{t('pages.pricing.subtitle')}</p>
        </header>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`pricing-card ${plan.highlighted ? 'pricing-card--featured' : ''}`}
            >
              {plan.highlighted && (
                <span className="pricing-badge">{t('pages.pricing.mostPopular')}</span>
              )}

              <h3 className="pricing-plan-name">{plan.name}</h3>
              <div className="pricing-price">
                {plan.price}
                <span className="pricing-period"> {t('pages.pricing.perMonth')}</span>
              </div>
              <p className="pricing-desc">{plan.description}</p>

              <ul className="pricing-features">
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <span className="pricing-check" aria-hidden>
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`btn w-full ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleSubscribe(plan.id)}
                disabled={plan.disabled || loading === plan.id}
              >
                {loading === plan.id ? t('pages.pricing.processing') : plan.buttonText}
              </button>
            </article>
          ))}
        </div>

        <footer className="pricing-footer-block">
          <p>{t('pages.pricing.trialNote')}</p>
          <p>
            {t('pages.pricing.contactSales')}{' '}
            <a href="mailto:sales@tradamentor.com">{t('pages.pricing.contactSalesLink')}</a>
          </p>
          <Link to="/login" className="pricing-back">
            ← {t('auth.backToLogin')}
          </Link>
        </footer>

        <AuthPageFooter />
      </div>
    </div>
  );
};
