import { useState } from 'react'
import api from '../api/client'
import { useToast } from '../context/ToastContext'

export default function ContactModal({ contact, onClose, onContactSaved }) {
  const { addToast } = useToast()
  const isEditing = !!contact?.id

  const [contactName, setContactName] = useState(contact?.contact_name || '')
  const [organization, setOrganization] = useState(contact?.organization || '')
  const [roleTitle, setRoleTitle] = useState(contact?.role_title || '')
  const [status, setStatus] = useState(contact?.status || 'Identified')
  const [email, setEmail] = useState(contact?.email || '')
  const [linkedinUrl, setLinkedinUrl] = useState(contact?.linkedin_url || '')
  const [followUpDate, setFollowUpDate] = useState(contact?.follow_up_date || '')
  const [notes, setNotes] = useState(contact?.notes || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!contactName.trim() || !organization.trim()) {
      setError('Contact name and organization are required.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const payload = {
        contact_name: contactName.trim(),
        organization: organization.trim(),
        role_title: roleTitle.trim(),
        status,
        email: email.trim(),
        linkedin_url: linkedinUrl.trim(),
        follow_up_date: followUpDate,
        notes: notes.trim()
      }

      if (isEditing) {
        await api.put(`/api/networking/contacts/${contact.id}`, payload)
        addToast('Contact updated successfully.', 'success')
      } else {
        await api.post('/api/networking/contacts', payload)
        addToast('Contact recorded in professional network ledger.', 'success')
      }

      if (onContactSaved) onContactSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save contact.')
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
              {isEditing ? 'REVISE ENTRY' : 'NEW CONTACT DOSSIER'}
            </span>
            <h3 style={{ marginTop: '0.25rem' }}>
              {isEditing ? 'Edit Contact Record' : 'Record Professional Contact'}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="form-error-banner">{error}</div>}

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="contact-name">Full Name *</label>
              <input
                id="contact-name"
                type="text"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-org">Organization / Firm *</label>
              <input
                id="contact-org"
                type="text"
                value={organization}
                onChange={e => setOrganization(e.target.value)}
                placeholder="e.g. Anthropic, Google Research"
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="contact-role">Role Title</label>
              <input
                id="contact-role"
                type="text"
                value={roleTitle}
                onChange={e => setRoleTitle(e.target.value)}
                placeholder="e.g. Staff Research Scientist"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-status">Pipeline Stage</label>
              <select
                id="contact-status"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="Identified">Identified</option>
                <option value="Reached Out">Reached Out</option>
                <option value="In Discussion">In Discussion</option>
                <option value="Follow-Up Needed">Follow-Up Needed</option>
                <option value="Connected">Connected</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="contact-email">Email Address</label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@organization.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-linkedin">Professional URL / Profile</label>
              <input
                id="contact-linkedin"
                type="url"
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="contact-followup">Target Follow-Up Date</label>
            <input
              id="contact-followup"
              type="date"
              value={followUpDate}
              onChange={e => setFollowUpDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact-notes">Dossier Notes & Context</label>
            <textarea
              id="contact-notes"
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Record common research interests, past discussions, or referral context..."
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Dismiss
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Recording...' : (isEditing ? 'Save Changes' : 'Record Contact')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
