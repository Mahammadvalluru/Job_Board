import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { jobService } from '../../services/jobService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import PageContainer from '../../components/layout/PageContainer';
import './PostJob.css';

const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

const LEVELS = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'lead', label: 'Lead / Executive' },
];

const CATEGORIES = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'finance', label: 'Finance' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'operations', label: 'Operations' },
];

export default function PostJob() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isEditMode = !!jobId;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    location: '',
    type: 'full-time',
    experienceLevel: 'mid',
    category: 'engineering',
    salaryMin: '',
    salaryMax: '',
    description: '',
    deadline: '',
  });

  const [requirements, setRequirements] = useState([]);
  const [newReq, setNewReq] = useState('');

  const [responsibilities, setResponsibilities] = useState([]);
  const [newResp, setNewResp] = useState('');

  const [benefits, setBenefits] = useState([]);
  const [newBenefit, setNewBenefit] = useState('');

  const [errors, setErrors] = useState({});

  // ── Pre-fill if Edit Mode ──
  useEffect(() => {
    if (isEditMode) {
      const loadJob = async () => {
        try {
          const job = await jobService.getJob(jobId);
          if (!job) {
            showToast('Job listing not found.', 'error');
            navigate('/employer/dashboard');
            return;
          }
          // Security check: only owner company can edit
          if (job.companyId !== user.companyId) {
            showToast('Access denied. You cannot edit this listing.', 'error');
            navigate('/employer/dashboard');
            return;
          }
          setForm({
            title: job.title || '',
            location: job.location || '',
            type: job.type || 'full-time',
            experienceLevel: job.experienceLevel || 'mid',
            category: job.category || 'engineering',
            salaryMin: job.salaryMin || '',
            salaryMax: job.salaryMax || '',
            description: job.description || '',
            deadline: job.deadline ? job.deadline.split('T')[0] : '',
          });
          setRequirements(job.requirements || []);
          setResponsibilities(job.responsibilities || []);
          setBenefits(job.benefits || []);
        } catch (err) {
          showToast('Failed to load job details.', 'error');
        } finally {
          setLoading(false);
        }
      };
      loadJob();
    }
  }, [jobId, isEditMode, user, navigate, showToast]);

  // ── Real-time input validation ──
  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'title':
        if (!value.trim()) newErrors.title = 'Job Title is required';
        else delete newErrors.title;
        break;
      case 'location':
        if (!value.trim()) newErrors.location = 'Location is required';
        else delete newErrors.location;
        break;
      case 'description':
        if (!value.trim()) newErrors.description = 'Job Description is required';
        else if (value.trim().length < 50) newErrors.description = 'Description should be at least 50 characters';
        else delete newErrors.description;
        break;
      case 'salaryMin':
        if (value === '') {
          delete newErrors.salaryMin;
        } else if (Number(value) <= 0) {
          newErrors.salaryMin = 'Minimum salary must be greater than 0';
        } else {
          delete newErrors.salaryMin;
          // Re-validate max if min changes
          if (form.salaryMax && Number(form.salaryMax) < Number(value)) {
            newErrors.salaryMax = 'Maximum salary must be greater than or equal to minimum';
          } else {
            delete newErrors.salaryMax;
          }
        }
        break;
      case 'salaryMax':
        if (value === '') {
          delete newErrors.salaryMax;
        } else if (Number(value) < Number(form.salaryMin)) {
          newErrors.salaryMax = 'Maximum salary must be greater than or equal to minimum';
        } else {
          delete newErrors.salaryMax;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const validateForm = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Job Title is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.description.trim()) e.description = 'Job Description is required';
    else if (form.description.trim().length < 50) e.description = 'Description should be at least 50 characters';

    if (form.salaryMin !== '' && Number(form.salaryMin) <= 0) e.salaryMin = 'Minimum salary must be greater than 0';
    if (form.salaryMax !== '' && Number(form.salaryMax) < Number(form.salaryMin)) {
      e.salaryMax = 'Maximum salary must be greater than or equal to minimum';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Bullet Point List Adders/Removers ──
  const addBullet = (type, value, setter, currentList) => {
    if (!value.trim()) return;
    if (currentList.includes(value.trim())) {
      showToast('Item already added', 'warning');
      return;
    }
    setter([...currentList, value.trim()]);
  };

  const removeBullet = (idx, setter, currentList) => {
    setter(currentList.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please correct form validation errors.', 'error');
      return;
    }
    if (requirements.length === 0) {
      showToast('Please add at least one job requirement.', 'warning');
      return;
    }

    setSubmitting(true);
    const jobData = {
      ...form,
      salaryMin: form.salaryMin !== '' ? Number(form.salaryMin) : null,
      salaryMax: form.salaryMax !== '' ? Number(form.salaryMax) : null,
      requirements,
      responsibilities,
      benefits,
      companyId: user.companyId,
    };

    try {
      if (isEditMode) {
        await jobService.updateJob(jobId, jobData);
        showToast('Job listing updated successfully!', 'success');
      } else {
        await jobService.createJob(jobData);
        showToast('Job listing published successfully!', 'success');
      }
      navigate('/employer/dashboard');
    } catch (err) {
      showToast(err.message || 'Failed to submit job listing', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="post-job-page skeleton-pulse" style={{ height: 450, borderRadius: 'var(--radius-lg)' }} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="post-job-page">
        <div className="post-job-page__header">
          <h1>{isEditMode ? 'Edit Job Listing' : 'Post a New Job'}</h1>
          <p>{isEditMode ? 'Update your current listing details.' : 'Create a listing to find talented job seekers.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="post-job-form" noValidate>
          <div className="post-job-grid">
            {/* Left side: basic form */}
            <div className="post-job-main">
              <section className="form-section">
                <h3>Job Details</h3>
                <Input
                  label="Job Title *"
                  value={form.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={errors.title}
                  required
                />
                <div className="form-row">
                  <Input
                    label="Location *"
                    placeholder="e.g. San Francisco, CA or Remote"
                    value={form.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    error={errors.location}
                    className="flex-1"
                    required
                  />
                  <Select
                    label="Category *"
                    options={CATEGORIES}
                    value={form.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="form-row">
                  <Select
                    label="Job Type *"
                    options={JOB_TYPES}
                    value={form.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    label="Experience Level *"
                    options={LEVELS}
                    value={form.experienceLevel}
                    onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="form-row">
                  <Input
                    label="Minimum Salary (Annual USD)"
                    type="number"
                    placeholder="e.g. 80000"
                    value={form.salaryMin}
                    onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                    error={errors.salaryMin}
                    className="flex-1"
                  />
                  <Input
                    label="Maximum Salary (Annual USD)"
                    type="number"
                    placeholder="e.g. 120000"
                    value={form.salaryMax}
                    onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                    error={errors.salaryMax}
                    className="flex-1"
                  />
                </div>
                <div className="form-row">
                  <Input
                    label="Application Deadline"
                    type="date"
                    value={form.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    className="flex-1"
                  />
                </div>
                <Input
                  label="Role Description *"
                  type="textarea"
                  rows={8}
                  placeholder="Outline the overall mission of the role and team..."
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  error={errors.description}
                  required
                />
              </section>
            </div>

            {/* Right side: requirements & lists */}
            <div className="post-job-sidebar">
              {/* Requirements List */}
              <section className="form-section">
                <h3>Requirements *</h3>
                <div className="list-adder">
                  <Input
                    placeholder="Add a requirement..."
                    value={newReq}
                    onChange={(e) => setNewReq(e.target.value)}
                    className="flex-1"
                    fullWidth={false}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      addBullet('Req', newReq, setRequirements, requirements);
                      setNewReq('');
                    }}
                  >
                    Add
                  </Button>
                </div>
                <ul className="bullet-points-list mt-3">
                  {requirements.length === 0 ? (
                    <p className="empty-text">No requirements listed (Minimum 1).</p>
                  ) : (
                    requirements.map((req, i) => (
                      <li key={i}>
                        <span>{req}</span>
                        <button type="button" onClick={() => removeBullet(i, setRequirements, requirements)}>
                          ❌
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </section>

              {/* Responsibilities List */}
              <section className="form-section">
                <h3>Responsibilities</h3>
                <div className="list-adder">
                  <Input
                    placeholder="Add a responsibility..."
                    value={newResp}
                    onChange={(e) => setNewResp(e.target.value)}
                    className="flex-1"
                    fullWidth={false}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      addBullet('Resp', newResp, setResponsibilities, responsibilities);
                      setNewResp('');
                    }}
                  >
                    Add
                  </Button>
                </div>
                <ul className="bullet-points-list mt-3">
                  {responsibilities.length === 0 ? (
                    <p className="empty-text">No responsibilities listed.</p>
                  ) : (
                    responsibilities.map((resp, i) => (
                      <li key={i}>
                        <span>{resp}</span>
                        <button type="button" onClick={() => removeBullet(i, setResponsibilities, responsibilities)}>
                          ❌
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </section>

              {/* Benefits List */}
              <section className="form-section">
                <h3>Benefits Offered</h3>
                <div className="list-adder">
                  <Input
                    placeholder="Add a perk (e.g. Remote work)..."
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    className="flex-1"
                    fullWidth={false}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      addBullet('Benefit', newBenefit, setBenefits, benefits);
                      setNewBenefit('');
                    }}
                  >
                    Add
                  </Button>
                </div>
                <ul className="bullet-points-list mt-3">
                  {benefits.length === 0 ? (
                    <p className="empty-text">No custom benefits listed.</p>
                  ) : (
                    benefits.map((benefit, i) => (
                      <li key={i}>
                        <span>{benefit}</span>
                        <button type="button" onClick={() => removeBullet(i, setBenefits, benefits)}>
                          ❌
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </section>

              <div className="post-actions">
                <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
                  {isEditMode ? 'Update Listing' : 'Publish Listing'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
