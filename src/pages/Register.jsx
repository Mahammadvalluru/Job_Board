import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './Register.css';

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('seeker'); // 'seeker' or 'employer'
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
    location: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || new URLSearchParams(location.search).get('redirect') || '/';

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full Name is required';
    if (!form.email.trim()) {
      e.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = 'Please enter a valid email address';
    }
    if (!form.password) {
      e.password = 'Password is required';
    } else if (form.password.length < 6) {
      e.password = 'Password must be at least 6 characters';
    }
    if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }
    if (role === 'employer' && !form.companyName.trim()) {
      e.companyName = 'Company Name is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await register({
        email: form.email,
        password: form.password,
        name: form.name,
        role,
        companyName: form.companyName,
        phone: form.phone,
        location: form.location,
      });
      showToast(`Welcome to JobFlow, ${user.name}!`, 'success');
      const targetPath = from !== '/' ? from : user.role === 'employer' ? '/employer/dashboard' : '/seeker/dashboard';
      navigate(targetPath, { replace: true });
    } catch (err) {
      showToast(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-card__header">
          <span className="register-card__logo-icon">⚡</span>
          <h2>Create your Account</h2>
          <p>Join JobFlow to find jobs or post opportunities</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-tab ${role === 'seeker' ? 'role-tab--active' : ''}`}
            onClick={() => { setRole('seeker'); setErrors({}); }}
          >
            👤 Job Seeker
          </button>
          <button
            type="button"
            className={`role-tab ${role === 'employer' ? 'role-tab--active' : ''}`}
            onClick={() => { setRole('employer'); setErrors({}); }}
          >
            🏢 Employer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="register-card__form" noValidate>
          <Input
            label={role === 'seeker' ? 'Full Name *' : 'Contact Person Name *'}
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            required
          />

          {role === 'employer' && (
            <Input
              label="Company Name *"
              placeholder="Google DeepMind"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              error={errors.companyName}
              required
            />
          )}

          <div className="form-row">
            <Input
              label="Phone Number"
              placeholder="555-0199"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              fullWidth={false}
              className="flex-1"
            />
            <Input
              label="Location"
              placeholder="San Francisco, CA"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              fullWidth={false}
              className="flex-1"
            />
          </div>

          <div className="form-row">
            <Input
              label="Password *"
              type="password"
              placeholder="Min 6 chars"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              fullWidth={false}
              className="flex-1"
              required
            />
            <Input
              label="Confirm Password *"
              type="password"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              fullWidth={false}
              className="flex-1"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            className="mt-2"
          >
            Create Account
          </Button>
        </form>

        <div className="register-card__footer">
          <p>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
