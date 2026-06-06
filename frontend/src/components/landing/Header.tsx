import { Link } from 'react-router-dom';

interface HeaderProps {
    hideLoginButton?: boolean;
    hideRegisterButton?: boolean;
}

export function Header({ hideLoginButton = false, hideRegisterButton = false }: HeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#FDFBF7]/90 dark:bg-stone-950/80 backdrop-blur-md border-b border-rose-100/50 dark:border-stone-800/80 transition-all duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight transition-colors">
                            Nexum<span className="text-rose-400 dark:text-rose-500">.</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-6">
                        {!hideLoginButton && (
                            <Link
                                to="/login"
                                className="text-base font-medium text-stone-600 dark:text-stone-400 hover:text-rose-400 dark:hover:text-rose-400 transition-colors"
                            >
                                Entrar
                            </Link>
                        )}

                        {!hideRegisterButton && (
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent rounded-full text-base font-medium text-white bg-rose-400 hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-600 transition-all shadow-sm hover:shadow-rose-200 dark:hover:shadow-rose-900/40"
                            >
                                Criar conta
                            </Link>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
}