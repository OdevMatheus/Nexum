import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, EyeOff, Edit2, Save, X, User, Phone, Mail, FileText, Calendar, CreditCard, Plus } from 'lucide-react';
import { useClient, useUpdateClient, useDeactivateClient } from '../../hooks/useClients';
import { useSubscriptions, useCreateSubscription, useCancelSubscription } from '../../hooks/useSubscriptions';
import { usePlans } from '../../hooks/usePlans';
import type { UpdateClientRequest } from '../../types/client';
import { getErrorMessage } from '../../services/authService';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function ClientDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: client, isLoading } = useClient(id!);
    const { mutate: update, isPending: updating, error: updateError } = useUpdateClient(id!);
    const { mutate: deactivate } = useDeactivateClient();

    const { data: subscriptionsData, isLoading: isLoadingSubs } = useSubscriptions({ clientId: id, size: 10 });
    const { data: plansData } = usePlans(0, 50, undefined, true);
    
    const { mutate: createSub, isPending: creatingSub, error: createSubError } = useCreateSubscription();
    const { mutate: cancelSub, isPending: cancelingSub } = useCancelSubscription();

    useDocumentTitle(client ? `Cliente: ${client.name}` : 'Detalhes do Cliente');

    const clientId = client?.id ?? null;
    const [draft, setDraft] = useState<{ clientId: string | null; data: UpdateClientRequest } | null>(null);
    const [editing, setEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'subscriptions'>('details');
    const [showSubForm, setShowSubForm] = useState(false);
    
    // Sub form state
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const form: UpdateClientRequest = draft?.clientId === clientId && draft
        ? draft.data
        : {
            name: client?.name ?? '',
            email: client?.email ?? '',
            phone: client?.phone ?? '',
            document: client?.document ?? '',
        };

    const updateForm = (next: UpdateClientRequest) => setDraft({ clientId, data: next });
    
    const handleCreateSub = () => {
        if (!selectedPlanId || !clientId) return;
        createSub({ clientId, planId: selectedPlanId, startDate }, {
            onSuccess: () => {
                setShowSubForm(false);
                setSelectedPlanId('');
            }
        });
    };

    if (isLoading) return (
        <DashboardLayout>
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-4 border-rose-200 dark:border-stone-800 border-t-rose-500 dark:border-t-rose-500 rounded-full animate-spin transition-colors" />
            </div>
        </DashboardLayout>
    );

    if (!client) return (
        <DashboardLayout>
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-12 text-center transition-colors">
                <User className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
                <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">Cliente não encontrado</h2>
                <p className="text-stone-500 dark:text-stone-400 mt-2">O cliente que você tentou acessar não existe ou foi removido.</p>
                <button
                    onClick={() => navigate('/clients')}
                    className="mt-6 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
                >
                    Voltar para clientes
                </button>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/clients')}
                    className="group flex items-center text-stone-500 dark:text-stone-400 hover:text-rose-500 dark:hover:text-rose-400 text-sm font-medium mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Voltar para clientes
                </button>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-500 mb-6"
                >
                    <div className="p-6 md:p-8 border-b border-stone-100 dark:border-stone-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center flex-shrink-0 transition-colors">
                                <span className="text-2xl font-bold text-rose-500 dark:text-rose-400">{client.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 transition-colors">{client.name}</h1>
                                <span className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${client.active ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'} transition-colors`}>
                                    {client.active ? 'Ativo' : 'Arquivado'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => {
                                    if (editing) setDraft(null);
                                    setEditing(!editing);
                                }}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-colors ${editing ? 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300' : 'bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900'}`}
                            >
                                {editing ? <><X className="w-4 h-4"/> Cancelar</> : <><Edit2 className="w-4 h-4"/> Editar</>}
                            </button>
                            <button
                                onClick={() => deactivate(client.id, { onSuccess: () => navigate('/clients') })}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                            >
                                <EyeOff className="w-4 h-4" /> Desativar
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex border-b border-stone-100 dark:border-stone-800/50 bg-stone-50/50 dark:bg-stone-900/30">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`flex-1 sm:flex-none py-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-rose-500 text-rose-600 dark:text-rose-400' : 'border-transparent text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'}`}
                        >
                            Dados do Cliente
                        </button>
                        <button
                            onClick={() => setActiveTab('subscriptions')}
                            className={`flex-1 sm:flex-none flex items-center gap-2 py-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'subscriptions' ? 'border-rose-500 text-rose-600 dark:text-rose-400' : 'border-transparent text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'}`}
                        >
                            Assinaturas
                            {subscriptionsData?.content && subscriptionsData.content.length > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'subscriptions' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300' : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'}`}>
                                    {subscriptionsData.content.length}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="p-6 md:p-8">
                        {activeTab === 'details' ? (
                            <>
                                {updateError && (
                                    <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium transition-colors">
                                        {getErrorMessage(updateError)}
                                    </div>
                                )}

                                {editing ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-5"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Nome</label>
                                                <input
                                                    type="text"
                                                    value={form.name}
                                                    onChange={e => updateForm({ ...form, name: e.target.value })}
                                                    className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">E-mail</label>
                                                <input
                                                    type="email"
                                                    value={form.email}
                                                    onChange={e => updateForm({ ...form, email: e.target.value })}
                                                    className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Telefone</label>
                                                <input
                                                    type="text"
                                                    value={form.phone ?? ''}
                                                    onChange={e => updateForm({ ...form, phone: e.target.value })}
                                                    className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Documento</label>
                                                <input
                                                    type="text"
                                                    value={form.document ?? ''}
                                                    onChange={e => updateForm({ ...form, document: e.target.value })}
                                                    className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-4 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => update(form, {
                                                    onSuccess: () => {
                                                        setDraft(null);
                                                        setEditing(false);
                                                    },
                                                })}
                                                disabled={updating}
                                                className="bg-stone-900 hover:bg-stone-800 dark:bg-rose-500 dark:hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                                            >
                                                <Save className="w-4 h-4" />
                                                {updating ? 'Salvando...' : 'Salvar alterações'}
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 transition-colors">
                                            <Mail className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">E-mail</p>
                                                <p className="text-sm font-medium text-stone-800 dark:text-stone-200 break-all">{client.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 transition-colors">
                                            <Phone className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">Telefone</p>
                                                <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{client.phone || 'Não informado'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 transition-colors">
                                            <FileText className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">Documento (CPF/CNPJ)</p>
                                                <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{client.document || 'Não informado'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 transition-colors">
                                            <Calendar className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">Cliente desde</p>
                                                <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{new Date(client.createdAt).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">Planos Assinados</h3>
                                    <button 
                                        onClick={() => setShowSubForm(!showSubForm)}
                                        className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Assinar novo plano
                                    </button>
                                </div>
                                
                                {showSubForm && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 rounded-xl p-5 mb-6"
                                    >
                                        <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200 mb-4">Nova Assinatura</h4>
                                        
                                        {createSubError && (
                                            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium transition-colors">
                                                {getErrorMessage(createSubError)}
                                            </div>
                                        )}
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5">Escolha o Plano</label>
                                                <select 
                                                    value={selectedPlanId}
                                                    onChange={e => setSelectedPlanId(e.target.value)}
                                                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-300 dark:focus:border-rose-500/50"
                                                >
                                                    <option value="" disabled>Selecione um plano...</option>
                                                    {plansData?.content.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name} - {p.amountFormatted} ({p.recurrenceLabel})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5">Data de Início</label>
                                                <input 
                                                    type="date"
                                                    value={startDate}
                                                    onChange={e => setStartDate(e.target.value)}
                                                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-300 dark:focus:border-rose-500/50"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => setShowSubForm(false)}
                                                className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                                            >
                                                Cancelar
                                            </button>
                                            <button 
                                                onClick={handleCreateSub}
                                                disabled={creatingSub || !selectedPlanId}
                                                className="bg-stone-900 hover:bg-stone-800 dark:bg-rose-500 dark:hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                                            >
                                                {creatingSub ? 'Vinculando...' : 'Confirmar Assinatura'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                                
                                {isLoadingSubs ? (
                                    <div className="flex justify-center py-6">
                                        <div className="w-6 h-6 border-2 border-rose-200 dark:border-stone-800 border-t-rose-500 dark:border-t-rose-500 rounded-full animate-spin transition-colors" />
                                    </div>
                                ) : subscriptionsData?.content.length === 0 ? (
                                    <div className="text-center py-10 bg-stone-50 dark:bg-stone-800/30 rounded-2xl border border-stone-100 dark:border-stone-800/50 border-dashed">
                                        <CreditCard className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                                        <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">Este cliente não possui nenhuma assinatura.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {subscriptionsData?.content.map(sub => (
                                            <div key={sub.id} className="border border-stone-200 dark:border-stone-800 rounded-xl p-5 hover:border-rose-200 dark:hover:border-rose-500/30 transition-colors bg-white dark:bg-stone-900 shadow-sm dark:shadow-none">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="text-base font-bold text-stone-800 dark:text-stone-100">{sub.planName}</h4>
                                                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{sub.planAmountFormatted} • {sub.planRecurrenceLabel}</p>
                                                    </div>
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                        sub.status === 'ACTIVE' || sub.status === 'REACTIVATED' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 
                                                        sub.status === 'TRIAL' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' :
                                                        sub.status === 'CANCELLED' ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700' :
                                                        'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                                                    }`}>
                                                        {sub.statusLabel}
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                                    <div>
                                                        <span className="text-stone-500 dark:text-stone-400 block text-xs mb-0.5">Início</span>
                                                        <span className="text-stone-800 dark:text-stone-200 font-medium">{new Date(sub.startDate).toLocaleDateString('pt-BR')}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-stone-500 dark:text-stone-400 block text-xs mb-0.5">Próximo Vencimento</span>
                                                        <span className="text-stone-800 dark:text-stone-200 font-medium">{sub.nextDueDate ? new Date(sub.nextDueDate).toLocaleDateString('pt-BR') : '—'}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex justify-end pt-3 border-t border-stone-100 dark:border-stone-800">
                                                    {sub.status !== 'CANCELLED' && (
                                                        <button 
                                                            onClick={() => cancelSub(sub.id)}
                                                            disabled={cancelingSub}
                                                            className="text-xs font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
                                                        >
                                                            Cancelar Assinatura
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
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