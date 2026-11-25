export function getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export interface WeekDayInfo {
    date: string;
    shortLabel: string;
    fullLabel: string;
    dayNumber: number;
    monthShort: string;
    isToday: boolean;
    isFuture: boolean;
}

const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAY_FULL = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
];
const MONTH_SHORT = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
];

export function getCurrentWeekDays(referenceDate: Date = new Date()): WeekDayInfo[] {
    const today = new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth(),
        referenceDate.getDate()
    );
    const todayStr = getLocalDateString(today);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const days: WeekDayInfo[] = [];
    for(let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dateStr = getLocalDateString(d);
        days.push({
            date: dateStr,
            shortLabel: WEEKDAY_SHORT[i],
            fullLabel: WEEKDAY_FULL[i],
            dayNumber: d.getDate(),
            monthShort: MONTH_SHORT[d.getMonth()],
            isToday: dateStr === todayStr,
            isFuture: d.getTime() > today.getTime(),
        });
    }

    return days;
}

export interface MonthDayInfo {
    date: string;
    dayNumber: number;
    weekdayShort: string;
    weekdayFull: string;
    monthFull: string;
    year: number;
    isToday: boolean;
    isFuture: boolean;
}

export interface MonthCalendarData {
    year: number;
    month: number; // 0-11
    monthLabel: string;
    leadingEmptySlots: number;
    days: MonthDayInfo[];
}

const MONTH_FULL = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
];

export function getMonthCalendarData(
    year: number,
    month: number,
    referenceDate: Date = new Date()
): MonthCalendarData {
    const today = new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth(),
        referenceDate.getDate()
    );
    const todayStr = getLocalDateString(today);

    const firstOfMonth = new Date(year, month, 1);
    const leadingEmptySlots = firstOfMonth.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: MonthDayInfo[] = [];
    for(let day = 1; day <= totalDays; day++) {
        const d = new Date(year, month, day);
        const dateStr = getLocalDateString(d);
        const weekdayIdx = d.getDay();
        days.push({
            date: dateStr,
            dayNumber: day,
            weekdayShort: WEEKDAY_SHORT[weekdayIdx],
            weekdayFull: WEEKDAY_FULL[weekdayIdx],
            monthFull: MONTH_FULL[month],
            year,
            isToday: dateStr === todayStr,
            isFuture: d.getTime() > today.getTime(),
        });
    }

    return {
        year,
        month,
        monthLabel: `${MONTH_FULL[month]} de ${year}`,
        leadingEmptySlots,
        days,
    };
}