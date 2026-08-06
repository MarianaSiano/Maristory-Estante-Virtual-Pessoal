import React, { useEffect, useState } from 'react';
import { ReadingStats, User } from '../types.js';
import { api } from '../services/api.ts';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatsViewProps {
    user: User;
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const StatsView: React.FC<StatsViewProps> = ({ user }) => {
    const [stats, setStats] = useState<ReadingStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getUserStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);
}