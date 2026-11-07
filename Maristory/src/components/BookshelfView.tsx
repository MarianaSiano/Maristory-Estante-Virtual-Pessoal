import React, { useState } from 'react';
import { Book, BookshelfItem, ReadingStatus } from '../types.js';
import { Search, Filter, BookOpen, Star, Heart, BookmarkCheck, Plus, Sparkles, Check, ArrowUpDown } from 'lucide-react';

export interface BookshelfViewProps {
    books?: Book[];
    shelfItems?: BookshelfItem[];
    readingGoal?: number;
    onOpenBookDetail: (book: Book) => void;
    onNavigateToCatalog?: () => void;
    onOpenAddBook?: () => void;
    onEditBook?: (book: Book) => void;
    onDeleteBook?: (bookId: string) => Promise<void>;
    onQuickToggleFavorite?: (book: Book) => Promise<void>;
    onQuickAddPages?: (book: Book, pagesToAdd: number) => Promise<void>;
}

export const BookshelfView: React.FC<BookshelfViewProps> = ({
    books = [],
    shelfItems,
    readingGoal = 24,
    onOpenBookDetail,
    onNavigateToCatalog,
    onOpenAddBook,
    onEditBook,
    onDeleteBook,
    onQuickToggleFavorite,
    onQuickAddPages,
}) => {
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [filterOwnership, setFilterOwnership] = useState<string>('ALL');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'updatedAt' | 'title' | 'rating'>('updatedAt');

    const displayBooks = books.length > 0 ? books : (shelfItems || []);

    return (
        <div className="space-y-6">
            {/* Bookshelf header and list */}
            {displayBooks.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-purple-200 p-8 space-y-3">
                    <BookOpen className="w-10 h-10 text-purple-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">Nenhum livro cadastrado na estante ainda.</p>
                    {onOpenAddBook && (
                        <button
                            onClick={onOpenAddBook}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Adicionar Primeiro Livro</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {displayBooks.map((book) => (
                        <div
                            key={book.id}
                            onClick={() => onOpenBookDetail(book)}
                            className="bg-white rounded-xl shadow-xs border border-purple-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group flex flex-col"
                        >
                            <div className="relative aspect-[2/3] bg-purple-50 overflow-hidden">
                                <img
                                    src={book.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'}
                                    alt={book.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                {book.isFavorite && (
                                    <div className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur-xs rounded-full shadow-xs">
                                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                                    </div>
                                )}
                            </div>
                            <div className="p-2.5 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold text-xs text-slate-900 line-clamp-1 group-hover:text-purple-700 transition-colors">
                                        {book.title}
                                    </h3>
                                    <p className="text-[11px] text-slate-500 line-clamp-1">{book.author}</p>
                                </div>
                                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                                    <span>{book.readingStatus}</span>
                                    <span>{book.currentPage}/{book.pages} pág</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
