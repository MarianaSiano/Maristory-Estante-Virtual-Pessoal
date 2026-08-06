import React, { useState } from 'react';
import { User } from '../types.js';
import { api } from '../services/api.ts';
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
}