import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../api/client'

export default function Topbar({ setMobileOpen }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { addToast } = useToast()

  // Search state
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchRef = useRef(null)

  // Notifications state
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifMenu, setShowNotifMenu] = useState(false)
  const notifRef = useRef(null)

  // User menu state
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  // Fetch notifications
  const loadNotifications = async () => {
    try {
      const res = await api.get('/api/notifications')
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unread_count || 0)
    } catch (e) {
      // Ignored if offline
    }
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Search execution with debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      setShowSearchDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await api.get(`/api/search?q=${encodeURIComponent(query)}`)
        setSearchResults(res.data.results || [])
        setShowSearchDropdown(true)
      } catch (err) {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifMenu(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markNotificationRead = async (id, link) => {
    try {
      await api.put(`/api/notifications/${id}/read`)
      loadNotifications()
      if (link) {
        navigate(link)
        setShowNotifMenu(false)
      }
    } catch (e) {}
  }

  const clearAllNotifications = async () => {
    try {
      await api.post('/api/notifications/clear')
      loadNotifications()
      addToast('All dispatches marked as read', 'success')
    } catch (e) {}
  }

  // Get user initials
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'CP'

  return (
    <header className="topbar">
      <button
        className="topbar-btn"
        onClick={() => setMobileOpen && setMobileOpen(prev => !prev)}
        aria-label="Toggle navigation drawer"
        style={{ display: 'none' }} // Controlled by media queries
      >
        Index
      </button>

      <div className="topbar-context">
        <span className="editorial-kicker">EDITION</span>
        <span className="topbar-context-sep">/</span>
        <strong>Career Intelligence Platform</strong>
      </div>

      <div className="topbar-spacer" />

      {/* Global Search */}
      <div className="search-wrapper" ref={searchRef}>
        <div className="global-search">
          <span className="search-indicator" aria-hidden="true">Find:</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowSearchDropdown(true)}
            placeholder="Search roles, competencies, tasks..."
            aria-label="Global catalogue search"
          />
          {query && (
            <button
              className="modal-close-btn"
              onClick={() => setQuery('')}
              style={{ fontSize: '0.85rem', padding: '0 0.25rem' }}
            >
              ×
            </button>
          )}
        </div>

        {showSearchDropdown && (
          <div className="search-results-dropdown">
            {searchLoading && (
              <div style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--ink-secondary)' }}>
                Querying catalogue...
              </div>
            )}
            {!searchLoading && searchResults.length === 0 && (
              <div style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--ink-secondary)' }}>
                No matching roles, milestones, or contacts found.
              </div>
            )}
            {!searchLoading && searchResults.map((item, idx) => (
              <div
                key={`${item.type}-${item.id}-${idx}`}
                className="search-item"
                onClick={() => {
                  navigate(item.link)
                  setShowSearchDropdown(false)
                  setQuery('')
                }}
              >
                <div>
                  <div className="search-item-title">{item.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--ink-secondary)' }}>{item.subtitle}</div>
                </div>
                <span className="search-item-type">{item.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications / Dispatches */}
      <div style={{ position: 'relative' }} ref={notifRef}>
        <button
          type="button"
          className="topbar-btn"
          onClick={() => setShowNotifMenu(!showNotifMenu)}
          aria-label={`Dispatches ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <span>Dispatches</span>
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </button>

        {showNotifMenu && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '320px',
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--rule-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-elevated)',
              overflow: 'hidden',
              zIndex: 100,
              animation: 'cinematicFadeUp 0.2s var(--ease-expo)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--rule-subtle)'
              }}
            >
              <span className="editorial-kicker">EDITORIAL DISPATCHES</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="btn-text-link"
                  onClick={clearAllNotifications}
                  style={{ fontSize: '0.7rem' }}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '1.25rem 1rem', fontSize: '0.8rem', color: 'var(--ink-secondary)', textAlign: 'center' }}>
                  No active dispatches.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id, n.link)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid var(--rule-subtle)',
                      backgroundColor: n.is_read ? 'transparent' : 'var(--surface-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                      <span>{n.title}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', fontSize: '0.65rem' }}>
                        {n.created_at?.split(' ')[0]}
                      </span>
                    </div>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--ink-secondary)', lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Monogram Menu */}
      <div style={{ position: 'relative' }} ref={userMenuRef}>
        <button
          type="button"
          className="user-monogram"
          onClick={() => setShowUserMenu(!showUserMenu)}
          aria-label="Account details menu"
        >
          {initials}
        </button>

        {showUserMenu && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '240px',
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--rule-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-elevated)',
              overflow: 'hidden',
              zIndex: 100,
              animation: 'cinematicFadeUp 0.2s var(--ease-expo)'
            }}
          >
            <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--rule-subtle)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user?.full_name || 'Reader'}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--ink-secondary)', marginTop: '2px' }}>{user?.email}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                type="button"
                className="nav-item"
                onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                style={{ padding: '0.65rem 1rem', borderRadius: 0 }}
              >
                Profile & Goals
              </button>
              <button
                type="button"
                className="nav-item"
                onClick={() => { navigate('/onboarding'); setShowUserMenu(false); }}
                style={{ padding: '0.65rem 1rem', borderRadius: 0 }}
              >
                Rerun Onboarding
              </button>
              <button
                type="button"
                className="nav-item"
                onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                style={{ padding: '0.65rem 1rem', borderRadius: 0 }}
              >
                Settings & Diagnostics
              </button>
              <hr style={{ margin: 0 }} />
              <button
                type="button"
                className="nav-item"
                onClick={() => {
                  logout()
                  addToast('Session concluded successfully.', 'info')
                  navigate('/login')
                }}
                style={{ padding: '0.65rem 1rem', borderRadius: 0, color: 'var(--color-error)' }}
              >
                End Session (Sign Out)
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
