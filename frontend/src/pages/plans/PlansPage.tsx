import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Archive, RotateCcw, Check, X } from 'lucide-react';
import { usePlans, useCreatePlan, useTogglePlanStatus } from '../../hooks/usePlans';
import type { CreatePlanRequest, Recurrence } from '../../types/plan';
import { getErrorMessage } from '../../services/authService';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const RECURRENCES: { value: Recurrence; label: string }[] = [
    { value: 'MONTHLY', label: 'Mensal' },
    { value: 'QUARTERLY', label: 'Trimestral' },
    { value: 'SEMIANNUAL', label: 'Semestral' },
    { value: 'ANNUAL', label: 'Anual' },
    { value: 'CUSTOM', label: 'Personalizado' },
];

const emptyForm = (): CreatePlanRequest => ({
    name: '',
    description: '',
    amountCents: 0,
    recurrence: 'MONTHLY',
    trialDays: 0,
    features: [],
});

export default function PlansPage() {
    useDocumentTitle('Planos de Faturamento');
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<CreatePlanRequest>(emptyForm());
    const [featureInput, setFeatureInput] = useState('');

    const { data, isLoading } = usePlans(page, 10, search || undefined, activeFilter);
    const { mutate: create, isPending: creating, error: createError } = useCreatePlan();
    const { mutate: toggle } = useTogglePlanStatus();

    const handleCreate = () => {
        create(form, {
            onSuccess: () => {
                setShowForm(false);
                setForm(emptyForm());
            }
        });
    };

    const addFeature = () => {
        if (featureInput.trim()) {
            setForm({ ...form, features: [...(form.features ?? []), featureInput.trim()] });
            setFeatureInput('');
        }
    };

    const removeFeature = (index: number) => {
        setForm({ ...form, features: form.features?.filter((_, i) => i !== index) });
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight transition-colors">Planos</h1>
                    <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 transition-colors">Crie e gerencie os planos de faturamento.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowForm(!showForm)}
                    className="bg-stone-900 hover:bg-stone-800 dark:bg-rose-500 dark:hover:bg-rose-600 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Novo Plano
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
                        <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4 transition-colors">Cadastrar Plano</h2>
                        {createError && (
                            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium transition-colors">
                                {getErrorMessage(createError)}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Nome</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="Ex: Pro, Premium"
                                    className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Valor (em centavos)</label>
                                <input
                                    type="number"
                                    value={form.amountCents || ''}
                                    onChange={e => setForm({ ...form, amountCents: Number(e.target.value) })}
                                    placeholder="Ex: 9990 = R$ 99,90"
                                    className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Recorrência</label>
                                <select
                                    value={form.recurrence}
                                    onChange={e => setForm({ ...form, recurrence: e.target.value as Recurrence })}
                                    className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all appearance-none"
                                >
                                    {RECURRENCES.map(r => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>
                            {form.recurrence === 'CUSTOM' && (
                                <div>
                                    <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Dias do ciclo customizado</label>
                                    <input
                                        type="number"
                                        value={form.customDays || ''}
                                        onChange={e => setForm({ ...form, customDays: Number(e.target.value) })}
                                        placeholder="Ex: 15"
                                        className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Dias de trial</label>
                                <input
                                    type="number"
                                    value={form.trialDays || ''}
                                    onChange={e => setForm({ ...form, trialDays: Number(e.target.value) })}
                                    placeholder="0"
                                    className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Máx. assinantes (opcional)</label>
                                <input
                                    type="number"
                                    value={form.maxSubscriptions || ''}
                                    onChange={e => setForm({ ...form, maxSubscriptions: e.target.value ? Number(e.target.value) : undefined })}
                                    placeholder="Ilimitado"
                                    className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Descrição</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    rows={2}
                                    className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all resize-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Benefícios</label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={featureInput}
                                        onChange={e => setFeatureInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addFeature()}
                                        placeholder="Digite e pressione Enter"
                                        className="flex-1 bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={addFeature}
                                        className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {form.features?.map((f, i) => (
                                        <motion.span 
                                            key={i} 
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors"
                                        >
                                            <Check className="w-3 h-3" />
                                            {f}
                                            <button type="button" onClick={() => removeFeature(i)} className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCreate}
                                disabled={creating}
                                className="bg-stone-900 hover:bg-stone-800 dark:bg-rose-500 dark:hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
                            >
                                {creating ? 'Salvando...' : 'Salvar Plano'}
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

            <div className="flex flex-col sm:flex-row gap-3 mb-6 relative z-10">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-stone-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nome do plano..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(0); }}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all shadow-sm dark:shadow-none"
                    />
                </div>
                <select
                    value={activeFilter === undefined ? '' : String(activeFilter)}
                    onChange={e => setActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                    className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all shadow-sm dark:shadow-none appearance-none min-w-[140px]"
                >
                    <option value="">Todos os status</option>
                    <option value="true">Apenas ativos</option>
                    <option value="false">Arquivados</option>
                </select>
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
                                        <th className="font-medium text-stone-500 dark:text-stone-400 px-6 py-4">Nome</th>
                                        <th className="font-medium text-stone-500 dark:text-stone-400 px-6 py-4">Valor</th>
                                        <th className="font-medium text-stone-500 dark:text-stone-400 px-6 py-4">Recorrência</th>
                                        <th className="font-medium text-stone-500 dark:text-stone-400 px-6 py-4">Trial</th>
                                        <th className="font-medium text-stone-500 dark:text-stone-400 px-6 py-4">Status</th>
                                        <th className="font-medium text-stone-500 dark:text-stone-400 px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {data?.content.map(plan => (
                                        <tr key={plan.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => navigate(`/plans/${plan.id}`)}
                                                    className="font-medium text-stone-800 dark:text-stone-200 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                                                >
                                                    {plan.name}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-emerald-600 dark:text-emerald-400">{plan.amountFormatted}</td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400">{plan.recurrenceLabel}</td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                                                {plan.trialDays > 0 ? `${plan.trialDays} dias` : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${plan.active ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'}`}>
                                                    {plan.active ? 'Ativo' : 'Arquivado'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => toggle(plan.id)}
                                                    className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${plan.active ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                                                    title={plan.active ? 'Arquivar plano' : 'Reativar plano'}
                                                >
                                                    {plan.active ? <Archive className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {data?.content.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-stone-500 dark:text-stone-400">
                                                Nenhum plano encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <p className="text-stone-500 dark:text-stone-400 text-sm">
                            Mostrando {data?.content.length || 0} de {data?.totalElements || 0} planos
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
                                disabled={data?.last}
                                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-50 text-stone-700 dark:text-stone-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm dark:shadow-none"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}