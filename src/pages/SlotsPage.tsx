/**
 * Free Slots – Mentors add slots + paste Meet link; Mentees view and book (Google Calendar integration later)
 */

import { useState, useEffect } from 'react';
import { slotsApi, mentorApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaCalendarCheck, FaLink } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface Slot {
  _id: string;
  mentorId: string;
  date: string;
  time: string;
  duration: number;
  meetingLink?: string;
  bookedBy: string | null;
  menteeId: string | null;
}

const SlotsPage = () => {
  const { state } = useAuth();
  const role = state.user?.role || 'user';
  const [slots, setSlots] = useState<Slot[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterMentorId, setFilterMentorId] = useState('');
  const [form, setForm] = useState({
    mentorId: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    duration: 60,
    meetingLink: '',
  });

  const fetchSlots = async () => {
    try {
      const params: any = {};
      if (filterMentorId) params.mentorId = filterMentorId;
      const res = await slotsApi.getAll(params);
      setSlots(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [filterMentorId]);

  useEffect(() => {
    mentorApi.getAll().then((r) => {
      const d = r.data?.data ?? r.data ?? [];
      setMentors(Array.isArray(d) ? d : []);
    }).catch(() => setMentors([]));
  }, []);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mentorId || !form.date || !form.time) {
      toast.warning('Please fill mentor, date, and time.');
      return;
    }
    try {
      await slotsApi.create({
        mentorId: form.mentorId,
        date: form.date,
        time: form.time,
        duration: form.duration,
        meetingLink: form.meetingLink || undefined,
      });
      toast.success('Slot added.');
      setShowForm(false);
      setForm({ mentorId: '', date: new Date().toISOString().split('T')[0], time: '14:00', duration: 60, meetingLink: '' });
      fetchSlots();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add slot');
    }
  };

  const handleBook = async (slotId: string) => {
    const menteeId = '101';
    try {
      await slotsApi.book(slotId, menteeId);
      toast.success('Slot booked.');
      fetchSlots();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to book slot');
    }
  };

  const getMentorName = (id: string) => mentors.find((m) => m._id === id)?.name || id;

  return (
    <div className="detail-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }} aria-hidden="true">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
          <circle cx="36" cy="36" r="34" stroke="var(--primary-color)" strokeWidth="2" fill="rgba(102, 126, 234, 0.06)" />
          <path d="M36 18v6h-8v4h8v8h4v-8h8v-4h-8v-6h-4z" fill="var(--primary-color)" opacity="0.9" />
          <circle cx="36" cy="36" r="14" stroke="var(--accent-color)" strokeWidth="2" fill="none" />
          <path d="M36 28v8l6 4" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="detail-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="detail-section-title" style={{ marginBottom: 0 }}>
          📅 Free Slots (Interview / Mentoring)
        </h1>
        {(role === 'mentor' || role === 'admin') && (
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaPlus /> {showForm ? 'Close form' : 'Add free slot'}
          </button>
        )}
      </div>
      <p style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>
        Mentors add free slots and paste a Google Meet (or Zoom) link. Mentees view and book slots. Google Calendar integration for automatic links will be added later.
      </p>

      {showForm && (
        <form onSubmit={handleAddSlot} className="form-container" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Mentor *</label>
              <select className="form-control" value={form.mentorId} onChange={(e) => setForm((f) => ({ ...f, mentorId: e.target.value }))} required>
                <option value="">-- Select mentor --</option>
                {mentors.map((m) => (
                  <option key={m._id} value={m._id}>{m.name || m.email}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-control" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Time *</label>
              <input type="time" className="form-control" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (min)</label>
              <input type="number" className="form-control" min={15} max={120} value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) || 60 }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label"><FaLink /> Google Meet / Zoom link (paste)</label>
            <input type="url" className="form-control" placeholder="https://meet.google.com/..." value={form.meetingLink} onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))} />
          </div>
          <button type="submit" className="btn btn-primary">Add slot</button>
        </form>
      )}

      <div className="form-group" style={{ maxWidth: '300px', marginBottom: '1rem' }}>
        <label className="form-label">Filter by mentor</label>
        <select className="form-control" value={filterMentorId} onChange={(e) => setFilterMentorId(e.target.value)}>
          <option value="">All</option>
          {mentors.map((m) => (
            <option key={m._id} value={m._id}>{m.name || m.email}</option>
          ))}
        </select>
      </div>

      {loading ? <p>Loading...</p> : slots.length === 0 ? (
        <div className="card-container" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕐</div>
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>No slots yet</h3>
          <p style={{ color: 'var(--text-color)', marginBottom: '1.5rem' }}>Mentors can add free slots and paste a meeting link. Mentees can then book a slot for an interview or mentoring session.</p>
          {(role === 'mentor' || role === 'admin') && (
            <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}><FaPlus /> Add free slot</button>
          )}
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Mentor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Meet Link</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((s) => (
                  <tr key={s._id}>
                    <td>{getMentorName(s.mentorId)}</td>
                    <td>{s.date}</td>
                    <td>{s.time}</td>
                    <td>{s.duration} min</td>
                    <td>
                      {s.meetingLink ? (
                        <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>Open Meet</a>
                      ) : '-'}
                    </td>
                    <td>
                      {s.bookedBy ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                          Booked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                          Available
                        </span>
                      )}
                    </td>
                    <td>
                      {!s.bookedBy && (role === 'mentee' || role === 'admin') && (
                        <button type="button" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => handleBook(s._id)}>
                          <FaCalendarCheck /> Book slot
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-container" style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--light-accent)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💡</span>
            <p style={{ margin: 0, color: 'var(--text-color)', fontSize: '0.9rem' }}>Paste a Google Meet or Zoom link when adding a slot so mentees can join the call after booking. Automatic link creation via Google Calendar can be added later.</p>
          </div>
        </>
      )}

      {/* Bottom section – How to use Free Slots */}
      <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color, #eee)' }}>
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', fontSize: '1.35rem' }}>How to use Free Slots</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="card-container" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaPlus /> For Mentors
            </h3>
            <ol style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-color)', fontSize: '0.95rem', lineHeight: 1.8 }}>
              <li>Click &quot;Add free slot&quot; and choose date, time, and duration.</li>
              <li>Paste your Google Meet or Zoom link so mentees can join the call.</li>
              <li>Your slots appear in the list; mentees can book available slots.</li>
              <li>After a session, fill a Session Log (see Session Log page).</li>
            </ol>
          </div>
          <div className="card-container" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaCalendarCheck /> For Mentees
            </h3>
            <ol style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-color)', fontSize: '0.95rem', lineHeight: 1.8 }}>
              <li>Filter by mentor if you want to see slots from a specific mentor.</li>
              <li>Find an &quot;Available&quot; slot and click &quot;Book slot&quot;.</li>
              <li>Use the &quot;Open Meet&quot; link at the scheduled time to join the call.</li>
              <li>After the session, your mentor may ask you to fill a Session Log together.</li>
            </ol>
          </div>
        </div>
        <div className="card-container" style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--light-accent)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <FaLink style={{ fontSize: '1.5rem', color: 'var(--primary-color)', flexShrink: 0 }} />
          <p style={{ margin: 0, color: 'var(--text-color)', fontSize: '0.9rem' }}>Google Calendar integration for automatic Meet links can be added later. For now, create a Meet or Zoom link manually and paste it when adding a slot.</p>
        </div>
      </section>
    </div>
  );
};

export default SlotsPage;
