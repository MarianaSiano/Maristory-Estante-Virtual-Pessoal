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
}