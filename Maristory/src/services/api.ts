import { User, Book, ReadingStats, AuthResponse, LibraryBackup, IsbnLookupResult } from '../types';

const TOKEN_KEY = 'maristory_auth_token';
const USER_KEY = 'maristory_user_data';

export function getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
    const data = localStorage.getItem(USER_KEY);
    if(!data) return null;
    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
}

export function saveAuthData(token: string, user: User) {
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