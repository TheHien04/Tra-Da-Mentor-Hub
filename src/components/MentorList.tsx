/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mentorApi } from '../services/api';
import { FaUserTie } from 'react-icons/fa';
import Avatar from './Avatar';
import Badge from './Badge';
import TrackBadge from './TrackBadge';
import SearchFilter from './SearchFilter';
import EmptyState from './EmptyState';
import Skeleton from './Skeleton';

interface Mentor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  track?: 'tech' | 'economics' | 'marketing' | 'hr' | 'sales' | 'social' | 'business' | 'education' | 'startup' | 'design';
  expertise?: string[];
  mentees: string[];
  maxMentees?: number;
  bio?: string;
  mentorshipType?: string;
  duration?: string;
}

const MentorList = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ active: true, full: false });
  const [advancedFilters, setAdvancedFilters] = useState({
    mentorshipType: '',
    duration: '',
    expertise: ''
  });

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const response = await mentorApi.getAll();
        setMentors(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch mentors');
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      const matchesSearch =
        mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.expertise?.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const isFull = (mentor.mentees?.length || 0) >= (mentor.maxMentees || 10);
      const matchesFilter =
        (filters.active && !isFull) || (filters.full && isFull);

      // Advanced filters
      if (advancedFilters.mentorshipType && mentor.mentorshipType !== advancedFilters.mentorshipType) {
        return false;
      }
      if (advancedFilters.duration && mentor.duration !== advancedFilters.duration) {
        return false;
      }
      if (advancedFilters.expertise && (!mentor.expertise || !mentor.expertise.some(e => e.toLowerCase().includes(advancedFilters.expertise.toLowerCase())))) {
        return false;
      }

      return matchesSearch && matchesFilter;
    });
  }, [mentors, searchQuery, filters, advancedFilters]);

  const getStatusBadge = (mentor: Mentor) => {
    const menteeCount = mentor.mentees?.length || 0;
    const maxMentees = mentor.maxMentees || 10;
    const isFull = menteeCount >= maxMentees;

    if (isFull) {
      return <Badge status="full" label={`Full (${menteeCount}/${maxMentees})`} />;
    }
    return <Badge status="active" label={`Active (${menteeCount}/${maxMentees})`} />;
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await mentorApi.delete(id);
        setMentors(mentors.filter(m => m._id !== id));
        alert('Mentor deleted successfully');
      } catch (err) {
        setError('Failed to delete mentor');
      }
    }
  };

  return (
    <div style={{ width: '100%', padding: '2rem', minHeight: '100vh', background: '#f8f9fa' }}>
      <div style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
            <FaUserTie size={32} /> Manage Mentors
          </h1>
        <Link to="/mentors/add" className="btn btn-primary">
          + Add New
        </Link>
      </div>

      <SearchFilter
        onSearch={setSearchQuery}
        onFilter={(filters) => setFilters(filters as any)}
        filterOptions={[
          { label: 'Active', value: 'active', checked: true },
          { label: 'Full Capacity', value: 'full', checked: false }
        ]}
      />

      {/* Advanced Filters */}
      <div style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginTop: '1rem',
        marginBottom: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', color: '#333' }}>
            Track / Field
          </label>
          <select
            value={advancedFilters.mentorshipType}
            onChange={(e) => setAdvancedFilters({ ...advancedFilters, mentorshipType: e.target.value })}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
          >
            <option value="">All Fields</option>
            <option value="tech">💻 Technology</option>
            <option value="economics">📊 Economics</option>
            <option value="marketing">📢 Marketing</option>
            <option value="hr">👥 Human Resources</option>
            <option value="sales">💼 Sales</option>
            <option value="social">🌍 Social Studies</option>
            <option value="business">🏢 Business</option>
            <option value="education">🎓 Education</option>
            <option value="startup">🚀 Startup</option>
            <option value="design">🎨 Design</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', color: '#333' }}>
            Mentorship Type
          </label>
          <select
            value={advancedFilters.duration}
            onChange={(e) => setAdvancedFilters({ ...advancedFilters, duration: e.target.value })}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
          >
            <option value="">All Types</option>
            <option value="GROUP">👥 Group</option>
            <option value="ONE_ON_ONE">👤 1:1</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
            Duration
          </label>
          <select
            value={advancedFilters.duration}
            onChange={(e) => setAdvancedFilters({ ...advancedFilters, duration: e.target.value })}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
          >
            <option value="">All Durations</option>
            <option value="LONG_TERM">🎯 Long-term</option>
            <option value="SHORT_TERM">⚡ Short-term</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
            Expertise
          </label>
          <input
            type="text"
            placeholder="Search expertise..."
            value={advancedFilters.expertise}
            onChange={(e) => setAdvancedFilters({ ...advancedFilters, expertise: e.target.value })}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={() => {
              setAdvancedFilters({
                mentorshipType: '',
                duration: '',
                expertise: ''
              });
            }}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ececec';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5f5f5';
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}
        >
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                style={{
                  padding: '20px',
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <Skeleton count={3} height={16} />
              </div>
            ))}
        </div>
      ) : filteredMentors.length === 0 ? (
        <EmptyState
          icon="👨‍🏫"
          title="No Mentors Found"
          description={searchQuery ? 'Try adjusting your search' : 'Start by adding your first mentor'}
          actionLabel="+ Add Mentor"
          onAction={() => window.location.href = '/mentors/add'}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px'
          }}
        >
          {filteredMentors.map((mentor) => (
            <div
              key={mentor._id}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 8px 16px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              {/* Header with avatar and badges */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', position: 'relative' }}>
                <Avatar name={mentor.name} size="lg" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, color: '#1a1a1a', fontSize: '1.1rem', fontWeight: '700', flex: '1 0 100%' }}>
                      {mentor.name}
                    </h3>
                    <TrackBadge track={mentor.track} size="small" />
                    {(mentor.mentees?.length || 0) >= (mentor.maxMentees || 10) && (
                      <span style={{
                        background: '#ffd700',
                        color: '#1a1a1a',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        whiteSpace: 'nowrap'
                      }}>
                        ⭐ TOP
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '0.85rem',
                      color: '#666'
                    }}
                  >
                    {mentor.email}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span style={{ color: '#f39c12', fontSize: '1rem' }}>⭐⭐⭐⭐⭐</span>
                    <span style={{ fontSize: '0.8rem', color: '#999' }}>5.0 (12 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <div style={{ marginBottom: '12px' }}>
                {getStatusBadge(mentor)}
              </div>

              {/* Stats Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(10, 75, 57, 0.05) 0%, rgba(10, 75, 57, 0.02) 100%)',
                borderRadius: '8px',
                border: '1px solid rgba(10, 75, 57, 0.1)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '1.3rem', fontWeight: '700', color: '#0a4b39' }}>
                    {mentor.mentees?.length || 0}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>Mentees</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '1.3rem', fontWeight: '700', color: '#27ae60' }}>
                    87%
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>Success Rate</p>
                </div>
              </div>

              {/* Bio */}
              {mentor.bio && (
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: '#555',
                    margin: '0 0 12px 0',
                    lineHeight: '1.4'
                  }}
                >
                  {mentor.bio}
                </p>
              )}

              {/* Skills */}
              {mentor.expertise && mentor.expertise.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: '700', color: '#1a1a1a' }}>
                    🎯 Expertise:
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      gap: '6px',
                      flexWrap: 'wrap'
                    }}
                  >
                    {mentor.expertise.map((skill, i) => (
                      <span
                        key={i}
                        style={{
                          background: `linear-gradient(135deg, ${['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'][i % 5]}, ${['#764ba2', '#f5576c', '#00f2fe', '#38f9d7', '#f5a623'][i % 5]})`,
                          color: '#fff',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          boxShadow: `0 2px 8px ${['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'][i % 5]}40`
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              {mentor.phone && (
                <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 12px 0' }}>
                  📞 {mentor.phone}
                </p>
              )}

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: 'auto'
                }}
              >
                <Link
                  to={`/mentors/${mentor._id}`}
                  className="btn btn-secondary"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Details
                </Link>
                <button
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                  onClick={() => handleDelete(mentor._id, mentor.name)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default MentorList;