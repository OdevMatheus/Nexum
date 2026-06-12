import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useUserProfile, useUpdateProfile, useChangePassword } from '../../hooks/useUser';
import { getErrorMessage } from '../../services/authService';
import { User, Shield, Key, Mail, Edit2, AlertTriangle, CheckCircle, Info, Lock } from 'lucide-react';

export default function SettingsPage() {
    useDocumentTitle('Configurações');

    const { data: profile, isLoading: loadingProfile, error: profileError } = useUserProfile();
    const updateProfileMutation = useUpdateProfile();
    const changePasswordMutation = useChangePassword();

    const [profileForm, setProfileForm] = useState({
        name: '',
        email: '',
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
    const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (profile) {
            const timer = setTimeout(() => {
                setProfileForm({
                    name: profile.name,
                    email: profile.email,
                });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [profile]);

    const isEmailModified = profile ? profileForm.email !== profile.email : false;

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProfileSuccess(null);
        setProfileErrorMsg(null);

        updateProfileMutation.mutate(profileForm, {
            onSuccess: (response) => {
                setProfileSuccess(response.message || 'Perfil atualizado com sucesso!');
            },
            onError: (err) => {
                setProfileErrorMsg(getErrorMessage(err));
            }
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordSuccess(null);
        setPasswordErrorMsg(null);

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordErrorMsg('As senhas não coincidem.');
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            setPasswordErrorMsg('A nova senha deve ter no mínimo 8 caracteres.');
            return;
        }

        changePasswordMutation.mutate({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
        }, {
            onSuccess: (response) => {
                setPasswordSuccess(response.message || 'Senha atualizada com sucesso!');
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            },
            onError: (err) => {
                setPasswordErrorMsg(getErrorMessage(err));
            }
        });
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
                
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight transition-colors">
                        Configurações
                    </h1>
                    <p className="text-stone-500 dark:text-stone-400 mt-1.5 transition-colors">
                        Gerencie as informações da sua conta e preferências de segurança.
                    </p>
                </div>

                {loadingProfile ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl">
                        <div className="w-10 h-10 border-4 border-rose-200 dark:border-stone-800 border-t-rose-500 rounded-full animate-spin mb-4" />
                        <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
                            Carregando suas informações...
                        </span>
                    </div>
                ) : profileError ? (
                    <div className="p-6 text-center bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 rounded-3xl">
                        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">Falha ao carregar perfil</h3>
                        <p className="text-stone-500 dark:text-stone-400 mt-1">
                            Não foi possível obter os dados da conta. Verifique sua conexão.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none transition-all"
                        >
                            <div className="flex items-center gap-3 border-b border-stone-100 dark:border-stone-800/50 pb-5 mb-6 transition-colors">
                                <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-500">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 transition-colors">
                                        Dados Pessoais
                                    </h2>
                                    <p className="text-stone-500 dark:text-stone-400 text-sm transition-colors">
                                        Altere seu nome completo e seu endereço de e-mail corporativo.
                                    </p>
                                </div>
                            </div>

                            {profileSuccess && (
                                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-3 transition-colors">
                                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <span>{profileSuccess}</span>
                                </div>
                            )}

                            {profileErrorMsg && (
                                <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3 transition-colors">
                                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <span>{profileErrorMsg}</span>
                                </div>
                            )}

                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-2 transition-colors">
                                            Nome Completo
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500">
                                                <Edit2 className="w-4 h-4" />
                                            </span>
                                            <input
                                                type="text"
                                                value={profileForm.name}
                                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                required
                                                placeholder="Seu nome"
                                                className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-rose-300 dark:focus:border-rose-500/50 focus:ring-4 focus:ring-rose-50 dark:focus:ring-rose-500/10 transition-all placeholder:text-stone-400"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-2 transition-colors">
                                            E-mail de Acesso
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500">
                                                <Mail className="w-4 h-4" />
                                            </span>
                                            <input
                                                type="email"
                                                value={profileForm.email}
                                                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                required
                                                placeholder="seu@email.com"
                                                className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-rose-300 dark:focus:border-rose-500/50 focus:ring-4 focus:ring-rose-50 dark:focus:ring-rose-500/10 transition-all placeholder:text-stone-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {isEmailModified && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm flex gap-3 transition-colors"
                                    >
                                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold">Atenção ao alterar o e-mail!</p>
                                            <p className="mt-0.5 leading-relaxed">
                                                Ao alterar seu e-mail, por motivos de segurança, você será <strong>deslogado imediatamente</strong> do sistema. Um link de verificação será enviado ao novo endereço e a conta ficará inativa até que você complete a confirmação.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={updateProfileMutation.isPending}
                                        className="bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 disabled:opacity-50 text-white dark:text-stone-900 font-medium px-6 py-3 rounded-2xl text-sm transition-all"
                                    >
                                        {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none transition-all"
                        >
                            <div className="flex items-center gap-3 border-b border-stone-100 dark:border-stone-800/50 pb-5 mb-6 transition-colors">
                                <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-500">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 transition-colors">
                                        Segurança da Conta
                                    </h2>
                                    <p className="text-stone-500 dark:text-stone-400 text-sm transition-colors">
                                        Mantenha sua senha forte e atualizada regularmente.
                                    </p>
                                </div>
                            </div>

                            {passwordSuccess && (
                                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-3 transition-colors">
                                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <span>{passwordSuccess}</span>
                                </div>
                            )}

                            {passwordErrorMsg && (
                                <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3 transition-colors">
                                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <span>{passwordErrorMsg}</span>
                                </div>
                            )}

                            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-2 transition-colors">
                                            Senha Atual
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500">
                                                <Lock className="w-4 h-4" />
                                            </span>
                                            <input
                                                type="password"
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                required
                                                placeholder="••••••••"
                                                className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-rose-300 dark:focus:border-rose-500/50 focus:ring-4 focus:ring-rose-50 dark:focus:ring-rose-500/10 transition-all placeholder:text-stone-400"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-2 transition-colors">
                                            Nova Senha
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500">
                                                <Key className="w-4 h-4" />
                                            </span>
                                            <input
                                                type="password"
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                required
                                                placeholder="Mín. 8 caracteres"
                                                className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-rose-300 dark:focus:border-rose-500/50 focus:ring-4 focus:ring-rose-50 dark:focus:ring-rose-500/10 transition-all placeholder:text-stone-400"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-2 transition-colors">
                                            Confirmar Nova Senha
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500">
                                                <Key className="w-4 h-4" />
                                            </span>
                                            <input
                                                type="password"
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                required
                                                placeholder="Confirme a nova senha"
                                                className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-rose-300 dark:focus:border-rose-500/50 focus:ring-4 focus:ring-rose-50 dark:focus:ring-rose-500/10 transition-all placeholder:text-stone-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={changePasswordMutation.isPending}
                                        className="bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 disabled:opacity-50 text-white dark:text-stone-900 font-medium px-6 py-3 rounded-2xl text-sm transition-all"
                                    >
                                        {changePasswordMutation.isPending ? 'Alterando...' : 'Alterar Senha'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>

                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}