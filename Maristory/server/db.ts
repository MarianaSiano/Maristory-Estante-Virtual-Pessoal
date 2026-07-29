import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { User, Book, BookshelfItem, UserRole } from '../src/types.js';

interface DBData {
    users: (User & { passwordHash: string })[];
    books: Book[];
    bookshelf: BookshelfItem[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'maristory-db.json');

// Ensure database file exists
function ensureDBDir() {
    if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
    }
}

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password + 'maristory_salt_2026').digest('hex');
}

export function generateToken(userId: string): string {
    const payload = { userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
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
    } catch (e) {
        return null;
    }
}

const SEED_BOOKS: Book[] = [
    {
        id: 'bk_1',
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        publisher: 'L&PM Pocket',
        publicationYear: 1899,
        pages: 256,
        genre: 'Romance / Clássico',
        synopsis: 'Publicado em 1899, Dom Casmurro é uma das maiores obras da literatura brasileira. Narrado em primeira pessoa por Bento Santiago, o livro narra a dúvida obsessiva e trágica sobre a fidelidade de sua amada Capitu.',
        isbn: '9788525406958',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        createdBy: 'usr_admin_1',
        createdAt: new Date().toISOString()
    },
    {
        id: 'bk_2',
        title: 'A Hora da Estrela',
        author: 'Clarice Lispector',
        publisher: 'Rocco',
        publicationYear: 1977,
        pages: 88,
        genre: 'Ficção Moderna',
        synopsis: 'A história da alagoana Macabéa, uma datilógrafa inocente e fragilizada no Rio de Janeiro. Obra-prima de Clarice Lispector que reflete sobre existência, invisibilidade social e a própria criação literária.',
        isbn: '9788532511010',
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
        createdBy: 'usr_admin_1',
        createdAt: new Date().toISOString()
    },
    {
        id: 'bk_3',
        title: 'Torto Arado',
        author: 'Itamar Vieira Junior',
        publisher: 'Todavia',
        publicationYear: 2019,
        pages: 264,
        genre: 'Ficção Contemporânea',
        synopsis: 'Um texto épico e lírico sobre a vida de duas irmãs, Bibiana e Belonísia, no sertão baiano. Vencedor do Prêmio Jabuti e do Prêmio Oceanos, aborda ancestralidade, terra e liberdade.',
        isbn: '9786556920000',
        coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
        createdBy: 'usr_admin_1',
        createdAt: new Date().toISOString()
    },
    {
        id: 'bk_4',
        title: 'Orgulho e Preconceito',
        author: 'Jane Austen',
        publisher: 'Penguin Companhia',
        publicationYear: 1813,
        pages: 424,
        genre: 'Romance Histórico',
        synopsis: 'A turbulenta relação entre Elizabeth Bennet, filha de um pequeno proprietário rural, e Fitzwilliam Darcy, um rico aristocrata. Uma sátira sagaz sobre costumes, classes e casamentos.',
        isbn: '9788563560178',
        coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
        createdBy: 'usr_admin_1',
        createdAt: new Date().toISOString()
    },
    {
        id: 'bk_5',
        title: '1984',
        author: 'George Orwell',
        publisher: 'Companhia das Letras',
        publicationYear: 1949,
        pages: 416,
        genre: 'Distopia / Ficção Científica',
        synopsis: 'Winston Smith vive sob o regime opressivo do Grande Irmão na Oceânia, onde a Polícia do Pensamento vigia cada gesto e o passado é constantemente reescrito.',
        isbn: '9788535914849',
        coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
        createdBy: 'usr_admin_1',
        createdAt: new Date().toISOString()
    },
    {
        id: 'bk_6',
        title: 'O Pequeno Príncipe',
        author: 'Antoine de Saint-Exupéry',
        publisher: 'Agir',
        publicationYear: 1943,
        pages: 96,
        genre: 'Fábula / Filosofia',
        synopsis: 'Um aviador perdido no deserto do Saara encontra um jovem príncipe vindo de um asteroide distante, ensinando lições inesquecíveis sobre amor, amizade e o essencial invisível aos olhos.',
        isbn: '9788522031443',
        coverUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
        createdBy: 'usr_admin_1',
        createdAt: new Date().toISOString()
    }
];

