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
        <span className="search-bar__icon" aria-hidden="true">🔍</span>
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
        <span className="search-bar__icon" aria-hidden="true">📍</span>
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
