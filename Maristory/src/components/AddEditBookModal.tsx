import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Book, OwnershipStatus, ReadingStatus } from '../types';
import { api } from '../services/api';
import {
    X,
    BookOpen,
    Image,
    Upload,
    Heart,
    Star,
    BookmarkCheck,
    CheckCircle2,
    Layers,
    Search,
    Loader2,
    Trash2
} from 'lucide-react';

interface AddEditBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (bookData: Partial<Book>) => Promise<void>;
    editingBook?: Book | null;
}

const SUGGESTED_GENRES = [
    'Romance',
    'Clássico',
    'Ficção Contemporânea',
    'Fantasia',
    'Distopia / Ficção Científica',
    'Suspense / Mistério',
    'Literatura Brasileira',
    'Poesia',
    'Filosofia / Ensaio',
    'Biografia / Memórias',
    'História',
    'Desenvolvimento Pessoal'
];

export const AddEditBookModal: React.FC<AddEditBookModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editingBook,
}) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [publisher, setPublisher] = useState('');
    const [publicationYear, setPublicationYear] = useState<number>(new Date().getFullYear());
    const [pages, setPages] = useState<number>(250);
    const [genre, setGenre] = useState('Romance');
    const [synopsis, setSynopsis] = useState('');
    const [isbn, setIsbn] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [coverImgError, setCoverImgError] = useState(false);

    // ISBN Lookup status
    const [isbnLookupStatus, setIsbnLookupStatus] = useState<'idle' | 'loading' | 'found' | 'metadata-only' | 'not-found'>('idle');
    const [isbnLookupMessage, setIsbnLookupMessage] = useState<string | null>(null);
    const lastLookedUpIsbnRef = useRef<string>('');

    // Personal status
    const [ownershipStatus, setOwnershipStatus] = useState<OwnershipStatus>('TENHO');
    const [readingStatus, setReadingStatus] = useState<ReadingStatus>('QUERO_LER');
    const [rating, setRating] = useState<number>(0);
    const [review, setReview] = useState('');
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [startDate, setStartDate] = useState<string>('');
    const [finishDate, setFinishDate] = useState<string>('');
    const [isFavorite, setIsFavorite] = useState<boolean>(false);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (editingBook) {
            setTitle(editingBook.title || '');
            setAuthor(editingBook.author || '');
            setPublisher(editingBook.publisher || '');
            setPublicationYear(editingBook.publicationYear || new Date().getFullYear());
            setPages(editingBook.pages || 250);
            setGenre(editingBook.genre || 'Romance');
            setSynopsis(editingBook.synopsis || '');
            setIsbn(editingBook.isbn || '');
            setCoverUrl(editingBook.coverUrl || '');
            setCoverImgError(false);
            setOwnershipStatus(editingBook.ownershipStatus || 'TENHO');
            setReadingStatus(editingBook.readingStatus || 'QUERO_LER');
            setRating(editingBook.rating || 0);
            setReview(editingBook.review || '');
            setCurrentPage(editingBook.currentPage || 0);
            setStartDate(editingBook.startDate || '');
            setFinishDate(editingBook.finishDate || '');
            setIsFavorite(editingBook.isFavorite || false);
            lastLookedUpIsbnRef.current = (editingBook.isbn || '').replace(/[^0-9Xx]/g, '').toUpperCase();
        } else {
            setTitle('');
            setAuthor('');
            setPublisher('');
            setPublicationYear(new Date().getFullYear());
            setPages(250);
            setGenre('Romance');
            setSynopsis('');
            setIsbn('');
            setCoverUrl('');
            setCoverImgError(false);
            setOwnershipStatus('TENHO');
            setReadingStatus('QUERO_LER');
            setRating(0);
            setReview('');
            setCurrentPage(0);
            setStartDate('');
            setFinishDate('');
            setIsFavorite(false);
            lastLookedUpIsbnRef.current = '';
        }
        setIsbnLookupStatus('idle');
        setIsbnLookupMessage(null);
        setError(null);
    }, [editingBook, isOpen]);

    const handleIsbnLookup = useCallback(async (rawIsbn: string) => {
        const clean = rawIsbn.replace(/[^0-9Xx]/g, '').toUpperCase();
        if (clean.length !== 10 && clean.length !== 13) return;

        lastLookedUpIsbnRef.current = clean;
        setIsbnLookupStatus('loading');
        setIsbnLookupMessage('Buscando capa da edição pelo ISBN...');

        try {
            const result = await api.lookupByIsbn(clean);
            // Verify ISBN didn't change while fetching
            const currentClean = isbn.replace(/[^0-9Xx]/g, '').toUpperCase();
            if (currentClean && currentClean !== clean) return;

            if (result.coverUrl) {
                setCoverUrl(result.coverUrl);
                setCoverImgError(false);
                setIsbnLookupStatus('found');
                setIsbnLookupMessage('Capa da edição carregada automaticamente!');
            } else if (result.title || result.author || result.publisher) {
                setIsbnLookupStatus('metadata-only');
                setIsbnLookupMessage('Dados da edição encontrados, mas sem imagem de capa disponível.');
            } else {
                setIsbnLookupStatus('not-found');
                setIsbnLookupMessage('Capa não encontrada automaticamente para este ISBN.');
            }

            // Fill empty bibliographic fields from the edition if not yet filled by user
            if (result.title) setTitle((prev) => prev.trim() ? prev : result.title!);
            if (result.author) setAuthor((prev) => prev.trim() ? prev : result.author!);
            if (result.publisher) setPublisher((prev) => prev.trim() ? prev : result.publisher!);
            if (result.publicationYear) {
                setPublicationYear((prev) => (!editingBook && prev === new Date().getFullYear() ? result.publicationYear! : prev));
            }
            if (result.pages && result.pages > 0) {
                setPages((prev) => (!editingBook && prev === 250 ? result.pages! : prev));
            }
            if (result.synopsis) setSynopsis((prev) => prev.trim() ? prev : result.synopsis!);
        } catch {
            setIsbnLookupStatus('not-found');
            setIsbnLookupMessage('Não foi possível consultar o ISBN no momento.');
        }
    }, [editingBook, isbn]);

    useEffect(() => {
        if (!isOpen) return;
        const clean = isbn.replace(/[^0-9Xx]/g, '').toUpperCase();

        if (clean.length !== 10 && clean.length !== 13) {
            if (isbnLookupStatus !== 'idle') {
                setIsbnLookupStatus('idle');
                setIsbnLookupMessage(null);
            }
            return;
        }

        if (clean === lastLookedUpIsbnRef.current) {
            return;
        }

        const timer = setTimeout(() => {
            handleIsbnLookup(clean);
        }, 500);

        return () => clearTimeout(timer);
    }, [isbn, isOpen, handleIsbnLookup, isbnLookupStatus]);

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('A capa selecionada deve ter menos de 5MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverUrl(reader.result as string);
                setCoverImgError(false);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleReadingStatusChange = (status: ReadingStatus) => {
        setReadingStatus(status);
        if (status === 'LIDO') {
            setCurrentPage(pages);
            if (!finishDate) {
                setFinishDate(new Date().toISOString().split('T')[0]);
            }
        } else if (status === 'QUERO_LER') {
            setCurrentPage(0);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError('Informe o título do livro.');
            return;
        }
        if (!author.trim()) {
            setError('Informe o autor do livro.');
            return;
        }
        if (!pages || pages <= 0) {
            setError('Informe um número de páginas válido.');
            return;
        }

        setSaving(true);
        try {
            await onSave({
                title: title.trim(),
                author: author.trim(),
                publisher: publisher.trim() || 'Editora Particular',
                publicationYear: Number(publicationYear),
                pages: Number(pages),
                genre: genre.trim(),
                synopsis: synopsis.trim(),
                isbn: isbn.trim(),
                coverUrl,
                ownershipStatus,
                readingStatus,
                rating,
                review: review.trim(),
                currentPage: Math.min(Number(currentPage), Number(pages)),
                startDate: startDate || null,
                finishDate: finishDate || null,
                isFavorite,
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar livro na biblioteca particular.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-6">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-900 via-[#3A0071] to-slate-900 text-white px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-200">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">
                                {editingBook ? 'Editar Livro do Acervo' : 'Adicionar Livro à Biblioteca Particular'}
                            </h2>
                            <p className="text-xs text-purple-200">
                                Acervo Privado da Proprietária
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Error Notification */}
                {error && (
                    <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                        {error}
                    </div>
                )}

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

                    {/* SECTION 1: Dados da Obra */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-purple-600" />
                            <span>1. Informações da Obra</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Título do Livro *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex: Orgulho e Preconceito"
                                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Autor(a) *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    placeholder="Ex: Jane Austen"
                                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Gênero Literário
                                </label>
                                <input
                                    type="text"
                                    list="genres-list"
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    placeholder="Selecione ou digite..."
                                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                                <datalist id="genres-list">
                                    {SUGGESTED_GENRES.map((g) => (
                                        <option key={g} value={g} />
                                    ))}
                                </datalist>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Editora
                                </label>
                                <input
                                    type="text"
                                    value={publisher}
                                    onChange={(e) => setPublisher(e.target.value)}
                                    placeholder="Ex: Companhia das Letras"
                                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Ano
                                    </label>
                                    <input
                                        type="number"
                                        value={publicationYear}
                                        onChange={(e) => setPublicationYear(Number(e.target.value))}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Páginas *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={pages}
                                        onChange={(e) => setPages(Number(e.target.value))}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    ISBN (Opcional — busca automaticamente a capa da edição)
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={isbn}
                                        onChange={(e) => setIsbn(e.target.value)}
                                        placeholder="Ex: 9788535914849"
                                        className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <button
                                        type="button"
                                        disabled={
                                            isbnLookupStatus === 'loading' ||
                                            (isbn.replace(/[^0-9Xx]/g, '').length !== 10 &&
                                                isbn.replace(/[^0-9Xx]/g, '').length !== 13)
                                        }
                                        onClick={() => handleIsbnLookup(isbn)}
                                        className="px-3 py-2 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed text-purple-800 border border-purple-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                                        title="Buscar capa da edição pelo ISBN"
                                    >
                                        {isbnLookupStatus === 'loading' ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Search className="w-3.5 h-3.5" />
                                        )}
                                        <span>Buscar capa</span>
                                    </button>
                                </div>
                                {isbnLookupMessage && (
                                    <p
                                        className={`text-[11px] mt-1 font-medium flex items-center gap-1 ${isbnLookupStatus === 'found'
                                                ? 'text-emerald-700'
                                                : isbnLookupStatus === 'loading'
                                                    ? 'text-purple-700'
                                                    : 'text-slate-500'
                                            }`}
                                    >
                                        {isbnLookupMessage}
                                    </p>
                                )}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Sinopse ou Descrição
                                </label>
                                <textarea
                                    rows={2}
                                    value={synopsis}
                                    onChange={(e) => setSynopsis(e.target.value)}
                                    placeholder="Breve resumo da história..."
                                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                />
                            </div>
                        </div>

                        {/* Capa do Livro */}
                        <div className="pt-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-2">
                                Capa do Livro
                            </label>
                            <div className="flex items-center gap-4">
                                {coverUrl && !coverImgError ? (
                                    <img
                                        src={coverUrl}
                                        alt="Prévia da capa"
                                        className="w-16 h-22 object-cover rounded-md border border-slate-200 shadow-2xs shrink-0"
                                        onError={() => setCoverImgError(true)}
                                    />
                                ) : (
                                    <div className="w-16 h-22 rounded-md border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 shrink-0 px-1 text-center">
                                        <Image className="w-5 h-5 mb-1 text-slate-300" />
                                        <span className="text-[9px] font-medium leading-tight">Sem capa</span>
                                    </div>
                                )}

                                <div className="flex-1 space-y-2">
                                    <input
                                        type="url"
                                        value={coverUrl}
                                        onChange={(e) => {
                                            setCoverUrl(e.target.value);
                                            setCoverImgError(false);
                                        }}
                                        placeholder="Capa automática pelo ISBN ou cole a URL da imagem..."
                                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <label className="cursor-pointer px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-colors">
                                            <Upload className="w-3 h-3" />
                                            <span>Fazer upload de foto</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                        </label>
                                        {coverUrl && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCoverUrl('');
                                                    setCoverImgError(false);
                                                }}
                                                className="px-2.5 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                <span>Remover capa</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* SECTION 2: Status Pessoal na Biblioteca Particular */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                            <BookmarkCheck className="w-3.5 h-3.5 text-purple-600" />
                            <span>2. Controle Pessoal de Posse e Leitura</span>
                        </h3>

                        {/* Posse física */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Exemplar na sua biblioteca:
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setOwnershipStatus('TENHO')}
                                    className={`p-3 rounded-xl border text-left transition-all ${ownershipStatus === 'TENHO'
                                            ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold shadow-2xs'
                                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    <div className="text-xs font-bold">📦 Tenho Exemplar Físico</div>
                                    <div className="text-[10px] text-slate-500 font-normal">Presente no meu acervo particular</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setOwnershipStatus('NAO_TENHO')}
                                    className={`p-3 rounded-xl border text-left transition-all ${ownershipStatus === 'NAO_TENHO'
                                            ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold shadow-2xs'
                                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    <div className="text-xs font-bold">🔖 Desejo Adquirir</div>
                                    <div className="text-[10px] text-slate-500 font-normal">Lista de desejos para comprar</div>
                                </button>
                            </div>
                        </div>

                        {/* Status de Leitura */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Status Atual da Leitura:
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
                                        onClick={() => handleReadingStatusChange(st.id as ReadingStatus)}
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

                        {/* Progresso de Páginas e Datas */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Página Atual
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        min="0"
                                        max={pages}
                                        value={currentPage}
                                        onChange={(e) => setCurrentPage(Number(e.target.value))}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <span className="text-xs text-slate-400 shrink-0">/ {pages}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Início da Leitura
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
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
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Avaliação e Favorito */}
                        <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div>
                                <span className="block text-xs font-semibold text-slate-700 mb-1">
                                    Sua Avaliação (0 a 5 estrelas)
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
                                                className={`w-5 h-5 ${star <= rating
                                                        ? 'text-amber-400 fill-amber-400'
                                                        : 'text-slate-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                    <span className="text-xs font-bold text-slate-600 ml-2">
                                        {rating > 0 ? `${rating} estrelas` : 'Sem nota'}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsFavorite(!isFavorite)}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${isFavorite
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                            >
                                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                                <span>{isFavorite ? 'Livro Favorito' : 'Marcar como Favorito'}</span>
                            </button>
                        </div>

                        {/* Anotações particulares */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Anotações e Reflexões Particulares da Proprietária
                            </label>
                            <textarea
                                rows={3}
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="Escreva suas impressões íntimas, citações preferidas ou reflexões sobre esta leitura..."
                                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                                🔒 Suas anotações são 100% privadas e visíveis apenas para você.
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
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
                                    <span>{editingBook ? 'Salvar Alterações' : 'Cadastrar no Acervo'}</span>
                                </>
                            )}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
};
