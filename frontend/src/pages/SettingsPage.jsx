import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, logout, refreshUser } = useAuth()
  const { addToast } = useToast()

  // Profile Form State
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [education, setEducation] = useState(user?.profile?.education || '')
  const [fieldOfStudy, setFieldOfStudy] = useState(user?.profile?.field_of_study || '')
  const [stage, setStage] = useState(user?.profile?.stage || 'Student')
  const [preferredLocation, setPreferredLocation] = useState(user?.profile?.preferred_location || 'Remote')
  const [shortTermGoal, setShortTermGoal] = useState(user?.profile?.short_term_goal || '')
  const [longTermGoal, setLongTermGoal] = useState(user?.profile?.long_term_goal || '')
  const [learningStyle, setLearningStyle] = useState(user?.profile?.learning_style || 'Hands-on Projects')
  const [weeklyHours, setWeeklyHours] = useState(user?.profile?.weekly_hours || 10)
  const [portfolioProjects, setPortfolioProjects] = useState(user?.profile?.portfolio_projects || '')
  const [profileSaving, setProfileSaving] = useState(false)

  // Keep state in sync if user changes
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '')
      setEducation(user.profile?.education || '')
      setFieldOfStudy(user.profile?.field_of_study || '')
      setStage(user.profile?.stage || 'Student')
      setPreferredLocation(user.profile?.preferred_location || 'Remote')
      setShortTermGoal(user.profile?.short_term_goal || '')
      setLongTermGoal(user.profile?.long_term_goal || '')
      setLearningStyle(user.profile?.learning_style || 'Hands-on Projects')
      setWeeklyHours(user.profile?.weekly_hours || 10)
      setPortfolioProjects(user.profile?.portfolio_projects || '')
    }
  }, [user])

  // Password Form State
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // AI Diagnostics State
  const [aiStatus, setAiStatus] = useState(null)
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false)

  const loadAiDiagnostics = async () => {
    setDiagnosticsLoading(true)
    try {
      const res = await api.get('/api/chat/status')
      setAiStatus(res.data)
    } catch (e) {
      setAiStatus({ api_online: false, error: 'Could not connect to API' })
    } finally {
      setDiagnosticsLoading(false)
    }
  }

  useEffect(() => {
    loadAiDiagnostics()
  }, [])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    try {
      await api.put('/api/profile', {
        full_name: fullName,
        education,
        field_of_study: fieldOfStudy,
        stage,
        preferred_location: preferredLocation,
        short_term_goal: shortTermGoal,
        long_term_goal: longTermGoal,
        learning_style: learningStyle,
        weekly_hours: Number(weeklyHours),
        portfolio_projects: portfolioProjects
      })
      if (refreshUser) await refreshUser()
      addToast('Profile coordinates updated successfully.', 'success')
    } catch (err) {
      addToast('Failed to update profile.', 'error')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (!oldPassword || !newPassword) {
      setPasswordError('Please provide both current and new password.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must contain at least 6 characters.')
      return
    }

    setPasswordSaving(true)
    setPasswordError('')
    try {
      await api.put('/api/auth/password', {
        old_password: oldPassword,
        new_password: newPassword
      })
      addToast('Password updated successfully.', 'success')
      setOldPassword('')
      setNewPassword('')
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to update password.')
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleResetData = async () => {
    if (!window.confirm('Reset all saved career targets, study roadmap milestones, and networking contacts? Profile credentials will be preserved.')) return
    try {
      await api.post('/api/auth/reset-data')
      addToast('Platform activity data reset successfully.', 'info')
      if (refreshUser) refreshUser()
      navigate('/dashboard')
    } catch (err) {
      addToast('Could not reset data.', 'error')
    }
  }

  return (
    <div className="content-container">
      {/* Editorial Header */}
      <header className="editorial-header">
        <div className="editorial-header-top">
          <span className="editorial-kicker burgundy">PREFERENCES & SYSTEM : DOSSIER CONFIGURATION</span>
          <span className="editorial-edition">ACCOUNT: {user?.email}</span>
        </div>
        <h1 className="editorial-title">Settings & System Diagnostics</h1>
        <p className="editorial-deck">
          Manage your personal credentials, customize career search parameters, and verify the live operating state of all underlying AI inference systems.
        </p>
      </header>

      {/* 2-Column Editorial Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Profile Dossier Form */}
        <section className="editorial-panel">
          <div className="editorial-panel-header">
            <div>
              <span className="editorial-kicker">USER CREDENTIALS</span>
              <h2 className="editorial-panel-title">Personal Profile Information</h2>
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Academic / Professional Stage</label>
                <select value={stage} onChange={e => setStage(e.target.value)}>
                  <option value="Student">Current Student</option>
                  <option value="Recent Graduate">Recent Graduate</option>
                  <option value="Career Switcher">Career Switcher</option>
                  <option value="Self-Taught">Self-Taught Professional</option>
                </select>
              </div>

              <div className="form-group">
                <label>Educational Degree</label>
                <input
                  type="text"
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  placeholder="e.g. B.S. in Computer Science"
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Field of Study</label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={e => setFieldOfStudy(e.target.value)}
                  placeholder="e.g. Software Engineering"
                />
              </div>

              <div className="form-group">
                <label>Preferred Work Modality</label>
                <select
                  value={preferredLocation}
                  onChange={e => setPreferredLocation(e.target.value)}
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                  <option value="Any">Any Location</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Immediate Vocational Goal</label>
              <input
                type="text"
                value={shortTermGoal}
                onChange={e => setShortTermGoal(e.target.value)}
                placeholder="e.g. Secure a summer frontend engineering internship"
              />
            </div>

            <div className="form-group">
              <label>Long-Term Professional Vision</label>
              <input
                type="text"
                value={longTermGoal}
                onChange={e => setLongTermGoal(e.target.value)}
                placeholder="e.g. Transition into machine learning systems engineering"
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Weekly Study Budget (Hours/Week)</label>
                <select value={weeklyHours} onChange={e => setWeeklyHours(Number(e.target.value))}>
                  <option value={5}>5 hours/week (Focused / Restricted)</option>
                  <option value={10}>10 hours/week (Standard Pacing)</option>
                  <option value={15}>15 hours/week (Dedicated Transition)</option>
                  <option value={20}>20+ hours/week (Accelerated Immersion)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Preferred Learning Style</label>
                <select value={learningStyle} onChange={e => setLearningStyle(e.target.value)}>
                  <option value="Hands-on Projects">Hands-on Projects & Code Repos</option>
                  <option value="Structured Reading">Structured Technical Reading & Docs</option>
                  <option value="Interactive Tutorials">Interactive Tutorials & Sandboxes</option>
                  <option value="Guided Coursework">Guided Coursework & Video Tutorials</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Portfolio Projects & Technical Highlights</label>
              <textarea
                value={portfolioProjects}
                onChange={e => setPortfolioProjects(e.target.value)}
                placeholder="List major portfolio repos, live application links, or notable technical coursework..."
                rows={2}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--rule-subtle)' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShortTermGoal('')
                  setLongTermGoal('')
                  setPortfolioProjects('')
                  addToast('Career goals and project fields cleared. Click Save to persist.', 'info')
                }}
                style={{ fontSize: '0.76rem' }}
              >
                Clear Goals & Projects
              </button>
              <button type="submit" className="btn-primary" disabled={profileSaving}>
                {profileSaving ? 'Saving Dossier...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </section>

        {/* Right Column: Security, Diagnostics & Danger Zone */}
        <div>
          {/* Security & Password */}
          <section className="editorial-panel">
            <div className="editorial-panel-header">
              <div>
                <span className="editorial-kicker">ACCESS CONTROL</span>
                <h2 className="editorial-panel-title">Update Security Password</h2>
              </div>
            </div>

            {passwordError && <div className="form-error-banner">{passwordError}</div>}

            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password (min 6 characters)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={passwordSaving}
                style={{ width: '100%', fontSize: '0.75rem', marginTop: '0.5rem' }}
              >
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--rule-subtle)' }}>
              <span className="editorial-kicker" style={{ color: 'var(--color-error)' }}>DANGER ZONE</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--ink-secondary)', margin: '0.35rem 0 0.85rem' }}>
                Reset all saved careers, roadmap milestones, and network contacts:
              </p>
              <button
                type="button"
                className="btn-danger-outline"
                onClick={handleResetData}
                style={{ width: '100%' }}
              >
                Reset Activity Data
              </button>
            </div>
          </section>

          {/* AI Subsystems & Engine Diagnostics */}
          <section className="editorial-panel inset">
            <div className="editorial-panel-header">
              <div>
                <span className="editorial-kicker burgundy">SYSTEM TRANSPARENCY</span>
                <h2 className="editorial-panel-title">AI Engine Diagnostics</h2>
              </div>
              <button
                type="button"
                className="btn-text-link"
                onClick={loadAiDiagnostics}
                disabled={diagnosticsLoading}
                style={{ fontSize: '0.72rem' }}
              >
                {diagnosticsLoading ? 'Querying...' : 'Refresh'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--rule-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Core Application API:</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="status-dot online" style={{ width: '6px', height: '6px' }}></span>
                  <strong style={{ color: 'var(--color-success)' }}>Active (Flask 3.1)</strong>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--rule-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Matching Algorithm:</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="status-dot online" style={{ width: '6px', height: '6px' }}></span>
                  <strong>Weighted Skill Overlap & Proficiency</strong>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--rule-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Semantic Similarity:</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="status-dot online" style={{ width: '6px', height: '6px' }}></span>
                  <strong style={{ color: 'var(--color-success)' }}>Scikit-learn TF-IDF & Cosine</strong>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--rule-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Generative LLM Engine:</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`status-dot ${aiStatus?.generative_llm?.is_available ? 'online' : 'offline'}`} style={{ width: '6px', height: '6px' }}></span>
                  <strong style={{ color: aiStatus?.generative_llm?.is_available ? 'var(--color-success)' : 'var(--accent-gold)' }}>
                    {aiStatus?.generative_llm?.is_available
                      ? `${aiStatus.generative_llm?.provider} (${aiStatus.generative_llm?.target_model})`
                      : 'Context-Aware Career Coaching Fallback'}
                  </strong>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.2rem' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Operating Mode:</span>
                <span style={{ fontStyle: 'italic', color: 'var(--ink-primary)' }}>
                  {aiStatus?.mode_description || 'Context-Aware Career Coach Engine'}
                </span>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  )
}
