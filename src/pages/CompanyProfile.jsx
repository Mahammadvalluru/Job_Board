import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getData, simulateDelay } from '../services/api';
import { useBookmarks } from '../context/BookmarkContext';
import JobCard from '../components/shared/JobCard';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import PageContainer from '../components/layout/PageContainer';
import './CompanyProfile.css';

export default function CompanyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleBookmark, isBookmarked } = useBookmarks();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await simulateDelay(150);
        // Fetch company
        const allCompanies = getData('companies') || [];
        const comp = allCompanies.find((c) => c.id === id);
        if (comp) {
          setCompany(comp);

          // Fetch jobs posted by this company
          const allJobs = getData('jobs') || [];
          const activeCompanyJobs = allJobs
            .filter((j) => j.companyId === id && j.status === 'active')
            .sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));

          setJobs(activeCompanyJobs);
        }
      } catch (err) {
        console.error('Failed to load company profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <div className="public-company-profile skeleton-pulse" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
      </PageContainer>
    );
  }

  if (!company) {
    return (
      <PageContainer>
        <div className="public-company-profile">
          <EmptyState
            icon="🏢"
            title="Company Not Found"
            description="The company profile you are trying to view does not exist or has been removed."
            action={{ label: 'Back to Jobs', onClick: () => navigate('/jobs') }}
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="public-company-profile">
        {/* Banner / Header */}
        <header className="company-header">
          <div className="company-header__logo" style={{ background: `hsl(${company.name.length * 30}, 60%, 50%)` }}>
            {company.name.charAt(0)}
          </div>
          <div className="company-header__info">
            <h1 className="company-name">{company.name}</h1>
            <div className="company-meta-row">
              {company.industry && <span>🏢 {company.industry}</span>}
              {company.location && <span>📍 {company.location}</span>}
              {company.size && <span>👥 {company.size} employees</span>}
              {company.founded && <span>📅 Founded {company.founded}</span>}
            </div>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="company-website-btn">
                🔗 Visit Website
              </a>
            )}
          </div>
        </header>

        {/* Layout Grid */}
        <div className="company-profile-layout">
          {/* Main Info */}
          <div className="company-profile-main-content">
            <section className="profile-details-section">
              <h3>About the Company</h3>
              <p className="company-description">{company.description || 'No description available for this company.'}</p>
            </section>

            {/* Perks list */}
            {company.benefits && company.benefits.length > 0 && (
              <section className="profile-details-section">
                <h3>Working Here — Perks & Benefits</h3>
                <ul className="company-perks-list">
                  {company.benefits.map((benefit, i) => (
                    <li key={i}>
                      <span className="perk-check">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar: Open Positions */}
          <aside className="company-profile-open-jobs">
            <h3>Open Positions ({jobs.length})</h3>
            {jobs.length === 0 ? (
              <div className="no-open-jobs">
                <span>📭</span>
                <p>There are currently no active job postings for {company.name}. Check back later!</p>
              </div>
            ) : (
              <div className="company-jobs-list">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={{ ...job, company }} // enrich with current company details
                    onBookmark={() => toggleBookmark(job.id)}
                    isBookmarked={isBookmarked(job.id)}
                  />
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}
