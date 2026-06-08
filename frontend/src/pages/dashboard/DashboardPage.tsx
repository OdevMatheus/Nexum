import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useMetricsSummary, useRecentPayments, useUpcomingSubscriptions, useMonthlyRevenue } from '../../hooks/useMetrics';
import { motion } from 'framer-motion';
import { Users, AlertCircle, Clock, DollarSign, TrendingUp, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
    useDocumentTitle('Dashboard');

    const { data: summary, isLoading: loadingSummary } = useMetricsSummary();
    const { data: recentPayments, isLoading: loadingPayments } = useRecentPayments();
    const { data: upcoming, isLoading: loadingUpcoming } = useUpcomingSubscriptions();
    const { data: monthlyRevenue, isLoading: loadingRevenue } = useMonthlyRevenue();

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(cents / 100);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 24 }
        }
    };

    const maxRevenue = monthlyRevenue && monthlyRevenue.length > 0 
        ? Math.max(...monthlyRevenue.map(m => m.amount)) 
        : 1;

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight transition-colors">
                        Bem-vindo de volta!
                    </h1>
                    <p className="text-stone-500 dark:text-stone-400 mt-2 transition-colors">
                        Aqui está o resumo do seu negócio hoje.
                    </p>
                </div>

                {/* Summary Cards */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <motion.div variants={itemVariants} className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">Assinaturas Ativas</p>
                                <h3 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mt-2">
                                    {loadingSummary ? '...' : summary?.activeSubscriptions || 0}
                                </h3>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">MRR</p>
                                <h3 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mt-2">
                                    {loadingSummary ? '...' : formatCurrency(summary?.mrr || 0)}
                                </h3>
                            </div>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">Faturas Atrasadas</p>
                                <h3 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mt-2">
                                    {loadingSummary ? '...' : summary?.overdueSubscriptions || 0}
                                </h3>
                            </div>
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">A Vencer (7 dias)</p>
                                <h3 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mt-2">
                                    {loadingSummary ? '...' : summary?.upcomingDueIn7Days || 0}
                                </h3>
                            </div>
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Monthly Revenue Chart (CSS based) */}
                    <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-100 dark:border-stone-800 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">Receita Mensal</h2>
                            <DollarSign className="w-5 h-5 text-stone-400" />
                        </div>
                        {loadingRevenue ? (
                            <div className="h-64 flex items-center justify-center text-stone-400">Carregando...</div>
                        ) : monthlyRevenue && monthlyRevenue.length > 0 ? (
                            <div className="h-64 flex items-end gap-4">
                                {monthlyRevenue.map((item, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-2 group">
                                        <div className="w-full relative flex justify-center h-full items-end">
                                            <div 
                                                className="w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-t-lg transition-all duration-500 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50 relative overflow-hidden"
                                                style={{ height: `${(item.amount / maxRevenue) * 100}%`, minHeight: '4px' }}
                                            >
                                                <div className="absolute inset-x-0 bottom-0 bg-emerald-500 dark:bg-emerald-400 opacity-20 group-hover:opacity-100 transition-opacity" style={{ height: '100%' }}></div>
                                            </div>
                                            <div className="absolute -top-8 bg-stone-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                                {formatCurrency(item.amount)}
                                            </div>
                                        </div>
                                        <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-stone-400">Sem dados de receita</div>
                        )}
                    </div>

                    <div className="space-y-8">
                        {/* Upcoming Subscriptions */}
                        <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-100 dark:border-stone-800 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">Próximos Vencimentos</h2>
                                <Calendar className="w-5 h-5 text-stone-400" />
                            </div>
                            <div className="space-y-4">
                                {loadingUpcoming ? (
                                    <p className="text-sm text-stone-500">Carregando...</p>
                                ) : upcoming && upcoming.length > 0 ? (
                                    upcoming.slice(0, 5).map(sub => (
                                        <div key={sub.subscriptionId} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 font-medium text-sm">
                                                    {sub.clientName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{sub.clientName}</p>
                                                    <p className="text-xs text-stone-500 dark:text-stone-400">
                                                        Vence em {format(new Date(sub.dueDate + 'T00:00:00'), "dd 'de' MMM", { locale: ptBR })}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium text-stone-800 dark:text-stone-100">
                                                {formatCurrency(sub.amount)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-stone-500">Nenhum vencimento próximo.</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Payments */}
                        <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-100 dark:border-stone-800 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">Pagamentos Recentes</h2>
                                <CheckCircle className="w-5 h-5 text-stone-400" />
                            </div>
                            <div className="space-y-4">
                                {loadingPayments ? (
                                    <p className="text-sm text-stone-500">Carregando...</p>
                                ) : recentPayments && recentPayments.length > 0 ? (
                                    recentPayments.slice(0, 5).map(payment => (
                                        <div key={payment.cycleId} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${payment.status === 'PAID' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                    {payment.status === 'PAID' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-stone-800 dark:text-stone-100 line-clamp-1">{payment.clientName}</p>
                                                    <p className="text-xs text-stone-500 dark:text-stone-400">{payment.planName}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium text-stone-800 dark:text-stone-100">
                                                {formatCurrency(payment.amount)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-stone-500">Nenhum pagamento recente.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
