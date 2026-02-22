/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mentorApi } from '../services/api';
import { FaUserPlus } from 'react-icons/fa';

const AddMentor = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    expertise: '',
    bio: '',
    maxMentees: 10
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (formData.phone && !/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Phone should have at least 10 digits';
    if (formData.maxMentees < 1) newErrors.maxMentees = 'Max Mentees must be at least 1';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const dataToSend = {
        ...formData,
        expertise: formData.expertise
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0)
      };
      await mentorApi.create(dataToSend);
      navigate('/mentors');
    } catch (err) {
      setErrors({ submit: 'Error creating mentor. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', color: '#2c3e50' }}>
        <FaUserPlus size={32} /> Add New Mentor
      </h1>

      {errors.submit && (
        <div style={{ backgroundColor: '#ffe5e5', color: '#e74c3c', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            style={{
              width: '100%',
              padding: '12px',
              border: errors.name ? '2px solid #e74c3c' : '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
          {errors.name && <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '4px' }}>{errors.name}</p>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            style={{
              width: '100%',
              padding: '12px',
              border: errors.email ? '2px solid #e74c3c' : '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
          {errors.email && <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '4px' }}>{errors.email}</p>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1234567890"
            style={{
              width: '100%',
              padding: '12px',
              border: errors.phone ? '2px solid #e74c3c' : '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
          {errors.phone && <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '4px' }}>{errors.phone}</p>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
            Skills (comma separated)
          </label>
          <input
            type="text"
            name="expertise"
            value={formData.expertise}
            onChange={handleChange}
            placeholder="React, Node.js, TypeScript"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell about your experience..."
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
            Max Mentees *
          </label>
          <input
            type="number"
            name="maxMentees"
            min={1}
            value={formData.maxMentees}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              border: errors.maxMentees ? '2px solid #e74c3c' : '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
          {errors.maxMentees && <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '4px' }}>{errors.maxMentees}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2c5f2d',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = '#245a27';
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#2c5f2d';
          }}
        >
          {loading ? 'Creating...' : '✓ Create Mentor'}
        </button>
      </form>
    </div>
  );
};

export default AddMentor;
