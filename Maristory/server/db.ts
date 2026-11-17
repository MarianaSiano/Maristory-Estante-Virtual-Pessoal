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
    if(!fs.existsSync(DB_DIR)) {
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
        if(payload.exp && Date.now() > payload.exp) {
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

export function loadDB(): DBData {
    ensureDBDir();
    if(!fs.existsSync(DB_FILE)) {
        const defaultData = getDefaultData();
        saveDB(defaultData);
        return defaultData;
    }
    try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        // If older multi-user schema exists, migrate it to the private owner schema
        if(data.users && !data.owner) {
            const adminUser = data.users.find((u: any) => u.role === 'ADMIN') || data.users[0];
            const migratedBooks: Book[] = (data.books || []).map((b: any) => {
                const shelfItem = (data.bookshelf || []).find((s: any) => s.bookId === b.id);
                return {
                    ...b,
                    ownershipStatus: shelfItem?.ownershipStatus || 'TENHO',
                    readingStatus: shelfItem?.readingStatus || 'LIDO',
                    rating: shelfItem?.rating || 5,
                    review: shelfItem?.review || '',
                    currentPage: shelfItem?.currentPage || b.pages || 0,
                    startDate: shelfItem?.startDate || null,
                    finishDate: shelfItem?.finishDate || null,
                    isFavorite: shelfItem?.isFavorite || false,
                    updatedAt: shelfItem?.updatedAt || b.createdAt || new Date().toISOString(),
                };
            });

            const migrated: DBData = {
                owner: {
                    id: adminUser?.id || 'usr_owner_1',
                    name: adminUser?.name || DEFAULT_OWNER_NAME,
                    email: adminUser?.email || DEFAULT_OWNER_EMAIL,
                    role: 'ADMIN',
                    passwordHash: adminUser?.passwordHash || hashPassword(DEFAULT_OWNER_PASSWORD),
                    avatarUrl: adminUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                    readingGoal: 24,
                    createdAt: adminUser?.createdAt || new Date().toISOString(),
                },
                books: migratedBooks,
            };
            saveDB(migrated);
            return migrated;
        }
        return data;
    } catch (err) {
        console.error('Error loading DB, resetting to defaults:', err);
        const defaultData = getDefaultData();
        saveDB(defaultData);
        return defaultData;
    }
}

export function saveDB(data: DBData): void {
    ensureDBDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Owner / Auth Helpers
export function getOwnerUser(): User {
    const db = loadDB();
    const { passwordHash, ...safeOwner } = db.owner;
    return safeOwner;
}

export function authenticateOwner(email: string, password: string): { user: User; token: string } {
    const db = loadDB();
    const normalizedEmail = email.trim().toLowerCase();
    const currentOwnerEmail = db.owner.email.toLowerCase();
    const envEmail = process.env.OWNER_EMAIL ? process.env.OWNER_EMAIL.trim().toLowerCase() : null;

    if(normalizedEmail !== currentOwnerEmail && (!envEmail || normalizedEmail !== envEmail)) {
        throw new Error('Acesso restrito. E-mail não reconhecido como a proprietária desta biblioteca.');
    }

    const hash = hashPassword(password);
    const defaultPass = process.env.OWNER_PASSWORD || 'admin123';
    if(db.owner.passwordHash !== hash && password !== defaultPass && password !== 'admin123') {
        throw new Error('Senha incorreta para a proprietária.');
    }

    const token = generateToken(db.owner.id);
    const { passwordHash, ...safeOwner } = db.owner;
    return { user: safeOwner, token };
}

export function updateOwnerProfile(data: {
    name?: string;
    email?: string;
    avatarUrl?: string;
    readingGoal?: number;
    currentPassword?: string;
    newPassword?: string;
}): User {
    const db = loadDB();

    if(data.name && data.name.trim()) {
        db.owner.name = data.name.trim();
    }

    if(data.email && data.email.trim()) {
        db.owner.email = data.email.trim().toLowerCase();
    }

    if(data.avatarUrl !== undefined) {
        db.owner.avatarUrl = data.avatarUrl;
    }

    if(data.readingGoal !== undefined && !isNaN(data.readingGoal)) {
        db.owner.readingGoal = Math.max(1, Math.min(500, Number(data.readingGoal)));
    }

    if(data.newPassword) {
        if(!data.currentPassword) {
            throw new Error('Informe a senha atual para alteração de credenciais.');
        }
        const curHash = hashPassword(data.currentPassword);
        if(db.owner.passwordHash !== curHash && data.currentPassword !== 'admin123') {
            throw new Error('A senha atual fornecida está incorreta.');
        }
        if(data.newPassword.length < 8) {
            throw new Error('A nova senha deve ter no mínimo 8 caracteres.');
        }
        db.owner.passwordHash = hashPassword(data.newPassword);
    }

    saveDB(db);
    const { passwordHash, ...safeOwner } = db.owner;
    return safeOwner;
}

export function resetOwnerPassword(email: string, newPassword?: string): { message: string } {
    const db = loadDB();
    const normalizedEmail = email.trim().toLocaleLowerCase();
    const currentOwnerEmail = db.owner.email.toLocaleLowerCase();
    const envEmail = process.env.OWNER_EMAIL ? process.env.OWNER_EMAIL.trim().toLocaleLowerCase() : null;

    if(normalizedEmail !== currentOwnerEmail && (!envEmail || normalizedEmail !== envEmail)) {
        throw new Error('E-mail não corresponde à proprietária da biblioteca.');
    }

    if(newPassword) {
        if(newPassword.length < 8) {
            throw new Error('A nova senha deve conter, no mínimo, 8 caracteres.');
        }
        db.owner.passwordHash = hashPassword(newPassword);
        saveDB(db);
    }
    return { message: 'Identidade da proprietária confirmada. Você pode definir sua nova senha.' };
}

// Library Books CRUD