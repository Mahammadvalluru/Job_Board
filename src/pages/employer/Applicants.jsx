import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Select from '../../components/ui/Select';
import EmptyState from '../../components/ui/EmptyState';
import PageContainer from '../../components/layout/PageContainer';
import { formatDate } from '../../utils/formatters';
import './Applicants.css';

const FILTER_STATUSES = [
  { value: 'all', label: 'All Candidates' },
  { value: 'applied', label: 'Applied / New' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'interview', label: 'Interviewing' },
  { value: 'offer', label: 'Offered' },
  { value: 'rejected', label: 'Rejected' },
];

export default function EmployerApplicants() {
  const { jobId } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [statusUpdateForm, setStatusUpdateForm] = useState({ status: '', note: '' });
  const [updating, setUpdating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const jobData = await jobService.getJob(jobId);
      setJob(jobData);
      const apps = await applicationService.getApplicants(jobId);
      setApplicants(apps);
      if (apps.length > 0) {
        // Default select the first applicant in list
        setSelectedApplicant(apps[0]);
        setStatusUpdateForm({ status: apps[0].status, note: '' });
      } else {
        setSelectedApplicant(null);
      }
    } catch (err) {
      showToast('Failed to load candidate applications.', 'error');
    } finally {
      setLoading(false);
    }
  }, [jobId, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Filtering & Sorting
  useEffect(() => {
    let list = [...applicants];

    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (sortOrder === 'newest') {
      list.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
    } else {
      list.sort((a, b) => new Date(a.appliedDate) - new Date(b.appliedDate));
    }

    setFilteredApplicants(list);

    // Keep selected applicant highlighted if they are still in the filtered list,
    // otherwise select the first filtered applicant, or null.
    if (list.length > 0) {
      const exists = list.some((a) => a.id === selectedApplicant?.id);
      if (!exists) {
        setSelectedApplicant(list[0]);
        setStatusUpdateForm({ status: list[0].status, note: '' });
      }
    } else {
      setSelectedApplicant(null);
    }
  }, [applicants, statusFilter, sortOrder]);

  const handleSelectApplicant = (app) => {
    setSelectedApplicant(app);
    setStatusUpdateForm({ status: app.status, note: '' });
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedApplicant) return;
    setUpdating(true);
    try {
      await applicationService.updateStatus(
        selectedApplicant.id,
        statusUpdateForm.status,
        statusUpdateForm.note
      );
      showToast('Applicant status updated successfully!', 'success');
      loadData(); // Reload list to update status displays
    } catch (err) {
      showToast(err.message || 'Failed to update candidate status.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="applicants-page skeleton-pulse" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="applicants-page">
        {/* Header */}
        <div className="applicants-page__header">
          <div>
            <Link to="/employer/dashboard" className="back-link">
              ← Back to Dashboard
            </Link>
            <h1>Review Candidates</h1>
            <h2>{job?.title} <span className="applicants-loc">📍 {job?.location}</span></h2>
          </div>
        </div>

        {applicants.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No applicants yet"
            description="Nobody has applied for this position yet. Check back in a few days or share the listing link."
            action={{ label: 'Share Job Link', onClick: () => { navigator.clipboard.writeText(`${window.location.origin}/jobs/${jobId}`); showToast('Copied to clipboard!', 'success'); } }}
          />
        ) : (
          <div className="applicants-layout">
            {/* Left Column: Candidates List */}
            <div className="applicants-sidebar-list">
              <div className="list-filters">
                <Select
                  options={FILTER_STATUSES}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                />
                <Select
                  options={[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'oldest', label: 'Oldest First' },
                  ]}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="filter-select"
                />
              </div>

              <div className="applicants-list-scroll">
                {filteredApplicants.length === 0 ? (
                  <p className="no-matches">No candidates match this filter.</p>
                ) : (
                  filteredApplicants.map((app) => (
                    <div
                      key={app.id}
                      className={`applicant-item-card ${selectedApplicant?.id === app.id ? 'applicant-item-card--active' : ''}`}
                      onClick={() => handleSelectApplicant(app)}
                    >
                      <div className="applicant-item-card__info">
                        <div
                          className="avatar-circle"
                          style={{ backgroundColor: app.seeker?.avatarColor || 'var(--color-primary-light)' }}
                        >
                          {app.seeker?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <span className="applicant-item-card__name">{app.seeker?.name}</span>
                          <span className="applicant-item-card__date">Applied {formatDate(app.appliedDate)}</span>
                        </div>
                      </div>
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Selected Candidate Details */}
            <div className="applicant-details-view">
              {selectedApplicant ? (
                <div className="applicant-details-card">
                  {/* Candidate Bio Block */}
                  <div className="candidate-header">
                    <div className="candidate-header__left">
                      <div
                        className="candidate-large-avatar"
                        style={{ backgroundColor: selectedApplicant.seeker?.avatarColor || 'var(--color-primary-light)' }}
                      >
                        {selectedApplicant.seeker?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3>{selectedApplicant.seeker?.name}</h3>
                        <p className="candidate-meta">
                          ✉️ {selectedApplicant.seeker?.email} • 📞 {selectedApplicant.seeker?.phone || 'No phone'} • 📍 {selectedApplicant.seeker?.location || 'No location'}
                        </p>
                      </div>
                    </div>
                    <div className="candidate-header__right">
                      <StatusBadge status={selectedApplicant.status} />
                    </div>
                  </div>

                  <div className="candidate-body">
                    {/* Bio */}
                    {selectedApplicant.seeker?.bio && (
                      <div className="candidate-body-section">
                        <h4>Candidate Summary</h4>
                        <p className="bio-text">{selectedApplicant.seeker.bio}</p>
                      </div>
                    )}

                    {/* Resume & Cover Letter */}
                    <div className="candidate-body-section">
                      <h4>Application Documents</h4>
                      <div className="docs-grp">
                        <div className="doc-box">
                          <span className="doc-icon">📄</span>
                          <div className="doc-details">
                            <span className="doc-name">{selectedApplicant.resumeFileName || 'resume.pdf'}</span>
                            <span className="doc-size">PDF File</span>
                          </div>
                          <button
                            type="button"
                            className="btn-download"
                            onClick={() => showToast(`Simulated download of ${selectedApplicant.resumeFileName}`, 'info')}
                          >
                            ⬇️ Download
                          </button>
                        </div>
                      </div>
                      {selectedApplicant.coverLetter && (
                        <div className="cover-letter-box mt-3">
                          <h5>Cover Letter</h5>
                          <p>{selectedApplicant.coverLetter}</p>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {selectedApplicant.seeker?.skills?.length > 0 && (
                      <div className="candidate-body-section">
                        <h4>Skills</h4>
                        <div className="candidate-skills-list">
                          {selectedApplicant.seeker.skills.map((skill) => (
                            <span key={skill} className="candidate-skill-tag">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Work History */}
                    {selectedApplicant.seeker?.experience?.length > 0 && (
                      <div className="candidate-body-section">
                        <h4>Work History</h4>
                        <div className="candidate-timeline">
                          {selectedApplicant.seeker.experience.map((exp, idx) => (
                            <div key={idx} className="candidate-timeline-item">
                              <h5 className="timeline-title">{exp.title}</h5>
                              <h6 className="timeline-sub">{exp.company} • ({exp.from} to {exp.to || 'Present'})</h6>
                              <p className="timeline-desc">{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {selectedApplicant.seeker?.education?.length > 0 && (
                      <div className="candidate-body-section">
                        <h4>Education</h4>
                        <div className="candidate-timeline">
                          {selectedApplicant.seeker.education.map((edu, idx) => (
                            <div key={idx} className="candidate-timeline-item">
                              <h5 className="timeline-title">{edu.degree}</h5>
                              <h6 className="timeline-sub">{edu.school} • (Class of {edu.year})</h6>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Update Status Widget */}
                    <div className="candidate-body-section update-status-section">
                      <h4>Update Application Status</h4>
                      <form onSubmit={handleStatusUpdate} className="status-update-form">
                        <div className="form-row">
                          <Select
                            label="New Status"
                            options={[
                              { value: 'applied', label: 'Applied' },
                              { value: 'under-review', label: 'Under Review' },
                              { value: 'interview', label: 'Interview' },
                              { value: 'offer', label: 'Offer' },
                              { value: 'rejected', label: 'Rejected' },
                            ]}
                            value={statusUpdateForm.status}
                            onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, status: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                        <Input
                          label="Timeline Note"
                          type="textarea"
                          rows={3}
                          placeholder="e.g. Schedule technical panel interview for next Tuesday at 2 PM..."
                          value={statusUpdateForm.note}
                          onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, note: e.target.value })}
                        />
                        <Button type="submit" variant="primary" loading={updating}>
                          Update Candidate Status
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-candidate-selected">
                  <span className="no-candidate-icon">👈</span>
                  <h3>Select a Candidate</h3>
                  <p>Choose a candidate from the listing sidebar to review their profile details and update status.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
