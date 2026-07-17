// ─── Auth Service ─────────────────────────────────────────────────────────────
// Handles authentication, registration, and profile management via localStorage.

import { getData, setData, simulateDelay, generateId } from './api';

/**
 * Strip sensitive fields (password) from a user object before returning.
 */
function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

export const authService = {
  /**
   * Authenticate a user by email and password.
   * Stores the session in localStorage as 'currentUser'.
   */
  async login(email, password) {
    await simulateDelay();

    const users = getData('users') || [];
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password. Please try again.');
    }

    const safeUser = sanitizeUser(user);
    sessionStorage.setItem('currentUser', JSON.stringify(safeUser));
    return safeUser;
  },

  /**
   * Register a new user.
   * If the role is 'employer' and companyName is provided, a new company is created.
   */
  async register({ email, password, name, role, companyName = '', phone = '', location = '' }) {
    await simulateDelay();

    const users = getData('users') || [];

    // Check for duplicate email
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }

    let companyId = null;

    // If employer, create a company entry
    if (role === 'employer' && companyName) {
      const companies = getData('companies') || [];
      const newCompany = {
        id: generateId('c'),
        name: companyName,
        logo: null,
        industry: '',
        size: '',
        founded: new Date().getFullYear(),
        website: '',
        description: '',
        location: location || '',
        benefits: [],
      };
      companies.push(newCompany);
      setData('companies', companies);
      companyId = newCompany.id;
    }

    const newUser = {
      id: generateId('u'),
      email,
      password,
      name,
      role,
      phone,
      location,
      bio: '',
      avatarColor: `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`,
      ...(role === 'seeker'
        ? { skills: [], experience: [], education: [], resumeFileName: '' }
        : { companyId, title: '' }),
    };

    users.push(newUser);
    setData('users', users);

    const safeUser = sanitizeUser(newUser);
    sessionStorage.setItem('currentUser', JSON.stringify(safeUser));
    return safeUser;
  },

  /**
   * Log in or register a Google-authenticated user.
   * If a user exists with the email, sanitize and log them in (sessionStorage).
   * Otherwise, create a new user profile with Google defaults.
   */
  async loginOrRegisterGoogle(email, name, role) {
    await simulateDelay();
    
    const users = getData('users') || [];
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      let companyId = null;
      if (role === 'employer') {
        const companies = getData('companies') || [];
        const newCompany = {
          id: generateId('c'),
          name: `${name}'s Company`,
          logo: null,
          industry: '',
          size: '',
          founded: new Date().getFullYear(),
          website: '',
          description: '',
          location: 'Remote',
          benefits: [],
        };
        companies.push(newCompany);
        setData('companies', companies);
        companyId = newCompany.id;
      }
      
      user = {
        id: generateId('u'),
        email,
        password: 'google_auth_bypass_12345',
        name,
        role: role || 'seeker',
        phone: 'Google Auth',
        location: 'Remote',
        bio: '',
        avatarColor: `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`,
        ...(role === 'employer' ? { companyId, title: '' } : { skills: [], experience: [], education: [], resumeFileName: '' })
      };
      
      users.push(user);
      setData('users', users);
    }
    
    const safeUser = sanitizeUser(user);
    sessionStorage.setItem('currentUser', JSON.stringify(safeUser));
    return safeUser;
  },

  /**
   * Log out the current user.
   */
  async logout() {
    sessionStorage.removeItem('currentUser');
  },

  /**
   * Get the currently logged-in user from localStorage.
   * Returns null if no session exists.
   */
  getCurrentUser() {
    const user = sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Update a user's profile.
   * Updates both the users array and the currentUser session.
   */
  async updateProfile(userId, data) {
    await simulateDelay();

    const users = getData('users') || [];
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('User not found');

    // Prevent overwriting critical fields
    const { id, email, password, role, ...updatableFields } = data;
    users[idx] = { ...users[idx], ...updatableFields };
    setData('users', users);

    // Update the session too
    const currentUserStr = sessionStorage.getItem('currentUser');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.id === userId) {
        const updatedSession = sanitizeUser(users[idx]);
        sessionStorage.setItem('currentUser', JSON.stringify(updatedSession));
        return updatedSession;
      }
    }

    return sanitizeUser(users[idx]);
  },
};
