import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { groupApi } from '../services/api';

interface Group {
  _id: string;
  name: string;
  description?: string;
  mentorId: string;
  mentorName?: string;
  frequency: string;
  dayOfWeek: string;
  time: string;
  members?: string[];
  createdAt?: string;
}

interface Mentor {
  _id: string;
  name: string;
  expertise: string[];
}

const EditGroup = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [, setGroup] = useState<Group | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mentorId: '',
    frequency: '',
    dayOfWeek: '',
    time: ''
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const frequencies = ['Weekly', 'Bi-weekly', 'Monthly'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupRes, mentorsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/groups/${id}`),
          fetch('http://localhost:5000/api/mentors')
        ]);

        if (!groupRes.ok) throw new Error('Group not found');
        if (!mentorsRes.ok) throw new Error('Failed to fetch mentors');

        const groupData = await groupRes.json();
        const mentorsData = await mentorsRes.json();

        setGroup(groupData);
        setMentors(mentorsData);
        setFormData({
          name: groupData.name || '',
          description: groupData.description || '',
          mentorId: groupData.mentorId || '',
          frequency: groupData.frequency || 'Weekly',
          dayOfWeek: groupData.dayOfWeek || 'Monday',
          time: groupData.time || '19:00'
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load group');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      newErrors.name = 'Group name must be at least 3 characters';
    }

    if (!formData.mentorId.trim()) {
      newErrors.mentorId = 'Please select a mentor';
    }

    if (!formData.dayOfWeek.trim()) {
      newErrors.dayOfWeek = 'Please select a day';
    }

    if (!formData.time.trim()) {
      newErrors.time = 'Please select a time';
    }

    if (!formData.frequency.trim()) {
      newErrors.frequency = 'Please select a frequency';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const dataToSend = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        mentorId: formData.mentorId,
        frequency: formData.frequency,
        dayOfWeek: formData.dayOfWeek,
        time: formData.time
      };

      await groupApi.update(id!, dataToSend);
      alert('Group updated successfully!');
      navigate(`/groups/${id}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update group';
      alert(errorMsg);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff'
      }}>
        <p style={{ fontSize: '1.1rem' }}>Loading group data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
      }}>
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '12px',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#c62828', fontSize: '1rem' }}>{error}</p>
          <button
            onClick={() => navigate('/groups')}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(`/groups/${id}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#fff',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          <FaArrowLeft size={16} />
          Back to Group
        </button>

        {/* Form Card */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginTop: 0
          }}>
            Edit Group
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Group Name */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#333',
                fontSize: '0.95rem'
              }}>
                Group Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., AI & Machine Learning"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: errors.name ? '2px solid #c62828' : '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  if (!errors.name) e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.name ? '#c62828' : '#e0e0e0';
                }}
              />
              {errors.name && (
                <p style={{ color: '#c62828', fontSize: '0.85rem', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#333',
                fontSize: '0.95rem'
              }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Group description and topics..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  resize: 'vertical'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              />
            </div>

            {/* Mentor */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#333',
                fontSize: '0.95rem'
              }}>
                Select Mentor *
              </label>
              <select
                name="mentorId"
                value={formData.mentorId}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: errors.mentorId ? '2px solid #c62828' : '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  if (!errors.mentorId) e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.mentorId ? '#c62828' : '#e0e0e0';
                }}
              >
                <option value="">Choose a mentor...</option>
                {mentors.map(mentor => (
                  <option key={mentor._id} value={mentor._id}>
                    {mentor.name} {mentor.expertise?.length > 0 && `(${mentor.expertise.join(', ')})`}
                  </option>
                ))}
              </select>
              {errors.mentorId && (
                <p style={{ color: '#c62828', fontSize: '0.85rem', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
                  {errors.mentorId}
                </p>
              )}
            </div>

            {/* Frequency */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#333',
                fontSize: '0.95rem'
              }}>
                Frequency *
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: errors.frequency ? '2px solid #c62828' : '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  if (!errors.frequency) e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.frequency ? '#c62828' : '#e0e0e0';
                }}
              >
                {frequencies.map(freq => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
              {errors.frequency && (
                <p style={{ color: '#c62828', fontSize: '0.85rem', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
                  {errors.frequency}
                </p>
              )}
            </div>

            {/* Day of Week */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#333',
                fontSize: '0.95rem'
              }}>
                Day of Week *
              </label>
              <select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: errors.dayOfWeek ? '2px solid #c62828' : '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  if (!errors.dayOfWeek) e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.dayOfWeek ? '#c62828' : '#e0e0e0';
                }}
              >
                {daysOfWeek.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              {errors.dayOfWeek && (
                <p style={{ color: '#c62828', fontSize: '0.85rem', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
                  {errors.dayOfWeek}
                </p>
              )}
            </div>

            {/* Time */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#333',
                fontSize: '0.95rem'
              }}>
                Time *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: errors.time ? '2px solid #c62828' : '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  if (!errors.time) e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.time ? '#c62828' : '#e0e0e0';
                }}
              />
              {errors.time && (
                <p style={{ color: '#c62828', fontSize: '0.85rem', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
                  {errors.time}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => navigate(`/groups/${id}`)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: '#f5f5f5',
                  color: '#333',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ececec';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f5f5f5';
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGroup;
