// ─── Application Service ──────────────────────────────────────────────────────
// Manages job applications, status updates, and employer-facing analytics.

import { getData, setData, simulateDelay, generateId } from './api';

export const applicationService = {
  /**
   * Submit a job application.
   * Prevents duplicate applications (same seeker + same job).
   */
  async apply({ jobId, seekerId, coverLetter = '', resumeFileName = '' }) {
    await simulateDelay();

    const applications = getData('applications') || [];

    // Duplicate check
    const existing = applications.find((a) => a.jobId === jobId && a.seekerId === seekerId);
    if (existing) {
      throw new Error('You have already applied for this job.');
    }

    const now = new Date().toISOString();
    const newApp = {
      id: generateId('a'),
      jobId,
      seekerId,
      status: 'applied',
      appliedDate: now,
      coverLetter,
      resumeFileName,
      statusHistory: [{ status: 'applied', date: now, note: 'Application submitted' }],
    };

    applications.push(newApp);
    setData('applications', applications);
    return newApp;
  },

  /**
   * Get all applications for a job seeker, with full job + company details.
   */
  async getMyApplications(seekerId) {
    await simulateDelay();

    const applications = getData('applications') || [];
    const allJobs = getData('jobs') || [];
    const companies = getData('companies') || [];

    return applications
      .filter((a) => a.seekerId === seekerId)
      .map((app) => {
        const job = allJobs.find((j) => j.id === app.jobId) || null;
        const company = job ? companies.find((c) => c.id === job.companyId) || null : null;
        return { ...app, job: job ? { ...job, company } : null };
      })
      .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
  },

  /**
   * Get all applicants for a specific job, with seeker details.
   */
  async getApplicants(jobId) {
    await simulateDelay();

    const applications = getData('applications') || [];
    const allUsers = getData('users') || [];

    return applications
      .filter((a) => a.jobId === jobId)
      .map((app) => {
        const seeker = allUsers.find((u) => u.id === app.seekerId);
        // Strip password from seeker data
        if (seeker) {
          const { password, ...safeSeekerData } = seeker;
          return { ...app, seeker: safeSeekerData };
        }
        return { ...app, seeker: null };
      })
      .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
  },

  /**
   * Update application status and append to status history.
   * Valid statuses: applied → under-review → interview → offer → hired
   *                                        ↘ rejected
   */
  async updateStatus(applicationId, newStatus, note = '') {
    await simulateDelay();

    const applications = getData('applications') || [];
    const idx = applications.findIndex((a) => a.id === applicationId);
    if (idx === -1) throw new Error('Application not found');

    const now = new Date().toISOString();
    applications[idx].status = newStatus;
    applications[idx].statusHistory = [
      ...(applications[idx].statusHistory || []),
      { status: newStatus, date: now, note: note || `Status changed to ${newStatus}` },
    ];

    setData('applications', applications);
    return applications[idx];
  },

  /**
   * Check if a seeker has already applied for a specific job.
   */
  async hasApplied(jobId, seekerId) {
    await simulateDelay(100);

    const applications = getData('applications') || [];
    return applications.some((a) => a.jobId === jobId && a.seekerId === seekerId);
  },

  /**
   * Get aggregate application stats for an employer.
   */
  async getApplicationStats(employerId) {
    await simulateDelay();

    const allUsers = getData('users') || [];
    const employer = allUsers.find((u) => u.id === employerId);
    if (!employer || !employer.companyId) {
      return { totalApplicants: 0, newThisWeek: 0, byStatus: {} };
    }

    const allJobs = getData('jobs') || [];
    const companyJobIds = allJobs.filter((j) => j.companyId === employer.companyId).map((j) => j.id);

    const applications = getData('applications') || [];
    const companyApps = applications.filter((a) => companyJobIds.includes(a.jobId));

    // Count by status
    const byStatus = {};
    companyApps.forEach((app) => {
      byStatus[app.status] = (byStatus[app.status] || 0) + 1;
    });

    // New this week
    const oneWeekAgo = Date.now() - 7 * 86400000;
    const newThisWeek = companyApps.filter((a) => new Date(a.appliedDate).getTime() > oneWeekAgo).length;

    return {
      totalApplicants: companyApps.length,
      newThisWeek,
      byStatus,
    };
  },
};
