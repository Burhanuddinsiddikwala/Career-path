import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import CareersPage from './pages/CareersPage'
import SkillsPage from './pages/SkillsPage'
import JobsPage from './pages/JobsPage'
import RoadmapPage from './pages/RoadmapPage'
import CalendarPage from './pages/CalendarPage'
import NetworkingPage from './pages/NetworkingPage'
import ChatPage from './pages/ChatPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsPage from './pages/TermsPage'

// Protected Route Guard
function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="loading-spinner" />
        <p>Loading CareerPath AI...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="main-area">
        <Topbar setMobileOpen={setMobileOpen} />
        <main className="content-container">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// Public Route Guard (redirect to dashboard if already authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="loading-spinner" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing & Legal */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />

      {/* Auth Routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Onboarding (Protected) */}
      <Route
        path="/onboarding"
        element={
          <ProtectedLayout />
        }
      >
        <Route index element={<OnboardingPage />} />
      </Route>

      {/* Authenticated Dashboard & Features */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/networking" element={<NetworkingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
