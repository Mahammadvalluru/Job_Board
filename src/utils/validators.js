// ─── Validators ──────────────────────────────────────────────────────────────
// Each validator returns an error string or null (null = valid).

/**
 * Validate an email address.
 * @param {string} email
 * @returns {string|null} error message or null
 */
export function validateEmail(email) {
  if (!email || !email.trim()) return 'Email is required';
  // RFC-5322-lite regex — good enough for form validation
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return 'Please enter a valid email address';
  return null;
}

/**
 * Validate a password.
 * @param {string} password
 * @returns {string|null} error message or null
 */
export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

/**
 * Validate that a value is not empty.
 * @param {any} value
 * @param {string} fieldName — human-readable field name for the error message
 * @returns {string|null}
 */
export function validateRequired(value, fieldName) {
  if (value === null || value === undefined) return `${fieldName} is required`;
  if (typeof value === 'string' && !value.trim()) return `${fieldName} is required`;
  return null;
}

/**
 * Validate a job posting form.
 * @param {object} data — form fields
 * @returns {object} an object mapping field names to error strings (empty object = valid)
 */
export function validateJobForm(data) {
  const errors = {};

  const titleErr = validateRequired(data.title, 'Job title');
  if (titleErr) errors.title = titleErr;

  const descErr = validateRequired(data.description, 'Job description');
  if (descErr) errors.description = descErr;
  else if (data.description.trim().length < 50) errors.description = 'Description must be at least 50 characters';

  const locErr = validateRequired(data.location, 'Location');
  if (locErr) errors.location = locErr;

  if (!data.type) errors.type = 'Job type is required';
  if (!data.experienceLevel) errors.experienceLevel = 'Experience level is required';
  if (!data.category) errors.category = 'Category is required';

  if (data.salaryMin != null && data.salaryMax != null) {
    if (Number(data.salaryMin) > Number(data.salaryMax)) {
      errors.salaryMin = 'Minimum salary cannot exceed maximum salary';
    }
  }

  if (data.salaryMin != null && Number(data.salaryMin) < 0) {
    errors.salaryMin = 'Salary cannot be negative';
  }

  if (data.deadline) {
    const deadline = new Date(data.deadline);
    if (isNaN(deadline.getTime())) {
      errors.deadline = 'Invalid deadline date';
    } else if (deadline < new Date()) {
      errors.deadline = 'Deadline must be in the future';
    }
  }

  return errors;
}

/**
 * Validate a job application form.
 * @param {object} data — form fields
 * @returns {object} field → error string mapping (empty = valid)
 */
export function validateApplicationForm(data) {
  const errors = {};

  if (!data.jobId) errors.jobId = 'Job selection is required';
  if (!data.seekerId) errors.seekerId = 'You must be logged in to apply';

  // Cover letter is optional but has a minimum length if provided
  if (data.coverLetter && data.coverLetter.trim().length > 0 && data.coverLetter.trim().length < 20) {
    errors.coverLetter = 'Cover letter should be at least 20 characters if provided';
  }

  return errors;
}

/**
 * Validate a registration form.
 * @param {object} data
 * @returns {object} field → error string mapping
 */
export function validateRegistrationForm(data) {
  const errors = {};

  const nameErr = validateRequired(data.name, 'Full name');
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;

  const pwErr = validatePassword(data.password);
  if (pwErr) errors.password = pwErr;

  if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!data.role) errors.role = 'Please select a role';

  if (data.role === 'employer') {
    const companyErr = validateRequired(data.companyName, 'Company name');
    if (companyErr) errors.companyName = companyErr;
  }

  return errors;
}

/**
 * Validate a login form.
 * @param {object} data
 * @returns {object} field → error string mapping
 */
export function validateLoginForm(data) {
  const errors = {};

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;

  const pwErr = validateRequired(data.password, 'Password');
  if (pwErr) errors.password = pwErr;

  return errors;
}
