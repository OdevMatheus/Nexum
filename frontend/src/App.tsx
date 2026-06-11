import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage.tsx'
import RegisterPage from './pages/auth/RegisterPage.tsx'
import VerifyEmailPage from './pages/auth/VerifyEmailPage.tsx'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.tsx'
import ResetPasswordPage from './pages/auth/ResetPasswordPage.tsx'
import DashboardPage from "./pages/dashboard/DashboardPage.tsx";
import ClientsPage from "./pages/clients/ClientsPage.tsx";
import ClientDetailPage from "./pages/clients/ClientDetailPage.tsx";
import PlansPage from "./pages/plans/PlansPage.tsx";
import PlanDetailPage from "./pages/plans/PlanDetailPage.tsx";
import SubscriptionsPage from "./pages/subscriptions/SubscriptionsPage.tsx";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ThemeToggle } from "./components/ThemeToggle";

const isAuthenticated = () => !!localStorage.getItem('accessToken')

function PrivateRoute({ children }: { children: React.ReactNode }) {
    return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
    return (
        <ThemeProvider>
            <ThemeToggle />
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
                <Route path="*" element={<Navigate to="/" replace />} />
                <Route path="/clients" element={<PrivateRoute><ClientsPage /></PrivateRoute>} />
                <Route path="/clients/:id" element={<PrivateRoute><ClientDetailPage /></PrivateRoute>} />
                <Route path="/plans" element={<PrivateRoute><PlansPage /></PrivateRoute>} />
                <Route path="/plans/:id" element={<PrivateRoute><PlanDetailPage /></PrivateRoute>} />
                <Route path="/subscriptions" element={<PrivateRoute><SubscriptionsPage /></PrivateRoute>} />
            </Routes>
        </ThemeProvider>
    )
}

export default App