import { useParams, useNavigate } from 'react-router-dom';
import { usePlan, useUpdatePlan, useTogglePlanStatus } from '../../hooks/usePlans';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, Save, X, Archive, RotateCcw, Check, FileText } from 'lucide-react';
import type { UpdatePlanRequest, Recurrence } from '../../types/plan';
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

export default function PlanDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: plan, isLoading } = usePlan(id!);
    const { mutate: update, isPending: updating, error: updateError } = useUpdatePlan(id!);
    const { mutate: toggle } = useTogglePlanStatus();
    
    useDocumentTitle(plan ? `Plano: ${plan.name}` : 'Detalhes do Plano');
    
    const [editing, setEditing] = useState(false);
    const [featureInput, setFeatureInput] = useState('');

    const [form, setForm] = useState<UpdatePlanRequest | null>(null);

    const startEdit = () => {
        if (plan) {
            setForm({
                name: plan.name,
                description: plan.description ?? '',
                amountCents: plan.amountCents,
                recurrence: plan.recurrence,
                customDays: plan.customDays ?? undefined,
                trialDays: plan.trialDays,
                maxSubscriptions: plan.maxSubscriptions ?? undefined,
                features: [...plan.features],
            });
            setEditing(true);
        }
    };

    const addFeature = () => {
        if (featureInput.trim() && form) {
            setForm({ ...form, features: [...(form.features ?? []), featureInput.trim()] });
            setFeatureInput('');
        }
    };

    const removeFeature = (index: number) => {
        if (form) setForm({ ...form, features: form.features?.filter((_, i) => i !== index) });
    };

    if (isLoading) return (
        <DashboardLayout>
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-4 border-rose-200 dark:border-stone-800 border-t-rose-500 dark:border-t-rose-500 rounded-full animate-spin transition-colors" />
            </div>
        </DashboardLayout>
    );

    if (!plan) return (
        <DashboardLayout>
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-12 text-center transition-colors">
                <FileText className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
                <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">Plano não encontrado</h2>
                <p className="text-stone-500 dark:text-stone-400 mt-2">O plano que você tentou acessar não existe ou foi removido.</p>
                <button
                    onClick={() => navigate('/plans')}
                    className="mt-6 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
                >
                    Voltar para planos
                </button>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto">
                <button 
                    onClick={() => navigate('/plans')} 
                    className="group flex items-center text-stone-500 dark:text-stone-400 hover:text-rose-500 dark:hover:text-rose-400 text-sm font-medium mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Voltar para planos
                </button>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-500"
                >
                    <div className="p-6 md:p-8 border-b border-stone-100 dark:border-stone-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
                        <div>
                            <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 transition-colors">{plan.name}</h1>
                            <span className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${plan.active ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'} transition-colors`}>
                                {plan.active ? 'Ativo' : 'Arquivado'}
                            </span>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={editing ? () => setEditing(false) : startEdit}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-colors ${editing ? 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300' : 'bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900'}`}
                            >
                                {editing ? <><X className="w-4 h-4"/> Cancelar</> : <><Edit2 className="w-4 h-4"/> Editar</>}
                            </button>
                            <button
                                onClick={() => toggle(plan.id)}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-colors ${plan.active ? 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-500' : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500'}`}
                            >
                                {plan.active ? <><Archive className="w-4 h-4"/> Arquivar</> : <><RotateCcw className="w-4 h-4"/> Reativar</>}
                            </button>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        {updateError && (
                            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium transition-colors">
                                {getErrorMessage(updateError)}
                            </div>
                        )}

                        {editing && form ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-5"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Nome</label>
                                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Valor (centavos)</label>
                                        <input type="number" value={form.amountCents} onChange={e => setForm({ ...form, amountCents: Number(e.target.value) })}
                                            className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Recorrência</label>
                                        <select value={form.recurrence} onChange={e => setForm({ ...form, recurrence: e.target.value as Recurrence })}
                                            className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all appearance-none">
                                            {RECURRENCES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                        </select>
                                    </div>
                                    {form.recurrence === 'CUSTOM' && (
                                        <div>
                                            <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Dias do ciclo customizado</label>
                                            <input type="number" value={form.customDays ?? ''} onChange={e => setForm({ ...form, customDays: Number(e.target.value) })}
                                                className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all" />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Dias de trial</label>
                                        <input type="number" value={form.trialDays ?? 0} onChange={e => setForm({ ...form, trialDays: Number(e.target.value) })}
                                            className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Máx. assinantes (opcional)</label>
                                        <input type="number" value={form.maxSubscriptions ?? ''} onChange={e => setForm({ ...form, maxSubscriptions: e.target.value ? Number(e.target.value) : undefined })}
                                            placeholder="Ilimitado" className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Descrição</label>
                                        <textarea value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                                            className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all resize-none" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Benefícios</label>
                                        <div className="flex gap-2 mb-3">
                                            <input type="text" value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && addFeature()} placeholder="Digite e pressione Enter"
                                                className="flex-1 bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all" />
                                            <button type="button" onClick={addFeature} className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
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
                                <div className="pt-4 flex justify-end">
                                    <button type="button" onClick={() => update(form, { onSuccess: () => setEditing(false) })} disabled={updating}
                                        className="bg-stone-900 hover:bg-stone-800 dark:bg-rose-500 dark:hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                                        <Save className="w-4 h-4" />
                                        {updating ? 'Salvando...' : 'Salvar alterações'}
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 transition-colors">
                                        <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">Valor</p>
                                        <p className="text-lg font-bold text-stone-800 dark:text-stone-200">{plan.amountFormatted}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 transition-colors">
                                        <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">Recorrência</p>
                                        <p className="text-lg font-semibold text-stone-800 dark:text-stone-200">{plan.recurrenceLabel}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 transition-colors">
                                        <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">Período de Trial</p>
                                        <p className="text-lg font-semibold text-stone-800 dark:text-stone-200">{plan.trialDays > 0 ? `${plan.trialDays} dias` : 'Sem trial'}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 transition-colors">
                                        <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">Máximo de assinantes</p>
                                        <p className="text-lg font-semibold text-stone-800 dark:text-stone-200">{plan.maxSubscriptions ?? 'Ilimitado'}</p>
                                    </div>
                                </div>

                                {plan.description && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-2 transition-colors">Descrição</h3>
                                        <p className="text-sm text-stone-600 dark:text-stone-400 transition-colors leading-relaxed">{plan.description}</p>
                                    </div>
                                )}

                                {plan.features.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-3 transition-colors">Benefícios inclusos</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {plan.features.map((f, i) => (
                                                <span key={i} className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors">
                                                    <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}