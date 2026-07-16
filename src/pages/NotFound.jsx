import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import PageContainer from '../components/layout/PageContainer';
import './NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="not-found-page">
        <div className="not-found-card">
          <span className="not-found-icon">🛰️</span>
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you are looking for does not exist, has been removed, or has changed names.</p>
          <div className="not-found-actions">
            <Button variant="primary" onClick={() => navigate('/')}>
              Go to Home
            </Button>
            <Button variant="outline" onClick={() => navigate('/jobs')}>
              Browse Jobs
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
