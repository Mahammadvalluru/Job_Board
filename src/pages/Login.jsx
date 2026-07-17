import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './Login.css';

export default function Login() {
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || new URLSearchParams(location.search).get('redirect') || '/';

  const handleGoogleClick = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(
      '/mock-google-login.html?role=seeker',
      'GoogleSignIn',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

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

      let user;
      if (email === 'sarah.j@gmail.com' || email === 'sarah@example.com') {
        user = await login('sarah@example.com', 'password123');
      } else if (email === 'hr@technova.com') {
        user = await login('hr@technova.com', 'password123');
      } else {
        try {
          user = await login(email, 'google_auth_bypass_12345');
        } catch (e) {
          user = await register({
            email,
            password: 'google_auth_bypass_12345',
            name,
            role,
            companyName: role === 'employer' ? 'Google Authenticated Co' : '',
            phone: 'Google Auth',
            location: 'Remote'
          });
        }
      }
      showToast(`Welcome back, ${user.name}!`, 'success');
      const targetPath = from !== '/' ? from : user.role === 'employer' ? '/employer/dashboard' : '/seeker/dashboard';
      navigate(targetPath, { replace: true });
    } catch (err) {
      showToast(err.message || 'Google login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isGoogleConfigured = import.meta.env.VITE_GOOGLE_CLIENT_ID && !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID_HERE');

  useEffect(() => {
    const handleAuthMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        const { credential, role: selectedRole } = event.data;
        handleGoogleSelect({ credential, role: selectedRole || 'seeker' });
      }
    };
    window.addEventListener('message', handleAuthMessage);

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

    return () => {
      window.removeEventListener('message', handleAuthMessage);
    };
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
            <button
              type="button"
              className="btn-google"
              onClick={handleGoogleClick}
              disabled={loading}
              style={{
                width: '100%',
                maxWidth: '380px',
                margin: '1rem auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary, #ffffff)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <svg className="btn-google__icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
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
