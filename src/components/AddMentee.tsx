/* eslint-disable @typescript-eslint/no-unused-vars */
// ✅ ADD MENTEE - form có dropdown chọn mentor, nhóm và tiến độ học tập
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menteeApi, mentorApi, groupApi } from '../services/api';
import { FaArrowLeft } from 'react-icons/fa';

const AddMentee = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    interests: '',
    progress: 0,
    mentorId: '',
    groupId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [mentors, setMentors] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mentorRes, groupRes] = await Promise.all([
          mentorApi.getAll(),
          groupApi.getAll()
        ]);
        setMentors(mentorRes.data);
        setGroups(groupRes.data);
      } catch (err) {
        console.error('Error loading mentors or groups:', err);
      }
    };
    fetchData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phone && !/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must have at least 10 digits';
    }

    if (!formData.school.trim()) {
      newErrors.school = 'School/University is required';
    }

    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'Progress must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      if (name === 'progress') {
        return { ...prev, [name]: parseInt(value) || 0 };
      }
      return { ...prev, [name]: value };
    });

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const dataToSend = {
        ...formData,
        interests: formData.interests ? formData.interests.split(',').map(i => i.trim()) : []
      };
      await menteeApi.create(dataToSend);
      alert('Mentee added successfully!');
      navigate('/mentees');
    } catch (err) {
      alert('Error adding mentee. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f8f9fa, #f0f2f5)', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/mentees')}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontSize: '1.5rem',
              padding: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#5568d3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#667eea';
            }}>
            <FaArrowLeft />
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>
            👩‍🎓 Add New Mentee
          </h1>
        </div>

        {/* Form Container */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <form onSubmit={handleSubmit}>
            {/* Name Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter mentee name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.name ? '2px solid #e74c3c' : '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  if (!errors.name) e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.name ? '#e74c3c' : '#ddd';
                }}
              />
              {errors.name && (
                <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '0.4rem', margin: '0.4rem 0 0 0' }}>
                  ✗ {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="mentee@example.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.email ? '2px solid #e74c3c' : '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  if (!errors.email) e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.email ? '#e74c3c' : '#ddd';
                }}
              />
              {errors.email && (
                <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '0.4rem', margin: '0.4rem 0 0 0' }}>
                  ✗ {errors.email}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0912345678"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.phone ? '2px solid #e74c3c' : '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  if (!errors.phone) e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.phone ? '#e74c3c' : '#ddd';
                }}
              />
              {errors.phone && (
                <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '0.4rem', margin: '0.4rem 0 0 0' }}>
                  ✗ {errors.phone}
                </p>
              )}
            </div>

            {/* School Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                School / University *
              </label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleChange}
                placeholder="e.g., Hanoi University of Science and Technology"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.school ? '2px solid #e74c3c' : '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  if (!errors.school) e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.school ? '#e74c3c' : '#ddd';
                }}
              />
              {errors.school && (
                <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '0.4rem', margin: '0.4rem 0 0 0' }}>
                  ✗ {errors.school}
                </p>
              )}
            </div>

            {/* Interests Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                Interests (comma-separated)
              </label>
              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                placeholder="e.g., Frontend Development, Web Design, UI/UX"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#ddd';
                }}
              />
            </div>

            {/* Progress Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                Progress (%) *
              </label>
              <input
                type="number"
                name="progress"
                value={formData.progress}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="0-100"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.progress ? '2px solid #e74c3c' : '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  if (!errors.progress) e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.progress ? '#e74c3c' : '#ddd';
                }}
              />
              {errors.progress && (
                <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '0.4rem', margin: '0.4rem 0 0 0' }}>
                  ✗ {errors.progress}
                </p>
              )}
            </div>

            {/* Mentor Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                Assign Mentor
              </label>
              <select
                name="mentorId"
                value={formData.mentorId}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#ddd';
                }}>
                <option value="">-- Select Mentor (Optional) --</option>
                {mentors.map((mentor: any) => (
                  <option key={mentor._id} value={mentor._id}>
                    {mentor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Group Selection */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                Study Group
              </label>
              <select
                name="groupId"
                value={formData.groupId}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#ddd';
                }}>
                <option value="">-- Select Group (Optional) --</option>
                {groups.map((group: any) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.9rem',
                backgroundColor: loading ? '#ccc' : '#2c5f2d',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#245a27';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(44, 95, 45, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#2c5f2d';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}>
              {loading ? 'Adding Mentee...' : 'Add Mentee'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMentee;