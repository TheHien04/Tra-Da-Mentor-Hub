/**
 * Session Log – CRM: log after each mentoring session (date, topic, score 1–5, needs support)
 */

import { useState, useEffect } from 'react';
import { sessionLogsApi } from '../services/api';
import { mentorApi, menteeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaCalendar, FaStar, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface SessionLogItem {
  _id: string;
  mentorId: string;
  menteeId: string;
  sessionDate: string;
  topic: string;
  mentorScore?: number | null;
  menteeScore?: number | null;
  mentorNeedsSupport?: boolean;
  mentorSupportReason?: string | null;
  menteeNeedsSupport?: boolean;
  menteeSupportReason?: string | null;
  completedByMentor?: boolean;
  completedByMentee?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const SessionLogPage = () => {
  const { state } = useAuth();
  const role = state.user?.role || 'user';
  const [logs, setLogs] = useState<SessionLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mentors, setMentors] = useState<any[]>([]);
  const [mentees, setMentees] = useState<any[]>([]);
  const [form, setForm] = useState({
    mentorId: '',
    menteeId: '',
    sessionDate: new Date().toISOString().split('T')[0],
    topic: '',
    mentorScore: 0 as number | '',
    menteeScore: 0 as number | '',
    mentorNeedsSupport: false,
    mentorSupportReason: '',
    menteeNeedsSupport: false,
    menteeSupportReason: '',
    completedByMentor: false,
    completedByMentee: false,
  });

  const fetchLogs = async () => {
    try {
      const res = await sessionLogsApi.getAll();
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [mRes, meRes] = await Promise.all([mentorApi.getAll(), menteeApi.getAll()]);
        setMentors(mRes.data?.data ?? mRes.data ?? []);
        setMentees(meRes.data?.data ?? meRes.data ?? []);
      } catch (e) {
        console.error(e);
      }
    };
    loadOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mentorId || !form.menteeId || !form.sessionDate || !form.topic.trim()) {
      toast.error('Please fill Mentor, Mentee, Date, and Topic.');
      return;
    }
    try {
      await sessionLogsApi.createOrUpdate({
        mentorId: form.mentorId,
        menteeId: form.menteeId,
        sessionDate: form.sessionDate,
        topic: form.topic.trim(),
        mentorScore: form.mentorScore === '' ? undefined : Number(form.mentorScore),
        menteeScore: form.menteeScore === '' ? undefined : Number(form.menteeScore),
        mentorNeedsSupport: form.mentorNeedsSupport,
        mentorSupportReason: form.mentorSupportReason || undefined,
        menteeNeedsSupport: form.menteeNeedsSupport,
        menteeSupportReason: form.menteeSupportReason || undefined,
        completedByMentor: form.completedByMentor,
        completedByMentee: form.completedByMentee,
      });
      toast.success('Session log saved.');
      setShowForm(false);
      setForm({
        mentorId: '',
        menteeId: '',
        sessionDate: new Date().toISOString().split('T')[0],
        topic: '',
        mentorScore: '',
        menteeScore: '',
        mentorNeedsSupport: false,
        mentorSupportReason: '',
        menteeNeedsSupport: false,
        menteeSupportReason: '',
        completedByMentor: false,
        completedByMentee: false,
      });
      fetchLogs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed.');
    }
  };

  const getMentorName = (id: string) => {
    const m = mentors.find((x) => x._id === id);
    return m?.name || id;
  };
  const getMenteeName = (id: string) => {
    const m = mentees.find((x) => x._id === id);
    return m?.name || id;
  };

  return (
    <div className="detail-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }} aria-hidden="true">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
          <circle cx="36" cy="36" r="34" stroke="var(--primary-color)" strokeWidth="2" fill="rgba(102, 126, 234, 0.06)" />
          <path d="M24 22h24v6H24v-6zm0 10h24v6H24v-6zm0 10h16v6H24v-6z" fill="var(--primary-color)" opacity="0.9" />
          <path d="M28 28h4v4h-4v-4zm0 10h4v4h-4v-4z" fill="var(--accent-color)" opacity="0.7" />
        </svg>
      </div>
      <div className="detail-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="detail-section-title" style={{ marginBottom: 0 }}>
          📋 Session Log
        </h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <FaPlus /> {showForm ? 'Close form' : 'Fill log after mentoring'}
        </button>
      </div>

      <p style={{ color: 'var(--text-color)', marginBottom: '1.5rem' }}>
        After each mentoring session, mentor and mentee fill in: date, topic, score 1–5, and whether team support is needed.
      </p>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="form-container"
          style={{ marginBottom: '2rem', animation: 'slideUp 0.3s ease' }}
        >
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
            Mentoring session details
          </h3>
          <div className="form-group">
            <label className="form-label">Mentor *</label>
            <select
              className="form-control"
              value={form.mentorId}
              onChange={(e) => setForm((f) => ({ ...f, mentorId: e.target.value }))}
              required
            >
              <option value="">-- Select mentor --</option>
              {mentors.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name || m.email}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Mentee *</label>
            <select
              className="form-control"
              value={form.menteeId}
              onChange={(e) => setForm((f) => ({ ...f, menteeId: e.target.value }))}
              required
            >
              <option value="">-- Select mentee --</option>
              {mentees.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name || m.email}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Session date *</label>
            <input
              type="date"
              className="form-control"
              value={form.sessionDate}
              onChange={(e) => setForm((f) => ({ ...f, sessionDate: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Topic *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. React hooks, Career planning..."
              value={form.topic}
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                <FaStar style={{ color: 'var(--accent-color)' }} /> Mentor score (1–5)
              </label>
              <select
                className="form-control"
                value={form.mentorScore}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    mentorScore: e.target.value === '' ? '' : Number(e.target.value),
                  }))
                }
              >
                <option value="">-- Select --</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">
                <FaStar style={{ color: 'var(--accent-color)' }} /> Mentee score (1–5)
              </label>
              <select
                className="form-control"
                value={form.menteeScore}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    menteeScore: e.target.value === '' ? '' : Number(e.target.value),
                  }))
                }
              >
                <option value="">-- Select --</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <input
                type="checkbox"
                id="mentorSupport"
                checked={form.mentorNeedsSupport}
                onChange={(e) =>
                  setForm((f) => ({ ...f, mentorNeedsSupport: e.target.checked }))
                }
                className="mt-1 h-5 w-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 cursor-pointer"
              />
              <div className="flex-1">
                <label htmlFor="mentorSupport" className="flex items-center gap-2 cursor-pointer font-medium text-gray-900">
                  <FaExclamationTriangle className="text-yellow-600" />
                  Mentor needs team support?
                </label>
                {form.mentorNeedsSupport && (
                  <textarea
                    className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none"
                    placeholder="Describe the issue or reason for support..."
                    value={form.mentorSupportReason}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mentorSupportReason: e.target.value }))
                    }
                    rows={3}
                  />
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <input
                type="checkbox"
                id="menteeSupport"
                checked={form.menteeNeedsSupport}
                onChange={(e) =>
                  setForm((f) => ({ ...f, menteeNeedsSupport: e.target.checked }))
                }
                className="mt-1 h-5 w-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 cursor-pointer"
              />
              <div className="flex-1">
                <label htmlFor="menteeSupport" className="flex items-center gap-2 cursor-pointer font-medium text-gray-900">
                  <FaExclamationTriangle className="text-yellow-600" />
                  Mentee needs team support?
                </label>
                {form.menteeNeedsSupport && (
                  <textarea
                    className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none"
                    placeholder="Describe the issue or reason for support..."
                    value={form.menteeSupportReason}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, menteeSupportReason: e.target.value }))
                    }
                    rows={3}
                  />
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary">
              <FaCheck /> Save log
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
        Session log list
      </h3>
      {loading ? (
        <p>Loading...</p>
      ) : logs.length === 0 ? (
        <div className="card-container" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>No session logs yet</h3>
          <p style={{ color: 'var(--text-color)', marginBottom: '1.5rem' }}>After each mentoring session, fill in the date, topic, score (1–5), and whether you need team support. Click the button above to add your first log.</p>
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}><FaPlus /> Fill log after mentoring</button>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Mentor</th>
                  <th>Mentee</th>
                  <th>Topic</th>
                  <th>M score</th>
                  <th>Me score</th>
                  <th>Needs support</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      {log.sessionDate
                        ? new Date(log.sessionDate).toLocaleDateString('en-GB')
                        : '-'}
                    </td>
                    <td>{getMentorName(log.mentorId)}</td>
                    <td>{getMenteeName(log.menteeId)}</td>
                    <td>{log.topic || '-'}</td>
                    <td>{log.mentorScore ?? '-'}</td>
                    <td>{log.menteeScore ?? '-'}</td>
                    <td>
                      {(log.mentorNeedsSupport || log.menteeNeedsSupport) && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                          <FaExclamationTriangle className="text-yellow-600" />
                          Yes
                        </span>
                      )}
                      {!log.mentorNeedsSupport && !log.menteeNeedsSupport && (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-container" style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--light-accent)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💡</span>
            <p style={{ margin: 0, color: 'var(--text-color)', fontSize: '0.9rem' }}>Mark &quot;Needs team support&quot; when you want admin to follow up. All session logs are visible to admins for reporting and export.</p>
          </div>
        </>
      )}

      {/* Bottom section – About Session Log */}
      <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color, #eee)' }}>
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', fontSize: '1.35rem' }}>About Session Log</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div className="card-container" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--light-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FaCalendar style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-color)' }}>What is Session Log?</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-color)', opacity: 0.9, lineHeight: 1.5 }}>A short record of each mentoring session: date, topic, satisfaction score (1–5), and whether either side needs team support. It helps track progress and flag issues early.</p>
            </div>
          </div>
          <div className="card-container" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--light-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FaStar style={{ fontSize: '1.5rem', color: 'var(--accent-color)' }} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-color)' }}>Why log sessions?</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-color)', opacity: 0.9, lineHeight: 1.5 }}>Logs build a history of topics and satisfaction. Admins use them for reporting and CSV export. Marking &quot;Needs support&quot; ensures the team can follow up when something needs attention.</p>
            </div>
          </div>
          <div className="card-container" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--light-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FaExclamationTriangle style={{ fontSize: '1.5rem', color: 'var(--warning-color, #f59e0b)' }} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-color)' }}>Who can see logs?</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-color)', opacity: 0.9, lineHeight: 1.5 }}>Mentors and mentees can add and view session logs. Admins can see all logs and export them as CSV for cohort reports and program reviews.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SessionLogPage;
