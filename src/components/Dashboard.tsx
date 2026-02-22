/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mentorApi, menteeApi, groupApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaUsers, FaUserTie, FaBook, FaTrophy, FaPlus, FaCalendar } from 'react-icons/fa';
import Skeleton from './Skeleton';

interface DashboardStats {
  totalMentors: number;
  totalMentees: number;
  totalGroups: number;
  mentorsAtCapacity: number;
  menteesCompleted: number;
  menteesInProgress: number;
  menteesJustStarted: number;
}

const Dashboard = () => {
  const { state } = useAuth();
  const role = state.user?.role || 'user';
  const [stats, setStats] = useState<DashboardStats>({
    totalMentors: 0,
    totalMentees: 0,
    totalGroups: 0,
    mentorsAtCapacity: 0,
    menteesCompleted: 0,
    menteesInProgress: 0,
    menteesJustStarted: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([
    { _id: '1', title: 'React Fundamentals', mentor: 'Alex Chen', date: '2025-12-28', time: '19:00', type: 'GROUP' },
    { _id: '2', title: 'Career Path Planning', mentor: 'Jordan Lee', date: '2025-12-29', time: '10:00', type: 'ONE_ON_ONE' },
    { _id: '3', title: 'Node.js Architecture', mentor: 'Jordan Lee', date: '2025-12-30', time: '20:00', type: 'GROUP' },
    { _id: '4', title: 'Soft Skills Workshop', mentor: 'Sam Taylor', date: '2025-12-31', time: '18:00', type: 'GROUP' },
    { _id: '5', title: 'Portfolio Review', mentor: 'Alex Chen', date: '2026-01-02', time: '15:00', type: 'ONE_ON_ONE' }
  ]);
  const [trendingSkills] = useState<any[]>([
    { skill: 'React.js', count: 12, percentage: 100 },
    { skill: 'Node.js', count: 10, percentage: 83 },
    { skill: 'Python', count: 8, percentage: 67 },
    { skill: 'TypeScript', count: 7, percentage: 58 },
    { skill: 'AWS', count: 6, percentage: 50 }
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const mentors = await mentorApi.getAll();
        const mentees = await menteeApi.getAll();
        const groups = await groupApi.getAll();

        const mentorsAtCapacity = mentors.data.filter(
          (m: any) => m.maxMentees && m.mentees && m.mentees.length >= m.maxMentees
        ).length;

        const menteesData = mentees.data;
        const menteesCompleted = menteesData.filter((m: any) => m.progress === 100).length;
        const menteesInProgress = menteesData.filter(
          (m: any) => m.progress && m.progress > 0 && m.progress < 100
        ).length;
        const menteesJustStarted = menteesData.filter((m: any) => !m.progress || m.progress === 0)
          .length;

        setStats({
          totalMentors: mentors.data.length,
          totalMentees: mentees.data.length,
          totalGroups: groups.data.length,
          mentorsAtCapacity,
          menteesCompleted,
          menteesInProgress,
          menteesJustStarted
        });

        // Mock upcoming sessions
        setUpcomingSessions([
          { _id: '1', title: 'React Fundamentals', mentor: 'Alex Chen', date: '2025-12-28', time: '19:00', type: 'GROUP' },
          { _id: '2', title: 'Career Path Planning', mentor: 'Jordan Lee', date: '2025-12-29', time: '10:00', type: 'ONE_ON_ONE' },
          { _id: '3', title: 'Node.js Architecture', mentor: 'Jordan Lee', date: '2025-12-30', time: '20:00', type: 'GROUP' },
          { _id: '4', title: 'Soft Skills Workshop', mentor: 'Sam Taylor', date: '2025-12-31', time: '18:00', type: 'GROUP' },
          { _id: '5', title: 'Portfolio Review', mentor: 'Alex Chen', date: '2026-01-02', time: '15:00', type: 'ONE_ON_ONE' }
        ]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '2rem', width: '100%' }}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 10px rgba(102, 126, 234, 0.3), 0 0 20px rgba(245, 87, 108, 0.2); }
          50% { text-shadow: 0 0 20px rgba(102, 126, 234, 0.6), 0 0 40px rgba(245, 87, 108, 0.4); }
        }
        .dashboard-title {
          font-size: 4rem;
          font-weight: 900;
          color: var(--primary-color);
          animation: slideUp 0.8s ease-out;
          margin-bottom: 0.75rem;
          letter-spacing: -1px;
          position: relative;
          display: inline-block;
          padding-bottom: 0.5rem;
        }
        .dashboard-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
          border-radius: 2px;
          animation: slideUp 1s ease-out 0.2s backwards;
        }
        .dashboard-subtitle {
          font-size: 1.3rem;
          color: #666;
          font-weight: 500;
          letter-spacing: 0.5px;
          animation: slideUp 0.8s ease-out 0.2s backwards;
          margin-bottom: 0;
        }
      `}</style>
      <div style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 className="dashboard-title">
            Mentor Platform Dashboard
          </h1>
          <p className="dashboard-subtitle">
            {role === 'mentor' && '📊 Your mentoring sessions and remaining mentee capacity'}
            {role === 'mentee' && '📊 Your mentoring sessions and connected mentor'}
            {role === 'admin' && '📊 Overview: mentors and mentees connected'}
            {(role === 'user' || !role) && '✨ Guide the future, unlock unlimited potential ✨'}
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <Link to="/mentors/add" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
              color: '#fff',
              padding: '1.5rem',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              animation: 'slideUp 0.5s ease-out 0.1s backwards'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
            }}>
              <FaPlus style={{ fontSize: '1.5rem' }} />
              <div>
                <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.9 }}>Quick Action</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0.25rem 0 0 0' }}>Add Mentor</p>
              </div>
            </div>
          </Link>

          <Link to="/mentees/add" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--secondary-color) 100%)',
              color: '#fff',
              padding: '1.5rem',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              animation: 'slideUp 0.5s ease-out 0.2s backwards'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
            }}>
              <FaPlus style={{ fontSize: '1.5rem' }} />
              <div>
                <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.9 }}>Quick Action</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0.25rem 0 0 0' }}>Add Mentee</p>
              </div>
            </div>
          </Link>

          <Link to="/session-logs" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)',
              color: '#fff',
              padding: '1.5rem',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              animation: 'slideUp 0.5s ease-out 0.3s backwards'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
            }}>
              <FaCalendar style={{ fontSize: '1.5rem' }} />
              <div>
                <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.9 }}>Session log</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0.25rem 0 0 0' }}>Fill log after session</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Main Stats Grid */}
        <div style={{
          display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{
                  background: '#fff',
                  padding: '2rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
                }}>
                  <Skeleton count={3} />
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Total Mentors */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid #667eea',
                animation: 'slideUp 0.5s ease-out 0.4s backwards'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Mentors</p>
                    <p style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.totalMentors}</p>
                  </div>
                  <FaUserTie style={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.3)' }} />
                </div>
              </div>

              {/* Total Mentees */}
              <div style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid #f5576c',
                animation: 'slideUp 0.5s ease-out 0.5s backwards'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 87, 108, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 87, 108, 0.3)';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Mentees</p>
                    <p style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.totalMentees}</p>
                  </div>
                  <FaUsers style={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.3)' }} />
                </div>
              </div>

              {/* Study Groups */}
              <div style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid #00f2fe',
                animation: 'slideUp 0.5s ease-out 0.6s backwards'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(79, 172, 254, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(79, 172, 254, 0.3)';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Study Groups</p>
                    <p style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.totalGroups}</p>
                  </div>
                  <FaBook style={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.3)' }} />
                </div>
              </div>

              {/* Mentees Completed */}
              <div style={{
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(67, 233, 123, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid #38f9d7'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(67, 233, 123, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(67, 233, 123, 0.3)';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Completed Mentees</p>
                    <p style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.menteesCompleted}</p>
                  </div>
                  <FaTrophy style={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.3)' }} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Upcoming Sessions & Trending Skills */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Upcoming Sessions */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)',
            animation: 'slideUp 0.6s ease-out 0.4s backwards'
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaCalendar size={20} style={{ color: '#f39c12' }} /> Upcoming Sessions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upcomingSessions.slice(0, 5).map((session, idx) => (
                <div
                  key={session._id}
                  style={{
                    padding: '1rem',
                    background: `linear-gradient(135deg, ${['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'][idx]}15, transparent)`,
                    borderRadius: '10px',
                    borderLeft: `4px solid ${['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'][idx]}`,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    animation: `slideUp 0.5s ease-out ${0.5 + idx * 0.1}s backwards`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'][idx]}, ${['#764ba2', '#f5576c', '#00f2fe', '#38f9d7', '#f093fb'][idx]})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600', color: '#1a1a1a', fontSize: '0.95rem' }}>
                        {session.title}
                      </p>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#666' }}>
                        👨‍🏫 {session.mentor}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#999' }}>
                        <span>📅 {session.date}</span>
                        <span>🕐 {session.time}</span>
                      </div>
                    </div>
                    <div style={{
                      background: session.type === 'GROUP' ? '#e8f5e9' : '#f3e5f5',
                      color: session.type === 'GROUP' ? '#27ae60' : '#8e24aa',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}>
                      {session.type === 'GROUP' ? '👥 GROUP' : '👤 1:1'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/schedule" style={{
              display: 'inline-block',
              marginTop: '1.5rem',
              color: '#0a4b39',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              View All Sessions →
            </Link>
          </div>

          {/* Trending Skills */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)',
            animation: 'slideUp 0.6s ease-out 0.5s backwards'
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔥 Skills in Demand
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {trendingSkills.map((skill, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <p style={{ margin: 0, fontWeight: '600', color: '#1a1a1a', fontSize: '0.95rem' }}>
                      {skill.skill}
                    </p>
                    <span style={{
                      background: '#fef5e7',
                      color: '#f39c12',
                      padding: '0.3rem 0.7rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {skill.count} requests
                    </span>
                  </div>
                  <div style={{
                    background: '#f0f0f0',
                    height: '10px',
                    borderRadius: '5px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      background: `linear-gradient(90deg, #0a4b39 0%, #27ae60 100%)`,
                      height: '100%',
                      width: `${skill.percentage}%`,
                      transition: 'width 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                      borderRadius: '5px',
                      boxShadow: '0 2px 8px rgba(10, 75, 57, 0.3)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mentee Progress Stats */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1a1a1a' }}>Mentee Progress Overview</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
              borderRadius: '8px',
              border: '2px solid #4caf50'
            }}>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Completed (100%)</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50' }}>{stats.menteesCompleted}</p>
              <p style={{ fontSize: '0.8rem', color: '#999' }}>
                {stats.totalMentees > 0 ? `${Math.round((stats.menteesCompleted / stats.totalMentees) * 100)}% of mentees` : 'No mentees'}
              </p>
            </div>

            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)',
              borderRadius: '8px',
              border: '2px solid #ff9800'
            }}>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>In Progress (1-99%)</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>{stats.menteesInProgress}</p>
              <p style={{ fontSize: '0.8rem', color: '#999' }}>
                {stats.totalMentees > 0 ? `${Math.round((stats.menteesInProgress / stats.totalMentees) * 100)}% of mentees` : 'No mentees'}
              </p>
            </div>

            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
              borderRadius: '8px',
              border: '2px solid #f44336'
            }}>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Just Started (0%)</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f44336' }}>{stats.menteesJustStarted}</p>
              <p style={{ fontSize: '0.8rem', color: '#999' }}>
                {stats.totalMentees > 0 ? `${Math.round((stats.menteesJustStarted / stats.totalMentees) * 100)}% of mentees` : 'No mentees'}
              </p>
            </div>

            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(233, 30, 99, 0.05) 100%)',
              borderRadius: '8px',
              border: '2px solid #e91e63'
            }}>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Mentors at Capacity</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e91e63' }}>{stats.mentorsAtCapacity}</p>
              <p style={{ fontSize: '0.8rem', color: '#999' }}>
                {stats.totalMentors > 0 ? `${Math.round((stats.mentorsAtCapacity / stats.totalMentors) * 100)}% of mentors` : 'No mentors'}
              </p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        {!loading && !error && (
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '1rem' }}>
              📊 Dashboard Summary
            </h2>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Welcome to Mentor Platform! You have <strong>{stats.totalMentors}</strong> mentors guiding <strong>{stats.totalMentees}</strong> mentees across <strong>{stats.totalGroups}</strong> mentorship groups.
              Currently, <strong>{stats.menteesCompleted}</strong> mentees have completed their programs, <strong>{stats.menteesInProgress}</strong> are in progress,
              and <strong>{stats.menteesJustStarted}</strong> have just started their journey.
            </p>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fee',
            padding: '1.5rem',
            borderRadius: '8px',
            color: '#c00',
            border: '1px solid #fcc'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
