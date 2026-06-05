import { useRegister } from '../../hooks/useAuth.ts'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { RegisterRequest } from '../../types/auth.ts'
import { getErrorMessage } from '../../services/authService.ts'
import { Header } from '../../components/landing/Header'

export default function RegisterPage() {
    const { mutate, isPending, isSuccess, error } = useRegister()
    const [form, setForm] = useState<RegisterRequest>({
        name: '',
        email: '',
        password: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mutate(form)
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col">

            <Header hideRegisterButton={true} />

            <div className="flex-grow flex items-center justify-center px-4 pt-24 pb-12">
                <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-stone-100">
                    <h1 className="text-2xl font-bold text-stone-800 mb-1 text-center">Criar conta</h1>
                    <p className="text-stone-500 text-sm mb-8 text-center">Preencha os dados abaixo para começar</p>

                    {isSuccess && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm text-center font-medium">
                            Cadastro realizado! Verifique seu e-mail para ativar a conta.
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm text-center font-medium">
                            {getErrorMessage(error)}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1.5 ml-1">Nome</label>
                            <input
                                type="text"
                                placeholder="Seu nome completo"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full bg-[#FDFBF7] border border-stone-200 text-stone-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all placeholder:text-stone-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1.5 ml-1">E-mail</label>
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full bg-[#FDFBF7] border border-stone-200 text-stone-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all placeholder:text-stone-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1.5 ml-1">Senha</label>
                            <input
                                type="password"
                                placeholder="Mínimo 8 caracteres"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full bg-[#FDFBF7] border border-stone-200 text-stone-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all placeholder:text-stone-400"
                                required
                                minLength={8}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-rose-400 hover:bg-rose-500 disabled:opacity-60 text-white font-medium rounded-full py-3.5 text-sm transition-all shadow-sm hover:shadow-rose-200 mt-2"
                        >
                            {isPending ? 'Criando conta...' : 'Criar conta'}
                        </button>
                    </form>

                    <p className="text-center text-stone-500 text-sm mt-8">
                        Já tem uma conta?{' '}
                        <Link to="/login" className="text-rose-500 hover:text-rose-600 font-semibold transition-colors">
                            Entrar
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}