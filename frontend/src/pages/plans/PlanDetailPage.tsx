import { useParams, useNavigate } from 'react-router-dom'
import { usePlan, useUpdatePlan, useTogglePlanStatus } from '../../hooks/usePlans'
import { useState } from 'react'
import type { UpdatePlanRequest, Recurrence } from '../../types/plan'
import { getErrorMessage } from '../../services/authService'

const RECURRENCES: { value: Recurrence; label: string }[] = [
    { value: 'MONTHLY', label: 'Mensal' },
    { value: 'QUARTERLY', label: 'Trimestral' },
    { value: 'SEMIANNUAL', label: 'Semestral' },
    { value: 'ANNUAL', label: 'Anual' },
    { value: 'CUSTOM', label: 'Personalizado' },
]

export default function PlanDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data: plan, isLoading } = usePlan(id!)
    const { mutate: update, isPending: updating, error: updateError } = useUpdatePlan(id!)
    const { mutate: toggle } = useTogglePlanStatus()
    const [editing, setEditing] = useState(false)
    const [featureInput, setFeatureInput] = useState('')

    const [form, setForm] = useState<UpdatePlanRequest | null>(null)

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
            })
            setEditing(true)
        }
    }

    const addFeature = () => {
        if (featureInput.trim() && form) {
            setForm({ ...form, features: [...(form.features ?? []), featureInput.trim()] })
            setFeatureInput('')
        }
    }

    const removeFeature = (index: number) => {
        if (form) setForm({ ...form, features: form.features?.filter((_, i) => i !== index) })
    }

    if (isLoading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <p className="text-slate-400">Carregando...</p>
        </div>
    )

    if (!plan) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <p className="text-slate-400">Plano não encontrado.</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-900 p-8">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => navigate('/plans')} className="text-slate-400 hover:text-white text-sm mb-6 transition">
                    ← Voltar
                </button>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-semibold text-white">{plan.name}</h1>
                            <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${plan.active ? 'bg-green-900/30 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                {plan.active ? 'Ativo' : 'Arquivado'}
              </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={editing ? () => setEditing(false) : startEdit}
                                className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-3 py-1.5 rounded-lg transition"
                            >
                                {editing ? 'Cancelar' : 'Editar'}
                            </button>
                            <button
                                onClick={() => toggle(plan.id)}
                                className={`text-sm px-3 py-1.5 rounded-lg transition ${plan.active ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50' : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'}`}
                            >
                                {plan.active ? 'Arquivar' : 'Reativar'}
                            </button>
                        </div>
                    </div>

                    {updateError && <p className="text-red-400 text-sm mb-4">{getErrorMessage(updateError)}</p>}

                    {editing && form ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-300 text-sm mb-1">Nome</label>
                                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                       className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-1">Valor (centavos)</label>
                                <input type="number" value={form.amountCents} onChange={e => setForm({ ...form, amountCents: Number(e.target.value) })}
                                       className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-1">Recorrência</label>
                                <select value={form.recurrence} onChange={e => setForm({ ...form, recurrence: e.target.value as Recurrence })}
                                        className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                                    {RECURRENCES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>
                            {form.recurrence === 'CUSTOM' && (
                                <div>
                                    <label className="block text-slate-300 text-sm mb-1">Dias do ciclo</label>
                                    <input type="number" value={form.customDays ?? ''} onChange={e => setForm({ ...form, customDays: Number(e.target.value) })}
                                           className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                            )}
                            <div>
                                <label className="block text-slate-300 text-sm mb-1">Dias de trial</label>
                                <input type="number" value={form.trialDays ?? 0} onChange={e => setForm({ ...form, trialDays: Number(e.target.value) })}
                                       className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-1">Descrição</label>
                                <textarea value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                                          className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-1">Benefícios</label>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                                           onKeyDown={e => e.key === 'Enter' && addFeature()} placeholder="Digite e pressione Enter"
                                           className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                    <button type="button" onClick={addFeature} className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-3 py-2 rounded-lg transition">
                                        Adicionar
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {form.features?.map((f, i) => (
                                        <span key={i} className="bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      {f}
                                            <button onClick={() => removeFeature(i)} className="text-slate-400 hover:text-red-400 ml-1">×</button>
                    </span>
                                    ))}
                                </div>
                            </div>
                            <button type="button" onClick={() => update(form, { onSuccess: () => setEditing(false) })} disabled={updating}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                                {updating ? 'Salvando...' : 'Salvar alterações'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-slate-700">
                                <span className="text-slate-400 text-sm">Valor</span>
                                <span className="text-white text-sm font-medium">{plan.amountFormatted}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-700">
                                <span className="text-slate-400 text-sm">Recorrência</span>
                                <span className="text-white text-sm">{plan.recurrenceLabel}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-700">
                                <span className="text-slate-400 text-sm">Trial</span>
                                <span className="text-white text-sm">{plan.trialDays > 0 ? `${plan.trialDays} dias` : '—'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-700">
                                <span className="text-slate-400 text-sm">Máx. assinantes</span>
                                <span className="text-white text-sm">{plan.maxSubscriptions ?? 'Ilimitado'}</span>
                            </div>
                            {plan.description && (
                                <div className="py-2 border-b border-slate-700">
                                    <span className="text-slate-400 text-sm block mb-1">Descrição</span>
                                    <p className="text-white text-sm">{plan.description}</p>
                                </div>
                            )}
                            {plan.features.length > 0 && (
                                <div className="py-2">
                                    <span className="text-slate-400 text-sm block mb-2">Benefícios</span>
                                    <div className="flex flex-wrap gap-2">
                                        {plan.features.map((f, i) => (
                                            <span key={i} className="bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded-full">{f}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}