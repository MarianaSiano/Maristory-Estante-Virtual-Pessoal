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