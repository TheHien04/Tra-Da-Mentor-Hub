import React from 'react';
import { FaPlus, FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';

interface Activity {
  id: string;
  type: 'create' | 'edit' | 'delete' | 'add_mentee';
  title: string;
  description: string;
  timestamp: Date;
  icon?: React.ReactNode;
}

interface ActivityTimelineProps {
  activities?: Activity[];
  limit?: number;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities = [], limit = 5 }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <FaPlus />;
      case 'edit':
        return <FaEdit />;
      case 'delete':
        return <FaTrash />;
      case 'add_mentee':
        return <FaUserPlus />;
      default:
        return <FaPlus />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'create':
        return '#28a745';
      case 'edit':
        return '#ffc107';
      case 'delete':
        return '#dc3545';
      case 'add_mentee':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  const displayActivities = activities.slice(0, limit);

  return (
    <div
      style={{
        position: 'relative'
      }}
    >
      {displayActivities.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '40px 20px', fontSize: '1rem' }}>
          No activities yet
        </p>
      ) : (
        displayActivities.map((activity, index) => (
          <div key={activity.id} style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            {/* Timeline line */}
            {index < displayActivities.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: '15px',
                  top: '40px',
                  width: '2px',
                  height: '60px',
                  backgroundColor: '#e9ecef'
                }}
              />
            )}

              {/* Icon */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: getColor(activity.type),
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {getIcon(activity.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    margin: '0 0 4px 0',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: '#333'
                  }}
                >
                  {activity.title}
                </h3>
                <p
                  style={{
                    margin: '0 0 4px 0',
                    fontSize: '0.85rem',
                    color: '#666'
                  }}
                >
                  {activity.description}
                </p>
                <time
                  style={{
                    fontSize: '0.8rem',
                    color: '#999'
                  }}
                >
                  {new Date(activity.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </time>
              </div>
            </div>
          ))
        )}
    </div>
  );
};

export default ActivityTimeline;
