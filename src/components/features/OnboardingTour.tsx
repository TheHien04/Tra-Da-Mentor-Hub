import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HiOutlineXMark, HiOutlineArrowRight } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useAppTranslation } from '../../hooks/useAppTranslation';

type Role = 'admin' | 'mentor' | 'mentee' | 'user';

function storageKey(role: string) {
  return `tdm-onboarding-${role}-v1`;
}

export function OnboardingTour() {
  const { t } = useAppTranslation();
  const { state } = useAuth();
  const location = useLocation();
  const role = (state.user?.role || 'user') as Role;
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  const steps = useMemo(() => {
    const base = [
      { title: t('onboarding.step1Title'), body: t('onboarding.step1Body') },
    ];
    if (role === 'admin' || role === 'mentor') {
      base.push({ title: t('onboarding.stepMentorTitle'), body: t('onboarding.stepMentorBody') });
    }
    if (role === 'mentee' || role === 'admin') {
      base.push({ title: t('onboarding.stepMenteeTitle'), body: t('onboarding.stepMenteeBody') });
    }
    base.push(
      { title: t('onboarding.stepAnalyticsTitle'), body: t('onboarding.stepAnalyticsBody') },
      { title: t('onboarding.stepDoneTitle'), body: t('onboarding.stepDoneBody') }
    );
    return base;
  }, [role, t]);

  useEffect(() => {
    if (!state.isAuthenticated || location.pathname === '/login') return;
    if (localStorage.getItem(storageKey(role)) === 'done') return;
    const timer = window.setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, [state.isAuthenticated, role, location.pathname]);

  if (!visible || !state.isAuthenticated) return null;

  const current = steps[step];
  const isLast = step >= steps.length - 1;

  const finish = () => {
    localStorage.setItem(storageKey(role), 'done');
    setVisible(false);
  };

  return (
    <div className="onboarding-tour" role="dialog" aria-labelledby="onboarding-title">
      <div className="onboarding-tour__card">
        <button type="button" className="onboarding-tour__close" aria-label={t('common.close')} onClick={finish}>
          <HiOutlineXMark className="h-5 w-5" />
        </button>
        <p className="text-xs font-medium text-muted mb-1">
          {t('onboarding.progress', { current: step + 1, total: steps.length })}
        </p>
        <h2 id="onboarding-title" className="text-lg font-semibold text-primary mb-2">
          {current.title}
        </h2>
        <p className="text-sm text-secondary mb-5">{current.body}</p>
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn btn-secondary" onClick={finish}>
            {t('onboarding.skip')}
          </button>
          {isLast ? (
            <button type="button" className="btn btn-primary" onClick={finish}>
              {t('onboarding.finish')}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary inline-flex items-center gap-1"
              onClick={() => setStep((s) => s + 1)}
            >
              {t('onboarding.next')}
              <HiOutlineArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
