import { useLogin } from '../../hooks/useAuth.ts'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { LoginRequest } from '../../types/auth.ts'
import { getErrorMessage } from '../../services/authService.ts'
import { Header } from '../../components/landing/Header'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

export default function LoginPage() {
    useDocumentTitle('Entrar na conta');
    const { mutate, isPending, error } = useLogin()
    const [form, setForm] = useState<LoginRequest>({
        email: '',
        password: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mutate(form)
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-stone-950 flex flex-col transition-colors duration-500">
            <Header hideLoginButton={true} />

            <div className="flex-grow flex items-center justify-center px-4 pt-20">
                <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none border border-stone-100 dark:border-stone-800 transition-colors duration-500">
                    <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-1 text-center transition-colors">Bem-vindo de volta</h1>
                    <p className="text-stone-500 dark:text-stone-400 text-sm mb-8 text-center transition-colors">Acesse sua conta Nexum para continuar</p>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm text-center font-medium transition-colors">
                            {getErrorMessage(error)}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1.5 ml-1 transition-colors">E-mail</label>
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-rose-300 dark:focus:border-rose-500/50 focus:ring-4 focus:ring-rose-50 dark:focus:ring-rose-500/10 transition-all placeholder:text-stone-400 dark:placeholder:text-stone-600"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5 ml-1">
                                <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 transition-colors">Senha</label>
                                <Link to="/forgot-password" className="text-xs text-rose-400 dark:text-rose-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors font-medium">
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <input
                                type="password"
                                placeholder="Sua senha"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-rose-300 dark:focus:border-rose-500/50 focus:ring-4 focus:ring-rose-50 dark:focus:ring-rose-500/10 transition-all placeholder:text-stone-400 dark:placeholder:text-stone-600"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-rose-400 hover:bg-rose-500 disabled:opacity-60 text-white font-medium rounded-full py-3.5 text-sm transition-all shadow-sm hover:shadow-rose-200 dark:hover:shadow-rose-900/40 mt-2"
                        >
                            {isPending ? 'Entrando...' : 'Entrar na conta'}
                        </button>
                    </form>

                    <p className="text-center text-stone-500 dark:text-stone-400 text-sm mt-8 transition-colors">
                        Não tem uma conta?{' '}
                        <Link to="/register" className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold transition-colors">
                            Criar conta
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}