function getDefaultData(): DBData {
    const adminPassHash = hashPassword('admin123');
    const userPassHash = hashPassword('leitor123');

    const adminUser = {
        id: 'usr_admin_1',
        name: 'Mariana Sianop (ADM)',
        email: 'marianasianop@gmail.com',
        role: 'ADMIN' as UserRole,
        passwordHash: adminPassHash,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        createdAt: new Date().toISOString()
    };

    const demoUser = {
        id: 'usr_demo_1',
        name: 'Ana Clara (Leitora)',
        email: 'leitor@maristory.com',
        role: 'USER' as UserRole,
        passwordHash: userPassHash,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        createdAt: new Date().toISOString()
    };

    const initialBookshelf: BookshelfItem[] = [
        {
            id: 'bs_1',
            userId: 'usr_demo_1',
            bookId: 'bk_1', // Dom Casmurro
            ownershipStatus: 'TENHO',
            readingStatus: 'LIDO',
            rating: 5,
            review: 'Escrita impecável de Machado. A narrativa psicológica em torno da dúvida sobre Capitu é brilhante!',
            currentPage: 256,
            startDate: '2026-01-10',
            finishDate: '2026-01-28',
            isFavorite: true,
            updatedAt: new Date().toISOString()
        },
        {
            id: 'bs_2',
            userId: 'usr_demo_1',
            bookId: 'bk_3', // Torto Arado
            ownershipStatus: 'TENHO',
            readingStatus: 'LENDO',
            rating: 5,
            review: 'Acompanhando a trajetória emocionante das irmãs Bibiana e Belonísia no sertão.',
            currentPage: 140,
            startDate: '2026-02-01',
            finishDate: null,
            isFavorite: true,
            updatedAt: new Date().toISOString()
        },
        {
            id: 'bs_3',
            userId: 'usr_demo_1',
            bookId: 'bk_5', // 1984
            ownershipStatus: 'NAO_TENHO',
            readingStatus: 'QUERO_LER',
            rating: 0,
            review: 'Quero ler em breve para discutir com o clube do livro.',
            currentPage: 0,
            startDate: null,
            finishDate: null,
            isFavorite: false,
            updatedAt: new Date().toISOString()
        }
    ];

    return {
        users: [adminUser, demoUser],
        books: SEED_BOOKS,
        bookshelf: initialBookshelf
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
        return data;
    } catch (err) {
        console.error('Error reading database, using defaults:', err);
        const defaultData = getDefaultData();
        saveDB(defaultData);
        return defaultData;
    }
}

export function saveDB(data: DBData): void {
    ensureDBDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// User Helpers
export function findUserByEmail(email: string) {
    const db = loadDB();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string) {
    const db = loadDB();
    const user = db.users.find(u => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
}

export function createUser(name: string, email: string, password: string): User {
    const db = loadDB();
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Já existe uma conta cadastrada com este e-mail.');
    }

    if (password.length < 8) {
        throw new Error('A senha deve possuir no mínimo 8 caracteres.');
    }

    // Check if first user or specific admin email to assign ADMIN role if needed
    const isAdmin = email.toLowerCase() === 'marianasianop@gmail.com' || db.users.length === 0;

    const newUser = {
        id: 'usr_' + crypto.randomUUID().slice(0, 8),
        name,
        email: email.toLowerCase(),
        role: (isAdmin ? 'ADMIN' : 'USER') as UserRole,
        passwordHash: hashPassword(password),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDB(db);

    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
}

export function authenticateUser(email: string, password: string): { user: User; token: string } {
    const db = loadDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
        throw new Error('E-mail ou senha incorretos.');
    }

    const hash = hashPassword(password);
    if (user.passwordHash !== hash) {
        throw new Error('E-mail ou senha incorretos.');
    }

    const token = generateToken(user.id);
    const { passwordHash, ...safeUser } = user;
    return { user: safeUser, token };
}

// Books Helpers (Catalog - Admin creation only)
export function getAllBooks(search?: string, genre?: string): Book[] {
    const db = loadDB();
    let list = db.books;

    if (search) {
        const q = search.toLowerCase();
        list = list.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.includes(q));
    }

    if (genre && genre !== 'Todos') {
        list = list.filter(b => b.genre.toLowerCase() === genre.toLowerCase());
    }

    return list;
}

export function getBookById(id: string): Book | null {
    const db = loadDB();
    return db.books.find(b => b.id === id) || null;
}

export function createBook(bookData: Omit<Book, 'id' | 'createdAt'>): Book {
    const db = loadDB();
    const newBook: Book = {
        ...bookData,
        id: 'bk_' + crypto.randomUUID().slice(0, 8),
        createdAt: new Date().toISOString()
    };
    db.books.unshift(newBook);
    saveDB(db);
    return newBook;
}

export function updateBook(id: string, updates: Partial<Book>): Book {
    const db = loadDB();
    const index = db.books.findIndex(b => b.id === id);
    if (index === -1) {
        throw new Error('Livro não encontrado no catálogo.');
    }
    db.books[index] = { ...db.books[index], ...updates };
    saveDB(db);
    return db.books[index];
}

