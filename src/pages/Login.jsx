import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Retrieve redirect path from location state or search params
  const from = location.state?.from || new URLSearchParams(location.search).get('redirect') || '/';

  const validate = () => {
    const e = {};
    if (!form.email.trim()) {
      e.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = 'Please enter a valid email address';
    }
    if (!form.password) {
      e.password = 'Password is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      showToast(`Welcome back, ${user.name}!`, 'success');
      const targetPath = from !== '/' ? from : user.role === 'employer' ? '/employer/dashboard' : '/seeker/dashboard';
      navigate(targetPath, { replace: true });
    } catch (err) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <span className="login-card__logo-icon">⚡</span>
          <h2>Welcome Back</h2>
          <p>Log in to access your JobFlow account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-card__form" noValidate>
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            required
          />

          <div className="login-card__options">
            <label className="login-card__remember">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#forgot" className="login-card__forgot" onClick={(e) => { e.preventDefault(); showToast('Password reset is not implemented in this prototype.', 'info'); }}>
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Log In
          </Button>
        </form>

        <div className="login-card__footer">
          <p>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
          <div className="login-card__demo-accounts">
            <h4>Demo Accounts (Password: <code>password123</code>)</h4>
            <div className="demo-btns">
              <button
                type="button"
                onClick={() => setForm({ email: 'sarah@example.com', password: 'password123' })}
              >
                Seeker: Sarah
              </button>
              <button
                type="button"
                onClick={() => setForm({ email: 'hr@technova.com', password: 'password123' })}
              >
                Employer: TechNova
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
