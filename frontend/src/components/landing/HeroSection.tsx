import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import heroImage from '../../assets/hero.png';

export default function HeroSection() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring' as const, stiffness: 90, damping: 18 },
        },
    };

    return (
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden px-4 sm:px-6 lg:px-8">
            {/* Ambient Background Glows: Rose + Indigo/Blue */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-tr from-rose-500/20 via-fuchsia-500/15 to-indigo-500/20 dark:from-rose-500/20 dark:via-fuchsia-500/10 dark:to-blue-500/20 rounded-full blur-[120px]" />
                <div className="absolute top-1/3 left-1/4 w-[420px] h-[420px] bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-[110px]" />
                <div className="absolute top-1/3 right-1/4 w-[420px] h-[420px] bg-indigo-500/10 dark:bg-blue-500/15 rounded-full blur-[110px]" />
                {/* Subtle Architectural Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <motion.div
                className="max-w-6xl mx-auto text-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Badge */}
                <motion.div variants={itemVariants} className="inline-flex justify-center mb-8">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 dark:bg-stone-900/90 border border-rose-500/25 dark:border-rose-500/30 shadow-sm backdrop-blur-md">
                        <span className="flex h-2 w-2 rounded-full bg-gradient-to-r from-rose-400 to-indigo-400 animate-pulse" />
                        <Sparkles className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                        <span className="text-xs font-semibold tracking-wide text-stone-700 dark:text-stone-300">
                            Novo: Gestão inteligente de ciclos
                        </span>
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    variants={itemVariants}
                    className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight leading-[1.08] max-w-4xl mx-auto mb-6"
                >
                    Conecte o seu negócio com a{' '}
                    <span className="bg-gradient-to-r from-rose-400 via-rose-500 to-indigo-500 bg-clip-text text-transparent">
                        fidelidade
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    variants={itemVariants}
                    className="text-lg sm:text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
                >
                    A plataforma Nexum simplifica a gestão dos seus clientes, automatiza a faturação de planos e devolve-lhe o tempo necessário para escalar.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 sm:mb-20"
                >
                    <Link
                        to="/register"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-rose-500 via-rose-500 to-indigo-600 hover:from-rose-400 hover:via-rose-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 shadow-lg shadow-rose-500/25 dark:shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/35 hover:-translate-y-0.5 group"
                    >
                        Começar gratuitamente
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <a
                        href="#features"
                        className="w-full sm:w-auto inline-flex items-center justify-center bg-white/80 dark:bg-stone-900/80 hover:bg-stone-100/90 dark:hover:bg-stone-800/90 text-stone-800 dark:text-stone-200 border border-stone-200/80 dark:border-stone-800 hover:border-rose-500/30 dark:hover:border-indigo-500/40 px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 backdrop-blur-md"
                    >
                        Ver como funciona
                    </a>
                </motion.div>

                {/* Dashboard Showcase Stage */}
                <motion.div
                    variants={itemVariants}
                    className="relative mx-auto max-w-5xl"
                >
                    {/* Backlight Rose + Indigo Aura */}
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-rose-500/30 via-fuchsia-500/20 to-indigo-500/30 rounded-[2rem] blur-2xl opacity-75 dark:opacity-90 -z-10" />

                    {/* Browser / App Window Frame */}
                    <div className="relative rounded-2xl sm:rounded-3xl bg-stone-950/95 p-2 sm:p-3 border border-stone-800/90 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.55)] backdrop-blur-xl overflow-hidden">
                        {/* Top Specular Highlight Line */}
                        <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-rose-400/70 to-indigo-400/70" />

                        {/* Window Top Bar */}
                        <div className="flex items-center justify-between px-3 py-2 mb-2 border-b border-stone-800/80">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                                <span className="w-2.5 h-2.5 rounded-full bg-stone-700" />
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/80" />
                            </div>
                            <div className="px-3 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-[11px] font-medium text-stone-400 tracking-wide">
                                nexum.app
                            </div>
                            <div className="w-10" />
                        </div>

                        {/* Hero Image */}
                        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-stone-950 border border-stone-800/60">
                            <img
                                src={heroImage}
                                alt="Dashboard da Plataforma"
                                className="w-full h-auto max-h-[560px] object-cover object-top"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-transparent pointer-events-none" />
                        </div>
                    </div>

                    {/* Floating Notification Pill */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.5 }}
                        className="hidden sm:flex absolute -bottom-5 -left-4 md:left-6 bg-stone-900/95 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-2xl border border-stone-800 items-center gap-3.5"
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/20 to-indigo-500/20 border border-rose-500/30 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-rose-400" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold text-stone-100">Assinatura renovada</p>
                            <p className="text-[11px] text-stone-400">Há 2 minutos</p>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </section>
    );
}