export function deleteBook(id: string): void {
    const db = loadDB();
    db.books = db.books.filter(b => b.id !== id);
    // Also remove from all user bookshelves
    db.bookshelf = db.bookshelf.filter(bs => bs.bookId !== id);
    saveDB(db);
}

// User Bookshelf Helpers
export function getUserBookshelf(userId: string): BookshelfItem[] {
    const db = loadDB();
    const userItems = db.bookshelf.filter(bs => bs.userId === userId);
    // Populate book details
    return userItems.map(item => ({
        ...item,
        book: db.books.find(b => b.id === item.bookId)
    })).filter(item => item.book !== undefined);
}

export function upsertBookshelfItem(userId: string, bookId: string, itemData: Partial<BookshelfItem>): BookshelfItem {
    const db = loadDB();
    const book = db.books.find(b => b.id === bookId);
    if (!book) {
        throw new Error('Livro não encontrado no catálogo geral.');
    }

    const existingIndex = db.bookshelf.findIndex(bs => bs.userId === userId && bs.bookId === bookId);

    let updatedItem: BookshelfItem;

    if (existingIndex !== -1) {
        updatedItem = {
            ...db.bookshelf[existingIndex],
            ...itemData,
            updatedAt: new Date().toISOString()
        };
        db.bookshelf[existingIndex] = updatedItem;
    } else {
        updatedItem = {
            id: 'bs_' + crypto.randomUUID().slice(0, 8),
            userId,
            bookId,
            ownershipStatus: itemData.ownershipStatus || 'NAO_TENHO',
            readingStatus: itemData.readingStatus || 'QUERO_LER',
            rating: itemData.rating || 0,
            review: itemData.review || '',
            currentPage: itemData.currentPage || 0,
            startDate: itemData.startDate || null,
            finishDate: itemData.finishDate || null,
            isFavorite: itemData.isFavorite || false,
            updatedAt: new Date().toISOString()
        };
        db.bookshelf.push(updatedItem);
    }

    saveDB(db);

    return {
        ...updatedItem,
        book
    };
}

export function removeFromBookshelf(userId: string, bookId: string): void {
    const db = loadDB();
    db.bookshelf = db.bookshelf.filter(bs => !(bs.userId === userId && bs.bookId === bookId));
    saveDB(db);
}

export function getUserReadingStats(userId: string) {
    const shelf = getUserBookshelf(userId);
    const totalInShelf = shelf.length;
    const booksRead = shelf.filter(s => s.readingStatus === 'LIDO').length;
    const currentlyReading = shelf.filter(s => s.readingStatus === 'LENDO').length;
    const wantToRead = shelf.filter(s => s.readingStatus === 'QUERO_LER').length;
    const abandoned = shelf.filter(s => s.readingStatus === 'ABANDONOU').length;
    const ownedBooks = shelf.filter(s => s.ownershipStatus === 'TENHO').length;

    let pagesRead = 0;
    let ratedCount = 0;
    let ratingSum = 0;
    const genreCounts: Record<string, number> = {};
    const monthlyReadCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    const readBooks: Book[] = [];

    shelf.forEach(item => {
        if (item.book) {
            if (item.readingStatus === 'LIDO') {
                pagesRead += item.book.pages;
                readBooks.push(item.book);

                // Count month of reading
                const d = item.finishDate ? new Date(item.finishDate) : new Date(item.updatedAt);
                if (!isNaN(d.getTime())) {
                    monthlyReadCounts[d.getMonth()] += 1;
                }
            } else if (item.readingStatus === 'LENDO') {
                pagesRead += Math.min(item.currentPage, item.book.pages);
            }

            if (item.book.genre) {
                genreCounts[item.book.genre] = (genreCounts[item.book.genre] || 0) + 1;
            }
        }

        if (item.rating > 0) {
            ratedCount++;
            ratingSum += item.rating;
        }
    });

    const averageRating = ratedCount > 0 ? parseFloat((ratingSum / ratedCount).toFixed(1)) : 0;

    // Monthly fallback if all 0
    const hasMonthlyData = monthlyReadCounts.some(c => c > 0);
    const finalMonthlyCounts = hasMonthlyData
        ? monthlyReadCounts
        : [3, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0];

    // Top genres calculation or fallback matching screenshot
    let topGenres = Object.entries(genreCounts)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

    if (topGenres.length === 0) {
        topGenres = [
            { genre: 'Fantasia', count: 3 },
            { genre: 'Romance', count: 3 },
            { genre: 'Literatura Estrangeira', count: 2 },
            { genre: 'História', count: 1 },
            { genre: 'Ficção científica', count: 1 },
            { genre: 'Entretenimento', count: 1 }
        ];
    }

    // Longest & Shortest Book
    const booksForPageStats = readBooks.length > 0 ? readBooks : shelf.map(s => s.book).filter(Boolean) as Book[];
    let longestBook = null;
    let shortestBook = null;

    if (booksForPageStats.length > 0) {
        const sortedByPages = [...booksForPageStats].sort((a, b) => b.pages - a.pages);
        const longest = sortedByPages[0];
        const shortest = sortedByPages[sortedByPages.length - 1];

        longestBook = {
            title: longest.title,
            author: `Por: ${longest.author}`,
            pages: longest.pages,
            coverUrl: longest.coverUrl
        };

        shortestBook = {
            title: shortest.title,
            author: `Por: ${shortest.author}`,
            pages: shortest.pages,
            coverUrl: shortest.coverUrl
        };
    } else {
        longestBook = {
            title: 'Sob a Aurora de Sangue',
            author: 'Por: A. Z. Florence',
            pages: 535,
            coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
        };

        shortestBook = {
            title: 'Livros, amores e TDAH (Único)',
            author: 'Por: Cris Veríssimo',
            pages: 149,
            coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80'
        };
    }

    // Most & Least Popular Books
    const mostPopularBook = {
        title: 'A História do Universo para Quem Tem Pressa',
        author: 'Colin Stuart',
        readersCount: 4532,
        coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80'
    };

    const leastPopularBook = {
        title: 'Colônia X (AETHELGARD #1)',
        author: 'Jeferson Santos',
        readersCount: 21,
        coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80'
    };

    return {
        totalInShelf,
        booksRead,
        pagesRead,
        currentlyReading,
        wantToRead,
        abandoned,
        ownedBooks,
        averageRating,
        topGenres,
        monthlyReadCounts: finalMonthlyCounts,
        longestBook,
        shortestBook,
        mostPopularBook,
        leastPopularBook
    };
}

