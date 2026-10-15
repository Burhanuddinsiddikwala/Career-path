import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import TaskModal from '../components/TaskModal'

export default function RoadmapPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, completion_pct: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [generating, setGenerating] = useState(false)

  const weeklyHours = user?.profile?.weekly_hours || 10
  const learningStyle = user?.profile?.learning_style || 'Hands-on Projects'

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const loadTasks = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/roadmap/tasks')
      setTasks(res.data.tasks || [])
      setStats(res.data.stats || { total: 0, completed: 0, pending: 0, completion_pct: 0 })
    } catch (err) {
      addToast('Could not load roadmap milestones.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      await api.put(`/api/roadmap/tasks/${task.id}`, { status: nextStatus })
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t))
      const nextCompleted = nextStatus === 'completed' ? stats.completed + 1 : Math.max(0, stats.completed - 1)
      const nextPending = stats.total - nextCompleted
      setStats({
        ...stats,
        completed: nextCompleted,
        pending: nextPending,
        completion_pct: stats.total > 0 ? Math.round((nextCompleted / stats.total) * 100) : 0
      })
      addToast(`Milestone marked as ${nextStatus}.`, 'success')
    } catch (err) {
      addToast('Failed to update milestone status.', 'error')
    }
  }

  const handleDeleteTask = async (id, title) => {
    if (!window.confirm(`Delete milestone "${title}"?`)) return
    try {
      await api.delete(`/api/roadmap/tasks/${id}`)
      addToast('Milestone deleted.', 'info')
      loadTasks()
    } catch (err) {
      addToast('Failed to delete milestone.', 'error')
    }
  }

  const handleGenerateRoadmap = async () => {
    setGenerating(true)
    try {
      const res = await api.post('/api/roadmap/generate', {})
      addToast(res.data.message || 'Personalized roadmap generated!', 'success')
      loadTasks()
    } catch (err) {
      addToast(err.response?.data?.error || 'Could not generate roadmap.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const filteredTasks = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (priorityFilter !== 'all' && t.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false
    return true
  })

  return (
    <div className="content-container">
      {/* Editorial Header */}
      <header className="editorial-header">
        <div className="editorial-header-top">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="hero-pulsing-dot" />
            <span className="editorial-kicker burgundy">LEARNING EDITION · 30-DAY STRUCTURED CURRICULUM</span>
          </div>
          <span className="editorial-edition">{stats.completed} / {stats.total} COMPLETED</span>
        </div>
        <h1 className="editorial-title">Structured Learning Roadmap & Study Plan</h1>
        <p className="editorial-deck">
          Sequenced technical milestones structured to remediate identified competency gaps and produce tangible portfolio deliverables.
        </p>
      </header>

      {/* Progress & Overview Dashboard */}
      <section className="editorial-panel inset" style={{ padding: '1.75rem 2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--ink-primary)' }}>Curriculum Completion Progress</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-burgundy)', fontSize: '1rem' }}>{stats.completion_pct}%</strong>
            </div>
            <div className="progress-track" style={{ height: '10px' }}>
              <div className="progress-fill" style={{ width: `${stats.completion_pct}%` }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'flex-end', fontSize: '0.85rem' }}>
            <div>
              <span className="editorial-kicker" style={{ fontSize: '0.68rem' }}>TOTAL</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700 }}>
                {stats.total.toString().padStart(2, '0')}
              </div>
            </div>
            <div>
              <span className="editorial-kicker" style={{ fontSize: '0.68rem', color: 'var(--accent-olive)' }}>COMPLETED</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-olive)' }}>
                {stats.completed.toString().padStart(2, '0')}
              </div>
            </div>
            <div>
              <span className="editorial-kicker" style={{ fontSize: '0.68rem', color: 'var(--accent-terracotta)' }}>REMAINING</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-terracotta)' }}>
                {stats.pending.toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--rule-subtle)', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginRight: '0.25rem' }}>
              Status:
            </span>
            <button
              type="button"
              className={statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setStatusFilter('all')}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-pill)' }}
            >
              All ({tasks.length})
            </button>
            <button
              type="button"
              className={statusFilter === 'pending' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setStatusFilter('pending')}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-pill)' }}
            >
              Pending ({stats.pending})
            </button>
            <button
              type="button"
              className={statusFilter === 'completed' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setStatusFilter('completed')}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-pill)' }}
            >
              Completed ({stats.completed})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleGenerateRoadmap}
              disabled={generating}
              style={{ fontSize: '0.82rem' }}
            >
              {generating ? 'Synthesizing...' : 'Re-generate for Target Role →'}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setEditingTask(null)
                setModalOpen(true)
              }}
              style={{ fontSize: '0.82rem' }}
            >
              Add Milestone +
            </button>
          </div>
        </div>
      </section>

      {/* AI Curriculum Pacing & Strategy Guide */}
      <section
        style={{
          padding: '1.5rem 1.75rem',
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--rule-subtle)',
          borderLeft: '4px solid var(--accent-burgundy)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-subtle)',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div>
            <span className="editorial-kicker burgundy">AI PACING & STRATEGY GUIDE</span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', margin: '0.25rem 0 0', color: 'var(--ink-primary)' }}>
              Curriculum Calibration: {weeklyHours} Hours/Week · {learningStyle}
            </h3>
          </div>
          <button
            type="button"
            className="btn-text-link"
            onClick={() => navigate('/settings')}
            style={{ fontSize: '0.75rem' }}
          >
            Adjust Budget in Settings →
          </button>
        </div>

        <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--ink-secondary)', lineHeight: 1.6, maxWidth: '78ch' }}>
          {weeklyHours <= 5
            ? `At ${weeklyHours} hours per week, prioritize 1 core milestone weekly focused exclusively on verifiable code artifacts. Avoid fragmented tutorials.`
            : weeklyHours <= 14
            ? `At ${weeklyHours} hours per week with a ${learningStyle} focus, target 2 to 3 milestones weekly. Spend 30% on conceptual documentation and 70% writing and committing code.`
            : `With an intensive budget of ${weeklyHours} hours per week, target 3 to 5 milestones weekly to accelerate through the curriculum and build a comprehensive portfolio.`}
        </p>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid var(--rule-subtle)' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              const prompt = `What should I prioritize with my ${weeklyHours} hours available this week from my current roadmap?`
              navigate(`/chat?prompt=${encodeURIComponent(prompt)}`)
            }}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
          >
            Prioritize My {weeklyHours} Hours This Week →
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              const prompt = `Create a realistic 4-week study plan based on my ${weeklyHours} hours/week budget and ${learningStyle} preference.`
              navigate(`/chat?prompt=${encodeURIComponent(prompt)}`)
            }}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
          >
            Generate 4-Week Study Plan →
          </button>
        </div>
      </section>

      {/* Sequenced Milestones List */}
      <section className="editorial-panel">
        <div className="editorial-panel-header">
          <div>
            <span className="editorial-kicker burgundy">SEQUENCED CURRICULUM</span>
            <h2 className="editorial-panel-title">Active Milestones ({filteredTasks.length})</h2>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--ink-secondary)', fontSize: '0.95rem' }}>
            Retrieving curriculum schedule...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--ink-secondary)', fontSize: '0.95rem' }}>
            No milestones found matching the selected filter.
          </div>
        ) : (
          <div className="ranked-careers-list">
            {filteredTasks.map((t, idx) => (
              <article
                key={t.id || idx}
                className="ranked-career-row"
                style={{
                  gridTemplateColumns: '50px 1.6fr 1fr auto',
                  opacity: t.status === 'completed' ? 0.75 : 1
                }}
              >
                <div className="rank-num">{(idx + 1).toString().padStart(2, '0')}.</div>

                <div className="career-core">
                  <h3 style={{ textDecoration: t.status === 'completed' ? 'line-through' : 'none', color: t.status === 'completed' ? 'var(--ink-muted)' : 'var(--ink-primary)' }}>
                    {t.title}
                  </h3>
                  <div className="career-core-meta">
                    <span>{t.skill_category || 'Skill Development'}</span>
                    <span>·</span>
                    <span>Duration: {t.estimated_duration || '45 mins'}</span>
                    {t.due_date && (
                      <>
                        <span>·</span>
                        <span>Due: {t.due_date}</span>
                      </>
                    )}
                  </div>

                  <p style={{ margin: '0.45rem 0 0.65rem', fontSize: '0.85rem', color: 'var(--ink-secondary)', lineHeight: 1.55 }}>
                    {t.explanation}
                  </p>

                  {t.resource_url && (
                    <a
                      href={t.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-text-link"
                      style={{ fontSize: '0.8rem' }}
                    >
                      Canonical Reference Guide ↗
                    </a>
                  )}
                </div>

                <div>
                  <span
                    className="editorial-tag"
                    style={{
                      borderColor: t.priority === 'High' ? 'var(--accent-terracotta)' : (t.priority === 'Medium' ? 'var(--accent-gold)' : 'var(--accent-olive)'),
                      color: t.priority === 'High' ? 'var(--accent-terracotta)' : (t.priority === 'Medium' ? 'var(--accent-gold)' : 'var(--accent-olive)')
                    }}
                  >
                    {t.priority} Priority
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <button
                    type="button"
                    className={t.status === 'completed' ? 'btn-secondary' : 'btn-primary'}
                    onClick={() => handleToggleStatus(t)}
                    style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
                  >
                    {t.status === 'completed' ? 'Reopen' : 'Done ✓'}
                  </button>

                  <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-text-link"
                      onClick={() => {
                        setEditingTask(t)
                        setModalOpen(true)
                      }}
                      style={{ fontSize: '0.74rem' }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-text-link"
                      onClick={() => handleDeleteTask(t.id, t.title)}
                      style={{ fontSize: '0.74rem', color: 'var(--color-error)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Task Create / Edit Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setModalOpen(false)
            setEditingTask(null)
          }}
          onTaskSaved={loadTasks}
        />
      )}
    </div>
  )
}
