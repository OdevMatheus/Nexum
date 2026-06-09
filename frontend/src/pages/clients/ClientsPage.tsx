import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, EyeOff } from 'lucide-react';
import { useClients, useCreateClient, useDeactivateClient } from '../../hooks/useClients';
import type { CreateClientRequest } from '../../types/client';
import { getErrorMessage } from '../../services/authService';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { countries } from '../../Utils/phone';

export default function ClientsPage() {
    useDocumentTitle('Clientes');
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<CreateClientRequest>({ name: '', email: '', phone: '', document: '' });
    const [selectedCountry, setSelectedCountry] = useState('+55');

    const { data, isLoading } = useClients(page, 10, search || undefined);
    const { mutate: create, isPending: creating, error: createError } = useCreateClient();
    const { mutate: deactivate } = useDeactivateClient();

    const handleCreate = () => {
        const cleanNumber = (form.phone || '').replace(/\D/g, '');
        const fullPhone = cleanNumber ? `${selectedCountry}${cleanNumber}` : '';
        
        create({
            ...form,
            phone: fullPhone
        }, {
            onSuccess: () => {
                setShowForm(false);
                setForm({ name: '', email: '', phone: '', document: '' });
                setSelectedCountry('+55');
            }
        });
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight transition-colors">Clientes</h1>
                    <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 transition-colors">Gerencie a base de clientes cadastrados.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowForm(!showForm)}
                    className="bg-stone-900 hover:bg-stone-800 dark:bg-rose-500 dark:hover:bg-rose-600 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Novo Cliente
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
                        <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4 transition-colors">Novo Cadastro</h2>
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
                                    placeholder="Razão Social ou Nome"
                                    className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">E-mail</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="contato@empresa.com"
                                    className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Telefone</label>
                                <div className="flex gap-2">
                                    <select
                                        value={selectedCountry}
                                        onChange={e => setSelectedCountry(e.target.value)}
                                        className="bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all max-w-[110px]"
                                    >
                                        {countries.map(country => (
                                            <option key={country.code} value={country.code}>
                                                {country.flag} {country.code}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                        placeholder="(00) 00000-0000"
                                        className="flex-1 bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-stone-600 dark:text-stone-400 text-xs font-medium mb-1.5 transition-colors">Documento (CPF/CNPJ)</label>
                                <input
                                    type="text"
                                    value={form.document}
                                    onChange={e => setForm({ ...form, document: e.target.value })}
                                    placeholder="000.000.000-00"
                                    className="w-full bg-[#FDFBF7] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCreate}
                                disabled={creating}
                                className="bg-stone-900 hover:bg-stone-800 dark:bg-rose-500 dark:hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                            >
                                {creating ? 'Salvando...' : 'Salvar Cliente'}
                            </motion.button>
                            <button
                                onClick={() => setShowForm(false)}
                                className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-stone-400" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar clientes por nome ou e-mail..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(0); }}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 dark:focus:border-rose-500/50 transition-all shadow-sm dark:shadow-none"
                />
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
                                        <th className="font-medium text-stone-500 dark:text-stone-400 px-6 py-4">E-mail</th>
                                        <th className="font-medium text-stone-500 dark:text-stone-400 px-6 py-4">Telefone</th>
                                        <th className="font-medium text-stone-500 dark:text-stone-400 px-6 py-4">Documento</th>
                                        <th className="font-medium text-stone-500 dark:text-stone-400 px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {data?.content.map(client => (
                                        <tr key={client.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => navigate(`/clients/${client.id}`)}
                                                    className="font-medium text-stone-800 dark:text-stone-200 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                                                >
                                                    {client.name}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400">{client.email}</td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400">{client.phone || '—'}</td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400">{client.document || '—'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => deactivate(client.id)}
                                                    className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                                                    title="Desativar cliente"
                                                >
                                                    <EyeOff className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {data?.content.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-stone-500 dark:text-stone-400">
                                                Nenhum cliente encontrado com os filtros atuais.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <p className="text-stone-500 dark:text-stone-400 text-sm">
                            Mostrando {data?.content.length || 0} de {data?.totalElements || 0} clientes
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
