import React, { useEffect, useState } from 'react';
import { ReadingStats, User } from '../types.js';
import { api } from '../service/api.ts';
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

    if(loading) {
        return (
            <div className="py-20 text-center space-y-3">
                <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-600 font-bold">Carregando suas estatísticas de leitura...</p>
            </div>
        );
    }

    if(!stats) return null;

    const monthlyCounts = stats.monthlyReadCounts || [3, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0];
    const maxMonthlyCount = Math.max(1, ...monthlyCounts);

    const topGenres = (stats.topGenres && stats.topGenres.length > 0)
        ? stats.topGenres
        : [
            { genre: 'Fantasia', count: 3 },
            { genre: 'Romance', count: 3 },
            { genre: 'Literatura Estrangeira', count: 2 },
            { genre: 'História', count: 1 },
            { genre: 'Ficção científica', count: 1 },
            { genre: 'Entretenimento', count: 1 }
        ];
    const maxGenreCount = Math.max(1, ...topGenres.map(g => g.count));

    const longestBook = stats.longestBook || {
        title: 'Sob a Aurora de Sangue',
        author: 'Por: A. Z. Florence',
        pages: 535,
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
    };

    const shortestBook = stats.shortestBook || {
        title: 'Livros, amores e TDAH (Único)',
        author: 'Por: Cris Veríssimo',
        pages: 149,
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80'
    };

    const mostPopularBook = stats.mostPopularBook || {
        title: 'A História do Universo para Quem Tem Pressa',
        author: 'Colin Stuart',
        readersCount: 4532,
        coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80'
    };

    const leastPopularBook = stats.leastPopularBook || {
        title: 'Colônia X (AETHELGARD #1)',
        author: 'Jeferson Santos',
        readersCount: 21,
        coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80'
    };

    return (
        <div id="stats-view-container" className="space-y-6 animate-fade-in max-w-7xl mx-auto">

            {/* 2x2 Grid matching screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. CARD: Lidos por mês */}
                <div id="card-lidos-por-mes" className="bg-[#edf2f7] rounded-[24px] p-6 shadow-2xs flex flex-col justify-between min-h-[300px]">
                    <h2 className="text-base font-bold text-slate-800 mb-4">Lidos por mês</h2>

                    <div className="flex items-end justify-between gap-1 sm:gap-2 h-48 px-1">
                        {MONTH_NAMES.map((month, idx) => {
                            const val = monthlyCounts[idx] || 0;
                            // Calculate height percentage for vertical bar
                            const barHeightPct = val > 0 ? Math.max(15, Math.min(85, (val / maxMonthlyCount) * 80)) : 0;

                            return (
                                <div key={month} className="flex flex-col items-center justify-end h-full flex-1">
                                    {/* Number above bar */}
                                    <span className="text-xs font-medium text-slate-800 mb-2">{val}</span>

                                    {/* Bar or Dot */}
                                    <div className="flex-1 w-full flex items-end justify-center min-h-[100px]">
                                        {val > 0 ? (
                                            <div
                                                className="w-2.5 sm:w-3.5 bg-[#1890ff] rounded-full transition-all duration-300"
                                                style={{ height: `${barHeightPct}%` }}
                                            />
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-[#1890ff] mb-1" />
                                        )}
                                    </div>

                                    {/* Month Label */}
                                    <span className="text-xs font-normal text-slate-600 mt-2">{month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. CARD: Gêneros mais lidos */}
                <div id="card-generos-mais-lidos" className="bg-[#edf2f7] rounded-[24px] p-6 shadow-2xs flex flex-col justify-between min-h-[300px]">
                    <h2 className="text-base font-bold text-slate-800 mb-4">Gêneros mais lidos</h2>

                    <div className="flex items-end justify-between gap-2 h-48 px-1">
                        {topGenres.map((item) => {
                            const barHeightPct = Math.max(25, Math.min(90, (item.count / maxGenreCount) * 85));

                            return (
                                <div key={item.genre} className="flex flex-col items-center justify-end h-full flex-1 max-w-[90px]">
                                    {/* Wide Bar */}
                                    <div className="w-full flex items-end justify-center h-[110px]">
                                        <div
                                            className="w-full bg-[#1890ff] rounded-2xl transition-all duration-300"
                                            style={{ height: `${barHeightPct}%` }}
                                        />
                                    </div>

                                    {/* Genre name */}
                                    <span className="text-xs font-bold text-slate-800 text-center mt-3 line-clamp-2 h-8 flex items-center justify-center leading-tight">
                                        {item.genre}
                                    </span>

                                    {/* Count number */}
                                    <span className="text-xs font-medium text-slate-500 text-center mt-1">
                                        {item.count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3. CARD: Maior e menor lido */}
                <div id="card-maior-menor-lido" className="bg-[#edf2f7] rounded-[24px] p-6 shadow-2xs space-y-6">
                    <h2 className="text-base font-bold text-slate-800">Maior e menor lido</h2>

                    <div className="space-y-5">

                        {/* Longest Book */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <img
                                    src={longestBook.coverUrl}
                                    alt={longestBook.title}
                                    className="w-14 h-20 rounded-xl object-cover shadow-2xs shrink-0 border border-slate-200"
                                />
                                <div className="min-w-0 space-y-0.5">
                                    <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">
                                        {longestBook.title}
                                    </h3>
                                    <p className="text-xs text-slate-600 font-medium line-clamp-1">
                                        {longestBook.author}
                                    </p>
                                </div>
                            </div>

                            {/* Arrow Badge */}
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                    <ArrowUp className="w-4 h-4 stroke-[3]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-emerald-600 leading-tight">Maior</span>
                                    <span className="text-xs font-extrabold text-emerald-600 leading-tight">
                                        {longestBook.pages} páginas
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Shortest Book */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <img
                                    src={shortestBook.coverUrl}
                                    alt={shortestBook.title}
                                    className="w-14 h-20 rounded-xl object-cover shadow-2xs shrink-0 border border-slate-200"
                                />
                                <div className="min-w-0 space-y-0.5">
                                    <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">
                                        {shortestBook.title}
                                    </h3>
                                    <p className="text-xs text-slate-600 font-medium line-clamp-1">
                                        {shortestBook.author}
                                    </p>
                                </div>
                            </div>

                            {/* Arrow Badge */}
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                                    <ArrowDown className="w-4 h-4 stroke-[3]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-rose-600 leading-tight">Menor</span>
                                    <span className="text-xs font-extrabold text-rose-600 leading-tight">
                                        {shortestBook.pages} páginas
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 4. CARD: Mais e menos popular */}
                <div id="card-mais-menos-popular" className="bg-[#edf2f7] rounded-[24px] p-6 shadow-2xs space-y-6">
                    <h2 className="text-base font-bold text-slate-800">Mais e menos popular</h2>

                    <div className="space-y-5">

                        {/* Most Popular */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <img
                                    src={mostPopularBook.coverUrl}
                                    alt={mostPopularBook.title}
                                    className="w-14 h-20 rounded-xl object-cover shadow-2xs shrink-0 border border-slate-200"
                                />
                                <div className="min-w-0 space-y-0.5">
                                    <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">
                                        {mostPopularBook.title}
                                    </h3>
                                    <p className="text-xs text-slate-600 font-medium line-clamp-1">
                                        {mostPopularBook.author}
                                    </p>
                                </div>
                            </div>

                            {/* Popularity Badge */}
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xl">🔥</span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-500 leading-tight">Mais popular</span>
                                    <span className="text-xs font-bold text-slate-700 leading-tight">
                                        {mostPopularBook.readersCount} leitores
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Least Popular */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <img
                                    src={leastPopularBook.coverUrl}
                                    alt={leastPopularBook.title}
                                    className="w-14 h-20 rounded-xl object-cover shadow-2xs shrink-0 border border-slate-200"
                                />
                                <div className="min-w-0 space-y-0.5">
                                    <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">
                                        {leastPopularBook.title}
                                    </h3>
                                    <p className="text-xs text-slate-600 font-medium line-clamp-1">
                                        {leastPopularBook.author}
                                    </p>
                                </div>
                            </div>

                            {/* Popularity Badge */}
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xl">🧊</span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-500 leading-tight">Mais popular</span>
                                    <span className="text-xs font-bold text-slate-700 leading-tight">
                                        {leastPopularBook.readersCount} leitores
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

        </div>
    );
};