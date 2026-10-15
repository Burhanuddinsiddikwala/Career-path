import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/client'
import { useToast } from '../context/ToastContext'
import CareerDetailModal from '../components/CareerDetailModal'

const CATEGORIES = [
  'All',
  'Software Engineering',
  'Data & Analytics',
  'AI / Machine Learning',
  'Design & Product',
  'Cloud & Infrastructure',
  'Security & Defense'
]

export default function CareersPage() {
  const [searchParams] = useSearchParams()
  const { addToast } = useToast()

  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [experienceFilter, setExperienceFilter] = useState('All')
  const [sortBy, setSortBy] = useState('match')
  const [activeModalRole, setActiveModalRole] = useState(null)

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam) {
      setActiveModalRole(roleParam)
    }
  }, [searchParams])

  const loadRoles = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/careers')
      setRoles(res.data.roles || [])
    } catch (err) {
      addToast('Failed to load career paths.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoles()
  }, [])

  const handleToggleSave = async (e, role) => {
    e.stopPropagation()
    try {
      if (role.is_saved) {
        await api.delete(`/api/careers/saved/${role.id}`)
        setRoles(prev => prev.map(r => r.id === role.id ? { ...r, is_saved: false } : r))
        addToast(`Removed ${role.title} from saved targets.`, 'info')
      } else {
        await api.post('/api/careers/save', { role_id: role.id })
        setRoles(prev => prev.map(r => r.id === role.id ? { ...r, is_saved: true } : r))
        addToast(`Saved ${role.title} to your targets!`, 'success')
      }
    } catch (err) {
      addToast('Failed to update saved status.', 'error')
    }
  }

  const filteredRoles = roles.filter(role => {
    if (selectedCategory !== 'All' && role.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false
    }
    if (experienceFilter !== 'All' && !role.experience_level.toLowerCase().includes(experienceFilter.toLowerCase())) {
      return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const haystack = `${role.title} ${role.category} ${role.summary} ${(role.skills || []).join(' ')}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  }).sort((a, b) => {
    if (sortBy === 'match') return (b.match_score || 50) - (a.match_score || 50)
    if (sortBy === 'title') return a.title.localeCompare(b.title)
    return 0
  })

  return (
    <div className="content-container">
      {/* Editorial Page Header */}
      <header className="editorial-header">
        <div className="editorial-header-top">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="hero-pulsing-dot" />
            <span className="editorial-kicker burgundy">CANONICAL CAREER CATALOGUE</span>
          </div>
          <span className="editorial-edition">INDEXED SPECIFICATIONS · 12 BENCHMARKS</span>
        </div>
        <h1 className="editorial-title">Explore Career Directions & Role Profiles</h1>
        <p className="editorial-deck">
          Vetted role specifications with standard industry requirements, required core competencies, and verified educational documentation. Profiles serve as benchmark specifications, not commercial job advertisements.
        </p>
      </header>

      {/* Filter and Query Console */}
      <section className="editorial-panel inset" style={{ padding: '1.5rem 1.75rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1.25rem', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Search Repository</label>
            <input
              type="text"
              placeholder="Search by title, competency, or keyword..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ backgroundColor: 'var(--surface-primary)' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Experience Filter</label>
            <select
              value={experienceFilter}
              onChange={e => setExperienceFilter(e.target.value)}
              style={{ backgroundColor: 'var(--surface-primary)' }}
            >
              <option value="All">All Experience Levels</option>
              <option value="Internship">Internship</option>
              <option value="Entry-level">Entry-level</option>
              <option value="Mid-level">Mid-level</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ backgroundColor: 'var(--surface-primary)' }}
            >
              <option value="match">Match Signal (Highest First)</option>
              <option value="title">Alphabetical (Title A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--rule-subtle)' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              className={selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setSelectedCategory(cat)}
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.95rem', borderRadius: 'var(--radius-pill)' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Ranked Editorial Roles List */}
      <section className="editorial-panel">
        <div className="editorial-panel-header">
          <div>
            <span className="editorial-kicker burgundy">CATALOGUE ENTRIES</span>
            <h2 className="editorial-panel-title">Role Profiles ({filteredRoles.length})</h2>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--ink-secondary)', fontSize: '0.95rem' }}>
            Retrieving catalogue entries...
          </div>
        ) : filteredRoles.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--ink-secondary)', fontSize: '0.95rem' }}>
            No roles matched your search criteria. Try broadening your filter parameters.
          </div>
        ) : (
          <div className="ranked-careers-list">
            {filteredRoles.map((role, idx) => (
              <article key={role.id} className="ranked-career-row">
                <div className="rank-num">{(idx + 1).toString().padStart(2, '0')}.</div>

                <div className="career-core">
                  <h3>{role.title}</h3>
                  <div className="career-core-meta">
                    <span>{role.category}</span>
                    <span>·</span>
                    <span>{role.experience_level}</span>
                    <span>·</span>
                    <span>{role.location}</span>
                  </div>

                  <p style={{ margin: '0.5rem 0 0.75rem', fontSize: '0.85rem', color: 'var(--ink-secondary)', lineHeight: 1.55 }}>
                    {role.summary}
                  </p>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {(role.skills || []).slice(0, 5).map(skill => (
                      <span key={skill} className="editorial-tag">{skill}</span>
                    ))}
                    {(role.skills || []).length > 5 && (
                      <span style={{ fontSize: '0.74rem', color: 'var(--ink-muted)', alignSelf: 'center' }}>
                        +{role.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="match-score-badge">
                  <span className="match-score-val">{role.match_score || 50}%</span>
                  <span className="match-score-label">Alignment</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setActiveModalRole(role.id)}
                    style={{ fontSize: '0.78rem', padding: '0.5rem 1rem' }}
                  >
                    Inspect Role & AI Fit →
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={(e) => handleToggleSave(e, role)}
                    style={{ fontSize: '0.74rem', padding: '0.4rem 0.75rem' }}
                  >
                    {role.is_saved ? 'Target Saved ✓' : 'Save'}
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
            setRoles(prev => prev.map(r => r.id === roleId ? { ...r, is_saved: isSaved } : r))
          }}
        />
      )}
    </div>
  )
}
