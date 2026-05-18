/**
 * Admin – Export CSV for mentors, mentees, and session logs
 */

import { useState } from 'react';
import { mentorApi, menteeApi, sessionLogsApi } from '../services/api';
import {
  HiOutlineArrowDownTray,
  HiOutlineTableCells,
  HiOutlineCircleStack,
  HiOutlineDocumentText,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { PageShell, PageHeader, Alert } from '../components/ui';
import { DetailCard } from '../components/ui/DetailShell';
import { useAppTranslation } from '../hooks/useAppTranslation';

const AdminExportPage = () => {
  const { t } = useAppTranslation();
  const [loading, setLoading] = useState(false);

  const escapeCsv = (v: unknown): string => {
    if (v == null) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n'))
      return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const downloadCsv = (filename: string, rows: string[][]) => {
    const header = rows[0];
    const body = rows.slice(1);
    const lines = [header.map(escapeCsv).join(',')];
    body.forEach((row) => lines.push(row.map(escapeCsv).join(',')));
    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMentors = async () => {
    setLoading(true);
    try {
      const res = await mentorApi.getAll();
      const data = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(data) ? data : [];
      const rows: string[][] = [
        [
          t('pages.admin.export.colId'),
          t('pages.admin.export.colName'),
          t('pages.admin.export.colEmail'),
          t('pages.admin.export.colTrack'),
          t('pages.admin.export.colExpertise'),
          t('pages.admin.export.colMaxMentees'),
          t('pages.admin.export.colMenteeCount'),
        ],
        ...list.map((m: Record<string, unknown>) => [
          String(m._id || ''),
          String(m.name || ''),
          String(m.email || ''),
          String(m.track || ''),
          Array.isArray(m.expertise) ? (m.expertise as string[]).join('; ') : '',
          String(m.maxMentees ?? ''),
          Array.isArray(m.mentees) ? String(m.mentees.length) : '0',
        ]),
      ];
      downloadCsv(`mentors-${new Date().toISOString().slice(0, 10)}.csv`, rows);
      toast.success(t('pages.admin.export.successMentors'));
    } catch (e) {
      console.error(e);
      toast.error(t('pages.admin.export.failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleExportMentees = async () => {
    setLoading(true);
    try {
      const res = await menteeApi.getAll();
      const data = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(data) ? data : [];
      const rows: string[][] = [
        [
          t('pages.admin.export.colId'),
          t('pages.admin.export.colName'),
          t('pages.admin.export.colEmail'),
          t('pages.admin.export.colSchool'),
          t('pages.admin.export.colTrack'),
          t('pages.admin.export.colProgress'),
          t('pages.admin.export.colMentorId'),
        ],
        ...list.map((m: Record<string, unknown>) => [
          String(m._id || ''),
          String(m.name || ''),
          String(m.email || ''),
          String(m.school || ''),
          String(m.track || ''),
          String(m.progress ?? ''),
          String(m.mentorId || ''),
        ]),
      ];
      downloadCsv(`mentees-${new Date().toISOString().slice(0, 10)}.csv`, rows);
      toast.success(t('pages.admin.export.successMentees'));
    } catch (e) {
      console.error(e);
      toast.error(t('pages.admin.export.failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleExportSessionLogs = async () => {
    setLoading(true);
    try {
      const res = await sessionLogsApi.getAll();
      const list = Array.isArray(res.data) ? res.data : [];
      const rows: string[][] = [
        [
          t('pages.admin.export.colId'),
          t('pages.admin.export.colMentorId'),
          t('pages.admin.export.colMenteeId'),
          t('pages.admin.export.colDate'),
          t('pages.admin.export.colTopic'),
          t('pages.admin.export.colMentorScore'),
          t('pages.admin.export.colMenteeScore'),
          t('pages.admin.export.colMentorSupport'),
          t('pages.admin.export.colMenteeSupport'),
        ],
        ...list.map((l: Record<string, unknown>) => [
          String(l._id || ''),
          String(l.mentorId || ''),
          String(l.menteeId || ''),
          l.sessionDate
            ? new Date(l.sessionDate as string).toLocaleDateString('en-GB')
            : '',
          String(l.topic || ''),
          String(l.mentorScore ?? ''),
          String(l.menteeScore ?? ''),
          l.mentorNeedsSupport ? t('common.yes') : t('common.no'),
          l.menteeNeedsSupport ? t('common.yes') : t('common.no'),
        ]),
      ];
      downloadCsv(`session-logs-${new Date().toISOString().slice(0, 10)}.csv`, rows);
      toast.success(t('pages.admin.export.successSessions'));
    } catch (e) {
      console.error(e);
      toast.error(t('pages.admin.export.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={t('pages.admin.export.title')}
        description={t('pages.admin.export.description')}
        icon={<HiOutlineArrowDownTray className="h-7 w-7" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <section className="card p-6 space-y-3">
          <p className="text-sm text-secondary mb-2">
            {t('pages.admin.export.intro')}
          </p>
          <button
            type="button"
            className="btn btn-primary w-full justify-center"
            disabled={loading}
            onClick={handleExportMentors}
          >
            <HiOutlineTableCells className="h-4 w-4" />
            {t('pages.admin.export.exportMentors')}
          </button>
          <button
            type="button"
            className="btn btn-primary w-full justify-center"
            disabled={loading}
            onClick={handleExportMentees}
          >
            <HiOutlineTableCells className="h-4 w-4" />
            {t('pages.admin.export.exportMentees')}
          </button>
          <button
            type="button"
            className="btn btn-primary w-full justify-center"
            disabled={loading}
            onClick={handleExportSessionLogs}
          >
            <HiOutlineDocumentText className="h-4 w-4" />
            {t('pages.admin.export.exportSessions')}
          </button>
          {loading && <p className="text-sm text-muted pt-2">{t('pages.admin.export.exporting')}</p>}
        </section>

        <DetailCard title={t('pages.admin.export.aboutTitle')}>
          <InfoRow
            icon={<HiOutlineTableCells className="h-5 w-5" />}
            title={t('pages.admin.export.aboutWhat')}
            text={t('pages.admin.export.aboutWhat')}
          />
          <InfoRow
            icon={<HiOutlineCircleStack className="h-5 w-5" />}
            title={t('pages.admin.export.aboutWhen')}
            text={t('pages.admin.export.aboutWhen')}
          />
          <InfoRow
            icon={<HiOutlineDocumentText className="h-5 w-5" />}
            title={t('pages.admin.export.aboutFormat')}
            text={t('pages.admin.export.aboutFormat')}
          />
        </DetailCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <DetailCard title={t('pages.admin.export.exportMentors')}>
          <p className="text-sm text-secondary">{t('pages.admin.export.cardMentors')}</p>
        </DetailCard>
        <DetailCard title={t('pages.admin.export.exportMentees')}>
          <p className="text-sm text-secondary">{t('pages.admin.export.cardMentees')}</p>
        </DetailCard>
        <DetailCard title={t('pages.admin.export.exportSessions')}>
          <p className="text-sm text-secondary">{t('pages.admin.export.cardSessions')}</p>
        </DetailCard>
      </div>

      <Alert variant="info" className="mt-6">
        {t('pages.admin.export.subsetNote')}
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

export default AdminExportPage;
