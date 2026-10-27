import { useLogin } from '../../hooks/useAuth.ts'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import type { LoginRequest } from '../../types/auth.ts'
import { getErrorMessage } from '../../services/authService.ts'
import { Header } from '../../components/landing/Header'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

export default function LoginPage() {
    useDocumentTitle('Entrar na conta');
    const { mutate, isPending, error } = useLogin()
    const navigate = useNavigate()
    const [infoMessage, setInfoMessage] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [form, setForm] = useState<LoginRequest>({
        email: '',
        password: '',
    })

    useEffect(() => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('refreshToken');
        if (token) {
            navigate('/dashboard', { replace: true });
        }

        if (new URLSearchParams(window.location.search).get('emailChanged') === 'true') {
            const timer = setTimeout(() => {
                setInfoMessage('E-mail atualizado com sucesso! Por segurança, enviamos um link de confirmação para o seu novo e-mail. Por favor, confirme-o para reativar sua conta e fazer o login.')
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mutate(form)
    }

    return (
        <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-stone-950 font-sans selection:bg-rose-200 selection:text-stone-900 dark:selection:bg-rose-500/30 dark:selection:text-rose-100 flex flex-col transition-colors duration-500 overflow-hidden">
            <Header hideLoginButton={true} />

            {/* Ambient Background Glows & Architectural Grid */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[750px] h-[400px] bg-gradient-to-tr from-rose-500/20 via-fuchsia-500/15 to-indigo-500/20 dark:from-rose-500/20 dark:via-fuchsia-500/10 dark:to-blue-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-[110px]" />
                <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-indigo-500/10 dark:bg-blue-500/15 rounded-full blur-[110px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="relative z-10 flex-grow flex items-center justify-center px-4 pt-24 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                    className="relative w-full max-w-md"
                >
                    {/* Backlight Rose + Indigo Aura */}
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-rose-500/25 via-fuchsia-500/15 to-indigo-500/25 rounded-[2rem] blur-2xl opacity-75 dark:opacity-90 -z-10" />

                    {/* Auth Card */}
                    <div className="relative w-full bg-white/95 dark:bg-stone-900/90 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] border border-stone-200/80 dark:border-stone-800/90 transition-colors duration-500 overflow-hidden">
                        {/* Top Specular Highlight Line */}
                        <div className="absolute top-0 inset-x-10 h-px bg-gradient-to-r from-transparent via-rose-400/70 to-indigo-400/70" />

                        <div className="text-center mb-8">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight mb-2 transition-colors">
                                Bem-vindo de volta
                            </h1>
                            <p className="text-stone-600 dark:text-stone-400 text-sm transition-colors">
                                Acesse sua conta Nexum para continuar
                            </p>
                        </div>

                        {infoMessage && (
                            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-3 font-medium transition-colors">
                                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                                <span>{infoMessage}</span>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-3 font-medium transition-colors">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span>{getErrorMessage(error)}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5 ml-1 transition-colors">
                                    E-mail
                                </label>
                                <div className="relative group">
                                    <Mail className="w-4 h-4 text-stone-400 dark:text-stone-500 group-focus-within:text-rose-500 dark:group-focus-within:text-rose-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                                    <input
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        required
                                        className="w-full bg-[#FDFBF7] dark:bg-stone-950/90 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-rose-400 dark:focus:border-rose-500/60 focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-rose-500/15 transition-all placeholder:text-stone-400 dark:placeholder:text-stone-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5 ml-1">
                                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 transition-colors">
                                        Senha
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs text-rose-500 dark:text-rose-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors font-semibold"
                                    >
                                        Esqueceu a senha?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="w-4 h-4 text-stone-400 dark:text-stone-500 group-focus-within:text-rose-500 dark:group-focus-within:text-rose-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Sua senha"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        required
                                        className="w-full bg-[#FDFBF7] dark:bg-stone-950/90 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-2xl pl-11 pr-11 py-3.5 text-sm focus:outline-none focus:border-rose-400 dark:focus:border-rose-500/60 focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-rose-500/15 transition-all placeholder:text-stone-400 dark:placeholder:text-stone-600"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors p-1"
                                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 via-rose-500 to-indigo-600 hover:from-rose-400 hover:via-rose-500 hover:to-indigo-500 disabled:opacity-60 text-white font-semibold rounded-2xl py-3.5 text-sm transition-all duration-300 shadow-lg shadow-rose-500/25 dark:shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/35 hover:-translate-y-0.5 mt-2 group cursor-pointer"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    <>
                                        Entrar na conta
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-stone-600 dark:text-stone-400 text-sm mt-8 transition-colors">
                            Não tem uma conta?{' '}
                            <Link
                                to="/register"
                                className="bg-gradient-to-r from-rose-500 to-indigo-500 bg-clip-text text-transparent hover:opacity-80 font-bold transition-opacity"
                            >
                                Criar conta
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
