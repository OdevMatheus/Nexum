import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage.tsx'
import RegisterPage from './pages/auth/RegisterPage.tsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { ThemeToggle } from './components/ThemeToggle'

const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage.tsx'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage.tsx'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage.tsx'))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage.tsx'))
const ClientsPage = lazy(() => import('./pages/clients/ClientsPage.tsx'))
const ClientDetailPage = lazy(() => import('./pages/clients/ClientDetailPage.tsx'))
const PlansPage = lazy(() => import('./pages/plans/PlansPage.tsx'))
const PlanDetailPage = lazy(() => import('./pages/plans/PlanDetailPage.tsx'))
const SubscriptionsPage = lazy(() => import('./pages/subscriptions/SubscriptionsPage.tsx'))
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage.tsx'))

const isAuthenticated = () => !!localStorage.getItem('accessToken')

function PrivateRoute({ children }: { children: React.ReactNode }) {
    return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
    return (
        <ThemeProvider>
            <ThemeToggle />
            <Suspense fallback={<div className="min-h-screen bg-[#FDFBF7] dark:bg-stone-950" />}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <DashboardPage />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/clients" element={<PrivateRoute><ClientsPage /></PrivateRoute>} />
                    <Route path="/clients/:id" element={<PrivateRoute><ClientDetailPage /></PrivateRoute>} />
                    <Route path="/plans" element={<PrivateRoute><PlansPage /></PrivateRoute>} />
                    <Route path="/plans/:id" element={<PrivateRoute><PlanDetailPage /></PrivateRoute>} />
                    <Route path="/subscriptions" element={<PrivateRoute><SubscriptionsPage /></PrivateRoute>} />
                    <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </ThemeProvider>
    )
}

export default App
