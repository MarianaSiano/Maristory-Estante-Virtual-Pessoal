import React, { useState, useEffect } from 'react';
import { Book, OwnershipStatus, ReadingStatus } from '../types';
import {
    X,
    Star,
    Heart,
    BookOpen,
    Calendar,
    Trash2,
    CheckCircle2,
    Edit3,
    BookmarkCheck,
    PackageCheck,
    Sparkles,
    Layers,
    Lock
} from 'lucide-react';

interface BookDetailModalProps {
    book: Book | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (bookId: string, updates: Partial<Book>) => Promise<void>;
    onEditBookDetails?: (book: Book) => void;
    onRemove?: (bookId: string) => Promise<void>;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
    book,
    isOpen,
    onClose,
    onSave,
    onEditBookDetails,
    onRemove,
}) => {
    if (!isOpen || !book) return null;

    const [ownershipStatus, setOwnershipStatus] = useState<OwnershipStatus>(book.ownershipStatus || 'TENHO');
    const [readingStatus, setReadingStatus] = useState<ReadingStatus>(book.readingStatus || 'QUERO_LER');
    const [rating, setRating] = useState<number>(book.rating || 0);
    const [review, setReview] = useState<string>(book.review || '');
    const [currentPage, setCurrentPage] = useState<number>(book.currentPage || 0);
    const [startDate, setStartDate] = useState<string>(book.startDate || '');
    const [finishDate, setFinishDate] = useState<string>(book.finishDate || '');
    const [isFavorite, setIsFavorite] = useState<boolean>(book.isFavorite || false);

    const [saving, setSaving] = useState(false);
    const [removing, setRemoving] = useState(false);

    useEffect(() => {
        if (book) {
            setOwnershipStatus(book.ownershipStatus || 'TENHO');
            setReadingStatus(book.readingStatus || 'QUERO_LER');
            setRating(book.rating || 0);
            setReview(book.review || '');
            setCurrentPage(book.currentPage || 0);
            setStartDate(book.startDate || '');
            setFinishDate(book.finishDate || '');
            setIsFavorite(book.isFavorite || false);
        }
    }, [book]);

    const handleStatusChange = (status: ReadingStatus) => {
        setReadingStatus(status);
        if (status === 'LIDO') {
            setCurrentPage(book.pages);
            if (!finishDate) {
                setFinishDate(new Date().toISOString().split('T')[0]);
            }
        } else if (status === 'QUERO_LER') {
            setCurrentPage(0);
        }
    };

    const handleAddPages = (delta: number) => {
        const next = Math.min(book.pages, Math.max(0, currentPage + delta));
        setCurrentPage(next);
        if (next === book.pages && readingStatus !== 'LIDO') {
            setReadingStatus('LIDO');
            if (!finishDate) {
                setFinishDate(new Date().toISOString().split('T')[0])
            }
        } else if (next > 0 && readingStatus === 'QUERO_LER') {
            setReadingStatus('LENDO');
            if (!startDate) {
                setStartDate(new Date().toISOString().split('T')[0]);
            }
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(book.id, {
                ownershipStatus,
                readingStatus,
                rating,
                review,
                currentPage: Math.min(currentPage, book.pages),
                startDate: startDate || null,
                finishDate: finishDate || null,
                isFavorite,
            });
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async () => {
        if(!onRemove) return;
        if(confirm(`Deseja remover "${book.title}" da sua biblioteca particular?`)) {
            setRemoving(true);
            try {
                await onRemove(book.id);
                onClose();
            } catch(err) {
                console.error(err);
            } finally {
                setRemoving(false);
            }
        }
    };

    const progressPercent = book.pages > 0 ? Math.min(100, Math.round((currentPage / book.pages) * 100)) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-6">

                {/* Top Header */}
                <div className="bg-gradient-to-r from-purple-900 via-[#3A0071] to-slate-900 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-200">
                        <Lock className="w-3.5 h-3.5 text-purple-300" />
                        <span>Biblioteca Particular • Acervo Privado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {onEditBookDetails && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onEditBookDetails(book);
                                }}
                                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                                title="Editar dados da obra (título, autor, capa...)"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Editar Obra</span>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">

                    {/* Book Header Card */}
                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                        {/* Book Cover */}
                        <div className="relative shrink-0 w-28 sm:w-32 shadow-md rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                            <img
                                src={book.coverUrl}
                                alt={book.title}
                                className="w-full h-40 sm:h-44 object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setIsFavorite(!isFavorite)}
                                className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md shadow-xs transition-transform active:scale-90 ${isFavorite ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-500 hover:text-rose-500'
                                    }`}
                                title={isFavorite ? 'Remover dos favoritos' : 'Favoritar livro'}
                            >
                                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        {/* Bibliographic Info */}
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                                    {book.genre || 'Literatura'}
                                </span>
                                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${ownershipStatus === 'TENHO'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                    }`}>
                                    {ownershipStatus === 'TENHO' ? '📦 Exemplar no Acervo Físico' : '🔖 Lista de Desejos'}
                                </span>
                            </div>

                            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                                {book.title}
                            </h2>
                            <p className="text-sm font-semibold text-purple-900">
                                {book.author}
                            </p>

                            <div className="text-xs text-slate-500 space-y-0.5 pt-1">
                                <p><strong>Editora:</strong> {book.publisher} • {book.publicationYear}</p>
                                <p><strong>Extensão:</strong> {book.pages} páginas {book.isbn ? `• ISBN: ${book.isbn}` : ''}</p>
                            </div>

                            {book.synopsis && (
                                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed pt-1 italic">
                                    "{book.synopsis}"
                                </p>
                            )}
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Reading Status Selector */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Status da Leitura
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { id: 'LENDO', label: '📖 Lendo' },
                                { id: 'LIDO', label: '✅ Lido' },
                                { id: 'QUERO_LER', label: '⏳ Quero Ler' },
                                { id: 'ABANDONOU', label: '🛑 Abandonado' },
                            ].map((st) => (
                                <button
                                    key={st.id}
                                    type="button"
                                    onClick={() => handleStatusChange(st.id as ReadingStatus)}
                                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${readingStatus === st.id
                                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Progress Control (Active for LENDO or in-progress) */}
                    <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4 text-purple-600" />
                                <span>Progresso de Leitura</span>
                            </span>
                            <span className="text-xs font-extrabold text-purple-900">
                                {currentPage} / {book.pages} páginas ({progressPercent}%)
                            </span>
                        </div>

                        {/* Visual Bar */}
                        <div className="w-full bg-purple-200/60 h-2.5 rounded-full overflow-hidden">
                            <div
                                className="bg-purple-600 h-full rounded-full transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>

                        {/* Quick buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-slate-500 font-medium">Avançar:</span>
                                {[5, 10, 25].map((amt) => (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={() => handleAddPages(amt)}
                                        className="px-2 py-1 bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold rounded-md transition-colors"
                                    >
                                        +{amt} pág
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-[11px] text-slate-600 font-medium">Página Exata:</label>
                                <input
                                    type="number"
                                    min="0"
                                    max={book.pages}
                                    value={currentPage}
                                    onChange={(e) => handleAddPages(Number(e.target.value) - currentPage)}
                                    className="w-20 px-2 py-1 text-xs font-bold text-center bg-white border border-purple-200 rounded-md outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dates & Ownership Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Início da Leitura
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Conclusão
                            </label>
                            <input
                                type="date"
                                value={finishDate}
                                onChange={(e) => setFinishDate(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Exemplar Físico no Acervo
                            </label>
                            <select
                                value={ownershipStatus}
                                onChange={(e) => setOwnershipStatus(e.target.value as OwnershipStatus)}
                                className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="TENHO">📦 Tenho na Estante</option>
                                <option value="NAO_TENHO">🔖 Desejo Comprar</option>
                            </select>
                        </div>
                    </div>

                    {/* Personal Rating */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                            Sua Avaliação Particular:
                        </span>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(rating === star ? 0 : star)}
                                    className="p-1 hover:scale-110 transition-transform"
                                >
                                    <Star
                                        className={`w-5 h-5 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                                            }`}
                                    />
                                </button>
                            ))}
                            <span className="text-xs font-bold text-slate-700 ml-2">
                                {rating > 0 ? `${rating}/5` : 'Sem nota'}
                            </span>
                        </div>
                    </div>

                    {/* Private Notes & Reflections */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>Anotações e Reflexões Pessoais da Proprietária</span>
                        </label>
                        <textarea
                            rows={4}
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Escreva suas anotações particulares sobre a leitura, citações marcantes, reflexões ou sentimentos que este livro despertou..."
                            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 resize-none leading-relaxed"
                        />
                        <p className="text-[10px] text-slate-400">
                            🔒 Registro íntimo e 100% privado. Sem comentários de outros usuários, sem trocas e sem compartilhamentos.
                        </p>
                    </div>

                    {/* Bottom Controls */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                        {onRemove ? (
                            <button
                                type="button"
                                onClick={handleRemove}
                                disabled={removing}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remover da Minha Biblioteca</span>
                            </button>
                        ) : <div />}

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Fechar
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Salvando...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Salvar Progresso</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}