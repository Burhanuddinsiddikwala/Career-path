import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useToast } from '../context/ToastContext'

export default function CareerDetailModal({ roleId, onClose, onSaveToggle }) {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [roleAdvice, setRoleAdvice] = useState(null)
  const [loadingAdvice, setLoadingAdvice] = useState(false)
  const [addedTasks, setAddedTasks] = useState({})

  useEffect(() => {
    if (!roleId) return
    setLoading(true)
    api.get(`/api/careers/${roleId}`)
      .then(res => setRole(res.data.role))
      .catch(err => {
        addToast(err.response?.data?.error || 'Failed to load career details', 'error')
        onClose()
      })
      .finally(() => setLoading(false))

    const token = localStorage.getItem('careerpath_token')
    if (token) {
      setLoadingAdvice(true)
      api.post('/api/chat/role-advice', { role_id: roleId })
        .then(res => setRoleAdvice(res.data))
        .catch(() => setRoleAdvice(null))
        .finally(() => setLoadingAdvice(false))
    } else {
      setRoleAdvice({
        is_guest: true,
        advice: 'Create an authenticated profile or sign in to generate personalized AI mentor fit analysis calibrated against your verified competencies.',
        actions: []
      })
    }
  }, [roleId, addToast, onClose])

  if (!roleId) return null

  const handleToggleSave = async () => {
    if (!role) return
    setSaving(true)
    try {
      if (role.is_saved) {
        await api.delete(`/api/careers/saved/${role.id}`)
        setRole(prev => ({ ...prev, is_saved: false }))
        addToast(`Removed ${role.title} from saved targets.`, 'info')
        if (onSaveToggle) onSaveToggle(role.id, false)
      } else {
        await api.post('/api/careers/save', { role_id: role.id })
        setRole(prev => ({ ...prev, is_saved: true }))
        addToast(`Saved ${role.title} to your targets!`, 'success')
        if (onSaveToggle) onSaveToggle(role.id, true)
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Could not update saved status.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateRoadmap = async () => {
    if (!role) return
    setGenerating(true)
    try {
      const res = await api.post('/api/roadmap/generate', { role_id: role.id })
      addToast(res.data.message || 'Roadmap generated!', 'success')
      onClose()
      navigate('/roadmap')
    } catch (err) {
      addToast(err.response?.data?.error || 'Could not generate roadmap.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const handleCreateRoadmapTask = async (action) => {
    if (!action?.payload) return
    const key = action.payload.title
    try {
      await api.post('/api/roadmap/tasks', action.payload)
      setAddedTasks(prev => ({ ...prev, [key]: true }))
      addToast(`Added "${action.payload.title}" to your learning roadmap!`, 'success')
    } catch (err) {
      addToast(err.response?.data?.error || 'Could not add milestone.', 'error')
    }
  }

  const handleAskMentor = () => {
    onClose()
    const prompt = `How should I structure my preparation for ${role.title} given my current competencies and available study hours?`
    navigate(`/chat?prompt=${encodeURIComponent(prompt)}`)
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{ width: 'min(760px, 96vw)' }}
      >
        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--ink-secondary)', fontSize: '0.95rem' }}>
            Retrieving role specification monograph...
          </div>
        ) : role ? (
          <>
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="editorial-kicker burgundy">SPECIFICATION MONOGRAPH</span>
                  <span className="editorial-tag">{role.category}</span>
                  <span className="editorial-tag">{role.location}</span>
                  <span className="editorial-tag">{role.experience_level}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', margin: 0, color: 'var(--ink-primary)' }}>
                  {role.title}
                </h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', fontSize: '0.9rem' }}>
              {/* Match Signal Indicator Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  padding: '1.25rem 1.5rem',
                  backgroundColor: 'var(--surface-secondary)',
                  borderLeft: '4px solid var(--accent-burgundy)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-subtle)'
                }}
              >
                <div style={{ textAlign: 'center', minWidth: '70px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent-burgundy)', lineHeight: 1 }}>
                    {Math.round(role.match_score || 0)}%
                  </div>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>
                    Match Signal
                  </div>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.92rem', marginBottom: '0.25rem', color: 'var(--ink-primary)' }}>
                    Alignment Rationale
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
                    {role.explanation || 'Calculated against your recorded competencies and stated interests.'}
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div>
                <span className="editorial-kicker">01 / ROLE OVERVIEW</span>
                <p style={{ marginTop: '0.5rem', lineHeight: '1.7', color: 'var(--ink-primary)' }}>
                  {role.summary}
                </p>
              </div>

              {/* Responsibilities */}
              {role.responsibilities?.length > 0 && (
                <div>
                  <span className="editorial-kicker">02 / CORE RESPONSIBILITIES</span>
                  <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0 0', lineHeight: '1.7', color: 'var(--ink-secondary)' }}>
                    {role.responsibilities.map((resp, i) => (
                      <li key={i} style={{ marginBottom: '0.4rem' }}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required & Missing Skills */}
              <div>
                <span className="editorial-kicker">03 / COMPETENCY PROFILE COVERAGE</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '0.65rem' }}>
                  <div style={{ padding: '1.15rem', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--rule-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-olive)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.65rem' }}>
                      Competencies Covered ({role.matched_skills?.length || 0})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {role.matched_skills?.length ? (
                        role.matched_skills.map(s => <span key={s} className="editorial-tag matched">{s}</span>)
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>No matching core competencies logged yet.</span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '1.15rem', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--rule-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-terracotta)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.65rem' }}>
                      Priority Competencies to Acquire ({role.missing_skills?.length || 0})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {role.missing_skills?.length ? (
                        role.missing_skills.map(s => <span key={s} className="editorial-tag missing">{s}</span>)
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-olive)', fontWeight: 500 }}>Full competency coverage achieved!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Career Mentor Evaluation */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                  <span className="editorial-kicker burgundy">04 / AI CAREER MENTOR EVALUATION & STRATEGY</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)' }}>AUTHENTIC ADVISORY BRIEFING</span>
                </div>

                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--rule-subtle)',
                    borderLeft: '4px solid var(--accent-burgundy)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-subtle)'
                  }}
                >
                  {loadingAdvice ? (
                    <div style={{ padding: '1.5rem 0', textAlign: 'center', fontSize: '0.85rem', color: 'var(--ink-secondary)' }}>
                      Synthesizing personalized mentor evaluation with your profile coordinates...
                    </div>
                  ) : roleAdvice ? (
                    <div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--ink-primary)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                        {roleAdvice.advice}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--rule-subtle)' }}>
                        {roleAdvice.actions?.map((act, actIdx) => {
                          if (act.type === 'create_task') {
                            const isAdded = addedTasks[act.payload?.title]
                            return (
                              <button
                                key={actIdx}
                                type="button"
                                className={isAdded ? 'btn-secondary' : 'btn-primary'}
                                disabled={isAdded}
                                onClick={() => handleCreateRoadmapTask(act)}
                                style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}
                              >
                                {isAdded ? '✓ Milestone Added to Roadmap' : act.label}
                              </button>
                            )
                          }
                          return null
                        })}
                        {roleAdvice.is_guest ? (
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => {
                              onClose()
                              navigate('/login')
                            }}
                            style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}
                          >
                            Sign In to Access AI Mentor →
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleAskMentor}
                            style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}
                          >
                            Inquire Further in Consultation Room →
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)' }}>
                      Mentor evaluation currently unavailable. You can consult the AI Mentor in the advisory room anytime.
                    </div>
                  )}
                </div>
              </div>

              {/* Learning Milestones */}
              {role.learning?.length > 0 && (
                <div>
                  <span className="editorial-kicker">05 / CURATED STUDY MILESTONES</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.65rem' }}>
                    {role.learning.map((step, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '0.85rem',
                          padding: '0.85rem 1rem',
                          backgroundColor: 'var(--surface-secondary)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--rule-subtle)'
                        }}
                      >
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-burgundy)', fontWeight: 700 }}>
                          {(idx + 1).toString().padStart(2, '0')}.
                        </span>
                        <div>
                          <strong style={{ fontSize: '0.92rem', color: 'var(--ink-primary)' }}>{step}</strong>
                          <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'var(--ink-secondary)' }}>
                            Practical deliverable milestone to substantiate competency in your portfolio.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Learning Resources */}
              {role.resources?.length > 0 && (
                <div>
                  <span className="editorial-kicker">06 / VERIFIED DOCUMENTATION REFERENCES</span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--ink-secondary)', margin: '0.35rem 0 0.65rem' }}>
                    External references to official technical documentation and canonical guides:
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    {role.resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{ fontSize: '0.8rem', justifyContent: 'space-between', padding: '0.55rem 0.85rem' }}
                      >
                        <span>{res.label}</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleToggleSave}
                disabled={saving}
              >
                {role.is_saved ? 'Target Saved ✓' : 'Save to Targets'}
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleGenerateRoadmap}
                  disabled={generating}
                >
                  {generating ? 'Generating Milestones...' : 'Generate 30-Day Roadmap →'}
                </button>
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Dismiss
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
