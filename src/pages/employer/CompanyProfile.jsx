import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getData, setData, simulateDelay } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Chip from '../../components/ui/Chip';
import Select from '../../components/ui/Select';
import PageContainer from '../../components/layout/PageContainer';
import './CompanyProfile.css';

const INDUSTRIES = [
  { value: 'Technology', label: 'Technology' },
  { value: 'Sustainability', label: 'Sustainability' },
  { value: 'Financial Services', label: 'Financial Services' },
  { value: 'Design & Creative', label: 'Design & Creative' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Education', label: 'Education' },
  { value: 'Consulting', label: 'Consulting' },
];

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000-5000', label: '1000-5000 employees' },
  { value: '5000+', label: '5000+ employees' },
];

export default function EmployerCompanyProfile() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState(null);
  const [newBenefit, setNewBenefit] = useState('');

  useEffect(() => {
    const fetchCompany = async () => {
      await simulateDelay(150);
      const allCompanies = getData('companies') || [];
      const comp = allCompanies.find((c) => c.id === user?.companyId);
      if (comp) {
        setCompany(comp);
      }
      setLoading(false);
    };
    if (user?.companyId) {
      fetchCompany();
    }
  }, [user]);

  const handleFieldChange = (field, value) => {
    setCompany((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddBenefit = (e) => {
    e.preventDefault();
    if (!newBenefit.trim()) return;
    const currentBenefits = company.benefits || [];
    if (currentBenefits.includes(newBenefit.trim())) {
      showToast('Benefit already listed', 'warning');
      return;
    }
    setCompany({
      ...company,
      benefits: [...currentBenefits, newBenefit.trim()],
    });
    setNewBenefit('');
  };

  const handleRemoveBenefit = (benefitToRemove) => {
    setCompany({
      ...company,
      benefits: (company.benefits || []).filter((b) => b !== benefitToRemove),
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!company.name.trim()) {
      showToast('Company Name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      await simulateDelay();
      const allCompanies = getData('companies') || [];
      const idx = allCompanies.findIndex((c) => c.id === company.id);
      if (idx !== -1) {
        allCompanies[idx] = company;
        setData('companies', allCompanies);
        showToast('Company profile updated successfully!', 'success');
      } else {
        throw new Error('Company not found in storage');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save company profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="company-profile-page skeleton-pulse" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
      </PageContainer>
    );
  }

  if (!company) {
    return (
      <PageContainer>
        <div className="company-profile-page">
          <h3>Error: Company Profile Not Found</h3>
          <p>Please contact support or register your company details.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="company-profile-page">
        <div className="company-profile-page__header">
          <h1>Company Profile</h1>
          <p>Update company information visible to job seekers on their search and detail pages</p>
        </div>

        <form onSubmit={handleSave} className="company-profile-form" noValidate>
          <div className="company-profile-grid">
            {/* Primary Details */}
            <div className="company-profile-main">
              <section className="company-profile-section">
                <h3>General Details</h3>
                <div className="form-row">
                  <Input
                    label="Company Name *"
                    value={company.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Input
                    label="Website URL"
                    value={company.website || ''}
                    placeholder="https://example.com"
                    onChange={(e) => handleFieldChange('website', e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="form-row">
                  <Select
                    label="Industry"
                    options={INDUSTRIES}
                    value={company.industry || ''}
                    placeholder="Select industry"
                    onChange={(e) => handleFieldChange('industry', e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    label="Company Size"
                    options={COMPANY_SIZES}
                    value={company.size || ''}
                    placeholder="Select size"
                    onChange={(e) => handleFieldChange('size', e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="form-row">
                  <Input
                    label="Headquarters Location"
                    placeholder="e.g. San Francisco, CA"
                    value={company.location || ''}
                    onChange={(e) => handleFieldChange('location', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    label="Founded Year"
                    type="number"
                    value={company.founded || ''}
                    onChange={(e) => handleFieldChange('founded', Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
                <Input
                  label="About Company"
                  type="textarea"
                  rows={6}
                  placeholder="Describe your company culture, mission, and products..."
                  value={company.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                />
              </section>
            </div>

            {/* Sidebar for logo & benefits */}
            <div className="company-profile-sidebar">
              <section className="company-profile-section">
                <h3>Logo Initial</h3>
                <div className="logo-preview-box">
                  <div
                    className="company-profile-logo"
                    style={{ background: `hsl(${(company.name?.length || 10) * 30}, 60%, 50%)` }}
                  >
                    {company.name?.charAt(0) || '?'}
                  </div>
                  <div className="logo-meta">
                    <span className="logo-tag">Generated Color Colorway</span>
                    <p>Calculated dynamically from company name for consistent branding.</p>
                  </div>
                </div>
              </section>

              <section className="company-profile-section">
                <h3>Company Benefits</h3>
                <div className="benefits-input-wrapper">
                  <Input
                    placeholder="Add a perk (e.g. Health Insurance)"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    className="flex-1"
                    fullWidth={false}
                  />
                  <Button variant="outline" onClick={handleAddBenefit}>
                    Add Perk
                  </Button>
                </div>
                <div className="benefits-list mt-3">
                  {(!company.benefits || company.benefits.length === 0) ? (
                    <p className="empty-text">No benefits listed yet.</p>
                  ) : (
                    company.benefits.map((benefit) => (
                      <Chip
                        key={benefit}
                        label={benefit}
                        onRemove={() => handleRemoveBenefit(benefit)}
                        variant="success"
                        className="mr-2 mb-2"
                      />
                    ))
                  )}
                </div>
              </section>

              <div className="company-actions">
                <Button type="submit" variant="primary" size="lg" fullWidth loading={saving}>
                  Save Profile
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
