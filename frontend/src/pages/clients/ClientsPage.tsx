import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClients, useCreateClient, useDeactivateClient } from '../../hooks/useClients'
import type { CreateClientRequest } from '../../types/client'
import { getErrorMessage } from '../../services/authService'

export default function ClientsPage() {
    const navigate = useNavigate()
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState<CreateClientRequest>({ name: '', email: '', phone: '', document: '' })

    const { data, isLoading } = useClients(page, 10, search || undefined)
    const { mutate: create, isPending: creating, error: createError } = useCreateClient()
    const { mutate: deactivate } = useDeactivateClient()

    const handleCreate = () => {
        create(form, {
            onSuccess: () => {
                setShowForm(false)
                setForm({ name: '', email: '', phone: '', document: '' })
            }
        })
    }

    return (
        <div className="min-h-screen bg-slate-900 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-white">Clientes</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                    >
                        + Novo cliente
                    </button>
                </div>

                {showForm && (
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                        <h2 className="text-white font-medium mb-4">Cadastrar cliente</h2>
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
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-1">Documento</label>
                                <input
                                    type="text"
                                    value={form.document}
                                    onChange={e => setForm({ ...form, document: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
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

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou e-mail..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(0) }}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    />
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
                                    <th className="text-left text-slate-400 font-medium px-4 py-3">E-mail</th>
                                    <th className="text-left text-slate-400 font-medium px-4 py-3">Telefone</th>
                                    <th className="text-left text-slate-400 font-medium px-4 py-3">Documento</th>
                                    <th className="text-left text-slate-400 font-medium px-4 py-3">Ações</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data?.content.map(client => (
                                    <tr key={client.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => navigate(`/clients/${client.id}`)}
                                                className="text-blue-400 hover:text-blue-300 transition"
                                            >
                                                {client.name}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-slate-300">{client.email}</td>
                                        <td className="px-4 py-3 text-slate-300">{client.phone ?? '—'}</td>
                                        <td className="px-4 py-3 text-slate-300">{client.document ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => deactivate(client.id)}
                                                className="text-red-400 hover:text-red-300 text-xs transition"
                                            >
                                                Desativar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {data?.content.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                                            Nenhum cliente encontrado.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <p className="text-slate-400 text-sm">
                                {data?.totalElements ?? 0} cliente(s) encontrado(s)
                            </p>
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