export type UserRole = 'ADMIN' | 'USER';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    createdAt: string;
}

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
    createdBy: string;
    createdAt: string;
}

export type OwnershipStatus = 'TENHO' | 'NAO_TENHO';

export type ReadingStatus = 'LENDO' | 'LIDO' | 'QUERO_LER' | 'ABANDONOU';

export interface BookshelfItem {
    id: string;
    userId: string;
    bookId: string;
    book?: Book;
    ownershipStatus: OwnershipStatus;
    readingStatus: ReadingStatus;
    rating: number; // 0 to 5
    review: string;
    currentPage: number;
    startDate: string | null;
    finishDate: string | null;
    isFavorite: boolean;
    updatedAt: string;
}

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
    topGenres: { genre: string; count: number }[];
    monthlyReadCounts: number[]; // 12 months (Jan..Dez)
    longestBook: { title: string; author: string; pages: number; coverUrl: string } | null;
    shortestBook: { title: string; author: string; pages: number; coverUrl: string } | null;
    mostPopularBook: { title: string; author: string; readersCount: number; coverUrl: string } | null;
    leastPopularBook: { title: string; author: string; readersCount: number; coverUrl: string } | null;
}

export interface AdminCatalogStats {
    totalCatalogBooks: number;
    totalUsersCount: number;
    genresCount: number;
    totalShelfEntries: number;
}