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