import { useState } from 'react';
import { FaChartBar, FaChartPie, FaTrophy, FaFire, FaArrowUp, FaArrowDown, FaUsers, FaClock, FaCheckCircle, FaAward, FaExclamationTriangle, FaCalendar, FaGraduationCap } from 'react-icons/fa';

interface AnalyticsData {
  totalMentors: number;
  totalMentees: number;
  totalGroups: number;
  completionRate: number;
  averageMenteeProgress: number;
  mentorsWithFullCapacity: number;
  activeSessions: number;
  menteesCompleted: number;
  averageMentorRating: number;
  avgSessionDuration: number;
  mentorEngagementTrend: Array<{ month: string; mentors: number; sessions: number; satisfaction: number }>;
  menteeProgressDistribution: Array<{ name: string; value: number; percentage: number }>;
  mentorCapacity: Array<{ name: string; active: number; capacity: number; percentage: number }>;
  topMentors: Array<{ name: string; mentees: number; sessions: number; rating: number; track: string }>;
  skillDemand: Array<{ skill: string; count: number; trend: number }>;
  trackDistribution: Array<{ track: string; mentors: number; mentees: number; color: string; icon: string }>;
  retentionMetrics: Array<{ period: string; retention: number }>;
}

const AnalyticsPage = () => {
  console.log('AnalyticsPage component loaded');
  const [analytics] = useState<AnalyticsData>({
    totalMentors: 12,
    totalMentees: 45,
    totalGroups: 8,
    completionRate: 68,
    averageMenteeProgress: 52,
    mentorsWithFullCapacity: 3,
    activeSessions: 6,
    menteesCompleted: 30,
    averageMentorRating: 4.8,
    avgSessionDuration: 85,
    mentorEngagementTrend: [
      { month: 'Aug', mentors: 5, sessions: 12, satisfaction: 78 },
      { month: 'Sep', mentors: 8, sessions: 18, satisfaction: 82 },
      { month: 'Oct', mentors: 10, sessions: 25, satisfaction: 85 },
      { month: 'Nov', mentors: 12, sessions: 32, satisfaction: 88 },
      { month: 'Dec', mentors: 12, sessions: 28, satisfaction: 89 }
    ],
    menteeProgressDistribution: [
      { name: 'Just Started (0-25%)', value: 15, percentage: 33 },
      { name: 'In Progress (25-75%)', value: 18, percentage: 40 },
      { name: 'Completed (75-100%)', value: 12, percentage: 27 }
    ],
    mentorCapacity: [
      { name: 'Ánh Dương', active: 6, capacity: 6, percentage: 100 },
      { name: 'Minh Nhật', active: 5, capacity: 5, percentage: 100 },
      { name: 'Quang Huy', active: 4, capacity: 10, percentage: 40 },
      { name: 'Minh Tuấn', active: 3, capacity: 8, percentage: 38 },
      { name: 'Thúy Hương', active: 2, capacity: 6, percentage: 33 }
    ],
    topMentors: [
      { name: 'Ánh Dương Nguyễn', mentees: 6, sessions: 18, rating: 4.9, track: 'Tech' },
      { name: 'Minh Nhật Phạm', mentees: 5, sessions: 15, rating: 4.8, track: 'Tech' },
      { name: 'Quang Huy Trần', mentees: 4, sessions: 12, rating: 4.7, track: 'Design' }
    ],
    skillDemand: [
      { skill: 'React', count: 12, trend: 15 },
      { skill: 'Node.js', count: 10, trend: 12 },
      { skill: 'TypeScript', count: 9, trend: 8 },
      { skill: 'Communication', count: 8, trend: 5 },
      { skill: 'Leadership', count: 7, trend: 10 },
      { skill: 'Database Design', count: 6, trend: 3 },
      { skill: 'System Design', count: 5, trend: 20 }
    ],
    trackDistribution: [
      { track: 'Technology', mentors: 4, mentees: 12, color: '#667eea', icon: '💻' },
      { track: 'Design', mentors: 2, mentees: 8, color: '#f39c12', icon: '🎨' },
      { track: 'Marketing', mentors: 2, mentees: 6, color: '#e74c3c', icon: '📢' },
      { track: 'Business', mentors: 1, mentees: 7, color: '#27ae60', icon: '💼' },
      { track: 'HR', mentors: 1, mentees: 5, color: '#16a085', icon: '👥' },
      { track: 'Startup', mentors: 1, mentees: 4, color: '#c0392b', icon: '🚀' },
      { track: 'Economics', mentors: 1, mentees: 3, color: '#8e44ad', icon: '📊' }
    ],
    retentionMetrics: [
      { period: 'Month 1', retention: 95 },
      { period: 'Month 2', retention: 91 },
      { period: 'Month 3', retention: 88 },
      { period: 'Month 4', retention: 85 },
      { period: 'Month 5', retention: 82 }
    ]
  });

  const StatCard = ({ title, value, icon: Icon, trend, color, subtitle }: { title: string; value: string | number; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; trend?: number; color: string; subtitle?: string }) => (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-6px)';
      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }}
    >
      <div style={{
        width: '70px',
        height: '70px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${color}30, ${color}10)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon size={32} style={{ color: color }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: '0', fontSize: '0.8rem', color: '#999', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
        <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a' }}>
          {value}
        </h3>
        {subtitle && (
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#666' }}>{subtitle}</p>
        )}
        {trend && (
          <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.8rem', color: trend > 0 ? '#27ae60' : '#e74c3c', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '600' }}>
            {trend > 0 ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
            {Math.abs(trend)}% vs last month
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #eef2f7 100%)', padding: '2.5rem', width: '100%' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <FaChartBar size={36} style={{ color: '#0a4b39' }} /> Analytics & Reports
        </h1>
        <p style={{ color: '#666', fontSize: '1rem', margin: '0.5rem 0 0 0', maxWidth: '800px', lineHeight: '1.6' }}>
          Professional analytics dashboard with real-time insights on mentoring effectiveness, engagement metrics, and program performance across all fields
        </p>
      </div>

      {/* Primary KPIs - 5 Column */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '1.2rem',
        marginBottom: '2.5rem'
      }}>
        <StatCard 
          title="Total Mentors" 
          value={analytics.totalMentors} 
          icon={FaTrophy} 
          color="#667eea" 
          trend={5}
          subtitle="Active mentors"
        />
        <StatCard 
          title="Total Mentees" 
          value={analytics.totalMentees} 
          icon={FaUsers} 
          color="#f39c12" 
          trend={15}
          subtitle="Enrolled"
        />
        <StatCard 
          title="Completion Rate" 
          value={analytics.completionRate + '%'} 
          icon={FaCheckCircle} 
          color="#27ae60" 
          trend={8}
          subtitle="Success rate"
        />
        <StatCard 
          title="Avg Rating" 
          value={analytics.averageMentorRating} 
          icon={FaAward} 
          color="#e74c3c" 
          trend={2}
          subtitle="Mentor rating"
        />
        <StatCard 
          title="Session Duration" 
          value={analytics.avgSessionDuration + 'm'} 
          icon={FaClock} 
          color="#3498db" 
          subtitle="Average"
        />
      </div>

      {/* Main Grid - 3 Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Left Column - Charts and Large Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Engagement Trend Chart */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#1a1a1a', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaChartBar size={18} style={{ color: '#667eea' }} /> Engagement Trend (Last 5 Months)
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px' }}>
              {analytics.mentorEngagementTrend.map((item, idx) => (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-end', height: '140px', width: '100%' }}>
                    <div style={{
                      background: 'linear-gradient(180deg, #667eea 0%, #5568d3 100%)',
                      height: `${(item.mentors / 12) * 140}px`,
                      borderRadius: '4px 4px 0 0',
                      flex: 1,
                      position: 'relative',
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      minHeight: '20px'
                    }}
                    title={`Mentors: ${item.mentors}`}
                    />
                    <div style={{
                      background: 'linear-gradient(180deg, #f39c12 0%, #e67e22 100%)',
                      height: `${(item.sessions / 32) * 140}px`,
                      borderRadius: '4px 4px 0 0',
                      flex: 1,
                      position: 'relative',
                      boxShadow: '0 2px 8px rgba(243, 156, 18, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      minHeight: '20px'
                    }}
                    title={`Sessions: ${item.sessions}`}
                    />
                  </div>
                  <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.8rem', fontWeight: '600', color: '#666' }}>{item.month}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#667eea' }} />
                <span>Active Mentors</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#f39c12' }} />
                <span>Sessions</span>
              </div>
            </div>
          </div>

          {/* Skill Demand */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#1a1a1a', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaChartBar size={18} style={{ color: '#27ae60' }} /> Top Skills in Demand
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {analytics.skillDemand.map((skill, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <p style={{ margin: 0, fontWeight: '600', color: '#1a1a1a', fontSize: '0.95rem' }}>{skill.skill}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <p style={{ margin: 0, fontWeight: '700', color: '#0a4b39', fontSize: '0.9rem' }}>{skill.count}</p>
                      <span style={{ color: skill.trend > 0 ? '#27ae60' : '#e74c3c', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        {skill.trend > 0 ? '↑' : '↓'} {Math.abs(skill.trend)}%
                      </span>
                    </div>
                  </div>
                  <div style={{
                    background: '#f0f0f0',
                    height: '8px',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: `linear-gradient(90deg, #0a4b39 0%, #27ae60 100%)`,
                      height: '100%',
                      width: `${(skill.count / 12) * 100}%`,
                      transition: 'width 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                      borderRadius: '4px',
                      boxShadow: '0 1px 4px rgba(10, 75, 57, 0.3)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column - Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Track Distribution */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 1.3rem 0', color: '#1a1a1a', fontSize: '1.05rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaGraduationCap size={18} style={{ color: '#3498db' }} /> Field Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analytics.trackDistribution.map((track, idx) => (
                <div key={idx} style={{
                  padding: '1rem',
                  background: `${track.color}08`,
                  border: `1px solid ${track.color}30`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${track.color}15`;
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${track.color}08`;
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{track.icon}</span>
                    <p style={{ margin: 0, fontWeight: '600', color: '#1a1a1a', fontSize: '0.9rem' }}>{track.track}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.8rem', color: '#666' }}>
                    <span>👨‍🏫 {track.mentors} Mentors</span>
                    <span>👨‍🎓 {track.mentees} Mentees</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mentee Progress */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 1.3rem 0', color: '#1a1a1a', fontSize: '1.05rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaChartPie size={18} style={{ color: '#f39c12' }} /> Progress Distribution
            </h3>
            {analytics.menteeProgressDistribution.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', color: '#666' }}>{item.name}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: '#1a1a1a' }}>{item.value} ({item.percentage}%)</p>
                </div>
                <div style={{
                  background: '#f0f0f0',
                  height: '6px',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: `linear-gradient(90deg, ${['#667eea', '#f39c12', '#27ae60'][idx]}, ${['#5568d3', '#e67e22', '#229954'][idx]})`,
                    height: '100%',
                    width: `${item.percentage}%`,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Metrics & Rankings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Key Metrics Summary */}
          <div style={{
            background: 'linear-gradient(135deg, #0a4b39 0%, #083e2f 100%)',
            color: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaFire size={18} /> Key Metrics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ paddingBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', opacity: 0.8 }}>Completion Rate</p>
                <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>{analytics.completionRate}%</p>
                <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>↑ 8% vs last month</p>
              </div>
              <div style={{ paddingBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', opacity: 0.8 }}>Avg Progress</p>
                <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>{analytics.averageMenteeProgress}%</p>
                <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>↑ 5% improvement</p>
              </div>
              <div style={{ paddingBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', opacity: 0.8 }}>Mentor Satisfaction</p>
                <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>89%</p>
                <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>↑ 4% this month</p>
              </div>
              <div>
                <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', opacity: 0.8 }}>Full Capacity</p>
                <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>{analytics.mentorsWithFullCapacity}/{analytics.totalMentors}</p>
                <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>Mentors at capacity</p>
              </div>
            </div>
          </div>

          {/* Top 3 Mentors */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 1.3rem 0', color: '#1a1a1a', fontSize: '1.05rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaTrophy size={18} style={{ color: '#f39c12' }} /> Top Mentors
            </h3>
            {analytics.topMentors.map((mentor, idx) => (
              <div key={idx} style={{
                marginBottom: idx < analytics.topMentors.length - 1 ? '1.2rem' : '0',
                paddingBottom: idx < analytics.topMentors.length - 1 ? '1.2rem' : '0',
                borderBottom: idx < analytics.topMentors.length - 1 ? '1px solid #eee' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${['#667eea', '#764ba2', '#f093fb'][idx]}, ${['#5568d3', '#6b3fa8', '#d876d6'][idx]})`,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    flexShrink: 0
                  }}>
                    #{idx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: '700', color: '#1a1a1a', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mentor.name}</p>
                    <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.75rem', color: '#666' }}>⭐ {mentor.rating} • {mentor.mentees} Mentees</p>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#999' }}>{mentor.track}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Alerts */}
          <div style={{
            background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)',
            border: '1px solid #ffcccc',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#c0392b', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaExclamationTriangle size={16} /> Alerts
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>• 3 mentors at full capacity</p>
              <p style={{ margin: '0 0 0.5rem 0' }}>• 2 mentees below 30% progress</p>
              <p style={{ margin: 0 }}>• Add more mentors for growth</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Mentor Capacity & Retention */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
        
        {/* Mentor Capacity */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1a1a1a', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaUsers size={18} style={{ color: '#e74c3c' }} /> Mentor Capacity Overview
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
            {analytics.mentorCapacity.map((mentor, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1a1a1a', fontSize: '0.95rem' }}>{mentor.name}</p>
                  <span style={{
                    background: mentor.percentage === 100 ? '#e74c3c' : '#27ae60',
                    color: '#fff',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '4px',
                    fontWeight: '600',
                    fontSize: '0.8rem'
                  }}>
                    {mentor.active}/{mentor.capacity}
                  </span>
                </div>
                <div style={{
                  background: '#f0f0f0',
                  height: '10px',
                  borderRadius: '5px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: `linear-gradient(90deg, ${mentor.percentage === 100 ? '#e74c3c' : '#27ae60'}, ${mentor.percentage === 100 ? '#c0392b' : '#229954'})`,
                    height: '100%',
                    width: `${mentor.percentage}%`,
                    transition: 'width 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                    borderRadius: '5px',
                    boxShadow: `0 2px 8px ${mentor.percentage === 100 ? '#e74c3c' : '#27ae60'}40`
                  }} />
                </div>
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem', color: '#999', fontWeight: '500' }}>
                  {mentor.percentage}% Capacity
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Retention Trend */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1a1a1a', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaCalendar size={18} style={{ color: '#3498db' }} /> Retention Rate Trend
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '150px' }}>
            {analytics.retentionMetrics.map((item, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '100%',
                  background: `linear-gradient(180deg, #3498db 0%, #2980b9 100%)`,
                  height: `${item.retention}px`,
                  borderRadius: '4px 4px 0 0',
                  boxShadow: '0 2px 8px rgba(52, 152, 219, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: '4px'
                }}
                title={`${item.retention}%`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(52, 152, 219, 0.5)';
                  e.currentTarget.style.transform = 'scaleY(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(52, 152, 219, 0.3)';
                  e.currentTarget.style.transform = 'scaleY(1)';
                }}
                >
                  <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 'bold' }}>{item.retention}%</span>
                </div>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', fontWeight: '600', color: '#666', textAlign: 'center' }}>{item.period}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
