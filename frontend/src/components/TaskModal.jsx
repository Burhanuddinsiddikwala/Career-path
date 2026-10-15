import { useState } from 'react'
import api from '../api/client'
import { useToast } from '../context/ToastContext'

export default function TaskModal({ task, initialDate, onClose, onTaskSaved }) {
  const { addToast } = useToast()
  const isEditing = !!task?.id

  const [title, setTitle] = useState(task?.title || '')
  const [explanation, setExplanation] = useState(task?.explanation || '')
  const [skillCategory, setSkillCategory] = useState(task?.skill_category || 'Skill Development')
  const [priority, setPriority] = useState(task?.priority || 'Medium')
  const [estimatedDuration, setEstimatedDuration] = useState(task?.estimated_duration || '45 mins')
  const [dueDate, setDueDate] = useState(task?.due_date || initialDate || '')
  const [resourceUrl, setResourceUrl] = useState(task?.resource_url || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Task title is required.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const payload = {
        title: title.trim(),
        explanation: explanation.trim(),
        skill_category: skillCategory,
        priority,
        estimated_duration: estimatedDuration,
        due_date: dueDate,
        resource_url: resourceUrl.trim(),
        resource_label: resourceUrl ? 'Resource Guide' : ''
      }

      if (isEditing) {
        await api.put(`/api/roadmap/tasks/${task.id}`, payload)
        addToast('Milestone updated successfully.', 'success')
      } else {
        await api.post('/api/roadmap/tasks', payload)
        addToast('Milestone recorded in study roadmap.', 'success')
      }

      if (onTaskSaved) onTaskSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save milestone.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="editorial-kicker burgundy">
              {isEditing ? 'REVISE MILESTONE' : 'NEW STUDY MILESTONE'}
            </span>
            <h3 style={{ marginTop: '0.25rem' }}>
              {isEditing ? 'Edit Roadmap Milestone' : 'Record Study Milestone'}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="form-error-banner">{error}</div>}

          <div className="form-group">
            <label htmlFor="task-title">Milestone Title *</label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Implement JWT authentication middleware"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-expl">Deliverable & Practical Application</label>
            <textarea
              id="task-expl"
              rows={3}
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              placeholder="What hands-on deliverable or code milestone validates this competency?"
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="task-cat">Domain Category</label>
              <select
                id="task-cat"
                value={skillCategory}
                onChange={e => setSkillCategory(e.target.value)}
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="Data & Analytics">Data & Analytics</option>
                <option value="AI / Machine Learning">AI / Machine Learning</option>
                <option value="Design & UI/UX">Design & UI/UX</option>
                <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                <option value="Skill Development">General Skill Development</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={priority}
                onChange={e => setPriority(e.target.value)}
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="task-duration">Estimated Duration</label>
              <input
                id="task-duration"
                type="text"
                value={estimatedDuration}
                onChange={e => setEstimatedDuration(e.target.value)}
                placeholder="e.g. 45 mins, 2 hours"
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-due">Target Completion Date</label>
              <input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="task-resource">Canonical Documentation URL (Optional)</label>
            <input
              id="task-resource"
              type="url"
              value={resourceUrl}
              onChange={e => setResourceUrl(e.target.value)}
              placeholder="https://docs.python.org/3/ or reference link"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Dismiss
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Recording...' : (isEditing ? 'Save Changes' : 'Record Milestone')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
