import { useState, useMemo } from 'react';
import { FaCalendar, FaClock, FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';
import Avatar from './Avatar';
import Skeleton from './Skeleton';

interface Session {
  _id: string;
  title: string;
  mentor: { id: string; name: string; avatar?: string };
  mentees: Array<{ id: string; name: string }>;
  groupId?: string;
  groupName?: string;
  date: string;
  time: string;
  duration: number; // in minutes
  location: string;
  type: 'ONE_ON_ONE' | 'GROUP';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  description: string;
  createdAt: string;
}

const ScheduleList = () => {
  console.log('ScheduleList component loaded');
  const [sessions, setSessions] = useState<Session[]>([
    {
      _id: 's1',
      title: 'React Fundamentals Discussion',
      mentor: { id: 'm1', name: 'Nguyễn Thị Ánh Dương' },
      mentees: [{ id: '101', name: 'Nguyễn Văn M' }, { id: '102', name: 'Trần Thị N' }],
      groupId: '201',
      groupName: 'Frontend Avengers',
      date: '2025-12-22',
      time: '19:00',
      duration: 60,
      location: 'Online - Google Meet',
      type: 'GROUP',
      status: 'SCHEDULED',
      description: 'Discussion about React hooks, state management, and best practices in React development',
      createdAt: '2025-12-20'
    },
    {
      _id: 's2',
      title: 'Career Path Planning',
      mentor: { id: 'm2', name: 'Phạm Minh Nhật' },
      mentees: [{ id: '103', name: 'Hoàng Văn Sơn' }],
      date: '2025-12-21',
      time: '10:00',
      duration: 45,
      location: 'Coffee Shop - Đối diện Việt Úc',
      type: 'ONE_ON_ONE',
      status: 'SCHEDULED',
      description: 'Career planning for the next year, preparation for job search and career development',
      createdAt: '2025-12-20'
    },
    {
      _id: 's3',
      title: 'Node.js Backend Architecture',
      mentor: { id: 'm2', name: 'Phạm Minh Nhật' },
      mentees: [{ id: '201', name: 'Lê Minh Hòa' }, { id: '202', name: 'Vũ Thị Linh' }, { id: '203', name: 'Đặng Minh Tuấn' }],
      groupId: '202',
      groupName: 'Backend Busters',
      date: '2025-12-23',
      time: '20:00',
      duration: 90,
      location: 'Online - Zoom',
      type: 'GROUP',
      status: 'SCHEDULED',
      description: 'Backend application architecture design, scalability, performance optimization',
      createdAt: '2025-12-20'
    },
    {
      _id: 's4',
      title: 'Project Review & Feedback',
      mentor: { id: 'm1', name: 'Nguyễn Thị Ánh Dương' },
      mentees: [{ id: '104', name: 'Phạm Thanh Tú' }],
      date: '2025-12-19',
      time: '15:00',
      duration: 60,
      location: 'Online - Google Meet',
      type: 'ONE_ON_ONE',
      status: 'COMPLETED',
      description: 'Review mentee portfolio project, provide detailed feedback and suggestions',
      createdAt: '2025-12-15'
    },
    {
      _id: 's5',
      title: 'Soft Skills Workshop',
      mentor: { id: 'm3', name: 'Trần Văn Hùng' },
      mentees: [{ id: '105', name: 'Ngô Thị Hương' }, { id: '106', name: 'Bùi Văn Long' }],
      groupId: '203',
      groupName: 'Soft Skills Masters',
      date: '2025-12-25',
      time: '18:00',
      duration: 120,
      location: 'Training Center - District 3',
      type: 'GROUP',
      status: 'SCHEDULED',
      description: 'Workshop on communication, teamwork, leadership, and interview skills',
      createdAt: '2025-12-20'
    },
    {
      _id: 's6',
      title: 'Database Design Session',
      mentor: { id: 'm2', name: 'Phạm Minh Nhật' },
      mentees: [{ id: '207', name: 'Hoàng Minh Quân' }],
      date: '2025-12-20',
      time: '14:00',
      duration: 60,
      location: 'Online - Google Meet',
      type: 'ONE_ON_ONE',
      status: 'SCHEDULED',
      description: 'Thiết kế database, normalization, queries optimization',
      createdAt: '2025-12-19'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>('SCHEDULED');
  const [filterType, setFilterType] = useState<'ALL' | 'ONE_ON_ONE' | 'GROUP'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [newSession, setNewSession] = useState({
    title: '',
    mentorName: '',
    menteeNames: '',
    groupName: '',
    date: '',
    time: '',
    duration: 60,
    location: '',
    type: 'ONE_ON_ONE' as 'ONE_ON_ONE' | 'GROUP',
    description: ''
  });

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch = 
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'ALL' || session.status === filterStatus;
      const matchesType = filterType === 'ALL' || session.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [sessions, searchQuery, filterStatus, filterType]);

  const upcomingSessions = useMemo(() => {
    return filteredSessions
      .filter(s => s.status === 'SCHEDULED')
      .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime());
  }, [filteredSessions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#27ae60';
      case 'SCHEDULED':
        return '#3498db';
      case 'CANCELLED':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '✓ Completed';
      case 'SCHEDULED':
        return 'Upcoming';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleDelete = (id: string, title: string) => {
      if (window.confirm(`Delete session "${title}"?`)) {
      setSessions(sessions.filter(s => s._id !== id));
    }
  };

  const handleAddSession = () => {
    if (!newSession.title || !newSession.mentorName || !newSession.date || !newSession.time) {
      alert('Please fill in all required fields');
      return;
    }

    const menteeList = newSession.menteeNames.split(',').map((name, idx) => ({
      id: `mentee_${Date.now()}_${idx}`,
      name: name.trim()
    })).filter(m => m.name);

    const session: Session = {
      _id: `s_${Date.now()}`,
      title: newSession.title,
      mentor: {
        id: `mentor_${Date.now()}`,
        name: newSession.mentorName,
        avatar: undefined
      },
      mentees: menteeList,
      groupId: newSession.type === 'GROUP' ? `group_${Date.now()}` : undefined,
      groupName: newSession.type === 'GROUP' ? newSession.groupName : undefined,
      date: newSession.date,
      time: newSession.time,
      duration: newSession.duration,
      location: newSession.location,
      type: newSession.type,
      status: 'SCHEDULED',
      description: newSession.description,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setSessions([...sessions, session]);
    setShowAddModal(false);
    setNewSession({
      title: '',
      mentorName: '',
      menteeNames: '',
      groupName: '',
      date: '',
      time: '',
      duration: 60,
      location: '',
      type: 'ONE_ON_ONE',
      description: ''
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f8f9fa, #f0f2f5)', padding: '2rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FaCalendar size={32} style={{ color: '#667eea' }} /> Mentoring Schedule
          </h1>
          <p style={{ color: '#666', fontSize: '0.95rem', margin: 0 }}>
            Manage mentoring sessions | Total: {sessions.length} | Upcoming: {upcomingSessions.length}
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
              onClick={() => setViewMode('calendar')}
              style={{
                padding: '0.5rem 1rem',
                background: viewMode === 'calendar' ? '#667eea' : 'transparent',
                color: viewMode === 'calendar' ? '#fff' : '#666',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
              title="Calendar View"
            >
              📅 Calendar
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
            <FaPlus /> Add Session
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="🔍 Search by title, mentor, location..."
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
            onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED')}
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.95rem'
            }}
          >
            <option value="ALL">All Status</option>
            <option value="SCHEDULED">Upcoming</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'ALL' | 'ONE_ON_ONE' | 'GROUP')}
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.95rem'
            }}
          >
            <option value="ALL">All Types</option>
            <option value="ONE_ON_ONE">One-on-One</option>
            <option value="GROUP">Group</option>
          </select>
        </div>
      </div>

      {/* Upcoming Sessions Highlight */}
      {upcomingSessions.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaClock /> Upcoming Session
          </h3>
          {upcomingSessions[0] && (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '1rem',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{upcomingSessions[0].title}</h4>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaCalendar size={14} /> {formatDate(upcomingSessions[0].date)} lúc {upcomingSessions[0].time}
                  </p>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaMapMarkerAlt size={14} /> {upcomingSessions[0].location}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    background: 'rgba(255,255,255,0.2)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    {upcomingSessions[0].type === 'ONE_ON_ONE' ? '👤 One-on-One' : '👥 Group'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
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
      ) : filteredSessions.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ color: '#1a1a1a', marginBottom: '0.5rem' }}>No Sessions Found</h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>Try changing your filters or create a new session</p>
          <button
            style={{
              backgroundColor: '#667eea',
              color: '#fff',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            + Create New Session
          </button>
        </div>
      ) : (
        <>
          {/* LIST VIEW */}
          {viewMode === 'list' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.5rem'
        }}>
          {filteredSessions.map((session) => (
            <div
              key={session._id}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                borderLeft: `4px solid ${getStatusColor(session.status)}`
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
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', fontWeight: '600', color: '#1a1a1a' }}>
                    {session.title}
                  </h3>
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: getStatusColor(session.status) + '20',
                    color: getStatusColor(session.status),
                    padding: '0.3rem 0.8rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {getStatusLabel(session.status)}
                  </span>
                </div>
                {session.status === 'SCHEDULED' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{
                      background: '#667eea',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.4rem 0.8rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5568d3'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#667eea'; }}
                    >
                      <FaEdit size={12} /> Edit
                    </button>
                    <button style={{
                      background: '#e74c3c',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.4rem 0.8rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#c0392b'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#e74c3c'; }}
                    onClick={() => handleDelete(session._id, session.title)}
                    >
                      <FaTrash size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Mentor Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Avatar name={session.mentor.name} size="sm" />
                <div>
                  <p style={{ margin: '0', fontSize: '0.9rem', fontWeight: '500' }}>🏫 Mentor: {session.mentor.name}</p>
                </div>
              </div>

              {/* Session Details */}
              <div style={{
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
                lineHeight: '1.6'
              }}>
                <p style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaCalendar size={14} style={{ color: '#667eea' }} /> <strong>{formatDate(session.date)}</strong>
                </p>
                <p style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaClock size={14} style={{ color: '#f39c12' }} /> {session.time} - {Math.floor(session.duration / 60)}h{session.duration % 60 > 0 ? session.duration % 60 + 'p' : ''}
                </p>
                <p style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaMapMarkerAlt size={14} style={{ color: '#e74c3c' }} /> {session.location}
                </p>
              </div>

              {/* Mentees */}
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: '600', color: '#333' }}>
                  👥 {session.type === 'ONE_ON_ONE' ? 'Mentee:' : 'Mentees:'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {session.mentees.slice(0, 3).map((mentee, idx) => (
                    <span key={idx} style={{
                      backgroundColor: '#e8f4f8',
                      color: '#0066cc',
                      padding: '0.3rem 0.7rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {mentee.name}
                    </span>
                  ))}
                  {session.mentees.length > 3 && (
                    <span style={{
                      backgroundColor: '#f0f0f0',
                      color: '#666',
                      padding: '0.3rem 0.7rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      +{session.mentees.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {session.description && (
                <p style={{
                  fontSize: '0.85rem',
                  color: '#555',
                  margin: '1rem 0 0 0',
                  lineHeight: '1.5',
                  borderTop: '1px solid #eee',
                  paddingTop: '1rem'
                }}>
                  💡 {session.description}
                </p>
              )}

              {/* Group Info */}
              {session.groupId && (
                <div style={{
                  background: '#f0f7ff',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginTop: '1rem',
                  fontSize: '0.85rem',
                  color: '#0066cc',
                  fontWeight: '500'
                }}>
                  📌 Group: {session.groupName}
                </div>
              )}

              {/* Mark Complete */}
              {session.status === 'SCHEDULED' && (
                <button
                  style={{
                    width: '100%',
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: '#27ae60',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#229954'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#27ae60'; }}
                >
                  <FaCheckCircle size={14} /> Mark as Complete
                </button>
              )}
            </div>
          ))}
        </div>
          )}

          {/* CALENDAR VIEW */}
          {viewMode === 'calendar' && (
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                {Array.from({ length: 31 }).map((_, dayNum) => {
                  const day = dayNum + 1;
                  const dateStr = `2025-12-${String(day).padStart(2, '0')}`;
                  const dayS = filteredSessions.filter(s => s.date === dateStr);
                  return (
                    <div
                      key={day}
                      style={{
                        padding: '1rem',
                        background: dayS.length > 0 ? 'linear-gradient(135deg, #667eea15, #764ba215)' : '#f9f9f9',
                        border: dayS.length > 0 ? '2px solid #667eea' : '1px solid #e0e0e0',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        minHeight: '120px',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#1a1a1a',
                        marginBottom: '0.5rem'
                      }}>
                        {day}
                      </div>
                      {dayS.length > 0 && (
                        <div style={{ flex: 1 }}>
                          {dayS.slice(0, 2).map((s, idx) => (
                            <div
                              key={idx}
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                background: `linear-gradient(135deg, ${['#667eea', '#f093fb', '#4facfe'][idx % 3]}, ${['#764ba2', '#f5576c', '#00f2fe'][idx % 3]})`,
                                color: '#fff',
                                padding: '0.2rem 0.4rem',
                                borderRadius: '3px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                marginBottom: '0.2rem'
                              }}
                              title={s.title}
                            >
                              {s.type === 'GROUP' ? '👥' : '👤'} {s.title.substring(0, 10)}...
                            </div>
                          ))}
                          {dayS.length > 2 && (
                            <div style={{ fontSize: '0.7rem', color: '#667eea', fontWeight: '600' }}>
                              +{dayS.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p style={{ color: '#999', fontSize: '0.9rem', textAlign: 'center' }}>
                📅 Calendar showing sessions for December 2025
              </p>
            </div>
          )}
        </>
      )}

      {/* Add Session Modal */}
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
              Add New Session
            </h2>

            {/* Form Fields */}
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Title */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                  Session Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., React Hooks Workshop"
                  value={newSession.title}
                  onChange={(e) => setNewSession({...newSession, title: e.target.value})}
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

              {/* Session Type */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                  Session Type *
                </label>
                <select
                  value={newSession.type}
                  onChange={(e) => setNewSession({...newSession, type: e.target.value as 'ONE_ON_ONE' | 'GROUP'})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="ONE_ON_ONE">One-on-One</option>
                  <option value="GROUP">Group</option>
                </select>
              </div>

              {/* Mentor Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                  Mentor Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Nguyễn Thị Ánh Dương"
                  value={newSession.mentorName}
                  onChange={(e) => setNewSession({...newSession, mentorName: e.target.value})}
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

              {/* Mentee Names */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                  Mentee Names (comma-separated) *
                </label>
                <textarea
                  placeholder="e.g., John Smith, Jane Doe, Bob Johnson"
                  value={newSession.menteeNames}
                  onChange={(e) => setNewSession({...newSession, menteeNames: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0a4b39'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              {/* Group Name (if GROUP type) */}
              {newSession.type === 'GROUP' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                    Group Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Frontend Team"
                    value={newSession.groupName}
                    onChange={(e) => setNewSession({...newSession, groupName: e.target.value})}
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
              )}

              {/* Date */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={newSession.date}
                  onChange={(e) => setNewSession({...newSession, date: e.target.value})}
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

              {/* Time */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                  Time *
                </label>
                <input
                  type="time"
                  value={newSession.time}
                  onChange={(e) => setNewSession({...newSession, time: e.target.value})}
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

              {/* Duration */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={newSession.duration}
                  onChange={(e) => setNewSession({...newSession, duration: parseInt(e.target.value)})}
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

              {/* Location */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., Online - Google Meet"
                  value={newSession.location}
                  onChange={(e) => setNewSession({...newSession, location: e.target.value})}
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

              {/* Description */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                  Description
                </label>
                <textarea
                  placeholder="Session description and details"
                  value={newSession.description}
                  onChange={(e) => setNewSession({...newSession, description: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    minHeight: '100px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0a4b39'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={handleAddSession}
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
                Save Session
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

export default ScheduleList;
