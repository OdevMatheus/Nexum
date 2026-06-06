import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService.ts';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '../../types/auth.ts';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-verified'>(
        token ? 'loading' : 'error'
    );

    useEffect(() => {
        if (!token) return;

        authService.verifyEmail(token)
            .then(() => setStatus('success'))
            .catch((error: AxiosError<ErrorResponse>) => {
                const message = error.response?.data?.message;
                if (message === 'Invalid or expired verification token') {
                    setStatus('already-verified');
                } else {
                    setStatus('error');
                }
            });
    }, [token]);

    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-stone-950 flex items-center justify-center px-4 transition-colors duration-500">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-8 shadow-sm dark:shadow-none border border-stone-100 dark:border-stone-800 text-center transition-colors duration-500"
            >
                {status === 'loading' && (
                    <div className="py-8">
                        <div className="w-10 h-10 border-4 border-rose-200 dark:border-stone-800 border-t-rose-500 dark:border-t-rose-500 rounded-full animate-spin mx-auto mb-6 transition-colors" />
                        <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 transition-colors">Verificando...</h2>
                        <p className="text-stone-500 dark:text-stone-400 mt-2 transition-colors">Estamos validando seu acesso.</p>
                    </div>
                )}

                {(status === 'success' || status === 'already-verified') && (
                    <div className="py-2">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
                            <span className="text-emerald-500 dark:text-emerald-400 text-3xl transition-colors">✓</span>
                        </div>
                        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2 transition-colors">
                            {status === 'success' ? 'E-mail verificado!' : 'E-mail já verificado!'}
                        </h2>
                        <p className="text-stone-600 dark:text-stone-400 mb-8 transition-colors">Sua conta está ativa. Você já pode começar a usar o Nexum.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 font-medium rounded-xl px-6 py-3 transition-colors"
                        >
                            Ir para o login
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="py-2">
                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
                            <span className="text-rose-500 dark:text-rose-400 text-2xl transition-colors">✕</span>
                        </div>
                        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2 transition-colors">Algo deu errado</h2>
                        <p className="text-stone-600 dark:text-stone-400 mb-8 transition-colors">O link de verificação é inválido ou expirou.</p>
                        <button
                            onClick={() => navigate('/register')}
                            className="w-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 font-medium rounded-xl px-6 py-3 transition-colors"
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}