import { Link } from 'react-router-dom'

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-paper)', color: 'var(--ink-primary)', padding: '2.5rem 1.5rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        {/* Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--rule-subtle)', paddingBottom: '1.25rem', marginBottom: '2.5rem' }}>
          <div>
            <Link to="/" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: '700', letterSpacing: '0.02em', color: 'var(--accent-burgundy)', textDecoration: 'none' }}>
              CAREERPATH <span style={{ color: 'var(--ink-primary)', fontSize: '0.9rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>AI</span>
            </Link>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginTop: '2px' }}>
              EDITORIAL DISPATCH : LEGAL MONOGRAPH NO. 01
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/terms" className="btn-text-link" style={{ fontSize: '0.82rem' }}>
              Terms of Service
            </Link>
            <Link to="/login" className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem' }}>
              Access Platform →
            </Link>
          </div>
        </div>

        {/* Content Container */}
        <div style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--rule-subtle)', borderRadius: 'var(--radius-xl)', padding: '3rem 2.5rem', boxShadow: 'var(--shadow-card)' }}>
          {/* Header */}
          <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--rule-subtle)', paddingBottom: '1.75rem' }}>
            <span className="editorial-kicker burgundy">DATA PROTECTION & INTEGRITY DECLARATION</span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', fontWeight: '400', margin: '0.5rem 0 0.75rem', lineHeight: 1.25 }}>
              Privacy Policy & Data Sovereignty
            </h1>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-secondary)', letterSpacing: '0.04em' }}>
              EFFECTIVE DATE: OCTOBER 2026 · VERSION 1.0 · GOVERNANCE DESK
            </div>
          </header>

          {/* Content */}
          <article style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--ink-primary)' }}>
            <section>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.65rem', color: 'var(--ink-primary)' }}>
                1. Sovereign Architecture & Data Storage
              </h2>
              <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
                CareerPath AI operates on an isolated, user-first architecture. All user profile records, skill calibrations, customized 30-day learning curricula, study calendar events, and professional networking ledgers are persisted in an isolated local database schema. We do not sell, rent, or distribute your personal profile data, academic records, or professional goals to third-party data brokers, advertisers, or corporate recruiters.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.65rem', color: 'var(--ink-primary)' }}>
                2. Authentication & Session Security
              </h2>
              <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
                User access is secured via industry-standard cryptographic password hashing (bcrypt / PBKDF2) and stateless JSON Web Tokens (JWT). We do not store plaintext credentials. Session tokens are transmitted over encrypted HTTPS channels in production and are strictly restricted to authenticated API routes.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.65rem', color: 'var(--ink-primary)' }}>
                3. AI Advisory Processing & Confidentiality
              </h2>
              <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
                When you consult the AI Career Advisory Desk, your prompts and contextual profile parameters (such as your stated career target and missing competencies) are processed either locally on your host environment via an Ollama instance, or via our private backend coach engine. Your advisory dialogues are never utilized to train third-party foundation models without explicit consent.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.65rem', color: 'var(--ink-primary)' }}>
                4. Zero Telemetry & Tracking Restrictions
              </h2>
              <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
                We firmly reject the modern surveillance web. CareerPath AI does not embed third-party tracking pixels, behavioural analytics trackers, invasive heat-maps, or cross-site advertising cookies. All interface state operates strictly between your browser client and our verified application backend.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.65rem', color: 'var(--ink-primary)' }}>
                5. Profile Autonomy & Complete Erasure
              </h2>
              <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
                You maintain total dominion over your professional data. Within your account Settings, you may calibrate your information or execute a complete profile purge at any time. Selecting the Danger Zone reset action immediately wipes your roadmap tasks, consultation transcripts, and networking contacts from the active database.
              </p>
            </section>

            <section style={{ borderTop: '1px solid var(--rule-subtle)', paddingTop: '1.25rem' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-muted)', margin: 0 }}>
                Inquiries regarding data governance or system architecture may be directed to the editorial engineering desk at privacy@careerpath.ai.
              </p>
            </section>
          </article>
        </div>

        {/* Footer */}
        <footer style={{ marginTop: '2.5rem', borderTop: '1px solid var(--rule-subtle)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-secondary)' }}>
          <span>CAREERPATH AI · EDITORIAL CAREER INTELLIGENCE</span>
          <Link to="/" style={{ color: 'var(--accent-burgundy)', textDecoration: 'none', fontWeight: 600 }}>
            ← Return to Cover Dispatch
          </Link>
        </footer>
      </div>
    </div>
  )
}
