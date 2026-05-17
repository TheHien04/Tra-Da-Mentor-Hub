import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineBell } from 'react-icons/hi2';
import { useNotifications } from '../../context/NotificationContext';
import { useAppTranslation } from '../../hooks/useAppTranslation';

export function NotificationBell() {
  const { t, formatDateTime } = useAppTranslation();
  const { notifications, unreadCount, connected, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleItemClick = (id: string, href?: string | null) => {
    markRead(id);
    setOpen(false);
    if (href) navigate(href);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="icon-btn w-9 h-9 relative"
        aria-label={t('pages.notifications.ariaLabel')}
      >
        <HiOutlineBell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ backgroundColor: 'var(--danger)', color: '#fff' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span
          className={`absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'opacity-40 bg-zinc-400'}`}
          title={connected ? t('pages.notifications.live') : t('pages.notifications.offline')}
        />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-80 max-h-[70vh] modal-panel rounded-xl overflow-hidden z-50 shadow-lg animate-scale-in">
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--border-default)' }}
          >
            <span className="text-sm font-semibold text-primary">{t('pages.notifications.title')}</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium"
                style={{ color: 'var(--accent)' }}
              >
                {t('pages.notifications.markAllRead')}
              </button>
            )}
          </div>
          <ul className="overflow-y-auto max-h-64">
            {notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted">{t('pages.notifications.empty')}</li>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <li key={n._id}>
                  <button
                    type="button"
                    className={`w-full text-left px-4 py-3 border-b transition-colors hover:opacity-90 ${n.read ? 'opacity-70' : ''}`}
                    style={{ borderColor: 'var(--border-subtle)' }}
                    onClick={() => handleItemClick(n._id, n.href)}
                  >
                    <p className="text-sm font-medium text-primary">{n.title}</p>
                    <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted mt-1">{formatDateTime(n.createdAt)}</p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
