import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { User, Book, ReadingStats, LibraryBackup } from '../src/types.ts';

interface DBData {
    owner: User & { passwordHash: string };
    books: Book[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'maristory-db.json');

const DEFAULT_OWNER_NAME = process.env.OWNER_NAME || 'Proprietária';
const DEFAULT_OWNER_EMAIL = process.env.OWNER_EMAIL || 'proprietaria@maristory.local';
const DEFAULT_OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'admin123';
const AUTH_SECRET_SALT = process.env.AUTH_SECRET_SALT || 'maristory_private_salt_2026';

function ensureDBDir() {
    if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
    }
}

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password + AUTH_SECRET_SALT).digest('hex');
}

export function generateToken(userId: string): string {
    const payload = { userId, role: 'ADMIN', exp: Date.now() + 30 * 24 * 60 * 60 * 1000 };
    return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function verifyToken(token: string): string | null {
    try {
        const json = Buffer.from(token, 'base64url').toString('utf8');
        const payload = JSON.parse(json);
        if (payload.exp && Date.now() > payload.exp) {
            return null;
        }
        return payload.userId || null;
    } catch {
        return null;
    }
}

function getDefaultData(): DBData {
    return {
        owner: {
            id: 'usr_owner_1',
            name: DEFAULT_OWNER_NAME,
            email: DEFAULT_OWNER_EMAIL,
            role: 'ADMIN',
            passwordHash: hashPassword(DEFAULT_OWNER_PASSWORD),
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            readingGoal: 24,
            createdAt: new Date().toISOString(),
        },
        books: [],
    };
}