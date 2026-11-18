import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

interface BookCoverProps {
    coverUrl?: string | null;
    title: string;
    className?: string;
    compact?: boolean;
}

export const BookCover: React.FC<BookCoverProps> = ({
    coverUrl,
    title,
    className = 'w-full h-full object-cover',
    compact = false,
}) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [coverUrl]);

    if(!coverUrl || !coverUrl.trim() || hasError) {
        return (
            <div
                className={`flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-purple-50 to-slate-100 text-purple-800 select-none p-2 text-center ${className}`}
            >
                <BookOpen className={compact ? 'w-4 h-4 text-purple-500' : 'w-8 h-8 text-purple-400 mb-1.5'} />
                {!compact && (
                    <span className="text-[11px] font-bold text-purple-900/80 line-clamp-3 leading-tight px-2">
                        {title || 'Sem capa'}
                    </span>
                )}
            </div>
        );
    }

    return (
        <img
            src={coverUrl}
            alt={title}
            className={className}
            onError={() => setHasError(true)}
        />
    );
};