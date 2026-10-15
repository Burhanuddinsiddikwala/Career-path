import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function ChatPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestedPrompts, setSuggestedPrompts] = useState([])
  const [aiStatus, setAiStatus] = useState(null)
  const [addedActionTasks, setAddedActionTasks] = useState({})
  const [copiedId, setCopiedId] = useState(null)

  // Rename state
  const [editingConvId, setEditingConvId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  const messagesEndRef = useRef(null)
  const hasHandledPromptParam = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load conversations and suggestions
  useEffect(() => {
    api.get('/api/chat/status')
      .then(res => setAiStatus(res.data))
      .catch(() => {})

    api.get('/api/chat/suggested-prompts')
      .then(res => setSuggestedPrompts(res.data.prompts || []))
      .catch(() => {})

    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const res = await api.get('/api/chat/conversations')
      const convs = res.data.conversations || []
      setConversations(convs)
      if (convs.length > 0 && !activeConvId) {
        setActiveConvId(convs[0].id)
      } else if (convs.length === 0) {
        handleNewConversation()
      }
    } catch (e) {
      addToast('Failed to load conversation records.', 'error')
    }
  }

  // Load messages whenever active conversation changes
  useEffect(() => {
    if (!activeConvId) return
    api.get(`/api/chat/conversations/${activeConvId}/messages`)
      .then(res => {
        setMessages(res.data.messages || [])
        setTimeout(scrollToBottom, 80)
      })
      .catch(() => {})
  }, [activeConvId])

  const handleNewConversation = async () => {
    try {
      const res = await api.post('/api/chat/conversations', { title: 'New Career Consultation' })
      const newConv = res.data.conversation
      setConversations(prev => [newConv, ...prev])
      setActiveConvId(newConv.id)
      setMessages([])
    } catch (e) {
      addToast('Could not initiate new consultation thread.', 'error')
    }
  }

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation()
    if (!window.confirm('Delete this consultation record?')) return
    try {
      await api.delete(`/api/chat/conversations/${convId}`)
      addToast('Consultation record removed.', 'info')
      setConversations(prev => prev.filter(c => c.id !== convId))
      if (activeConvId === convId) {
        const remaining = conversations.filter(c => c.id !== convId)
        if (remaining.length > 0) {
          setActiveConvId(remaining[0].id)
        } else {
          handleNewConversation()
        }
      }
    } catch (e) {
      addToast('Failed to delete consultation record.', 'error')
    }
  }

  const handleRenameConversation = async (e, convId) => {
    e.stopPropagation()
    const title = editTitle.trim()
    if (!title) {
      setEditingConvId(null)
      return
    }
    try {
      await api.put(`/api/chat/conversations/${convId}`, { title })
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, title } : c))
      setEditingConvId(null)
      addToast('Consultation title updated.', 'success')
    } catch (err) {
      addToast('Failed to update title.', 'error')
    }
  }

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim()
    if (!text || loading) return

    let currentConvId = activeConvId
    if (!currentConvId) {
      try {
        const res = await api.post('/api/chat/conversations', { title: text.slice(0, 32) })
        const newConv = res.data.conversation
        setConversations(prev => [newConv, ...prev])
        currentConvId = newConv.id
        setActiveConvId(currentConvId)
      } catch (e) {
        addToast('Failed to create consultation thread.', 'error')
        return
      }
    }

    const tempUserMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempUserMsg])
    setInputMessage('')
    setLoading(true)
    setTimeout(scrollToBottom, 50)

    try {
      const res = await api.post(`/api/chat/conversations/${currentConvId}/messages`, { content: text })
      const assistantMsg = res.data.message
      setMessages(prev => [...prev, assistantMsg])
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      addToast('Consultation failed. Check backend status.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const promptParam = searchParams.get('prompt')
  useEffect(() => {
    if (promptParam && !hasHandledPromptParam.current && activeConvId && !loading) {
      hasHandledPromptParam.current = true
      handleSendMessage(promptParam)
      setSearchParams({}, { replace: true })
    }
  }, [promptParam, activeConvId, loading])

  const handleTaskAction = async (act) => {
    if (act.type === 'create_task') {
      const title = act.payload?.title || act.label
      try {
        await api.post('/api/roadmap/tasks', act.payload)
        setAddedActionTasks(prev => ({ ...prev, [title]: true }))
        addToast(`Added "${title}" to your learning roadmap!`, 'success')
      } catch (err) {
        addToast(err.response?.data?.error || 'Could not add milestone.', 'error')
      }
    } else if (act.route) {
      navigate(act.route)
    }
  }

  const handleCopyMessage = (msgId, content) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(msgId)
      addToast('Consultation advice copied to clipboard.', 'info')
      setTimeout(() => setCopiedId(null), 2000)
    }).catch(() => {
      addToast('Failed to copy to clipboard.', 'error')
    })
  }

  const activeConv = conversations.find(c => c.id === activeConvId)

  // Render assistant content cleanly supporting headings and paragraphs
  const renderMessageContent = (content) => {
    const lines = content.split('\n')
    return lines.map((line, idx) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', margin: '0.85rem 0 0.35rem', color: 'var(--ink-primary)' }}>
            {trimmed.replace('### ', '')}
          </h4>
        )
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', margin: '1rem 0 0.4rem', color: 'var(--ink-primary)' }}>
            {trimmed.replace('## ', '')}
          </h3>
        )
      }
      if (trimmed.startsWith('# ')) {
        return (
          <h2 key={idx} style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: '1.25rem 0 0.5rem', color: 'var(--ink-primary)' }}>
            {trimmed.replace('# ', '')}
          </h2>
        )
      }
      if (trimmed === '') {
        return <div key={idx} style={{ height: '0.4rem' }} />
      }
      return (
        <p key={idx} style={{ margin: '0 0 0.4rem', lineHeight: '1.6' }}>
          {trimmed}
        </p>
      )
    })
  }

  return (
    <div className="content-container">
      {/* Editorial Header */}
      <header className="editorial-header">
        <div className="editorial-header-top">
          <span className="editorial-kicker burgundy">CAREER INTELLIGENCE : ADVISORY CONSULTATION ROOM</span>
          <span className="editorial-edition">
            {aiStatus?.active_mode?.startsWith('generative_model')
              ? (aiStatus.active_mode.includes('gemini') ? 'GOOGLE GEMINI ONLINE' : 'OLLAMA ACTIVE')
              : 'OFFLINE COACH ENGINE'}
          </span>
        </div>
        <h1 className="editorial-title">AI Career Guidance Consultation</h1>
        <p className="editorial-deck">
          Direct professional consultation synthesized with your academic background, verified competencies, and curriculum milestones.
        </p>
      </header>

      {/* Main Consultation Layout */}
      <div className="chat-container">
        
        {/* Left Column: Thread History Sidebar */}
        <aside className="chat-threads-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.85rem' }}>
            <span className="editorial-kicker">DISPATCH THREADS</span>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={handleNewConversation}
            style={{ width: '100%', fontSize: '0.75rem', marginBottom: '1rem' }}
          >
            New Consultation +
          </button>

          <div className="threads-list">
            {conversations.map(conv => (
              <div
                key={conv.id}
                className={`thread-item ${conv.id === activeConvId ? 'active' : ''}`}
                onClick={() => setActiveConvId(conv.id)}
              >
                {editingConvId === conv.id ? (
                  <form
                    onSubmit={(e) => handleRenameConversation(e, conv.id)}
                    onClick={e => e.stopPropagation()}
                    style={{ display: 'flex', gap: '4px', width: '100%' }}
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      autoFocus
                      style={{ fontSize: '0.75rem', padding: '2px 4px', width: '100%' }}
                    />
                    <button type="submit" className="btn-text-link" style={{ fontSize: '0.7rem' }}>
                      OK
                    </button>
                  </form>
                ) : (
                  <>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.title}
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem', opacity: conv.id === activeConvId ? 1 : 0.6 }}>
                      <button
                        type="button"
                        className="btn-text-link"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingConvId(conv.id)
                          setEditTitle(conv.title)
                        }}
                        style={{ fontSize: '0.65rem' }}
                        title="Rename"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-text-link"
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                        style={{ fontSize: '0.65rem', color: 'var(--color-error)' }}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* AI Subsystem Diagnostics Badge */}
          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--rule-subtle)', fontSize: '0.72rem', color: 'var(--ink-secondary)' }}>
            <span className="editorial-kicker" style={{ fontSize: '0.6rem', display: 'block', marginBottom: '0.25rem' }}>
              OPERATING INFERENCE ENGINE:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="status-dot online" style={{ width: '6px', height: '6px' }}></span>
              <strong style={{ color: 'var(--ink-primary)' }}>
                {aiStatus?.active_mode?.startsWith('generative_model')
                  ? (aiStatus.active_mode.includes('gemini') ? `Gemini (${aiStatus.generative_llm?.target_model})` : `Ollama (${aiStatus.generative_llm?.target_model})`)
                  : 'Context-Aware Career Coach Engine'}
              </strong>
            </div>
          </div>
        </aside>

        {/* Right Column: Active Consultation Room */}
        <section className="chat-main">
          {/* Active Thread Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--rule-subtle)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: 0 }}>
                {activeConv?.title || 'Active Consultation'}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-secondary)' }}>
                Personalized advice synthesized with {user?.profile?.education || 'your academic background'}.
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="chat-messages-area">
            {messages.length === 0 && (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', backgroundColor: 'var(--surface-primary)', border: '1px solid var(--rule-subtle)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
                <span className="editorial-kicker burgundy">OPEN CONSULTATION</span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', margin: '0.6rem 0' }}>How may we direct your professional preparation today?</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)', maxWidth: '52ch', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
                  Inquire about role alignments, skill gap remediation, mock behavioral interview scenarios, or resume optimization using the Google XYZ formula.
                </p>
                <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {['Which careers best match my current skills?', 'Build a realistic 30-day learning plan', 'Analyze my skill gaps for target role'].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="suggested-btn"
                      onClick={() => handleSendMessage(p)}
                    >
                      {p} →
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <article key={msg.id || i} className={`chat-entry ${msg.role}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                  <span className="chat-entry-speaker">
                    {msg.role === 'user' ? (user?.full_name?.toUpperCase() || 'YOU') : 'CAREER INTELLIGENCE ADVISOR'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {msg.role === 'assistant' && (
                      <button
                        type="button"
                        className="btn-text-link"
                        onClick={() => handleCopyMessage(msg.id || i, msg.content)}
                        style={{ fontSize: '0.68rem', color: 'var(--ink-secondary)' }}
                        title="Copy consultation response"
                      >
                        {copiedId === (msg.id || i) ? 'Copied ✓' : 'Copy Advice'}
                      </button>
                    )}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink-muted)' }}>
                      {msg.created_at ? msg.created_at.split('T')[0] : ''}
                    </span>
                  </div>
                </div>

                <div className="chat-entry-bubble">
                  {renderMessageContent(msg.content)}

                  {/* Interactive Action Links if Present */}
                  {msg.metadata?.actions?.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--rule-subtle)' }}>
                      {msg.metadata.actions.map((act, actIdx) => {
                        if (act.type === 'create_task') {
                          const title = act.payload?.title || act.label
                          const isAdded = addedActionTasks[title]
                          return (
                            <button
                              key={actIdx}
                              type="button"
                              className={isAdded ? 'btn-secondary' : 'btn-primary'}
                              disabled={isAdded}
                              onClick={() => handleTaskAction(act)}
                              style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}
                            >
                              {isAdded ? '✓ Added to Roadmap' : (act.label || `+ Add Milestone to Roadmap`)}
                            </button>
                          )
                        }
                        return (
                          <button
                            key={actIdx}
                            type="button"
                            className="btn-primary"
                            onClick={() => handleTaskAction(act)}
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}
                          >
                            {act.label} →
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </article>
            ))}

            {loading && (
              <div className="chat-entry assistant">
                <span className="chat-entry-speaker">CAREER INTELLIGENCE ADVISOR</span>
                <div className="chat-typing-indicator">
                  <span className="chat-typing-dot"></span>
                  <span className="chat-typing-dot"></span>
                  <span className="chat-typing-dot"></span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--ink-secondary)', marginLeft: '0.5rem' }}>
                    Synthesizing personalized advice with your profile coordinates...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Understated Suggested Inquiries */}
          <div className="suggested-inquiries">
            <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-secondary)', alignSelf: 'center' }}>
              Suggested Inquiries:
            </span>
            {(suggestedPrompts.length > 0 ? suggestedPrompts : [
              'Which careers best match my current skills?',
              'What skills am I missing for my target role?',
              'Build a realistic 30-day learning plan',
              'Explain my career match score'
            ]).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className="suggested-btn"
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message Composer Area */}
          <div className="chat-input-area" style={{ marginTop: '0.75rem' }}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <textarea
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Inquire regarding careers, competencies, study roadmaps, or interview prep... (Enter to dispatch, Shift+Enter for newline)"
                disabled={loading}
                rows={2}
                style={{
                  border: 0,
                  outline: 'none',
                  background: 'transparent',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.92rem',
                  color: 'var(--ink-primary)',
                  resize: 'none',
                  minHeight: '52px',
                  maxHeight: '160px',
                  lineHeight: '1.5'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid var(--rule-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                  DISPATCH TO ADVISORY ENGINE
                </span>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!inputMessage.trim() || loading}
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.78rem' }}
                >
                  {loading ? 'Consulting...' : 'Dispatch →'}
                </button>
              </div>
            </form>
          </div>
        </section>

      </div>
    </div>
  )
}
