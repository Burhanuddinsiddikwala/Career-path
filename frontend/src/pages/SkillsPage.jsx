import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function SkillsPage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const { addToast } = useToast()

  const [skills, setSkills] = useState([])
  const [roles, setRoles] = useState([])
  const [selectedTargetRole, setSelectedTargetRole] = useState('')
  const [roleGap, setRoleGap] = useState(null)
  const [suggestions, setSuggestions] = useState({})
  const [loading, setLoading] = useState(true)

  // Add skill form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [skillName, setSkillName] = useState('')
  const [proficiency, setProficiency] = useState(70)
  const [category, setCategory] = useState('Software Engineering')
  const [yearsExp, setYearsExp] = useState(1.0)
  const [submitting, setSubmitting] = useState(false)

  // Inline editing state
  const [editingId, setEditingId] = useState(null)
  const [editProficiency, setEditProficiency] = useState(70)

  const loadData = async () => {
    setLoading(true)
    try {
      const [skillsRes, rolesRes, suggRes] = await Promise.all([
        api.get('/api/skills'),
        api.get('/api/careers'),
        api.get('/api/skills/suggestions')
      ])
      setSkills(skillsRes.data.skills || [])
      const roleList = rolesRes.data.roles || []
      setRoles(roleList)
      setSuggestions(suggRes.data.categories || {})

      if (roleList.length > 0 && !selectedTargetRole) {
        setSelectedTargetRole(roleList[0].id)
      }
    } catch (err) {
      addToast('Could not load skills data.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!selectedTargetRole) return
    api.get(`/api/careers/${selectedTargetRole}/gap`)
      .then(res => setRoleGap(res.data))
      .catch(() => setRoleGap(null))
  }, [selectedTargetRole, skills])

  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (!skillName.trim()) return

    setSubmitting(true)
    try {
      await api.post('/api/skills', {
        skill_name: skillName.trim(),
        proficiency,
        category,
        years_exp: yearsExp
      })
      addToast(`Recorded "${skillName}" in your competencies.`, 'success')
      setSkillName('')
      setShowAddForm(false)
      loadData()
      if (refreshUser) refreshUser()
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to record competency.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickAdd = async (name, cat) => {
    try {
      await api.post('/api/skills', {
        skill_name: name,
        proficiency: 65,
        category: cat,
        years_exp: 1.0
      })
      addToast(`Added "${name}" to your profile.`, 'success')
      loadData()
      if (refreshUser) refreshUser()
    } catch (err) {
      addToast(err.response?.data?.error || 'Skill already present.', 'info')
    }
  }

  const handleUpdateProficiency = async (skillId) => {
    try {
      await api.put(`/api/skills/${skillId}`, { proficiency: editProficiency })
      addToast('Proficiency calibration saved.', 'success')
      setEditingId(null)
      loadData()
      if (refreshUser) refreshUser()
    } catch (err) {
      addToast('Could not update proficiency.', 'error')
    }
  }

  const handleDeleteSkill = async (skillId, name) => {
    if (!window.confirm(`Are you sure you wish to remove "${name}" from your verified competencies?`)) return
    try {
      await api.delete(`/api/skills/${skillId}`)
      addToast(`Removed "${name}" from profile.`, 'info')
      loadData()
      if (refreshUser) refreshUser()
    } catch (err) {
      addToast('Failed to remove skill.', 'error')
    }
  }

  return (
    <div className="content-container">
      {/* Editorial Header */}
      <header className="editorial-header">
        <div className="editorial-header-top">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="hero-pulsing-dot" />
            <span className="editorial-kicker burgundy">YOUR PROFESSIONAL PROFILE · COMPETENCY LEDGER</span>
          </div>
          <span className="editorial-edition">{skills.length} VERIFIED COMPETENCIES</span>
        </div>
        <h1 className="editorial-title">Technical & Vocational Competencies</h1>
        <p className="editorial-deck">
          Curate your technical capabilities, calibrate proficiency levels, and evaluate competency coverage against any benchmark role specification.
        </p>
      </header>

      {/* Main 2-Column Editorial Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.75fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Competency Ledger Table & Add Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section className="editorial-panel">
            <div className="editorial-panel-header">
              <div>
                <span className="editorial-kicker burgundy">LEDGER ENTRIES</span>
                <h2 className="editorial-panel-title">Recorded Skills ({skills.length})</h2>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowAddForm(!showAddForm)}
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.95rem' }}
              >
                {showAddForm ? 'Cancel Entry' : 'Record New Competency +'}
              </button>
            </div>

            {/* Add Competency Drawer */}
            {showAddForm && (
              <form onSubmit={handleAddSkill} style={{ padding: '1.5rem', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--rule-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.75rem', boxShadow: 'var(--shadow-subtle)' }}>
                <span className="editorial-kicker burgundy" style={{ marginBottom: '0.75rem', display: 'block' }}>NEW COMPETENCY REGISTRATION</span>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Competency / Tool Name</label>
                    <input
                      type="text"
                      placeholder="e.g. React, PostgreSQL, Docker"
                      value={skillName}
                      onChange={e => setSkillName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Data & Analytics">Data & Analytics</option>
                      <option value="AI / Machine Learning">AI / Machine Learning</option>
                      <option value="Design & UX">Design & UX</option>
                      <option value="DevOps & Cloud">DevOps & Cloud</option>
                      <option value="Security">Security</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Self-Calibrated Proficiency ({proficiency}%)</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={proficiency}
                      onChange={e => setProficiency(Number(e.target.value))}
                      style={{ accentColor: 'var(--accent-burgundy)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Years of Application</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="20"
                      value={yearsExp}
                      onChange={e => setYearsExp(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1rem' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>
                    Dismiss
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Record to Profile →'}
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--ink-secondary)', fontSize: '0.95rem' }}>
                Loading competency profile...
              </div>
            ) : skills.length === 0 ? (
              <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--ink-secondary)', fontSize: '0.95rem' }}>
                No competencies recorded yet. Click "Record New Competency" above or add suggested skills below.
              </div>
            ) : (
              <div className="editorial-table-wrap">
                <table className="editorial-table">
                  <thead>
                    <tr>
                      <th>Competency</th>
                      <th>Category</th>
                      <th style={{ width: '32%' }}>Proficiency</th>
                      <th>Experience</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skills.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <strong style={{ fontSize: '0.92rem', color: 'var(--ink-primary)' }}>{s.skill_name}</strong>
                        </td>
                        <td style={{ color: 'var(--ink-secondary)', fontSize: '0.82rem' }}>
                          {s.category || 'General'}
                        </td>
                        <td>
                          {editingId === s.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <input
                                type="range"
                                min="10"
                                max="100"
                                step="5"
                                value={editProficiency}
                                onChange={e => setEditProficiency(Number(e.target.value))}
                                style={{ accentColor: 'var(--accent-burgundy)', width: '110px' }}
                              />
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600 }}>{editProficiency}%</span>
                              <button
                                type="button"
                                className="btn-primary"
                                onClick={() => handleUpdateProficiency(s.id)}
                                style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.proficiency || 60}%</span>
                              </div>
                              <div className="progress-track" style={{ height: '6px' }}>
                                <div
                                  className="progress-fill"
                                  style={{ width: `${Math.min(100, Math.max(10, s.proficiency || 60))}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--ink-secondary)' }}>
                          {s.years_exp ? `${s.years_exp} yrs` : '1.0 yr'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => {
                                setEditingId(s.id)
                                setEditProficiency(s.proficiency || 60)
                              }}
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
                            >
                              Calibrate
                            </button>
                            <button
                              type="button"
                              className="btn-danger-outline"
                              onClick={() => handleDeleteSkill(s.id, s.skill_name)}
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Quick-Add Suggestions */}
          <section className="editorial-panel inset">
            <span className="editorial-kicker burgundy">CURATED SUGGESTIONS</span>
            <h3 style={{ fontFamily: 'var(--font-serif)', margin: '0.4rem 0 0.85rem' }}>
              Common Domain Competencies
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)', marginBottom: '1.25rem' }}>
              Select any competency chip below to instantly add it to your profile ledger at baseline proficiency:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {Object.entries(suggestions).map(([catName, skillList]) => (
                <div key={catName}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--ink-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                    {catName}
                  </div>
                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                    {skillList.map(s => {
                      const alreadyHave = skills.some(sk => sk.skill_name.toLowerCase() === s.toLowerCase())
                      if (alreadyHave) return null
                      return (
                        <button
                          key={s}
                          type="button"
                          className="landing-preset-btn"
                          onClick={() => handleQuickAdd(s, catName)}
                        >
                          + {s}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Benchmark Gap Analysis */}
        <div>
          <section className="editorial-panel" style={{ borderTop: '4px solid var(--accent-burgundy)' }}>
            <span className="editorial-kicker burgundy">BENCHMARK GAP ANALYSIS</span>
            <h3 style={{ fontFamily: 'var(--font-serif)', margin: '0.4rem 0 1rem' }}>
              Role Competency Benchmark
            </h3>

            <div className="form-group">
              <label>Select Target Specification</label>
              <select
                value={selectedTargetRole}
                onChange={e => setSelectedTargetRole(e.target.value)}
                style={{ width: '100%' }}
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.category})
                  </option>
                ))}
              </select>
            </div>

            {roleGap && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--surface-secondary)',
                    borderLeft: '4px solid var(--accent-olive)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-subtle)'
                  }}
                >
                  <div>
                    <span className="editorial-kicker" style={{ color: 'var(--accent-olive)' }}>COVERAGE SIGNAL</span>
                    <div style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                      {roleGap.coverage_percentage || 0}% of core role requirements covered
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-olive)' }}>
                    {roleGap.coverage_percentage || 0}%
                  </span>
                </div>

                <div>
                  <span className="editorial-kicker" style={{ color: 'var(--accent-olive)', display: 'block', marginBottom: '0.4rem' }}>
                    MATCHED COMPETENCIES ({roleGap.matched?.length || 0})
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {roleGap.matched?.length ? (
                      roleGap.matched.map(s => <span key={s} className="editorial-tag matched">{s}</span>)
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>No core competencies match this specification yet.</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="editorial-kicker" style={{ color: 'var(--accent-terracotta)', display: 'block', marginBottom: '0.4rem' }}>
                    DEFICIENCIES TO ACQUIRE ({roleGap.missing?.length || 0})
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {roleGap.missing?.length ? (
                      roleGap.missing.map(s => <span key={s} className="editorial-tag missing">{s}</span>)
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent-olive)', fontWeight: 600 }}>Complete core competency coverage achieved!</span>
                    )}
                  </div>
                </div>

                {/* AI Competency Demonstration Guidance */}
                <div
                  style={{
                    padding: '1.15rem',
                    backgroundColor: 'var(--surface-primary)',
                    border: '1px solid var(--rule-subtle)',
                    borderLeft: '3px solid var(--accent-burgundy)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <span className="editorial-kicker burgundy" style={{ fontSize: '0.68rem', display: 'block', marginBottom: '0.35rem' }}>
                    AI MENTOR OBSERVATION · DEMONSTRATED VS LISTED
                  </span>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--ink-secondary)', lineHeight: 1.55 }}>
                    Self-assessed proficiencies establish your baseline. Technical hiring managers specifically look for <strong style={{ color: 'var(--ink-primary)' }}>demonstrated competencies</strong> backed by deployed applications and active code repositories.
                  </p>

                  {roleGap.missing?.length > 0 && (
                    <div style={{ marginTop: '0.85rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-muted)', display: 'block', marginBottom: '0.4rem' }}>
                        Inquire Mentor On Closing Specific Gaps:
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {roleGap.missing.slice(0, 3).map(missingSkill => {
                          const roleObj = roles.find(r => r.id === selectedTargetRole)
                          const roleTitle = roleObj?.title || 'Target Role'
                          const inquiryPrompt = `How do I build a practical portfolio project to demonstrate ${missingSkill} for a ${roleTitle}?`
                          return (
                            <button
                              key={missingSkill}
                              type="button"
                              className="btn-text-link"
                              onClick={() => navigate(`/chat?prompt=${encodeURIComponent(inquiryPrompt)}`)}
                              style={{
                                textAlign: 'left',
                                fontSize: '0.76rem',
                                color: 'var(--accent-burgundy)',
                                padding: '0.3rem 0',
                                borderBottom: '1px dashed var(--rule-subtle)'
                              }}
                            >
                              → Project idea to demonstrate {missingSkill}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '0.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--rule-subtle)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      const roleObj = roles.find(r => r.id === selectedTargetRole)
                      const roleTitle = roleObj?.title || 'Target Role'
                      const prompt = `I have a ${roleGap.coverage_percentage || 0}% match for ${roleTitle}. My missing competencies are: ${(roleGap.missing || []).join(', ')}. Which gap should I prioritize first and why?`
                      navigate(`/chat?prompt=${encodeURIComponent(prompt)}`)
                    }}
                    style={{ width: '100%', fontSize: '0.82rem' }}
                  >
                    Consult AI Mentor on Prioritizing Gaps →
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={async () => {
                      if (!selectedTargetRole) return
                      try {
                        const res = await api.post('/api/roadmap/generate', { role_id: selectedTargetRole })
                        addToast(res.data.message || 'Roadmap generated!', 'success')
                        navigate('/roadmap')
                      } catch (err) {
                        addToast('Failed to generate roadmap.', 'error')
                      }
                    }}
                    style={{ width: '100%', fontSize: '0.82rem' }}
                  >
                    Generate Targeted Study Roadmap →
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  )
}
