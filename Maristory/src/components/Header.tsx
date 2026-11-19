import React from 'react';
import { User } from '../types';
import { BookOpen, BarChart3, Plus, Settings, LogOut, Lock, ShieldCheck } from 'lucide-react';

interface HeaderProps {
    user: User | null;
    activeTab: 'shelf' | 'stats';
    setActiveTab: (tab: 'shelf' | 'stats') => void;
    onOpenAuth: () => void;
    onLogout: () => void;
    onOpenProfile: () => void;
    onOpenAddBook: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    user,
    activeTab,
    setActiveTab,
    onOpenAuth,
    onLogout,
    onOpenProfile,
    onOpenAddBook,
}) => {
    return (
        <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-slate-800 shadow-xs border-b border-purple-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-18">

                    {/* Logo & Subtitle */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveTab('shelf')}
                            className="flex items-center gap-2 group focus:outline-none text-left"
                            title="Maristory — Biblioteca Particular"
                        >
                            <img
                                src="/images/logo-light.svg"
                                alt="Maristory — Biblioteca Particular"
                                className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-102"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/images/logos/Fundo%20Transparente/Maristory%20-%20Fundo%20Transparente.png';
                                }}
                            />
                            <div className="hidden sm:flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider font-extrabold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 w-fit flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5" />
                                    <span>Biblioteca Particular</span>
                                </span>
                            </div>
                        </button>
                    </div>

                    {/* Navigation Links */}
                    {user && (
                        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
                            <button
                                id="nav-tab-shelf"
                                onClick={() => setActiveTab('shelf')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'shelf'
                                        ? 'bg-purple-50 text-purple-700 shadow-2xs font-extrabold'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <BookOpen className="w-4 h-4 text-purple-600" />
                                <span>Minha Estante</span>
                            </button>

                            <button
                                id="nav-tab-stats"
                                onClick={() => setActiveTab('stats')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'stats'
                                        ? 'bg-purple-50 text-purple-700 shadow-2xs font-extrabold'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <BarChart3 className="w-4 h-4 text-purple-600" />
                                <span>Estatísticas</span>
                            </button>
                        </nav>
                    )}

                    {/* Right Action Controls: + Add Book & Profile */}
                    <div className="flex items-center gap-2 sm:gap-3">

                        {user ? (
                            <>
                                {/* Add Book CTA */}
                                <button
                                    type="button"
                                    onClick={onOpenAddBook}
                                    className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                                >
                                    <Plus className="w-4 h-4 stroke-[3]" />
                                    <span className="hidden sm:inline">Adicionar Livro</span>
                                    <span className="sm:hidden">Livro</span>
                                </button>

                                {/* Profile Trigger */}
                                <button
                                    type="button"
                                    onClick={onOpenProfile}
                                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left group"
                                    title="Configurações da Proprietária (Perfil, Metas e Senha)"
                                >
                                    <div className="hidden lg:flex flex-col text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                                                {user.name}
                                            </span>
                                            <span className="px-1.5 py-0.2 text-[9px] uppercase tracking-wider font-extrabold bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                                                Proprietária
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-400">{user.email}</span>
                                    </div>

                                    <div className="relative">
                                        <img
                                            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                                            alt={user.name}
                                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-purple-200 group-hover:ring-purple-500 shadow-2xs transition-all"
                                        />
                                        <div className="absolute -bottom-0.5 -right-0.5 bg-purple-600 text-white p-0.5 rounded-full shadow-2xs">
                                            <Settings className="w-2.5 h-2.5" />
                                        </div>
                                    </div>
                                </button>

                                {/* Logout Button */}
                                <button
                                    id="btn-header-logout"
                                    onClick={onLogout}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                    title="Bloquear / Sair da Biblioteca"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <button
                                id="btn-header-login"
                                onClick={onOpenAuth}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-xs transition-all"
                            >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Acesso da Proprietária</span>
                            </button>
                        )}

                    </div>

                </div>

                {/* Mobile Navigation Row */}
                {user && (
                    <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs font-bold">
                        <button
                            onClick={() => setActiveTab('shelf')}
                            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg ${activeTab === 'shelf' ? 'text-purple-700 bg-purple-50' : 'text-slate-500'
                                }`}
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>Minha Estante</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg ${activeTab === 'stats' ? 'text-purple-700 bg-purple-50' : 'text-slate-500'
                                }`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span>Estatísticas</span>
                        </button>
                    </div>
                )}

            </div>
        </header>
    );
};
