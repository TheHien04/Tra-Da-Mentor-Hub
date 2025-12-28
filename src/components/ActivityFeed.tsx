interface Activity {
  _id: string;
  type: string;
  actor: { id: string; name: string; avatar: string };
  action: string;
  target: string;
  timestamp: string | Date;
  description: string;
}

interface ActivityFeedProps {
  activities?: Activity[];
  limit?: number;
}

const ActivityFeed = ({ activities = [], limit = 8 }: ActivityFeedProps) => {
  const formatTime = (date: string | Date) => {
    const now = new Date();
    const actDate = new Date(date);
    const diffMs = now.getTime() - actDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return actDate.toLocaleDateString('vi-VN');
  };

  const getTypeColor = (type: string): string => {
    const typeColors: { [key: string]: string } = {
      'mentor_created_group': '#3498db',
      'mentee_joined_group': '#27ae60',
      'mentee_progress_updated': '#f39c12',
      'mentor_assigned': '#9b59b6',
      'group_meeting_scheduled': '#e74c3c',
      'mentor_created': '#3498db',
      'mentee_created': '#1abc9c'
    };
    return typeColors[type] || '#95a5a6';
  };

  const getTypeIcon = (type: string): string => {
    const typeIcons: { [key: string]: string } = {
      'mentor_created_group': '📚',
      'mentee_joined_group': '👥',
      'mentee_progress_updated': '🏆',
      'mentor_assigned': '🎯',
      'group_meeting_scheduled': '📅',
      'mentor_created': '👨‍🏫',
      'mentee_created': '👨‍🎓'
    };
    return typeIcons[type] || '📌';
  };

  const displayedActivities = activities.slice(0, limit);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {displayedActivities.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '32px 16px',
            color: '#999',
            fontSize: '0.95rem'
          }}
        >
          📭 No activities yet
        </div>
      ) : (
        displayedActivities.map((activity) => (
          <div
            key={activity._id}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#f8f9fa',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              borderLeft: `4px solid ${getTypeColor(activity.type)}`
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f0f0f0';
              (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fa';
              (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: getTypeColor(activity.type),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0
              }}
            >
              {activity.actor.avatar}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: '#2c3e50',
                  marginBottom: '4px'
                }}
              >
                <span style={{ color: getTypeColor(activity.type), fontWeight: '600' }}>
                  {activity.actor.name}
                </span>
                {' '}
                <span style={{ color: '#666' }}>
                  {activity.action} <strong>{activity.target}</strong>
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: '#999',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{getTypeIcon(activity.type)}</span>
                <span>{formatTime(activity.timestamp)}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ActivityFeed;
