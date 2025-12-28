import React, { useState } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

interface FilterState {
  [key: string]: boolean | string;
}

interface SearchFilterProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  filters?: FilterState;
  setFilters?: (filters: FilterState) => void;
  onSearch?: (query: string) => void;
  onFilter?: (filters: FilterState) => void;
  filterOptions?: {
    label: string;
    value: string;
    checked: boolean;
  }[];
  placeholder?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchQuery: externalSearchQuery = '',
  setSearchQuery: externalSetSearchQuery,
  filters: externalFilters,
  setFilters: externalSetFilters,
  onSearch,
  onFilter,
  filterOptions = [],
  placeholder = 'Search...'
}) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState(externalSearchQuery);
  const [showFilter, setShowFilter] = useState(false);
  const [internalFilters, setInternalFilters] = useState<FilterState>(
    externalFilters || filterOptions.reduce((acc: FilterState, opt) => ({ ...acc, [opt.value]: opt.checked }), {})
  );

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = externalSetSearchQuery || setInternalSearchQuery;
  const filters = externalFilters !== undefined ? externalFilters : internalFilters;
  const setFilters = externalSetFilters || setInternalFilters;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleFilterChange = (value: string) => {
    const newFilters = { ...filters, [value]: !filters[value] };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch?.('');
  };

  return (
    <div
      style={{
        marginBottom: '24px',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          flex: '1',
          minWidth: '250px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <FaSearch style={{ position: 'absolute', left: '12px', color: '#999' }} />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearch}
          style={{
            width: '100%',
            padding: '10px 12px 10px 36px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '1rem',
            transition: 'all 0.3s ease'
          }}
        />
        {searchQuery && (
          <FaTimes
            onClick={handleClearSearch}
            style={{
              position: 'absolute',
              right: '12px',
              cursor: 'pointer',
              color: '#999'
            }}
          />
        )}
      </div>

      <button
        onClick={() => setShowFilter(!showFilter)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor: showFilter ? '#0a4b39' : '#f0f0f0',
          color: showFilter ? '#fff' : '#333',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '500',
          transition: 'all 0.3s ease'
        }}
      >
        <FaFilter /> Filter
      </button>

      {showFilter && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '0',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            minWidth: '200px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 100
          }}
        >
          {filterOptions.map((option) => (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 0',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={Boolean(filters[option.value] || false)}
                onChange={() => handleFilterChange(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
