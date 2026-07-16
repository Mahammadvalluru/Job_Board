import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { formatSalary } from '../utils/formatters';
import './Apply.css';

export default function Apply() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', coverLetter: '', resumeFileName: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const j = await jobService.getJob(jobId);
        setJob(j);
        if (user) {
          setForm(f => ({ ...f, name: user.name || '', email: user.email || '', phone: user.phone || '', resumeFileName: user.resumeFileName || '' }));
          const applied = await applicationService.hasApplied(jobId, user.id);
          setAlreadyApplied(applied);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [jobId, user]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.resumeFileName.trim()) e.resumeFileName = 'Resume is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await applicationService.apply({ jobId, seekerId: user.id, coverLetter: form.coverLetter, resumeFileName: form.resumeFileName });
      setSuccess(true);
      showToast('Application submitted successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to submit application', 'error');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="apply container"><div className="skeleton-pulse" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} /></div>;

  if (!user) return (
    <div className="apply container">
      <div className="apply__auth-prompt">
        <h2>Sign in to Apply</h2>
        <p>You need an account to submit job applications.</p>
        <div className="apply__auth-buttons">
          <Link to={`/login?redirect=/apply/${jobId}`}><Button variant="primary">Log In</Button></Link>
          <Link to={`/register?redirect=/apply/${jobId}`}><Button variant="outline">Sign Up</Button></Link>
        </div>
      </div>
    </div>
  );

  if (alreadyApplied) return (
    <div className="apply container">
      <div className="apply__already">
        <span className="apply__already-icon">✅</span>
        <h2>Already Applied</h2>
        <p>You have already applied to this position.</p>
        <Link to="/seeker/applications"><Button variant="primary">View My Applications</Button></Link>
      </div>
    </div>
  );

  if (success) return (
    <div className="apply container">
      <div className="apply__success">
        <div className="apply__success-icon">🎉</div>
        <h2>Application Submitted!</h2>
        <p>Your application for <strong>{job?.title}</strong> has been sent successfully.</p>
        <p className="apply__success-sub">You'll receive updates on your application status in your dashboard.</p>
        <div className="apply__success-actions">
          <Link to="/seeker/applications"><Button variant="primary">View My Applications</Button></Link>
          <Link to="/jobs"><Button variant="outline">Browse More Jobs</Button></Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="apply container">
      <div className="apply__wrapper">
        {job && (
          <div className="apply__job-summary">
            <div className="apply__job-logo" style={{ background: `hsl(${job.title.length * 30}, 60%, 50%)` }}>
              {job.company?.name?.charAt(0) || '?'}
            </div>
            <div>
              <h2 className="apply__job-title">{job.title}</h2>
              <p className="apply__job-meta">{job.company?.name} • {job.location} • {formatSalary(job.salaryMin, job.salaryMax)}</p>
            </div>
          </div>
        )}

        <form className="apply__form" onSubmit={handleSubmit} noValidate>
          <h2>Apply for this position</h2>

          <Input label="Full Name" name="name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} error={errors.name} required />
          <Input label="Email" type="email" name="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} error={errors.email} required />
          <Input label="Phone" type="text" name="phone" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="Optional" />

          <div className="apply__resume-section">
            <label className="apply__label">Resume *</label>
            {form.resumeFileName ? (
              <div className="apply__resume-file">
                <span>📄 {form.resumeFileName}</span>
                <button type="button" className="apply__resume-change" onClick={() => setForm(f => ({...f, resumeFileName: ''}))}>Change</button>
              </div>
            ) : (
              <div className="apply__upload-zone" onClick={() => setForm(f => ({...f, resumeFileName: `${form.name.replace(/\s+/g, '_').toLowerCase()}_resume.pdf`}))}>
                <span>📎</span>
                <span>Click to upload resume</span>
                <span className="apply__upload-hint">PDF, DOC up to 5MB</span>
              </div>
            )}
            {errors.resumeFileName && <span className="apply__error">{errors.resumeFileName}</span>}
          </div>

          <div className="apply__field">
            <label className="apply__label">Cover Letter <span className="apply__optional">(optional)</span></label>
            <textarea className="apply__textarea" value={form.coverLetter} onChange={e => setForm(f => ({...f, coverLetter: e.target.value}))} placeholder="Tell the employer why you're a great fit..." rows={5} />
            <span className="apply__char-count">{form.coverLetter.length} / 2000</span>
          </div>

          <Button variant="primary" size="lg" fullWidth type="submit" loading={submitting}>Submit Application</Button>
        </form>
      </div>
    </div>
  );
}
