import { useEffect, useState } from 'react';
import { HiOutlineArrowDownTray, HiOutlineXMark } from 'react-icons/hi2';
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'tdm-pwa-install-dismissed';

export function PwaInstallPrompt() {
  const { t } = useAppTranslation();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === '1') return;

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', onBip);
    return () => window.removeEventListener('beforeinstallprompt', onBip);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
    setDeferred(null);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  };

  if (!visible || !deferred) return null;

  return (
    <div className="pwa-install-prompt" role="dialog" aria-labelledby="pwa-install-title">
      <div className="pwa-install-prompt__inner">
        <span className="icon-chip shrink-0">
          <HiOutlineArrowDownTray className="h-5 w-5" />
        </span>
        <div className="flex-1 min-w-0">
          <p id="pwa-install-title" className="text-sm font-semibold text-primary">
            {t('pwa.installTitle')}
          </p>
          <p className="text-xs text-muted mt-0.5">{t('pwa.installDesc')}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" className="btn btn-primary text-sm py-2 px-3" onClick={install}>
            {t('pwa.install')}
          </button>
          <button
            type="button"
            className="btn btn-secondary p-2"
            onClick={dismiss}
            aria-label={t('common.close')}
          >
            <HiOutlineXMark className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
