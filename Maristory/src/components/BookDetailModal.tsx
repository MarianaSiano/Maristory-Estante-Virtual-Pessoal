import React, { useState, useEffect } from 'react';
import { Book, BookshelfItem, OwnershipStatus, ReadingStatus } from '../types.js';
import { X, Star, Heart, BookmarkCheck, BookOpen, Calendar, Trash2, CheckCircle2, FileText, Bookmark, Edit3 } from 'lucide-react';

export interface BookDetailModalProps {
    book: Book | null;
    bookshelfItem?: BookshelfItem | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (bookId: string, itemData: Partial<Book>) => Promise<void>;
    onEditBookDetails?: (book: Book) => void;
    onRemove?: (bookId: string) => Promise<void>;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
    book,
    bookshelfItem,
    isOpen,
    onClose,
    onSave,
    onEditBookDetails,
    onRemove,
}) => { 
    if(!isOpen || !book) return null;

    const [currentPage, setCurrentPage] = useState(book.currentPage || 0);
    const [readingStatus, setReadingStatus] = useState<ReadingStatus>(book.readingStatus || 'QUERO_LER');
    const [rating, setRating] = useState(book.rating || 0);
    const [review, setReview] = useState(book.review || '');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (book) {
            setCurrentPage(book.currentPage || 0);
            setReadingStatus(book.readingStatus || 'QUERO_LER');
            setRating(book.rating || 0);
            setReview(book.review || '');
        }
    }, [book]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(book.id, {
                currentPage,
                readingStatus,
                rating,
                review,
            });
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-800 line-clamp-1">{book.title}</h2>
                    <div className="flex items-center gap-2">
                        {onEditBookDetails && (
                            <button
                                onClick={() => {
                                    onEditBookDetails(book);
                                    onClose();
                                }}
                                className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition"
                                title="Editar dados do livro"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                        )}
                        {onRemove && (
                            <button
                                onClick={() => onRemove(book.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                                title="Remover da estante"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="w-32 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-md mx-auto sm:mx-0">
                            <img
                                src={book.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'}
                                alt={book.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex-1 space-y-3 text-center sm:text-left">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{book.title}</h3>
                                <p className="text-sm text-slate-500">{book.author}</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-600">
                                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-semibold rounded-lg">
                                    {book.genre || 'Geral'}
                                </span>
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                                    {book.pages} páginas
                                </span>
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                                    {book.publisher || 'Editora N/A'}
                                </span>
                            </div>

                            {book.synopsis && (
                                <p className="text-xs text-slate-600 leading-relaxed line-clamp-4 text-justify">
                                    {book.synopsis}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Reading status & progress */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Status de Leitura</label>
                            <select
                                value={readingStatus}
                                onChange={(e) => setReadingStatus(e.target.value as ReadingStatus)}
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-purple-500 focus:outline-none"
                            >
                                <option value="QUERO_LER">Quero Ler</option>
                                <option value="LENDO">Lendo</option>
                                <option value="LIDO">Lido</option>
                                <option value="ABANDONOU">Abandonou</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Página Atual</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max={book.pages}
                                    value={currentPage}
                                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-purple-500 focus:outline-none"
                                />
                                <span className="text-xs text-slate-400 whitespace-nowrap">de {book.pages}</span>
                            </div>
                        </div>
                    </div>

                    {/* Review & impressions */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Notas e Impressões Pessoais</label>
                        <textarea
                            rows={3}
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Anote suas impressões particulares sobre esta leitura..."
                            className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-purple-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
                    >
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
};
