import { useState, useEffect } from 'react'
import api from '../api/client'
import { useToast } from '../context/ToastContext'
import CareerDetailModal from '../components/CareerDetailModal'

export default function JobsPage() {
  const { addToast } = useToast()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [activeModalRole, setActiveModalRole] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get('/api/careers')
      .then(res => setJobs(res.data.roles || []))
      .catch(() => addToast('Could not load opportunity catalogue.', 'error'))
      .finally(() => setLoading(false))
  }, [addToast])

  const handleToggleSave = async (e, job) => {
    e.stopPropagation()
    try {
      if (job.is_saved) {
        await api.delete(`/api/careers/saved/${job.id}`)
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_saved: false } : j))
        addToast(`Removed ${job.title} from saved opportunities.`, 'info')
      } else {
        await api.post('/api/careers/save', { role_id: job.id })
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_saved: true } : j))
        addToast(`Saved ${job.title} to your targets!`, 'success')
      }
    } catch (err) {
      addToast('Could not update saved status.', 'error')
    }
  }

  const filteredJobs = jobs.filter(job => {
    if (selectedCategory !== 'All' && job.category.toLowerCase() !== selectedCategory.toLowerCase()) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      const haystack = `${job.title} ${job.company} ${job.category} ${job.summary} ${(job.skills || []).join(' ')}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  return (
    <div className="content-container">
      {/* Editorial Header */}
      <header className="editorial-header">
        <div className="editorial-header-top">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="hero-pulsing-dot" />
            <span className="editorial-kicker burgundy">OPPORTUNITY INDEX · BENCHMARK SPECIFICATIONS</span>
          </div>
          <span className="editorial-edition">{filteredJobs.length} PROFILES LISTED</span>
        </div>
        <h1 className="editorial-title">Benchmark Opportunities & Qualifications</h1>
        <p className="editorial-deck">
          Standardized industry specifications to evaluate your market readiness and structure your study trajectory before submitting applications to commercial job boards.
        </p>
      </header>

      {/* Prominent Editorial Disclosure */}
      <div
        style={{
          padding: '1.5rem 1.75rem',
          backgroundColor: 'var(--surface-secondary)',
          borderLeft: '4px solid var(--accent-burgundy)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-subtle)',
          marginBottom: '2.5rem'
        }}
      >
        <span className="editorial-kicker burgundy" style={{ display: 'block', marginBottom: '0.45rem' }}>
          METHODOLOGICAL DISCLOSURE
        </span>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--ink-primary)', lineHeight: '1.65' }}>
          The entries in this repository represent curated industry benchmarks detailing typical requirements, responsibilities, and expected competencies. They do not constitute live employer vacancies, real-time job postings, or employment guarantees.
        </p>
      </div>

      {/* Query & Filter Bar */}
      <section className="editorial-panel inset" style={{ padding: '1.5rem 1.75rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Filter Opportunity Index</label>
            <input
              type="text"
              placeholder="Search by role title, competency, or industry sector..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ backgroundColor: 'var(--surface-primary)' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Domain Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ backgroundColor: 'var(--surface-primary)' }}
            >
              <option value="All">All Categories</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Data & Analytics">Data & Analytics</option>
              <option value="AI / Machine Learning">AI / Machine Learning</option>
              <option value="Design & Product">Design & Product</option>
              <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
              <option value="Security & Defense">Security & Defense</option>
            </select>
          </div>
        </div>
      </section>

      {/* Ranked Opportunities Ledger */}
      <section className="editorial-panel">
        <div className="editorial-panel-header">
          <div>
            <span className="editorial-kicker burgundy">BENCHMARK REPOSITORY</span>
            <h2 className="editorial-panel-title">Role Profiles ({filteredJobs.length})</h2>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--ink-secondary)', fontSize: '0.95rem' }}>
            Retrieving benchmark profiles...
          </div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--ink-secondary)', fontSize: '0.95rem' }}>
            No specifications matched your query.
          </div>
        ) : (
          <div className="ranked-careers-list">
            {filteredJobs.map((job, idx) => (
              <article key={job.id} className="ranked-career-row">
                <div className="rank-num">{(idx + 1).toString().padStart(2, '0')}.</div>

                <div className="career-core">
                  <h3>{job.title}</h3>
                  <div className="career-core-meta">
                    <span>{job.category}</span>
                    <span>·</span>
                    <span>Benchmark: {job.company}</span>
                    <span>·</span>
                    <span>{job.location}</span>
                  </div>

                  <p style={{ margin: '0.5rem 0 0.75rem', fontSize: '0.85rem', color: 'var(--ink-secondary)', lineHeight: 1.55 }}>
                    {job.summary}
                  </p>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {(job.skills || []).slice(0, 4).map(s => (
                      <span key={s} className="editorial-tag">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="match-score-badge">
                  <span className="match-score-val">{job.match_score || 50}%</span>
                  <span className="match-score-label">Readiness</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setActiveModalRole(job.id)}
                    style={{ fontSize: '0.78rem', padding: '0.5rem 1rem' }}
                  >
                    Inspect Role & AI Fit →
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={(e) => handleToggleSave(e, job)}
                    style={{ fontSize: '0.74rem', padding: '0.4rem 0.75rem' }}
                  >
                    {job.is_saved ? 'Target Saved ✓' : 'Save'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Role Monograph Modal */}
      {activeModalRole && (
        <CareerDetailModal
          roleId={activeModalRole}
          onClose={() => setActiveModalRole(null)}
          onSaveToggle={(roleId, isSaved) => {
            setJobs(prev => prev.map(j => j.id === roleId ? { ...j, is_saved: isSaved } : j))
          }}
        />
      )}
    </div>
  )
}
