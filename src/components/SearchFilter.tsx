import { useState } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineFunnel, HiOutlineXMark } from 'react-icons/hi2';

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

const SearchFilter = ({
  searchQuery: externalSearchQuery = '',
  setSearchQuery: externalSetSearchQuery,
  filters: externalFilters,
  setFilters: externalSetFilters,
  onSearch,
  onFilter,
  filterOptions = [],
  placeholder = 'Search...',
}: SearchFilterProps) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState(externalSearchQuery);
  const [showFilter, setShowFilter] = useState(false);
  const [internalFilters, setInternalFilters] = useState<FilterState>(
    externalFilters ||
      filterOptions.reduce((acc: FilterState, opt) => ({ ...acc, [opt.value]: opt.checked }), {})
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

  return (
    <div className="relative flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
        <input
          type="search"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearch}
          className="input pl-10 pr-10"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              onSearch?.('');
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-secondary rounded-md"
            aria-label="Clear search"
          >
            <HiOutlineXMark className="h-4 w-4" />
          </button>
        )}
      </div>

      {filterOptions.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFilter(!showFilter)}
            className={`btn ${showFilter ? 'btn-primary' : 'btn-secondary'} gap-2`}
          >
            <HiOutlineFunnel className="h-4 w-4" />
            Filter
          </button>
          {showFilter && (
            <div className="absolute right-0 top-full mt-2 z-50 min-w-[200px] card p-3 shadow-elevated">
              {filterOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 py-2 px-1 text-sm text-secondary cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="rounded"
                    style={{ accentColor: 'var(--accent)' }}
                    checked={Boolean(filters[option.value])}
                    onChange={() => handleFilterChange(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
