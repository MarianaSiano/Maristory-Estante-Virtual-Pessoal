import React, { useState, useEffect, useCallback } from 'react';
import { User, Book, ReadingStats } from './types';
import { api, getStoredUser, clearAuthData } from './services/api';
import { Header } from './components/Header';
import { BookshelfView } from './components/BookshelfView';
import { StatsView } from './components/StatsView';
import { BookDetailModal } from './components/BookDetailModal';
import { AddEditBookModal } from './components/AddEditBookModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { Footer } from './components/Footer';
import { Lock, BookOpen } from 'lucide-react';

export function App() {
    const [user, setUser] = useState<User | null>(() => getStoredUser());
    const [activeTab, setActiveTab] = useState<'shelf' | 'catalog' | 'stats' | 'admin'>('shelf');
    const [books, setBooks] = useState<Book[]>([]);
    const [stats, setStats] = useState<ReadingStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Load Library Data
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [fetchedBooks, fetchedStats] = await Promise.all([
                api.getBooks(),
                api.getUserStats(),
            ]);
            setBooks(fetchedBooks);
            setStats(fetchedStats);
        } catch (err) {
            console.error('Erro ao carregar dados da biblioteca:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initialize: Ensure owner session exists
    useEffect(() => {
        const initAuthAndData = async () => {
            try {
                let currentUser = getStoredUser();
                if (!currentUser) {
                    // Auto-authenticate as the owner for a seamless private library experience
                    const authRes = await api.ownerDirectAccess();
                    currentUser = authRes.user;
                    setUser(currentUser);
                } else {
                    // Verify/refresh current user
                    const verifiedUser = await api.getCurrentUser();
                    setUser(verifiedUser);
                }
            } catch (err) {
                console.warn('Sessão não autenticada automaticamente:', err);
            } finally {
                loadData();
            }
        };

        initAuthAndData();
    }, [loadData]);

    // Handler: Save reading progress from detail modal
    const handleSaveBookProgress = async (bookId: string, updates: Partial<Book>) => {
        try {
            const updated = await api.updateBook(bookId, updates);
            setBooks((prev) => prev.map((b) => (b.id === bookId ? updated : b)));
            if (selectedBook && selectedBook.id === bookId) {
                setSelectedBook(updated);
            }
            const refreshedStats = await api.getUserStats();
            setStats(refreshedStats);
        } catch (err: any) {
            alert(err.message || 'Erro ao salvar progresso do livro.');
            throw err;
        }
    };

    // Handler: Add or Edit book bibliographic and reading data
    const handleSaveBookBibliographic = async (bookData: Partial<Book>) => {
        try {
            if (editingBook) {
                const updated = await api.updateBook(editingBook.id, bookData);
                setBooks((prev) => prev.map((b) => (b.id === editingBook.id ? updated : b)));
                if (selectedBook && selectedBook.id === editingBook.id) {
                    setSelectedBook(updated);
                }
            } else {
                const created = await api.createBook(bookData);
                setBooks((prev) => [created, ...prev]);
            }
            const refreshedStats = await api.getUserStats();
            setStats(refreshedStats);
            setEditingBook(null);
        } catch (err: any) {
            alert(err.message || 'Erro ao salvar livro no acervo.');
            throw err;
        }
    };

    // Handler: Delete book
    const handleDeleteBook = async (bookId: string) => {
        if (!confirm('Tem certeza que deseja remover este livro da sua biblioteca particular?')) {
            return;
        }
        try {
            await api.deleteBook(bookId);
            setBooks((prev) => prev.filter((b) => b.id !== bookId));
            if (selectedBook && selectedBook.id === bookId) {
                setSelectedBook(null);
                setIsDetailOpen(false);
            }
            const refreshedStats = await api.getUserStats();
            setStats(refreshedStats);
        } catch (err: any) {
            alert(err.message || 'Erro ao remover livro.');
        }
    };

    // Handler: Quick toggle favorite from card
    const handleQuickToggleFavorite = async (book: Book) => {
        try {
            const newFav = !book.isFavorite;
            const updated = await api.updateBook(book.id, { isFavorite: newFav });
            setBooks((prev) => prev.map((b) => (b.id === book.id ? updated : b)));
            if (selectedBook && selectedBook.id === book.id) {
                setSelectedBook(updated);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Handler: Quick advance pages (+10) from card
    const handleQuickAddPages = async (book: Book, pagesToAdd: number) => {
        try {
            const cur = book.currentPage || 0;
            const next = Math.min(book.pages, cur + pagesToAdd);
            const updates: Partial<Book> = { currentPage: next };
            if (next === book.pages && book.readingStatus !== 'LIDO') {
                updates.readingStatus = 'LIDO';
                updates.finishDate = new Date().toISOString().split('T')[0];
            }
            const updated = await api.updateBook(book.id, updates);
            setBooks((prev) => prev.map((b) => (b.id === book.id ? updated : b)));
            const refreshedStats = await api.getUserStats();
            setStats(refreshedStats);
        } catch (err) {
            console.error(err);
        }
    };

    // Handler: Logout
    const handleLogout = () => {
        clearAuthData();
        setUser(null);
    };

    // Handler: Login success
    const handleLoginSuccess = (loggedInUser: User) => {
        setUser(loggedInUser);
        loadData();
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#fcfaff] text-slate-800">

            {/* Header */}
            <Header
                user={user}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenAuth={() => setIsAuthOpen(true)}
                onLogout={handleLogout}
                onOpenProfile={() => setIsProfileOpen(true)}
            />

            {/* Main Container */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[450px] gap-3 text-slate-400">
                        <div className="w-9 h-9 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-semibold text-purple-900">
                            Abrindo sua biblioteca particular...
                        </p>
                    </div>
                ) : !user ? (
                    /* Unauthenticated state prompt */
                    <div className="text-center py-20 bg-white rounded-3xl border border-purple-100 p-8 max-w-md mx-auto space-y-4 shadow-sm">
                        <div className="w-14 h-14 bg-purple-50 text-purple-700 rounded-2xl mx-auto flex items-center justify-center">
                            <Lock className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-lg font-bold text-slate-900">
                                Biblioteca Particular Trancada
                            </h2>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Este acervo é de uso estritamente privado de sua proprietária.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsAuthOpen(true)}
                            className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                        >
                            <span>Acessar como Proprietária</span>
                        </button>
                    </div>
                ) : activeTab === 'shelf' ? (
                    <BookshelfView
                        books={books}
                        readingGoal={user?.readingGoal || 24}
                        onOpenBookDetail={(book: Book) => {
                            setSelectedBook(book);
                            setIsDetailOpen(true);
                        }}
                        onOpenAddBook={() => {
                            setEditingBook(null);
                            setIsAddEditOpen(true);
                        }}
                        onEditBook={(book: Book) => {
                            setEditingBook(book);
                            setIsAddEditOpen(true);
                        }}
                        onDeleteBook={handleDeleteBook}
                        onQuickToggleFavorite={handleQuickToggleFavorite}
                        onQuickAddPages={handleQuickAddPages}
                    />
                ) : (
                    <StatsView user={user} stats={stats} books={books} />
                )}
            </main>

            {/* Footer */}
            <Footer />

            {/* MODALS */}
            {/* 1. Book Detail Modal */}
            <BookDetailModal
                book={selectedBook}
                bookshelfItem={selectedBook}
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedBook(null);
                }}
                onSave={handleSaveBookProgress}
                onEditBookDetails={(book: Book) => {
                    setEditingBook(book);
                    setIsAddEditOpen(true);
                }}
                onRemove={handleDeleteBook}
            />

            {/* 2. Add / Edit Book Modal */}
            <AddEditBookModal
                isOpen={isAddEditOpen}
                onClose={() => {
                    setIsAddEditOpen(false);
                    setEditingBook(null);
                }}
                onSave={handleSaveBookBibliographic}
                editingBook={editingBook}
            />

            {/* 3. Auth Modal */}
            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onSuccess={handleLoginSuccess}
            />

            {/* 4. Profile & Settings Modal */}
            {user && (
                <ProfileModal
                    user={user}
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    onUpdateUser={(updated) => setUser(updated)}
                />
            )}

        </div>
    );
}

export default App;