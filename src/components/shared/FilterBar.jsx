import { useState } from 'react';
import Select from '../ui/Select';
import Button from '../ui/Button';
import './FilterBar.css';

const JOB_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
];

const LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
];

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'finance', label: 'Finance' },
  { value: 'hr', label: 'HR' },
];

const LOCATIONS = [
  { value: '', label: 'All Locations' },
  { value: 'san francisco', label: 'San Francisco, CA' },
  { value: 'new york', label: 'New York, NY' },
  { value: 'remote', label: 'Remote' },
  { value: 'austin', label: 'Austin, TX' },
  { value: 'chicago', label: 'Chicago, IL' },
  { value: 'boston', label: 'Boston, MA' },
  { value: 'los angeles', label: 'Los Angeles, CA' },
];

const DATE_OPTIONS = [
  { value: '', label: 'Any Time' },
  { value: 'today', label: 'Past 24 Hours' },
  { value: '3days', label: 'Past 3 Days' },
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' },
];

const SALARY_OPTIONS = [
  { value: '', label: 'Any Salary' },
  { value: '50000', label: '$50,000+' },
  { value: '80000', label: '$80,000+' },
  { value: '100000', label: '$100,000+' },
  { value: '120000', label: '$120,000+' },
  { value: '150000', label: '$150,000+' },
  { value: '200000', label: '$200,000+' },
];

export default function FilterBar({ filters, onFilterChange, onClearAll, className = '' }) {
  const activeCount = Object.entries(filters).filter(([key, val]) => val !== null && val !== '').length;

  return (
    <aside className={`filter-bar ${className}`} aria-label="Job filters">
      <div className="filter-bar__header">
        <h3 className="filter-bar__title">Filters {activeCount > 0 && `(${activeCount})`}</h3>
        {activeCount > 0 && (
          <button className="filter-bar__clear" onClick={onClearAll}>Clear all</button>
        )}
      </div>
      <div className="filter-bar__filters">
        <Select
          label="Category"
          options={CATEGORIES}
          value={filters.category || ''}
          onChange={(e) => onFilterChange({ category: e.target.value })}
        />
        <Select
          label="Job Type"
          options={JOB_TYPES}
          value={filters.type || ''}
          onChange={(e) => onFilterChange({ type: e.target.value })}
        />
        <Select
          label="Experience Level"
          options={LEVELS}
          value={filters.experienceLevel || ''}
          onChange={(e) => onFilterChange({ experienceLevel: e.target.value })}
        />
        <Select
          label="Location"
          options={LOCATIONS}
          value={filters.location || ''}
          onChange={(e) => onFilterChange({ location: e.target.value })}
        />
        <Select
          label="Date Posted"
          options={DATE_OPTIONS}
          value={filters.datePosted || ''}
          onChange={(e) => onFilterChange({ datePosted: e.target.value })}
        />
        <Select
          label="Min Salary"
          options={SALARY_OPTIONS}
          value={filters.salaryMin || ''}
          onChange={(e) => onFilterChange({ salaryMin: e.target.value })}
        />
      </div>
    </aside>
  );
}
