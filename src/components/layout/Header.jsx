import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

export default function Header() {
  const { user, isAuthenticated, isEmployer, isSeeker, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const closeMobile = () => setMobileOpen(false);

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  return (
    <header className="header">
      <div className="header__inner container">
        <Link to="/" className="header__logo" onClick={closeMobile}>
          <span className="header__logo-icon">⚡</span>
          <span className="header__logo-text">JobFlow</span>
        </Link>

        <button
          className="header__hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          <span className={`header__hamburger-line ${mobileOpen ? 'open' : ''}`} />
          <span className={`header__hamburger-line ${mobileOpen ? 'open' : ''}`} />
          <span className={`header__hamburger-line ${mobileOpen ? 'open' : ''}`} />
        </button>

        <nav className={`header__nav ${mobileOpen ? 'header__nav--open' : ''}`} aria-label="Main navigation">
          <NavLink to="/jobs" className="header__link" onClick={closeMobile}>Find Jobs</NavLink>

          {isSeeker && (
            <>
              <NavLink to="/seeker/dashboard" className="header__link" onClick={closeMobile}>Dashboard</NavLink>
              <NavLink to="/seeker/applications" className="header__link" onClick={closeMobile}>Applications</NavLink>
              <NavLink to="/seeker/saved-jobs" className="header__link" onClick={closeMobile}>Saved Jobs</NavLink>
            </>
          )}

          {isEmployer && (
            <>
              <NavLink to="/employer/dashboard" className="header__link" onClick={closeMobile}>Dashboard</NavLink>
              <NavLink to="/employer/post-job" className="header__link" onClick={closeMobile}>Post Job</NavLink>
            </>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            className="header__theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {isAuthenticated ? (
            <div className="header__user-menu">
              <button
                className="header__avatar-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User menu"
                aria-expanded={dropdownOpen}
              >
                <span className="header__avatar">{getInitial(user.name)}</span>
                <span className="header__user-name">{user.name}</span>
                <span className="header__caret">▾</span>
              </button>
              {dropdownOpen && (
                <>
                  <div className="header__dropdown-backdrop" onClick={() => setDropdownOpen(false)} />
                  <div className="header__dropdown">
                    <div className="header__dropdown-header">
                      <span className="header__dropdown-name">{user.name}</span>
                      <span className="header__dropdown-email">{user.email}</span>
                    </div>
                    <div className="header__dropdown-divider" />
                    {isSeeker && (
                      <>
                        <Link to="/seeker/profile" className="header__dropdown-item" onClick={() => setDropdownOpen(false)}>Profile</Link>
                        <Link to="/seeker/dashboard" className="header__dropdown-item" onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                      </>
                    )}
                    {isEmployer && (
                      <>
                        <Link to="/employer/company-profile" className="header__dropdown-item" onClick={() => setDropdownOpen(false)}>Company Profile</Link>
                        <Link to="/employer/dashboard" className="header__dropdown-item" onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                      </>
                    )}
                    <div className="header__dropdown-divider" />
                    <button className="header__dropdown-item header__dropdown-item--danger" onClick={handleLogout}>Log Out</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="header__auth-buttons">
              <Link to="/login" className="header__link" onClick={closeMobile}>Log In</Link>
              <Link to="/register" className="header__btn-signup" onClick={closeMobile}>Sign Up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
