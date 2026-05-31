import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlans, useCreatePlan, useTogglePlanStatus } from '../../hooks/usePlans'
import type { CreatePlanRequest, Recurrence } from '../../types/plan'
import { getErrorMessage } from '../../services/authService'

const RECURRENCES: { value: Recurrence; label: string }[] = [
    { value: 'MONTHLY', label: 'Mensal' },
    { value: 'QUARTERLY', label: 'Trimestral' },
    { value: 'SEMIANNUAL', label: 'Semestral' },
    { value: 'ANNUAL', label: 'Anual' },
    { value: 'CUSTOM', label: 'Personalizado' },
]

const emptyForm = (): CreatePlanRequest => ({
    name: '',
    description: '',
    amountCents: 0,
    recurrence: 'MONTHLY',
    trialDays: 0,
    features: [],
})

export default function PlansPage() {
    const navigate = useNavigate()
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState('')
    const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState<CreatePlanRequest>(emptyForm())
    const [featureInput, setFeatureInput] = useState('')

    const { data, isLoading } = usePlans(page, 10, search || undefined, activeFilter)
    const { mutate: create, isPending: creating, error: createError } = useCreatePlan()
    const { mutate: toggle } = useTogglePlanStatus()

    const handleCreate = () => {
        create(form, {
            onSuccess: () => {
                setShowForm(false)
                setForm(emptyForm())
            }
        })
    }

    const addFeature = () => {
        if (featureInput.trim()) {
            setForm({ ...form, features: [...(form.features ?? []), featureInput.trim()] })
            setFeatureInput('')
        }
    }

    const removeFeature = (index: number) => {
        setForm({ ...form, features: form.features?.filter((_, i) => i !== index) })
    }

    return (
        <div className="min-h-screen bg-slate-900 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-white">Planos</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                    >
                        + Novo plano
                    </button>
                </div>

                {showForm && (
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                        <h2 className="text-white font-medium mb-4">Cadastrar plano</h2>
                        {createError && (
                            <p className="text-red-400 text-sm mb-3">{getErrorMessage(createError)}</p>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-300 text-sm mb-1">Nome</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-1">Valor (em centavos)</label>
                                <input
                                    type="number"
                                    value={form.amountCents}
                                    onChange={e => setForm({ ...form, amountCents: Number(e.target.value) })}
                                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="Ex: 9990 = R$ 99,90"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-1">Recorrência</label>
                                <select
                                    value={form.recurrence}
                                    onChange={e => setForm({ ...form, recurrence: e.target.value as Recurrence })}
                                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                >
                                    {RECURRENCES.map(r => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>
                            {form.recurrence === 'CUSTOM' && (
                                <div>
                                    <label className="block text-slate-300 text-sm mb-1">Dias do ciclo</label>
                                    <input
                                        type="number"
                                        value={form.customDays ?? ''}
                                        onChange={e => setForm({ ...form, customDays: Number(e.target.value) })}
                                        className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-slate-300 text-sm mb-1">Dias de trial</label>
                                <input
                                    type="number"
                                    value={form.trialDays ?? 0}
                                    onChange={e => setForm({ ...form, trialDays: Number(e.target.value) })}
                                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-1">Máx. assinantes (opcional)</label>
                                <input
                                    type="number"
                                    value={form.maxSubscriptions ?? ''}
                                    onChange={e => setForm({ ...form, maxSubscriptions: e.target.value ? Number(e.target.value) : undefined })}
                                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-slate-300 text-sm mb-1">Descrição</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    rows={2}
                                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-slate-300 text-sm mb-1">Benefícios</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={featureInput}
                                        onChange={e => setFeatureInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addFeature()}
                                        placeholder="Digite e pressione Enter"
                                        className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={addFeature}
                                        className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-3 py-2 rounded-lg transition"
                                    >
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
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                type="button"
                                onClick={handleCreate}
                                disabled={creating}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                            >
                                {creating ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 mb-4">
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(0) }}
                        className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <select
                        value={activeFilter === undefined ? '' : String(activeFilter)}
                        onChange={e => setActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                        className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    >
                        <option value="">Todos</option>
                        <option value="true">Ativos</option>
                        <option value="false">Arquivados</option>
                    </select>
                </div>

                {isLoading ? (
                    <p className="text-slate-400 text-sm">Carregando...</p>
                ) : (
                    <>
                        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left text-slate-400 font-medium px-4 py-3">Nome</th>
                                    <th className="text-left text-slate-400 font-medium px-4 py-3">Valor</th>
                                    <th className="text-left text-slate-400 font-medium px-4 py-3">Recorrência</th>
                                    <th className="text-left text-slate-400 font-medium px-4 py-3">Trial</th>
                                    <th className="text-left text-slate-400 font-medium px-4 py-3">Status</th>
                                    <th className="text-left text-slate-400 font-medium px-4 py-3">Ações</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data?.content.map(plan => (
                                    <tr key={plan.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => navigate(`/plans/${plan.id}`)}
                                                className="text-blue-400 hover:text-blue-300 transition"
                                            >
                                                {plan.name}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-slate-300">{plan.amountFormatted}</td>
                                        <td className="px-4 py-3 text-slate-300">{plan.recurrenceLabel}</td>
                                        <td className="px-4 py-3 text-slate-300">
                                            {plan.trialDays > 0 ? `${plan.trialDays} dias` : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${plan.active ? 'bg-green-900/30 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                          {plan.active ? 'Ativo' : 'Arquivado'}
                        </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => toggle(plan.id)}
                                                className={`text-xs transition ${plan.active ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}`}
                                            >
                                                {plan.active ? 'Arquivar' : 'Reativar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {data?.content.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                                            Nenhum plano encontrado.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <p className="text-slate-400 text-sm">{data?.totalElements ?? 0} plano(s)</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-sm px-3 py-1.5 rounded-lg transition"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={data?.last}
                                    className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-sm px-3 py-1.5 rounded-lg transition"
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}