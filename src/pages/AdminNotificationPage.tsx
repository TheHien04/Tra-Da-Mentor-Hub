/**
 * Admin – Send notifications (remind deadlines, slots, interview, meetings via Zalo/email)
 * UI ready; Email/Zalo integration to be added (cost + templates).
 */

import { useState } from 'react';
import { FaPaperPlane, FaUsers, FaEnvelope, FaCommentDots, FaCog } from 'react-icons/fa';
import { toast } from 'react-toastify';

type Audience = 'mentors' | 'mentees' | 'all';
type Channel = 'email' | 'zalo' | 'both';

const AdminNotificationPage = () => {
  const [audience, setAudience] = useState<Audience>('all');
  const [channel, setChannel] = useState<Channel>('both');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.warning('Please enter the notification message.');
      return;
    }
    setSending(true);
    // TODO: call notification API (Email/Zalo) when backend has endpoint
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    toast.info(
      'Sending (Email/Zalo) will be integrated when API and config are ready. Draft saved.'
    );
    setSubject('');
    setMessage('');
  };

  return (
    <div className="detail-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <style>{`
        @media (max-width: 768px) {
          .notification-page-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div
        className="notification-page-grid"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}
      >
        {/* Left: Send Notification form */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }} aria-hidden="true">
            <svg width="64" height="64" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
              <circle cx="36" cy="36" r="34" stroke="var(--primary-color)" strokeWidth="2" fill="rgba(102, 126, 234, 0.06)" />
              <path d="M22 28l14 10 14-10v18H22V28z" stroke="var(--primary-color)" strokeWidth="2" fill="none" />
              <path d="M36 38l8 6 8-6" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="detail-section-title" style={{ marginBottom: '0.5rem' }}>
            📬 Send Notification
          </h1>
          <p style={{ color: 'var(--text-color)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
            Remind mentors and mentees about deadlines, free slots, interviews, or meetings via email and/or Zalo.
          </p>
          <form onSubmit={handleSend} className="form-container">
            <div className="form-group">
              <label className="form-label">Audience</label>
              <select
                className="form-control"
                value={audience}
                onChange={(e) => setAudience(e.target.value as Audience)}
              >
                <option value="all">All (mentors + mentees)</option>
                <option value="mentors">Mentors only</option>
                <option value="mentees">Mentees only</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Channel</label>
              <select
                className="form-control"
                value={channel}
                onChange={(e) => setChannel(e.target.value as Channel)}
              >
                <option value="both">Email + Zalo</option>
                <option value="email">Email only</option>
                <option value="zalo">Zalo only</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subject (for email)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Reminder: mentee application deadline"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea
                className="form-control"
                placeholder="e.g. The mentee application deadline is 20/02. Please log in to choose your interview slot."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaPaperPlane /> {sending ? 'Sending...' : 'Send notification'}
            </button>
          </form>
        </div>

        {/* Right: About Send Notification */}
        <section className="card-container" style={{ padding: '1.5rem', position: 'sticky', top: '1rem' }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.25rem', fontSize: '1.2rem' }}>About Send Notification</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--light-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FaUsers style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: 'var(--text-color)' }}>When to use</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-color)', opacity: 0.9, lineHeight: 1.5 }}>Remind about <strong>deadlines</strong> (e.g. mentee applications), <strong>free slots</strong>, <strong>interviews</strong>, or <strong>meeting times</strong>. Keeps everyone in the loop.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--light-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FaEnvelope style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: 'var(--text-color)' }}>Audience & channel</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-color)', opacity: 0.9, lineHeight: 1.5 }}>Choose who receives: <strong>All</strong>, <strong>Mentors only</strong>, or <strong>Mentees only</strong>. Send via <strong>Email</strong>, <strong>Zalo</strong>, or both.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--light-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FaCommentDots style={{ fontSize: '1.2rem', color: 'var(--accent-color)' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: 'var(--text-color)' }}>Subject & message</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-color)', opacity: 0.9, lineHeight: 1.5 }}>Subject is used for email. Message is the main body; keep it clear and actionable (e.g. deadline date, link to platform).</p>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #eee)' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaCog /> Implementation (later)
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-color)', lineHeight: 1.6 }}>
              <li><strong>Email:</strong> SMTP / SendGrid / SES – configure and estimate cost per month.</li>
              <li><strong>Zalo:</strong> Zalo OA + ZNS, templates need approval – pricing and limits apply.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminNotificationPage;
