import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
    authenticateOwner,
    getOwnerUser,
    generateToken,
    verifyToken,
    updateOwnerProfile,
    resetOwnerPassword,
    getLibraryBooks,
    getBookById,
    createLibraryBook,
    updateLibraryBook,
    deleteLibraryBook,
    getReadingStats,
    exportLibraryBackup
} from './server/db.js';

interface AuthenticatedRequest extends Request {
    userId?: string;
    isOwner?: boolean;
}

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Serve static assets from public/
    app.use(express.static(path.join(process.cwd(), 'public')));

    // Owner Authentication Middleware
    const requireOwnerAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Acesso restrito à proprietária. Faça login para continuar.' });
        }
        const token = authHeader.split(' ')[1];
        const userId = verifyToken(token);
        if(!userId) {
            return res.status(401).json({ error: 'Sessão expirada. Por favor, acesse novamente como proprietária.' });
        }

        req.userId = userId;
        req.isOwner = true;
        next();
    };

    // --- API ROUTES ---

    // Health check
    app.get('/api/health', (req: Request, res: Response) => {
        res.json({
            status: 'ok',
            system: 'Maristory — Biblioteca Particular',
            type: 'Private Owner-Only Library',
            time: new Date().toISOString()
        });
    });

    // Auth: Login as Owner
    app.post('/api/auth/login', (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            if(!email || !password) {
                return res.status(400).json({ error: 'Informe o e-mail e a senha da proprietária.' });
            }

            const auth = authenticateOwner(email, password);
            return res.json(auth);
        } catch (err: any) {
            return res.status(401).json({ error: err.message || 'Credenciais inválidas.' });
        }
    });

    // Auth: Quick Owner Direct Access (Single-owner private mode convenience)
    app.post('/api/auth/owner-access', (req: Request, res: Response) => {
        try {
            const owner = getOwnerUser();
            const token = generateToken(owner.id);
            return res.json({ user: owner, token });
        } catch (err: any) {
            return res.status(500).json({ error: 'Erro ao autenticar proprietária.' });
        }
    });

    // Auth: Public Registration is disabled in a private library
    app.post('/api/auth/register', (req: Request, res: Response) => {
        return res.status(403).json({
            error: 'Esta é uma biblioteca particular exclusiva de sua proprietária. Cadastros externos estão desativados.'
        });
    });

    // Auth: Forgot Password / Reset
    app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
        try {
            const { email, newPassword } = req.body;
            if(!email) {
                return res.status(400).json({ error: 'Informe o e-mail cadastrado da proprietária.' });
            }

            const result = resetOwnerPassword(email, newPassword);
            return res.json(result);
        } catch (err: any) {
            return res.status(400).json({ error: err.message || 'Erro ao redefinir a senha.' });
        }
    });

    // Auth: Get current owner profile
    app.get('/api/auth/me', (req: AuthenticatedRequest, res: Response) => {
        const authHeader = req.headers.authorization;
        if(authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const valid = verifyToken(token);
            if(valid) {
                const owner = getOwnerUser();
                return res.json({ user: owner });
            }
        }
        // Return default owner info
        const owner = getOwnerUser();
        return res.json({ user: owner });
    });

    // Owner: Update profile & reading goals
    app.put('/api/user/profile', requireOwnerAuth, (req: AuthenticatedRequest, res: Response) => {
        try {
            const updatedUser = updateOwnerProfile(req.body);
            return res.json({ user: updatedUser, message: 'Perfil da proprietária atualizado com sucesso!' });
        } catch (err: any) {
            return res.status(400).json({ error: err.message || 'Erro ao atualizar perfil.' });
        }
    });

    // Books: List all books in the private library
    app.get('/api/books', (req: Request, res: Response) => {
        const search = req.query.search as string | undefined;
        const genre = req.query.genre as string | undefined;
        const status = req.query.status as string | undefined;
        const ownership = req.query.ownership as string | undefined;
        const books = getLibraryBooks({ search, genre, status, ownership });
        res.json(books);
    });

    // Books: Lookup edition cover and metadata by ISBN
    app.get('/api/books/isbn/:isbn', async (req: Request, res: Response) => {
        const rawIsbn = Array.isArray(req.params.isbn) ? req.params.isbn[0] : req.params.isbn;
        const cleanIsbn = String(rawIsbn || '').replace(/[^0-9Xx]/g, '').toUpperCase();
        if(cleanIsbn.length !== 10 && cleanIsbn.length !== 13) {
            return res.status(400).json({ error: 'ISBN inválido. Informe 10 ou 13 dígitos.' });
        }

        const isbn13To10 = (isbn13: string): string | null => {
            if(isbn13.length !== 13 || !isbn13.startsWith('978')) return null;
            const body = isbn13.slice(3, 12);
            let sum = 0;
            for (let i = 0; i < 9; i++) {
                sum += parseInt(body[i], 10) * (10 - i);
            }
            const rem = 11 - (sum % 11);
            const check = rem === 10 ? 'X' : rem === 11 ? '0' : String(rem);
            return body + check;
        };

        const isbn10 = cleanIsbn.length === 13 ? isbn13To10(cleanIsbn) : cleanIsbn;

        const sanitizeCoverUrl = (url?: string | null): string | null => {
            if(!url || typeof url !== 'string') return null;
            const trimmed = url.trim();
            if(!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return null;
            return trimmed.replace(/^http:\/\//i, 'https://').replace(/&edge=curl/gi, '');
        };

        const checkOpenLibraryCover = async (code: string): Promise<string | null> => {
            const url = `https://covers.openlibrary.org/b/isbn/${code}-L.jpg?default=false`;
            try {
                const resp = await fetch(url, {
                    method: 'HEAD',
                    redirect: 'manual',
                    signal: AbortSignal.timeout(4000),
                });
                if(resp.status === 200 || (resp.status >= 300 && resp.status < 400 && resp.headers.get('location'))) {
                    return `https://covers.openlibrary.org/b/isbn/${code}-L.jpg`;
                }
            } catch {
                // Ignore timeout/network errors
            }
            return null;
        };

        const fetchBrasilApi = async () => {
            try {
                const resp = await fetch(`https://brasilapi.com.br/api/isbn/v1/${cleanIsbn}`, {
                    signal: AbortSignal.timeout(4500),
                });
                if(!resp.ok) return null;
                return await resp.json();
            } catch {
                return null;
            }
        };

        const fetchOpenLibraryData = async () => {
            try {
                const resp = await fetch(
                    `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`,
                    { signal: AbortSignal.timeout(4500) }
                );
                if(!resp.ok) return null;
                const json = await resp.json();
                return json[`ISBN:${cleanIsbn}`] || null;
            } catch {
                return null;
            }
        };

        const fetchGoogleBooks = async () => {
            try {
                const resp = await fetch(
                    `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`,
                    { signal: AbortSignal.timeout(4500) }
                );
                if(!resp.ok) return null;
                const json = await resp.json();
                return json.items?.[0]?.volumeInfo || null;
            } catch {
                return null;
            }
        };

        try {
            const [brasilData, olData, googleData, olCover13, olCover10] = await Promise.all([
                fetchBrasilApi(),
                fetchOpenLibraryData(),
                fetchGoogleBooks(),
                checkOpenLibraryCover(cleanIsbn),
                isbn10 && isbn10 !== cleanIsbn ? checkOpenLibraryCover(isbn10) : Promise.resolve(null),
            ]);

            const googleCover = sanitizeCoverUrl(
                googleData?.imageLinks?.extraLarge ||
                googleData?.imageLinks?.large ||
                googleData?.imageLinks?.medium ||
                googleData?.imageLinks?.small ||
                googleData?.imageLinks?.thumbnail ||
                googleData?.imageLinks?.smallThumbnail
            );

            const brasilCover = sanitizeCoverUrl(brasilData?.cover_url);
            const olDataCover = sanitizeCoverUrl(
                olData?.cover?.large || olData?.cover?.medium || olData?.cover?.small
            );

            const coverUrl = brasilCover || googleCover || olDataCover || olCover13 || olCover10 || null;

            const parseYear = (val: unknown): number | undefined => {
                if(!val) return undefined;
                const match = String(val).match(/\d{4}/);
                return match ? Number(match[0]) : undefined;
            };

            const title = brasilData?.title || googleData?.title || olData?.title || undefined;
            const author =
                (Array.isArray(brasilData?.authors) && brasilData.authors.length > 0
                    ? brasilData.authors[0]
                    : undefined) ||
                (Array.isArray(googleData?.authors) && googleData.authors.length > 0
                    ? googleData.authors.join(', ')
                    : undefined) ||
                (Array.isArray(olData?.authors) && olData.authors.length > 0
                    ? olData.authors.map((a: any) => a.name).join(', ')
                    : undefined);
            const publisher =
                brasilData?.publisher ||
                googleData?.publisher ||
                (Array.isArray(olData?.publishers) && olData.publishers[0]?.name) ||
                undefined;
            const publicationYear =
                (brasilData?.year ? Number(brasilData.year) : undefined) ||
                parseYear(googleData?.publishedDate) ||
                parseYear(olData?.publish_date);
            const pages =
                (brasilData?.page_count ? Number(brasilData.page_count) : undefined) ||
                (googleData?.pageCount ? Number(googleData.pageCount) : undefined) ||
                (olData?.number_of_pages ? Number(olData.number_of_pages) : undefined);
            const genre =
                (Array.isArray(brasilData?.subjects) && brasilData.subjects[0]) ||
                (Array.isArray(googleData?.categories) && googleData.categories[0]) ||
                undefined;
            const synopsis = brasilData?.synopsis || googleData?.description || undefined;

            const source = brasilCover
                ? 'BrasilAPI'
                : googleCover
                    ? 'Google Books'
                    : olDataCover || olCover13 || olCover10
                        ? 'Open Library'
                        : brasilData || olData || googleData
                            ? 'Metadata'
                            : undefined;

            return res.json({
                isbn: cleanIsbn,
                coverUrl,
                title,
                author,
                publisher,
                publicationYear,
                pages,
                genre,
                synopsis,
                source,
            });
        } catch {
            return res.json({ isbn: cleanIsbn, coverUrl: null });
        }
    });

    // Books: Get single book by ID
    app.get('/api/books/:id', (req: Request, res: Response) => {
        const book = getBookById(req.params.id as string);
        if(!book) {
            return res.status(404).json({ error: 'Livro não encontrado na biblioteca.' });
        }
        res.json(book);
    });

    // Books: Add new book to the private library
    app.post('/api/books', requireOwnerAuth, (req: AuthenticatedRequest, res: Response) => {
        try {
            const newBook = createLibraryBook(req.body);
            res.status(201).json(newBook);
        } catch (err: any) {
            res.status(400).json({ error: err.message || 'Erro ao adicionar livro à biblioteca.' });
        }
    });

    // Books: Update book or reading progress in the private library
    app.put('/api/books/:id', requireOwnerAuth, (req: AuthenticatedRequest, res: Response) => {
        try {
            const updated = updateLibraryBook(req.params.id as string, req.body);
            res.json(updated);
        } catch (err: any) {
            res.status(400).json({ error: err.message || 'Erro ao atualizar livro.' });
        }
    });

    // Books: Delete book from the private library
    app.delete('/api/books/:id', requireOwnerAuth, (req: AuthenticatedRequest, res: Response) => {
        try {
            deleteLibraryBook(req.params.id as string);
            res.json({ success: true, message: 'Livro removido da biblioteca particular com sucesso.' });
        } catch (err: any) {
            res.status(400).json({ error: err.message || 'Erro ao remover livro.' });
        }
    });

    // Aliases for user bookshelf (points directly to the private library)
    app.get('/api/user/bookshelf', (req: Request, res: Response) => {
        const books = getLibraryBooks();
        res.json(books);
    });

    app.post('/api/user/bookshelf/:bookId', requireOwnerAuth, (req: AuthenticatedRequest, res: Response) => {
        try {
            const updated = updateLibraryBook(req.params.bookId as string, req.body);
            res.json(updated);
        } catch (err: any) {
            res.status(400).json({ error: err.message || 'Erro ao atualizar livro na estante.' });
        }
    });

    app.delete('/api/user/bookshelf/:bookId', requireOwnerAuth, (req: AuthenticatedRequest, res: Response) => {
        try {
            deleteLibraryBook(req.params.bookId as string);
            res.json({ success: true, message: 'Livro removido da estante particular.' });
        } catch (err: any) {
            res.status(400).json({ error: err.message || 'Erro ao remover livro.' });
        }
    });

    // Reading Stats of the Proprietor
    app.get('/api/user/stats', (req: Request, res: Response) => {
        const stats = getReadingStats();
        res.json(stats);
    });

    // Backup Export
    app.get('/api/library/backup', requireOwnerAuth, (req: AuthenticatedRequest, res: Response) => {
        const backup = exportLibraryBackup();
        res.json(backup);
    });

    // --- VITE / SERVING FRONTEND ---
    if(process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req: Request, res: Response) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`✨ Maristory — Biblioteca Particular rodando na porta ${PORT}`);
    });
}

startServer();