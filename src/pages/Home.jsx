import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { useBookmarks } from '../context/BookmarkContext';
import JobCard from '../components/shared/JobCard';
import SearchBar from '../components/shared/SearchBar';
import Skeleton from '../components/ui/Skeleton';
import './Home.css';

const categories = [
  { key: 'engineering', label: 'Engineering', icon: '💻', color: '#3b82f6' },
  { key: 'design', label: 'Design', icon: '🎨', color: '#8b5cf6' },
  { key: 'marketing', label: 'Marketing', icon: '📢', color: '#f59e0b' },
  { key: 'sales', label: 'Sales', icon: '📈', color: '#10b981' },
  { key: 'finance', label: 'Finance', icon: '💰', color: '#ef4444' },
  { key: 'hr', label: 'Human Resources', icon: '👥', color: '#06b6d4' },
];

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const navigate = useNavigate();

  useEffect(() => {
    jobService.searchJobs({ sort: 'newest', pageSize: 6 })
      .then(res => setFeaturedJobs(res.jobs))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = ({ keyword, location }) => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="home__hero">
        <div className="container">
          <div className="home__hero-content">
            <h1 className="home__hero-title">
              Find Your <span className="home__hero-highlight">Dream Job</span>
            </h1>
            <p className="home__hero-subtitle">
              Discover thousands of opportunities from top companies. Your next career move starts here.
            </p>
            <div className="home__hero-search">
              <SearchBar onSearch={handleSearch} />
            </div>
            <div className="home__hero-stats">
              <div className="home__stat">
                <span className="home__stat-number">10,000+</span>
                <span className="home__stat-label">Active Jobs</span>
              </div>
              <div className="home__stat">
                <span className="home__stat-number">500+</span>
                <span className="home__stat-label">Companies</span>
              </div>
              <div className="home__stat">
                <span className="home__stat-number">1M+</span>
                <span className="home__stat-label">Job Seekers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="home__section">
        <div className="container">
          <div className="home__section-header">
            <h2>Featured Jobs</h2>
            <Link to="/jobs" className="home__view-all">View all jobs →</Link>
          </div>
          <div className="home__jobs-grid">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-pulse" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
              ))
            ) : (
              featuredJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onBookmark={() => toggleBookmark(job.id)}
                  isBookmarked={isBookmarked(job.id)}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="home__section home__section--alt">
        <div className="container">
          <div className="home__section-header">
            <h2>Browse by Category</h2>
            <p className="home__section-desc">Explore opportunities across different fields</p>
          </div>
          <div className="home__categories-grid">
            {categories.map(cat => (
              <Link key={cat.key} to={`/jobs?category=${cat.key}`} className="home__category-card">
                <span className="home__category-icon" style={{ background: cat.color + '18', color: cat.color }}>{cat.icon}</span>
                <span className="home__category-label">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="home__section">
        <div className="container">
          <div className="home__section-header">
            <h2>How It Works</h2>
          </div>
          <div className="home__steps">
            <div className="home__step">
              <span className="home__step-number">1</span>
              <h3>Search</h3>
              <p>Browse jobs by keyword, location, or category to find your perfect match.</p>
            </div>
            <div className="home__step">
              <span className="home__step-number">2</span>
              <h3>Apply</h3>
              <p>Submit your application with just a few clicks. Upload your resume and go.</p>
            </div>
            <div className="home__step">
              <span className="home__step-number">3</span>
              <h3>Get Hired</h3>
              <p>Track your application status and land your dream job.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home__cta">
        <div className="container">
          <h2>Ready to hire top talent?</h2>
          <p>Post your job listing and reach thousands of qualified candidates.</p>
          <Link to="/register" className="home__cta-btn">Get Started — It's Free</Link>
        </div>
      </section>
    </div>
  );
}
