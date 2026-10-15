import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function AIPartnerConsole() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Based on current technology hiring benchmarks, candidates with verified systems architecture and data competencies achieve the strongest career trajectory. Would you like a personalized 30-day curriculum or skill-gap evaluation?'
    }
  ])
  const [inputVal, setInputVal] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const quickPrompts = [
    { label: 'Career advice', text: 'What technical trajectory offers the strongest 5-year growth?' },
    { label: 'Skill gaps', text: 'How do I bridge the gap between junior and mid-level engineer?' },
    { label: 'Learning plan', text: 'Can you structure a realistic 15 hour per week learning schedule?' },
    { label: 'Resume help', text: 'How do I reframe project bullet points using the Google XYZ formula?' }
  ]

  const handleSend = (textToSend) => {
    const query = (textToSend || inputVal).trim()
    if (!query) return

    const userMsg = { sender: 'user', text: query }
    setMessages(prev => [...prev, userMsg])
    setInputVal('')
    setIsTyping(true)

    // Simulate authentic mentor guidance calibrated to query
    setTimeout(() => {
      let reply = ''
      if (query.toLowerCase().includes('skill') || query.toLowerCase().includes('gap')) {
        reply = 'To bridge competency gaps, focus on demonstrable artifacts rather than passive tutorials. Build 2 production repositories: one featuring high-throughput database indexing with measurable query benchmarks, and one showcasing containerized microservices.'
      } else if (query.toLowerCase().includes('resume') || query.toLowerCase().includes('xyz')) {
        reply = 'Using the Google XYZ Impact formula: "Accomplished [X] as measured by [Y] by doing [Z]". For example: "Decreased API p99 latency by 42% across 10M daily requests by implementing redis caching and PostgreSQL B-tree indexing."'
      } else if (query.toLowerCase().includes('plan') || query.toLowerCase().includes('hour')) {
        reply = 'For a 15 hr/week allocation, follow the 3:1 ratio: 9 hours of hands-on code development, 3 hours of canonical documentation study (MDN, RFCs, official docs), and 3 hours of technical architecture writing.'
      } else {
        reply = 'CareerPath AI analyzes verified employer standards across 4 technical pillars. You can calibrate your exact match percentage and generate a 30-day daily milestone curriculum in your private executive dossier.'
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply }])
      setIsTyping(false)
    }, 700)
  }

  return (
    <div className="ai-partner-card">
      {/* Header */}
      <div className="ai-partner-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="ai-avatar-badge">CP</div>
          <div>
            <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--ink-primary)' }}>
              CareerPath AI
            </strong>
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-secondary)' }}>
              Autonomous Career Intelligence
            </span>
          </div>
        </div>
        <div className="ai-status-indicator">
          <span className="ai-status-dot" />
          <span>Online</span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="ai-dialogue-stream">
        {messages.map((m, idx) => (
          <div key={idx} className={`ai-bubble-row ${m.sender}`}>
            <div className={`ai-bubble ${m.sender}`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="ai-bubble-row ai">
            <div className="ai-bubble ai" style={{ display: 'flex', gap: '4px', padding: '0.75rem 1rem' }}>
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestion Chips */}
      <div className="ai-quick-chips-row">
        {quickPrompts.map(p => (
          <button
            key={p.label}
            type="button"
            className="ai-suggestion-chip"
            onClick={() => handleSend(p.text)}
          >
            ✦ {p.label}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="ai-partner-input-row"
      >
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="Ask anything about your career..."
          aria-label="Ask CareerPath AI mentor"
          className="ai-partner-input"
        />
        <button
          type="submit"
          className="ai-partner-send-btn"
          aria-label="Send message"
          disabled={!inputVal.trim() || isTyping}
        >
          →
        </button>
      </form>

      {/* Deep Consultation CTA */}
      <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--rule-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-secondary)', fontSize: '0.78rem' }}>
        <span style={{ color: 'var(--ink-secondary)' }}>Want full STAR & XYZ interview coaching?</span>
        <Link to="/chat" style={{ color: 'var(--accent-burgundy)', fontWeight: 600 }}>
          Open Advisory Desk →
        </Link>
      </div>
    </div>
  )
}
