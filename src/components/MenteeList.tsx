/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { menteeApi } from '../services/api';
import { FaUserGraduate, FaTrash, FaArrowRight } from 'react-icons/fa';
import Avatar from './Avatar';
import TrackBadge from './TrackBadge';
import SearchFilter from './SearchFilter';
import EmptyState from './EmptyState';
import Skeleton from './Skeleton';
import ProgressBar from './ProgressBar';

interface Mentee {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  school?: string;
  track?: 'tech' | 'economics' | 'marketing' | 'hr' | 'sales' | 'social' | 'business' | 'education' | 'startup' | 'design';
  interests?: string[];
  progress: number;
  mentorId?: string;
  groupId?: string;
  createdAt?: string;
}

const MenteeList = () => {
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    'just-started': true,
    'in-progress': true,
    'completed': true
  });
  const [advancedFilters, setAdvancedFilters] = useState({
    mentorshipType: '',
    school: '',
    progressMin: '',
    progressMax: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        setLoading(true);
        const response = await menteeApi.getAll();
        setMentees(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch mentees');
        setLoading(false);
      }
    };
    fetchMentees();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await menteeApi.delete(id);
        setMentees(mentees.filter(m => m._id !== id));
        setSuccessMessage(`${name} has been removed`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError('Failed to delete mentee');
      }
    }
  };

  const filteredMentees = useMemo(() => {
    return mentees.filter(mentee => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        mentee.name.toLowerCase().includes(searchLower) ||
        mentee.email.toLowerCase().includes(searchLower) ||
        (mentee.school && mentee.school.toLowerCase().includes(searchLower)) ||
        (mentee.interests && mentee.interests.some(i => i.toLowerCase().includes(searchLower)));

      // Status filter
      let matchesStatus = false;
      if (mentee.progress === 0 && filters['just-started']) matchesStatus = true;
      if (mentee.progress > 0 && mentee.progress < 100 && filters['in-progress']) matchesStatus = true;
      if (mentee.progress === 100 && filters['completed']) matchesStatus = true;

      // Advanced filters
      if (advancedFilters.mentorshipType && (mentee as any).mentorshipType !== advancedFilters.mentorshipType) {
        return false;
      }
      if (advancedFilters.school && (!mentee.school || !mentee.school.toLowerCase().includes(advancedFilters.school.toLowerCase()))) {
        return false;
      }
      if (advancedFilters.progressMin !== '') {
        const min = parseInt(advancedFilters.progressMin);
        if (mentee.progress < min) return false;
      }
      if (advancedFilters.progressMax !== '') {
        const max = parseInt(advancedFilters.progressMax);
        if (mentee.progress > max) return false;
      }

      return matchesSearch && matchesStatus;
    });
  }, [mentees, searchQuery, filters, advancedFilters]);

  const getProgressStatus = (progress: number) => {
    if (progress === 100) return 'Completed';
    if (progress > 0) return 'In Progress';
    return 'Just Started';
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return '#27ae60';
    if (progress > 50) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #eef2f7 100%)', padding: '2rem' }}>
      <div style={{ width: '100%' }}>
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">
            <FaUserGraduate size={32} style={{ color: '#0a4b39' }} /> Manage Mentees
          </h1>
          <p className="page-description">
            View, manage, and organize all mentees in the system. Total: {mentees.length} | Completed: {mentees.filter(m => m.progress === 100).length}
          </p>
          <Link to="/mentees/add" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            + Add New Mentee
          </Link>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{
            background: '#d4edda',
            border: '1px solid #c3e6cb',
            color: '#155724',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            ✓ {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            color: '#721c24',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            ✗ {error}
          </div>
        )}

        {/* Search and Filter */}
        <div style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          width: '100%'
        }}>
          <SearchFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters as any}
            setFilters={(f) => setFilters(f as any)}
            onSearch={() => {}}
            onFilter={() => {}}
            placeholder="Search mentees by name, school, or interests..."
          />

          {/* Advanced Filters */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #eee',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            width: '100%'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                Mentorship Type
              </label>
              <select
                value={advancedFilters.school}
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, school: e.target.value })}
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
                School
              </label>
              <input
                type="text"
                placeholder="Filter by school..."
                value={advancedFilters.progressMin}
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, progressMin: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                Progress Min (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={advancedFilters.progressMin}
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, progressMin: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                Progress Max (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={advancedFilters.progressMax}
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, progressMax: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Clear Filters Button */}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={() => {
                  setAdvancedFilters({
                    mentorshipType: '',
                    school: '',
                    progressMin: '',
                    progressMax: ''
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
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.5rem'
          }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <Skeleton count={4} />
              </div>
            ))}
          </div>
        ) : filteredMentees.length === 0 ? (
          <EmptyState
            icon={<FaUserGraduate size={48} />}
            title="No Mentees Found"
            description={searchQuery ? "Try adjusting your search criteria" : "Get started by adding your first mentee"}
            actionLabel="Add Mentee"
            onAction={() => window.location.href = '/mentees/add'}
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.5rem',
            width: '100%'
          }}>
            {filteredMentees.map((mentee) => (
              <div key={mentee._id} style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flex: 1 }}>
                    <Avatar name={mentee.name} size="md" />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1a1a1a' }}>
                          {mentee.name}
                        </h3>
                      </div>
                      <TrackBadge track={mentee.track} size="small" />
                      <div style={{ marginTop: '0.5rem' }}>
                        {mentee.progress === 100 && (
                          <span style={{
                            background: '#27ae60',
                            color: '#fff',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            whiteSpace: 'nowrap'
                          }}>
                            ✓ COMPLETED
                          </span>
                        )}
                        {mentee.progress >= 80 && mentee.progress < 100 && (
                          <span style={{
                            background: '#f39c12',
                            color: '#fff',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            whiteSpace: 'nowrap'
                          }}>
                            🚀 NEAR FINISH
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>{mentee.email}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link
                      to={`/mentees/${mentee._id}`}
                      style={{
                        backgroundColor: '#667eea',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.5rem 0.75rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#5568d3';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#667eea';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}>
                      <FaArrowRight size={12} /> View
                    </Link>
                    <button
                      onClick={() => handleDelete(mentee._id, mentee.name)}
                      style={{
                        backgroundColor: '#e74c3c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.5rem 0.75rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#c0392b';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#e74c3c';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}>
                      <FaTrash size={12} /> Delete
                    </button>
                  </div>
                </div>

                {/* School Info */}
                {mentee.school && (
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem', margin: '0 0 0.75rem 0' }}>
                    🎓 {mentee.school}
                  </p>
                )}

                {/* Interests */}
                {mentee.interests && mentee.interests.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {mentee.interests.slice(0, 3).map((interest) => (
                      <span key={interest} style={{
                        display: 'inline-block',
                        padding: '0.35rem 0.75rem',
                        background: `linear-gradient(135deg, ${['#667eea', '#f093fb', '#4facfe'][Math.random() * 3 | 0]}, ${['#764ba2', '#f5576c', '#00f2fe'][Math.random() * 3 | 0]})`,
                        color: '#fff',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        🎯 {interest}
                      </span>
                    ))}
                    {mentee.interests.length > 3 && (
                      <span style={{
                        display: 'inline-block',
                        padding: '0.35rem 0.75rem',
                        backgroundColor: '#f0f0f0',
                        color: '#666',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        +{mentee.interests.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Progress */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a1a1a' }}>Progress</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: getProgressColor(mentee.progress) }}>
                      {mentee.progress}%
                    </span>
                  </div>
                  <ProgressBar percentage={mentee.progress} color={getProgressColor(mentee.progress)} />
                </div>

                {/* Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.4rem 0.8rem',
                    backgroundColor:
                      mentee.progress === 100
                        ? '#d4edda'
                        : mentee.progress > 50
                          ? '#fff3cd'
                          : '#f8d7da',
                    color:
                      mentee.progress === 100
                        ? '#155724'
                        : mentee.progress > 50
                          ? '#856404'
                          : '#721c24',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {getProgressStatus(mentee.progress)}
                  </span>
                  <p style={{ fontSize: '0.75rem', color: '#999', margin: 0 }}>
                    ID: {mentee._id.substring(0, 6)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenteeList;