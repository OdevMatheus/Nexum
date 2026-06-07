import React from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-stone-950 flex transition-colors duration-500 font-sans text-stone-900 dark:text-stone-100">
            <Sidebar />
            
            {/* Conteúdo Principal */}
            <main className="flex-1 ml-64 flex flex-col min-h-screen">
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
