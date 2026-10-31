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
import { error } from 'console';

interface AuthenticatedRequest extends Request {
    userId?: string;
    isOwner?: boolean;
}

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Server static assets from public/
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
            system: 'Marystory - Biblioteca Particular',
            type: 'Private Owner-Only Library',
            time: new Date().toISOString()
        });
    });

    // Auth: Login as Owner
    app.post('/api/auth/login', (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Informe o e-mail e a senha da proprietária.' })
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
            return res.status(500).json({ error: 'Erro ao autenticar proprietária.' })
        }
    });

    // Auth: Public Registration is disabled in a private library
    app.post('/api/auth/register', (req: Request, res: Response) => {
        return res.status(403).json({
            error: 'Esta é uma biblioteca particular exclusiva de sua proprietária. Cadastros externos estão desativados.'
        });
    });

    // Auth: Forgot Password/Reset
    app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            if (!email) {
                return res.status(400).json({ error: 'Informe o e-mail cadastrado da proprietária.' });
            }

            const result = resetOwnerPassword(email, password);
            return res.json(result);
        } catch (err: any) {
            return res.status(400).json({ error: err.message || 'Erro ao redefinir a senha.' });
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
}