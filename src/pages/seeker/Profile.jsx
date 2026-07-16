import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Chip from '../../components/ui/Chip';
import PageContainer from '../../components/layout/PageContainer';
import './Profile.css';

export default function SeekerProfile() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    resumeFileName: user?.resumeFileName || '',
  });

  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');

  const [experience, setExperience] = useState(user?.experience || []);
  const [newExp, setNewExp] = useState({ title: '', company: '', from: '', to: '', description: '' });
  const [showExpForm, setShowExpForm] = useState(false);

  const [education, setEducation] = useState(user?.education || []);
  const [newEdu, setNewEdu] = useState({ degree: '', school: '', year: '' });
  const [showEduForm, setShowEduForm] = useState(false);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (skills.includes(newSkill.trim())) {
      showToast('Skill already added', 'warning');
      return;
    }
    setSkills([...skills, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!newExp.title || !newExp.company || !newExp.from) {
      showToast('Title, Company, and Start Date are required', 'error');
      return;
    }
    setExperience([...experience, newExp]);
    setNewExp({ title: '', company: '', from: '', to: '', description: '' });
    setShowExpForm(false);
  };

  const handleRemoveExperience = (idx) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  const handleAddEducation = (e) => {
    e.preventDefault();
    if (!newEdu.degree || !newEdu.school || !newEdu.year) {
      showToast('Degree, School, and Graduation Year are required', 'error');
      return;
    }
    setEducation([...education, { ...newEdu, year: Number(newEdu.year) }]);
    setNewEdu({ degree: '', school: '', year: '' });
    setShowEduForm(false);
  };

  const handleRemoveEducation = (idx) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  const handleMockResumeUpload = () => {
    const mockFileName = `${personalForm.name.replace(/\s+/g, '_').toLowerCase()}_resume.pdf`;
    setPersonalForm({ ...personalForm, resumeFileName: mockFileName });
    showToast('Mock resume uploaded!', 'success');
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        ...personalForm,
        skills,
        experience,
        education,
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className="seeker-profile-page">
        <div className="seeker-profile-page__header">
          <h1>My Profile</h1>
          <p>Keep your information updated to stand out to employers</p>
        </div>

        <div className="seeker-profile-grid">
          {/* Main profile form */}
          <div className="seeker-profile-main">
            <form onSubmit={handleSaveAll} className="profile-form">
              <section className="profile-section">
                <h3>Personal Information</h3>
                <div className="form-row">
                  <Input
                    label="Full Name"
                    value={personalForm.name}
                    onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    label="Email Address"
                    value={user?.email || ''}
                    disabled
                    helperText="Email cannot be changed"
                    className="flex-1"
                  />
                </div>
                <div className="form-row">
                  <Input
                    label="Phone Number"
                    value={personalForm.phone}
                    onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    label="Location"
                    value={personalForm.location}
                    onChange={(e) => setPersonalForm({ ...personalForm, location: e.target.value })}
                    className="flex-1"
                  />
                </div>
                <Input
                  label="Short Bio"
                  type="textarea"
                  value={personalForm.bio}
                  onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })}
                  placeholder="Introduce yourself in a few sentences..."
                  rows={4}
                />
              </section>

              {/* Resume Upload Simulator */}
              <section className="profile-section">
                <h3>Resume</h3>
                {personalForm.resumeFileName ? (
                  <div className="profile-resume-box">
                    <span className="file-icon">📄</span>
                    <div className="file-details">
                      <span className="file-name">{personalForm.resumeFileName}</span>
                      <span className="file-size">PDF • Mock Upload</span>
                    </div>
                    <button type="button" className="btn-change-file" onClick={() => setPersonalForm({ ...personalForm, resumeFileName: '' })}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="profile-upload-zone" onClick={handleMockResumeUpload}>
                    <span>📎</span>
                    <span>Click to upload resume (Simulated)</span>
                    <span className="upload-zone__hint">Supports PDF and Word formats up to 5MB</span>
                  </div>
                )}
              </section>

              {/* Skills section */}
              <section className="profile-section">
                <h3>Skills</h3>
                <div className="skills-input-wrapper">
                  <Input
                    placeholder="Enter a skill (e.g. React, Python)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1"
                    fullWidth={false}
                  />
                  <Button variant="outline" onClick={handleAddSkill}>
                    Add Skill
                  </Button>
                </div>
                <div className="skills-list mt-3">
                  {skills.length === 0 ? (
                    <p className="empty-text">No skills added yet.</p>
                  ) : (
                    skills.map(skill => (
                      <Chip
                        key={skill}
                        label={skill}
                        onRemove={() => handleRemoveSkill(skill)}
                        variant="primary"
                        className="mr-2 mb-2"
                      />
                    ))
                  )}
                </div>
              </section>

              <div className="profile-actions">
                <Button type="submit" variant="primary" size="lg" loading={saving}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar for Experience and Education */}
          <div className="seeker-profile-sidebar">
            {/* Work History */}
            <section className="profile-section">
              <div className="section-header-inline">
                <h3>Work History</h3>
                <Button variant="outline" size="small" onClick={() => setShowExpForm(!showExpForm)}>
                  {showExpForm ? 'Cancel' : 'Add New'}
                </Button>
              </div>

              {showExpForm && (
                <form onSubmit={handleAddExperience} className="nested-form-card">
                  <h4>Add Experience</h4>
                  <Input
                    label="Job Title *"
                    value={newExp.title}
                    onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                  />
                  <Input
                    label="Company Name *"
                    value={newExp.company}
                    onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                  />
                  <div className="form-row">
                    <Input
                      label="From *"
                      type="month"
                      value={newExp.from}
                      onChange={(e) => setNewExp({ ...newExp, from: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      label="To (or Present)"
                      type="month"
                      value={newExp.to}
                      onChange={(e) => setNewExp({ ...newExp, to: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                  <Input
                    label="Job Description"
                    type="textarea"
                    value={newExp.description}
                    onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                    rows={3}
                  />
                  <Button type="submit" variant="primary" size="small" fullWidth>
                    Add to List
                  </Button>
                </form>
              )}

              <div className="timeline-list">
                {experience.length === 0 ? (
                  <p className="empty-text">No work experience listed yet.</p>
                ) : (
                  experience.map((exp, idx) => (
                    <div key={idx} className="timeline-item">
                      <button type="button" className="btn-remove-timeline" onClick={() => handleRemoveExperience(idx)}>
                        🗑️
                      </button>
                      <h4 className="timeline-item__title">{exp.title}</h4>
                      <h5 className="timeline-item__sub">{exp.company}</h5>
                      <span className="timeline-item__date">{exp.from} to {exp.to || 'Present'}</span>
                      <p className="timeline-item__desc">{exp.description}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Education */}
            <section className="profile-section">
              <div className="section-header-inline">
                <h3>Education</h3>
                <Button variant="outline" size="small" onClick={() => setShowEduForm(!showEduForm)}>
                  {showEduForm ? 'Cancel' : 'Add New'}
                </Button>
              </div>

              {showEduForm && (
                <form onSubmit={handleAddEducation} className="nested-form-card">
                  <h4>Add Education</h4>
                  <Input
                    label="Degree / Course *"
                    placeholder="B.S. Computer Science"
                    value={newEdu.degree}
                    onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                  />
                  <Input
                    label="School / University *"
                    placeholder="Stanford University"
                    value={newEdu.school}
                    onChange={(e) => setNewEdu({ ...newEdu, school: e.target.value })}
                  />
                  <Input
                    label="Graduation Year *"
                    type="number"
                    placeholder="2024"
                    value={newEdu.year}
                    onChange={(e) => setNewEdu({ ...newEdu, year: e.target.value })}
                  />
                  <Button type="submit" variant="primary" size="small" fullWidth>
                    Add to List
                  </Button>
                </form>
              )}

              <div className="timeline-list">
                {education.length === 0 ? (
                  <p className="empty-text">No education entries listed yet.</p>
                ) : (
                  education.map((edu, idx) => (
                    <div key={idx} className="timeline-item">
                      <button type="button" className="btn-remove-timeline" onClick={() => handleRemoveEducation(idx)}>
                        🗑️
                      </button>
                      <h4 className="timeline-item__title">{edu.degree}</h4>
                      <h5 className="timeline-item__sub">{edu.school}</h5>
                      <span className="timeline-item__date">Class of {edu.year}</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
