import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const SUGGESTED_SKILLS = [
  'Python', 'JavaScript', 'React', 'SQL', 'HTML', 'CSS',
  'Figma', 'Git', 'Pandas', 'Linux', 'Docker', 'REST APIs',
  'Statistics', 'AWS', 'Data Visualization', 'User Research'
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const { addToast } = useToast()

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [roles, setRoles] = useState([])

  // Form State
  const [education, setEducation] = useState('Bachelor of Science')
  const [fieldOfStudy, setFieldOfStudy] = useState('Computer Science')
  const [stage, setStage] = useState('Student')
  const [preferredLocation, setPreferredLocation] = useState('Remote')
  const [experienceLevel, setExperienceLevel] = useState('Entry-level')
  const [targetRole, setTargetRole] = useState('')
  const [shortTermGoal, setShortTermGoal] = useState('')
  const [longTermGoal, setLongTermGoal] = useState('')
  const [learningStyle, setLearningStyle] = useState('Hands-on Projects')
  const [weeklyHours, setWeeklyHours] = useState(10)
  const [portfolioProjects, setPortfolioProjects] = useState('')
  const [skills, setSkills] = useState([
    { name: 'Python', proficiency: 75 },
    { name: 'SQL', proficiency: 70 },
    { name: 'Git', proficiency: 65 }
  ])
  const [customSkill, setCustomSkill] = useState('')

  useEffect(() => {
    api.get('/api/jobs')
      .then(res => {
        const list = res.data.jobs || []
        setRoles(list)
        if (list.length > 0 && !targetRole) {
          setTargetRole(list[0].id)
        }
      })
      .catch(() => {})
  }, [targetRole])

  const handleAddSkill = (skillName) => {
    if (!skillName.trim()) return
    const name = skillName.trim()
    if (!skills.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      setSkills([...skills, { name, proficiency: 70 }])
    }
    setCustomSkill('')
  }

  const handleRemoveSkill = (skillName) => {
    setSkills(skills.filter(s => s.name !== skillName))
  }

  const handleProficiencyChange = (name, val) => {
    setSkills(skills.map(s => s.name === name ? { ...s, proficiency: Number(val) } : s))
  }

  const handleFinish = async () => {
    setSubmitting(true)
    try {
      await api.post('/api/profile/onboarding', {
        education,
        field_of_study: fieldOfStudy,
        stage,
        preferred_location: preferredLocation,
        experience_level: experienceLevel,
        target_role: targetRole,
        short_term_goal: shortTermGoal,
        long_term_goal: longTermGoal,
        learning_style: learningStyle,
        weekly_hours: Number(weeklyHours),
        portfolio_projects: portfolioProjects,
        skills
      })

      if (targetRole) {
        try {
          await api.post('/api/roadmap/generate', { role_id: targetRole })
        } catch (e) {}
      }

      if (refreshUser) await refreshUser()
      addToast('Profile calibrated successfully. Entering Career Briefing.', 'success')
      navigate('/dashboard')
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to complete profile onboarding.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="content-container" style={{ maxWidth: '780px' }}>
      {/* Editorial Header */}
      <header className="editorial-header">
        <div className="editorial-header-top">
          <span className="editorial-kicker burgundy">PROFILE INITIALIZATION : STAGE 0{step} OF 03</span>
          <span className="editorial-edition">CAREERPATH ONBOARDING</span>
        </div>
        <h1 className="editorial-title">Personalize Your Career Intelligence Dossier</h1>
        <p className="editorial-deck">
          Provide your baseline academic coordinates, target career direction, and initial technical competencies to calibrate the matching engine.
        </p>
      </header>

      {/* Step Indicator Rule */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '2.5rem' }}>
        <div style={{
          padding: '0.85rem 1rem',
          backgroundColor: step === 1 ? 'var(--surface-primary)' : 'var(--surface-secondary)',
          border: '1px solid',
          borderColor: step >= 1 ? 'var(--accent-burgundy)' : 'var(--rule-subtle)',
          borderRadius: 'var(--radius-md)',
          boxShadow: step === 1 ? 'var(--shadow-card)' : 'none',
          fontSize: '0.72rem',
          color: step >= 1 ? 'var(--accent-burgundy)' : 'var(--ink-muted)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          transition: 'var(--transition-smooth)'
        }}>
          01 / ACADEMIC BACKGROUND
        </div>
        <div style={{
          padding: '0.85rem 1rem',
          backgroundColor: step === 2 ? 'var(--surface-primary)' : 'var(--surface-secondary)',
          border: '1px solid',
          borderColor: step >= 2 ? 'var(--accent-burgundy)' : 'var(--rule-subtle)',
          borderRadius: 'var(--radius-md)',
          boxShadow: step === 2 ? 'var(--shadow-card)' : 'none',
          fontSize: '0.72rem',
          color: step >= 2 ? 'var(--accent-burgundy)' : 'var(--ink-muted)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          transition: 'var(--transition-smooth)'
        }}>
          02 / TARGET TRAJECTORY
        </div>
        <div style={{
          padding: '0.85rem 1rem',
          backgroundColor: step === 3 ? 'var(--surface-primary)' : 'var(--surface-secondary)',
          border: '1px solid',
          borderColor: step >= 3 ? 'var(--accent-burgundy)' : 'var(--rule-subtle)',
          borderRadius: 'var(--radius-md)',
          boxShadow: step === 3 ? 'var(--shadow-card)' : 'none',
          fontSize: '0.72rem',
          color: step >= 3 ? 'var(--accent-burgundy)' : 'var(--ink-muted)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          transition: 'var(--transition-smooth)'
        }}>
          03 / COMPETENCY CALIBRATION
        </div>
      </div>

      <div className="editorial-panel">
        {/* Step 1: Academic Coordinates */}
        {step === 1 && (
          <div>
            <div className="editorial-panel-header">
              <div>
                <span className="editorial-kicker">STEP 01</span>
                <h2 className="editorial-panel-title">Academic & Vocational Stage</h2>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Current Professional Stage</label>
                <select value={stage} onChange={e => setStage(e.target.value)}>
                  <option value="Student">Current Student</option>
                  <option value="Recent Graduate">Recent Graduate</option>
                  <option value="Career Switcher">Career Switcher</option>
                  <option value="Self-Taught">Self-Taught Professional</option>
                </select>
              </div>

              <div className="form-group">
                <label>Degree / Qualification Level</label>
                <input
                  type="text"
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  placeholder="e.g. Bachelor of Science"
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Primary Field of Study</label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={e => setFieldOfStudy(e.target.value)}
                  placeholder="e.g. Computer Science, Information Systems"
                />
              </div>

              <div className="form-group">
                <label>Preferred Work Modality</label>
                <select value={preferredLocation} onChange={e => setPreferredLocation(e.target.value)}>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                  <option value="Any">Any Modality</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--rule-subtle)' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setStep(2)}
              >
                Proceed to Trajectory →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Target Trajectory */}
        {step === 2 && (
          <div>
            <div className="editorial-panel-header">
              <div>
                <span className="editorial-kicker">STEP 02</span>
                <h2 className="editorial-panel-title">Target Role & Vocational Aspirations</h2>
              </div>
            </div>

            <div className="form-group">
              <label>Benchmark Role Specification Target</label>
              <select value={targetRole} onChange={e => setTargetRole(e.target.value)}>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Immediate Short-Term Objective</label>
              <input
                type="text"
                value={shortTermGoal}
                onChange={e => setShortTermGoal(e.target.value)}
                placeholder="e.g. Secure a summer technical internship or junior developer role"
              />
            </div>

            <div className="form-group">
              <label>Long-Term Vision</label>
              <input
                type="text"
                value={longTermGoal}
                onChange={e => setLongTermGoal(e.target.value)}
                placeholder="e.g. Lead machine learning systems infrastructure architecture"
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
              <label>Prior Projects or Portfolio Highlights (Optional)</label>
              <input
                type="text"
                value={portfolioProjects}
                onChange={e => setPortfolioProjects(e.target.value)}
                placeholder="e.g. GitHub repos, capstone project, or personal web apps built"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--rule-subtle)' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setStep(3)}
              >
                Proceed to Competency Calibration →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Competency Calibration */}
        {step === 3 && (
          <div>
            <div className="editorial-panel-header">
              <div>
                <span className="editorial-kicker">STEP 03</span>
                <h2 className="editorial-panel-title">Initial Competency Calibration</h2>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)', marginBottom: '1.25rem' }}>
              Calibrate your self-assessed proficiency across current skills. These values will be weighted by the matching engine.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {skills.map(s => (
                <div
                  key={s.name}
                  style={{
                    padding: '1rem 1.25rem',
                    backgroundColor: 'var(--surface-primary)',
                    border: '1px solid var(--rule-subtle)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                    <strong style={{ fontSize: '0.85rem' }}>{s.name}</strong>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-burgundy)', fontWeight: 600 }}>{s.proficiency}%</span>
                      <button
                        type="button"
                        className="btn-text-link"
                        onClick={() => handleRemoveSkill(s.name)}
                        style={{ fontSize: '0.7rem', color: 'var(--color-error)' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={s.proficiency}
                    onChange={e => handleProficiencyChange(s.name, e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--accent-olive)' }}
                  />
                </div>
              ))}
            </div>

            {/* Add Custom Skill */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <input
                type="text"
                placeholder="Add other competency (e.g. Docker, TypeScript)..."
                value={customSkill}
                onChange={e => setCustomSkill(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill(customSkill)
                  }
                }}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleAddSkill(customSkill)}
                style={{ fontSize: '0.75rem' }}
              >
                Add Competency +
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="editorial-kicker" style={{ display: 'block', marginBottom: '0.4rem' }}>
                FREQUENT COMPETENCIES
              </span>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {SUGGESTED_SKILLS.map(s => {
                  const already = skills.some(sk => sk.name.toLowerCase() === s.toLowerCase())
                  if (already) return null
                  return (
                    <button
                      key={s}
                      type="button"
                      className="suggested-btn"
                      onClick={() => handleAddSkill(s)}
                    >
                      + {s}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--rule-subtle)' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStep(2)}
                disabled={submitting}
              >
                ← Back
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleFinish}
                disabled={submitting}
              >
                {submitting ? 'Calibrating Dossier...' : 'Finalize Dossier & Enter Briefing →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