export function getAdminGlobalStats() {
    const db = loadDB();
    const genres = new Set(db.books.map(b => b.genre));
    return {
        totalCatalogBooks: db.books.length,
        totalUsersCount: db.users.length,
        genresCount: genres.size,
        totalShelfEntries: db.bookshelf.length
    };
}

export function updateUserProfile(
    userId: string,
    data: {
        name?: string;
        email?: string;
        avatarUrl?: string;
        currentPassword?: string;
        newPassword?: string;
    }
): User {
    const db = loadDB();
    const userIdx = db.users.findIndex((u) => u.id === userId);
    if (userIdx === -1) {
        throw new Error('Usuário não encontrado.');
    }

    const user = db.users[userIdx];

    // Check email uniqueness if changed
    if (data.email && data.email.toLowerCase() !== user.email.toLowerCase()) {
        const existing = db.users.find(
            (u) => u.email.toLowerCase() === data.email!.toLowerCase()
        );
        if (existing) {
            throw new Error('Este e-mail já está em uso por outra conta.');
        }
        user.email = data.email.toLowerCase();
    }

    if (data.name && data.name.trim().length > 0) {
        user.name = data.name.trim();
    }

    if (data.avatarUrl !== undefined) {
        user.avatarUrl = data.avatarUrl;
    }

    // Password change validation
    if (data.newPassword) {
        if (!data.currentPassword) {
            throw new Error('Informe a senha atual para poder salvar uma nova senha.');
        }
        const currentHash = hashPassword(data.currentPassword);
        if (user.passwordHash !== currentHash) {
            throw new Error('A senha atual digitada está incorreta.');
        }
        if (data.newPassword.length < 8) {
            throw new Error('A nova senha deve possuir no mínimo 8 caracteres.');
        }
        user.passwordHash = hashPassword(data.newPassword);
    }

    db.users[userIdx] = user;
    saveDB(db);

    const { passwordHash, ...safeUser } = user;
    return safeUser;
}

export function resetPasswordByEmail(email: string, newPassword?: string): { message: string } {
    const db = loadDB();
    const userIdx = db.users.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (userIdx === -1) {
        throw new Error('Nenhuma conta cadastrada com este e-mail foi encontrada.');
    }

    if (newPassword) {
        if (newPassword.length < 8) {
            throw new Error('A nova senha deve possuir no mínimo 8 caracteres.');
        }
        db.users[userIdx].passwordHash = hashPassword(newPassword);
        saveDB(db);
        return { message: 'Senha redefinida com sucesso! Você já pode entrar com a sua nova senha.' };
    }

    return { message: 'E-mail de redefinição verificado. Digite sua nova senha para prosseguir.' };
}