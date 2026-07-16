import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { useBookmarks } from '../context/BookmarkContext';
import JobCard from '../components/shared/JobCard';
import SearchBar from '../components/shared/SearchBar';
import FilterBar from '../components/shared/FilterBar';
import Pagination from '../components/ui/Pagination';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';
import Chip from '../components/ui/Chip';
import './JobSearch.css';

export default function JobSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { toggleBookmark, isBookmarked } = useBookmarks();

  const keyword = searchParams.get('keyword') || '';
  const location = searchParams.get('location') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const type = searchParams.get('type') || '';
  const experienceLevel = searchParams.get('experienceLevel') || '';
  const category = searchParams.get('category') || '';
  const datePosted = searchParams.get('datePosted') || '';
  const salaryMin = searchParams.get('salaryMin') ? Number(searchParams.get('salaryMin')) : null;
  const salaryMax = searchParams.get('salaryMax') ? Number(searchParams.get('salaryMax')) : null;

  const filters = { type, experienceLevel, category, datePosted, salaryMin, salaryMax, location };

  const activeFilterCount = [type, experienceLevel, category, datePosted, salaryMin, salaryMax, location]
    .filter(v => v != null && v !== '').length;

  const activeChips = [];
  if (keyword) activeChips.push({ key: 'keyword', label: `Keyword: ${keyword}` });
  if (location) activeChips.push({ key: 'location', label: `Location: ${location}` });
  if (category) activeChips.push({ key: 'category', label: `Category: ${category}` });
  if (type) activeChips.push({ key: 'type', label: `Type: ${type}` });
  if (experienceLevel) activeChips.push({ key: 'experienceLevel', label: `Level: ${experienceLevel}` });
  if (datePosted) activeChips.push({ key: 'datePosted', label: `Posted: ${datePosted}` });
  if (salaryMin) activeChips.push({ key: 'salaryMin', label: `Min Salary: $${salaryMin.toLocaleString()}` });

  const handleRemoveChip = (key) => {
    updateParams({ [key]: '' });
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await jobService.searchJobs({
        keyword, location, type, experienceLevel, salaryMin, salaryMax,
        category, datePosted, sort, page, pageSize: 10,
      });
      setJobs(res.jobs);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [keyword, location, type, experienceLevel, salaryMin, salaryMax, category, datePosted, sort, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v == null || v === '') params.delete(k);
      else params.set(k, String(v));
    });
    if (!updates.page) params.delete('page');
    setSearchParams(params);
  };

  const handleSearch = ({ keyword: kw, location: loc }) => {
    updateParams({ keyword: kw, location: loc, page: null });
  };

  const handleFilterChange = (newFilters) => {
    updateParams({ ...newFilters, page: null });
  };

  const handleClearAll = () => {
    setSearchParams(keyword ? { keyword } : {});
  };

  return (
    <div className="job-search">
      <div className="job-search__header">
        <div className="container">
          <SearchBar
            onSearch={handleSearch}
            initialKeyword={keyword}
            initialLocation={location}
          />
        </div>
      </div>

      <div className="container">
        <div className="job-search__layout">
          {/* Mobile filter toggle */}
          <button
            className="job-search__filter-toggle"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            Filters {activeFilterCount > 0 && <span className="job-search__filter-badge">{activeFilterCount}</span>}
          </button>

          {/* Sidebar */}
          <aside className={`job-search__sidebar ${filtersOpen ? 'job-search__sidebar--open' : ''}`}>
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAll}
            />
          </aside>

          {/* Results */}
          <div className="job-search__results">
            <div className="job-search__results-header">
              <span className="job-search__count">
                {loading ? 'Searching...' : `${total} job${total !== 1 ? 's' : ''} found`}
              </span>
              <Select
                options={[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'relevance', label: 'Most Relevant' },
                  { value: 'salary', label: 'Highest Salary' },
                ]}
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                placeholder="Sort by"
              />
            </div>

            {activeChips.length > 0 && (
              <div className="job-search__chips">
                {activeChips.map(chip => (
                  <Chip
                    key={chip.key}
                    label={chip.label}
                    onRemove={() => handleRemoveChip(chip.key)}
                  />
                ))}
                <button className="job-search__clear-chips" onClick={handleClearAll}>
                  Clear all
                </button>
              </div>
            )}

            {loading ? (
              <div className="job-search__loading">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton-pulse" style={{ height: 160, borderRadius: 'var(--radius-lg)' }} />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No jobs match your search"
                description="Try broadening your filters or using different keywords. Sometimes less specific searches yield better results."
                action={{ label: 'Clear all filters', onClick: handleClearAll }}
              />
            ) : (
              <>
                <div className="job-search__list">
                  {jobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onBookmark={() => toggleBookmark(job.id)}
                      isBookmarked={isBookmarked(job.id)}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(p) => updateParams({ page: p })}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
