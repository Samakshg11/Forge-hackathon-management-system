import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LenisProvider } from './providers/LenisProvider';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';

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
import { DashboardLayout } from './layouts/DashboardLayout';

export default function App() {
  return (
    <ThemeProvider>
      {/* <LenisProvider> */}
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
                    <Route path="/hackathons/:id" element={<HackathonDetailPage />} />

                    {/* Authenticated / Role Gated Routes */}
                    <Route
                      path="/hackathons/create"
                      element={
                        <ProtectedRoute roles={['ORGANIZER', 'ADMIN']}>
                          <HackathonWizardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/hackathons/:id/edit"
                      element={
                        <ProtectedRoute roles={['ORGANIZER', 'ADMIN']}>
                          <HackathonWizardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/hackathons/:id/submit"
                      element={
                        <ProtectedRoute roles={['PARTICIPANT', 'ADMIN']}>
                          <SubmissionFormPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/teams/:teamId"
                      element={
                        <ProtectedRoute>
                          <TeamWorkspacePage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Dashboard routes wrapped in DashboardLayout */}
                    <Route
                      path="/dashboard/*"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <RoleDashboardPage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/bookmarks"
                      element={
                        <ProtectedRoute>
                          <BookmarksPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/certificates"
                      element={
                        <ProtectedRoute>
                          <CertificatesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Fallback redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </ToastProvider>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      {/* </LenisProvider> */}
    </ThemeProvider>
  );
}
