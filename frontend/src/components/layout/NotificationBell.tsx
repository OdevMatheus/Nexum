import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertCircle, ShieldAlert, CheckCheck, FileText } from 'lucide-react';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '../../hooks/useNotifications';
import type { NotificationType } from '../../types/notification';

interface NotificationPopoverProps {
    isOpen: boolean;
    onClose: () => void;
}

const getIconForType = (type: NotificationType) => {
    switch (type) {
        case 'PAYMENT_OVERDUE':
            return <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400" />;
        case 'SUBSCRIPTION_SUSPENDED':
            return <ShieldAlert className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
        default:
            return <FileText className="w-5 h-5 text-stone-500 dark:text-stone-400" />;
    }
};

const getBgForType = (type: NotificationType) => {
    switch (type) {
        case 'PAYMENT_OVERDUE':
            return 'bg-rose-50 dark:bg-rose-500/10';
        case 'SUBSCRIPTION_SUSPENDED':
            return 'bg-amber-50 dark:bg-amber-500/10';
        default:
            return 'bg-stone-50 dark:bg-stone-800/50';
    }
};

export function NotificationPopover({ isOpen, onClose }: NotificationPopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const { data, isLoading } = useNotifications(0, 50); // Fetch recent 50
    const { mutate: markAsRead } = useMarkAsRead();
    const { mutate: markAllAsRead, isPending: markingAll } = useMarkAllAsRead();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={popoverRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="absolute bottom-16 left-4 w-80 max-h-[400px] flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden z-50 transition-colors"
                >
                    <div className="flex items-center justify-between p-4 border-b border-stone-100 dark:border-stone-800/50 bg-stone-50/50 dark:bg-stone-900/30">
                        <h3 className="font-bold text-stone-800 dark:text-stone-100">Notificações</h3>
                        <button
                            onClick={() => markAllAsRead()}
                            disabled={markingAll || !data?.content.some(n => !n.read)}
                            className="text-xs font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 disabled:opacity-50 flex items-center gap-1 transition-colors"
                        >
                            <CheckCheck className="w-3.5 h-3.5" /> Ler todas
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="w-6 h-6 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
                            </div>
                        ) : data?.content.length === 0 ? (
                            <div className="text-center py-10">
                                <Bell className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto mb-2" />
                                <p className="text-stone-500 dark:text-stone-400 text-sm">Você não tem notificações.</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {data?.content.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`relative flex items-start gap-3 p-3 rounded-xl transition-colors ${
                                            !notification.read
                                                ? 'bg-stone-50 dark:bg-stone-800/50'
                                                : 'hover:bg-stone-50 dark:hover:bg-stone-800/30'
                                        }`}
                                    >
                                        {!notification.read && (
                                            <span className="absolute top-4 -left-1 w-2 h-2 rounded-full bg-rose-500" />
                                        )}
                                        
                                        <div className={`mt-0.5 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getBgForType(notification.type)}`}>
                                            {getIconForType(notification.type)}
                                        </div>
                                        
                                        <div className="flex-1 pr-4">
                                            <p className={`text-sm text-stone-700 dark:text-stone-300 leading-snug ${!notification.read ? 'font-medium text-stone-900 dark:text-stone-100' : ''}`}>
                                                {notification.message}
                                            </p>
                                            <span className="text-xs text-stone-400 dark:text-stone-500 mt-1 block">
                                                {new Date(notification.createdAt).toLocaleDateString('pt-BR')} às {new Date(notification.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}
                                            </span>
                                        </div>
                                        
                                        {!notification.read && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="absolute right-3 top-3 text-stone-400 hover:text-emerald-500 transition-colors"
                                                title="Marcar como lida"
                                            >
                                                <CheckCheck className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function NotificationBell() {
    const { data: unreadCount } = useUnreadCount();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="relative p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800/50"
            >
                <Bell className="w-5 h-5" />
                {unreadCount && unreadCount > 0 ? (
                    <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-stone-900 rounded-full animate-pulse" />
                ) : null}
            </motion.button>

            <NotificationPopover isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
    );
}