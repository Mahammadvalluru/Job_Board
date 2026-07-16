import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import { useToast } from '../context/ToastContext';
import JobCard from '../components/shared/JobCard';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { formatSalary, formatDate, timeAgo } from '../utils/formatters';
import './JobDetail.css';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSeeker, isEmployer } = useAuth();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const { showToast } = useToast();
  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const jobData = await jobService.getJob(id);
        if (!jobData) { setLoading(false); return; }
        setJob(jobData);
        jobService.incrementViews(id);
        const similar = await jobService.getSimilarJobs(id, 4);
        setSimilarJobs(similar);
        if (user && isSeeker) {
          const applied = await applicationService.hasApplied(id, user.id);
          setHasApplied(applied);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id, user]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard!', 'success');
  };

  if (loading) {
    return (
      <div className="job-detail container">
        <div className="job-detail__skeleton">
          <div className="skeleton-pulse" style={{ height: 32, width: '60%', marginBottom: 16 }} />
          <div className="skeleton-pulse" style={{ height: 20, width: '40%', marginBottom: 32 }} />
          <div className="skeleton-pulse" style={{ height: 200, marginBottom: 16 }} />
          <div className="skeleton-pulse" style={{ height: 150 }} />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail container">
        <EmptyState icon="😕" title="Job Not Found" description="This job listing may have been removed or doesn't exist." action={{ label: 'Browse Jobs', onClick: () => navigate('/jobs') }} />
      </div>
    );
  }

  const isOwner = isEmployer && user?.companyId === job.companyId;

  return (
    <div className="job-detail">
      <div className="container">
        <div className="job-detail__layout">
          {/* Main content */}
          <div className="job-detail__main">
            {/* Header */}
            <div className="job-detail__header">
              <div className="job-detail__company-logo" style={{ background: `hsl(${job.title.length * 30}, 60%, 50%)` }}>
                {job.company?.name?.charAt(0) || '?'}
              </div>
              <div className="job-detail__header-info">
                <h1 className="job-detail__title">{job.title}</h1>
                <div className="job-detail__meta">
                  <Link to={`/company/${job.companyId}`} className="job-detail__company-name">{job.company?.name}</Link>
                  <span className="job-detail__meta-sep">•</span>
                  <span>📍 {job.location}</span>
                  <span className="job-detail__meta-sep">•</span>
                  <span>{timeAgo(job.postedDate)}</span>
                </div>
                <div className="job-detail__tags">
                  <span className="job-detail__tag">{job.type}</span>
                  <span className="job-detail__tag">{job.experienceLevel}</span>
                  <span className="job-detail__tag">{job.category}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="job-detail__actions">
              {isOwner ? (
                <>
                  <Button variant="primary" onClick={() => navigate(`/employer/edit-job/${job.id}`)}>Edit Listing</Button>
                  <Button variant="outline" onClick={() => navigate(`/employer/applicants/${job.id}`)}>View Applicants ({job.applicantCount})</Button>
                </>
              ) : hasApplied ? (
                <Button variant="secondary" disabled>✓ Already Applied</Button>
              ) : (
                <Button variant="primary" size="lg" onClick={() => navigate(`/apply/${job.id}`)}>Apply Now</Button>
              )}
              <Button variant="ghost" onClick={() => toggleBookmark(job.id)}>
                {isBookmarked(job.id) ? '❤️' : '🤍'} Save
              </Button>
              <Button variant="ghost" onClick={handleShare}>📋 Share</Button>
            </div>

            {/* Description */}
            <section className="job-detail__section">
              <h2>About This Role</h2>
              <p>{job.description}</p>
            </section>

            {job.responsibilities?.length > 0 && (
              <section className="job-detail__section">
                <h2>Responsibilities</h2>
                <ul className="job-detail__list">
                  {job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </section>
            )}

            {job.requirements?.length > 0 && (
              <section className="job-detail__section">
                <h2>Requirements</h2>
                <ul className="job-detail__list">
                  {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </section>
            )}

            {job.benefits?.length > 0 && (
              <section className="job-detail__section">
                <h2>Benefits</h2>
                <ul className="job-detail__list job-detail__list--benefits">
                  {job.benefits.map((b, i) => <li key={i}>✅ {b}</li>)}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="job-detail__sidebar">
            <div className="job-detail__sidebar-card">
              <h3>Job Overview</h3>
              <div className="job-detail__sidebar-item">
                <span className="job-detail__sidebar-label">💰 Salary</span>
                <span className="job-detail__sidebar-value">{formatSalary(job.salaryMin, job.salaryMax)}</span>
              </div>
              <div className="job-detail__sidebar-item">
                <span className="job-detail__sidebar-label">📍 Location</span>
                <span className="job-detail__sidebar-value">{job.location}</span>
              </div>
              <div className="job-detail__sidebar-item">
                <span className="job-detail__sidebar-label">💼 Type</span>
                <span className="job-detail__sidebar-value">{job.type}</span>
              </div>
              <div className="job-detail__sidebar-item">
                <span className="job-detail__sidebar-label">📊 Level</span>
                <span className="job-detail__sidebar-value">{job.experienceLevel}</span>
              </div>
              <div className="job-detail__sidebar-item">
                <span className="job-detail__sidebar-label">📅 Posted</span>
                <span className="job-detail__sidebar-value">{formatDate(job.postedDate)}</span>
              </div>
              {job.deadline && (
                <div className="job-detail__sidebar-item">
                  <span className="job-detail__sidebar-label">⏰ Deadline</span>
                  <span className="job-detail__sidebar-value">{formatDate(job.deadline)}</span>
                </div>
              )}
              <div className="job-detail__sidebar-item">
                <span className="job-detail__sidebar-label">👁 Views</span>
                <span className="job-detail__sidebar-value">{job.views}</span>
              </div>
            </div>

            {job.company && (
              <div className="job-detail__sidebar-card">
                <h3>About {job.company.name}</h3>
                <p className="job-detail__sidebar-company-desc">{job.company.description?.substring(0, 150)}...</p>
                <div className="job-detail__sidebar-item">
                  <span className="job-detail__sidebar-label">🏢 Industry</span>
                  <span className="job-detail__sidebar-value">{job.company.industry}</span>
                </div>
                <div className="job-detail__sidebar-item">
                  <span className="job-detail__sidebar-label">👥 Size</span>
                  <span className="job-detail__sidebar-value">{job.company.size}</span>
                </div>
                <Link to={`/company/${job.companyId}`} className="job-detail__sidebar-company-link">View Company Profile →</Link>
              </div>
            )}
          </aside>
        </div>

        {/* Similar Jobs */}
        {similarJobs.length > 0 && (
          <section className="job-detail__similar">
            <h2>Similar Jobs</h2>
            <div className="job-detail__similar-grid">
              {similarJobs.map(sj => (
                <JobCard key={sj.id} job={sj} onBookmark={() => toggleBookmark(sj.id)} isBookmarked={isBookmarked(sj.id)} />
              ))}
            </div>
          </section>
        )}

        {/* Mobile sticky apply */}
        {!isOwner && !hasApplied && (
          <div className="job-detail__mobile-cta">
            <span className="job-detail__mobile-salary">{formatSalary(job.salaryMin, job.salaryMax)}</span>
            <Button variant="primary" onClick={() => navigate(`/apply/${job.id}`)}>Apply Now</Button>
          </div>
        )}
      </div>
    </div>
  );
}
