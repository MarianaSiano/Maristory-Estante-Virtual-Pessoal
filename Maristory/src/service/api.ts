import { json } from 'node:stream/consumers';
import { User, Book, BookshelfItem, ReadingStats, AdminCatalogStats, AuthResponse } from '../types.js';

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