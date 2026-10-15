import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { User, Book, ReadingStats, LibraryBackup } from '../src/types';

interface AuthenticatedRequest extends Request {
    userId?: string;
    isOwner?: boolean;
}

interface DBData {
    owner: User & { passwordHash: string };
    books: Book[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'maristory-db.json');