import { useLogin } from '../../hooks/useAuth.ts'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { LoginRequest } from '../../types/auth.ts'
import { getErrorMessage } from '../../services/authService.ts'
import { Header } from '../../components/landing/Header'

export default function LoginPage() {
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
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
            <Header hideLoginButton={true} />

            <div className="flex-grow flex items-center justify-center px-4 pt-20">
                <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-stone-100">
                    <h1 className="text-2xl font-bold text-stone-800 mb-1 text-center">Bem-vindo de volta</h1>
                    <p className="text-stone-500 text-sm mb-8 text-center">Acesse sua conta Nexum para continuar</p>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm text-center font-medium">
                            {getErrorMessage(error)}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1.5 ml-1">E-mail</label>
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                className="w-full bg-[#FDFBF7] border border-stone-200 text-stone-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all placeholder:text-stone-400"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5 ml-1">
                                <label className="block text-sm font-medium text-stone-600">Senha</label>
                                <Link to="/forgot-password" className="text-xs text-rose-400 hover:text-rose-500 transition-colors font-medium">
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <input
                                type="password"
                                placeholder="Sua senha"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                className="w-full bg-[#FDFBF7] border border-stone-200 text-stone-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all placeholder:text-stone-400"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-rose-400 hover:bg-rose-500 disabled:opacity-60 text-white font-medium rounded-full py-3.5 text-sm transition-all shadow-sm hover:shadow-rose-200 mt-2"
                        >
                            {isPending ? 'Entrando...' : 'Entrar na conta'}
                        </button>
                    </form>

                    <p className="text-center text-stone-500 text-sm mt-8">
                        Não tem uma conta?{' '}
                        <Link to="/register" className="text-rose-500 hover:text-rose-600 font-semibold transition-colors">
                            Criar conta
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}