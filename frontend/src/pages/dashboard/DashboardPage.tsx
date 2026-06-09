import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useMetricsSummary, useRecentPayments, useUpcomingSubscriptions, useClientGrowth, useActiveByPlan, useMrrByPlan, useMrrContributors } from '../../hooks/useMetrics';
import { useSubscriptions, usePaySubscription } from '../../hooks/useSubscriptions';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Users, AlertCircle, Clock, TrendingUp, Calendar, CheckCircle, XCircle, X, ArrowUpRight, MessageCircle, Check } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
    useDocumentTitle('Dashboard');
    const navigate = useNavigate();

    const [activeModal, setActiveModal] = useState<'ACTIVE_SUBS' | 'MRR' | 'OVERDUE' | 'UPCOMING' | null>(null);

    const { data: summary, isLoading: loadingSummary } = useMetricsSummary();
    const { data: recentPayments, isLoading: loadingPayments } = useRecentPayments();
    const { data: upcoming, isLoading: loadingUpcoming } = useUpcomingSubscriptions();
    const { data: clientGrowth, isLoading: loadingGrowth } = useClientGrowth();
    const { data: planDistribution, isLoading: loadingPlanDist } = useActiveByPlan();
    const { data: activeSubsData, isLoading: loadingActiveSubs } = useSubscriptions({ status: 'ACTIVE', size: 50 });
    const { data: mrrDistribution, isLoading: loadingMrrDist } = useMrrByPlan();
    const { data: mrrContributors, isLoading: loadingMrrContributors } = useMrrContributors();

    const { mutate: paySubscription } = usePaySubscription();
    const { data: overdueSubsData, isLoading: loadingOverdueSubs } = useSubscriptions({ status: 'OVERDUE', size: 50 });
    
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const next7DaysStr = format(addDays(new Date(), 7), 'yyyy-MM-dd');
    const { data: upcomingDetailedData, isLoading: loadingUpcomingDetailed } = useSubscriptions({
        nextDueDateFrom: todayStr,
        nextDueDateTo: next7DaysStr,
        size: 50
    });

    const getWhatsAppLink = (phone: string | undefined, clientName: string, planName: string, date: string, type: 'OVERDUE' | 'UPCOMING') => {
        if (!phone) return '#';
        const cleanPhone = phone.replace(/\D/g, '');
        const formattedPhone = cleanPhone.startsWith('55') || cleanPhone.length > 11 ? cleanPhone : `55${cleanPhone}`;
        
        const message = type === 'OVERDUE'
            ? `Olá, ${clientName}! Tudo bem? Passando para lembrar que a fatura da sua assinatura do plano ${planName} está pendente desde ${date}. Se precisar de ajuda para regularizar, estamos à disposição!`
            : `Olá, ${clientName}! Tudo bem? Passando para avisar que a fatura da sua assinatura do plano ${planName} vencerá em ${date}. Qualquer dúvida, estamos por aqui!`;
            
        return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    };

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(cents / 100);
    };

    // Cálculo das coordenadas do gráfico de linha
    const renderGrowthChart = () => {
        if (loadingGrowth) {
            return <div className="h-64 flex items-center justify-center text-stone-400">Carregando...</div>;
        }
        if (!clientGrowth || clientGrowth.length === 0) {
            return <div className="h-64 flex items-center justify-center text-stone-400">Sem dados de crescimento de clientes</div>;
        }

        const counts = clientGrowth.map(d => d.count);
        const minVal = Math.min(...counts);
        const maxVal = Math.max(...counts);
        const range = maxVal - minVal || 1;
        
        const width = 500;
        const height = 180;
        const paddingLeft = 35;
        const paddingRight = 35;
        const paddingTop = 25;
        const paddingBottom = 25;
        
        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        const points = clientGrowth.map((item, idx) => {
            const x = paddingLeft + (idx / 5) * chartWidth;
            const y = paddingTop + chartHeight - ((item.count - minVal) / range) * chartHeight;
            
            let percentageText = '+0%';
            if (idx > 0) {
                const prev = clientGrowth[idx - 1].count;
                if (prev > 0) {
                    const diff = ((item.count - prev) / prev) * 100;
                    percentageText = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
                } else if (item.count > 0) {
                    percentageText = '+100%';
                }
            } else {
                percentageText = 'Início';
            }

            return { x, y, label: item.label, count: item.count, percentageText };
        });

        const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

        const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

        return (
            <div className="relative">
                {/* SVG Chart */}
                <div className="h-64 w-full relative flex items-center justify-center">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                        {/* Define gradients */}
                        <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Horizontal Grid lines */}
                        <line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} stroke="currentColor" className="text-stone-100 dark:text-stone-800/50" strokeDasharray="3,3" />
                        <line x1={paddingLeft} y1={paddingTop + chartHeight / 2} x2={width - paddingRight} y2={paddingTop + chartHeight / 2} stroke="currentColor" className="text-stone-100 dark:text-stone-800/50" strokeDasharray="3,3" />
                        <line x1={paddingLeft} y1={paddingTop + chartHeight} x2={width - paddingRight} y2={paddingTop + chartHeight} stroke="currentColor" className="text-stone-100 dark:text-stone-800/50" />

                        {/* Area underneath the line */}
                        <path d={areaPath} fill="url(#areaGradient)" />

                        {/* Clean line */}
                        <path d={linePath} fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Interactive dots */}
                        {points.map((p, idx) => (
                            <g key={idx} className="group/dot cursor-pointer">
                                {/* Invisible larger interactive hover target */}
                                <circle cx={p.x} cy={p.y} r="12" className="fill-transparent" />
                                
                                {/* Inner visual dot */}
                                <circle 
                                    cx={p.x} 
                                    cy={p.y} 
                                    r="5" 
                                    className="fill-white stroke-rose-500 stroke-2 dark:fill-stone-900 group-hover/dot:r-7 transition-all duration-200" 
                                />

                                {/* Tooltip display on hover */}
                                <foreignObject 
                                    x={p.x - 70} 
                                    y={p.y - 65} 
                                    width="140" 
                                    height="55" 
                                    className="pointer-events-none opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 overflow-visible"
                                >
                                    <div className="bg-stone-900 text-white dark:bg-stone-800 dark:border dark:border-stone-700 text-center rounded-xl p-2 shadow-lg text-xs leading-none flex flex-col items-center justify-center gap-1">
                                        <span className="font-semibold text-[11px] text-stone-300 uppercase">{p.label}</span>
                                        <div className="flex items-center gap-1.5 justify-center">
                                            <span className="font-bold text-sm text-white">{p.count} cls</span>
                                            <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${
                                                p.percentageText.startsWith('+') ? 'bg-emerald-500/20 text-emerald-400' : 
                                                p.percentageText.startsWith('-') ? 'bg-rose-500/20 text-rose-400' : 'bg-stone-500/20 text-stone-400'
                                            }`}>
                                                {p.percentageText}
                                            </span>
                                        </div>
                                    </div>
                                </foreignObject>
                            </g>
                        ))}
                    </svg>
                </div>

                {/* X Axis Labels */}
                <div className="flex justify-between text-xs text-stone-400 dark:text-stone-500 font-medium px-[28px] mt-2 select-none">
                    {clientGrowth.map((item, idx) => (
                        <span key={idx}>{item.label}</span>
                    ))}
                </div>
            </div>
        );
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 24 }
        }
    };

    const totalPlanDistribution = planDistribution?.reduce((acc, curr) => acc + curr.count, 0) || 0;
    const planDistributionBars = planDistribution?.map(plan => {
        const percentage = totalPlanDistribution > 0 ? Math.round((plan.count / totalPlanDistribution) * 100) : 0;
        return (
            <div key={plan.planName} className="cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 p-2 -mx-2 rounded-xl transition-colors" onClick={() => { setActiveModal(null); navigate('/subscriptions?status=ACTIVE' + (plan.planId ? `&planId=${plan.planId}` : '')); }}>
                <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-stone-700 dark:text-stone-300">{plan.planName}</span>
                    <span className="text-stone-500 dark:text-stone-400">{plan.count} ({percentage}%)</span>
                </div>
                <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2.5 overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="bg-blue-500 h-2.5 rounded-full"
                    ></motion.div>
                </div>
            </div>
        );
    });

    const totalMrrDistribution = mrrDistribution?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
    const mrrDistributionBars = mrrDistribution?.map(plan => {
        const percentage = totalMrrDistribution > 0 ? Math.round((plan.amount / totalMrrDistribution) * 100) : 0;
        return (
            <div key={plan.planId} className="cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 p-2 -mx-2 rounded-xl transition-colors" onClick={() => { setActiveModal(null); navigate('/subscriptions?status=ACTIVE' + (plan.planId ? `&planId=${plan.planId}` : '')); }}>
                <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-stone-700 dark:text-stone-300">{plan.planName}</span>
                    <span className="text-stone-500 dark:text-stone-400">{formatCurrency(plan.amount)} ({percentage}%)</span>
                </div>
                <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2.5 overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="bg-emerald-500 h-2.5 rounded-full"
                    ></motion.div>
                </div>
            </div>
        );
    });

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
                    <motion.div 
                        variants={itemVariants} 
                        className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col justify-between cursor-pointer hover:border-rose-500/50 transition-colors"
                        onClick={() => setActiveModal('ACTIVE_SUBS')}
                    >
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

                    <motion.div 
                        variants={itemVariants} 
                        className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-500/50 transition-colors"
                        onClick={() => setActiveModal('MRR')}
                    >
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

                    <motion.div 
                        variants={itemVariants} 
                        className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col justify-between cursor-pointer hover:border-red-500/50 transition-colors"
                        onClick={() => setActiveModal('OVERDUE')}
                    >
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

                    <motion.div 
                        variants={itemVariants} 
                        className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col justify-between cursor-pointer hover:border-amber-500/50 transition-colors"
                        onClick={() => setActiveModal('UPCOMING')}
                    >
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
                    {/* Client Growth Chart (Bitcoin Style Line Chart) */}
                    <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-100 dark:border-stone-800 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">Crescimento de Clientes</h2>
                            <Users className="w-5 h-5 text-stone-400" />
                        </div>
                        {renderGrowthChart()}
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

            {/* Modal de Assinaturas Ativas */}
            <AnimatePresence>
                {activeModal === 'ACTIVE_SUBS' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
                                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Detalhamento: Assinaturas Ativas</h2>
                                <button 
                                    onClick={() => setActiveModal(null)}
                                    className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto flex-1 space-y-8">
                                {/* Top Section: Progress Bars */}
                                <div>
                                    <h3 className="text-sm font-semibold text-stone-500 dark:text-stone-400 mb-4 uppercase tracking-wider">Distribuição por Plano</h3>
                                    {loadingPlanDist ? (
                                        <div className="flex justify-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                        </div>
                                    ) : planDistribution && planDistribution.length > 0 ? (
                                        <div className="space-y-4">
                                            {planDistributionBars}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-stone-500">Nenhum dado de distribuição disponível.</p>
                                    )}
                                </div>

                                {/* Bottom Section: Table */}
                                <div>
                                    <h3 className="text-sm font-semibold text-stone-500 dark:text-stone-400 mb-4 uppercase tracking-wider">Lista de Assinaturas</h3>
                                    {loadingActiveSubs ? (
                                        <div className="flex justify-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                        </div>
                                    ) : activeSubsData?.content && activeSubsData.content.length > 0 ? (
                                        <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400">
                                                    <tr>
                                                        <th className="px-4 py-3 font-medium">Cliente</th>
                                                        <th className="px-4 py-3 font-medium">Plano</th>
                                                        <th className="px-4 py-3 font-medium">Início</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                                                    {activeSubsData.content.map(sub => (
                                                        <tr key={sub.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                                            <td className="px-4 py-3 font-medium text-stone-800 dark:text-stone-200">
                                                                <span 
                                                                    onClick={() => { setActiveModal(null); navigate('/clients/' + sub.clientId); }} 
                                                                    className="cursor-pointer text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 hover:underline flex items-center gap-1 w-fit"
                                                                >
                                                                    {sub.clientName} <ArrowUpRight className="w-3 h-3"/>
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                                                                <span 
                                                                    onClick={() => { setActiveModal(null); navigate('/plans/' + sub.planId); }} 
                                                                    className="cursor-pointer text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 hover:underline flex items-center gap-1 w-fit"
                                                                >
                                                                    {sub.planName} <ArrowUpRight className="w-3 h-3"/>
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                                                                {format(new Date(sub.startDate + 'T00:00:00'), "dd/MM/yyyy")}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-stone-500">Nenhuma assinatura ativa encontrada.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de MRR */}
            <AnimatePresence>
                {activeModal === 'MRR' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
                                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Detalhamento: MRR</h2>
                                <button 
                                    onClick={() => setActiveModal(null)}
                                    className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto flex-1 space-y-8">
                                {/* Top Section: Progress Bars */}
                                <div>
                                    <h3 className="text-sm font-semibold text-stone-500 dark:text-stone-400 mb-4 uppercase tracking-wider">Distribuição por Plano</h3>
                                    {loadingMrrDist ? (
                                        <div className="flex justify-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                                        </div>
                                    ) : mrrDistribution && mrrDistribution.length > 0 ? (
                                        <div className="space-y-4">
                                            {mrrDistributionBars}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-stone-500">Nenhum dado de distribuição disponível.</p>
                                    )}
                                </div>

                                {/* Bottom Section: Table */}
                                <div>
                                    <h3 className="text-sm font-semibold text-stone-500 dark:text-stone-400 mb-4 uppercase tracking-wider">Faturas Contribuintes (Mês Atual)</h3>
                                    {loadingMrrContributors ? (
                                        <div className="flex justify-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                                        </div>
                                    ) : mrrContributors && mrrContributors.length > 0 ? (
                                        <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400">
                                                    <tr>
                                                        <th className="px-4 py-3 font-medium">Cliente</th>
                                                        <th className="px-4 py-3 font-medium">Plano</th>
                                                        <th className="px-4 py-3 font-medium">Vencimento</th>
                                                        <th className="px-4 py-3 font-medium text-right">Valor</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                                                    {mrrContributors.map(contributor => (
                                                        <tr key={contributor.subscriptionId} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                                            <td className="px-4 py-3 font-medium text-stone-800 dark:text-stone-200">
                                                                <span 
                                                                    onClick={() => { setActiveModal(null); navigate('/clients/' + contributor.clientId); }} 
                                                                    className="cursor-pointer text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 hover:underline flex items-center gap-1 w-fit"
                                                                >
                                                                    {contributor.clientName} <ArrowUpRight className="w-3 h-3"/>
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                                                                <span 
                                                                    onClick={() => { setActiveModal(null); navigate('/plans/' + contributor.planId); }} 
                                                                    className="cursor-pointer text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 hover:underline flex items-center gap-1 w-fit"
                                                                >
                                                                    {contributor.planName} <ArrowUpRight className="w-3 h-3"/>
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                                                                {format(new Date(contributor.dueDate + 'T00:00:00'), 'dd/MM/yyyy')}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-medium text-stone-800 dark:text-stone-200">
                                                                {formatCurrency(contributor.amount)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-stone-500">Nenhuma fatura contribuinte encontrada.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Faturas Atrasadas */}
            <AnimatePresence>
                {activeModal === 'OVERDUE' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
                                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Detalhamento: Faturas Atrasadas</h2>
                                <button 
                                    onClick={() => setActiveModal(null)}
                                    className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto flex-1">
                                {loadingOverdueSubs ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                                    </div>
                                ) : overdueSubsData?.content && overdueSubsData.content.length > 0 ? (
                                    <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Cliente</th>
                                                    <th className="px-4 py-3 font-medium">Plano</th>
                                                    <th className="px-4 py-3 font-medium">Vencido Desde</th>
                                                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                                                {overdueSubsData.content.map(sub => (
                                                    <tr key={sub.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-stone-800 dark:text-stone-200">
                                                            <span 
                                                                onClick={() => { setActiveModal(null); navigate('/clients/' + sub.clientId); }} 
                                                                className="cursor-pointer text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 hover:underline flex items-center gap-1 w-fit"
                                                            >
                                                                {sub.clientName} <ArrowUpRight className="w-3 h-3"/>
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                                                            <span 
                                                                onClick={() => { setActiveModal(null); navigate('/plans/' + sub.planId); }} 
                                                                className="cursor-pointer text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 hover:underline flex items-center gap-1 w-fit"
                                                            >
                                                                {sub.planName} <ArrowUpRight className="w-3 h-3"/>
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-red-600 dark:text-red-400 font-medium">
                                                            {format(new Date(sub.nextDueDate + 'T00:00:00'), "dd/MM/yyyy")}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => paySubscription(sub.id)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 dark:text-emerald-400 text-xs font-semibold rounded-lg transition-colors"
                                                                    title="Marcar como Paga"
                                                                >
                                                                    <Check className="w-3.5 h-3.5" />
                                                                    <span>Pagar</span>
                                                                </button>
                                                                {sub.clientPhone ? (
                                                                    <a
                                                                        href={getWhatsAppLink(sub.clientPhone, sub.clientName, sub.planName, format(new Date(sub.nextDueDate + 'T00:00:00'), 'dd/MM/yyyy'), 'OVERDUE')}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-lg transition-colors"
                                                                        title="Enviar mensagem de cobrança via WhatsApp"
                                                                    >
                                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                                        <span>WhatsApp</span>
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-xs text-stone-400 dark:text-stone-600 italic">Sem telefone</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-stone-500 text-center py-4">Nenhuma fatura atrasada encontrada.</p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Faturas a Vencer */}
            <AnimatePresence>
                {activeModal === 'UPCOMING' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
                                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Detalhamento: Faturas a Vencer (7 dias)</h2>
                                <button 
                                    onClick={() => setActiveModal(null)}
                                    className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto flex-1">
                                {loadingUpcomingDetailed ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                                    </div>
                                ) : upcomingDetailedData?.content && upcomingDetailedData.content.length > 0 ? (
                                    <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Cliente</th>
                                                    <th className="px-4 py-3 font-medium">Plano</th>
                                                    <th className="px-4 py-3 font-medium">Vence Em</th>
                                                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                                                {upcomingDetailedData.content.map(sub => (
                                                    <tr key={sub.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-stone-800 dark:text-stone-200">
                                                            <span 
                                                                onClick={() => { setActiveModal(null); navigate('/clients/' + sub.clientId); }} 
                                                                className="cursor-pointer text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 hover:underline flex items-center gap-1 w-fit"
                                                            >
                                                                {sub.clientName} <ArrowUpRight className="w-3 h-3"/>
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                                                            <span 
                                                                onClick={() => { setActiveModal(null); navigate('/plans/' + sub.planId); }} 
                                                                className="cursor-pointer text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 hover:underline flex items-center gap-1 w-fit"
                                                            >
                                                                {sub.planName} <ArrowUpRight className="w-3 h-3"/>
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-amber-600 dark:text-amber-400 font-medium">
                                                            {format(new Date(sub.nextDueDate + 'T00:00:00'), "dd/MM/yyyy")}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => paySubscription(sub.id)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 dark:text-emerald-400 text-xs font-semibold rounded-lg transition-colors"
                                                                    title="Marcar como Paga"
                                                                >
                                                                    <Check className="w-3.5 h-3.5" />
                                                                    <span>Pagar</span>
                                                                </button>
                                                                {sub.clientPhone ? (
                                                                    <a
                                                                        href={getWhatsAppLink(sub.clientPhone, sub.clientName, sub.planName, format(new Date(sub.nextDueDate + 'T00:00:00'), 'dd/MM/yyyy'), 'UPCOMING')}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-lg transition-colors"
                                                                        title="Enviar lembrete de vencimento via WhatsApp"
                                                                    >
                                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                                        <span>WhatsApp</span>
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-xs text-stone-400 dark:text-stone-600 italic">Sem telefone</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-stone-500 text-center py-4">Nenhuma fatura a vencer encontrada para os próximos 7 dias.</p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
