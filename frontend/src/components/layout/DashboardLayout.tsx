import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-[#FDFBF7] dark:bg-stone-950 flex transition-colors duration-500 font-sans text-stone-900 dark:text-stone-100">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Conteúdo Principal */}
            <main className="flex-1 min-w-0 lg:ml-64 flex flex-col min-h-screen overflow-x-hidden">
                {/* Mobile Top Header */}
                <header className="lg:hidden sticky top-0 z-20 h-16 px-4 sm:px-6 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <span className="text-xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">
                        Nexum<span className="text-rose-400 dark:text-rose-500">.</span>
                    </span>
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
                        aria-label="Abrir menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </header>

                <div className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
                    <div className="max-w-7xl mx-auto w-full min-w-0">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
