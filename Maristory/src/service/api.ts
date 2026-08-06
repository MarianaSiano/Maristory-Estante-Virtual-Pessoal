import { Search } from 'lucide-react';
import { json } from 'node:stream/consumers';
import { User, Book, BookshelfItem, ReadingStats, AdminCatalogStats, AuthResponse } from '../types.js';
import { getBookById } from '@/server/db.js';

const TOKEN_KEY = 'maristory_auth_token';
const USER_KEY = 'maristory_user_data';

export function getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
    const data = localStorage.getItem(USER_KEY);

    if(!data)
        return null;

    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
}

export function saveAuthData(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthData(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getStoredToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if(token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
        ...options,
        headers,
    });

    const data = await response.json();

    if(!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro ao comunicar com o servidor.');
    }

    return data as T;
}

export const api = {
    // Auth
    async register(name: string, email: string, pass: string): Promise<AuthResponse> {
        const res = await apiFetch<AuthResponse>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password: pass }),
        });
        saveAuthData(res.token, res.user);
        return res;
    },

    async forgotPassword(email: string, newPassword?: string): Promise<{ message: string }> {
        return await apiFetch<{ message: string }>('/api/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email, newPassword }),
        });
    },

    async login(email: string, pass: string): Promise<AuthResponse> {
        const res = await apiFetch<AuthResponse>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password: pass },)
        });
        saveAuthData(res.token, res.user);
        return res;
    },

    async getCurrentUser(): Promise<User> {
        const res = await apiFetch<{ user: User }>('/api/auth/me');
        saveAuthData(getStoredToken() || '', res.user);
        return res.user;
    },

    async updateProfile(data: {
        name?: string;
        email?: string;
        avatarUrl?: string;
        currentPassword?: string;
        newPassword?: string;
    }): Promise<User> {
        const res = await apiFetch<{ user: User; message: string }>('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        saveAuthData(getStoredToken() || '', res.user);
        return res.user;
    },

    // Catalog
    async getBooks(search?: string, genre?: string): Promise<Book[]> {
        const query = new URLSearchParams();
        if(search)
            query.append('search', search);

        if(genre)
            query.append('genre', genre);

        return apiFetch<Book[]>(`/api/books?${query.toString()}`);
    },

    async getBookById(id: string): Promise<Book> {
        return apiFetch<Book>(`/api/books/${id}`);
    },

    // Admin Catalog Management
    async createBook(book: Omit<Book, 'id' | 'createdBy' | 'createdAt'>): Promise<Book> {
        return apiFetch<Book>('/api/admin/books', {
            method: 'POST',
            body: JSON.stringify(book),
        });
    },

    async updateBook(id: string, updates: Partial<Book>): Promise<Book> {
        return apiFetch<Book>(`/api/admin/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    async deleteBook(id: string): Promise<{ success: boolean; message: string }> {
        return apiFetch<{ success: boolean; message: string }>(`/api/admin/books/${id}`, {
            method: 'DELETE',
        });
    },

    // User Bookshelf
    async getUserBookshelf(): Promise<BookshelfItem[]> {
        return apiFetch<BookshelfItem[]>('/api/user/bookshelf');
    },

    async updateBookshelfItem(bookId: string, itemData: Partial<BookshelfItem>): Promise<BookshelfItem> {
        return apiFetch<BookshelfItem>(`/api/user/bookshelf/${bookId}`, {
            method: 'POST',
            body: JSON.stringify(itemData),
        });
    },

    async removeFromBookshelf(bookId: string): Promise<{ success: boolean; message: string }> {
        return apiFetch<{ success: boolean; message: string }>(`/api/user/bookshelf/${bookId}`, {
            method: 'DELETE',
        });
    },

    async getUserStats(): Promise<ReadingStats> {
        return apiFetch<ReadingStats>('/api/user/stats');
    },

    async getAdminStats(): Promise<AdminCatalogStats> {
        return apiFetch<AdminCatalogStats>('/api/admin/stats');
    }
}