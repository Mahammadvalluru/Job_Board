import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

export default function SearchBar({ initialQuery = '', initialLocation = '', onSearch, variant = 'default', className = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ query, location });
    } else {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (location) params.set('location', location);
      navigate(`/jobs?${params.toString()}`);
    }
  };

  return (
    <form className={`search-bar search-bar--${variant} ${className}`} onSubmit={handleSubmit} role="search" aria-label="Job search">
      <div className="search-bar__field">
        <span className="search-bar__icon" aria-hidden="true" style={{ display: 'flex', alignItem: 'center', color: 'var(--text-tertiary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          className="search-bar__input"
          placeholder="Job title, keyword, or company"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search keywords"
        />
      </div>
      <div className="search-bar__divider" />
      <div className="search-bar__field">
        <span className="search-bar__icon" aria-hidden="true" style={{ display: 'flex', alignItem: 'center', color: 'var(--text-tertiary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </span>
        <input
          type="text"
          className="search-bar__input"
          placeholder="City or remote"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          aria-label="Location"
        />
      </div>
      <button type="submit" className="search-bar__btn" aria-label="Search jobs">
        Search
      </button>
    </form>
  );
}
