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
}