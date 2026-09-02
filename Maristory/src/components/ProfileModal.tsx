import React, { useState } from 'react';
import { User } from '../types.js';
import { api } from '../service/api.ts';
import {
    X,
    User as UserIcon,
    Mail,
    Lock,
    Upload,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
    Camera,
    ShieldCheck,
    Sparkles
} from 'lucide-react';

interface ProfileModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onUpdateUser: (updatedUser: User) => void;
}

const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=MaristoryReader'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
    user,
    isOpen,
    onClose,
    onUpdateUser
}) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
    const [name, setName] = useState(user.name || '');
    const [email, setEmail] = useState(user.email || '');
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');

    // Password fields
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Eye toggles for passwords
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    // Status feedback
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    if(!isOpen) 
        return null;

    // Handle local image file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) 
            return;

        if(file.size > 5 * 1024 * 1024) {
            setError('A imagem selecionada é muito grande. Escolha um arquivo de até 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarUrl(reader.result as string);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if(!name.trim()) {
            setError('O nome não pode ficar em branco.');
            return;
        }

        if(!email.trim()) {
            setError('O e-mail não pode ficar em branco.');
            return;
        }

        if(activeTab === 'password') {
            if(!currentPassword) {
                setError('Por favor, digite sua senha atual para alterar.');
                return;
            }
            if(!newPassword || newPassword.length < 8) {
                setError('A nova senha deve possuir no mínimo 8 caracteres.');
                return;
            }
            if(newPassword !== confirmPassword) {
                setError('A confirmação da nova senha não coincide com a nova senha digitada.');
                return;
            }
        }

        setLoading(true);

        try {
            const payload: {
                name?: string;
                email?: string;
                avatarUrl?: string;
                currentPassword?: string;
                newPassword?: string;
            } = {
                name: name.trim(),
                email: email.trim(),
                avatarUrl
            };

            if(activeTab === 'password' && newPassword) {
                payload.currentPassword = currentPassword;
                payload.newPassword = newPassword;
            }

            const updatedUser = await api.updateProfile(payload);
            onUpdateUser(updatedUser);

            setSuccess('Perfil atualizado com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Falha ao salvar as alterações do perfil.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="profile-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div id="profile-modal-container" className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">

                {/* Top Header */}
                <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30">
                            <UserIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold">Editar Perfil de Leitor</h2>
                            <p className="text-xs text-slate-300">Atualize suas informações pessoais, foto e segurança</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Tab Selector */}
                <div className="flex border-b border-slate-200 bg-slate-50">
                    <button
                        type="button"
                        onClick={() => { setActiveTab('profile'); setError(null); setSuccess(null); }}
                        className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'profile'
                                ? 'bg-white text-slate-900 border-b-2 border-purple-600 shadow-2xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <UserIcon className="w-4 h-4 text-purple-600" />
                        <span>Dados & Foto</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => { setActiveTab('password'); setError(null); setSuccess(null); }}
                        className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'password'
                                ? 'bg-white text-slate-900 border-b-2 border-purple-600 shadow-2xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <Lock className="w-4 h-4 text-purple-600" />
                        <span>Alterar Senha</span>
                    </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleSaveProfile} className="p-6 space-y-5">

                    {/* Feedback messages */}
                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                            <span>{success}</span>
                        </div>
                    )}

                    {activeTab === 'profile' ? (
                        <div className="space-y-5">

                            {/* Avatar Selector Section */}
                            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Foto de Perfil
                                </label>

                                <div className="flex items-center gap-4">
                                    <div className="relative group shrink-0">
                                        <img
                                            src={avatarUrl || user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                                            alt={name}
                                            className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-500 shadow-2xs"
                                        />
                                        <div className="absolute inset-0 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Camera className="w-5 h-5 text-white" />
                                        </div>
                                    </div>

                                    <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <label className="cursor-pointer px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors">
                                                <Upload className="w-3.5 h-3.5" />
                                                <span>Carregar do Computador</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>

                                        <input
                                            type="url"
                                            value={avatarUrl}
                                            onChange={(e) => setAvatarUrl(e.target.value)}
                                            placeholder="Ou cole o link de uma imagem da web..."
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                {/* Preset Avatars */}
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Ou selecione um avatar rápido:
                                    </p>
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                        {PRESET_AVATARS.map((url, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setAvatarUrl(url)}
                                                className={`w-9 h-9 rounded-full overflow-hidden border-2 shrink-0 transition-transform ${avatarUrl === url ? 'border-purple-600 scale-110 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                                                    }`}
                                            >
                                                <img src={url} alt="preset avatar" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Name input */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Nome Completo
                                </label>
                                <div className="relative">
                                    <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Seu nome completo"
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Email input */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    E-mail
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

                        </div>
                    ) : (
                        /* Password tab */
                        <div className="space-y-4">

                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>Para sua segurança, informe sua senha atual antes de cadastrar uma nova senha.</span>
                            </div>

                            {/* Current Password */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Senha Atual
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                    <input
                                        type={showCurrentPass ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onMouseDown={() => setShowCurrentPass(true)}
                                        onMouseUp={() => setShowCurrentPass(false)}
                                        onMouseLeave={() => setShowCurrentPass(false)}
                                        onTouchStart={() => setShowCurrentPass(true)}
                                        onTouchEnd={() => setShowCurrentPass(false)}
                                        onClick={() => setShowCurrentPass((prev) => !prev)}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-purple-600 focus:outline-none transition-colors p-0.5 rounded cursor-pointer"
                                        title="Segure ou clique para visualizar a senha"
                                    >
                                        {showCurrentPass ? (
                                            <EyeOff className="w-4 h-4 text-purple-600" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Nova Senha (Mínimo 8 caracteres)
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                    <input
                                        type={showNewPass ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onMouseDown={() => setShowNewPass(true)}
                                        onMouseUp={() => setShowNewPass(false)}
                                        onMouseLeave={() => setShowNewPass(false)}
                                        onTouchStart={() => setShowNewPass(true)}
                                        onTouchEnd={() => setShowNewPass(false)}
                                        onClick={() => setShowNewPass((prev) => !prev)}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-purple-600 focus:outline-none transition-colors p-0.5 rounded cursor-pointer"
                                        title="Segure ou clique para visualizar a senha"
                                    >
                                        {showNewPass ? (
                                            <EyeOff className="w-4 h-4 text-purple-600" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm New Password */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Confirmar Nova Senha
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                    <input
                                        type={showConfirmPass ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onMouseDown={() => setShowConfirmPass(true)}
                                        onMouseUp={() => setShowConfirmPass(false)}
                                        onMouseLeave={() => setShowConfirmPass(false)}
                                        onTouchStart={() => setShowConfirmPass(true)}
                                        onTouchEnd={() => setShowConfirmPass(false)}
                                        onClick={() => setShowConfirmPass((prev) => !prev)}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-purple-600 focus:outline-none transition-colors p-0.5 rounded cursor-pointer"
                                        title="Segure ou clique para visualizar a senha"
                                    >
                                        {showConfirmPass ? (
                                            <EyeOff className="w-4 h-4 text-purple-600" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                                        )}
                                    </button>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Salvar Alterações</span>
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};