# JobFlow — Job Board Web Application Documentation

JobFlow is a modern, responsive, full-featured Job Board application designed to connect job seekers with top employers. Built using **React (Vite)** and **TypeScript**, it incorporates a persistent `localStorage` database layer, premium glassmorphism aesthetics, responsive layouts, active filter chips, status timelines, and built-in dark mode support.

---

## 📖 Table of Contents
1. [Core Features Overview](#-core-features-overview)
   - [For Job Seekers](#for-job-seekers)
   - [For Employers](#for-employers)
   - [Cross-Cutting UX & Design System](#cross-cutting-ux--design-system)
2. [User Journeys & Walkthroughs](#-user-journeys--walkthroughs)
   - [Job Discovery & Bookmarking](#1-job-discovery--bookmarking)
   - [Authentication & Role Management](#2-authentication--role-management)
   - [End-to-End Application Loop](#3-end-to-end-application-loop)
3. [Technical Architecture](#-technical-architecture)
   - [Data Layer & Services](#data-layer--services)
   - [State Management & Routing](#state-management--routing)
4. [Deployment & CI/CD Pipeline](#-deployment--cicd-pipeline)

---

## ⚡ Core Features Overview

### For Job Seekers
* **Advanced Search & Filtering**:
  * Debounced keyword search (searches title, description, company name, requirements, and categories).
  * Location-based filtering.
  * Combinable select filters: Category, Job Type, Experience Level, Minimum Salary, and Date Posted.
  * Dismissible active filter chips showing count of active filters with a "Clear all" button.
* **Job Detail Page**:
  * Full descriptions, responsibilities, requirements, and benefits list.
  * A sidebar overview containing salary range, location, and date posted.
  * Interactive components: copy link to clipboard for quick sharing, bookmark toggle, and mobile sticky CTA button.
  * Similar jobs recommendations derived using similarity scoring logic (same category, company, or level).
* **Saved Jobs (Bookmarks)**:
  * Persistent bookmarking. Works for guests and logged-out users (stored in guest memory), and automatically merges with the seeker's account upon login.
* **Profile Settings**:
  * Edit name, bio, location, phone, and profile resume filename.
  * Manage dynamic list fields: add/remove skills (rendered as chips) and add timelines for education and work history.
* **Application Tracker Dashboard**:
  * Aggregate statistic summaries (Applied, Under Review, Interview, Offers).
  * Cards for each submitted application, expanding to show contact details, cover letter, resume, and an **interactive visual status timeline** (Applied -> Under Review -> Interview -> Offer or Rejected) with status updates and notes from the employer.

### For Employers
* **Analytics Dashboard**:
  * High-level metrics showing total listings, active listings, total candidate applications, and new applicants this week.
  * Listing table displaying views, candidate counts, date posted, and status toggles (Close/Reopen) for all jobs.
* **Job Form Wizard**:
  * Single-page form to post or edit listings.
  * Real-time inline validation (e.g. min salary cannot be negative, max salary must be greater than min salary, title/description required).
  * Dynamic bulleted list managers for Requirements, Responsibilities, and Benefits.
* **Applicant Review Portal**:
  * Filter candidate submissions by specific application status (New, Under Review, Interviewing, Offered, Rejected) or sort by date applied.
  * Detailed candidate profile view: displays cover letter, resume download, contact details, bio, skills, education, and work history.
  * **Status Updater Widget**: Dropdown select to update the applicant's status and write a custom note (e.g. scheduling details), which pushes updates instantly back to the seeker's dashboard.
* **Company Profile Manager**:
  * Set company size, founded year, website, industry, headquarters location, detailed overview, and company-wide perks.

### Cross-Cutting UX & Design System
* **Premium Theme (Dark Mode)**:
  * Persistent dark mode selector. Transitions the entire DOM theme by setting `data-theme="dark"` and updating all HSL/semantic layout variables.
* **Robust Form Validation**:
  * Every input contains validation on-change and error alerts showing helpers inline next to the elements.
* **Loading & Empty States**:
  * Loading skeleton pulses render during async actions. Empty search, bookmark, dashboard, and applicant lists show helpful instructions.

---

## 🚶 User Journeys & Walkthroughs

### 1. Job Discovery & Bookmarking
* A user visits the landing page and is greeted by the hero banner. They can type search terms (e.g., "React") or locations (e.g., "Remote").
* On the Job Search page, they can apply combinable filters. As they adjust selectors, active filter chips render at the top of the search list, displaying what parameters are active. Clicking a chip's "X" removes that filter, and clicking "Clear all" resets the search parameter state.
* The user can click the heart icon on any card to save it. If they are a guest, this saves to `guestBookmarks`. When they later log in, these guest bookmarks are automatically merged with their user account bookmarks.

### 2. Authentication & Role Management
* Clicking "Log In" or "Sign Up" opens a clean, centered card.
* On the register card, the user can toggle between the **Job Seeker** or **Employer** roles. Choosing "Employer" displays an additional required field for their company name.
* In the login page, demo buttons are provided at the footer so test reviewers can log in as a Seeker (Sarah Johnson) or Employer (TechNova) with a single click.

### 3. End-to-End Application Loop
1. **Browse & Select**: A job seeker finds a listing (e.g., "Senior Frontend Engineer" at TechNova) and opens the details page.
2. **Apply Form**: The seeker clicks **Apply Now**. If logged in, their name, email, phone, and resume filename are pre-filled from their profile. They can optionally type a cover letter and click **Submit Application**.
3. **Confirmation State**: Rather than redirecting, the application renders a clean success page celebrating the submission with quick links to their dashboard or back to the job search.
4. **Employer Review**: The seeker logs out and logs in as the employer (`hr@technova.com`). In the employer dashboard, they see the applicant count for the job has incremented.
5. **Update Candidate**: The employer clicks "Applicants", selects the new candidate from the sidebar, reviews their credentials, and fills out the status updater at the bottom. They change the status to **Interview** and write a note: *"Technical interview scheduled for next Thursday at 3 PM."*
6. **Reflected Tracker**: The employer logs out and logs back in as the seeker. In the seeker's Applications page, they expand the job card and see their status marker has updated to **Interview**, complete with the date and the employer's scheduling note.

---

## 🛠 Technical Architecture

### Live Multi-Portal Job Aggregator & Backend Worker
JobFlow integrates a hybrid data architecture combining persistent mock local listings with a live Cloudflare Worker proxy aggregator:
* **Cloudflare Worker Backend**: Located at [worker/src/index.js](file:///c:/Users/vallu/Downloads/StudentManagementSystem/Job_Board/worker/src/index.js). When VITE_CLOUDFLARE_WORKER_URL is configured, the frontend queries the worker's `/api/jobs` search endpoint.
* **Adzuna API Integration**: The worker connects to the live Adzuna India API (country: `in`) using the configured application credentials (`wrangler.toml`). It fetches real-time jobs in India from multiple portals.
* **Portal Aggregation Source Badges**: During results mapping, the worker extracts the original aggregation source (e.g. `Indeed`, `Naukri`, `LinkedIn`, `Shine`, `Careers Page`) based on the redirect URL domain. The frontend displays this source next to the timestamp in [JobCard.jsx](file:///c:/Users/vallu/Downloads/StudentManagementSystem/Job_Board/src/components/shared/JobCard.jsx) and inside the header of [JobDetail.jsx](file:///c:/Users/vallu/Downloads/StudentManagementSystem/Job_Board/src/pages/JobDetail.jsx).
* **Worker Details Caching**: Implements a global, in-memory `JOBS_CACHE` map in the worker. When a user requests job details for a specific Adzuna listing (`/api/jobs/:id`), the worker serves the details directly from the search cache, preventing fallbacks and ensuring real-time descriptions match search results.
* **External Apply Redirection**: If a listing is an aggregated job, the **Apply Now** button dynamically triggers an external browser window redirection (`window.open(url, '_blank')`) using the click-tracking URL mapped from Adzuna.

### Google Identity Services (GSI) & Token Verification
* **Real Google Sign-In**: The Google Login/Register features use the official Google Identity Services client SDK loaded via `https://accounts.google.com/gsi/client`.
* **Standard OAuth Flow**: When the Google Sign-In button is rendered, it initiates a secure popup chooser managed by Google. On successful sign-in, Google returns a real ID token (JWT) to the frontend application.
* **Worker Verification Proxy**: The frontend intercepts this token and sends a POST request to `/api/auth/google` on the Cloudflare Worker backend. The worker securely retrieves token details via `https://oauth2.googleapis.com/tokeninfo?id_token=...` to extract the user's real email, name, and profile picture, seamlessly logging them into the JobFlow platform.

### State Management, Routing & Session Security
* [AuthContext.jsx](file:///c:/Users/vallu/Downloads/StudentManagementSystem/Job_Board/src/context/AuthContext.jsx): Handles global user states, logs, registration profiles, and handles route loading screens.
* [authService.js](file:///c:/Users/vallu/Downloads/StudentManagementSystem/Job_Board/src/services/authService.js): Manages active user logins. Migrated from `localStorage` to `sessionStorage` for active session caching; closing the browser window or tab automatically logs out the user.
* [BookmarkContext.jsx](file:///c:/Users/vallu/Downloads/StudentManagementSystem/Job_Board/src/context/BookmarkContext.jsx): Manages bookmark syncing, guest merges, and heart toggles.
* [ToastContext.jsx](file:///c:/Users/vallu/Downloads/StudentManagementSystem/Job_Board/src/context/ToastContext.jsx): Controls sliding alert toasts for instant user action feedback.
* **Routing Guards**: Set up in `App.jsx` using `react-router-dom` with guards (`ProtectedRoute` and `GuestRoute`). The root route `/` is wrapped under `ProtectedRoute`, immediately redirecting unauthenticated visitors to `/login` to secure the page layout.

---

## 🚀 Deployment & CI/CD Pipeline

The project is configured for automated testing, building, and deployment using GitHub Actions:
* **Workflow File**: Located at [.github/workflows/deploy.yml](file:///c:/Users/vallu/Downloads/StudentManagementSystem/Job_Board/.github/workflows/deploy.yml).
* **Triggers**: Executes on pushes and pull requests to `main` or `master`, as well as manual triggers via `workflow_dispatch`.
* **CI Build Steps**:
  1. Checks out repository files.
  2. Sets up Node.js environment (v20) caching dependencies.
  3. Installs dependencies using `npm ci`.
  4. Compiles the TypeScript compiler and builds Vite static assets using `npm run build`.
* **CD Vercel Deploy Steps**:
  * On merges/pushes to the main branch, the pipeline logs in via `VERCEL_TOKEN`, pulls environment parameters using `vercel pull`, compiles building artifacts via `vercel build`, and deploys using `vercel deploy --prebuilt --prod`.
