import { useParams, useNavigate } from 'react-router-dom'
import { useClient, useUpdateClient, useDeactivateClient } from '../../hooks/useClients'
import { useState, useEffect } from 'react'
import type { UpdateClientRequest } from '../../types/client'
import { getErrorMessage } from '../../services/authService'

export default function ClientDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data: client, isLoading } = useClient(id!)
    const { mutate: update, isPending: updating, error: updateError } = useUpdateClient(id!)
    const { mutate: deactivate } = useDeactivateClient()

    const [form, setForm] = useState<UpdateClientRequest>({ name: '', email: '', phone: '', document: '' })
    const [editing, setEditing] = useState(false)

    useEffect(() => {
        if (client) {
            setForm({
                name: client.name,
                email: client.email,
                phone: client.phone ?? '',
                document: client.document ?? '',
            })
        }
    }, [client])

    if (isLoading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <p className="text-slate-400">Carregando...</p>
        </div>
    )

    if (!client) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <p className="text-slate-400">Cliente não encontrado.</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-900 p-8">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate('/clients')}
                    className="text-slate-400 hover:text-white text-sm mb-6 transition"
                >
                    ← Voltar
                </button>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl font-semibold text-white">{client.name}</h1>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditing(!editing)}
                                className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-3 py-1.5 rounded-lg transition"
                            >
                                {editing ? 'Cancelar' : 'Editar'}
                            </button>
                            <button
                                onClick={() => deactivate(client.id, { onSuccess: () => navigate('/clients') })}
                                className="bg-red-900/40 hover:bg-red-900/60 text-red-400 text-sm px-3 py-1.5 rounded-lg transition"
                            >
                                Desativar
                            </button>
                        </div>
                    </div>

                    {updateError && (
                        <p className="text-red-400 text-sm mb-4">{getErrorMessage(updateError)}</p>
                    )}

                    {editing ? (
                        <div className="space-y-4">
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
                                <label className="block text-slate-300 text-sm mb-1">E-mail</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-1">Telefone</label>
                                <input
                                    type="text"
                                    value={form.phone ?? ''}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-1">Documento</label>
                                <input
                                    type="text"
                                    value={form.document ?? ''}
                                    onChange={e => setForm({ ...form, document: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => update(form, { onSuccess: () => setEditing(false) })}
                                disabled={updating}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                            >
                                {updating ? 'Salvando...' : 'Salvar alterações'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-slate-700">
                                <span className="text-slate-400 text-sm">E-mail</span>
                                <span className="text-white text-sm">{client.email}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-700">
                                <span className="text-slate-400 text-sm">Telefone</span>
                                <span className="text-white text-sm">{client.phone ?? '—'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-700">
                                <span className="text-slate-400 text-sm">Documento</span>
                                <span className="text-white text-sm">{client.document ?? '—'}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-slate-400 text-sm">Cadastrado em</span>
                                <span className="text-white text-sm">
                  {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}