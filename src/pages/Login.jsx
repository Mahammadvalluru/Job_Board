import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './Login.css';

export default function Login() {
  const { login, loginGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || new URLSearchParams(location.search).get('redirect') || '/';

  const handleGoogleSelect = async ({ credential, role }) => {
    setLoading(true);
    try {
      const workerUrl = import.meta.env.VITE_CLOUDFLARE_WORKER_URL || 'http://localhost:8787';
      const verifyRes = await fetch(`${workerUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credential, role: role })
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        throw new Error(errorData.error || 'Failed to verify token with Cloudflare Worker.');
      }

      const { user: verifiedUser } = await verifyRes.json();
      const { email, name } = verifiedUser;

      const user = await loginGoogle(email, name, role);
      showToast(`Welcome back, ${user.name}!`, 'success');
      const targetPath = from !== '/' ? from : user.role === 'employer' ? '/employer/dashboard' : '/seeker/dashboard';
      navigate(targetPath, { replace: true });
    } catch (err) {
      let friendlyMsg = err.message || 'Google login failed. Please try again.';
      if (friendlyMsg.includes('Failed to fetch') || friendlyMsg.toLowerCase().includes('network')) {
        friendlyMsg = 'Network error: Failed to connect to verification server. Please try again.';
      } else if (friendlyMsg.toLowerCase().includes('origin') || friendlyMsg.toLowerCase().includes('domain')) {
        friendlyMsg = 'Authentication error: This domain is not authorized for Google OAuth.';
      }
      showToast(friendlyMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const isGoogleConfigured = import.meta.env.VITE_GOOGLE_CLIENT_ID && !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID_HERE');

  useEffect(() => {
    if (isGoogleConfigured && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: (response) => {
            handleGoogleSelect({ credential: response.credential, role: 'seeker' });
          }
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-login-btn-container"),
          { theme: "outline", size: "large", width: "380", text: "signin_with" }
        );
      } catch (err) {
        console.error("Failed to render Google Sign-In button:", err);
      }
    }
  }, [isGoogleConfigured]);

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

        <div className="login-card__google-container" style={{ width: '100%' }}>
          {isGoogleConfigured ? (
            <div id="google-login-btn-container" style={{ margin: '1rem auto', display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '380px' }}></div>
          ) : (
            <div className="google-auth-warning" style={{
              background: 'var(--color-bg-secondary, #f3f4f6)',
              border: '1px dashed var(--color-border, #dadce0)',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '12px 16px',
              fontSize: '13px',
              textAlign: 'center',
              color: 'var(--color-text-secondary, #5f6368)',
              margin: '1rem auto',
              maxWidth: '380px'
            }}>
              🔑 Real-time Google login requires your Client ID in <code>.env.local</code>.
            </div>
          )}
        </div>

        <div className="auth-divider">
          <span>or log in with email</span>
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
