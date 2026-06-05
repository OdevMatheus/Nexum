import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import heroImage from '../../assets/hero.png';

// 2. Declaramos as variantes do container (a cascata)
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2, // Atraso de 0.2s entre cada elemento
            delayChildren: 0.1,
        },
    },
};

// 3. Declaramos as variantes dos itens (os elementos que sobem e aparecem)
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 50, damping: 15 }
    },
};

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#FDFBF7]">

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] rounded-full bg-rose-200/40 blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-stone-300/40 blur-[100px]"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-stone-200 shadow-sm text-stone-600 text-sm font-medium mb-8">
                        <Sparkles className="w-4 h-4 text-rose-400 mr-2" />
                        <span className="bg-gradient-to-r from-rose-400 to-rose-500 bg-clip-text text-transparent font-semibold mr-1">
              Novo:
            </span>
                        Gestão inteligente de ciclos
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-stone-800 tracking-tight mb-8 leading-tight">
                        Conecte o seu negócio <br className="hidden md:block" />
                        com a <span className="text-rose-400 relative">
              fidelidade
                        <motion.svg
                            className="absolute w-full h-3 -bottom-1 left-0 text-rose-200 -z-10"
                            viewBox="0 0 100 10"
                            preserveAspectRatio="none"
                        >
                <motion.path
                    d="M0 5 Q 50 10 100 5"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 1, ease: "easeOut" }}
                />
              </motion.svg>
            </span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="mt-4 max-w-2xl text-lg md:text-xl text-stone-500 mx-auto mb-10 leading-relaxed">
                        A plataforma <span className="font-medium text-stone-700">Nexum</span> simplifica a gestão dos seus clientes, automatiza a faturação de planos e devolve-lhe o tempo necessário para escalar.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                        <Link
                            to="/register"
                            className="group flex items-center justify-center px-8 py-4 text-base font-medium rounded-full text-white bg-rose-400 hover:bg-rose-500 transition-all shadow-[0_0_40px_-10px_rgba(251,113,133,0.5)] hover:shadow-[0_0_60px_-15px_rgba(251,113,133,0.7)] hover:-translate-y-1"
                        >
                            Começar gratuitamente
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a
                            href="#features"
                            className="flex items-center justify-center px-8 py-4 border border-stone-200 text-base font-medium rounded-full text-stone-600 bg-white hover:bg-stone-50 transition-all hover:-translate-y-1"
                        >
                            Ver como funciona
                        </a>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, type: "spring", bounce: 0.3 }}
                    className="mt-20 mx-auto max-w-5xl perspective-1000"
                >
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-xl p-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative"
                    >
                        <img
                            src={heroImage}
                            alt="Dashboard da Plataforma"
                            className="w-full h-auto rounded-2xl shadow-sm border border-stone-100/50"
                        />

                        <motion.div
                            animate={{ y: [0, 15, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -right-8 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-stone-100 hidden lg:flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-emerald-600 text-lg">💳</span>
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-stone-800">Assinatura renovada</p>
                                <p className="text-xs text-stone-500">Há 2 minutos</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>

            </div>
        </section>
    );
}