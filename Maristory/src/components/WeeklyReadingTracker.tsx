import React from 'react';
import { ReadingDayEntry } from '../types';
import { getCurrentWeekDays } from '../utils/date';
import { Calendar, CheckCircle2, BookOpen } from 'lucide-react';

interface WeeklyReadingTrackerProps {
    readingDays?: Record<string, ReadingDayEntry>;
}

export const WeeklyReadingTracker: React.FC<WeeklyReadingTrackerProps> = ({
    readingDays = {},
}) => {
    const weekDays = getCurrentWeekDays();
    const daysReadCount = weekDays.filter((d) => Boolean(readingDays[d.date])).length;
    const weekPagesTotal = weekDays.reduce(
        (sum, d) => sum + (readingDays[d.date]?.pagesRead || 0),
        0
    );

    const firstDay = weekDays[0];
    const lastDay = weekDays[6];
    const weekRangeLabel =
        firstDay.monthShort === lastDay.monthShort
            ? `${firstDay.dayNumber} a ${lastDay.dayNumber} de ${firstDay.monthShort}`
            : `${firstDay.dayNumber} ${firstDay.monthShort} – ${lastDay.dayNumber} ${lastDay.monthShort}`;

    return (
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">
                                Dias da Semana • Hábito de Leitura
                            </h2>
                            <p className="text-[11px] text-slate-500">
                                Semana de {weekRangeLabel} • Marcação automática ao registrar páginas lidas
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${daysReadCount > 0
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                    >
                        {daysReadCount} / 7 {daysReadCount === 1 ? 'dia lido' : 'dias lidos'}
                    </span>
                    {weekPagesTotal > 0 && (
                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                            <span>{weekPagesTotal.toLocaleString('pt-BR')} pág na semana</span>
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {weekDays.map((day) => {
                    const entry = readingDays[day.date];
                    const isRead = Boolean(entry);

                    return (
                        <div
                            key={day.date}
                            title={
                                isRead
                                    ? `${day.fullLabel} (${day.dayNumber} ${day.monthShort}) — Lido${entry.pagesRead > 0 ? ` • ${entry.pagesRead} páginas` : ''
                                    }`
                                    : `${day.fullLabel} (${day.dayNumber} ${day.monthShort})`
                            }
                            className={`rounded-xl p-3 border transition-all flex flex-col justify-between gap-2 ${isRead
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
                                    className={`text-xs font-extrabold uppercase tracking-wide ${isRead
                                            ? 'text-emerald-800'
                                            : day.isToday
                                                ? 'text-purple-800'
                                                : 'text-slate-600'
                                        }`}
                                >
                                    {day.shortLabel}
                                </span>
                                <span
                                    className={`text-[11px] font-semibold ${isRead
                                            ? 'text-emerald-700'
                                            : day.isToday
                                                ? 'text-purple-700'
                                                : 'text-slate-400'
                                        }`}
                                >
                                    {day.dayNumber} {day.monthShort}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-1 pt-0.5">
                                {isRead ? (
                                    <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs">
                                        <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white shrink-0" />
                                        <span>Lido</span>
                                    </div>
                                ) : day.isToday ? (
                                    <span className="text-[11px] font-bold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md">
                                        Hoje
                                    </span>
                                ) : (
                                    <span className="text-[11px] font-medium text-slate-400">
                                        {day.isFuture ? 'Em breve' : '—'}
                                    </span>
                                )}

                                {isRead && entry.pagesRead > 0 && (
                                    <span className="text-[10px] font-bold text-emerald-800 bg-white/80 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                                        +{entry.pagesRead} pág
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};