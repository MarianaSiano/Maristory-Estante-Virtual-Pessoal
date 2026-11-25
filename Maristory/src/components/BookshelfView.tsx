import React, { useState } from 'react';
import { Book, ReadingStatus, OwnershipStatus, ReadingDayEntry } from '../types';
import { BookCover } from './BookCover';
import { WeeklyReadingTracker } from './WeeklyReadingTracker';
import { MonthlyReadingTracker } from './MonthlyReadingTracker';
import {
    Search,
    Filter,
    BookOpen,
    Star,
    Heart,
    Plus,
    Sparkles,
    ArrowUpDown,
    LayoutGrid,
    List,
    CheckCircle2,
    Clock,
    Bookmark,
    Package,
    Layers,
    Edit3,
    Trash2,
    Lock
} from 'lucide-react';

interface BookshelfViewProps {
    books: Book[];
    readingGoal?: number;
    readingDays?: Record<string, ReadingDayEntry>;
    onOpenBookDetail: (book: Book) => void;
    onOpenAddBook: () => void;
    onEditBook: (book: Book) => void;
    onDeleteBook: (bookId: string) => void;
    onQuickToggleFavorite: (book: Book) => void;
    onQuickAddPages: (book: Book, pagesToAdd: number) => void;
}

export const BookshelfView: React.FC<BookshelfViewProps> = ({
    books,
    readingGoal = 24,
    readingDays = {},
    onOpenBookDetail,
    onOpenAddBook,
    onEditBook,
    onDeleteBook,
    onQuickToggleFavorite,
    onQuickAddPages,
}) => {
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [filterOwnership, setFilterOwnership] = useState<string>('ALL');
    const [selectedGenre, setSelectedGenre] = useState<string>('Todos');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'updatedAt' | 'title' | 'author' | 'rating' | 'pages' | 'progress'>('updatedAt');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Unique genres in the collection
    const genres = ['Todos', ...Array.from(new Set(books.map((b) => b.genre))).filter(Boolean)];

    // Filtering
    const filteredBooks = books.filter((book) => {
        // Search query
        const q = search.toLowerCase().trim();
        const matchesSearch =
            !q ||
            book.title.toLowerCase().includes(q) ||
            book.author.toLowerCase().includes(q) ||
            book.publisher.toLowerCase().includes(q) ||
            book.genre.toLowerCase().includes(q) ||
            book.isbn.includes(q);

        if(!matchesSearch) return false;

        // Status Filter
        if(filterStatus === 'FAVORITES') {
            if(!book.isFavorite) return false;
        } else if(filterStatus === 'FISICO') {
            if(book.ownershipStatus !== 'TENHO') return false;
        } else if(filterStatus !== 'ALL') {
            if(book.readingStatus !== filterStatus) return false;
        }

        // Ownership Filter
        if(filterOwnership === 'TENHO' && book.ownershipStatus !== 'TENHO') return false;
        if(filterOwnership === 'NAO_TENHO' && book.ownershipStatus !== 'NAO_TENHO') return false;

        // Genre Filter
        if(selectedGenre !== 'Todos' && book.genre !== selectedGenre) return false;

        return true;
    });

    // Sorting
    const sortedBooks = [...filteredBooks].sort((a, b) => {
        if(sortBy === 'title') {
            return a.title.localeCompare(b.title);
        } else if(sortBy === 'author') {
            return a.author.localeCompare(b.author);
        } else if(sortBy === 'rating') {
            return (b.rating || 0) - (a.rating || 0);
        } else if(sortBy === 'pages') {
            return b.pages - a.pages;
        } else if(sortBy === 'progress') {
            const progA = a.pages > 0 ? (a.currentPage || 0) / a.pages : 0;
            const progB = b.pages > 0 ? (b.currentPage || 0) / b.pages : 0;
            return progB - progA;
        } else {
            return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
        }
    });

    // Counts for pills & tabs
    const counts = {
        all: books.length,
        lendo: books.filter((b) => b.readingStatus === 'LENDO').length,
        lido: books.filter((b) => b.readingStatus === 'LIDO').length,
        queroLer: books.filter((b) => b.readingStatus === 'QUERO_LER').length,
        abandonou: books.filter((b) => b.readingStatus === 'ABANDONOU').length,
        tenho: books.filter((b) => b.ownershipStatus === 'TENHO').length,
        favorites: books.filter((b) => b.isFavorite).length,
    };

    const pagesRead = books.reduce((acc, b) => {
        if(b.readingStatus === 'LIDO') return acc + b.pages;
        if(b.readingStatus === 'LENDO') return acc + Math.min(b.currentPage, b.pages);
        return acc;
    }, 0);

    const goalPercent = Math.min(100, Math.round((counts.lido / (readingGoal || 1)) * 100));

    const getStatusBadge = (status: ReadingStatus) => {
        switch (status) {
            case 'LENDO':
                return (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 rounded-md border border-purple-200">
                        📖 Lendo
                    </span>
                );
            case 'LIDO':
                return (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
                        ✅ Lido
                    </span>
                );
            case 'QUERO_LER':
                return (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                        ⏳ Quero Ler
                    </span>
                );
            case 'ABANDONOU':
                return (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-md border border-rose-200">
                        🛑 Abandonado
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">

            {/* Banner Principal da Biblioteca Particular */}
            <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md border border-purple-900/40 relative overflow-hidden">
                {/* Decorative subtle background accents */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-400/30">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Biblioteca Particular • Uso Exclusivo da Proprietária</span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Minha Estante & Acervo Pessoal
                        </h1>

                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                            Espaço íntimo e privado para catalogação e controle de suas leituras. Sem redes sociais, sem trocas e com total privacidade para suas anotações e reflexões.
                        </p>

                        {/* Metric Pills */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                            <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 font-semibold flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-purple-300" />
                                <span>{counts.all} Livros no Acervo</span>
                            </div>

                            <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 font-semibold flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5 text-emerald-300" />
                                <span>{counts.tenho} Físicos</span>
                            </div>

                            <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-300" />
                                <span>{counts.lido} Lidos</span>
                            </div>

                            <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 font-semibold flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>{pagesRead.toLocaleString('pt-BR')} Páginas Lidas</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action Button */}
                    <div className="shrink-0 flex flex-col items-start lg:items-end gap-3">
                        <button
                            onClick={onOpenAddBook}
                            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2 text-xs sm:text-sm"
                        >
                            <Plus className="w-4 h-4 stroke-[3]" />
                            <span>Adicionar Livro ao Acervo</span>
                        </button>

                        {/* Reading Goal Progress Pill */}
                        <div className="w-full sm:w-60 bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs space-y-1.5">
                            <div className="flex items-center justify-between font-semibold text-slate-300 text-[11px]">
                                <span>Meta Anual ({new Date().getFullYear()})</span>
                                <span className="text-purple-300 font-bold">{counts.lido} / {readingGoal} livros</span>
                            </div>
                            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${goalPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controle Semanal: Dias da Semana */}
            <WeeklyReadingTracker readingDays={readingDays} />

            {/* Controle Mensal: Hábito de Leitura Mensal */}
            <MonthlyReadingTracker readingDays={readingDays} />

            {/* Control Bar: Tabs, Search, Filters and Layout Selector */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 space-y-4">

                {/* Status Filter Tabs */}
                <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100">
                    {[
                        { id: 'ALL', label: 'Todos', count: counts.all },
                        { id: 'LENDO', label: 'Lendo', count: counts.lendo },
                        { id: 'LIDO', label: 'Lidos', count: counts.lido },
                        { id: 'QUERO_LER', label: 'Quero Ler', count: counts.queroLer },
                        { id: 'ABANDONOU', label: 'Abandonados', count: counts.abandonou },
                        { id: 'FAVORITES', label: 'Favoritos', count: counts.favorites, isFav: true },
                        { id: 'FISICO', label: 'Exemplares Físicos', count: counts.tenho },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterStatus(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${filterStatus === tab.id
                                    ? 'bg-purple-600 text-white shadow-xs font-bold'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {tab.isFav && <Heart className={`w-3.5 h-3.5 ${filterStatus === tab.id ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'}`} />}
                            <span>{tab.label}</span>
                            <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${filterStatus === tab.id ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Second Row: Search, Genre Filter, Sort, View Toggle */}
                <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">

                    {/* Search Input */}
                    <div className="relative w-full lg:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por título, autor, editora, gênero ou ISBN..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">

                        {/* Genre Filter */}
                        <select
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            {genres.map((g) => (
                                <option key={g} value={g}>
                                    {g === 'Todos' ? 'Todos os Gêneros' : g}
                                </option>
                            ))}
                        </select>

                        {/* Sort Selector */}
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-transparent text-xs font-semibold text-slate-700 outline-none py-1 cursor-pointer"
                            >
                                <option value="updatedAt">Mais Recentes</option>
                                <option value="title">Título (A-Z)</option>
                                <option value="author">Autor (A-Z)</option>
                                <option value="rating">Melhor Avaliados</option>
                                <option value="pages">Mais Páginas</option>
                                <option value="progress">Progresso de Leitura</option>
                            </select>
                        </div>

                        {/* View Mode (Grid vs List) */}
                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                title="Visualização em Grade"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                title="Visualização em Lista Compacta"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                    </div>

                </div>

            </div>

            {/* Book Presentation: Grid vs List */}
            {sortedBooks.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl mx-auto flex items-center justify-center">
                        <BookOpen className="w-7 h-7" />
                    </div>
                    <div className="space-y-1 max-w-md mx-auto">
                        <h3 className="text-base font-bold text-slate-800">
                            {search || filterStatus !== 'ALL' || selectedGenre !== 'Todos'
                                ? 'Nenhum livro encontrado com os filtros atuais'
                                : 'Sua biblioteca particular ainda não tem livros'}
                        </h3>
                        <p className="text-xs text-slate-500">
                            {search || filterStatus !== 'ALL' || selectedGenre !== 'Todos'
                                ? 'Tente limpar a busca ou selecionar outra categoria.'
                                : 'Cadastre o primeiro título da sua coleção particular para começar a acompanhar suas leituras.'}
                        </p>
                    </div>
                    <button
                        onClick={onOpenAddBook}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-all inline-flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Livro Agora</span>
                    </button>
                </div>
            ) : viewMode === 'grid' ? (

                /* GRID VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {sortedBooks.map((book) => {
                        const progress = book.pages > 0 ? Math.min(100, Math.round(((book.currentPage || 0) / book.pages) * 100)) : 0;
                        return (
                            <div
                                key={book.id}
                                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between"
                            >
                                {/* Book Card Top Image & Badges */}
                                <div className="relative aspect-3/4 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onOpenBookDetail(book)}>
                                    <BookCover
                                        coverUrl={book.coverUrl}
                                        title={book.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />

                                    {/* Gradient Overlay for badges legibility */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

                                    {/* Top Badges */}
                                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10">
                                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-white/90 text-slate-800 backdrop-blur-xs shadow-2xs">
                                            {book.genre || 'Livro'}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onQuickToggleFavorite(book);
                                            }}
                                            className={`p-1.5 rounded-full backdrop-blur-md transition-transform active:scale-90 shadow-2xs ${book.isFavorite
                                                    ? 'bg-rose-500 text-white'
                                                    : 'bg-white/80 text-slate-500 hover:text-rose-500'
                                                }`}
                                            title={book.isFavorite ? 'Favoritado' : 'Marcar favorito'}
                                        >
                                            <Heart className={`w-3.5 h-3.5 ${book.isFavorite ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>

                                    {/* Bottom Image Badges: Status & Ownership */}
                                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] z-10">
                                        <div>{getStatusBadge(book.readingStatus)}</div>

                                        <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] backdrop-blur-xs ${book.ownershipStatus === 'TENHO'
                                                ? 'bg-emerald-600/90 text-white'
                                                : 'bg-amber-600/90 text-white'
                                            }`}>
                                            {book.ownershipStatus === 'TENHO' ? '📦 Físico' : '🔖 Desejo'}
                                        </span>
                                    </div>
                                </div>

                                {/* Book Info Body */}
                                <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                                    <div className="space-y-1">
                                        <h3
                                            onClick={() => onOpenBookDetail(book)}
                                            className="text-sm font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-purple-700 cursor-pointer transition-colors"
                                            title={book.title}
                                        >
                                            {book.title}
                                        </h3>
                                        <p className="text-xs text-purple-900 font-medium line-clamp-1">
                                            {book.author}
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            {book.pages} páginas {book.publicationYear ? `• ${book.publicationYear}` : ''}
                                        </p>
                                    </div>

                                    {/* Star Rating & Progress Bar */}
                                    <div className="space-y-2 pt-1 border-t border-slate-100">
                                        {/* Stars */}
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        className={`w-3.5 h-3.5 ${s <= (book.rating || 0)
                                                                ? 'text-amber-400 fill-amber-400'
                                                                : 'text-slate-200'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            {book.rating > 0 ? (
                                                <span className="text-[11px] font-bold text-slate-600">{book.rating}/5</span>
                                            ) : (
                                                <span className="text-[10px] text-slate-400">Sem nota</span>
                                            )}
                                        </div>

                                        {/* Progress Bar (If Lendo) */}
                                        {book.readingStatus === 'LENDO' && (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-[10px] font-bold text-purple-900">
                                                    <span>{book.currentPage || 0} / {book.pages} pág</span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-purple-600 h-full rounded-full transition-all duration-300"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                {/* Quick +10 button */}
                                                <div className="flex items-center justify-end pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onQuickAddPages(book, 10);
                                                        }}
                                                        className="text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded border border-purple-200 transition-colors"
                                                    >
                                                        +10 pág
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions Footer */}
                                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => onOpenBookDetail(book)}
                                            className="text-xs font-bold text-purple-700 hover:text-purple-900"
                                        >
                                            Ver Detalhes
                                        </button>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditBook(book);
                                                }}
                                                className="p-1 rounded-md text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                                                title="Editar dados do livro"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteBook(book.id);
                                                }}
                                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                title="Remover da biblioteca"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (

                /* LIST VIEW */
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
                    {sortedBooks.map((book) => {
                        const progress = book.pages > 0 ? Math.min(100, Math.round(((book.currentPage || 0) / book.pages) * 100)) : 0;
                        return (
                            <div
                                key={book.id}
                                onClick={() => onOpenBookDetail(book)}
                                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-purple-50/40 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-3.5">
                                    <BookCover
                                        coverUrl={book.coverUrl}
                                        title={book.title}
                                        compact
                                        className="w-12 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
                                    />
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-slate-900 text-sm">{book.title}</span>
                                            {book.isFavorite && <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />}
                                        </div>
                                        <p className="text-xs text-purple-900 font-semibold">{book.author}</p>
                                        <p className="text-[11px] text-slate-400">
                                            {book.genre} • {book.publisher} • {book.pages} páginas
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end">
                                    {/* Status & Ownership */}
                                    <div className="flex flex-col items-start sm:items-end gap-1">
                                        <div>{getStatusBadge(book.readingStatus)}</div>
                                        <span className="text-[10px] text-slate-500 font-semibold">
                                            {book.ownershipStatus === 'TENHO' ? '📦 Exemplar Físico' : '🔖 Desejo'}
                                        </span>
                                    </div>

                                    {/* Rating or Progress */}
                                    <div className="text-right min-w-[90px]">
                                        {book.readingStatus === 'LENDO' ? (
                                            <span className="text-xs font-bold text-purple-800">
                                                {book.currentPage}/{book.pages} pág ({progress}%)
                                            </span>
                                        ) : book.rating > 0 ? (
                                            <div className="flex items-center justify-end gap-1 text-xs font-bold text-slate-700">
                                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                <span>{book.rating}/5</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400">—</span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            onClick={() => onEditBook(book)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-slate-100 transition-colors"
                                            title="Editar"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDeleteBook(book.id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
};