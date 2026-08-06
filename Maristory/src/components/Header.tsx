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
}) => {}