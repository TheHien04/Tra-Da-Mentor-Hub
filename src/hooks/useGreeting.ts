import { useMemo } from 'react';
import { useAppTranslation } from './useAppTranslation';

export function useGreeting() {
  const { t } = useAppTranslation();

  return useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greetingMorning');
    if (hour < 18) return t('dashboard.greetingAfternoon');
    return t('dashboard.greetingEvening');
  }, [t]);
}
