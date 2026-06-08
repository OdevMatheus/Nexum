import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShieldAlert, Search, SlidersHorizontal, DollarSign } from 'lucide-react';
import { useSubscriptions, useCreateSubscription, useCancelSubscription, usePaySubscription } from '../../hooks/useSubscriptions';
import { useClients } from '../../hooks/useClients';
import { usePlans } from '../../hooks/usePlans';
import { getErrorMessage } from '../../services/authService';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Subscription } from '../../types/subscription';

export default function SubscriptionsPage() {
    useDocumentTitle('Assinaturas');
    
    const [searchParams] = useSearchParams();
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '');
    const [planIdFilter, setPlanIdFilter] = useState<string>(searchParams.get('planId') || '');
    const [showForm, setShowForm] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const filtersRef = useRef<HTMLDivElement>(null);
    
    const [payModalOpen, setPayModalOpen] = useState(false);
    const [selectedSubForPay, setSelectedSubForPay] = useState<Subscription | null>(null);
    
    // Form state
    const [clientId, setClientId] = useState('');
    const [planId, setPlanId] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    const { data: subscriptionsData, isLoading } = useSubscriptions(page, 10, search || undefined, statusFilter || undefined, undefined, planIdFilter || undefined);
    
    // Fetch clients and plans for the select inputs (fetching a large page for simplicity in this MVP)
    const { data: clientsData, isLoading: loadingClients } = useClients(0, 100);
    const { data: plansData, isLoading: loadingPlans } = usePlans(0, 100, undefined, true);

    const { mutate: createSub, isPending: creating, error: createError } = useCreateSubscription();
    const { mutate: cancelSub, isPending: canceling } = useCancelSubscription();
    const { mutate: paySub, isPending: paying } = usePaySubscription();

    const handleCreate = () => {
        if (!clientId || !planId) return;
        createSub({ clientId, planId, startDate }, {
            onSuccess: () => {
                setShowForm(false);
                setClientId('');
                setPlanId('');
                setStartDate(new Date().toISOString().split('T')[0]);
            }
        });
    };

    const handlePayConfirm = () => {
        if (!selectedSubForPay) return;
        paySub(selectedSubForPay.id, {
            onSuccess: () => {
                setPayModalOpen(false);
                setSelectedSubForPay(null);
            }
        });
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
                setShowFilters(false);
            }
        };
        if (showFilters) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showFilters]);

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight transition-colors">Assinaturas</h1>
                    <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 transition-colors">Visão global e gerenciamento de assinaturas vinculadas.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowForm(!showForm)}
                    className="bg-stone-900 hover:bg-stone-800 dark:bg-rose-500 dark:hover:bg-rose-600 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Nova Assinatura
                </motion.button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 mb-8 overflow-hidden shadow-sm dark:shadow-none transition-colors duration-500"
                    >
                        <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4 transition-colors">Vincular Cliente a um Plano</h2>
                        
                        {createError && (
                            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium transition-colors">
                                {getErrorMessage(createError)}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Cliente</label>
                                <select
                                    value={clientId}
                                    onChange={e => setClientId(e.target.value)}
                                    className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all appearance-none"
                                >
                                    <option value="" disabled>{loadingClients ? 'Carregando...' : 'Selecione um cliente'}</option>
                                    {clientsData?.content.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Plano</label>
                                <select
                                    value={planId}
                                    onChange={e => setPlanId(e.target.value)}
                                    className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all appearance-none"
                                >
                                    <option value="" disabled>{loadingPlans ? 'Carregando...' : 'Selecione um plano'}</option>
                                    {plansData?.content.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - {p.amountFormatted} ({p.recurrenceLabel})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Data de Início</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCreate}
                                disabled={creating || !clientId || !planId}
                                className="bg-stone-900 hover:bg-stone-800 dark:bg-rose-500 dark:hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
                            >
                                {creating ? 'Processando...' : 'Confirmar Assinatura'}
                            </motion.button>
                            <button
                                onClick={() => setShowForm(false)}
                                className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex gap-3 mb-6 relative z-10 w-full" ref={filtersRef}>
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-stone-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar assinaturas por nome do cliente..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(0); }}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all shadow-sm dark:shadow-none"
                    />
                </div>
                
                <div className="relative">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center h-full px-4 rounded-2xl border transition-all ${
                            (statusFilter !== '' || planIdFilter !== '')
                            ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-800'
                        }`}
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                        {(statusFilter !== '' || planIdFilter !== '') && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white dark:border-stone-950 rounded-full" />
                        )}
                    </button>
                    
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-14 w-64 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl dark:shadow-2xl z-50"
                            >
                                <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">Filtros Avançados</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-stone-700 dark:text-stone-300 text-sm font-medium mb-1.5">Status da Assinatura</label>
                                        <select
                                            value={statusFilter}
                                            onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
                                            className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all appearance-none"
                                        >
                                            <option value="">Todos os status</option>
                                            <option value="ACTIVE">Ativas</option>
                                            <option value="TRIAL">Trial</option>
                                            <option value="OVERDUE">Vencidas</option>
                                            <option value="SUSPENDED">Suspensas</option>
                                            <option value="CANCELLED">Canceladas</option>
                                        </select>
                                    </div>
                                    {(statusFilter !== '' || planIdFilter !== '') && (
                                        <button
                                            onClick={() => {
                                                setStatusFilter('');
                                                setPlanIdFilter('');
                                                setPage(0);
                                                setShowFilters(false);
                                            }}
                                            className="w-full text-sm text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium py-2 transition-colors"
                                        >
                                            Limpar Filtros
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-rose-200 dark:border-stone-800 border-t-rose-500 dark:border-t-rose-500 rounded-full animate-spin transition-colors" />
                </div>
            ) : (
                <>
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-500">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 transition-colors">
                                        <th className="font-medium text-stone-500 dark:text-stone-400 px-6 py-4">Cliente</th>
                                        <th className="font-medium text-stone-500 dark:text-stone-400 px-6 py-4">Plano</th>
                                        <th className="font-medium text-stone-500 dark:text-stone-400 px-6 py-4">Início</th>
                                        <th className="font-medium text-stone-500 dark:text-stone-400 px-6 py-4">Próximo Vencimento</th>
                                        <th className="font-medium text-stone-500 dark:text-stone-400 px-6 py-4">Status</th>
                                        <th className="font-medium text-stone-500 dark:text-stone-400 px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {subscriptionsData?.content.map(sub => (
                                        <tr key={sub.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <span className="font-medium text-stone-800 dark:text-stone-200 block">{sub.clientName}</span>
                                                    <span className="text-xs text-stone-500 dark:text-stone-400">{sub.clientEmail}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <span className="font-medium text-stone-800 dark:text-stone-200 block">{sub.planName}</span>
                                                    <span className="text-xs text-stone-500 dark:text-stone-400">{sub.planAmountFormatted} • {sub.planRecurrenceLabel}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                                                {new Date(sub.startDate).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                                                {sub.nextDueDate ? new Date(sub.nextDueDate).toLocaleDateString('pt-BR') : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                        sub.status === 'ACTIVE' || sub.status === 'REACTIVATED' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 
                                                        sub.status === 'TRIAL' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' :
                                                        sub.status === 'CANCELLED' ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700' :
                                                        'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                                                    }`}>
                                                    {sub.statusLabel}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {sub.status !== 'CANCELLED' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedSubForPay(sub);
                                                                setPayModalOpen(true);
                                                            }}
                                                            className="inline-flex items-center justify-center p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-500 dark:hover:bg-emerald-500/10 transition-colors"
                                                            title="Marcar Pagamento"
                                                        >
                                                            <DollarSign className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {sub.status !== 'CANCELLED' ? (
                                                        <button
                                                            onClick={() => cancelSub(sub.id)}
                                                            disabled={canceling}
                                                            className="inline-flex items-center justify-center p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                                            title="Cancelar Assinatura"
                                                        >
                                                            <ShieldAlert className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <span className="text-stone-400 dark:text-stone-600 text-xs font-medium px-2">—</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {subscriptionsData?.content.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-stone-500 dark:text-stone-400">
                                                Nenhuma assinatura encontrada com os filtros atuais.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <p className="text-stone-500 dark:text-stone-400 text-sm">
                            Mostrando {subscriptionsData?.content.length || 0} de {subscriptionsData?.totalElements || 0} assinaturas
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-50 text-stone-700 dark:text-stone-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm dark:shadow-none"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={subscriptionsData?.last}
                                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-50 text-stone-700 dark:text-stone-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm dark:shadow-none"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                </>
            )}

            <AnimatePresence>
                {payModalOpen && selectedSubForPay && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 w-full max-w-md shadow-xl"
                        >
                            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-2">Confirmar Pagamento</h2>
                            <p className="text-stone-600 dark:text-stone-400 text-sm mb-6">
                                Deseja confirmar o pagamento para a assinatura de <strong>{selectedSubForPay.clientName}</strong>? O próximo vencimento será atualizado.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setPayModalOpen(false);
                                        setSelectedSubForPay(null);
                                    }}
                                    className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handlePayConfirm}
                                    disabled={paying}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                                >
                                    {paying ? 'Processando...' : 'Confirmar Pagamento'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}