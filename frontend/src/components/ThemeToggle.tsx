import { memo } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle = memo(function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 shadow-lg border border-stone-200 dark:border-stone-700 hover:shadow-xl hover:scale-105 active:scale-95 transition-[transform,box-shadow,background-color,color,border-color] duration-200 cursor-pointer"
            aria-label="Alternar tema claro/escuro"
        >
            {theme === 'dark' ? (
                <Moon className="w-6 h-6 transition-transform duration-300" />
            ) : (
                <Sun className="w-6 h-6 transition-transform duration-300" />
            )}
        </button>
    );
});
