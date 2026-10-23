import { User, Book, ReadingStats, AuthResponse, LibraryBackup } from '../types';

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
        throw new Error(data.error || 'Ocorreu um erro ao comunicar com a biblioteca particular.');
    }

    return data as T;
}

export const api = {
    // Auth
    async login(email: string, pass: string): Promise<AuthResponse> {
        const res = await apiFetch<AuthResponse>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password: pass }),
        });
        saveAuthData(res.token, res.user);
        return res;
    },

    async ownerDirectAccess(): Promise<AuthResponse> {
        const res = await apiFetch<AuthResponse>('/api/auth/owner-acess', {
            method: 'POST',
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

    async getCurrentUser(): Promise<User> {
        const res = await apiFetch<{ user: User }>('/api/auth/me');
        const existingToken = getStoredToken();

        if(existingToken) {
            saveAuthData(existingToken, res.user);
        }
        return res.user;
    },

    async updateProfile(data: {
        name?: string;
        email?: string;
        avatarUrl?: string;
        readingGoal?: string;
        currentPassword?: string;
        newPassword?: string;
    }): Promise<User> {
        const res = await apiFetch<{ user: User; message: string }>('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        const existingToken = getStoredToken() || '';
        saveAuthData(existingToken, res.user);
        return res.user;
    },

    //Library Books
    async getBooks(options?: {
        search?: string;
        genre?: string;
        status?: string;
        ownership?: string;
    }): Promise<Book[]> {
        const query = new URLSearchParams();
        if(options?.search)
            query.append('search', options.search);

        if(options?.genre && options.genre !== 'Todos')
            query.append('genre', options.genre);

        if(options?.status && options.status !== 'ALL')
            query.append('status', options.status);

        if(options?.ownership && options.ownership !== 'ALL')
            query.append('ownership', options.ownership);

        const queryString = query.toString();
        return apiFetch<Book[]>(`/api/books${queryString ? `?${queryString}` : ''}`);
    },

    async getBookId(id: string): Promise<Book> {
        return apiFetch<Book>(`/api/books/${id}`);
    },

    async createBook(book: Partial<Book>): Promise<Book> {
        return apiFetch<Book>('/api/books', {
            method: 'POST',
            body: JSON.stringify(book),
        });
    },

    async updateBook(id: string, updates: Partial<Book>): Promise<Book> {
        return apiFetch<Book>(`/api/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    async deleteBook(id: string): Promise<{ success: boolean; message: string }> {
        return apiFetch<{ success: boolean; message: string }>(`/api/books/${id}`, {
            method: 'DELETE'
        });
    },

    // Aliases for compatibility
    async getUserBookshelf(): Promise<Book[]> {
        return this.getBooks();
    },

    async updateBookshelfItem(bookId: string, itemData: Partial<Book>): Promise<Book> {
        return this.updateBook(bookId, itemData);
    },

    async removeFromBookshelf(bookId: string): Promise<{ success: boolean; message: string }> {
        return this.deleteBook(bookId);
    },

    // Personal Reading Stats
    async getUserStats(): Promise<ReadingStats> {
        return apiFetch<ReadingStats>('/api/user/stats');
    },

    // Export Backup
    async getBackup(): Promise<LibraryBackup> {
        return apiFetch<LibraryBackup>('/api/library/backup');
    }
};