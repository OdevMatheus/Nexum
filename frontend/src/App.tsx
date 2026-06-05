import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage.tsx'
import RegisterPage from './pages/auth/RegisterPage.tsx'
import VerifyEmailPage from './pages/auth/VerifyEmailPage.tsx'
import ClientsPage from "./pages/clients/ClientsPage.tsx";
import ClientDetailPage from "./pages/clients/ClientDetailPage.tsx";
import PlansPage from "./pages/plans/PlansPage.tsx";
import PlanDetailPage from "./pages/plans/PlanDetailPage.tsx";

const isAuthenticated = () => !!sessionStorage.getItem('accessToken')

function PrivateRoute({ children }: { children: React.ReactNode }) {
    return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                            <h1 className="text-white text-2xl">Dashboard — em breve</h1>
                        </div>
                    </PrivateRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/clients" element={<PrivateRoute><ClientsPage /></PrivateRoute>} />
            <Route path="/clients/:id" element={<PrivateRoute><ClientDetailPage /></PrivateRoute>} />
            <Route path="/plans" element={<PrivateRoute><PlansPage /></PrivateRoute>} />
            <Route path="/plans/:id" element={<PrivateRoute><PlanDetailPage /></PrivateRoute>} />
        </Routes>
    )
}

export default App