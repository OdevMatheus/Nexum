import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function DashboardPage() {
    useDocumentTitle('Dashboard');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight transition-colors">
                        Bem-vindo de volta!
                    </h1>
                    <p className="text-stone-500 dark:text-stone-400 mt-2 transition-colors">
                        Aqui está o resumo do seu negócio hoje.
                    </p>
                </div>

                {/* Dashboard content will go here in the future */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Placeholder Cards */}
                    {[1, 2, 3, 4].map((i) => (
                        <div 
                            key={i} 
                            className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm dark:shadow-none h-32 flex items-center justify-center transition-colors duration-500"
                        >
                            <span className="text-stone-400 dark:text-stone-600 text-sm font-medium">Métrica {i}</span>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
