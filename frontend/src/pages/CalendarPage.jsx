import { useState, useEffect } from 'react'
import api from '../api/client'
import { useToast } from '../context/ToastContext'
import TaskModal from '../components/TaskModal'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function CalendarPage() {
  const { addToast } = useToast()
  const [tasks, setTasks] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 14)) // October 2026
  const [selectedDate, setSelectedDate] = useState('2026-10-14')
  const [modalOpen, setModalOpen] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const loadTasks = async () => {
    try {
      const res = await api.get('/api/roadmap/tasks')
      setTasks(res.data.tasks || [])
    } catch (e) {
      addToast('Failed to load tasks for calendar.', 'error')
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleToday = () => {
    const today = new Date(2026, 9, 14)
    setCurrentDate(today)
    setSelectedDate('2026-10-14')
  }

  // Generate calendar days
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7 // Monday = 0
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthTotalDays = new Date(year, month, 0).getDate()

  const calendarDays = []

  // Prev month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i
    const m = month === 0 ? 12 : month
    const y = month === 0 ? year - 1 : year
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    calendarDays.push({ day: d, outside: true, dateStr })
  }

  // Current month
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    calendarDays.push({ day: d, outside: false, dateStr })
  }

  // Next month padding
  const totalCells = Math.ceil(calendarDays.length / 7) * 7
  const nextDays = totalCells - calendarDays.length
  for (let d = 1; d <= nextDays; d++) {
    const m = month === 11 ? 1 : month + 2
    const y = month === 11 ? year + 1 : year
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    calendarDays.push({ day: d, outside: true, dateStr })
  }

  const selectedDateTasks = tasks.filter(t => t.due_date === selectedDate || t.start_date === selectedDate)

  const handleToggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      await api.put(`/api/roadmap/tasks/${task.id}`, { status: nextStatus })
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t))
      addToast(`Milestone marked as ${nextStatus}.`, 'success')
    } catch (e) {
      addToast('Could not update task status.', 'error')
    }
  }

  return (
    <div className="content-container">
      {/* Editorial Header */}
      <header className="editorial-header">
        <div className="editorial-header-top">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="hero-pulsing-dot" />
            <span className="editorial-kicker burgundy">CONTINUOUS STUDY CALENDAR</span>
          </div>
          <span className="editorial-edition">CHRONOLOGICAL DISPATCH · 2026</span>
        </div>
        <h1 className="editorial-title">Study Calendar & Milestone Timeline</h1>
        <p className="editorial-deck">
          Schedule focused study sessions, align milestone deliverables with calendar dates, and monitor your daily technical momentum.
        </p>
      </header>

      {/* 2-Column Calendar Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Month Calendar */}
        <section className="editorial-panel" style={{ padding: '2rem' }}>
          {/* Calendar Header with Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--rule-subtle)' }}>
            <div>
              <span className="editorial-kicker" style={{ color: 'var(--accent-burgundy)' }}>
                {year} ACADEMIC CYCLE
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', margin: '0.25rem 0 0', color: 'var(--ink-primary)' }}>
                {MONTH_NAMES[month]} {year}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handlePrevMonth}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                aria-label="Previous month"
              >
                ← Prev
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleToday}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
              >
                Today
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleNextMonth}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                aria-label="Next month"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '0.75rem' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(w => (
              <span
                key={w}
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--ink-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '0.45rem 0'
                }}
              >
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {calendarDays.map((cell, idx) => {
              const dayTasks = tasks.filter(t => t.due_date === cell.dateStr || t.start_date === cell.dateStr)
              const isSelected = selectedDate === cell.dateStr
              const isToday = cell.dateStr === '2026-10-14'

              return (
                <button
                  key={`${cell.dateStr}-${idx}`}
                  type="button"
                  onClick={() => setSelectedDate(cell.dateStr)}
                  style={{
                    minHeight: '74px',
                    padding: '0.55rem',
                    backgroundColor: isSelected ? 'var(--surface-secondary)' : 'var(--surface-primary)',
                    border: isSelected ? '2px solid var(--accent-burgundy)' : '1px solid var(--rule-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: isSelected ? 'var(--shadow-card)' : 'var(--shadow-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    opacity: cell.outside ? 0.35 : 1,
                    textAlign: 'left',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.82rem',
                        fontWeight: isToday ? 700 : (isSelected ? 600 : 500),
                        color: isToday ? 'var(--accent-burgundy)' : 'var(--ink-primary)'
                      }}
                    >
                      {cell.day}
                    </span>
                    {isToday && (
                      <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--accent-burgundy)', fontWeight: 700 }}>
                        Now
                      </span>
                    )}
                  </div>

                  {dayTasks.length > 0 && (
                    <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
                      <span
                        className="editorial-tag matched"
                        style={{
                          fontSize: '0.65rem',
                          padding: '1px 5px',
                          display: 'inline-block'
                        }}
                      >
                        {dayTasks.length} {dayTasks.length > 1 ? 'tasks' : 'task'}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* Right Column: Selected Date Inspector */}
        <div>
          <section className="editorial-panel" style={{ borderTop: '4px solid var(--accent-burgundy)' }}>
            <span className="editorial-kicker burgundy">SCHEDULE INSPECTOR</span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', margin: '0.4rem 0 0.5rem' }}>
              {selectedDate}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)', marginBottom: '1.25rem' }}>
              Milestones and study sessions scheduled for this calendar date:
            </p>

            {selectedDateTasks.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', color: 'var(--ink-secondary)', fontSize: '0.88rem' }}>
                No milestones scheduled for {selectedDate}.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {selectedDateTasks.map(t => (
                  <div
                    key={t.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--bg-paper)',
                      border: '1px solid var(--rule-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: 'var(--shadow-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--ink-primary)', textDecoration: t.status === 'completed' ? 'line-through' : 'none' }}>
                        {t.title}
                      </strong>
                      <span
                        className="editorial-tag"
                        style={{
                          fontSize: '0.68rem',
                          color: t.priority === 'High' ? 'var(--accent-terracotta)' : 'var(--accent-olive)'
                        }}
                      >
                        {t.priority}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)', margin: '0 0 0.65rem' }}>
                      {t.explanation}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
                        Duration: {t.estimated_duration || '45m'}
                      </span>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleToggleTaskStatus(t)}
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
                      >
                        {t.status === 'completed' ? 'Reopen' : 'Complete ✓'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className="btn-primary"
              onClick={() => setModalOpen(true)}
              style={{ width: '100%', fontSize: '0.82rem' }}
            >
              Schedule Milestone on {selectedDate} +
            </button>
          </section>
        </div>

      </div>

      {/* Task Creation Modal */}
      {modalOpen && (
        <TaskModal
          task={{ due_date: selectedDate }}
          onClose={() => setModalOpen(false)}
          onTaskSaved={loadTasks}
        />
      )}
    </div>
  )
}
