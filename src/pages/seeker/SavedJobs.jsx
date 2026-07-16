import { useState, useEffect } from 'react';
import { useBookmarks } from '../../context/BookmarkContext';
import { jobService } from '../../services/jobService';
import JobCard from '../../components/shared/JobCard';
import EmptyState from '../../components/ui/EmptyState';
import PageContainer from '../../components/layout/PageContainer';
import './SavedJobs.css';

export default function SavedJobs() {
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      setLoading(true);
      try {
        const jobs = await Promise.all(
          bookmarks.map(async (jobId) => {
            try {
              return await jobService.getJob(jobId);
            } catch {
              return null;
            }
          })
        );
        // Filter out any jobs that weren't found (null)
        setSavedJobs(jobs.filter((j) => j !== null));
      } catch (err) {
        console.error('Failed to load saved jobs', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, [bookmarks]);

  if (loading) {
    return (
      <PageContainer>
        <div className="saved-jobs-page">
          <div className="skeleton-pulse" style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="saved-jobs-page">
        <div className="saved-jobs-page__header">
          <h1>Saved Jobs</h1>
          <p>View and manage jobs you've bookmarked for later</p>
        </div>

        {savedJobs.length === 0 ? (
          <EmptyState
            icon="⭐️"
            title="No saved jobs"
            description="Keep track of jobs you're interested in by clicking the 'Save' button on job listings."
            action={{ label: 'Explore Jobs', onClick: () => window.location.assign('/jobs') }}
          />
        ) : (
          <div className="saved-jobs-list">
            {savedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onBookmark={() => toggleBookmark(job.id)}
                isBookmarked={isBookmarked(job.id)}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
