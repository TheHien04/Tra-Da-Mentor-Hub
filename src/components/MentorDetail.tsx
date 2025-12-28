import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mentorApi } from '../services/api';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';

interface Mentor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  expertise?: string[];
  mentees?: string[];
  maxMentees?: number;
  bio?: string;
  mentorshipType?: string;
  duration?: string;
  createdAt?: string;
}

const MentorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('MentorDetail - id from params:', id);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        setLoading(true);
        const response = await mentorApi.getById(id!);
        setMentor(response.data);
      } catch (err) {
        setError('Failed to load mentor details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMentor();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${mentor?.name}? This action cannot be undone.`)) {
      try {
        await mentorApi.delete(id as string);
        alert('Mentor deleted successfully!');
        navigate('/mentors');
      } catch (err) {
        alert('Failed to delete mentor');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>Loading mentor data...</p>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ background: '#ffebee', padding: '2rem', borderRadius: '12px', color: '#c62828', textAlign: 'center' }}>
          <p>{error || 'Mentor not found'}</p>
          <button
            onClick={() => navigate('/mentors')}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#c62828',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Back to Mentors
          </button>
        </div>
      </div>
    );
  }

  const menteeCount = mentor.mentees?.length || 0;
  const maxMentees = mentor.maxMentees || 5;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f8f9fa, #f0f2f5)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Back Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/mentors')}
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
            Back to Mentors
          </button>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate(`/mentors/${id}/edit`)}
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
              Edit Profile
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '2.5rem',
          color: '#fff',
          marginBottom: '2rem',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', margin: 0 }}>{mentor.name}</h1>
          <p style={{ fontSize: '1rem', opacity: 0.9, margin: '0.5rem 0' }}>
            {mentor.mentorshipType === 'GROUP' ? '👥 Group Mentoring' : '👤 1:1 Mentoring'} • {mentor.duration === 'LONG_TERM' ? '🎯 Long-term' : '⚡ Short-term'}
          </p>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Contact & Capacity */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.5rem', marginTop: 0 }}>
              📋 Contact Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.25rem' }}>Email</p>
                <p style={{ fontSize: '1rem', color: '#333', wordBreak: 'break-all' }}>{mentor.email}</p>
              </div>
              {mentor.phone && (
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.25rem' }}>Phone</p>
                  <p style={{ fontSize: '1rem', color: '#333' }}>{mentor.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Capacity */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.5rem', marginTop: 0 }}>
              👥 Mentee Capacity
            </h2>
            <div style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%)',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#667eea',
                marginBottom: '0.5rem'
              }}>
                {menteeCount} / {maxMentees}
              </div>
              <p style={{ color: '#666', marginBottom: '1rem' }}>Mentees Assigned</p>
              <div style={{
                background: '#e0e0e0',
                height: '8px',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${(menteeCount / maxMentees) * 100}%`,
                  background: menteeCount >= maxMentees ? '#ff6b6b' : '#667eea',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '1rem' }}>
                {menteeCount >= maxMentees ? '🔴 At Capacity' : '🟢 Accepting Mentees'}
              </p>
            </div>
          </div>
        </div>

        {/* Bio */}
        {mentor.bio && (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.5rem', marginTop: 0 }}>
              📝 About
            </h2>
            <p style={{ color: '#555', lineHeight: '1.6', fontSize: '1rem' }}>{mentor.bio}</p>
          </div>
        )}

        {/* Expertise */}
        {mentor.expertise && mentor.expertise.length > 0 && (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.5rem', marginTop: 0 }}>
              💡 Expertise
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {mentor.expertise.map((skill, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorDetail;