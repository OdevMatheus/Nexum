import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, CreditCard, Package, Settings, LogOut } from 'lucide-react';
import { useLogout } from '../../hooks/useAuth';
import { NotificationBell } from './NotificationBell';

const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', path: '/clients', icon: Users },
    { name: 'Planos', path: '/plans', icon: Package },
    { name: 'Assinaturas', path: '/subscriptions', icon: CreditCard },
];

export function Sidebar() {
    const logout = useLogout();

    return (
        <aside className="fixed top-0 left-0 w-64 h-screen bg-white dark:bg-stone-900 border-r border-stone-100 dark:border-stone-800 flex flex-col transition-colors duration-500 z-40">
            {/* Logo */}
            <div className="h-20 flex items-center px-8 border-b border-stone-100 dark:border-stone-800/50 transition-colors">
                <span className="text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-tight transition-colors">
                    Nexum<span className="text-rose-400 dark:text-rose-500">.</span>
                </span>
            </div>

            {/* Navegação */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                isActive
                                    ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50 hover:text-stone-900 dark:hover:text-stone-200'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="px-4 py-2 border-t border-stone-100 dark:border-stone-800/50 flex flex-col gap-1 transition-colors">
                <div className="flex items-center justify-between px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 transition-colors">
                    <span className="text-sm font-medium">Notificações</span>
                    <NotificationBell />
                </div>
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            isActive
                                ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50 hover:text-stone-900 dark:hover:text-stone-200'
                        }`
                    }
                >
                    <Settings className="w-5 h-5" />
                    Configurações
                </NavLink>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => logout.mutate()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all mt-1"
                >
                    <LogOut className="w-5 h-5" />
                    Sair da conta
                </motion.button>
            </div>
        </aside>
    );
}
