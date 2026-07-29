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