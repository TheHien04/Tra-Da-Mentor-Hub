import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupApi, mentorApi } from '../services/api';
import { FaArrowLeft } from 'react-icons/fa';

interface FormData {
  name: string;
  description: string;
  mentorId: string;
  frequency: string;
  dayOfWeek: string;
  time: string;
}

interface Mentor {
  _id: string;
  name: string;
  expertise?: string[];
}

const AddGroup = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    mentorId: '',
    frequency: 'Weekly',
    dayOfWeek: 'Monday',
    time: '19:00'
  });
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await mentorApi.getAll();
        setMentors(res.data);
      } catch {
        setError('Error loading mentors.');
      }
    };
    fetchMentors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Group name is required');
      return false;
    }
    if (formData.name.trim().length < 3) {
      setError('Group name must be at least 3 characters');
      return false;
    }
    if (!formData.mentorId) {
      setError('Please select a mentor');
      return false;
    }
    if (!formData.dayOfWeek.trim()) {
      setError('Day of week is required');
      return false;
    }
    if (!formData.time.trim()) {
      setError('Time is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const dataToSend = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        mentorId: formData.mentorId,
        meetingSchedule: {
          frequency: formData.frequency,
          dayOfWeek: formData.dayOfWeek,
          time: formData.time
        }
      };
      await groupApi.create(dataToSend);
      alert('Group created successfully!');
      navigate('/groups');
    } catch {
      setError('Error creating group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        padding: '2.5rem'
      }}>
        {/* Back Button */}
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
          Back to Groups
        </button>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1a1a1a',
          marginBottom: '0.5rem'
        }}>
          📚 Create Study Group
        </h1>
        <p style={{
          fontSize: '0.9rem',
          color: '#666',
          marginBottom: '2rem'
        }}>
          Build a community and organize collaborative learning
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
          {/* Group Name */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              Group Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="E.g. Frontend Masters, Data Science Circle"
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

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the group's focus, topics, and goals"
              rows={3}
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

          {/* Mentor Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              Assigned Mentor *
            </label>
            <select
              name="mentorId"
              value={formData.mentorId}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option value="">-- Select Mentor --</option>
              {mentors.map((mentor) => (
                <option key={mentor._id} value={mentor._id}>
                  {mentor.name} {mentor.expertise ? `(${mentor.expertise.join(', ')})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Meeting Schedule */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                Frequency *
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Monthly">Monthly</option>
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
                Day of Week *
              </label>
              <select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
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
                Time (HH:MM) *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={() => navigate('/groups')}
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
              disabled={loading}
              style={{
                padding: '0.75rem 2rem',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGroup;