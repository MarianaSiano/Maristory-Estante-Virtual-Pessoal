import React, { useState } from 'react';
import { api } from '../services/api';
import { User, AuthResponse } from '../types';
import {
    X,
    Lock,
    Mail,
    ArrowRight,
    Sparkles,
    KeyRound,
    ShieldCheck,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    if(!isOpen) return null;

    const handleDirectAccess = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.ownerDirectAccess();
            onSuccess(res.user);
            onClose();
        } catch(err: any) {
            setError(err.message || 'Erro ao realizar acesso da proprietária');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await api.login(email, password);
            onSuccess(res.user);
            onClose();
        } catch(err: any) {
            setError(err.message || 'Credenciais inválidas. Esta biblioteca é restrita à sua proprietária.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await api.forgotPassword(email, newPassword || undefined);
            setSuccessMessage(res.message);
            if(newPassword) {
                setTimeout(() => {
                    setIsForgotPassword(false);
                    setSuccessMessage(null);
                }, 2000);
            }
        } catch(err: any) {
            setError(err.message || 'Erro ao processar redefinição de senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden">

                {/* Top Header */}
                <div className="bg-gradient-to-r from-purple-900 via-[#3A0071] to-slate-900 text-white p-6 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 mx-auto flex items-center justify-center text-purple-200 mb-3 shadow-inner">
                        <Lock className="w-6 h-6" />
                    </div>

                    <h2 className="text-xl font-black tracking-tight">
                        Biblioteca Particular
                    </h2>
                    <p className="text-xs text-purple-200 mt-1">
                        Acesso exclusivo da Proprietária
                    </p>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-5">

                    {/* Privacy Note Badge */}
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-start gap-2.5 text-xs text-purple-950">
                        <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                            Sistema estritamente privado. Sem perfis públicos, sem outros usuários e sem compartilhamento ou trocas.
                        </p>
                    </div>

                    {/* Feedback Messages */}
                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {!isForgotPassword ? (
                        <div className="space-y-4">

                            {/* Primary 1-Click Fast Access */}
                            <button
                                type="button"
                                onClick={handleDirectAccess}
                                disabled={loading}
                                className="w-full py-3 px-4 bg-purple-700 hover:bg-purple-800 active:scale-98 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                            >
                                <Sparkles className="w-4 h-4 text-amber-300" />
                                <span>Entrar como Proprietária (Acesso Rápido)</span>
                                <ArrowRight className="w-4 h-4 ml-auto" />
                            </button>

                            <div className="flex items-center gap-2 text-[11px] text-slate-400 my-2">
                                <div className="flex-1 border-t border-slate-200" />
                                <span>ou entre com senha</span>
                                <div className="flex-1 border-t border-slate-200" />
                            </div>

                            {/* Password Login Form */}
                            <form onSubmit={handlePasswordLogin} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        E-mail da Proprietária
                                    </label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="seu-email@exemplo.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Senha
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotPassword(true)}
                                        className="text-[11px] font-semibold text-purple-700 hover:text-purple-900"
                                    >
                                        Esqueceu sua senha?
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors"
                                >
                                    {loading ? 'Validando...' : 'Confirmar e Abrir Biblioteca'}
                                </button>
                            </form>

                        </div>
                    ) : (

                        /* Forgot Password Flow */
                        <form onSubmit={handleResetPassword} className="space-y-3">
                            <div className="text-xs text-slate-600 leading-relaxed">
                                Confirme seu e-mail de proprietária para definir uma nova senha:
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    E-mail
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Nova Senha Desejada
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    placeholder="Mínimo 6 caracteres"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsForgotPassword(false)}
                                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                                >
                                    Voltar ao login
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="py-2 px-4 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs transition-colors"
                                >
                                    {loading ? 'Salvando...' : 'Redefinir Senha'}
                                </button>
                            </div>
                        </form>
                    )}

                </div>

            </div>
        </div>
    );
};