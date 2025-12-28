/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { groupApi } from '../services/api';
import { FaUsers } from 'react-icons/fa';
import Badge from './Badge';
import SearchFilter from './SearchFilter';
import EmptyState from './EmptyState';
import Skeleton from './Skeleton';

interface Group {
  _id: string;
  name: string;
  description?: string;
  mentor?: {
    name: string;
  };
  mentorId?: string;
  mentees?: string[];
  maxSize?: number;
  frequency?: string;
  dayOfWeek?: string;
  time?: string;
  meetingSchedule?: {
    frequency: string;
    dayOfWeek: string;
    time: string;
  };
}

const GroupList = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ active: true });
  const [advancedFilters, setAdvancedFilters] = useState({
    frequency: '',
    mentorName: ''
  });

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await groupApi.getAll();
        setGroups(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch groups');
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const matchesSearch =
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.mentor?.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Advanced filters
      if (advancedFilters.frequency && (group.frequency || group.meetingSchedule?.frequency) !== advancedFilters.frequency) {
        return false;
      }
      if (advancedFilters.mentorName && (!group.mentor?.name || !group.mentor.name.toLowerCase().includes(advancedFilters.mentorName.toLowerCase()))) {
        return false;
      }

      return matchesSearch && filters.active;
    });
  }, [groups, searchQuery, filters, advancedFilters]);

  const getMenteeCount = (group: Group) => group.mentees?.length || 0;

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
            <FaUsers size={32} /> Group Management
          </h1>
        <Link to="/groups/add" className="btn btn-primary">
          + Add New
        </Link>
      </div>

      <SearchFilter
        onSearch={setSearchQuery}
        onFilter={(filters) => setFilters({ ...filters, active: (filters as Record<string, boolean>).active ?? true })}
        filterOptions={[
          { label: 'Active Groups', value: 'active', checked: true }
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
            Frequency
          </label>
          <select
            value={advancedFilters.frequency}
            onChange={(e) => setAdvancedFilters({ ...advancedFilters, frequency: e.target.value })}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
          >
            <option value="">All Frequencies</option>
            <option value="Weekly">📅 Weekly</option>
            <option value="Bi-weekly">📅 Bi-weekly</option>
            <option value="Monthly">📅 Monthly</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
            Mentor Name
          </label>
          <input
            type="text"
            placeholder="Search mentor..."
            value={advancedFilters.mentorName}
            onChange={(e) => setAdvancedFilters({ ...advancedFilters, mentorName: e.target.value })}
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
                frequency: '',
                mentorName: ''
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
            gridTemplateColumns: 'repeat(2, 1fr)',
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
      ) : filteredGroups.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No Groups Found"
          description={searchQuery ? 'Try adjusting your search' : 'Create your first study group'}
          actionLabel="+ Create Group"
          onAction={() => window.location.href = '/groups/add'}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px'
          }}
        >
          {filteredGroups.map((group) => {
            const menteeCount = getMenteeCount(group);
            const maxSize = group.maxSize || 10;
            const isFull = menteeCount >= maxSize;

            return (
              <div
                key={group._id}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  borderLeft: `4px solid ${isFull ? '#dc3545' : '#28a745'}`
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
                {/* Header */}
                <h3
                  style={{
                    margin: '0 0 8px 0',
                    color: '#333',
                    fontSize: '1.2rem'
                  }}
                >
                  {group.name}
                </h3>

                {/* Status */}
                <div style={{ marginBottom: '12px' }}>
                  <Badge
                    status={isFull ? 'full' : 'active'}
                    label={`${menteeCount}/${maxSize} Mentees`}
                  />
                </div>

                {/* Description */}
                {group.description && (
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: '#555',
                      margin: '0 0 12px 0',
                      lineHeight: '1.4'
                    }}
                  >
                    {group.description}
                  </p>
                )}

                {/* Mentor */}
                {group.mentor && (
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: '#666',
                      margin: '0 0 8px 0'
                    }}
                  >
                    👨‍🏫 Mentor: <strong>{group.mentor.name}</strong>
                  </p>
                )}

                {/* Meeting schedule */}
                {group.meetingSchedule && (
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: '#666',
                      margin: '0 0 12px 0'
                    }}
                  >
                    📅 {group.meetingSchedule.frequency} • {group.meetingSchedule.dayOfWeek} at{' '}
                    {group.meetingSchedule.time}
                  </p>
                )}

                {/* Mentee fill bar */}
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '12px'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(menteeCount / maxSize) * 100}%`,
                      backgroundColor: isFull ? '#dc3545' : '#28a745',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: 'auto'
                  }}
                >
                  <Link
                    to={`/groups/${group._id}`}
                    className="btn btn-secondary"
                    style={{ flex: 1, textAlign: 'center' }}
                  >
                    Details
                  </Link>
                  <button
                    className="btn btn-danger"
                    style={{ flex: 1 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};

export default GroupList;