import React from 'react';
import { Lock, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer id="main-footer" className="bg-slate-900 text-slate-300 text-xs py-10 mt-20 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                    {/* Logo & Slogan */}
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <img
                            src="/images/logo-dark.svg"
                            alt="Maristory — Biblioteca Particular"
                            className="h-11 w-auto object-contain"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/logos/Com%20Fundo/Maristory.png';
                            }}
                        />
                        <p className="text-[11px] text-slate-400 max-w-sm text-center md:text-left">
                            Biblioteca particular e estante pessoal da proprietária. Catalogação íntima, anotações reflexivas e controle de ritmo de leitura.
                        </p>
                    </div>

                    {/* Core Guarantees Callout */}
                    <div className="flex flex-wrap items-center justify-center gap-4 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                            <Lock className="w-4 h-4 text-purple-400" />
                            <span>Sem Rede Social</span>
                        </div>
                        <span className="text-slate-700">•</span>
                        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                            <Shield className="w-4 h-4 text-purple-400" />
                            <span>Sem Trocas ou Compartilhamento</span>
                        </div>
                        <span className="text-slate-700">•</span>
                        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                            <Heart className="w-4 h-4 text-rose-400 fill-rose-400/30" />
                            <span>Uso Exclusivo da Proprietária</span>
                        </div>
                    </div>

                </div>

                <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 gap-2">
                    <p>© {new Date().getFullYear()} Maristory — Biblioteca Particular. Todos os direitos reservados.</p>
                    <p className="flex items-center gap-1">
                        Espaço privado e acolhedor para amantes da boa literatura
                    </p>
                </div>

            </div>
        </footer>
    );
};
