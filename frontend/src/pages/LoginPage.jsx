import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { addToast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await login(email.trim(), password)
      addToast('Welcome back to CareerPath AI.', 'success')
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or connection error.')
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
          <span className="editorial-kicker burgundy">SUBSCRIBER ACCESS</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', margin: '0.35rem 0 0.5rem' }}>
            Sign In to Your Dossier
          </h2>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
            Access your active career briefing, verified competency ledger, and 30-day curriculum.
          </p>
        </div>

        {error && (
          <div className="form-error-banner" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Registered Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="reader@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label htmlFor="login-password">Password</label>
              <button
                type="button"
                className="btn-text-link"
                style={{ fontSize: '0.72rem' }}
                onClick={() => addToast('Password reset is simulated: use your registered password or contact support.', 'info')}
              >
                Forgot password?
              </button>
            </div>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.85rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In →'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--rule-subtle)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--ink-secondary)' }}>
          <span>New subscriber? </span>
          <Link to="/register" className="btn-text-link">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  )
}
