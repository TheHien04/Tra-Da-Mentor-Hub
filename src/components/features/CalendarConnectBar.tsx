import { HiOutlineCalendar, HiOutlineLink } from 'react-icons/hi2';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useCalendarStatus, useConnectCalendar } from '../../hooks/queries/useCalendar';
export function CalendarConnectBar() {
  const { t } = useAppTranslation();
  const { data, isLoading } = useCalendarStatus();
  const connect = useConnectCalendar();

  const connected = data?.connected;

  return (
    <div className="card p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div className="flex items-start gap-3 min-w-0">
        <span className="icon-chip shrink-0">
          <HiOutlineCalendar className="h-5 w-5" />
        </span>
        <div>
          <p className="font-medium text-primary">{t('pages.schedule.calendarTitle')}</p>
          <p className="text-sm text-muted mt-0.5">{t('pages.schedule.calendarDesc')}</p>
        </div>
      </div>
      {isLoading ? (
        <span className="text-sm text-muted">{t('common.loading')}</span>
      ) : connected ? (
        <span className="badge-pill badge-success shrink-0">{t('pages.schedule.calendarConnected')}</span>
      ) : (
        <button
          type="button"
          className="btn btn-primary shrink-0 inline-flex items-center gap-2"
          disabled={connect.isPending}
          onClick={() => connect.mutate()}
        >
          <HiOutlineLink className="h-4 w-4" />
          {t('pages.schedule.calendarConnect')}
        </button>
      )}
    </div>
  );
}
