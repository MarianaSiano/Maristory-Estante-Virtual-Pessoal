import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
    authenticateUser,
    createUser,
    findUserById,
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    getUserBookshelf,
    upsertBookshelfItem,
    removeFromBookshelf,
    getUserReadingStats,
    getAdminGlobalStats,
    updateUserProfile,
    resetPasswordByEmail,
    verifyToken
} from './server/db.js';
import { UserRole } from './src/types.js';

// Express Request Extension for Auth User
interface AuthenticatedRequest extends Request {
    userId?: string;
    userRole?: UserRole;
}

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Serve static assets from public/
    app.use(express.static(path.join(process.cwd(), 'public')));

    // Authentication Middleware
    const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Acesso não autorizado. Faça login para continuar.' });
        }
        const token = authHeader.split(' ')[1];
        const userId = verifyToken(token);
        if(!userId) {
            return res.status(401).json({ error: 'Sessão expirada ou inválida. Por favor, faça login novamente.' });
        }

        const user = findUserById(userId);
        if(!user) {
            return res.status(401).json({ error: 'Usuário não encontrado.' });
        }

        req.userId = user.id;
        req.userRole = user.role;
        next();
    };

    // Admin Only Middleware
    const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if(req.userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Acesso restrito ao Administrador do Maristory.' });
        }
        next();
    };

    // --- API ROUTES ---

    // Health check
    app.get('/api/health', (req: Request, res: Response) => {
        res.json({ status: 'ok', system: 'Maristory Virtual Bookshelf API', time: new Date().toISOString() });
    });

    // Auth: Register
    app.post('/api/auth/register', (req: Request, res: Response) => {
        try {
            const { name, email, password } = req.body;
            if(!name || !email || !password) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios (Nome, E-mail e Senha).' });
            }
            if(password.length < 8) {
                return res.status(400).json({ error: 'A senha deve conter no mínimo 8 caracteres.' });
            }

            const user = createUser(name, email, password);
            const auth = authenticateUser(email, password);
            return res.status(201).json(auth);
        } catch (err: any) {
            return res.status(400).json({ error: err.message || 'Erro ao registrar usuário.' });
        }
    });

    // Auth: Forgot Password / Reset
    app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
        try {
            const { email, newPassword } = req.body;
            if(!email) {
                return res.status(400).json({ error: 'Informe o e-mail cadastrado.' });
            }

            const result = resetPasswordByEmail(email, newPassword);
            return res.json(result);
        } catch (err: any) {
            return res.status(400).json({ error: err.message || 'Erro ao redefinir a senha.' });
        }
    });

    // Auth: Login
    app.post('/api/auth/login', (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            if(!email || !password) {
                return res.status(400).json({ error: 'Informe o e-mail e a senha.' });
            }

            const auth = authenticateUser(email, password);
            return res.json(auth);
        } catch (err: any) {
            return res.status(401).json({ error: err.message || 'E-mail ou senha incorretos.' });
        }
    });

    // Auth: Get current user profile
    app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
        const user = findUserById(req.userId!);
        if(!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        return res.json({ user });
    });

    // User: Update profile (Name, Avatar, Email, Password)
    app.put('/api/user/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
        try {
            const { name, email, avatarUrl, currentPassword, newPassword } = req.body;
            const updatedUser = updateUserProfile(req.userId!, {
                name,
                email,
                avatarUrl,
                currentPassword,
                newPassword
            });
            return res.json({ user: updatedUser, message: 'Perfil atualizado com sucesso!' });
        } catch (err: any) {
            return res.status(400).json({ error: err.message || 'Erro ao atualizar perfil.' });
        }
    });

    // Catalog: List all books (Public to authenticated users)
    app.get('/api/books', (req: Request, res: Response) => {
        const search = req.query.search as string | undefined;
        const genre = req.query.genre as string | undefined;
        const books = getAllBooks(search, genre);
        res.json(books);
    });

    // Catalog: Get book by ID
    app.get('/api/books/:id', (req: Request, res: Response) => {
        const book = getBookById(String(req.params.id));
        if(!book) {
            return res.status(404).json({ error: 'Livro não encontrado no catálogo.' });
        }
        res.json(book);
    });

    // ADMIN EXCLUSIVE: Create new book in catalog
    app.post('/api/admin/books', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
        try {
            const { title, author, publisher, publicationYear, pages, genre, synopsis, isbn, coverUrl } = req.body;

            if(!title || !author || !pages) {
                return res.status(400).json({ error: 'Campos obrigatórios: Título, Autor e Número de Páginas.' });
            }

            const newBook = createBook({
                title,
                author,
                publisher: publisher || 'Não informada',
                publicationYear: Number(publicationYear) || new Date().getFullYear(),
                pages: Number(pages) || 0,
                genre: genre || 'Geral',
                synopsis: synopsis || '',
                isbn: isbn || '',
                coverUrl: coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
                createdBy: req.userId!
            });

            res.status(201).json(newBook);
        } catch (err: any) {
            res.status(400).json({ error: err.message || 'Erro ao cadastrar livro no catálogo.' });
        }
    });

    // ADMIN EXCLUSIVE: Update book in catalog
    app.put('/api/admin/books/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
        try {
            const updated = updateBook(req.params.id as string, req.body);
            res.json(updated);
        } catch (err: any) {
            res.status(400).json({ error: err.message || 'Erro ao atualizar livro.' });
        }
    });

    // ADMIN EXCLUSIVE: Delete book from catalog
    app.delete('/api/admin/books/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
        try {
            deleteBook(req.params.id as string);
            res.json({ success: true, message: 'Livro removido do catálogo com sucesso.' });
        } catch (err: any) {
            res.status(400).json({ error: err.message || 'Erro ao deletar livro.' });
        }
    });

    // User Bookshelf: Get user bookshelf
    app.get('/api/user/bookshelf', requireAuth, (req: AuthenticatedRequest, res: Response) => {
        const shelf = getUserBookshelf(req.userId!);
        res.json(shelf);
    });

    // User Bookshelf: Upsert item in bookshelf
    app.post('/api/user/bookshelf/:bookId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
        try {
            const { bookId } = req.params;
            const item = upsertBookshelfItem(req.userId!, bookId as string, req.body);
            res.json(item);
        } catch (err: any) {
            res.status(400).json({ error: err.message || 'Erro ao atualizar estante.' });
        }
    });

    // User Bookshelf: Remove item from bookshelf
    app.delete('/api/user/bookshelf/:bookId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
        try {
            const { bookId } = req.params;
            removeFromBookshelf(req.userId!, bookId as string);
            res.json({ success: true, message: 'Livro removido da sua estante.' });
        } catch (err: any) {
            res.status(400).json({ error: err.message || 'Erro ao remover livro da estante.' });
        }
    });

    // User Bookshelf: Get stats
    app.get('/api/user/stats', requireAuth, (req: AuthenticatedRequest, res: Response) => {
        const stats = getUserReadingStats(req.userId!);
        res.json(stats);
    });

    // ADMIN EXCLUSIVE: System stats
    app.get('/api/admin/stats', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
        const stats = getAdminGlobalStats();
        res.json(stats);
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
        console.log(`✨ Maristory Server rodando na porta ${PORT}`);
    });
}

startServer();