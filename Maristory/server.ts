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
} from './server/db.ts';
import { UserRole } from './src/types.ts';

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

    // Serve static assents from public/
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

    //Admin Only Middleware
    const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if(req.userRole != 'ADMIN') {
            return res.status(403).json({ error: 'Acesso restrito ao Administrador do Maristory.' });
        }
        next();
    };

    // --- API ROUTES ---

    // Health check
}