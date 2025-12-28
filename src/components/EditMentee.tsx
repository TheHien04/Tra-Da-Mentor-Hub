import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { menteeApi } from '../services/api';
import { FaArrowLeft } from 'react-icons/fa';

interface FormData {
  name: string;
  email: string;
  phone: string;
  school: string;
  year: string;
  progress: string;
  interests: string;
  goals: string;
  notes: string;
}

const EditMentee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    school: '',
    year: '',
    progress: '0',
    interests: '',
    goals: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchMentee = async () => {
      try {
        const response = await menteeApi.getById(id as string);
        const mentee = response.data;
        setFormData({
          name: mentee.name || '',
          email: mentee.email || '',
          phone: mentee.phone || '',
          school: mentee.school || '',
          year: mentee.year || '',
          progress: mentee.progress || '0',
          interests: Array.isArray(mentee.interests) ? mentee.interests.join(', ') : '',
          goals: Array.isArray(mentee.goals) ? mentee.goals.join('\n') : '',
          notes: mentee.notes || ''
        });
        setLoading(false);
      } catch {
        setError('Error loading mentee data.');
        setLoading(false);
      }
    };

    if (id) fetchMentee();
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
    if (!formData.school.trim()) {
      setError('School is required');
      return false;
    }
    const progressNum = parseInt(formData.progress);
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      setError('Progress must be a number between 0 and 100');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitLoading(true);
      const dataToSend = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        school: formData.school.trim(),
        year: formData.year.trim(),
        progress: parseInt(formData.progress),
        interests: formData.interests
          .split(',')
          .map(i => i.trim())
          .filter(i => i.length > 0),
        goals: formData.goals
          .split('\n')
          .map(g => g.trim())
          .filter(g => g.length > 0),
        notes: formData.notes.trim()
      };

      await menteeApi.update(id as string, dataToSend);
      alert('Mentee updated successfully!');
      navigate(`/mentees/${id}`);
    } catch {
      setError('Error updating mentee. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>Loading mentee data...</p>
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
          onClick={() => navigate(`/mentees/${id}`)}
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
          Back to Mentee
        </button>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1a1a1a',
          marginBottom: '0.5rem'
        }}>
          ✏️ Edit Mentee Profile
        </h1>
        <p style={{
          fontSize: '0.9rem',
          color: '#666',
          marginBottom: '2rem'
        }}>
          Update mentee information and learning progress
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

          {/* Phone & School */}
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
                School *
              </label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleChange}
                placeholder="E.g. HUST, RMIT Vietnam"
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

          {/* Year & Progress */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                Year
              </label>
              <select
                name="year"
                value={formData.year}
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
                <option value="">-- Select Year --</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
                <option value="High School">High School</option>
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
                Progress (0-100) *
              </label>
              <input
                type="number"
                name="progress"
                value={formData.progress}
                onChange={handleChange}
                min="0"
                max="100"
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

          {/* Interests */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              Interests (comma-separated)
            </label>
            <input
              type="text"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="E.g. Web Development, Data Science, Machine Learning"
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

          {/* Goals */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              Learning Goals (one per line)
            </label>
            <textarea
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              placeholder="E.g. Learn React&#10;Master Node.js&#10;Build a portfolio project"
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

          {/* Notes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              Personal Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes about this mentee"
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

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={() => navigate(`/mentees/${id}`)}
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

export default EditMentee;
