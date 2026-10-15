import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { addToast } = useToast()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please complete all required fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        confirm_password: confirmPassword
      })
      addToast('Subscriber dossier created. Proceeding to profile setup.', 'success')
      navigate('/onboarding')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. An account with this email may already exist.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-panel">
        <div className="auth-header">
          <Link to="/" style={{ textDecoration: 'none', display: 'block', marginBottom: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
              CAREERPATH <span style={{ color: 'var(--accent-burgundy)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }}>AI</span>
            </span>
          </Link>
          <span className="editorial-kicker burgundy">NEW SUBSCRIBER REGISTRATION</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', margin: '0.35rem 0 0.5rem' }}>
            Establish Your Dossier
          </h2>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
            Create an authenticated profile to evaluate technical competencies and construct a 30-day curriculum.
          </p>
        </div>

        {error && (
          <div className="form-error-banner" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-name">Full Name *</label>
            <input
              id="reg-name"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address *</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="reader@university.edu"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password (min. 6 characters) *</label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm Password *</label>
            <input
              id="reg-confirm"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.85rem' }}
          >
            {loading ? 'Creating Dossier...' : 'Create Account & Begin →'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--rule-subtle)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--ink-secondary)' }}>
          <span>Already hold an account? </span>
          <Link to="/login" className="btn-text-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
