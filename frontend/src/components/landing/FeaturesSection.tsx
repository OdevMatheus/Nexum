import { motion } from 'framer-motion';
import { Users, BarChart3, RefreshCw, TrendingUp, Layers } from 'lucide-react';

import imgGestao from '../../assets/gestao_de_cliente.webp';
import imgAnalytics from '../../assets/analitycs.webp';
import imgCiclo from '../../assets/ciclo_de_assinatura.webp';
import imgEscala from '../../assets/crescimento_e_escalabilidade.webp';
import imgEcossistema from '../../assets/ecossistema.webp';

const features = [
    {
        title: 'Gestão de Clientes',
        description: 'Centralize seus clientes com uma interface intuitiva.',
        icon: Users,
        colSpan: 'md:col-span-2',
        accentIcon: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
        glow: 'from-rose-500/25 via-rose-500/5 to-transparent',
        image: imgGestao,
    },
    {
        title: 'Dashboard Analítico',
        description: 'Insights em tempo real para tomada de decisão.',
        icon: BarChart3,
        colSpan: 'md:col-span-2',
        accentIcon: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
        glow: 'from-indigo-500/25 via-blue-500/5 to-transparent',
        image: imgAnalytics,
    },
    {
        title: 'Ciclos de Assinatura',
        description: 'Automatize renovações e cobranças recorrentes.',
        icon: RefreshCw,
        colSpan: 'md:col-span-2',
        accentIcon: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
        glow: 'from-rose-500/20 via-indigo-500/10 to-transparent',
        image: imgCiclo,
    },
    {
        title: 'Escalabilidade',
        description: 'Recursos pensados para o crescimento do seu SaaS.',
        icon: TrendingUp,
        colSpan: 'md:col-span-3',
        accentIcon: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
        glow: 'from-blue-500/25 via-rose-500/10 to-transparent',
        image: imgEscala,
    },
    {
        title: 'Ecossistema Completo',
        description: 'Integração total do seu fluxo de trabalho.',
        icon: Layers,
        colSpan: 'md:col-span-3',
        accentIcon: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
        glow: 'from-indigo-500/25 via-rose-500/10 to-transparent',
        image: imgEcossistema,
    },
];

export default function FeaturesSection() {
    return (
        <section
            id="features"
            className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-stone-200/60 dark:border-stone-900"
        >
            {/* Subtle Ambient Rose/Indigo Glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-rose-500/15 via-indigo-500/15 to-blue-500/15 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-6xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50 tracking-tight mb-4">
                        Tudo o que precisa para escalar
                    </h2>
                    <p className="text-stone-600 dark:text-stone-400 text-lg">
                        Construído com foco na usabilidade e precisão para negócios modernos.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.45, delay: index * 0.08 }}
                            className={`${feature.colSpan} group relative rounded-3xl bg-stone-950 border border-stone-800/90 hover:border-rose-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-rose-500/10`}
                        >
                            {/* Top Specular Edge */}
                            <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-indigo-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

                            {/* Visual Header Stage */}
                            <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-950">
                                {/* Radial Rose/Indigo Tint */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${feature.glow} opacity-80 z-10 pointer-events-none`}
                                />
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/35 to-transparent z-10" />
                            </div>

                            {/* Card Body */}
                            <div className="relative z-20 p-6 sm:p-7 pt-3 flex flex-col gap-2.5 bg-stone-950">
                                <div className="flex items-center gap-3.5">
                                    <div
                                        className={`w-10 h-10 rounded-xl border ${feature.accentIcon} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105`}
                                    >
                                        <feature.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                                        {feature.title}
                                    </h3>
                                </div>
                                <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
