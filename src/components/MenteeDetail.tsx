import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { menteeApi, mentorApi } from '../services/api';
import { FaArrowLeft, FaUserGraduate, FaUserTie, FaCalendar, FaMailBulk, FaPhone, FaTrophy, FaTrash, FaEdit } from 'react-icons/fa';

interface Mentee {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  progress?: number;
  school?: string;
  year?: string;
  goals?: string[];
  notes?: string;
  joinDate?: string;
  mentorshipType?: string;
  mentor?: string | { _id: string; name: string };
  group?: string | { _id: string; name: string };
  interests?: string[];
}

interface Mentor {
  _id: string;
  name: string;
  expertise?: string[];
  mentorshipType?: string;
  duration?: string;
}

const MenteeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentee, setMentee] = useState<Mentee | null>(null);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentee = async () => {
      try {
        setLoading(true);
        const response = await menteeApi.getById(id as string);
        const menteeData = response.data;
        setMentee(menteeData);

        // Fetch mentor if available
        if (menteeData.mentor && typeof menteeData.mentor === 'string') {
          try {
            const mentorRes = await mentorApi.getById(menteeData.mentor);
            setMentor(mentorRes.data);
          } catch {
            // Mentor not found, continue without it
          }
        }

        setLoading(false);
      } catch (err) {
        setError('Error loading mentee information.');
        setLoading(false);
      }
    };
    fetchMentee();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>Loading mentee data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ background: '#ffebee', padding: '2rem', borderRadius: '12px', color: '#c62828', textAlign: 'center' }}>
          <p>{error}</p>
          <button
            onClick={() => navigate('/mentees')}
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
            Back to Mentees
          </button>
        </div>
      </div>
    );
  }

  if (!mentee) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>Mentee not found.</p>
      </div>
    );
  }

  const progressPercent = mentee.progress || 0;
  const progressColor = progressPercent < 30 ? '#ff6b6b' : progressPercent < 70 ? '#ffa94d' : '#51cf66';

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${mentee.name}? This action cannot be undone.`)) {
      try {
        await menteeApi.delete(id as string);
        alert('Mentee deleted successfully!');
        navigate('/mentees');
      } catch (err) {
        alert('Failed to delete mentee');
      }
    }
  };

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
            onClick={() => navigate('/mentees')}
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
            Back to Mentees
          </button>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate(`/mentees/${id}/edit`)}
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
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem' }}>
            <div style={{
              width: '100px',
              height: '100px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              flexShrink: 0
            }}>
              <FaUserGraduate />
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{mentee.name}</h1>
              <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                {mentee.school && mentee.year ? `${mentee.school} • Year ${mentee.year}` : 'Student'}
              </p>
              {mentee.mentorshipType && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <span style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    {mentee.mentorshipType === 'GROUP' ? '👥 Group Mentoring' : '👤 1:1 Mentoring'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Left Column */}
          <div>
            {/* Progress Section */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaTrophy style={{ color: '#ffc107' }} />
                Learning Progress
              </h2>
              <div style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%)',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: '#fff',
                  margin: '0 auto 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `6px solid ${progressColor}`,
                  boxShadow: `0 0 0 3px ${progressColor}20`
                }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: progressColor }}>{progressPercent}%</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>Complete</div>
                </div>
                <div style={{
                  background: '#e0e0e0',
                  height: '8px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: progressColor,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  {progressPercent < 30 && 'Just started - Keep going!'}
                  {progressPercent >= 30 && progressPercent < 70 && 'Good progress - Stay focused!'}
                  {progressPercent >= 70 && 'Almost there - Final stretch!'}
                </p>
              </div>
            </div>

            {/* Mentor Information */}
            {mentor && (
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '2rem'
              }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaUserTie />
                  Assigned Mentor
                </h2>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(245, 87, 108, 0.1) 0%, rgba(245, 87, 108, 0.05) 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 87, 108, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => navigate(`/mentors/${mentor._id}`)}
                >
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>{mentor.name}</p>
                  {mentor.expertise && (
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                      <strong>Expertise:</strong> {mentor.expertise.join(', ')}
                    </p>
                  )}
                  {mentor.mentorshipType && (
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                      <strong>Type:</strong> {mentor.mentorshipType === 'GROUP' ? 'Group Mentoring' : '1:1 Mentoring'}
                    </p>
                  )}
                  {mentor.duration && (
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>
                      <strong>Duration:</strong> {mentor.duration === 'LONG_TERM' ? 'Long-term' : 'Short-term'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div>
            {/* Contact Information */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.5rem' }}>
                📋 Contact Information
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FaMailBulk style={{ color: '#667eea', fontSize: '1.2rem', minWidth: '24px' }} />
                  <div>
                    <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.25rem' }}>Email</p>
                    <p style={{ fontSize: '1rem', color: '#333', wordBreak: 'break-all' }}>{mentee.email}</p>
                  </div>
                </div>
                {mentee.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FaPhone style={{ color: '#667eea', fontSize: '1.2rem', minWidth: '24px' }} />
                    <div>
                      <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.25rem' }}>Phone</p>
                      <p style={{ fontSize: '1rem', color: '#333' }}>{mentee.phone}</p>
                    </div>
                  </div>
                )}
                {mentee.joinDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FaCalendar style={{ color: '#667eea', fontSize: '1.2rem', minWidth: '24px' }} />
                    <div>
                      <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.25rem' }}>Joined Date</p>
                      <p style={{ fontSize: '1rem', color: '#333' }}>
                        {new Date(mentee.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interests */}
            {mentee.interests && mentee.interests.length > 0 && (
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '2rem'
              }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.5rem' }}>
                  💡 Interests
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {mentee.interests.map((interest, idx) => (
                    <span key={idx} style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}>
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Goals Section */}
        {mentee.goals && mentee.goals.length > 0 && (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#f5576c' }}>🎯</span>
              Learning Goals
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {mentee.goals.map((goal, idx) => (
                <div key={idx} style={{
                  padding: '1.2rem',
                  background: 'linear-gradient(135deg, rgba(245, 87, 108, 0.1) 0%, rgba(245, 87, 108, 0.05) 100%)',
                  borderLeft: '4px solid #f5576c',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  color: '#333',
                  lineHeight: '1.5'
                }}>
                  ✓ {goal}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes Section */}
        {mentee.notes && (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.5rem' }}>
              📝 Personal Notes
            </h2>
            <div style={{
              padding: '1.5rem',
              background: '#f9f9f9',
              borderRadius: '8px',
              borderLeft: '4px solid #ffc107',
              fontSize: '0.95rem',
              color: '#333',
              lineHeight: '1.6'
            }}>
              {mentee.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenteeDetail;