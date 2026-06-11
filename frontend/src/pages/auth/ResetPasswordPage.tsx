import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useResetPassword } from '../../hooks/useAuth.ts'
import { getErrorMessage } from '../../services/authService.ts'
import { Header } from '../../components/landing/Header'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

export default function ResetPasswordPage() {
    useDocumentTitle('Definir Nova Senha')
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [validationError, setValidationError] = useState<string | null>(null)

    const { mutate, isPending, isSuccess, error } = useResetPassword()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setValidationError(null)

        if (!token) {
            setValidationError('Token de redefinição inválido ou ausente.')
            return
        }

        if (password.length < 8) {
            setValidationError('A senha deve ter no mínimo 8 caracteres.')
            return
        }

        const hasLetter = /[a-zA-Z]/.test(password)
        const hasNumber = /[0-9]/.test(password)
        if (!hasLetter || !hasNumber) {
            setValidationError('A senha deve conter pelo menos uma letra e um número.')
            return
        }

        if (password !== confirmPassword) {
            setValidationError('As senhas não coincidem.')
            return
        }

        mutate({ token, password })
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-stone-950 flex flex-col transition-colors duration-500">
            <Header hideLoginButton={true} />

            <div className="flex-grow flex items-center justify-center px-4 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none border border-stone-100 dark:border-stone-800 transition-colors duration-500"
                >
                    <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2 text-center transition-colors">
                        Nova Senha
                    </h1>
                    <p className="text-stone-500 dark:text-stone-400 text-sm mb-8 text-center transition-colors">
                        Escolha uma nova senha forte para acessar sua conta
                    </p>

                    {(error || validationError || !token) && (
                        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm text-center font-medium transition-colors">
                            {!token ? 'Token de recuperação ausente na URL.' : validationError || getErrorMessage(error)}
                        </div>
                    )}

                    {isSuccess ? (
                        <div className="space-y-6 text-center">
                            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto transition-colors">
                                <span className="text-emerald-500 dark:text-emerald-400 text-3xl">✓</span>
                            </div>
                            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 text-emerald-800 dark:text-emerald-400 text-sm font-medium">
                                Sua senha foi redefinida com sucesso! Você já pode fazer login na plataforma.
                            </div>
                            <Link
                                to="/login"
                                className="block w-full text-center bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 font-medium rounded-full py-3.5 text-sm transition-all animate-pulse"
                            >
                                Ir para o login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1.5 ml-1 transition-colors">
                                    Nova Senha
                                </label>
                                <input
                                    type="password"
                                    placeholder="Mínimo 8 caracteres com letras e números"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={!token}
                                    className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-rose-300 dark:focus:border-rose-500/50 focus:ring-4 focus:ring-rose-50 dark:focus:ring-rose-500/10 transition-all placeholder:text-stone-400 dark:placeholder:text-stone-600 disabled:opacity-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1.5 ml-1 transition-colors">
                                    Confirmar Nova Senha
                                </label>
                                <input
                                    type="password"
                                    placeholder="Confirme sua nova senha"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={!token}
                                    className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-rose-300 dark:focus:border-rose-500/50 focus:ring-4 focus:ring-rose-50 dark:focus:ring-rose-500/10 transition-all placeholder:text-stone-400 dark:placeholder:text-stone-600 disabled:opacity-50"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isPending || !token}
                                className="w-full bg-rose-400 hover:bg-rose-500 disabled:opacity-60 text-white font-medium rounded-full py-3.5 text-sm transition-all shadow-sm hover:shadow-rose-200 dark:hover:shadow-rose-900/40 mt-2"
                            >
                                {isPending ? 'Redefinindo...' : 'Redefinir senha'}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
