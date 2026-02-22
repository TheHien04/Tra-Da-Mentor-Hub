/**
 * Admin – Invite mentor/mentee by email
 * Create invite link; optional SMTP in .env for sending email
 */

import { useState } from 'react';
import { invitesApi } from '../services/api';
import { FaUserPlus, FaCopy, FaEnvelope, FaLink, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminInvitePage = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'mentor' | 'mentee' | 'admin'>('mentee');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.warning('Please enter an email.');
      return;
    }
    setLoading(true);
    setInviteLink('');
    try {
      const res = await invitesApi.create({ email: email.trim(), role });
      const link = res.data?.link || '';
      setInviteLink(link);
      toast.success('Invite link created. Copy and send it to the user via email or Zalo.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create invite');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    toast.success('Link copied to clipboard.');
  };

  return (
    <div className="detail-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <style>{`
        @media (max-width: 768px) {
          .invite-page-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div
        className="invite-page-grid"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}
      >
        {/* Left: Invite User form */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }} aria-hidden="true">
            <svg width="64" height="64" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
              <circle cx="36" cy="36" r="34" stroke="var(--primary-color)" strokeWidth="2" fill="rgba(102, 126, 234, 0.06)" />
              <circle cx="36" cy="26" r="8" fill="var(--primary-color)" opacity="0.9" />
              <path d="M22 52c0-8 6-14 14-14s14 6 14 14" stroke="var(--primary-color)" strokeWidth="2" fill="none" />
              <path d="M50 32l12-4v8l-12 4" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="detail-section-title" style={{ marginBottom: '0.5rem' }}>
            👤 Invite User
          </h1>
          <p style={{ color: 'var(--text-color)', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Create an invite link and send it via email or Zalo. User opens the link to register with email and role pre-filled.
          </p>
          <div className="card-container" style={{ marginBottom: '1.25rem', padding: '0.875rem', background: 'var(--light-accent)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>💡</span>
            <p style={{ margin: 0, color: 'var(--text-color)', fontSize: '0.85rem' }}>Enter email and role → Create link → Copy and share. Link valid 7 days.</p>
          </div>
          <form onSubmit={handleCreate} className="form-container">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-control"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-control" value={role} onChange={(e) => setRole(e.target.value as any)}>
                <option value="mentee">Mentee</option>
                <option value="mentor">Mentor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaUserPlus /> {loading ? 'Creating...' : 'Create invite link'}
            </button>
          </form>
          {inviteLink && (
            <div className="form-container" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">Invite link (send to user)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="text" className="form-control" value={inviteLink} readOnly style={{ flex: 1 }} />
                <button type="button" className="btn btn-secondary" onClick={copyLink} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaCopy /> Copy
                </button>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-color)', marginTop: '0.5rem', marginBottom: 0 }}>
                Valid 7 days. Opens Register page with email and role pre-filled.
              </p>
            </div>
          )}
        </div>

        {/* Right: About Invite User */}
        <section className="card-container" style={{ padding: '1.5rem', position: 'sticky', top: '1rem' }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.25rem', fontSize: '1.2rem' }}>About Invite User</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--light-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FaUserPlus style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: 'var(--text-color)' }}>Who can you invite?</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-color)', opacity: 0.9, lineHeight: 1.5 }}>Mentors, Mentees, or Admins. Choose the role when creating the link.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--light-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FaEnvelope style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: 'var(--text-color)' }}>How to share?</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-color)', opacity: 0.9, lineHeight: 1.5 }}>Copy the link and send via email or Zalo. SMTP can be added later for auto-send.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--light-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FaClock style={{ fontSize: '1.2rem', color: 'var(--accent-color)' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: 'var(--text-color)' }}>Link validity</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-color)', opacity: 0.9, lineHeight: 1.5 }}>Valid 7 days. User opens link → Register page with email and role pre-filled; they set password and name.</p>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #eee)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <FaLink style={{ fontSize: '1.1rem', color: 'var(--primary-color)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, color: 'var(--text-color)', fontSize: '0.85rem', lineHeight: 1.5 }}>Multiple users: create one link per person (one email per invite). Each link is unique.</p>
          </div>
        </section>
      </div>

      {/* Bottom section – Quick steps */}
      <section style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color, #eee)' }}>
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.25rem', fontSize: '1.2rem' }}>Invite flow in 4 steps</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="card-container" style={{ padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 600, flexShrink: 0 }}>1</span>
            <div>
              <strong style={{ fontSize: '0.9rem' }}>Enter email & role</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-color)', opacity: 0.9 }}>Type the user&apos;s email and select Mentor, Mentee, or Admin.</p>
            </div>
          </div>
          <div className="card-container" style={{ padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 600, flexShrink: 0 }}>2</span>
            <div>
              <strong style={{ fontSize: '0.9rem' }}>Create invite link</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-color)', opacity: 0.9 }}>Click the button; the unique link appears above.</p>
            </div>
          </div>
          <div className="card-container" style={{ padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 600, flexShrink: 0 }}>3</span>
            <div>
              <strong style={{ fontSize: '0.9rem' }}>Copy & share</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-color)', opacity: 0.9 }}>Copy the link and send it via email or Zalo.</p>
            </div>
          </div>
          <div className="card-container" style={{ padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 600, flexShrink: 0 }}>4</span>
            <div>
              <strong style={{ fontSize: '0.9rem' }}>User registers</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-color)', opacity: 0.9 }}>They open the link, see email/role pre-filled, set password and name.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminInvitePage;
