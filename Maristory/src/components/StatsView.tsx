import React from 'react';
import { ReadingStats, Book } from '../types';
import { BookCover } from './BookCover';
import {
    BarChart3,
    BookOpen,
    Calendar,
    Award,
    Layers,
    Star,
    CheckCircle2,
    Clock,
    TrendingUp,
    Bookmark,
    Sparkles,
    PackageCheck,
    Target
} from 'lucide-react';

interface StatsViewProps {
    stats: ReadingStats | null;
    books: Book[];
}

export const StatsView: React.FC<StatsViewProps> = ({ stats, books }) => {
    if(!stats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-semibold">Carregando estatísticas particulares...</p>
                </div>
            </div>
        );
    }

    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const maxMonthly = Math.max(...stats.monthlyReadCounts, 1);
    const goalPercent = Math.min(100, Math.round((stats.booksRead / (stats.readingGoal || 1)) * 100));

    return (
        <div className="space-y-6 animate-fade-in">

            {/* Header Banner */}
            <div className="bg-gradient-to-r from-purple-900 via-[#3A0071] to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md border border-purple-900/40 relative overflow-hidden">
                <div className="relative z-10 space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-400/30">
                        <Target className="w-3.5 h-3.5" />
                        <span>Métricas & Hábitos Pessoais da Proprietária</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Estatísticas da Minha Biblioteca Particular
                    </h1>

                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                        Acompanhe o seu ritmo de leitura, gêneros favoritos e progresso de metas com total privacidade.
                    </p>
                </div>
            </div>

            {/* Top Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Livros Lidos */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-semibold">Livros Concluídos</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{stats.booksRead}</div>
                    <p className="text-[11px] text-slate-500">
                        De um total de {stats.totalInShelf} livros no seu acervo
                    </p>
                </div>

                {/* Páginas Lidas */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-semibold">Páginas Lidas</span>
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            <BookOpen className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{stats.pagesRead.toLocaleString('pt-BR')}</div>
                    <p className="text-[11px] text-slate-500">
                        Média de ~{stats.booksRead > 0 ? Math.round(stats.pagesRead / stats.booksRead) : 0} páginas por livro
                    </p>
                </div>

                {/* Média de Avaliações */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-semibold">Média das Suas Avaliações</span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                        <span>{stats.averageRating || 0}</span>
                        <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                        Baseado nas notas atribuídas pela proprietária
                    </p>
                </div>

                {/* Meta de Leitura */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-semibold">Meta Anual</span>
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Target className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                        <span>{stats.booksRead}</span>
                        <span className="text-xs font-semibold text-slate-400">/ {stats.readingGoal} livros</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-purple-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${goalPercent}%` }}
                        />
                    </div>
                </div>

            </div>

            {/* Grid: Gráfico Mensal e Distribuição por Gênero */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Gráfico de Barras: Leituras por Mês */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-purple-600" />
                                <span>Ritmo de Leituras Concluídas por Mês</span>
                            </h3>
                            <p className="text-xs text-slate-500">
                                Quantidade de livros finalizados ao longo do ano
                            </p>
                        </div>
                        <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg">
                            {new Date().getFullYear()}
                        </span>
                    </div>

                    {/* Bar Chart Representation */}
                    <div className="pt-6 pb-2">
                        <div className="h-44 flex items-end justify-between gap-1.5 sm:gap-2 px-2 border-b border-slate-100">
                            {stats.monthlyReadCounts.map((count, idx) => {
                                const heightPercent = maxMonthly > 0 ? Math.round((count / maxMonthly) * 100) : 0;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                                        <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {count}
                                        </span>
                                        <div className="w-full max-w-[28px] bg-slate-100 rounded-t-md h-full flex items-end overflow-hidden">
                                            <div
                                                className="w-full bg-purple-600 group-hover:bg-purple-700 transition-all rounded-t-md"
                                                style={{ height: `${count > 0 ? Math.max(heightPercent, 12) : 0}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-semibold text-slate-600">
                                            {months[idx]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Gêneros no Acervo Particular */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="space-y-0.5">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-purple-600" />
                            <span>Gêneros Literários no Seu Acervo</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                            Distribuição temática dos livros da sua biblioteca
                        </p>
                    </div>

                    <div className="space-y-3 pt-2">
                        {stats.topGenres.length === 0 ? (
                            <p className="text-xs text-slate-400 py-8 text-center">
                                Adicione livros à sua estante para visualizar a distribuição de gêneros.
                            </p>
                        ) : (
                            stats.topGenres.map((item, idx) => {
                                const maxGenreCount = Math.max(...stats.topGenres.map((g) => g.count), 1);
                                const percent = Math.round((item.count / maxGenreCount) * 100);
                                return (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs font-semibold">
                                            <span className="text-slate-800">{item.genre}</span>
                                            <span className="text-slate-500">{item.count} {item.count === 1 ? 'livro' : 'livros'}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

            </div>

            {/* Livros em Destaque do Acervo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Livro Mais Extenso */}
                {stats.longestBook && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                                Obra Mais Longa do Acervo
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 pt-1 line-clamp-1">
                                {stats.longestBook.title}
                            </h4>
                            <p className="text-xs text-slate-500">{stats.longestBook.author}</p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <BookCover
                                coverUrl={stats.longestBook.coverUrl}
                                title={stats.longestBook.title}
                                compact
                                className="w-12 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                            <div className="text-xs">
                                <span className="text-lg font-black text-slate-900">{stats.longestBook.pages}</span>
                                <span className="text-slate-500 ml-1">páginas</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Livro Mais Curto */}
                {stats.shortestBook && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                                Obra Mais Curta do Acervo
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 pt-1 line-clamp-1">
                                {stats.shortestBook.title}
                            </h4>
                            <p className="text-xs text-slate-500">{stats.shortestBook.author}</p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <BookCover
                                coverUrl={stats.shortestBook.coverUrl}
                                title={stats.shortestBook.title}
                                compact
                                className="w-12 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                            <div className="text-xs">
                                <span className="text-lg font-black text-slate-900">{stats.shortestBook.pages}</span>
                                <span className="text-slate-500 ml-1">páginas</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Melhor Avaliado pela Proprietária */}
                {stats.highestRatedBook && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                                Sua Melhor Avaliação
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 pt-1 line-clamp-1">
                                {stats.highestRatedBook.title}
                            </h4>
                            <p className="text-xs text-slate-500">{stats.highestRatedBook.author}</p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <BookCover
                                coverUrl={stats.highestRatedBook.coverUrl}
                                title={stats.highestRatedBook.title}
                                compact
                                className="w-12 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        className={`w-4 h-4 ${s <= (stats.highestRatedBook?.rating || 0)
                                                ? 'text-amber-400 fill-amber-400'
                                                : 'text-slate-200'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>

        </div>
    );
};