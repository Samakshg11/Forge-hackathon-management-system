import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LenisProvider } from './providers/LenisProvider';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { HackathonListPage } from './pages/HackathonListPage';
import { HackathonDetailPage } from './pages/HackathonDetailPage';
import { HackathonWizardPage } from './pages/HackathonWizardPage';
import { SubmissionFormPage } from './pages/SubmissionFormPage';
import { TeamWorkspacePage } from './pages/TeamWorkspacePage';
import { RoleDashboardPage } from './pages/RoleDashboardPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { ProfilePage } from './pages/ProfilePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DashboardLayout } from './layouts/DashboardLayout';

function DashboardEntry() {
  const { user } = useAuth();

  if (user?.role === 'organizer') {
    return <Navigate to="/app/organizer" replace />;
  }

  return (
    <DashboardLayout>
      <RoleDashboardPage />
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LenisProvider>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <ToastProvider>
                <div className="min-h-screen bg-canvas text-text-primary font-sans antialiased selection:bg-brand-primary selection:text-white">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                    <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                    <Route path="/hackathons" element={<HackathonListPage />} />
                    <Route path="/hackathons/:slug" element={<HackathonDetailPage />} />
                    <Route path="/hackathons/:slug/leaderboard" element={<LeaderboardPage />} />

                    {/* Authenticated / Role Gated Routes */}
                    <Route
                      path="/app/dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardEntry />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/app/organizer"
                      element={
                        <ProtectedRoute roles={['organizer']}>
                          <DashboardLayout>
                            <RoleDashboardPage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/app/judge"
                      element={
                        <ProtectedRoute roles={['judge', 'organizer', 'admin']}>
                          <DashboardLayout>
                            <RoleDashboardPage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/app/admin"
                      element={
                        <ProtectedRoute roles={['admin']}>
                          <DashboardLayout>
                            <RoleDashboardPage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/app/admin/analytics"
                      element={
                        <ProtectedRoute roles={['admin']}>
                          <DashboardLayout>
                            <AnalyticsPage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/app/organizer/hackathons/new"
                      element={
                        <ProtectedRoute roles={['organizer', 'admin']}>
                          <HackathonWizardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/app/organizer/hackathons/:id/edit"
                      element={
                        <ProtectedRoute roles={['organizer', 'admin']}>
                          <HackathonWizardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/app/hackathons/:id/submit"
                      element={
                        <ProtectedRoute roles={['participant', 'admin']}>
                          <DashboardLayout>
                            <SubmissionFormPage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/app/teams/:id/submission"
                      element={
                        <ProtectedRoute roles={['participant', 'admin']}>
                          <DashboardLayout>
                            <SubmissionFormPage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/app/teams/:id"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <TeamWorkspacePage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/app/bookmarks"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <BookmarksPage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/app/certificates"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <CertificatesPage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/app/profile"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <ProfilePage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
                    <Route path="/dashboard/*" element={<Navigate to="/app/dashboard" replace />} />

                    {/* Fallback Error 404 Route */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </div>
              </ToastProvider>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </LenisProvider>
    </ThemeProvider>
  );
}
