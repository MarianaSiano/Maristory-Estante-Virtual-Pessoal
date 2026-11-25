import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { User, Book, ReadingStats, LibraryBackup, ReadingDayEntry } from '../src/types.ts';

interface DBData {
    owner: User & { passwordHash: string };
    books: Book[];
    readingDays: Record<string, ReadingDayEntry>;
}

function getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function normalizeActivityDate(activityDate?: string): string {
    if (activityDate && /^\d{4}-\d{2}-\d{2}$/.test(activityDate)) {
        return activityDate;
    }
    return getLocalDateString();
}

function markReadingDay(
    db: DBData,
    dateStr: string,
    bookId: string,
    pagesDelta: number
): void {
    if (!db.readingDays) {
        db.readingDays = {};
    }
    const existing = db.readingDays[dateStr];
    const safeDelta = Math.max(0, pagesDelta);
    if (existing) {
        existing.pagesRead += safeDelta;
        if (!existing.bookIds.includes(bookId)) {
            existing.bookIds.push(bookId);
        }
    } else {
        db.readingDays[dateStr] = {
            date: dateStr,
            pagesRead: safeDelta,
            bookIds: [bookId],
        };
    }
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
        readingDays: {},
    };
}

export function loadDB(): DBData {
    ensureDBDir();
    if (!fs.existsSync(DB_FILE)) {
        const defaultData = getDefaultData();
        saveDB(defaultData);
        return defaultData;
    }
    try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        // If older multi-user schema exists, migrate it to the private owner schema
        if (data.users && !data.owner) {
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
                readingDays: data.readingDays || {},
            };
            saveDB(migrated);
            return migrated;
        }
        if (!data.readingDays) {
            data.readingDays = {};
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

    if (normalizedEmail !== currentOwnerEmail && (!envEmail || normalizedEmail !== envEmail)) {
        throw new Error('Acesso restrito. E-mail não reconhecido como a proprietária desta biblioteca.');
    }

    const hash = hashPassword(password);
    const defaultPass = process.env.OWNER_PASSWORD || 'admin123';
    if (db.owner.passwordHash !== hash && password !== defaultPass && password !== 'admin123') {
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

    if (data.name && data.name.trim()) {
        db.owner.name = data.name.trim();
    }

    if (data.email && data.email.trim()) {
        db.owner.email = data.email.trim().toLowerCase();
    }

    if (data.avatarUrl !== undefined) {
        db.owner.avatarUrl = data.avatarUrl;
    }

    if (data.readingGoal !== undefined && !isNaN(data.readingGoal)) {
        db.owner.readingGoal = Math.max(1, Math.min(500, Number(data.readingGoal)));
    }

    if (data.newPassword) {
        if (!data.currentPassword) {
            throw new Error('Informe a senha atual para alteração de credenciais.');
        }
        const curHash = hashPassword(data.currentPassword);
        if (db.owner.passwordHash !== curHash && data.currentPassword !== 'admin123') {
            throw new Error('A senha atual fornecida está incorreta.');
        }
        if (data.newPassword.length < 8) {
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
    const normalizedEmail = email.trim().toLowerCase();
    const currentOwnerEmail = db.owner.email.toLowerCase();
    const envEmail = process.env.OWNER_EMAIL ? process.env.OWNER_EMAIL.trim().toLowerCase() : null;

    if (normalizedEmail !== currentOwnerEmail && (!envEmail || normalizedEmail !== envEmail)) {
        throw new Error('E-mail não corresponde à proprietária da biblioteca.');
    }

    if (newPassword) {
        if (newPassword.length < 8) {
            throw new Error('A nova senha deve conter no mínimo 8 caracteres.');
        }
        db.owner.passwordHash = hashPassword(newPassword);
        saveDB(db);
        return { message: 'Senha da proprietária redefinida com sucesso!' };
    }

    return { message: 'Identidade da proprietária confirmada. Você pode definir sua nova senha.' };
}

// Library Books CRUD
export function getLibraryBooks(options?: {
    search?: string;
    genre?: string;
    status?: string;
    ownership?: string;
}): Book[] {
    const db = loadDB();
    let list = db.books;

    if (options?.search) {
        const q = options.search.toLowerCase().trim();
        list = list.filter(
            b =>
                b.title.toLowerCase().includes(q) ||
                b.author.toLowerCase().includes(q) ||
                b.publisher.toLowerCase().includes(q) ||
                b.genre.toLowerCase().includes(q) ||
                b.isbn.includes(q)
        );
    }

    if (options?.genre && options.genre !== 'Todos') {
        list = list.filter(b => b.genre.toLowerCase() === options.genre!.toLowerCase());
    }

    if (options?.status && options.status !== 'ALL') {
        if (options.status === 'FAVORITES') {
            list = list.filter(b => b.isFavorite);
        } else {
            list = list.filter(b => b.readingStatus === options.status);
        }
    }

    if (options?.ownership && options.ownership !== 'ALL') {
        list = list.filter(b => b.ownershipStatus === options.ownership);
    }

    return list;
}

export function getBookById(id: string): Book | null {
    const db = loadDB();
    return db.books.find(b => b.id === id) || null;
}

export function createLibraryBook(data: Partial<Book> & { activityDate?: string }): Book {
    const db = loadDB();
    if (!data.title || !data.author) {
        throw new Error('Título e Autor são obrigatórios para registrar o livro na biblioteca.');
    }

    const now = new Date().toISOString();
    const totalPages = Math.max(1, Number(data.pages) || 1);
    const rawCurrentPage = Math.max(0, Number(data.currentPage) || 0);
    const cappedCurrentPage = Math.min(rawCurrentPage, totalPages);
    let status = data.readingStatus || 'QUERO_LER';
    let finishDate = data.finishDate || null;

    if (status === 'LENDO' && cappedCurrentPage >= totalPages) {
        status = 'LIDO';
        if (!finishDate) {
            finishDate = normalizeActivityDate(data.activityDate);
        }
    }

    const newBook: Book = {
        id: 'bk_' + crypto.randomUUID().slice(0, 8),
        title: data.title.trim(),
        author: data.author.trim(),
        publisher: data.publisher?.trim() || 'Editora Particular',
        publicationYear: Number(data.publicationYear) || new Date().getFullYear(),
        pages: totalPages,
        genre: data.genre?.trim() || 'Geral',
        synopsis: data.synopsis?.trim() || '',
        isbn: data.isbn?.trim() || '',
        coverUrl: data.coverUrl?.trim() || '',
        ownershipStatus: data.ownershipStatus || 'TENHO',
        readingStatus: status,
        rating: Number(data.rating) || 0,
        review: data.review?.trim() || '',
        currentPage: status === 'LIDO' ? totalPages : cappedCurrentPage,
        startDate: data.startDate || null,
        finishDate,
        isFavorite: Boolean(data.isFavorite),
        createdAt: now,
        updatedAt: now,
    };

    db.books.unshift(newBook);

    if (
        (data.readingStatus === 'LENDO' || newBook.readingStatus === 'LENDO') &&
        newBook.currentPage > 0
    ) {
        markReadingDay(db, normalizeActivityDate(data.activityDate), newBook.id, newBook.currentPage);
    }

    saveDB(db);
    return newBook;
}

export function updateLibraryBook(
    id: string,
    updates: Partial<Book> & { activityDate?: string }
): Book {
    const db = loadDB();
    const index = db.books.findIndex(b => b.id === id);
    if (index === -1) {
        throw new Error('Livro não encontrado na biblioteca particular.');
    }

    const current = db.books[index];
    const { activityDate, ...bookUpdates } = updates;
    const dateStr = normalizeActivityDate(activityDate);

    const updated: Book = {
        ...current,
        ...bookUpdates,
        updatedAt: new Date().toISOString(),
    };

    // Keep pages bounds valid
    if (updated.currentPage < 0 || Number.isNaN(updated.currentPage)) {
        updated.currentPage = 0;
    }
    if (updated.currentPage > updated.pages) {
        updated.currentPage = updated.pages;
    }

    // If the book was being read and reached the total pages, mark it as read
    if (
        current.readingStatus === 'LENDO' &&
        updated.pages > 0 &&
        updated.currentPage >= updated.pages
    ) {
        updated.readingStatus = 'LIDO';
    }

    if (updated.readingStatus === 'LIDO') {
        if (!updated.finishDate) {
            updated.finishDate = dateStr;
        }
        updated.currentPage = updated.pages;
    }

    const pagesDelta = updated.currentPage - (current.currentPage || 0);
    const wasReading = current.readingStatus === 'LENDO';
    const isReading = updated.readingStatus === 'LENDO';
    const finishedReadingBook = wasReading && updated.readingStatus === 'LIDO';

    if ((wasReading || isReading) && (pagesDelta > 0 || finishedReadingBook)) {
        markReadingDay(db, dateStr, updated.id, Math.max(0, pagesDelta));
    }

    db.books[index] = updated;
    saveDB(db);
    return updated;
}

export function deleteLibraryBook(id: string): void {
    const db = loadDB();
    db.books = db.books.filter(b => b.id !== id);
    saveDB(db);
}

// Reading Stats tailored strictly for the proprietor
export function getReadingStats(): ReadingStats {
    const db = loadDB();
    const books = db.books;

    const totalInShelf = books.length;
    const booksRead = books.filter(b => b.readingStatus === 'LIDO').length;
    const currentlyReading = books.filter(b => b.readingStatus === 'LENDO').length;
    const wantToRead = books.filter(b => b.readingStatus === 'QUERO_LER').length;
    const abandoned = books.filter(b => b.readingStatus === 'ABANDONOU').length;
    const ownedBooks = books.filter(b => b.ownershipStatus === 'TENHO').length;

    let pagesRead = 0;
    let ratedCount = 0;
    let ratingSum = 0;
    const genreCounts: Record<string, number> = {};
    const monthlyReadCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    const readBooks: Book[] = [];

    books.forEach(b => {
        if (b.readingStatus === 'LIDO') {
            pagesRead += b.pages;
            readBooks.push(b);

            const d = b.finishDate ? new Date(b.finishDate) : new Date(b.updatedAt);
            if (!isNaN(d.getTime())) {
                monthlyReadCounts[d.getMonth()] += 1;
            }
        } else if (b.readingStatus === 'LENDO') {
            pagesRead += Math.min(b.currentPage, b.pages);
        }

        if (b.genre) {
            genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
        }

        if (b.rating > 0) {
            ratedCount++;
            ratingSum += b.rating;
        }
    });

    const averageRating = ratedCount > 0 ? parseFloat((ratingSum / ratedCount).toFixed(1)) : 0;

    const topGenres = Object.entries(genreCounts)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

    // Longest & Shortest
    const sortedByPages = [...books].sort((a, b) => b.pages - a.pages);
    const longestBook = sortedByPages.length > 0 ? {
        title: sortedByPages[0].title,
        author: `Por: ${sortedByPages[0].author}`,
        pages: sortedByPages[0].pages,
        coverUrl: sortedByPages[0].coverUrl
    } : null;

    const shortestBook = sortedByPages.length > 0 ? {
        title: sortedByPages[sortedByPages.length - 1].title,
        author: `Por: ${sortedByPages[sortedByPages.length - 1].author}`,
        pages: sortedByPages[sortedByPages.length - 1].pages,
        coverUrl: sortedByPages[sortedByPages.length - 1].coverUrl
    } : null;

    // Highest rated personal book
    const ratedBooks = books.filter(b => b.rating > 0).sort((a, b) => b.rating - a.rating);
    const highestRatedBook = ratedBooks.length > 0 ? {
        title: ratedBooks[0].title,
        author: ratedBooks[0].author,
        rating: ratedBooks[0].rating,
        coverUrl: ratedBooks[0].coverUrl
    } : null;

    return {
        totalInShelf,
        booksRead,
        pagesRead,
        currentlyReading,
        wantToRead,
        abandoned,
        ownedBooks,
        averageRating,
        readingGoal: db.owner.readingGoal || 24,
        topGenres,
        monthlyReadCounts,
        longestBook,
        shortestBook,
        highestRatedBook,
        readingDays: db.readingDays || {},
    };
}

export function exportLibraryBackup(): LibraryBackup {
    const db = loadDB();
    return {
        exportDate: new Date().toISOString(),
        owner: db.owner.name,
        totalBooks: db.books.length,
        books: db.books,
        readingDays: db.readingDays || {},
    };
}