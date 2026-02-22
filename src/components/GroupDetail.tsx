/* eslint-disable @typescript-eslint/no-unused-vars */
// ✅ GROUP DETAIL - nâng cấp hiển thị nhóm + mentor + mentees
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { groupApi } from '../services/api';

interface Mentor {
  _id: string;
  name: string;
  email: string;
}

interface Mentee {
  _id: string;
  name: string;
  email: string;
  progress: string;
}

interface Group {
  _id: string;
  name: string;
  description?: string;
  mentor?: Mentor;
  mentees: Mentee[];
  maxSize?: number;
  meetingSchedule?: {
    frequency: string;
    dayOfWeek: string;
    time: string;
  };
}

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        const response = await groupApi.getByIdFull(id as string);
        console.log('Group data:', response.data);
        setGroup(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching group:', err);
        setError('Error loading group information.');
        setLoading(false);
      }
    };
    fetchGroup();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${group?.name}? This action cannot be undone.`)) {
      try {
        await groupApi.delete(id as string);
        alert('Group deleted successfully!');
        navigate('/groups');
      } catch (err) {
        alert('Failed to delete group');
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading group data...</div>;
  if (error) return <div style={{ padding: '2rem', color: '#e74c3c', textAlign: 'center' }}>{error}</div>;
  if (!group) return <div style={{ padding: '2rem', textAlign: 'center' }}>Group not found.</div>;

  const formatMeetingSchedule = () => {
    if (!group.meetingSchedule) return '-';
    const { frequency, dayOfWeek, time } = group.meetingSchedule;
    return `${frequency} - ${dayOfWeek} at ${time}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f8f9fa, #f0f2f5)', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Back Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/groups')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              color: '#667eea',
              fontSize: '1rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(102, 126, 234, 0.1)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'none';
            }}
          >
            <FaArrowLeft size={16} />
            Back to Groups
          </button>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate(`/groups/${id}/edit`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <FaEdit size={16} />
              Edit Group
            </button>
            <button
              onClick={handleDelete}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#ff6b6b',
                border: 'none',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 107, 107, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <FaTrash size={16} />
              Delete
            </button>
          </div>
        </div>

        {/* Header */}
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          borderLeft: '6px solid #2c5f2d'
        }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>
            👥 {group.name}
          </h1>
        </div>

        {/* Group Information */}
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1rem' }}>
            📋 Group Information
          </h2>
          <div style={{ lineHeight: '1.8' }}>
            <p style={{ marginBottom: '1rem' }}>
              <strong>Description:</strong><br />
              {group.description || '-'}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Meeting Schedule:</strong><br />
              {formatMeetingSchedule()}
            </p>
            <p style={{ marginBottom: '0' }}>
              <strong>Max Size:</strong> {group.maxSize || '-'}
            </p>
          </div>
        </div>

        {/* Mentor Information */}
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1rem' }}>
            👨‍🏫 Assigned Mentor
          </h2>
          {group.mentor ? (
            <div style={{ padding: '1rem', backgroundColor: '#f0f8ff', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
                {group.mentor.name}
              </p>
              <p style={{ margin: '0.5rem 0', color: '#666' }}>
                📧 {group.mentor.email || 'N/A'}
              </p>
            </div>
          ) : (
            <p style={{ color: '#999' }}>No mentor assigned yet.</p>
          )}
        </div>

        {/* Mentees List */}
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1rem' }}>
            👩‍🎓 Mentees ({group.mentees?.length || 0})
          </h2>
          {!group.mentees || group.mentees.length === 0 ? (
            <p style={{ color: '#999' }}>No mentees in this group yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.95rem'
              }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {group.mentees.map((mentee) => (
                    <tr key={mentee._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '1rem' }}>{mentee.name}</td>
                      <td style={{ padding: '1rem', color: '#666' }}>{mentee.email}</td>
                      <td style={{ padding: '1rem' }}>{mentee.progress || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;