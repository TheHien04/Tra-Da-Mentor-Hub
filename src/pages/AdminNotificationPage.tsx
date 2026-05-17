/**
 * Admin – Send notifications (remind deadlines, slots, interview, meetings via Zalo/email)
 */

import { useState } from 'react';
import {
  HiOutlinePaperAirplane,
  HiOutlineUsers,
  HiOutlineEnvelope,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { PageShell, PageHeader, Alert, LaunchBadge } from '../components/ui';
import { DetailCard } from '../components/ui/DetailShell';
import { FormField, FormActions } from '../components/ui/FormShell';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { adminApi } from '../services/api';
import { getApiErrorMessage } from '../lib/apiHelpers';

type Audience = 'mentors' | 'mentees' | 'all';
type Channel = 'email' | 'zalo' | 'both';

const AdminNotificationPage = () => {
  const { t } = useAppTranslation();
  const [audience, setAudience] = useState<Audience>('all');
  const [channel, setChannel] = useState<Channel>('both');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.warning(t('pages.admin.notifications.enterMessage'));
      return;
    }
    setSending(true);
    try {
      await adminApi.broadcast({
        audience,
        subject: subject.trim() || undefined,
        message: message.trim(),
        channel,
      });
      toast.success(t('pages.admin.notifications.sent'));
      setSubject('');
      setMessage('');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={t('pages.admin.notifications.title')}
        description={t('pages.admin.notifications.description')}
        icon={<HiOutlinePaperAirplane className="h-7 w-7" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <form onSubmit={handleSend} className="card p-6 space-y-4">
          <FormField label={t('pages.admin.notifications.audience')}>
            <select
              className="input"
              value={audience}
              onChange={(e) => setAudience(e.target.value as Audience)}
            >
              <option value="all">{t('pages.admin.notifications.audienceAll')}</option>
              <option value="mentors">{t('pages.admin.notifications.audienceMentors')}</option>
              <option value="mentees">{t('pages.admin.notifications.audienceMentees')}</option>
            </select>
          </FormField>
          <FormField label={t('pages.admin.notifications.channel')}>
            <select
              className="input"
              value={channel}
              onChange={(e) => setChannel(e.target.value as Channel)}
            >
              <option value="both">{t('pages.admin.notifications.channelBoth')}</option>
              <option value="email">{t('pages.admin.notifications.channelEmail')}</option>
              <option value="zalo">{t('pages.admin.notifications.channelZalo')}</option>
            </select>
          </FormField>
          {(channel === 'zalo' || channel === 'both') && (
            <Alert variant="info">
              <span className="inline-flex flex-wrap items-center gap-2">
                <LaunchBadge variant="comingSoon" />
                {t('pages.admin.notifications.zaloConfigNote')}
              </span>
            </Alert>
          )}
          <FormField label={t('pages.admin.notifications.subject')}>
            <input
              type="text"
              className="input"
              placeholder={t('pages.admin.notifications.subjectPlaceholder')}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </FormField>
          <FormField label={t('pages.admin.notifications.message')} required>
            <textarea
              className="input min-h-[120px]"
              placeholder={t('pages.admin.notifications.messagePlaceholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
            />
          </FormField>
          <FormActions>
            <button type="submit" className="btn btn-primary w-full" disabled={sending}>
              {sending ? t('pages.admin.notifications.sending') : t('pages.admin.notifications.send')}
            </button>
          </FormActions>
        </form>

        <DetailCard title={t('pages.admin.notifications.aboutTitle')}>
          <InfoRow
            icon={<HiOutlineUsers className="h-5 w-5" />}
            title={t('pages.admin.notifications.aboutWhenTitle')}
            text={t('pages.admin.notifications.aboutWhen')}
          />
          <InfoRow
            icon={<HiOutlineEnvelope className="h-5 w-5" />}
            title={t('pages.admin.notifications.aboutAudienceTitle')}
            text={t('pages.admin.notifications.aboutAudience')}
          />
          <InfoRow
            icon={<HiOutlineChatBubbleLeftRight className="h-5 w-5" />}
            title={t('pages.admin.notifications.aboutMessageTitle')}
            text={t('pages.admin.notifications.aboutMessage')}
          />
          <div className="pt-4 mt-2 border-t" style={{ borderColor: 'var(--border-default)' }}>
            <p className="text-sm font-medium text-primary flex items-center gap-2 mb-2">
              <HiOutlineCog6Tooth className="h-4 w-4" />
              {t('pages.admin.notifications.implTitle')}
            </p>
            <ul className="text-sm text-secondary space-y-1 list-disc list-inside">
              <li>{t('pages.admin.notifications.implEmail')}</li>
              <li>{t('pages.admin.notifications.implZalo')}</li>
            </ul>
          </div>
        </DetailCard>
      </div>

      <Alert variant="info" className="mt-6">
        {t('pages.admin.notifications.apiNote')}
      </Alert>
    </PageShell>
  );
};

function InfoRow({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 py-3 border-b last:border-0" style={{ borderColor: 'var(--border-default)' }}>
      <span className="icon-chip shrink-0">{icon}</span>
      <div>
        <h3 className="text-sm font-medium text-primary">{title}</h3>
        <p className="text-sm text-secondary mt-0.5">{text}</p>
      </div>
    </div>
  );
}

export default AdminNotificationPage;
