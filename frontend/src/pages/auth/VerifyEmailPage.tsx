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
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-stone-100 text-center"
            >
                {status === 'loading' && (
                    <div className="py-8">
                        <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-6" />
                        <h2 className="text-xl font-bold text-stone-800">Verificando...</h2>
                        <p className="text-stone-500 mt-2">Estamos validando seu acesso.</p>
                    </div>
                )}

                {(status === 'success' || status === 'already-verified') && (
                    <div className="py-2">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-emerald-500 text-3xl">✓</span>
                        </div>
                        <h2 className="text-2xl font-bold text-stone-800 mb-2">
                            {status === 'success' ? 'E-mail verificado!' : 'E-mail já verificado!'}
                        </h2>
                        <p className="text-stone-600 mb-8">Sua conta está ativa. Você já pode começar a usar o Nexum.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl px-6 py-3 transition"
                        >
                            Ir para o login
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="py-2">
                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-rose-500 text-2xl">✕</span>
                        </div>
                        <h2 className="text-2xl font-bold text-stone-800 mb-2">Algo deu errado</h2>
                        <p className="text-stone-600 mb-8">O link de verificação é inválido ou expirou.</p>
                        <button
                            onClick={() => navigate('/register')}
                            className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium rounded-xl px-6 py-3 transition"
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}