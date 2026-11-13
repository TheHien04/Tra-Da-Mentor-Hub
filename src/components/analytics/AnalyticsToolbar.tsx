import { HiOutlineArrowDownTray, HiOutlineArrowPath } from 'react-icons/hi2';
import type { AnalyticsPeriod } from '../../lib/analyticsCompute';
import { useAppTranslation } from '../../hooks/useAppTranslation';

const periods: AnalyticsPeriod[] = ['7d', '30d', '90d', 'all'];

export function AnalyticsToolbar({
  period,
  lastUpdated,
  loading,
  canExport,
  onPeriodChange,
  onRefresh,
  onExport,
}: {
  period: AnalyticsPeriod;
  lastUpdated: Date | null;
  loading: boolean;
  canExport: boolean;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  onRefresh: () => void;
  onExport: () => void;
}) {
  const { t, i18n } = useAppTranslation();

  return (
    <div className="analytics-toolbar mb-6">
      <div className="analytics-period" role="tablist" aria-label={t('pages.analytics.periodLabel')}>
        {periods.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={period === item}
            className={`analytics-period__btn ${period === item ? 'analytics-period__btn--active' : ''}`}
            onClick={() => onPeriodChange(item)}
          >
            {t(`pages.analytics.period${item}`)}
          </button>
        ))}
      </div>
      <div className="analytics-toolbar__actions">
        {lastUpdated && (
          <span className="text-xs text-muted hidden sm:inline">
            {t('pages.analytics.lastUpdated', {
              time: lastUpdated.toLocaleTimeString(i18n.language === 'vi' ? 'vi-VN' : undefined, {
                hour: '2-digit',
                minute: '2-digit',
              }),
            })}
          </span>
        )}
        <button
          type="button"
          className="btn btn-secondary text-sm py-2 px-3"
          onClick={onRefresh}
          disabled={loading}
          aria-label={t('pages.analytics.refresh')}
        >
          <HiOutlineArrowPath className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button
          type="button"
          className="btn btn-secondary text-sm py-2 px-3 gap-1.5"
          onClick={onExport}
          disabled={!canExport}
        >
          <HiOutlineArrowDownTray className="h-4 w-4" />
          <span className="hidden sm:inline">{t('pages.analytics.export')}</span>
        </button>
      </div>
    </div>
  );
}
