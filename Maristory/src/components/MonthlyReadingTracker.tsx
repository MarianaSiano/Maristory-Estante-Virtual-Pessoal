import React, { useState } from 'react';
import { ReadingDayEntry } from '../types';
import { getMonthCalendarData } from '../utils/date';
import {
    CalendarDays,
    CheckCircle2,
    BookOpen,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface MonthlyReadingTrackerProps {
    readingDays?: Record<string, ReadingDayEntry>;
}

const WEEKDAY_HEADERS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const MonthlyReadingTracker: React.FC<MonthlyReadingTrackerProps> = ({
    readingDays = {},
}) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

    const calendar = getMonthCalendarData(selectedYear, selectedMonth, now);
    const isCurrentMonth =
        selectedYear === currentYear && selectedMonth === currentMonth;

    const daysReadCount = calendar.days.filter((d) =>
        Boolean(readingDays[d.date])
    ).length;
    const monthPagesTotal = calendar.days.reduce(
        (sum, d) => sum + (readingDays[d.date]?.pagesRead || 0),
        0
    );

    const handlePrevMonth = () => {
        if(selectedMonth === 0) {
            setSelectedYear((y) => y - 1);
            setSelectedMonth(11);
        } else {
            setSelectedMonth((m) => m - 1);
        }
    };

    const handleNextMonth = () => {
        if(selectedMonth === 11) {
            setSelectedYear((y) => y + 1);
            setSelectedMonth(0);
        } else {
            setSelectedMonth((m) => m + 1);
        }
    };

    const handleGoToCurrentMonth = () => {
        setSelectedYear(currentYear);
        setSelectedMonth(currentMonth);
    };

    return (
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <CalendarDays className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">
                            Hábito de Leitura Mensal
                        </h2>
                        <p className="text-[11px] text-slate-500">
                            {calendar.monthLabel} • Marcação automática dos dias lidos no mês
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1.5 rounded-md text-slate-600 hover:text-purple-700 hover:bg-white transition-colors"
                            title="Mês anterior"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800 min-w-[118px] text-center">
                            {calendar.monthLabel}
                        </span>
                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1.5 rounded-md text-slate-600 hover:text-purple-700 hover:bg-white transition-colors"
                            title="Próximo mês"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {!isCurrentMonth && (
                        <button
                            type="button"
                            onClick={handleGoToCurrentMonth}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                        >
                            Mês atual
                        </button>
                    )}

                    <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${daysReadCount > 0
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                    >
                        {daysReadCount} / {calendar.days.length}{' '}
                        {daysReadCount === 1 ? 'dia lido' : 'dias lidos'}
                    </span>

                    {monthPagesTotal > 0 && (
                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                            <span>{monthPagesTotal.toLocaleString('pt-BR')} pág no mês</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Cabeçalho dos dias da semana */}
            <div className="space-y-1.5">
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {WEEKDAY_HEADERS.map((label) => (
                        <div
                            key={label}
                            className="text-center text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 py-1"
                        >
                            {label}
                        </div>
                    ))}
                </div>

                {/* Grade mensal alinhada aos dias da semana */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {Array.from({ length: calendar.leadingEmptySlots }).map((_, idx) => (
                        <div
                            key={`empty-${idx}`}
                            className="min-h-[54px] sm:min-h-[62px] rounded-xl bg-slate-50/30 border border-transparent"
                        />
                    ))}

                    {calendar.days.map((day) => {
                        const entry = readingDays[day.date];
                        const isRead = Boolean(entry);

                        return (
                            <div
                                key={day.date}
                                title={
                                    isRead
                                        ? `${day.weekdayFull}, ${day.dayNumber} de ${day.monthFull} — Lido${entry.pagesRead > 0
                                            ? ` • ${entry.pagesRead} páginas`
                                            : ''
                                        }`
                                        : `${day.weekdayFull}, ${day.dayNumber} de ${day.monthFull}`
                                }
                                className={`min-h-[54px] sm:min-h-[62px] rounded-xl p-1.5 sm:p-2 border transition-all flex flex-col justify-between ${isRead
                                        ? 'bg-emerald-50/90 border-emerald-300 shadow-2xs'
                                        : day.isToday
                                            ? 'bg-purple-50/70 border-purple-300 ring-1 ring-purple-200'
                                            : day.isFuture
                                                ? 'bg-slate-50/40 border-dashed border-slate-200'
                                                : 'bg-slate-50/80 border-slate-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-1">
                                    <span
                                        className={`text-[11px] sm:text-xs font-extrabold ${isRead
                                                ? 'text-emerald-800'
                                                : day.isToday
                                                    ? 'text-purple-800'
                                                    : 'text-slate-600'
                                            }`}
                                    >
                                        {day.dayNumber}
                                    </span>

                                    {isRead ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-emerald-600 text-white shrink-0" />
                                    ) : day.isToday ? (
                                        <span className="hidden sm:inline text-[9px] font-bold text-purple-700 bg-purple-100/80 px-1.5 py-0.5 rounded">
                                            Hoje
                                        </span>
                                    ) : null}
                                </div>

                                <div className="flex items-center justify-between gap-1">
                                    {isRead ? (
                                        <>
                                            <span className="text-[10px] font-bold text-emerald-700 truncate">
                                                Lido
                                            </span>
                                            {entry.pagesRead > 0 && (
                                                <span className="hidden md:inline text-[9px] font-bold text-emerald-800 bg-white/85 border border-emerald-200 px-1 py-0.5 rounded">
                                                    +{entry.pagesRead}p
                                                </span>
                                            )}
                                        </>
                                    ) : day.isToday ? (
                                        <span className="sm:hidden text-[9px] font-bold text-purple-700">
                                            Hoje
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-medium text-slate-300">
                                            —
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};