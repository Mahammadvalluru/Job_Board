import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { applicationService } from '../../services/applicationService';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import PageContainer from '../../components/layout/PageContainer';
import { formatDate, timeAgo } from '../../utils/formatters';
import './Applications.css';

export default function SeekerApplications() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAppId, setExpandedAppId] = useState(null);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const apps = await applicationService.getMyApplications(user.id);
        setApplications(apps);
      } catch (err) {
        showToast('Failed to load applications.', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchApps();
  }, [user, showToast]);

  const toggleExpand = (appId) => {
    setExpandedAppId(expandedAppId === appId ? null : appId);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="seeker-apps-page">
          <div className="skeleton-pulse" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="seeker-apps-page">
        <div className="seeker-apps-page__header">
          <h1>My Applications</h1>
          <p>Track the status of your job applications and view interview requests</p>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No applications yet"
            description="You haven't applied to any jobs yet. Browse our job board to find suitable roles."
            action={{ label: 'Browse Jobs', onClick: () => window.location.assign('/jobs') }}
          />
        ) : (
          <div className="seeker-apps-list">
            {applications.map((app) => {
              const { job } = app;
              const companyName = job?.company?.name || 'Unknown Company';
              const isExpanded = expandedAppId === app.id;

              return (
                <div key={app.id} className={`app-card ${isExpanded ? 'app-card--expanded' : ''}`}>
                  <div className="app-card__summary" onClick={() => toggleExpand(app.id)}>
                    <div className="app-card__header-info">
                      <div
                        className="app-card__logo"
                        style={{ backgroundColor: `hsl(${(job?.title?.length || 0) * 30}, 60%, 50%)` }}
                      >
                        {companyName.charAt(0)}
                      </div>
                      <div className="app-card__title-grp">
                        <h3 className="app-card__title">{job?.title || 'Unknown Job'}</h3>
                        <h4 className="app-card__company">{companyName}</h4>
                        <span className="app-card__date">Applied {formatDate(app.appliedDate)} ({timeAgo(app.appliedDate)})</span>
                      </div>
                    </div>

                    <div className="app-card__meta">
                      <StatusBadge status={app.status} />
                      <span className="app-card__chevron">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="app-card__details">
                      <div className="app-card__details-grid">
                        {/* Application details */}
                        <div className="app-details-left">
                          <div className="details-section">
                            <h4>Submitted Documents</h4>
                            <div className="submitted-file">
                              <span className="file-icon">📄</span>
                              <span>{app.resumeFileName || 'resume.pdf'}</span>
                            </div>
                          </div>

                          {app.coverLetter && (
                            <div className="details-section">
                              <h4>Cover Letter</h4>
                              <p className="cover-letter-text">{app.coverLetter}</p>
                            </div>
                          )}

                          <div className="details-section mt-4">
                            <Link to={`/jobs/${app.jobId}`} className="view-listing-link">
                              View Original Job Listing →
                            </Link>
                          </div>
                        </div>

                        {/* Status Timeline */}
                        <div className="app-details-right">
                          <h4>Application Timeline</h4>
                          <div className="timeline">
                            {app.statusHistory && app.statusHistory.map((history, idx) => (
                              <div key={idx} className={`timeline-step ${history.status === app.status ? 'timeline-step--active' : ''}`}>
                                <div className="timeline-step__marker">
                                  <div className="timeline-step__dot" />
                                  {idx < app.statusHistory.length - 1 && <div className="timeline-step__line" />}
                                </div>
                                <div className="timeline-step__content">
                                  <span className="timeline-step__status">
                                    <StatusBadge status={history.status} size="sm" />
                                  </span>
                                  <span className="timeline-step__date">{formatDate(history.date)}</span>
                                  <p className="timeline-step__note">{history.note || `Status changed to ${history.status}`}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
