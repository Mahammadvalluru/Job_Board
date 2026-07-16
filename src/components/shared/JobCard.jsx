import { Link } from 'react-router-dom';
import { useBookmarks } from '../../context/BookmarkContext';
import Chip from '../ui/Chip';
import StatusBadge from '../ui/StatusBadge';
import { formatSalary, timeAgo } from '../../utils/formatters';
import './JobCard.css';

export default function JobCard({ job, className = '' }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(job.id);

  return (
    <article className={`job-card ${className}`}>
      <div className="job-card__header">
        <div
          className="job-card__logo"
          style={{ backgroundColor: job.companyColor || '#4F46E5' }}
          aria-hidden="true"
        >
          {job.company?.charAt(0) || '?'}
        </div>
        <div className="job-card__meta">
          <Link to={`/jobs/${job.id}`} className="job-card__title">{job.title}</Link>
          <Link to={`/company/${job.companyId}`} className="job-card__company">{job.company}</Link>
        </div>
        <button
          className={`job-card__bookmark ${bookmarked ? 'job-card__bookmark--active' : ''}`}
          onClick={(e) => { e.preventDefault(); toggleBookmark(job.id); }}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this job'}
        >
          {bookmarked ? '★' : '☆'}
        </button>
      </div>
      <div className="job-card__info">
        <span className="job-card__location">📍 {job.location}</span>
        <span className="job-card__salary">💰 {formatSalary(job.salaryMin, job.salaryMax)}</span>
      </div>
      <div className="job-card__tags">
        <StatusBadge status={job.type} />
        <StatusBadge status={job.level} />
        {job.skills?.slice(0, 3).map((s) => (
          <Chip key={s} variant="default">{s}</Chip>
        ))}
      </div>
      <div className="job-card__footer">
        <span className="job-card__time">{timeAgo(job.postedDate)}</span>
        <Link to={`/jobs/${job.id}`} className="job-card__link">View Details →</Link>
      </div>
    </article>
  );
}
