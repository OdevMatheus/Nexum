import { motion } from 'framer-motion';

import gestaoImg from '../../assets/gestao_de_cliente.webp';
import analyticsImg from '../../assets/analitycs.webp';
import cicloImg from '../../assets/ciclo_de_assinatura.webp';
import crescimentoImg from '../../assets/crescimento_e_escalabilidade.webp';
import ecossistemaImg from '../../assets/ecossistema.webp';

const features = [
    { title: 'Gestão de Clientes', description: 'Centralize seus clientes com uma interface intuitiva.', image: gestaoImg, color: 'bg-rose-50 dark:bg-rose-950/30' },
    { title: 'Dashboard Analítico', description: 'Insights em tempo real para tomada de decisão.', image: analyticsImg, color: 'bg-blue-50 dark:bg-blue-950/30' },
    { title: 'Ciclos de Assinatura', description: 'Automatize renovações e cobranças recorrentes.', image: cicloImg, color: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { title: 'Escalabilidade', description: 'Recursos pensados para o crescimento do seu SaaS.', image: crescimentoImg, color: 'bg-amber-50 dark:bg-amber-950/30' },
    { title: 'Ecossistema Completo', description: 'Integração total do seu fluxo de trabalho.', image: ecossistemaImg, color: 'bg-indigo-50 dark:bg-indigo-950/30' },
];

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 bg-white dark:bg-stone-900 transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    {features.slice(0, 3).map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative bg-[#FDFBF7] dark:bg-stone-950 rounded-3xl overflow-hidden border border-stone-100 dark:border-stone-800 hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-500 w-full"
                        >
                            <div className="p-8">
                                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2 transition-colors">{feature.title}</h3>
                                <p className="text-stone-600 dark:text-stone-400 text-sm mb-6 transition-colors">{feature.description}</p>
                                <div className={`rounded-2xl ${feature.color} overflow-hidden transition-colors`}>
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 dark:opacity-80"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 justify-center max-w-4xl mx-auto">
                    {features.slice(3, 5).map((feature, index) => (
                        <motion.div
                            key={index + 3}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: (index + 3) * 0.1 }}
                            className="group relative bg-[#FDFBF7] dark:bg-stone-950 rounded-3xl overflow-hidden border border-stone-100 dark:border-stone-800 hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-500 w-full"
                        >
                            <div className="p-8">
                                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2 transition-colors">{feature.title}</h3>
                                <p className="text-stone-600 dark:text-stone-400 text-sm mb-6 transition-colors">{feature.description}</p>
                                <div className={`rounded-2xl ${feature.color} overflow-hidden transition-colors`}>
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 dark:opacity-80"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
