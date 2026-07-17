import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { BookmarkProvider } from './context/BookmarkContext';
import Header from './components/layout/Header';
import Toast from './components/ui/Toast';

// Pages
import Home from './pages/Home';
import JobSearch from './pages/JobSearch';
import JobDetail from './pages/JobDetail';
import Apply from './pages/Apply';
import Login from './pages/Login';
import Register from './pages/Register';
import CompanyProfile from './pages/CompanyProfile';
import NotFound from './pages/NotFound';

// Seeker Pages
import SeekerDashboard from './pages/seeker/Dashboard';
import SeekerApplications from './pages/seeker/Applications';
import SavedJobs from './pages/seeker/SavedJobs';
import SeekerProfile from './pages/seeker/Profile';

// Employer Pages
import EmployerDashboard from './pages/employer/Dashboard';
import PostJob from './pages/employer/PostJob';
import Applicants from './pages/employer/Applicants';
import EmployerCompanyProfile from './pages/employer/CompanyProfile';

import { initializeData } from './services/api';
import './App.css';

// Initialize mock data on first load
initializeData();

/* ─── Route Guards ─── */

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="route-loading">
        <div className="route-loading__spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
}

function GuestRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="route-loading">
        <div className="route-loading__spinner" />
      </div>
    );
  }

  if (isAuthenticated) {
    const dashboardPath = user.role === 'employer' ? '/employer/dashboard' : '/seeker/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
}

/* ─── Layout Wrapper ─── */

function AppLayout() {
  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <Outlet />
      </main>
      <footer className="app__footer">
        <div className="container">
          <div className="footer__content">
            <div className="footer__brand">
              <span className="footer__logo">JobFlow</span>
              <p className="footer__tagline">Connecting talent with opportunity</p>
            </div>
            <div className="footer__links">
              <div className="footer__column">
                <h4>For Job Seekers</h4>
                <a href="/jobs">Browse Jobs</a>
                <a href="/register">Create Account</a>
              </div>
              <div className="footer__column">
                <h4>For Employers</h4>
                <a href="/employer/post-job">Post a Job</a>
                <a href="/register">Sign Up</a>
              </div>
              <div className="footer__column">
                <h4>Company</h4>
                <a href="/">About</a>
                <a href="/">Contact</a>
                <a href="/">Privacy Policy</a>
              </div>
            </div>
          </div>
          <div className="footer__bottom">
            <p>&copy; {new Date().getFullYear()} JobFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <Toast />
    </div>
  );
}

/* ─── App Component ─── */

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <BookmarkProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/jobs" element={<JobSearch />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/company/:id" element={<CompanyProfile />} />

                {/* Auth Routes (redirect if already logged in) */}
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

                {/* Protected: Apply */}
                <Route path="/apply/:jobId" element={
                  <ProtectedRoute allowedRoles={['seeker']}>
                    <Apply />
                  </ProtectedRoute>
                } />

                {/* Protected: Job Seeker Routes */}
                <Route path="/seeker" element={
                  <ProtectedRoute allowedRoles={['seeker']} />
                }>
                  <Route path="dashboard" element={<SeekerDashboard />} />
                  <Route path="applications" element={<SeekerApplications />} />
                  <Route path="saved-jobs" element={<SavedJobs />} />
                  <Route path="profile" element={<SeekerProfile />} />
                </Route>

                {/* Protected: Employer Routes */}
                <Route path="/employer" element={
                  <ProtectedRoute allowedRoles={['employer']} />
                }>
                  <Route path="dashboard" element={<EmployerDashboard />} />
                  <Route path="post-job" element={<PostJob />} />
                  <Route path="edit-job/:jobId" element={<PostJob />} />
                  <Route path="applicants/:jobId" element={<Applicants />} />
                  <Route path="company-profile" element={<EmployerCompanyProfile />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BookmarkProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
