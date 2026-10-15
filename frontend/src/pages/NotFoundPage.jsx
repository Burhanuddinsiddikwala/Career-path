import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="auth-wrapper">
      <div className="auth-panel text-center" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <div className="sidebar-monogram" style={{ margin: '0 auto 1rem', width: '36px', height: '36px' }}>
            CP
          </div>
          <span className="panel-kicker">ERROR 404 · MONOGRAPH NOT FOUND</span>
          <h1 className="editorial-title" style={{ fontSize: '2rem', marginTop: '0.5rem' }}>
            Catalogue Reference Missing
          </h1>
          <p className="auth-subtitle">
            The career trajectory or documentation page requested does not exist or has been archived.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Link to="/dashboard" className="btn-primary" style={{ justifyContent: 'center' }}>
            Return to Career Briefing →
          </Link>
          <Link to="/" className="btn-secondary" style={{ justifyContent: 'center' }}>
            Return to Dispatch Masthead
          </Link>
        </div>

        <div className="auth-footer" style={{ marginTop: '2rem' }}>
          CAREERPATH AI · THE EDITORIAL CAREER INTELLIGENCE PLATFORM
        </div>
      </div>
    </div>
  )
}
