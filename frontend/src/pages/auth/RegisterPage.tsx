import { useRegister } from '../../hooks/useAuth.ts'
import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { getErrorMessage } from '../../services/authService.ts'
import { Header } from '../../components/landing/Header'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

export default function RegisterPage() {
    useDocumentTitle('Criar conta');
    const { mutate, isPending, isSuccess, error } = useRegister()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('refreshToken');
        if (token) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault()
        mutate({ name, email, password })
    }, [mutate, name, email, password])

    const togglePassword = useCallback(() => {
        setShowPassword(prev => !prev)
    }, [])

    return (
        <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-stone-950 font-sans selection:bg-rose-200 selection:text-stone-900 dark:selection:bg-rose-500/30 dark:selection:text-rose-100 flex flex-col transition-colors duration-300 overflow-hidden">
            <Header hideRegisterButton={true} />

            {/* Zero-Blur GPU Radial Ambient Glows & Architectural Grid */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
                style={{
                    backgroundImage: `
                        radial-gradient(ellipse 55% 38% at 50% 4%, rgba(244, 63, 94, 0.18), rgba(168, 85, 247, 0.10) 45%, transparent 75%),
                        radial-gradient(circle at 25% 72%, rgba(244, 63, 94, 0.12), transparent 40%),
                        radial-gradient(circle at 75% 35%, rgba(99, 102, 241, 0.14), transparent 40%)
                    `,
                }}
            >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] opacity-60" />
            </div>

            <div className="relative z-10 flex-grow flex items-center justify-center px-4 pt-24 pb-12">
                <div className="relative w-full max-w-md animate-fade-up">
                    {/* Zero-Blur Radial Backlight Rose + Indigo Aura */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-6 rounded-[2.5rem] -z-10"
                        style={{
                            background:
                                'radial-gradient(ellipse at center, rgba(244, 63, 94, 0.22) 0%, rgba(99, 102, 241, 0.18) 48%, transparent 72%)',
                        }}
                    />

                    {/* Auth Card */}
                    <div className="relative w-full bg-white dark:bg-stone-900 rounded-3xl p-8 sm:p-10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] border border-stone-200/80 dark:border-stone-800/90 transition-colors duration-300 overflow-hidden">
                        {/* Top Specular Highlight Line */}
                        <div className="absolute top-0 inset-x-10 h-px bg-gradient-to-r from-transparent via-rose-400/70 to-indigo-400/70" />

                        <div className="text-center mb-8">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight mb-2 transition-colors">
                                Criar conta
                            </h1>
                            <p className="text-stone-600 dark:text-stone-400 text-sm transition-colors">
                                Preencha os dados abaixo para começar
                            </p>
                        </div>

                        {isSuccess && (
                            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-3 font-medium transition-colors">
                                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                                <span>Cadastro realizado! Verifique seu e-mail para ativar a conta.</span>
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
                                <label
                                    htmlFor="register-name"
                                    className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5 ml-1 transition-colors"
                                >
                                    Nome
                                </label>
                                <div className="relative group">
                                    <User className="w-4 h-4 text-stone-400 dark:text-stone-500 group-focus-within:text-rose-500 dark:group-focus-within:text-rose-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                                    <input
                                        id="register-name"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="Seu nome completo"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-rose-400 dark:focus:border-rose-500/60 focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-rose-500/15 transition-[border-color,box-shadow,background-color,color] duration-200 placeholder:text-stone-400 dark:placeholder:text-stone-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="register-email"
                                    className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5 ml-1 transition-colors"
                                >
                                    E-mail
                                </label>
                                <div className="relative group">
                                    <Mail className="w-4 h-4 text-stone-400 dark:text-stone-500 group-focus-within:text-rose-500 dark:group-focus-within:text-rose-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                                    <input
                                        id="register-email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-rose-400 dark:focus:border-rose-500/60 focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-rose-500/15 transition-[border-color,box-shadow,background-color,color] duration-200 placeholder:text-stone-400 dark:placeholder:text-stone-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="register-password"
                                    className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5 ml-1 transition-colors"
                                >
                                    Senha
                                </label>
                                <div className="relative group">
                                    <Lock className="w-4 h-4 text-stone-400 dark:text-stone-500 group-focus-within:text-rose-500 dark:group-focus-within:text-rose-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                                    <input
                                        id="register-password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="Mínimo 8 caracteres"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-2xl pl-11 pr-11 py-3.5 text-sm focus:outline-none focus:border-rose-400 dark:focus:border-rose-500/60 focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-rose-500/15 transition-[border-color,box-shadow,background-color,color] duration-200 placeholder:text-stone-400 dark:placeholder:text-stone-600"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={togglePassword}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors p-1 cursor-pointer"
                                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 via-rose-500 to-indigo-600 hover:from-rose-400 hover:via-rose-500 hover:to-indigo-500 disabled:opacity-60 text-white font-semibold rounded-2xl py-3.5 text-sm transition-[transform,box-shadow,opacity] duration-200 shadow-lg shadow-rose-500/25 dark:shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/35 hover:-translate-y-0.5 mt-2 group cursor-pointer"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Criando conta...
                                    </>
                                ) : (
                                    <>
                                        Criar conta
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-stone-600 dark:text-stone-400 text-sm mt-8 transition-colors">
                            Já tem uma conta?{' '}
                            <Link
                                to="/login"
                                className="bg-gradient-to-r from-rose-500 to-indigo-500 bg-clip-text text-transparent hover:opacity-80 font-bold transition-opacity"
                            >
                                Entrar
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
