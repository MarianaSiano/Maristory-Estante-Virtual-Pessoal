export type UserRole = 'ADMIN';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    readingGoal?: number;
    createAt: string;
}

export type OwnershipStatus = 'TENHO' | 'NAO_TENHO';

export type ReadingStatus = 'LENDO' | 'LIDO' | 'QUERO_LER' | 'ABANDONOU';

export interface Book {
    id: string;
    title: string;
    author: string;
    publisher: string;
    publicationYear: number;
    pages: number;
    genre: string;
    synopsis: string;
    isbn: string;
    coverUrl: string;
    ownershipStatus: OwnershipStatus;
    readingStatus: ReadingStatus;
    rating: number; // 0 to 5
    review: string; // notas particulares e impressões da proprietária
    currentPage: number;
    startDate: string | null;
    finishDate: string | null;
    isFavorite: boolean;
    createdAt: string;
    updatedAt: string;
}

export type BookshelfItem = Book;

export interface AuthResponse {
    token: string;
    user: User;
}

export interface ReadingStats {
    totalInShelf: number;
    booksRead: number;
    pagesRead: number;
    currentlyReading: number;
    wantToRead: number;
    abandoned: number;
    ownedBooks: number;
    averageRating: number;
    readingGoal: number;
    topGenres: { genre: string; count: number }[];
    monthlyReadCounts: number[]; // 12 months (Jan..Dez)
    longestBook: { title: string; author: string; pages: number; coverUrl: string } | null;
    shortestBook: { title: string; author: string; pages: number; coverUrl: string } | null;
    highestRatedBook: { title: string; author: string; rating: number; coverUrl: string } | null;
}

export interface LibraryBackup {
    exportDate: string;
    owner: string;
    totalBooks: number;
    books: Book[];
}