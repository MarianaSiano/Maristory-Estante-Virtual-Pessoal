import React, { useState } from 'react';
import { api } from '../service/api.ts';
import { User } from '../types.js';
import { X, Lock, Mail, User as UserIcon, ShieldCheck, Sparkles, AlertCircle, Eye, EyeOff, CheckCircle2, KeyRound, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');

    // Forgot password fields
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    if(!isOpen)
        return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if(mode === 'register' && password.length < 8) {
            setError('A senha deve possuir no mínimo 8 caracteres');
            return;
        }

        setLoading(true);

        try {
            if(mode === 'login') {
                const auth = await api.login(email, password);
                onSuccess(auth.user);
                onClose();
            } else if(mode === 'register') {
                const auth = await api.register(name, email, password);
            } else if(mode === 'forgot') {
                if(!email.trim()) {
                    setError('Informe o seu e-mail cadastrado.');
                    setLoading(false);
                    return;
                }

                if(!newPassword) {
                    setError('Informe a sua nova senha.');
                    setLoading(false);
                    return;
                }

                if(newPassword.length < 8) {
                    setError('A senha deve possuir no mínimo 8 caracteres');
                    setLoading(false);
                    return;
                }

                if(newPassword !== confirmPassword) {
                    setError('A confirmação de senha não coincide com a nova senha');
                    setLoading(false);
                    return;
                }

                const res = await api.forgotPassword(email, newPassword);
                setSuccess(res.message);
                setPassword(newPassword);
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err: any) {
            setError(err.message || 'Falha na operação. Verifique seus dados.');
        } finally {
            setLoading(false);
        }
    };

    const loginAsAdmin = async () => {
        setEmail('marianasianop@gmail.com');
        setPassword('admin123');
        setError(null);
        setLoading(true);
        try {
            const auth = await api.login('marianasianop@gmail.com', 'admin123');
            onSuccess(auth.user);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Erro ao entrar como Administrador.');
        } finally {
            setLoading(false);
        }
    };

    const loginAsUser = async () => {
        setEmail('leitor@maristory.com');
        setPassword('leitor123');
        setError(null);
        setLoading(true);
        try {
            const auth = await api.login('leitor@maristory.com', 'leitor123');
            onSuccess(auth.user);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Erro ao entrar como Leitor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div id="auth-modal-container" className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

                {/* Modal Top Header with Branding */}
                <div className="bg-slate-900 p-6 text-white text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <img
                        src="/images/logo-dark.svg"
                        alt="Maristory"
                        className="h-16 mx-auto object-contain mb-2"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/images/logos/Com%20Fundo/Maristory.png';
                        }}
                    />
                    <p className="text-xs text-slate-300 font-medium max-w-xs mx-auto">
                        Sua Estante Virtual Pessoal e Privada de Leituras
                    </p>
                </div>

                {/* Tab Switcher */}
                {mode !== 'forgot' ? (
                    <div className="flex border-b border-slate-200 bg-slate-50">
                        <button
                            onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                            className={`flex-1 py-3 text-xs font-bold transition-all ${mode === 'login'
                                    ? 'bg-white text-slate-900 border-b-2 border-purple-600 shadow-2xs'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            Entrar na Conta
                        </button>
                        <button
                            onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
                            className={`flex-1 py-3 text-xs font-bold transition-all ${mode === 'register'
                                    ? 'bg-white text-slate-900 border-b-2 border-purple-600 shadow-2xs'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            Criar Nova Conta
                        </button>
                    </div>
                ) : (
                    <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                            <KeyRound className="w-4 h-4 text-purple-600" />
                            <span>Recuperação e Redefinição de Senha</span>
                        </span>
                        <button
                            type="button"
                            onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                            className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 hover:underline"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Voltar ao Login</span>
                        </button>
                    </div>
                )}

                {/* Form Body */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Seu Nome Completo
                                </label>
                                <div className="relative">
                                    <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: Mariana Sianop"
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                E-mail Cadastrado
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seuemail@exemplo.com"
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {mode !== 'forgot' ? (
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Senha {mode === 'register' && '(Mínimo 8 caracteres)'}
                                    </label>
                                    {mode === 'login' && (
                                        <button
                                            type="button"
                                            onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }}
                                            className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 hover:underline"
                                        >
                                            Esqueci minha senha
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={mode === 'register' ? 'Mínimo de 8 caracteres' : '••••••••'}
                                        className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onMouseDown={() => setShowPassword(true)}
                                        onMouseUp={() => setShowPassword(false)}
                                        onMouseLeave={() => setShowPassword(false)}
                                        onTouchStart={() => setShowPassword(true)}
                                        onTouchEnd={() => setShowPassword(false)}
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-purple-600 focus:outline-none transition-colors p-0.5 rounded cursor-pointer"
                                        title="Pressione ou clique para visualizar a senha"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4 text-purple-600" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Forgot password mode fields */
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Nova Senha (Mínimo 8 caracteres)
                                    </label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Mínimo 8 caracteres"
                                            className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onMouseDown={() => setShowNewPassword(true)}
                                            onMouseUp={() => setShowNewPassword(false)}
                                            onMouseLeave={() => setShowNewPassword(false)}
                                            onTouchStart={() => setShowNewPassword(true)}
                                            onTouchEnd={() => setShowNewPassword(false)}
                                            onClick={() => setShowNewPassword((prev) => !prev)}
                                            className="absolute right-3 top-2.5 text-slate-400 hover:text-purple-600 focus:outline-none transition-colors p-0.5 rounded cursor-pointer"
                                            title="Pressione ou clique para visualizar a senha"
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="w-4 h-4 text-purple-600" />
                                            ) : (
                                                <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Confirmar Nova Senha
                                    </label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repita a nova senha"
                                            className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <span>
                                    {mode === 'login'
                                        ? 'Entrar no Maristory'
                                        : mode === 'register'
                                            ? 'Criar Minha Estante'
                                            : 'Redefinir Senha e Salvar'}
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Quick options or Back button */}
                    {mode === 'forgot' ? (
                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                                className="text-xs text-purple-600 hover:text-purple-800 font-semibold hover:underline"
                            >
                                Voltar para Entrar na Conta
                            </button>
                        </div>
                    ) : (
                        /* Demo Login Quick Options */
                        <div className="mt-6 pt-5 border-t border-slate-100">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
                                Acesso Rápido para Demonstração
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    type="button"
                                    onClick={loginAsAdmin}
                                    disabled={loading}
                                    className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                                        <span>Perfil Administrador (ADM)</span>
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-normal">marianasianop@gmail.com</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={loginAsUser}
                                    disabled={loading}
                                    className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-purple-600" />
                                        <span>Perfil Leitor Padrão</span>
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-normal">leitor@maristory.com</span>
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};