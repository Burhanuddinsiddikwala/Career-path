import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import api from '../api/client'

const navItems = [
  { idx: '01', label: 'Career Briefing', path: '/dashboard' },
  { idx: '02', label: 'Career Directions', path: '/careers' },
  { idx: '03', label: 'Skills Profile', path: '/skills' },
  { idx: '04', label: 'Opportunity Index', path: '/jobs' },
  { idx: '05', label: 'Learning Roadmap', path: '/roadmap' },
  { idx: '06', label: 'Study Calendar', path: '/calendar' },
  { idx: '07', label: 'Network Ledger', path: '/networking' },
  { idx: '08', label: 'AI Advisory Desk', path: '/chat', highlight: true },
]

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const navigate = useNavigate()
  const [aiStatus, setAiStatus] = useState(null)
  const [showSupport, setShowSupport] = useState(false)

  useEffect(() => {
    api.get('/api/chat/status')
      .then(res => setAiStatus(res.data))
      .catch(() => setAiStatus({ api_online: false, active_mode: 'offline' }))
  }, [])

  return (
    <>
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="brand-wordmark">
              CAREERPATH <span className="brand-suffix">AI</span>
            </span>
            {mobileOpen && (
              <button
                className="modal-close-btn"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                style={{ fontSize: '1.1rem' }}
              >
                ×
              </button>
            )}
          </div>
          <span className="brand-deck">Career Intelligence & Research Desk</span>
        </div>

        <nav className="nav-list" aria-label="Editorial Navigation">
          {navItems.map(({ idx, label, path, highlight }) => (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen && setMobileOpen(false)}
            >
              <span className="nav-idx">{idx}</span>
              <span className="nav-label">{label}</span>
              {highlight && <span className="nav-indicator" title="AI Consultation Active" />}
            </NavLink>
          ))}
        </nav>

        {/* Editorial Profile Tuning Dispatch */}
        <div className="sidebar-dispatch">
          <div className="dispatch-kicker">PROFILE ALIGNMENT</div>
          <h4>Refine Your Targets</h4>
          <p>Update skills, target roles, and baseline experience.</p>
          <button
            type="button"
            onClick={() => {
              navigate('/onboarding')
              if (setMobileOpen) setMobileOpen(false)
            }}
          >
            Open Onboarding Wizard →
          </button>
        </div>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="nav-item"
            onClick={() => setShowSupport(true)}
            style={{ paddingLeft: '0.5rem' }}
          >
            <span className="nav-idx">?</span>
            <span className="nav-label">Methodology & Docs</span>
          </button>
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen && setMobileOpen(false)}
            style={{ paddingLeft: '0.5rem' }}
          >
            <span className="nav-idx">⚙</span>
            <span className="nav-label">Settings & Diagnostics</span>
          </NavLink>
        </div>

        <div className="sidebar-footer">
          <span className={`status-dot ${aiStatus?.api_online ? 'online' : 'offline'}`} />
          <span>
            {aiStatus?.api_online
              ? (aiStatus.active_mode?.startsWith('generative_model')
                  ? (aiStatus.active_mode.includes('gemini') ? 'Gemini AI Active' : 'Ollama AI Active')
                  : 'AI Coach Engine')
              : 'Connecting AI...'}
          </span>
        </div>
      </aside>

      {/* Methodology & Documentation Modal */}
      {showSupport && (
        <div className="modal-backdrop" onClick={() => setShowSupport(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="editorial-kicker burgundy">RESEARCH DESK DOCUMENTATION</span>
                <h3 style={{ marginTop: '0.25rem' }}>Methodology & Platform Reference</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowSupport(false)}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
            <div className="modal-body" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
              <p>
                CareerPath AI provides structured guidance, skill gap analysis, and achievable learning roadmaps aligned with UN Sustainable Development Goal 8 (Decent Work and Economic Growth).
              </p>

              <hr />

              <h4 style={{ fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>
                Editorial Architecture
              </h4>
              <ol style={{ paddingLeft: '1.25rem', margin: '0 0 1.25rem' }}>
                <li style={{ marginBottom: '0.4rem' }}>
                  <strong>Structured Profile Ledger</strong>: Capture baseline academic and vocational competencies.
                </li>
                <li style={{ marginBottom: '0.4rem' }}>
                  <strong>Role Benchmark Profiles</strong>: Reference industry standard requirements without claiming live vacancies.
                </li>
                <li style={{ marginBottom: '0.4rem' }}>
                  <strong>Learning Roadmap</strong>: Convert surfaced skill deficiencies into a 30-day scheduled plan.
                </li>
                <li>
                  <strong>AI Career Assistant</strong>: Context-aware consultation synthesized with profile competencies.
                </li>
              </ol>

              <h4 style={{ fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>
                Transparent AI Engine Operating Modes
              </h4>
              <p style={{ color: 'var(--ink-secondary)', fontSize: '0.8rem' }}>
                The assistant utilizes a transparent fallback hierarchy: Local Ollama inference (if available locally) or Google Gemini API (if key is configured), gracefully backing up to the context-aware Offline Career Coach Engine.
              </p>

              <h4 style={{ fontFamily: 'var(--font-serif)', margin: '1rem 0 0.5rem' }}>
                Methodological Disclosure
              </h4>
              <p style={{ color: 'var(--ink-secondary)', fontSize: '0.8rem' }}>
                Recommendation match signals reflect mathematical profile similarity against benchmark role expectations. They do not constitute hiring probabilities or employment guarantees.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowSupport(false)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
