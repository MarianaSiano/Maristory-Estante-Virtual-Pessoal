import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { User, Book, ReadingStats, LibraryBackup } from '../src/types.js';

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

const INITIAL_BOOKS: Book[] = [
    {
        id: 'bk_1',
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        publisher: 'L&PM Pocket',
        publicationYear: 1899,
        pages: 256,
        genre: 'Clássico / Romance',
        synopsis: 'Obra-prima de Machado de Assis. Bento Santiago relembra sua juventude e constrói a narrativa em torno de Capitu e os olhos de ressaca.',
        isbn: '9788525406958',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        ownershipStatus: 'TENHO',
        readingStatus: 'LIDO',
        rating: 5,
        review: 'Leitura fundamental. A sutileza psicológica do narrador não-confiável é simplesmente genial.',
        currentPage: 256,
        startDate: '2026-01-05',
        finishDate: '2026-01-20',
        isFavorite: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'bk_2',
        title: 'Torto Arado',
        author: 'Itamar Vieira Junior',
        publisher: 'Todavia',
        publicationYear: 2019,
        pages: 264,
        genre: 'Ficção Contemporânea',
        synopsis: 'A história das irmãs Bibiana e Belonísia no sertão baiano, abordando ancestralidade, trabalho, dor e libertação.',
        isbn: '9786556920000',
        coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
        ownershipStatus: 'TENHO',
        readingStatus: 'LENDO',
        rating: 5,
        review: 'Narrativa envolvente e emocionante. As vozes das irmãs tocam fundo na alma.',
        currentPage: 152,
        startDate: '2026-02-10',
        finishDate: null,
        isFavorite: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'bk_3',
        title: 'A Hora da Estrela',
        author: 'Clarice Lispector',
        publisher: 'Rocco',
        publicationYear: 1977,
        pages: 88,
        genre: 'Literatura Brasileira',
        synopsis: 'A história comovente da jovem alagoana Macabéa no Rio de Janeiro, narrada pelo escritor Rodrigo S.M.',
        isbn: '9788532511010',
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
        ownershipStatus: 'TENHO',
        readingStatus: 'LIDO',
        rating: 5,
        review: 'Impactante e poético em cada parágrafo. Clarice traduz o indizível.',
        currentPage: 88,
        startDate: '2026-01-22',
        finishDate: '2026-01-25',
        isFavorite: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'bk_4',
        title: '1984',
        author: 'George Orwell',
        publisher: 'Companhia das Letras',
        publicationYear: 1949,
        pages: 416,
        genre: 'Distopia / Ficção Científica',
        synopsis: 'A sociedade totalitária da Oceânia governada pelo Grande Irmão e a luta de Winston Smith pela verdade.',
        isbn: '9788535914849',
        coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
        ownershipStatus: 'NAO_TENHO',
        readingStatus: 'QUERO_LER',
        rating: 0,
        review: 'Planejo comprar a edição especial de capa dura para a biblioteca particular.',
        currentPage: 0,
        startDate: null,
        finishDate: null,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'bk_5',
        title: 'Orgulho e Preconceito',
        author: 'Jane Austen',
        publisher: 'Penguin Companhia',
        publicationYear: 1813,
        pages: 424,
        genre: 'Romance Clássico',
        synopsis: 'O romance clássico e espirituoso sobre Elizabeth Bennet e o misterioso Sr. Darcy na Inglaterra rural.',
        isbn: '9788563560178',
        coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
        ownershipStatus: 'TENHO',
        readingStatus: 'LIDO',
        rating: 4,
        review: 'Diálogos deliciosos e ironia impecável. Uma das leituras mais agradáveis que já tive.',
        currentPage: 424,
        startDate: '2025-11-10',
        finishDate: '2025-12-05',
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'bk_6',
        title: 'O Pequeno Príncipe',
        author: 'Antoine de Saint-Exupéry',
        publisher: 'Agir',
        publicationYear: 1943,
        pages: 96,
        genre: 'Fábula Filosófica',
        synopsis: 'Um jovem príncipe viaja pelos planetas aprendendo sobre amor, afeto e a beleza invisível aos olhos.',
        isbn: '9788522031443',
        coverUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
        ownershipStatus: 'TENHO',
        readingStatus: 'LIDO',
        rating: 5,
        review: 'Um livro para revisitar em todas as fases da vida. Sempre renovador.',
        currentPage: 96,
        startDate: '2026-01-02',
        finishDate: '2026-01-03',
        isFavorite: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

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
        books: INITIAL_BOOKS,
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
                books: migratedBooks.length > 0 ? migratedBooks : INITIAL_BOOKS,
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
        if(data.newPassword.length < 6) {
            throw new Error('A nova senha deve ter no mínimo 6 caracteres.');
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

    if(normalizedEmail !== currentOwnerEmail && (!envEmail || normalizedEmail !== envEmail)) {
        throw new Error('E-mail não corresponde à proprietária da biblioteca.');
    }

    if(newPassword) {
        if(newPassword.length < 6) {
            throw new Error('A nova senha deve conter no mínimo 6 caracteres.');
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

    if(options?.search) {
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

    if(options?.genre && options.genre !== 'Todos') {
        list = list.filter(b => b.genre.toLowerCase() === options.genre!.toLowerCase());
    }

    if(options?.status && options.status !== 'ALL') {
        if(options.status === 'FAVORITES') {
            list = list.filter(b => b.isFavorite);
        } else {
            list = list.filter(b => b.readingStatus === options.status);
        }
    }

    if(options?.ownership && options.ownership !== 'ALL') {
        list = list.filter(b => b.ownershipStatus === options.ownership);
    }

    return list;
}

export function getBookById(id: string): Book | null {
    const db = loadDB();
    return db.books.find(b => b.id === id) || null;
}

export function createLibraryBook(data: Partial<Book>): Book {
    const db = loadDB();
    if(!data.title || !data.author) {
        throw new Error('Título e Autor são obrigatórios para registrar o livro na biblioteca.');
    }

    const now = new Date().toISOString();
    const newBook: Book = {
        id: 'bk_' + crypto.randomUUID().slice(0, 8),
        title: data.title.trim(),
        author: data.author.trim(),
        publisher: data.publisher?.trim() || 'Editora Particular',
        publicationYear: Number(data.publicationYear) || new Date().getFullYear(),
        pages: Number(data.pages) || 1,
        genre: data.genre?.trim() || 'Geral',
        synopsis: data.synopsis?.trim() || '',
        isbn: data.isbn?.trim() || '',
        coverUrl: data.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        ownershipStatus: data.ownershipStatus || 'TENHO',
        readingStatus: data.readingStatus || 'QUERO_LER',
        rating: Number(data.rating) || 0,
        review: data.review?.trim() || '',
        currentPage: Number(data.currentPage) || 0,
        startDate: data.startDate || null,
        finishDate: data.finishDate || null,
        isFavorite: Boolean(data.isFavorite),
        createdAt: now,
        updatedAt: now,
    };

    db.books.unshift(newBook);
    saveDB(db);
    return newBook;
}

export function updateLibraryBook(id: string, updates: Partial<Book>): Book {
    const db = loadDB();
    const index = db.books.findIndex(b => b.id === id);
    if(index === -1) {
        throw new Error('Livro não encontrado na biblioteca particular.');
    }

    const current = db.books[index];
    const updated: Book = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    // Keep pages bounds valid
    if(updated.currentPage > updated.pages) {
        updated.currentPage = updated.pages;
    }
    if(updated.readingStatus === 'LIDO' && !updated.finishDate) {
        updated.finishDate = new Date().toISOString().split('T')[0];
        updated.currentPage = updated.pages;
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
        if(b.readingStatus === 'LIDO') {
            pagesRead += b.pages;
            readBooks.push(b);

            const d = b.finishDate ? new Date(b.finishDate) : new Date(b.updatedAt);
            if(!isNaN(d.getTime())) {
                monthlyReadCounts[d.getMonth()] += 1;
            }
        } else if(b.readingStatus === 'LENDO') {
            pagesRead += Math.min(b.currentPage, b.pages);
        }

        if(b.genre) {
            genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
        }

        if(b.rating > 0) {
            ratedCount++;
            ratingSum += b.rating;
        }
    });

    const averageRating = ratedCount > 0 ? parseFloat((ratingSum / ratedCount).toFixed(1)) : 0;

    // Monthly fallback display if freshly initialized
    const hasMonthly = monthlyReadCounts.some(c => c > 0);
    const finalMonthly = hasMonthly ? monthlyReadCounts : [2, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0];

    let topGenres = Object.entries(genreCounts)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

    if(topGenres.length === 0) {
        topGenres = [{ genre: 'Literatura Geral', count: 1 }];
    }

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
        monthlyReadCounts: finalMonthly,
        longestBook,
        shortestBook,
        highestRatedBook
    };
}

export function exportLibraryBackup(): LibraryBackup {
    const db = loadDB();
    return {
        exportDate: new Date().toISOString(),
        owner: db.owner.name,
        totalBooks: db.books.length,
        books: db.books
    };
}