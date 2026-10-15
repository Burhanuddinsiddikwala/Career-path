import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import CareerDetailModal from '../components/CareerDetailModal'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [jobs, setJobs] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [semantic, setSemantic] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState(null)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [tasks, setTasks] = useState([])
  const [rawSkills, setRawSkills] = useState([])
  const [skills, setSkills] = useState([])
  const [interests, setInterests] = useState(['Software Engineering', 'Systems Architecture'])
  const [newSkillName, setNewSkillName] = useState('')
  const [notice, setNotice] = useState('')
  const [proactiveInsights, setProactiveInsights] = useState([])
  const [dismissedInsightIds, setDismissedInsightIds] = useState(new Set())

  // Fetch initial profile, careers, skills, tasks, and proactive insights
  useEffect(() => {
    api.get('/api/careers')
      .then(res => setJobs(res.data.roles || []))
      .catch(() => {})

    api.get('/api/profile')
      .then(res => {
        setProfileCompletion(res.data.completion_percentage || 0)
      })
      .catch(() => {})

    api.get('/api/skills')
      .then(res => {
        const fetched = res.data.skills || []
        setRawSkills(fetched)
        setSkills(fetched.map(s => s.skill_name))
      })
      .catch(() => {})

    api.get('/api/roadmap/tasks')
      .then(res => setTasks(res.data.tasks || []))
      .catch(() => {})

    api.get('/api/chat/proactive-insights')
      .then(res => setProactiveInsights(res.data.insights || []))
      .catch(() => {})
  }, [])

  // Run match automatically when skills load
  useEffect(() => {
    if (skills.length > 0 && results.length === 0) {
      findMatchesSilently()
    }
  }, [skills])

  const findMatchesSilently = async () => {
    try {
      const res = await api.post('/api/careers/match', {
        skills,
        interests,
        use_semantic: semantic
      })
      setResults(res.data.results || [])
    } catch (e) {}
  }

  const handleManualMatch = async () => {
    if (skills.length === 0) {
      addToast('Please record at least one skill to calculate career alignment.', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/api/careers/match', {
        skills,
        interests,
        use_semantic: semantic
      })
      const list = res.data.results || []
      setResults(list)
      addToast(`Calculated ${list.length} career alignments against current competencies.`, 'success')
      setNotice(`Updated ranking using ${res.data.meta?.method || 'multi-factor algorithm'}.`)
    } catch (e) {
      addToast('Error calculating career matches.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      await api.put(`/api/roadmap/tasks/${task.id}`, { status: nextStatus })
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t))
      addToast(`Milestone marked as ${nextStatus}.`, 'success')
    } catch (e) {
      addToast('Could not update milestone status.', 'error')
    }
  }

  const handleAddSkill = async (e) => {
    e.preventDefault()
    const name = newSkillName.trim()
    if (!name) return
    try {
      const res = await api.post('/api/skills', { skill_name: name, proficiency: 70 })
      const newSkill = res.data.skill || { id: Date.now(), skill_name: name, proficiency: 70 }
      setRawSkills(prev => [...prev, newSkill])
      setSkills(prev => [...prev, name])
      setNewSkillName('')
      addToast(`Added "${name}" to your competencies.`, 'success')
    } catch (e) {
      addToast('Skill could not be saved or already exists.', 'error')
    }
  }

  const displayList = results.length > 0 ? results : jobs
  const topMatches = displayList.slice(0, 3)
  const topMatch = topMatches[0] || null

  const targetRoleLabel = user?.profile?.target_role
    ? user.profile.target_role.replace(/-/g, ' ').toUpperCase()
    : null

  const completedTasksCount = tasks.filter(t => t.status === 'completed').length

  return (
    <div className="content-container">
      {/* Opening Cinematic Briefing Header */}
      <header className="editorial-header">
        <div className="editorial-header-top">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="hero-pulsing-dot" />
            <span className="editorial-kicker burgundy">EXECUTIVE BRIEFING · DISPATCH EDITION</span>
          </div>
          <span className="editorial-edition">EST. 2026 · CONTINUOUS INTELLIGENCE</span>
        </div>

        <h1 className="editorial-title">
          Personalized Career Briefing for {user?.full_name || 'Candidate'}
        </h1>
        
        <p className="editorial-deck">
          {user?.profile?.stage || 'Professional'} profile synthesized with {skills.length} verified competencies and {tasks.length} learning milestones.
          {targetRoleLabel && ` Primary focus: ${targetRoleLabel}.`}
        </p>

        {user?.profile?.short_term_goal && (
          <div style={{ marginTop: '1.25rem', padding: '1rem 1.4rem', backgroundColor: 'var(--surface-primary)', borderLeft: '4px solid var(--accent-burgundy)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-subtle)', fontSize: '0.88rem' }}>
            <span className="editorial-kicker" style={{ fontSize: '0.68rem', display: 'block', marginBottom: '0.2rem' }}>
              STATED CAREER OBJECTIVE
            </span>
            <span style={{ fontStyle: 'italic', color: 'var(--ink-primary)', fontSize: '0.95rem' }}>
              "{user.profile.short_term_goal}"
            </span>
          </div>
        )}
      </header>

      {notice && (
        <div className="form-notice-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{notice}</span>
          <button className="btn-text-link" onClick={() => setNotice('')} style={{ fontSize: '0.78rem' }}>Dismiss</button>
        </div>
      )}

      {/* Proactive AI Mentor Intelligence Strip */}
      {proactiveInsights.filter(i => !dismissedInsightIds.has(i.id)).length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="hero-pulsing-dot" />
              <span className="editorial-kicker burgundy" style={{ fontSize: '0.75rem' }}>
                PROACTIVE MENTOR INTELLIGENCE
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)' }}>
              SYNTHESIZED FROM AUTHENTIC PROFILE DATA
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {proactiveInsights.filter(i => !dismissedInsightIds.has(i.id)).map(ins => (
              <div
                key={ins.id}
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  border: '1px solid var(--rule-subtle)',
                  borderLeft: '4px solid var(--accent-burgundy)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.35rem 1.4rem',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                    <span className="editorial-kicker" style={{ fontSize: '0.65rem', color: 'var(--accent-burgundy)' }}>
                      {ins.kicker}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDismissedInsightIds(prev => new Set([...prev, ins.id]))}
                      style={{ background: 'transparent', border: 0, cursor: 'pointer', fontSize: '0.9rem', color: 'var(--ink-muted)', lineHeight: 1 }}
                      title="Dismiss insight"
                      aria-label="Dismiss insight"
                    >
                      ×
                    </button>
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', margin: '0 0 0.45rem', color: 'var(--ink-primary)' }}>
                    {ins.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)', lineHeight: 1.55, margin: 0 }}>
                    {ins.message}
                  </p>
                </div>

                <div style={{ marginTop: '1.15rem', paddingTop: '0.75rem', borderTop: '1px solid var(--rule-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn-text-link"
                    onClick={() => {
                      if (ins.action_route === '/chat' && ins.suggested_prompt) {
                        navigate(`/chat?prompt=${encodeURIComponent(ins.suggested_prompt)}`)
                      } else {
                        navigate(ins.action_route)
                      }
                    }}
                    style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-burgundy)' }}
                  >
                    {ins.action_label} →
                  </button>
                  {ins.suggested_prompt && ins.action_route !== '/chat' && (
                    <button
                      type="button"
                      className="btn-text-link"
                      onClick={() => navigate(`/chat?prompt=${encodeURIComponent(ins.suggested_prompt)}`)}
                      style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}
                    >
                      Ask Mentor ↗
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Asymmetric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.75fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Ranked Career Directions & Skill Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Top Recommendation Highlight Card */}
          {topMatch && (
            <div style={{ background: 'var(--surface-primary)', border: '1px solid rgba(129, 55, 68, 0.2)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-card)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span className="editorial-kicker burgundy" style={{ marginBottom: '0.35rem' }}>
                    #01 HIGHEST ALIGNMENT TRAJECTORY
                  </span>
                  <h3 style={{ fontSize: '1.65rem', margin: '0.2rem 0 0.4rem', color: 'var(--ink-primary)' }}>
                    {topMatch.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--ink-secondary)' }}>
                    <span>{topMatch.category || 'Technology'}</span>
                    <span>·</span>
                    <span>{topMatch.experience_level || 'Entry-level'}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="metric-num" style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--accent-burgundy)', lineHeight: 1 }}>
                    {topMatch.match_score || 50}%
                  </div>
                  <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)' }}>
                    Match Signal
                  </span>
                </div>
              </div>

              <div className="skill-meter-track" style={{ height: '8px', marginBottom: '1.25rem' }}>
                <div
                  className="skill-meter-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, topMatch.match_score || 50))}%`,
                    backgroundColor: (topMatch.match_score || 50) >= 60 ? 'var(--accent-olive)' : 'var(--accent-burgundy)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {(topMatch.matched_skills || []).slice(0, 3).map(s => (
                    <span key={s} className="editorial-tag matched">{s}</span>
                  ))}
                  {(topMatch.missing_skills || []).slice(0, 2).map(s => (
                    <span key={s} className="editorial-tag missing">{s}</span>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setSelectedRoleId(topMatch.id)}
                  style={{ fontSize: '0.82rem', padding: '0.55rem 1.15rem' }}
                >
                  Inspect Monograph →
                </button>
              </div>
            </div>
          )}

          {/* Section 1: Ranked Career Recommendations */}
          <section className="editorial-panel">
            <div className="editorial-panel-header">
              <div>
                <span className="editorial-kicker burgundy">CAREER DIRECTIONS</span>
                <h2 className="editorial-panel-title">Ranked Career Alignments</h2>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/careers')}
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.95rem' }}
              >
                Browse Full Index ({displayList.length}) →
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)', marginBottom: '1.5rem' }}>
              Calculated using multi-factor core competency overlap and proficiency weighting. Scores reflect profile similarity against benchmark role expectations.
            </p>

            <div className="ranked-careers-list">
              {topMatches.map((m, idx) => (
                <article key={m.id || idx} className="ranked-career-row">
                  <div className="rank-num">{(idx + 1).toString().padStart(2, '0')}.</div>
                  
                  <div className="career-core">
                    <h3>{m.title}</h3>
                    <div className="career-core-meta">
                      <span>{m.category || 'Technology'}</span>
                      <span>·</span>
                      <span>{m.experience_level || 'Entry-level'}</span>
                    </div>

                    {m.matched_skills && m.matched_skills.length > 0 && (
                      <div style={{ marginTop: '0.65rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {m.matched_skills.slice(0, 3).map(s => (
                          <span key={s} className="editorial-tag matched">{s}</span>
                        ))}
                      </div>
                    )}

                    {m.missing_skills && m.missing_skills.length > 0 && (
                      <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', alignSelf: 'center' }}>Missing:</span>
                        {m.missing_skills.slice(0, 2).map(s => (
                          <span key={s} className="editorial-tag missing">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="match-score-badge">
                    <span className="match-score-val">{m.match_score || 50}%</span>
                    <span className="match-score-label">Alignment</span>
                  </div>

                  <div>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setSelectedRoleId(m.id)}
                      style={{ fontSize: '0.78rem', padding: '0.5rem 1rem' }}
                    >
                      Inspect Role →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Section 2: Skill Development & Verified Competencies */}
          <section className="editorial-panel">
            <div className="editorial-panel-header">
              <div>
                <span className="editorial-kicker">COMPETENCY PROFILE</span>
                <h2 className="editorial-panel-title">Recorded Skills & Proficiency</h2>
              </div>
              <button
                type="button"
                className="btn-text-link"
                onClick={() => navigate('/skills')}
              >
                Manage All Skills →
              </button>
            </div>

            {rawSkills.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>
                No technical skills recorded yet. Add your initial competencies below or through onboarding.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {rawSkills.slice(0, 6).map((s) => (
                  <div key={s.id || s.skill_name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <strong style={{ fontWeight: 600 }}>{s.skill_name}</strong>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-secondary)', fontSize: '0.8rem' }}>
                        {s.proficiency || 60}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.min(100, Math.max(10, s.proficiency || 60))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 3: Learning Priorities & Milestones */}
          <section className="editorial-panel">
            <div className="editorial-panel-header">
              <div>
                <span className="editorial-kicker">STUDY ROADMAP</span>
                <h2 className="editorial-panel-title">Active Learning Priorities</h2>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/roadmap')}
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.95rem' }}
              >
                Roadmap Overview →
              </button>
            </div>

            {tasks.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>
                No learning roadmap generated yet. Select a target role to generate a 30-day curriculum.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tasks.slice(0, 4).map((t, idx) => (
                  <div
                    key={t.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1.25rem',
                      padding: '1rem 1.25rem',
                      backgroundColor: 'var(--bg-paper)',
                      border: '1px solid var(--rule-subtle)',
                      borderRadius: 'var(--radius-md)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.95rem' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(t)}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          border: t.status === 'completed' ? '2px solid var(--accent-olive)' : '2px solid var(--rule-strong)',
                          backgroundColor: t.status === 'completed' ? 'var(--accent-olive)' : 'transparent',
                          color: '#FAF8F2',
                          display: 'grid',
                          placeItems: 'center',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          padding: 0,
                          flexShrink: 0
                        }}
                        title={t.status === 'completed' ? 'Click to mark as pending' : 'Click to complete milestone'}
                      >
                        {t.status === 'completed' ? '✓' : ''}
                      </button>
                      
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, textDecoration: t.status === 'completed' ? 'line-through' : 'none', color: t.status === 'completed' ? 'var(--ink-muted)' : 'var(--ink-primary)' }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                          Priority: {t.priority || 'Medium'} {t.estimated_duration ? `· ${t.estimated_duration}` : ''}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleToggleTaskStatus(t)}
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                    >
                      {t.status === 'completed' ? 'Reopen' : 'Done ✓'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Contextual Column: Profile, Quick Tune, & AI Consult */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Panel A: Profile Dossier Summary */}
          <div className="editorial-panel inset">
            <span className="editorial-kicker burgundy">DOSSIER COORDINATES</span>
            <h3 style={{ fontFamily: 'var(--font-serif)', margin: '0.4rem 0 1.25rem' }}>Profile Coordinates</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--rule-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Academic Stage:</span>
                <strong>{user?.profile?.stage || 'Undergraduate'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--rule-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Education:</span>
                <strong>{user?.profile?.education || 'Field of Study'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--rule-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Completed Tasks:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{completedTasksCount} / {tasks.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--rule-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Profile Completeness:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{profileCompletion}%</strong>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/settings')}
                style={{ width: '100%', fontSize: '0.82rem' }}
              >
                Edit Complete Dossier →
              </button>
            </div>
          </div>

          {/* Panel B: Quick Skill Addition */}
          <div className="editorial-panel">
            <span className="editorial-kicker">PORTFOLIO EXPANSION</span>
            <h3 style={{ fontFamily: 'var(--font-serif)', margin: '0.4rem 0 0.5rem' }}>Record Competency</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)', marginBottom: '1rem' }}>
              Add newly acquired tools or libraries to immediately re-weight career recommendations.
            </p>

            <form onSubmit={handleAddSkill}>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <input
                  type="text"
                  placeholder="e.g. Python, Docker, SQL"
                  value={newSkillName}
                  onChange={e => setNewSkillName(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, fontSize: '0.82rem' }}>
                  Add Skill
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleManualMatch}
                  disabled={loading}
                  style={{ fontSize: '0.82rem' }}
                >
                  {loading ? 'Re-ranking...' : 'Recalculate'}
                </button>
              </div>
            </form>
          </div>

          {/* Panel C: AI Consultation Room Callout */}
          <div className="editorial-panel" style={{ borderLeft: '4px solid var(--accent-burgundy)' }}>
            <span className="editorial-kicker burgundy">ADVISORY CONSULTATION</span>
            <h3 style={{ fontFamily: 'var(--font-serif)', margin: '0.4rem 0 0.5rem' }}>AI Career Mentor</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
              Conduct context-aware technical interview prep, optimize resume bullet points, or draft cold outreach dispatches with your profile synthesized.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
              <span className="editorial-kicker" style={{ fontSize: '0.62rem' }}>QUICK MENTOR INQUIRIES:</span>
              {[
                'What should I prioritize with my hours this week?',
                'Why is my match score what it is?',
                'How can I improve my project for my portfolio?'
              ].map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="suggested-btn"
                  onClick={() => navigate(`/chat?prompt=${encodeURIComponent(q)}`)}
                  style={{ textAlign: 'left', fontSize: '0.75rem', width: '100%', padding: '0.45rem 0.75rem' }}
                >
                  {q} →
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate('/chat')}
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              Enter Consultation Room →
            </button>
          </div>
        </div>

      </div>

      {/* Role Monograph Inspection Modal */}
      {selectedRoleId && (
        <CareerDetailModal
          roleId={selectedRoleId}
          onClose={() => setSelectedRoleId(null)}
        />
      )}
    </div>
  )
}
