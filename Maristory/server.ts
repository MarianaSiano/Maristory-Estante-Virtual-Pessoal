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
    const app = express()
    const PORT = 3000;

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Serve static assets from public/
    app.use(express.static(path.join(process.cwd(), 'public')));

    // Owner Authentication Middleware
    const requireOwnerAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Acesso restrito à proprietária. Faça login para continuar.' });
        }
        const token = authHeader.split(' ')[1];
        const userId = verifyToken(token);

        if (!userId) {
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
            system: 'Maristory - Biblioteca Particular',
            type: 'Private Owner-Only Library',
            time: new Date().toISOString()
        });
    });

    // Auth: Login as Owner
    app.post('/api/auth/login', (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Informe o e-mail e a senha da proprietária.' });
            }

            const auth = authenticateOwner(email, password);
            return res.json(auth);
        } catch (err: any) {
            return res.status(401).json({ error: err.message || 'Credenciais inválidas.' });
        }
    });

    // Auth: Quick Owner Direct Access (Single-owner private mode convenience)
    app.post('/api/auth/owner-acess', (req: Request, res: Response) => {
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
            if (!email) {
                return res.status(400).json({ error: 'Informe o e-mail cadastrado da proprietária.' });
            }

            const result = resetOwnerPassword(email, newPassword);
            return res.json(result);
        } catch (err: any) {
            res.status(400).json({ error: err.message || 'Erro ao redefinir a senha.' });
        }
    });

    // Auth: Get current owner profile
    app.get('/api/auth/me', (req: AuthenticatedRequest, res: Response) => {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const valid = verifyToken(token);
            if (valid) {
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

    // Books: Get single book by ID
    app.get('/api/books/:id', (req: Request, res: Response) => {
        const book = getBookById(req.params.id as string);
        if (!book) {
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
            res.status(400).json({ error: err.message || 'Erro ao remover livro' });
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
    if (process.env.NODE_ENV !== 'production') {
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