import { Header } from '../components/landing/Header';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection'; // <-- Importe aqui

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-stone-950 font-sans selection:bg-rose-200 selection:text-stone-900 dark:selection:bg-rose-500/30 dark:selection:text-rose-100 transition-colors duration-500">
            <Header />

            <main>
                <HeroSection />
                <FeaturesSection />
            </main>
        </div>
    );
}