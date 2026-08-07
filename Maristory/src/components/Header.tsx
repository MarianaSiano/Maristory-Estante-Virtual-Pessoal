import React from 'react';
import { User } from '../types.js';
import { BookOpen, Library, BarChart3, ShieldAlert, LogOut, User as UserIcon, Settings } from 'lucide-react';

interface HeaderProps {
    user: User | null;
    activeTab: 'shelf' | 'catalog' | 'stats' | 'admin';
    setActiveTab: (tab: 'shelf' | 'catalog' | 'stats' | 'admin') => void;
    onOpenAuth: () => void;
    onLogout: () => void;
    onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    user,
    activeTab,
    setActiveTab,
    onOpenAuth,
    onLogout,
    onOpenProfile,
}) => {
    return (
        <header id="main-header" className="sticky top-0 z-40 bg-white text-slate-800 shadow-xs border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo Posicionada no Topo (Header) */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveTab('shelf')}
                            className="flex items-center gap-3 group focus:outline-none text-left"
                            title="Maristory - Ir para Minha Estante"
                        >
                            <img
                                src="/images/logo-light.svg"
                                alt="Maristory - Estante Virtual"
                                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/images/logos/Fundo%20Transparente/Maristory%20-%20Fundo%20Transparente.png';
                                }}
                            />
                        </button>
                    </div>

                    {/* Navigation Links (If User Logged In) */}
                    {user ? (
                        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
                            <button
                                id="nav-tab-shelf"
                                onClick={() => setActiveTab('shelf')}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'shelf'
                                        ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600 font-bold'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <BookOpen className="w-4 h-4 text-purple-600" />
                                <span>Minha Estante</span>
                            </button>

                            <button
                                id="nav-tab-catalog"
                                onClick={() => setActiveTab('catalog')}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'catalog'
                                        ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600 font-bold'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <Library className="w-4 h-4 text-purple-600" />
                                <span>Catálogo Geral</span>
                            </button>

                            <button
                                id="nav-tab-stats"
                                onClick={() => setActiveTab('stats')}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'stats'
                                        ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600 font-bold'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <BarChart3 className="w-4 h-4 text-purple-600" />
                                <span>Estatísticas</span>
                            </button>

                            {/* ADMIN EXCLUSIVE TAB */}
                            {user.role === 'ADMIN' && (
                                <button
                                    id="nav-tab-admin"
                                    onClick={() => setActiveTab('admin')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTab === 'admin'
                                            ? 'bg-purple-600 text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    <div className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center text-[9px] font-bold text-purple-800">
                                        ADM
                                    </div>
                                    <span>Painel do Gestor</span>
                                </button>
                            )}
                        </nav>
                    ) : null}

                    {/* User Profile / Auth Area */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={onOpenProfile}
                                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors text-left group cursor-pointer"
                                    title="Clique para Editar Perfil (Foto, Nome e Senha)"
                                >
                                    <div className="hidden sm:flex flex-col text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <span className="text-xs font-bold text-slate-800 leading-tight group-hover:text-purple-600 transition-colors">{user.name}</span>
                                            {user.role === 'ADMIN' ? (
                                                <span className="px-1.5 py-0.2 text-[9px] uppercase tracking-wider font-extrabold bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                                                    ADM
                                                </span>
                                            ) : (
                                                <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                                                    Leitor
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-400">{user.email}</span>
                                    </div>

                                    <div className="relative">
                                        <img
                                            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                                            alt={user.name}
                                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-slate-200 group-hover:ring-purple-500 shadow-2xs transition-all"
                                        />
                                        <div className="absolute -bottom-0.5 -right-0.5 bg-purple-600 text-white p-0.5 rounded-full shadow-2xs">
                                            <Settings className="w-2.5 h-2.5" />
                                        </div>
                                    </div>
                                </button>

                                <button
                                    id="btn-header-profile"
                                    onClick={onOpenProfile}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 transition-colors hidden sm:flex items-center gap-1"
                                    title="Editar Perfil"
                                >
                                    <Settings className="w-3.5 h-3.5 text-purple-600" />
                                    <span>Perfil</span>
                                </button>

                                <button
                                    id="btn-header-logout"
                                    onClick={onLogout}
                                    className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                    title="Sair do Maristory"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                id="btn-header-login"
                                onClick={onOpenAuth}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all"
                            >
                                <UserIcon className="w-4 h-4" />
                                <span>Entrar / Cadastrar</span>
                            </button>
                        )}
                    </div>

                </div>

                {/* Mobile Navigation Row */}
                {user && (
                    <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs">
                        <button
                            onClick={() => setActiveTab('shelf')}
                            className={`flex flex-col items-center gap-0.5 ${activeTab === 'shelf' ? 'text-purple-600 font-bold' : 'text-slate-500'}`}
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>Estante</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('catalog')}
                            className={`flex flex-col items-center gap-0.5 ${activeTab === 'catalog' ? 'text-purple-600 font-bold' : 'text-slate-500'}`}
                        >
                            <Library className="w-4 h-4" />
                            <span>Catálogo</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`flex flex-col items-center gap-0.5 ${activeTab === 'stats' ? 'text-purple-600 font-bold' : 'text-slate-500'}`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span>Estatísticas</span>
                        </button>
                        {user.role === 'ADMIN' && (
                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`flex flex-col items-center gap-0.5 ${activeTab === 'admin' ? 'text-purple-600 font-bold' : 'text-slate-500'}`}
                            >
                                <ShieldAlert className="w-4 h-4" />
                                <span>ADM</span>
                            </button>
                        )}
                    </div>
                )}

            </div>
        </header>
    );
};