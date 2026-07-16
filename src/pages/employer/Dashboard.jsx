import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import PageContainer from '../../components/layout/PageContainer';
import { formatDate } from '../../utils/formatters';
import './Dashboard.css';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ totalApplicants: 0, newThisWeek: 0, byStatus: {} });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const employerJobs = await jobService.getEmployerJobs(user.id);
      setJobs(employerJobs);
      const appStats = await applicationService.getApplicationStats(user.id);
      setStats(appStats);
    } catch (err) {
      showToast('Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
      if (currentStatus === 'active') {
        await jobService.closeJob(jobId);
        showToast('Job listing closed.', 'success');
      } else {
        await jobService.reopenJob(jobId);
        showToast('Job listing re-opened.', 'success');
      }
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to update job status.', 'error');
    }
  };

  const activeJobs = jobs.filter((j) => j.status === 'active');
  const closedJobs = jobs.filter((j) => j.status === 'closed');

  if (loading) {
    return (
      <PageContainer>
        <div className="employer-dashboard">
          <div className="skeleton-pulse" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="employer-dashboard">
        <div className="employer-dashboard__header">
          <div>
            <h1>Employer Dashboard</h1>
            <p>Manage your job postings and monitor applicant updates</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/employer/post-job')}>
            ➕ Post a New Job
          </Button>
        </div>

        {/* Stats Section */}
        <div className="employer-dashboard__stats">
          <div className="stat-card">
            <span className="stat-icon">💼</span>
            <div className="stat-data">
              <span className="stat-value">{jobs.length}</span>
              <span className="stat-label">Total Listings</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🟢</span>
            <div className="stat-data">
              <span className="stat-value">{activeJobs.length}</span>
              <span className="stat-label">Active Listings</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <div className="stat-data">
              <span className="stat-value">{stats.totalApplicants}</span>
              <span className="stat-label">Total Candidates</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🔥</span>
            <div className="stat-data">
              <span className="stat-value">{stats.newThisWeek}</span>
              <span className="stat-label">New This Week</span>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <section className="employer-dashboard__section">
          <h3>Your Job Listings</h3>
          {jobs.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No jobs posted yet"
              description="Start recruiting talent by creating your first job listing."
              action={{ label: 'Post a Job', onClick: () => navigate('/employer/post-job') }}
            />
          ) : (
            <div className="listings-table-container">
              <table className="listings-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Category</th>
                    <th>Date Posted</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Applicants</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <div className="table-job-title">
                          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                          <span className="table-job-loc">📍 {job.location}</span>
                        </div>
                      </td>
                      <td>
                        <span className="table-category">{job.category}</span>
                      </td>
                      <td>{formatDate(job.postedDate)}</td>
                      <td>
                        <StatusBadge status={job.status} />
                      </td>
                      <td>👁️ {job.views || 0}</td>
                      <td>
                        <Link to={`/employer/applicants/${job.id}`} className="table-applicant-link">
                          👥 {job.applicantCount || 0} applicants
                        </Link>
                      </td>
                      <td>
                        <div className="table-actions">
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => navigate(`/employer/edit-job/${job.id}`)}
                          >
                            ✏️ Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => handleToggleStatus(job.id, job.status)}
                          >
                            {job.status === 'active' ? '🔒 Close' : '🔓 Reopen'}
                          </Button>
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => navigate(`/employer/applicants/${job.id}`)}
                          >
                            Applicants
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
