/**
 * Mentee applications – Mentor/Admin view applications, invite to interview, accept or reject
 */

import { useState, useEffect } from 'react';
import { menteeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaUserGraduate, FaCalendarCheck, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';

type ApplicationStatus = 'pending' | 'invited_for_interview' | 'interviewed' | 'accepted' | 'rejected';

interface MenteeWithStatus {
  _id: string;
  name?: string;
  email?: string;
  school?: string;
  track?: string;
  interests?: string[];
  goals?: string[];
  progress?: number;
  applicationStatus?: ApplicationStatus;
}

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'Pending',
  invited_for_interview: 'Invited for interview',
  interviewed: 'Interviewed',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

const ApplicationsPage = () => {
  const { state } = useAuth();
  const [mentees, setMentees] = useState<MenteeWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | ''>('');

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        const res = await menteeApi.getAll();
        const data = res.data?.data ?? res.data ?? [];
        // Mock status nếu backend chưa có applicationStatus
        const withStatus = Array.isArray(data)
          ? data.map((m: any) => ({
              ...m,
              name: m.name || m.email?.split('@')[0] || m._id,
              applicationStatus: m.applicationStatus || 'pending',
            }))
          : [];
        setMentees(withStatus);
      } catch (e) {
        console.error(e);
        setMentees([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMentees();
  }, []);

  const filtered =
    filterStatus === ''
      ? mentees
      : mentees.filter((m) => m.applicationStatus === filterStatus);

  const handleStatusChange = async (
    menteeId: string,
    newStatus: ApplicationStatus
  ) => {
    try {
      await menteeApi.updateApplicationStatus(menteeId, newStatus);
      toast.success(`Status updated: ${STATUS_LABELS[newStatus]}`);
      setMentees((prev) =>
        prev.map((m) =>
          m._id === menteeId ? { ...m, applicationStatus: newStatus } : m
        )
      );
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="detail-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }} aria-hidden="true">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
          <circle cx="36" cy="36" r="34" stroke="var(--primary-color)" strokeWidth="2" fill="rgba(102, 126, 234, 0.06)" />
          <path d="M28 24h24v8H28v-8zm0 12h16v4H28v-4zm0 8h20v4H28v-4z" fill="var(--primary-color)" opacity="0.9" />
          <circle cx="42" cy="38" r="6" stroke="var(--accent-color)" strokeWidth="2" fill="none" />
        </svg>
      </div>
      <div className="detail-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="detail-section-title" style={{ marginBottom: 0 }}>
          📝 Mentee Applications
        </h1>
      </div>
      <p style={{ color: 'var(--text-color)', marginBottom: '1.5rem' }}>
        Review mentee applications, invite candidates to interview (use Free Slots for scheduling), then Accept or Reject after the interview.
      </p>

      <div className="form-group" style={{ maxWidth: '300px', marginBottom: '1.5rem' }}>
        <label className="form-label">Filter by status</label>
        <select
          className="form-control"
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus((e.target.value as ApplicationStatus) || '')
          }
        >
          <option value="">All</option>
          {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="card-container" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>No mentee applications yet</h3>
          <p style={{ color: 'var(--text-color)' }}>Mentee applications will appear here when they apply. You can then invite them to interview and Accept or Reject.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Mentee</th>
                <th>Email</th>
                <th>School</th>
                <th>Track</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m._id}>
                  <td>
                    <strong>{m.name || m.email || m._id}</strong>
                  </td>
                  <td>{m.email || '-'}</td>
                  <td>{m.school || '-'}</td>
                  <td>{m.track || '-'}</td>
                  <td>
                    {m.applicationStatus === 'accepted' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                        {STATUS_LABELS.accepted}
                      </span>
                    )}
                    {m.applicationStatus === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                        {STATUS_LABELS.rejected}
                      </span>
                    )}
                    {(m.applicationStatus === 'interviewed' || m.applicationStatus === 'invited_for_interview') && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                        {STATUS_LABELS[m.applicationStatus]}
                      </span>
                    )}
                    {(m.applicationStatus === 'pending' || !m.applicationStatus) && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                        {STATUS_LABELS[m.applicationStatus || 'pending']}
                      </span>
                    )}
                  </td>
                  <td style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(m.applicationStatus === 'pending' ||
                      m.applicationStatus === 'invited_for_interview') && (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                          onClick={() =>
                            handleStatusChange(m._id, 'invited_for_interview')
                          }
                        >
                          <FaCalendarCheck /> Invite to interview
                        </button>
                      </>
                    )}
                    {m.applicationStatus === 'invited_for_interview' && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        onClick={() =>
                          handleStatusChange(m._id, 'interviewed')
                        }
                      >
                        <FaEye /> Mark interviewed
                      </button>
                    )}
                    {m.applicationStatus === 'interviewed' && (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                          onClick={() =>
                            handleStatusChange(m._id, 'accepted')
                          }
                        >
                          <FaCheck /> Accept
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                          onClick={() =>
                            handleStatusChange(m._id, 'rejected')
                          }
                        >
                          <FaTimes /> Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
