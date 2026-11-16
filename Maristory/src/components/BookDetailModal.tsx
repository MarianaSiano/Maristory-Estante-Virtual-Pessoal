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
import { setFeatureDefinitions } from 'motion';

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
    if(!isOpen || !book) return null;

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
        if(book) {
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
        if(status === 'LIDO') {
            setCurrentPage(book.pages);
            if(!finishDate) {
                setFinishDate(new Date().toISOString().split('T')[0]);
            }
        } else if(status === 'QUERO_LER') {
            setCurrentPage(0);
        }
    };

    const handleAddPages = (delta: number) => {
        const next = Math.min(book.pages, Math.max(0, currentPage + delta));
        setCurrentPage(next);
        if(next === book.pages && readingStatus !== 'LIDO') {
            setReadingStatus('LIDO');
            if(!finishDate) {
                setFinishDate(new Date().toISOString().split('T')[0])
            }
        } else if(next > 0 && readingStatus === 'QUERO_LER') {
            setReadingStatus('LENDO');
            if(!startDate) {
                setStartDate(new Date(  ).toISOString().split('T')[0]);
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
        } catch(err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };
}