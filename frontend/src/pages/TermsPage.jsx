import { Link } from 'react-router-dom'

export default function TermsPage() {
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
              EDITORIAL DISPATCH : LEGAL MONOGRAPH NO. 02
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/privacy" className="btn-text-link" style={{ fontSize: '0.82rem' }}>
              Privacy Policy
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
            <span className="editorial-kicker burgundy">GOVERNANCE & TERMS OF USAGE</span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', fontWeight: '400', margin: '0.5rem 0 0.75rem', lineHeight: 1.25 }}>
              Terms of Service & Educational Disclosure
            </h1>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-secondary)', letterSpacing: '0.04em' }}>
              EFFECTIVE DATE: OCTOBER 2026 · VERSION 1.0 · EDITORIAL STANDARDS
            </div>
          </header>

          {/* Content */}
          <article style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--ink-primary)' }}>
            <section>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.65rem', color: 'var(--ink-primary)' }}>
                1. Educational Intelligence & Portfolio Intent
              </h2>
              <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
                CareerPath AI is designed and published as an educational and technical career intelligence platform. Our analytical scoring models, curriculum milestone generation routines, and AI advisory features exist to guide academic planning, skill acquisition, and professional interview preparation.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.65rem', color: 'var(--ink-primary)' }}>
                2. Nature of Benchmark Opportunities
              </h2>
              <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
                All role profiles, salary estimates, required competencies, and job market insights surfaced on this platform represent standardized academic and industry benchmarks compiled for educational calibration. They do not constitute active commercial employment offers, hiring guarantees, or legal representation on behalf of commercial entities.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.65rem', color: 'var(--ink-primary)' }}>
                3. AI Advisory Disclaimer
              </h2>
              <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
                Recommendations provided by the AI Career Advisory Desk are generated via algorithmic text models based on context provided in your profile. While our advisory prompts implement proven pedagogical frameworks (including the STAR behavioral interview structure and the Google XYZ resume format), advisory dispatches should be reviewed critically by the user and adapted with independent human judgment.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.65rem', color: 'var(--ink-primary)' }}>
                4. User Responsibilities & Acceptable Use
              </h2>
              <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
                Users agree to utilize CareerPath AI in good faith for personal career growth, education, and professional development. Automated scraping, malicious intrusion attempts, or improper exploitation of local AI endpoints are strictly prohibited under these terms.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.65rem', color: 'var(--ink-primary)' }}>
                5. Alignment with Global Educational Goals
              </h2>
              <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>
                Our operations and software development practices are carried out in conscious support of United Nations Sustainable Development Goal 8 (Decent Work and Economic Growth), seeking to provide transparent, accessible career guidance mechanisms for learners across all economic backgrounds.
              </p>
            </section>

            <section style={{ borderTop: '1px solid var(--rule-subtle)', paddingTop: '1.25rem' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-muted)', margin: 0 }}>
                For legal correspondence or institutional inquiry, contact legal@careerpath.ai.
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
