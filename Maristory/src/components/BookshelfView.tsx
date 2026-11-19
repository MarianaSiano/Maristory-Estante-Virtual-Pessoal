import React, { useState } from 'react';
import { Book, ReadingStatus, OwnershipStatus } from '../types';
import { BookCover } from './BookCover';
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
        const q = search.toLocaleLowerCase().trim();
        const matchesSearch =
            !q ||
            book.title.toLocaleLowerCase().includes(q) ||
            book.author.toLocaleLowerCase().includes(q) ||
            book.publisher.toLocaleLowerCase().includes(q) ||
            book.genre.toLocaleLowerCase().includes(q) ||
            book.isbn.includes(q);

        if(!matchesSearch) return false;

        //status Filter
        if(filterStatus === 'FAVORITES') {
            if(!book.isFavorite) return false;
        } else if(filterStatus === 'FISICO') {
            if(book.ownershipStatus !== 'TENHO') return;
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
}