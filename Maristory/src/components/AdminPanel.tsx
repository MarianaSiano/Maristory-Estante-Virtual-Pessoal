import React, { useState, useEffect } from 'react';
import { Book, AdminCatalogStats, User } from '../types.js';
import { api } from '../service/api.ts';
import { ShieldCheck, Plus, Edit3, Trash2, Library, Users, Bookmark, Sparkles, Image, CheckCircle2, AlertCircle, Upload, X } from 'lucide-react';

interface AdminPanelProps {
    user: User;
    onRefreshCatalog: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onRefreshCatalog }) => {
    const [stats, setStats] = useState<AdminCatalogStats | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Add/Edit Book Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBookId, setEditingBookId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [publisher, setPublisher] = useState('');
    const [publicationYear, setPublicationYear] = useState<number>(new Date().getFullYear());
    const [pages, setPages] = useState<number>(200);
    const [genre, setGenre] = useState('Romance');
    const [synopsis, setSynopsis] = useState('');
    const [isbn, setIsbn] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [saving, setSaving] = useState(false);

    // Preset covers for quick admin selection
    const presetCovers = [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
    ];

    const loadData = async () => {
        setLoading(true);

        try {
            const [s, b] = await Promise.all([api.getAdminStats(), api.getBooks()]);
            setStats(s);
            setBooks(b);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar dados do painel administrativo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const openCreateForm = () => {
        setEditingBookId(null);
        setTitle('');
        setAuthor('');
        setPublisher('Companhia das Letras');
        setPublicationYear(2024);
        setPages(250);
        setGenre('Romance');
        setSynopsis('');
        setIsbn('978' + Math.floor(1000000000 + Math.random() * 9000000000));
        setCoverUrl(presetCovers[0]);
        setIsFormOpen(true);
    };

    const openEditForm = (book: Book) => {
        setEditingBookId(book.id);
        setTitle(book.title);
        setAuthor(book.author);
        setPublisher(book.publisher);
        setPublicationYear(book.publicationYear);
        setPages(book.pages);
        setGenre(book.genre);
        setSynopsis(book.synopsis);
        setIsbn(book.isbn);
        setCoverUrl(book.coverUrl);
        setIsFormOpen(true);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if(file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
}