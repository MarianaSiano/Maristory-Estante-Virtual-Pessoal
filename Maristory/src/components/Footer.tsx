import React from 'react';
import { Heart, Lock, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer id="main-footer" className="bg-slate-900 text-slate-300 text-xs py-10 mt-20 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                    {/* Logo & Slogan */}
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <img
                            src="/images/logo-dark.svg"
                            alt="Maristory"
                            className="h-12 w-auto object-contain"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/logos/Com%20Fundo/Maristory.png';
                            }}
                        />
                        <p className="text-[11px] text-slate-400 max-w-sm text-center md:text-left">
                            Sistema de gerenciamento e catalogação de leituras focado na organização pessoal.
                        </p>
                    </div>

                    {/* Core Guarantees Callout */}
                    <div className="flex flex-wrap items-center justify-center gap-4 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-300">
                            <Lock className="w-4 h-4 text-purple-400" />
                            <span>Sem Rede Social</span>
                        </div>
                        <span className="text-slate-700">•</span>
                        <div className="flex items-center gap-1.5 text-slate-300">
                            <Shield className="w-4 h-4 text-purple-400" />
                            <span>Estante Privada e Individual</span>
                        </div>
                        <span className="text-slate-700">•</span>
                        <div className="flex items-center gap-1.5 text-slate-300">
                            <Heart className="w-4 h-4 text-rose-400 fill-rose-400/30" />
                            <span>Inspirado no Skoob</span>
                        </div>
                    </div>

                </div>

                <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 gap-2">
                    <p>© {new Date().getFullYear()} Maristory. Todos os direitos reservados.</p>
                    <p className="flex items-center gap-1">
                        Desenvolvido com <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> para leitores apaixonados
                    </p>
                </div>

            </div>
        </footer>
    );
};