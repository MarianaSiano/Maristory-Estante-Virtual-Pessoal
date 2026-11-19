import React, { useState } from 'react';
import { User, LibraryBackup } from '../types';
import { api } from '../services/api';
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
    Sparkles,
    Target,
    Download,
    Database
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
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
    user,
    isOpen,
    onClose,
    onUpdateUser,
}) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'backup'>('profile');
    const [name, setName] = useState(user.name || 'Proprietária');
    const [email, setEmail] = useState(user.email || '')
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || PRESET_AVATARS[0]);
    const [readingGoal, setReadingGoal] = useState<number>(user.readingGoal || 24);

    // Password fields
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    //Eye toggles
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    // Status feedback
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    if(!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return;

        if(file.size > 5 * 1024 * 1024) {
            setError('A imagem selecionada deve ter até 5MB.');
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
                setError('Digite sua senha atual para autorizar a alteração');
                return;
            }
            if(newPassword.length < 8) {
                setError('A nova senha deve ter, no mínimo, 8 caracteres');
                return;
            }
            if(newPassword !== confirmPassword) {
                setError('A confirmação da nova senha não coincide.');
                return;
            }
        }

        setLoading(true);
        try {
            const payload: any = {
                name: name.trim(),
                email: email.trim(),
                avatarUrl,
                readingGoal: Number(readingGoal),
            };

            if(activeTab === 'password') {
                payload.currentPassword = currentPassword;
                payload.newPassword = newPassword;
            }

            const updated = await api.updateProfile(payload);
            onUpdateUser(updated);
            setSuccess('Dados da proprietária salvos com sucesso.');

            if(activeTab === 'password') {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }

            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch(err: any) {
            setError(err.message || 'Erro ao salvar alterações.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadBackup = async () => {
        try {
            const backup = await api.getBackup();
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json ' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `maristory-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setSuccess('Backup da biblioteca particular exportado com sucesso!');
        } catch(err: any) {
            setError('Erro ao gerar backup da biblioteca');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-6">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-900 via-[#3A0071] to-slate-900 text-white px-6 py-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold">Ajustes da Proprietária</h2>
                        <p className="text-xs text-purple-200">
                            Gerencie seus dados pessoais, meta anual e segurança
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3 text-xs font-bold">
                    <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'profile'
                                ? 'border-purple-600 text-purple-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>Perfil & Metas</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('password')}
                        className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'password'
                                ? 'border-purple-600 text-purple-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Segurança & Senha</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('backup')}
                        className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'backup'
                                ? 'border-purple-600 text-purple-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <Database className="w-3.5 h-3.5" />
                        <span>Backup do Acervo</span>
                    </button>
                </div>

                {/* Status Alerts */}
                <div className="px-6 pt-4 space-y-2">
                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}
                </div>

                {/* Content Body */}
                {activeTab !== 'backup' ? (
                    <form onSubmit={handleSaveProfile} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        {activeTab === 'profile' ? (
                            <>
                                {/* Avatar Row */}
                                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="relative shrink-0">
                                        <img
                                            src={avatarUrl}
                                            alt="Avatar"
                                            className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-500"
                                        />
                                        <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-1 rounded-full cursor-pointer shadow-xs hover:bg-purple-700">
                                            <Camera className="w-3 h-3" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    <div className="space-y-1.5 flex-1">
                                        <span className="text-xs font-bold text-slate-700 block">
                                            Foto da Proprietária
                                        </span>
                                        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                                            {PRESET_AVATARS.map((p, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setAvatarUrl(p)}
                                                    className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform shrink-0 ${avatarUrl === p ? 'border-purple-600 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                                                        }`}
                                                >
                                                    <img src={p} alt="Preset" className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Nome Completo
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        E-mail
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>

                                {/* Reading Goal */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                                        <Target className="w-3.5 h-3.5 text-purple-600" />
                                        <span>Meta Anual de Leitura (Número de Livros)</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="500"
                                        value={readingGoal}
                                        onChange={(e) => setReadingGoal(Number(e.target.value))}
                                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Usado para calcular seu progresso nas estatísticas da estante.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Current Password */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Senha Atual *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPass ? 'text' : 'password'}
                                            required
                                            placeholder="Sua senha atual"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full pr-10 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                        >
                                            {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Nova Senha *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPass ? 'text' : 'password'}
                                            required
                                            minLength={8}
                                            placeholder="Mínimo 8 caracteres"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pr-10 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPass(!showNewPass)}
                                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                        >
                                            {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Confirmar Nova Senha *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPass ? 'text' : 'password'}
                                            required
                                            minLength={8}
                                            placeholder="Repita a nova senha"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pr-10 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                        >
                                            {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Actions */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                            >
                                {loading ? 'Salvando...' : 'Salvar Ajustes'}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Backup Tab */
                    <div className="p-6 space-y-4">
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 space-y-2">
                            <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                                <Database className="w-4 h-4 text-purple-600" />
                                <span>Exportar Acervo Particular</span>
                            </div>
                            <p className="text-xs text-purple-950 leading-relaxed">
                                Faça o download de um arquivo JSON completo contendo todos os livros cadastrados, páginas lidas, avaliações, resenhas e datas da sua biblioteca particular.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleDownloadBackup}
                            className="w-full py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs"
                        >
                            <Download className="w-4 h-4" />
                            <span>Baixar Arquivo de Backup (.JSON)</span>
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}