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
}