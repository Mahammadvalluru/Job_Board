// ─── Job Service ──────────────────────────────────────────────────────────────
// All methods return Promises to mirror real API behaviour.

import { getData, setData, simulateDelay, generateId } from './api';

/**
 * Compute a simple relevance score for keyword search.
 * Higher score = better match. Checks title, description, company name.
 */
function relevanceScore(job, keyword, companies) {
  if (!keyword) return 0;
  const kw = keyword.toLowerCase();
  let score = 0;

  // Title match is most important
  if (job.title.toLowerCase().includes(kw)) score += 10;
  // Exact word match in title gets a bonus
  if (job.title.toLowerCase().split(/\s+/).some((w) => w === kw)) score += 5;
  // Description match
  if (job.description.toLowerCase().includes(kw)) score += 3;
  // Company name match
  const company = companies.find((c) => c.id === job.companyId);
  if (company && company.name.toLowerCase().includes(kw)) score += 4;
  // Category match
  if (job.category.toLowerCase().includes(kw)) score += 2;
  // Requirements / responsibilities text
  const allText = [...(job.requirements || []), ...(job.responsibilities || [])].join(' ').toLowerCase();
  if (allText.includes(kw)) score += 2;

  return score;
}

/**
 * Check whether a job's posted date matches a "datePosted" filter.
 * Supported values: 'today', '3days', 'week', 'month'
 */
function matchesDateFilter(postedDate, datePosted) {
  if (!datePosted) return true;
  const posted = new Date(postedDate).getTime();
  const now = Date.now();
  const day = 86400000;
  switch (datePosted) {
    case 'today':
      return now - posted <= day;
    case '3days':
      return now - posted <= 3 * day;
    case 'week':
      return now - posted <= 7 * day;
    case 'month':
      return now - posted <= 30 * day;
    default:
      return true;
  }
}

export const jobService = {
  /**
   * Search and filter jobs with pagination.
   */
  async searchJobs({
    keyword = '',
    location = '',
    type = '',
    experienceLevel = '',
    salaryMin = null,
    salaryMax = null,
    category = '',
    datePosted = '',
    sort = 'newest',
    page = 1,
    pageSize = 10,
  } = {}) {
    await simulateDelay();

    const allJobs = getData('jobs') || [];
    const companies = getData('companies') || [];

    // ── Filter ──────────────────────────────────────────
    let filtered = allJobs.filter((job) => {
      // Only show active jobs in public search
      if (job.status !== 'active') return false;

      // Keyword — must match title, description, company, or category
      if (keyword) {
        if (relevanceScore(job, keyword, companies) === 0) return false;
      }

      // Location
      if (location) {
        const loc = location.toLowerCase();
        if (!job.location.toLowerCase().includes(loc)) return false;
      }

      // Type
      if (type && job.type !== type) return false;

      // Experience level
      if (experienceLevel && job.experienceLevel !== experienceLevel) return false;

      // Salary range (overlap check)
      if (salaryMin != null && job.salaryMax < salaryMin) return false;
      if (salaryMax != null && job.salaryMin > salaryMax) return false;

      // Category
      if (category && job.category !== category) return false;

      // Date posted
      if (!matchesDateFilter(job.postedDate, datePosted)) return false;

      return true;
    });

    // ── Sort ────────────────────────────────────────────
    if (sort === 'relevance' && keyword) {
      filtered.sort((a, b) => relevanceScore(b, keyword, companies) - relevanceScore(a, keyword, companies));
    } else if (sort === 'salary') {
      filtered.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
    } else {
      // newest
      filtered.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
    }

    // ── Enrich with company data ────────────────────────
    const enriched = filtered.map((job) => {
      const company = companies.find((c) => c.id === job.companyId);
      return { ...job, company: company || null };
    });

    // ── Paginate ────────────────────────────────────────
    const total = enriched.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;
    const pageJobs = enriched.slice(start, start + pageSize);

    return { jobs: pageJobs, total, page: safePage, totalPages };
  },

  /**
   * Get a single job by ID, with company info populated.
   */
  async getJob(id) {
    await simulateDelay();

    const allJobs = getData('jobs') || [];
    const companies = getData('companies') || [];
    const applications = getData('applications') || [];

    const job = allJobs.find((j) => j.id === id);
    if (!job) return null;

    const company = companies.find((c) => c.id === job.companyId) || null;
    const applicantCount = applications.filter((a) => a.jobId === id).length;

    return { ...job, company, applicantCount };
  },

  /**
   * Get similar jobs (same category or same company), excluding the given job.
   */
  async getSimilarJobs(jobId, limit = 4) {
    await simulateDelay();

    const allJobs = getData('jobs') || [];
    const companies = getData('companies') || [];
    const job = allJobs.find((j) => j.id === jobId);
    if (!job) return [];

    // Score each other active job by similarity
    const scored = allJobs
      .filter((j) => j.id !== jobId && j.status === 'active')
      .map((j) => {
        let score = 0;
        if (j.companyId === job.companyId) score += 3;
        if (j.category === job.category) score += 5;
        if (j.experienceLevel === job.experienceLevel) score += 1;
        if (j.location === job.location) score += 1;
        return { ...j, _score: score, company: companies.find((c) => c.id === j.companyId) || null };
      })
      .filter((j) => j._score > 0)
      .sort((a, b) => b._score - a._score);

    return scored.slice(0, limit).map(({ _score, ...rest }) => rest);
  },

  /**
   * Create a new job posting.
   */
  async createJob(data) {
    await simulateDelay();

    const allJobs = getData('jobs') || [];
    const newJob = {
      id: generateId('j'),
      ...data,
      postedDate: new Date().toISOString(),
      status: data.status || 'active',
      views: 0,
      applicantCount: 0,
    };
    allJobs.push(newJob);
    setData('jobs', allJobs);
    return newJob;
  },

  /**
   * Update an existing job posting.
   */
  async updateJob(id, data) {
    await simulateDelay();

    const allJobs = getData('jobs') || [];
    const idx = allJobs.findIndex((j) => j.id === id);
    if (idx === -1) throw new Error('Job not found');

    allJobs[idx] = { ...allJobs[idx], ...data, id }; // id is immutable
    setData('jobs', allJobs);
    return allJobs[idx];
  },

  /**
   * Close a job listing.
   */
  async closeJob(id) {
    return this.updateJob(id, { status: 'closed' });
  },

  /**
   * Re-open a closed job listing.
   */
  async reopenJob(id) {
    return this.updateJob(id, { status: 'active' });
  },

  /**
   * Get all jobs belonging to the employer's company.
   */
  async getEmployerJobs(employerId) {
    await simulateDelay();

    const allUsers = getData('users') || [];
    const employer = allUsers.find((u) => u.id === employerId);
    if (!employer || !employer.companyId) return [];

    const allJobs = getData('jobs') || [];
    const companies = getData('companies') || [];
    const applications = getData('applications') || [];
    const company = companies.find((c) => c.id === employer.companyId) || null;

    return allJobs
      .filter((j) => j.companyId === employer.companyId)
      .map((j) => ({
        ...j,
        company,
        applicantCount: applications.filter((a) => a.jobId === j.id).length,
      }))
      .sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
  },

  /**
   * Increment the view count for a job.
   */
  async incrementViews(jobId) {
    const allJobs = getData('jobs') || [];
    const idx = allJobs.findIndex((j) => j.id === jobId);
    if (idx !== -1) {
      allJobs[idx].views = (allJobs[idx].views || 0) + 1;
      setData('jobs', allJobs);
    }
  },
};
