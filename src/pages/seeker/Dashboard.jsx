import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import PageContainer from '../../components/layout/PageContainer';
import { formatDate, timeAgo } from '../../utils/formatters';
import './Dashboard.css';

const STATUS_MAP = {
  submitted: 'Applied',
  reviewing: 'Under Review',
  interview: 'Interview',
  accepted: 'Offer',
  rejected: 'Rejected',
};

export default function SeekerDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const apps = await applicationService.getMyApplications(user.id);
      setApplications(apps);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      showToast('Could not load your dashboard', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Compute stats
  const stats = {
    total: applications.length,
    reviewing: applications.filter((a) => a.status === 'reviewing').length,
    interview: applications.filter((a) => a.status === 'interview').length,
    offers: applications.filter((a) => a.status === 'accepted').length,
  };

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
    .slice(0, 5);

  const firstName = user?.name?.split(' ')[0] || 'there';

  // ── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <PageContainer>
        <div className="seeker-dashboard" aria-busy="true" aria-label="Loading dashboard">
          <div className="seeker-dashboard__welcome">
            <Skeleton width="280px" height="32px" />
            <Skeleton width="200px" height="16px" className="mt-2" />
          </div>
          <div className="seeker-dashboard__stats">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="seeker-dashboard__stat-skeleton">
                <Skeleton width="40px" height="40px" variant="rect" />
                <Skeleton width="48px" height="36px" className="mt-3" />
                <Skeleton width="100px" height="14px" className="mt-1" />
              </div>
            ))}
          </div>
          <div className="seeker-dashboard__section">
            <Skeleton width="180px" height="22px" />
            <div className="seeker-dashboard__applications-list" style={{ marginTop: 'var(--space-4)' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="seeker-dashboard__app-skeleton">
                  <Skeleton width="36px" height="36px" variant="rect" />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="160px" height="14px" />
                    <Skeleton width="100px" height="12px" />
                  </div>
                  <Skeleton width="70px" height="22px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="seeker-dashboard">
        {/* ── Welcome ─────────────────────────────────────── */}
        <div className="seeker-dashboard__welcome">
          <h1 className="seeker-dashboard__greeting">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="seeker-dashboard__subtext">
            Here&apos;s an overview of your job search activity.
          </p>
        </div>

        {/* ── Error Banner ────────────────────────────────── */}
        {error && (
          <div className="seeker-dashboard__error" role="alert">
            <span className="seeker-dashboard__error-text">⚠️ {error}</span>
            <Button variant="outline" size="small" onClick={fetchDashboardData}>
              Retry
            </Button>
          </div>
        )}

        {/* ── Stats Cards ─────────────────────────────────── */}
        <div className="seeker-dashboard__stats" role="list" aria-label="Application statistics">
          <div
            className="seeker-dashboard__stat-card seeker-dashboard__stat-card--blue"
            role="listitem"
          >
            <div className="seeker-dashboard__stat-icon" aria-hidden="true">📄</div>
            <div className="seeker-dashboard__stat-value">{stats.total}</div>
            <div className="seeker-dashboard__stat-label">Total Applications</div>
          </div>
          <div
            className="seeker-dashboard__stat-card seeker-dashboard__stat-card--amber"
            role="listitem"
          >
            <div className="seeker-dashboard__stat-icon" aria-hidden="true">🔍</div>
            <div className="seeker-dashboard__stat-value">{stats.reviewing}</div>
            <div className="seeker-dashboard__stat-label">Under Review</div>
          </div>
          <div
            className="seeker-dashboard__stat-card seeker-dashboard__stat-card--purple"
            role="listitem"
          >
            <div className="seeker-dashboard__stat-icon" aria-hidden="true">🎙️</div>
            <div className="seeker-dashboard__stat-value">{stats.interview}</div>
            <div className="seeker-dashboard__stat-label">Interviews</div>
          </div>
          <div
            className="seeker-dashboard__stat-card seeker-dashboard__stat-card--green"
            role="listitem"
          >
            <div className="seeker-dashboard__stat-icon" aria-hidden="true">🎉</div>
            <div className="seeker-dashboard__stat-value">{stats.offers}</div>
            <div className="seeker-dashboard__stat-label">Offers</div>
          </div>
        </div>

        {/* ── Recent Applications ─────────────────────────── */}
        <section className="seeker-dashboard__section" aria-labelledby="recent-apps-heading">
          <div className="seeker-dashboard__section-header">
            <h2
              id="recent-apps-heading"
              className="seeker-dashboard__section-title"
            >
              Recent Applications
            </h2>
            {applications.length > 0 && (
              <Link to="/seeker/applications" className="seeker-dashboard__section-link">
                View All →
              </Link>
            )}
          </div>

          {applications.length === 0 ? (
            <EmptyState
              icon="📭"
              title="No applications yet"
              description="Start by browsing available jobs and submit your first application."
              action={
                <Button onClick={() => navigate('/jobs')}>
                  Browse Jobs
                </Button>
              }
            />
          ) : (
            <div className="seeker-dashboard__applications-list">
              {recentApplications.map((app) => {
                const job = app.job;
                const companyName = job?.company?.name || 'Unknown Company';
                return (
                  <Link
                    key={app.id}
                    to={`/jobs/${app.jobId}`}
                    className="seeker-dashboard__application-item"
                    aria-label={`Application for ${job?.title || 'Unknown Job'} at ${companyName}`}
                  >
                    <div
                      className="seeker-dashboard__application-logo"
                      style={{ backgroundColor: `hsl(${(job?.title?.length || 0) * 30}, 60%, 50%)` }}
                      aria-hidden="true"
                    >
                      {companyName.charAt(0)}
                    </div>
                    <div className="seeker-dashboard__application-info">
                      <div className="seeker-dashboard__application-title">
                        {job?.title || 'Loading...'}
                      </div>
                      <div className="seeker-dashboard__application-company">
                        {companyName}
                      </div>
                    </div>
                    <div className="seeker-dashboard__application-meta">
                      <StatusBadge status={app.status} />
                      <span className="seeker-dashboard__application-date">
                        {timeAgo(app.appliedDate)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Quick Links ─────────────────────────────────── */}
        <section className="seeker-dashboard__section" aria-labelledby="quick-links-heading">
          <h2
            id="quick-links-heading"
            className="seeker-dashboard__section-title"
            style={{ marginBottom: 'var(--space-4)' }}
          >
            Quick Links
          </h2>
          <div className="seeker-dashboard__quick-links">
            <Link to="/jobs" className="seeker-dashboard__quick-link" aria-label="Browse available jobs">
              <span className="seeker-dashboard__quick-link-icon" aria-hidden="true">🔎</span>
              Browse Jobs
              <span className="seeker-dashboard__quick-link-arrow" aria-hidden="true">→</span>
            </Link>
            <Link to="/seeker/saved-jobs" className="seeker-dashboard__quick-link" aria-label="View saved jobs">
              <span className="seeker-dashboard__quick-link-icon" aria-hidden="true">★</span>
              Saved Jobs
              <span className="seeker-dashboard__quick-link-arrow" aria-hidden="true">→</span>
            </Link>
            <Link to="/seeker/profile" className="seeker-dashboard__quick-link" aria-label="Edit your profile">
              <span className="seeker-dashboard__quick-link-icon" aria-hidden="true">👤</span>
              Edit Profile
              <span className="seeker-dashboard__quick-link-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
