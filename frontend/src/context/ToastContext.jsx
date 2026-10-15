import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" role="region" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item ${t.type}`}>
            <div>
              <span className="editorial-kicker" style={{ display: 'block', marginBottom: '2px', fontSize: '0.62rem' }}>
                {t.type === 'success' && 'CONFIRMATION'}
                {t.type === 'error' && 'ALERT'}
                {t.type === 'info' && 'NOTICE'}
              </span>
              <span>{t.message}</span>
            </div>
            <button className="toast-close" onClick={() => removeToast(t.id)} aria-label="Dismiss notice">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
