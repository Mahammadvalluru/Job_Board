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

const FRONTEND_JOB_CACHE = new Map();

function saveToFrontendCache(jobs) {
  if (!Array.isArray(jobs)) return;
  jobs.forEach(job => {
    if (job && job.id) {
      FRONTEND_JOB_CACHE.set(job.id, job);
      try {
        sessionStorage.setItem(`job_cache_${job.id}`, JSON.stringify(job));
      } catch (e) {}
    }
  });
}

function getFromFrontendCache(id) {
  if (FRONTEND_JOB_CACHE.has(id)) {
    return FRONTEND_JOB_CACHE.get(id);
  }
  try {
    const cached = sessionStorage.getItem(`job_cache_${id}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      FRONTEND_JOB_CACHE.set(id, parsed);
      return parsed;
    }
  } catch (e) {}
  return null;
}

async function fetchAdzunaDirectly({ keyword, location, category, type, experienceLevel, page = 1, pageSize = 10 }) {
  const adzunaId = 'deb6793a';
  const adzunaKey = 'a7f083e73666d653dc6fcb50e5a28425';
  const whatQuery = keyword || (category && category !== 'engineering' ? category : '');
  
  const url = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${adzunaId}&app_key=${adzunaKey}&results_per_page=${pageSize}&what=${encodeURIComponent(whatQuery)}&where=${encodeURIComponent(location)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Adzuna direct request failed');
  
  const data = await res.json();
  const jobs = data.results.map((result, idx) => {
    const titleStr = (result.title || '').replace(/<\/?[^>]+(>|$)/g, '');
    const descStr = (result.description || '').replace(/<\/?[^>]+(>|$)/g, '');
    const titleLower = titleStr.toLowerCase();
    const catTag = (result.category?.tag || '').toLowerCase();
    const catLabel = (result.category?.label || '').toLowerCase();

    let cat = 'engineering';
    if (catTag.includes('design') || catLabel.includes('design') || titleLower.includes('design') || titleLower.includes('ui') || titleLower.includes('ux')) {
      cat = 'design';
    } else if (catTag.includes('marketing') || catLabel.includes('marketing') || titleLower.includes('marketing') || titleLower.includes('seo') || titleLower.includes('content')) {
      cat = 'marketing';
    } else if (catTag.includes('sales') || catLabel.includes('sales') || titleLower.includes('sales') || titleLower.includes('business development') || titleLower.includes('bde') || titleLower.includes('representative')) {
      cat = 'sales';
    } else if (catTag.includes('finance') || catTag.includes('accounting') || catLabel.includes('finance') || catLabel.includes('accounting') || titleLower.includes('finance') || titleLower.includes('accountant')) {
      cat = 'finance';
    } else if (catTag.includes('hr') || catTag.includes('admin') || catLabel.includes('human resource') || catLabel.includes('admin') || titleLower.includes('recruiter') || titleLower.includes('hr')) {
      cat = 'hr';
    }

    let jobType = 'full-time';
    if (result.contract_type === 'contract' || result.contract_time === 'contract' || titleLower.includes('contract') || titleLower.includes('freelance')) {
      jobType = 'contract';
    } else if (result.contract_time === 'part_time' || titleLower.includes('part-time') || titleLower.includes('part time')) {
      jobType = 'part-time';
    }

    let expLevel = 'mid';
    if (titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('principal') || titleLower.includes('sr.') || titleLower.includes('head') || titleLower.includes('architect')) {
      expLevel = 'senior';
    } else if (titleLower.includes('intern') || titleLower.includes('junior') || titleLower.includes('fresher') || titleLower.includes('entry') || titleLower.includes('jr.')) {
      expLevel = 'entry';
    }

    const urlLower = (result.redirect_url || '').toLowerCase();
    let sourcePortal = 'Careers Page';
    if (urlLower.includes('indeed')) sourcePortal = 'Indeed';
    else if (urlLower.includes('naukri')) sourcePortal = 'Naukri';
    else if (urlLower.includes('linkedin')) sourcePortal = 'LinkedIn';
    else if (urlLower.includes('monster')) sourcePortal = 'Monster';
    else if (urlLower.includes('timesjobs')) sourcePortal = 'TimesJobs';
    else if (urlLower.includes('shine')) sourcePortal = 'Shine';
    else {
      const portals = ['Indeed', 'Naukri', 'Careers Page', 'LinkedIn', 'Shine'];
      sourcePortal = portals[idx % portals.length];
    }

    return {
      id: `adzuna-${result.id}`,
      title: titleStr,
      company: {
        name: result.company?.display_name || 'Hiring Company',
        logo: null
      },
      location: result.location?.display_name || 'India',
      type: jobType,
      experienceLevel: expLevel,
      salaryMin: result.salary_min ? Math.round(result.salary_min) : null,
      salaryMax: result.salary_max ? Math.round(result.salary_max) : null,
      postedDate: result.created || new Date().toISOString(),
      category: cat,
      description: descStr || `${titleStr} position at ${result.company?.display_name || 'Hiring Company'}.`,
      requirements: ['Strong analytical skills', 'Good domain knowledge', 'Ability to collaborate in teams'],
      applyUrl: result.redirect_url || 'https://www.adzuna.in',
      source: sourcePortal,
      status: 'active'
    };
  });

  let filteredJobs = jobs;
  if (type) filteredJobs = filteredJobs.filter(j => j.type === type);
  if (experienceLevel) filteredJobs = filteredJobs.filter(j => j.experienceLevel === experienceLevel);
  if (category) filteredJobs = filteredJobs.filter(j => j.category === category);

  saveToFrontendCache(filteredJobs);

  return {
    jobs: filteredJobs,
    total: data.count || filteredJobs.length,
    page: page,
    totalPages: Math.ceil((data.count || filteredJobs.length) / pageSize)
  };
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
    // Try Cloudflare Worker first
    try {
      const workerUrl = import.meta.env.VITE_CLOUDFLARE_WORKER_URL || 'http://localhost:8787';
      const params = new URLSearchParams({
        keyword,
        location,
        page: page.toString(),
        category,
        type,
        experienceLevel
      });
      const response = await fetch(`${workerUrl}/api/jobs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        let filteredJobs = data.jobs;
        if (type) filteredJobs = filteredJobs.filter(j => j.type === type);
        if (experienceLevel) filteredJobs = filteredJobs.filter(j => j.experienceLevel === experienceLevel);
        if (category) filteredJobs = filteredJobs.filter(j => j.category === category);
        if (salaryMin != null) filteredJobs = filteredJobs.filter(j => !j.salaryMax || j.salaryMax >= salaryMin);
        if (salaryMax != null) filteredJobs = filteredJobs.filter(j => !j.salaryMin || j.salaryMin <= salaryMax);
        
        saveToFrontendCache(filteredJobs);

        return {
          jobs: filteredJobs,
          total: data.total,
          page: data.page,
          totalPages: data.totalPages
        };
      }
    } catch (err) {
      console.warn("Cloudflare Worker request failed, attempting direct Adzuna API query:", err);
    }

    // Try direct Adzuna API query next
    try {
      const adzunaResult = await fetchAdzunaDirectly({ keyword, location, category, type, experienceLevel, page, pageSize });
      if (adzunaResult && adzunaResult.jobs && adzunaResult.jobs.length > 0) {
        return adzunaResult;
      }
    } catch (adzunaErr) {
      console.warn("Direct Adzuna query failed, falling back to local storage:", adzunaErr);
    }

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
    // Check frontend cache first
    const cachedJob = getFromFrontendCache(id);
    if (cachedJob) return cachedJob;

    try {
      const workerUrl = import.meta.env.VITE_CLOUDFLARE_WORKER_URL || 'http://localhost:8787';
      const response = await fetch(`${workerUrl}/api/jobs/${encodeURIComponent(id)}`);
      if (response.ok) {
        const job = await response.json();
        saveToFrontendCache([job]);
        return job;
      }
    } catch (err) {
      console.warn("Cloudflare Job Aggregator detailed query failed, falling back to local storage:", err);
    }

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
