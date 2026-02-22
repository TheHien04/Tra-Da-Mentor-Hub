/**
 * Admin – Export CSV for mentors, mentees, and session logs
 */

import { useState } from 'react';
import { mentorApi, menteeApi, sessionLogsApi } from '../services/api';
import { FaFileCsv, FaDownload, FaTable, FaDatabase, FaFileAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminExportPage = () => {
  const [loading, setLoading] = useState(false);

  const escapeCsv = (v: any): string => {
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
        ['ID', 'Name', 'Email', 'Track', 'Expertise', 'Max Mentees', 'Mentee count'],
        ...list.map((m: any) => [
          m._id || '',
          m.name || '',
          m.email || '',
          m.track || '',
          Array.isArray(m.expertise) ? m.expertise.join('; ') : '',
          m.maxMentees ?? '',
          Array.isArray(m.mentees) ? m.mentees.length : 0,
        ]),
      ];
      downloadCsv(`mentors-${new Date().toISOString().slice(0, 10)}.csv`, rows);
      toast.success('Mentors CSV exported.');
    } catch (e) {
      console.error(e);
      toast.error('Export failed.');
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
        ['ID', 'Name', 'Email', 'School', 'Track', 'Progress', 'Mentor ID'],
        ...list.map((m: any) => [
          m._id || '',
          m.name || '',
          m.email || '',
          m.school || '',
          m.track || '',
          m.progress ?? '',
          m.mentorId || '',
        ]),
      ];
      downloadCsv(`mentees-${new Date().toISOString().slice(0, 10)}.csv`, rows);
      toast.success('Mentees CSV exported.');
    } catch (e) {
      console.error(e);
      toast.error('Export failed.');
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
          'ID',
          'Mentor ID',
          'Mentee ID',
          'Date',
          'Topic',
          'M score',
          'Me score',
          'M needs support',
          'Me needs support',
        ],
        ...list.map((l: any) => [
          l._id || '',
          l.mentorId || '',
          l.menteeId || '',
          l.sessionDate
            ? new Date(l.sessionDate).toLocaleDateString('en-GB')
            : '',
          l.topic || '',
          l.mentorScore ?? '',
          l.menteeScore ?? '',
          l.mentorNeedsSupport ? 'Yes' : 'No',
          l.menteeNeedsSupport ? 'Yes' : 'No',
        ]),
      ];
      downloadCsv(
        `session-logs-${new Date().toISOString().slice(0, 10)}.csv`,
        rows
      );
      toast.success('Session logs CSV exported.');
    } catch (e) {
      console.error(e);
      toast.error('Export failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="detail-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <style>{`
        @media (max-width: 768px) {
          .export-page-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div
        className="export-page-grid"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}
      >
        {/* Left: Export CSV buttons */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }} aria-hidden="true">
            <svg width="64" height="64" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
              <circle cx="36" cy="36" r="34" stroke="var(--primary-color)" strokeWidth="2" fill="rgba(102, 126, 234, 0.06)" />
              <path d="M24 20h24v8H24v-8zm0 12h24v6H24v-6zm0 12h16v6H24v-6z" fill="var(--primary-color)" opacity="0.9" />
              <path d="M44 44l8 8 8-8" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="detail-section-title" style={{ marginBottom: '0.5rem' }}>
            📤 Export CSV
          </h1>
          <p style={{ color: 'var(--text-color)', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Export mentors, mentees, or session logs as CSV for reporting and backup.
          </p>
          <div className="card-container" style={{ marginBottom: '1.25rem', padding: '0.875rem', background: 'var(--light-accent)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📊</span>
            <p style={{ margin: 0, color: 'var(--text-color)', fontSize: '0.85rem' }}>Choose a dataset below. Files are generated on demand and downloaded to your device.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={loading}
              onClick={handleExportMentors}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaFileCsv /> Export Mentors list
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={loading}
              onClick={handleExportMentees}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaFileCsv /> Export Mentees list
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={loading}
              onClick={handleExportSessionLogs}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaDownload /> Export Session logs (CRM)
            </button>
          </div>
          {loading && (
            <p style={{ marginTop: '1rem', color: 'var(--text-color)', fontSize: '0.9rem' }}>
              Exporting...
            </p>
          )}
        </div>

        {/* Right: About Export CSV */}
        <section className="card-container" style={{ padding: '1.5rem', position: 'sticky', top: '1rem' }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.25rem', fontSize: '1.2rem' }}>About Export CSV</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--light-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FaTable style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: 'var(--text-color)' }}>What&apos;s in each export?</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-color)', opacity: 0.9, lineHeight: 1.5 }}><strong>Mentors:</strong> ID, name, email, track, expertise, max mentees, mentee count. <strong>Mentees:</strong> ID, name, email, school, track, progress, mentor ID. <strong>Session logs:</strong> date, mentor/mentee, topic, scores, needs support.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--light-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FaDatabase style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: 'var(--text-color)' }}>When to use</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-color)', opacity: 0.9, lineHeight: 1.5 }}>Use for <strong>reporting</strong> (cohort stats, progress), <strong>backup</strong>, or opening in Excel/Google Sheets. Files are generated on demand.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--light-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FaFileAlt style={{ fontSize: '1.2rem', color: 'var(--accent-color)' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: 'var(--text-color)' }}>File format</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-color)', opacity: 0.9, lineHeight: 1.5 }}>CSV (UTF-8 with BOM). Excel and Google Sheets open them correctly. Filenames include export date (e.g. mentors-2025-02-15.csv).</p>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #eee)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <FaFileCsv style={{ fontSize: '1.1rem', color: 'var(--primary-color)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, color: 'var(--text-color)', fontSize: '0.85rem', lineHeight: 1.5 }}>Each button exports the full list. To get a subset, export then filter in Excel/Sheets.</p>
          </div>
        </section>
      </div>

      {/* Bottom section – Use cases */}
      <section style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color, #eee)' }}>
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.25rem', fontSize: '1.2rem' }}>When to export what</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div className="card-container" style={{ padding: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--primary-color)' }}>Export Mentors</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-color)', lineHeight: 1.5 }}>Use for cohort overview, capacity (max mentees vs current), track and expertise distribution. Good for planning and reporting.</p>
          </div>
          <div className="card-container" style={{ padding: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--primary-color)' }}>Export Mentees</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-color)', lineHeight: 1.5 }}>Use for progress tracking, school/track stats, mentor assignment overview. Combine with session logs for full picture.</p>
          </div>
          <div className="card-container" style={{ padding: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--primary-color)' }}>Export Session logs</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-color)', lineHeight: 1.5 }}>Use for CRM-style reporting: topics, scores, needs-support flags. Helps spot trends and follow up with mentors/mentees.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminExportPage;
