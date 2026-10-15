import { useState, useEffect } from 'react'
import api from '../api/client'
import { useToast } from '../context/ToastContext'
import ContactModal from '../components/ContactModal'

export default function NetworkingPage() {
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState('contacts')
  const [contacts, setContacts] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [contactsRes, tmplRes] = await Promise.all([
        api.get('/api/networking/contacts'),
        api.get('/api/networking/templates')
      ])
      setContacts(contactsRes.data.contacts || [])
      setTemplates(tmplRes.data.templates || [])
    } catch (e) {
      addToast('Could not load networking data.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDeleteContact = async (id, name) => {
    if (!window.confirm(`Delete contact "${name}"?`)) return
    try {
      await api.delete(`/api/networking/contacts/${id}`)
      addToast(`Removed "${name}" from network ledger.`, 'info')
      setContacts(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      addToast('Failed to delete contact.', 'error')
    }
  }

  const handleUpdateStatus = async (contactId, newStatus) => {
    try {
      await api.put(`/api/networking/contacts/${contactId}`, { status: newStatus })
      setContacts(prev => prev.map(c => c.id === contactId ? { ...c, status: newStatus } : c))
      addToast(`Updated status to "${newStatus}".`, 'success')
    } catch (e) {
      addToast('Could not update status.', 'error')
    }
  }

  const handleCopyTemplate = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    addToast('Template copied to clipboard.', 'success')
    setTimeout(() => setCopiedId(null), 2500)
  }

  const filteredContacts = contacts.filter(c => {
    if (statusFilter !== 'all' && c.status.toLowerCase() !== statusFilter.toLowerCase()) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      const haystack = `${c.contact_name} ${c.organization} ${c.role_title} ${c.notes}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  return (
    <div className="content-container">
      {/* Editorial Header */}
      <header className="editorial-header">
        <div className="editorial-header-top">
          <span className="editorial-kicker burgundy">PROFESSIONAL RELATIONS : NETWORK LEDGER</span>
          <span className="editorial-edition">{contacts.length} CONTACTS RECORDED</span>
        </div>
        <h1 className="editorial-title">Professional Network & Outreach Ledger</h1>
        <p className="editorial-deck">
          Track industry discussions, schedule follow-ups across pipeline stages, and utilize canonical outreach message frameworks.
        </p>
      </header>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '2rem' }}>
        <button
          type="button"
          className={activeTab === 'contacts' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('contacts')}
          style={{ fontSize: '0.78rem', borderRadius: 'var(--radius-pill)', padding: '0.55rem 1.25rem' }}
        >
          Contacts Ledger ({contacts.length})
        </button>
        <button
          type="button"
          className={activeTab === 'templates' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('templates')}
          style={{ fontSize: '0.78rem', borderRadius: 'var(--radius-pill)', padding: '0.55rem 1.25rem' }}
        >
          Outreach Message Templates ({templates.length})
        </button>
      </div>

      {activeTab === 'contacts' ? (
        <>
          {/* Controls Bar */}
          <section className="editorial-panel inset" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Filter Contacts</label>
                <input
                  type="text"
                  placeholder="Filter by contact name, organization, role, or note..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  style={{ backgroundColor: 'var(--surface-primary)' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Pipeline Stage</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{ backgroundColor: 'var(--surface-primary)' }}
                >
                  <option value="all">All Stages</option>
                  <option value="Identified">Identified</option>
                  <option value="Reached Out">Reached Out</option>
                  <option value="In Discussion">In Discussion</option>
                  <option value="Follow-Up Needed">Follow-Up Needed</option>
                  <option value="Connected">Connected</option>
                </select>
              </div>

              <div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setEditingContact(null)
                    setModalOpen(true)
                  }}
                  style={{ fontSize: '0.75rem', height: '38px' }}
                >
                  Record Contact +
                </button>
              </div>
            </div>
          </section>

          {/* Contacts Table */}
          <section className="editorial-panel">
            <div className="editorial-panel-header">
              <div>
                <span className="editorial-kicker">LEDGER DIRECTORY</span>
                <h2 className="editorial-panel-title">Active Contacts ({filteredContacts.length})</h2>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-secondary)' }}>
                Retrieving contacts ledger...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-secondary)' }}>
                No contacts recorded in this pipeline stage. Click "Record Contact +" above.
              </div>
            ) : (
              <table className="editorial-table">
                <thead>
                  <tr>
                    <th>Contact & Role</th>
                    <th>Organization</th>
                    <th>Pipeline Stage</th>
                    <th>Coordinates</th>
                    <th>Target Follow-Up</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map(c => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.contact_name}</strong>
                        {c.role_title && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                            {c.role_title}
                          </div>
                        )}
                      </td>
                      <td style={{ color: 'var(--ink-primary)', fontSize: '0.8rem' }}>
                        {c.organization}
                      </td>
                      <td>
                        <select
                          value={c.status}
                          onChange={e => handleUpdateStatus(c.id, e.target.value)}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '0.35rem 0.65rem',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: 'var(--surface-primary)',
                            border: '1px solid var(--rule-subtle)',
                            color: c.status === 'Connected' ? 'var(--color-success)' : c.status === 'Follow-Up Needed' ? 'var(--accent-burgundy)' : c.status === 'In Discussion' ? 'var(--accent-terracotta)' : 'var(--ink-primary)',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Identified">Identified</option>
                          <option value="Reached Out">Reached Out</option>
                          <option value="In Discussion">In Discussion</option>
                          <option value="Follow-Up Needed">Follow-Up Needed</option>
                          <option value="Connected">Connected</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.72rem' }}>
                          {c.email && (
                            <a href={`mailto:${c.email}`} className="btn-text-link">
                              {c.email}
                            </a>
                          )}
                          {c.linkedin_url && (
                            <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn-text-link">
                              Profile URL ↗
                            </a>
                          )}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-secondary)' }}>
                        {c.follow_up_date || 'None'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn-text-link"
                            onClick={() => {
                              setEditingContact(c)
                              setModalOpen(true)
                            }}
                            style={{ fontSize: '0.72rem' }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-text-link"
                            onClick={() => handleDeleteContact(c.id, c.contact_name)}
                            style={{ fontSize: '0.72rem', color: 'var(--color-error)' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      ) : (
        /* Outreach Message Templates */
        <section className="editorial-panel">
          <div className="editorial-panel-header">
            <div>
              <span className="editorial-kicker burgundy">CANONICAL DISPATCH TEMPLATES</span>
              <h2 className="editorial-panel-title">Outreach Communication Frameworks</h2>
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)', marginBottom: '1.5rem' }}>
            Structured communication templates designed for concise, respectful professional inquiries without presumptuous demands.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.75rem' }}>
            {templates.map(tmpl => (
              <div
                key={tmpl.id}
                style={{
                  padding: '1.75rem',
                  backgroundColor: 'var(--surface-primary)',
                  border: '1px solid var(--rule-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                    <span className="editorial-kicker burgundy">{tmpl.title}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)', margin: '0 0 1rem', lineHeight: '1.5' }}>
                    {tmpl.description}
                  </p>
                  <div
                    style={{
                      padding: '1rem 1.15rem',
                      backgroundColor: 'var(--surface-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--rule-subtle)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.82rem',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      color: 'var(--ink-primary)'
                    }}
                  >
                    {tmpl.template_text}
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--rule-subtle)' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleCopyTemplate(tmpl.template_text, tmpl.id)}
                    style={{ fontSize: '0.75rem', width: '100%', padding: '0.6rem 1rem' }}
                  >
                    {copiedId === tmpl.id ? 'Copied to Clipboard' : 'Copy Template to Clipboard'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact Modal */}
      {modalOpen && (
        <ContactModal
          contact={editingContact}
          onClose={() => {
            setModalOpen(false)
            setEditingContact(null)
          }}
          onContactSaved={loadData}
        />
      )}
    </div>
  )
}
