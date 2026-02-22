import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mentorApi } from '../services/api';
import { FaArrowLeft } from 'react-icons/fa';

interface FormData {
  name: string;
  email: string;
  phone: string;
  expertise: string;
  bio: string;
  maxMentees: string;
  mentorshipType: string;
  duration: string;
}

const EditMentor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    expertise: '',
    bio: '',
    maxMentees: '5',
    mentorshipType: 'GROUP',
    duration: 'LONG_TERM'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        setLoading(true);
        console.log('Fetching mentor with id:', id);
        const response = await mentorApi.getById(id as string);
        console.log('Mentor response:', response);
        const mentor = response.data;
        
        // Ensure maxMentees is a string for the input field
        const maxMenteesValue = mentor.maxMentees ? String(mentor.maxMentees) : '5';
        
        setFormData({
          name: mentor.name || '',
          email: mentor.email || '',
          phone: mentor.phone || '',
          expertise: Array.isArray(mentor.expertise) ? mentor.expertise.join(', ') : (mentor.expertise || ''),
          bio: mentor.bio || '',
          maxMentees: maxMenteesValue,
          mentorshipType: mentor.mentorshipType || 'GROUP',
          duration: mentor.duration || 'LONG_TERM'
        });
        setError('');
        setLoading(false);
      } catch (err) {
        console.error('Error loading mentor:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error loading mentor data. Please try again.';
        setError(errorMessage);
        setLoading(false);
      }
    };

    if (id) {
      console.log('useEffect triggered with id:', id);
      fetchMentor();
    } else {
      console.warn('No id provided');
      setError('No mentor ID provided');
      setLoading(false);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (formData.phone && formData.phone.length < 10) {
      setError('Phone must be at least 10 digits');
      return false;
    }
    const maxMentees = parseInt(formData.maxMentees);
    if (isNaN(maxMentees) || maxMentees < 1) {
      setError('Max mentees must be at least 1');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitLoading(true);
      console.log('Submitting mentor update for id:', id);
      const dataToSend = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        expertise: formData.expertise
          .split(',')
          .map(e => e.trim())
          .filter(e => e.length > 0),
        bio: formData.bio.trim(),
        maxMentees: parseInt(formData.maxMentees),
        mentorshipType: formData.mentorshipType,
        duration: formData.duration
      };
      
      console.log('Data to send:', dataToSend);
      const response = await mentorApi.update(id as string, dataToSend);
      console.log('Update response:', response);
      alert('Mentor updated successfully!');
      navigate(`/mentors/${id}`);
    } catch (err) {
      console.error('Error updating mentor:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error updating mentor. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '1.1rem', color: '#666', margin: 0 }}>Loading mentor data...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '1.1rem', color: '#c62828', marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={() => navigate(`/mentors/${id}`)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '700px',
        width: '100%',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        padding: '2.5rem'
      }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(`/mentors/${id}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#667eea',
            fontSize: '1rem',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            transition: 'all 0.3s ease',
            padding: '0.5rem',
            borderRadius: '8px'
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(102, 126, 234, 0.1)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'none';
          }}
        >
          <FaArrowLeft size={16} />
          Back to Mentor
        </button>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1a1a1a',
          marginBottom: '0.5rem'
        }}>
          ✏️ Edit Mentor Profile
        </h1>
        <p style={{
          fontSize: '0.9rem',
          color: '#666',
          marginBottom: '2rem'
        }}>
          Update mentor information and settings
        </p>

        {error && (
          <div style={{
            padding: '1rem',
            background: '#ffebee',
            border: '1px solid #ef5350',
            color: '#c62828',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name & Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Phone & Max Mentees */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="E.g. 0912345678"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                Max Mentees *
              </label>
              <input
                type="number"
                name="maxMentees"
                value={formData.maxMentees}
                onChange={handleChange}
                min="1"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Mentorship Type & Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                Mentorship Type *
              </label>
              <select
                name="mentorshipType"
                value={formData.mentorshipType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                <option value="GROUP">👥 Group Mentoring</option>
                <option value="ONE_ON_ONE">👤 1:1 Mentoring</option>
              </select>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                Duration *
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                <option value="LONG_TERM">🎯 Long-term (&gt;6 months)</option>
                <option value="SHORT_TERM">⚡ Short-term (&lt;6 months)</option>
              </select>
            </div>
          </div>

          {/* Expertise */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              Expertise (comma-separated)
            </label>
            <input
              type="text"
              name="expertise"
              value={formData.expertise}
              onChange={handleChange}
              placeholder="E.g. React, Node.js, Python, Machine Learning"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Bio */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell mentees about your experience, teaching style, and what you're passionate about"
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={() => navigate(`/mentors/${id}`)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#f0f0f0',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#666',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e0e0e0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f0f0f0';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              style={{
                padding: '0.75rem 2rem',
                background: submitLoading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#fff',
                cursor: submitLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: submitLoading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!submitLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {submitLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMentor;
