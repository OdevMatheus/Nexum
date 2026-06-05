import { Header } from '../components/landing/Header';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection'; // <-- Importe aqui

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-rose-200 selection:text-stone-900">
            <Header />

            <main>
                <HeroSection />
                <FeaturesSection />
            </main>
        </div>
    );
}