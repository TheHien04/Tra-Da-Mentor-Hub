import { useState, useMemo } from 'react';
import { FaQuoteLeft, FaStar, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

interface Testimonial {
  _id: string;
  menteeName: string;
  mentorName: string;
  content: string;
  rating: number;
  track: 'career' | 'personal' | 'soft_skills';
  date: string;
  status: 'PUBLISHED' | 'PENDING' | 'REJECTED';
}

const TestimonialsPage = () => {
  console.log('TestimonialsPage component loaded');
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      _id: 't1',
      menteeName: 'Dat Do',
      mentorName: 'Huy Hoang',
      content: 'Before mentoring, my worldview was limited to university or factory work. Thanks to Huy Hoang\'s insightful questions and interesting sharing, I was motivated to explore beyond my boundaries. Now I\'m part of Thinkmay - Southeast Asia\'s first CloudPC startup.',
      rating: 5,
      track: 'career',
      date: '2025-12-15',
      status: 'PUBLISHED'
    },
    {
      _id: 't2',
      menteeName: 'Huong Giang Nguyen',
      mentorName: 'Linh Nguyen',
      content: 'The mentoring program helped me understand myself better, manage emotions, and develop soft skills. Thank you so much for your dedication and patience throughout the mentoring process.',
      rating: 5,
      track: 'personal',
      date: '2025-12-10',
      status: 'PUBLISHED'
    },
    {
      _id: 't3',
      menteeName: 'Minh Khoa Tran',
      mentorName: 'Viet Hoang',
      content: 'My mentor helped me build a clear career roadmap and develop leadership skills. Very helpful!',
      rating: 5,
      track: 'soft_skills',
      date: '2025-12-08',
      status: 'PUBLISHED'
    },
    {
      _id: 't4',
      menteeName: 'Thanh Tu Pham',
      mentorName: 'Anh Duong Nguyen',
      content: 'The mentoring sessions are very detailed and helped me solve many work-related issues. I learned a lot from the mentor\'s experience.',
      rating: 4,
      track: 'career',
      date: '2025-12-05',
      status: 'PUBLISHED'
    },
    {
      _id: 't5',
      menteeName: 'Minh Quan Hoang',
      mentorName: 'Minh Nhat Pham',
      content: 'This mentoring program is very beneficial. I learned a lot and developed both technical and soft skills.',
      rating: 4,
      track: 'career',
      date: '2025-12-02',
      status: 'PENDING'
    },
    {
      _id: 't6',
      menteeName: 'Huong Le Thi',
      mentorName: 'Van Hung Tran',
      content: 'The mentor is very dedicated and always ready to help. I am very satisfied with the mentoring quality.',
      rating: 5,
      track: 'personal',
      date: '2025-11-28',
      status: 'PUBLISHED'
    },
    {
      _id: 't7',
      menteeName: 'Huong Ngo Thi',
      mentorName: 'Linh Nguyen',
      content: 'Good course, but the content was off-topic and not well-organized.',
      rating: 2,
      track: 'career',
      date: '2025-11-25',
      status: 'REJECTED'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PUBLISHED' | 'PENDING' | 'REJECTED'>('PUBLISHED');
  const [filterTrack, setFilterTrack] = useState<'ALL' | 'career' | 'personal' | 'soft_skills'>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('gallery');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    menteeName: '',
    mentorName: '',
    content: '',
    rating: 5,
    track: 'career' as 'career' | 'personal' | 'soft_skills'
  });

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter(t => {
      const matchesSearch = 
        t.menteeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.mentorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
      const matchesTrack = filterTrack === 'ALL' || t.track === filterTrack;

      return matchesSearch && matchesStatus && matchesTrack;
    });
  }, [testimonials, searchQuery, filterStatus, filterTrack]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return '#27ae60';
      case 'PENDING':
        return '#f39c12';
      case 'REJECTED':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return '✓ Published';
      case 'PENDING':
        return '⏳ Pending';
      case 'REJECTED':
        return '✗ Rejected';
      default:
        return status;
    }
  };

  const getTrackLabel = (track: string) => {
    switch (track) {
      case 'career':
        return '💼 Career';
      case 'personal':
        return '🌟 Personal Development';
      case 'soft_skills':
        return '🎯 Soft Skills';
      default:
        return track;
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Confirm delete testimonial from ${name}?`)) {
      setTestimonials(testimonials.filter(t => t._id !== id));
    }
  };

  const handleAddTestimonial = () => {
    if (!newTestimonial.menteeName || !newTestimonial.mentorName || !newTestimonial.content) {
      alert('Please fill in all required fields');
      return;
    }

    const testimonial: Testimonial = {
      _id: `t_${Date.now()}`,
      menteeName: newTestimonial.menteeName,
      mentorName: newTestimonial.mentorName,
      content: newTestimonial.content,
      rating: newTestimonial.rating,
      track: newTestimonial.track,
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING'
    };

    setTestimonials([...testimonials, testimonial]);
    setShowAddModal(false);
    setNewTestimonial({
      menteeName: '',
      mentorName: '',
      content: '',
      rating: 5,
      track: 'career'
    });
  };

  const handleApprove = (id: string) => {
    setTestimonials(testimonials.map(t => 
      t._id === id ? { ...t, status: 'PUBLISHED' } : t
    ));
  };

  const handleReject = (id: string) => {
    setTestimonials(testimonials.map(t => 
      t._id === id ? { ...t, status: 'REJECTED' } : t
    ));
  };

  const stats = {
    total: testimonials.length,
    published: testimonials.filter(t => t.status === 'PUBLISHED').length,
    pending: testimonials.filter(t => t.status === 'PENDING').length,
    rejected: testimonials.filter(t => t.status === 'REJECTED').length,
    averageRating: (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f8f9fa, #f0f2f5)', padding: '2rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FaQuoteLeft size={32} style={{ color: '#667eea' }} /> 💬 Reviews & Testimonials
          </h1>
          <p style={{ color: '#666', fontSize: '0.95rem', margin: 0 }}>
            Total: {stats.total} | Published: {stats.published} | Pending: {stats.pending} | Rejected: {stats.rejected}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            background: '#f0f0f0',
            padding: '0.5rem',
            borderRadius: '8px'
          }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '0.5rem 1rem',
                background: viewMode === 'list' ? '#667eea' : 'transparent',
                color: viewMode === 'list' ? '#fff' : '#666',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
              title="List View"
            >
              ☰ List
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              style={{
                padding: '0.5rem 1rem',
                background: viewMode === 'gallery' ? '#667eea' : 'transparent',
                color: viewMode === 'gallery' ? '#fff' : '#666',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
              title="Gallery View"
            >
              🖼️ Gallery
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: '#667eea',
              color: '#fff',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5568d3';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#667eea';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <FaPlus /> Add Testimonial
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #27ae60, #229954)',
          color: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.9 }}>Published</p>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold' }}>{stats.published}</h3>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #f39c12, #e67e22)',
          color: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.9 }}>Pending</p>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold' }}>{stats.pending}</h3>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
          color: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.9 }}>Rejected</p>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold' }}>{stats.rejected}</h3>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
          color: '#1a1a1a',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.9 }}>Avg Rating</p>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold' }}>⭐ {stats.averageRating}</h3>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <input
            type="text"
            placeholder="🔍 Search mentee, mentor or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.95rem'
            }}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'PUBLISHED' | 'PENDING' | 'REJECTED')}
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.95rem'
            }}
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            value={filterTrack}
            onChange={(e) => setFilterTrack(e.target.value as 'ALL' | 'career' | 'personal' | 'soft_skills')}
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.95rem'
            }}
          >
            <option value="ALL">All Fields</option>
            <option value="career">Career</option>
            <option value="personal">Personal Development</option>
            <option value="soft_skills">Soft Skills</option>
          </select>
        </div>
      </div>

      {/* Testimonials List */}
      {filteredTestimonials.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ color: '#1a1a1a', marginBottom: '0.5rem' }}>No testimonials found</h3>
          <p style={{ color: '#666' }}>Try changing filters or search criteria</p>
        </div>
      ) : (
        <>
          {/* LIST VIEW */}
          {viewMode === 'list' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {filteredTestimonials.map((testimonial) => (
            <div
              key={testimonial._id}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                borderLeft: `4px solid ${getStatusColor(testimonial.status)}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <p style={{ margin: '0', fontSize: '0.85rem', color: '#666' }}>
                    {testimonial.menteeName} → {testimonial.mentorName}
                  </p>
                  <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '0.95rem', fontWeight: '600', color: '#1a1a1a' }}>
                    {getTrackLabel(testimonial.track)}
                  </h3>
                </div>
                <span style={{
                  backgroundColor: getStatusColor(testimonial.status) + '20',
                  color: getStatusColor(testimonial.status),
                  padding: '0.35rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {getStatusLabel(testimonial.status)}
                </span>
              </div>

              {/* Rating */}
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    size={16}
                    style={{ color: i < testimonial.rating ? '#ffd700' : '#ddd' }}
                  />
                ))}
              </div>

              {/* Content */}
              <div style={{
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                borderLeft: '3px solid #667eea'
              }}>
                <p style={{
                  margin: '0',
                  fontSize: '0.9rem',
                  color: '#555',
                  lineHeight: '1.6',
                  fontStyle: 'italic'
                }}>
                  "{testimonial.content}"
                </p>
              </div>

              {/* Date */}
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#999' }}>
                📅 {new Date(testimonial.date).toLocaleDateString('en-US')}
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {testimonial.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApprove(testimonial._id)}
                      style={{
                        flex: 1,
                        padding: '0.6rem',
                        background: '#27ae60',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#229954'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#27ae60'; }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleReject(testimonial._id)}
                      style={{
                        flex: 1,
                        padding: '0.6rem',
                        background: '#e74c3c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#c0392b'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#e74c3c'; }}
                    >
                      ✗ Reject
                    </button>
                  </>
                )}
                <button
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    background: '#667eea',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5568d3'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#667eea'; }}
                >
                  <FaEdit size={12} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(testimonial._id, testimonial.menteeName)}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    background: '#95a5a6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#7f8c8d'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#95a5a6'; }}
                >
                  <FaTrash size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
          )}

          {/* GALLERY VIEW */}
          {viewMode === 'gallery' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {filteredTestimonials.map((testimonial) => (
            <div key={testimonial._id} style={{
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: '12px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.5)'
            }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#333', fontStyle: 'italic' }}>
                "{testimonial.content}"
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.8rem', fontWeight: 'bold' }}>
                — {testimonial.menteeName}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.8rem' }}>
                Mentored by {testimonial.mentorName}
              </div>
              <div style={{ fontSize: '1.2rem', color: '#ffd700', marginBottom: '0.8rem' }}>
                {'⭐'.repeat(Math.min(5, Math.max(0, testimonial.rating)))}
              </div>
              {testimonial.status && (
                <span style={{
                  background: testimonial.status === 'PUBLISHED' ? '#10b981' : 
                              testimonial.status === 'PENDING' ? '#f59e0b' : '#ef4444',
                  color: '#fff',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}>
                  {testimonial.status}
                </span>
              )}
            </div>
          ))}
        </div>
          )}
        </>
      )}

      {/* Add Testimonial Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#0a4b39', fontSize: '1.5rem', fontWeight: 'bold' }}>
              Add New Testimonial
            </h2>

            {/* Form Fields */}
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Mentee Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                  Mentee Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., John Smith"
                  value={newTestimonial.menteeName}
                  onChange={(e) => setNewTestimonial({...newTestimonial, menteeName: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0a4b39'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              {/* Mentor Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                  Mentor Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Jane Doe"
                  value={newTestimonial.mentorName}
                  onChange={(e) => setNewTestimonial({...newTestimonial, mentorName: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0a4b39'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              {/* Track */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                  Track *
                </label>
                <select
                  value={newTestimonial.track}
                  onChange={(e) => setNewTestimonial({...newTestimonial, track: e.target.value as 'career' | 'personal' | 'soft_skills'})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0a4b39'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                >
                  <option value="career">💼 Career</option>
                  <option value="personal">🌟 Personal Development</option>
                  <option value="soft_skills">🎯 Soft Skills</option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                  Rating (1-5 stars) *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <select
                    value={newTestimonial.rating}
                    onChange={(e) => setNewTestimonial({...newTestimonial, rating: parseInt(e.target.value)})}
                    style={{
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      minWidth: '100px'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0a4b39'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  >
                    <option value={1}>1 Star</option>
                    <option value={2}>2 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={5}>5 Stars</option>
                  </select>
                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '1.5rem',
                          color: i < newTestimonial.rating ? '#ffd700' : '#ddd'
                        }}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                  Testimonial Content *
                </label>
                <textarea
                  placeholder="Share your experience and what you learned from this mentor..."
                  value={newTestimonial.content}
                  onChange={(e) => setNewTestimonial({...newTestimonial, content: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    minHeight: '120px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0a4b39'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={handleAddTestimonial}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#0a4b39',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#083e2f';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0a4b39';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Save Testimonial
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#f0f0f0',
                  color: '#666',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e0e0e0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsPage;
