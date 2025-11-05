export type OperatingHours = {
    open: string | null;
    close: string | null;
} | null;

export type BusinessHours = Record<string, OperatingHours> | null;

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

const cleanValue = (value: string | undefined | null) => {
    if (!value) {
        return null;
    }

    const trimmed = value.trim();

    return trimmed === '' ? null : trimmed;
};

export const parseOperatingHoursInput = (value: string): OperatingHours => {
    if (!value) {
        return null;
    }

    const trimmed = value.trim();

    if (!trimmed || /^closed$/i.test(trimmed)) {
        return null;
    }

    const match = trimmed.match(/^(.+?)\s*-\s*(.+)$/);

    if (!match) {
        const normalized = cleanValue(trimmed);

        if (!normalized) {
            return null;
        }

        return {
            open: normalized,
            close: normalized,
        };
    }

    const [, openRaw, closeRaw] = match;
    const open = cleanValue(openRaw);
    const close = cleanValue(closeRaw);

    if (!open || !close) {
        return null;
    }

    return {
        open,
        close,
    };
};

const cloneHours = (hours: OperatingHours): OperatingHours => {
    if (!hours) {
        return null;
    }

    return {
        open: hours.open,
        close: hours.close,
    };
};

type BuildBusinessHoursArgs = {
    weekdays: string;
    saturday: string;
    sunday: string;
};

export const buildBusinessHoursPayload = ({ weekdays, saturday, sunday }: BuildBusinessHoursArgs): BusinessHours => {
    const weekdayHours = parseOperatingHoursInput(weekdays);
    const saturdayHours = parseOperatingHoursInput(saturday);
    const sundayHours = parseOperatingHoursInput(sunday);

    const payload: NonNullable<BusinessHours> = {
        monday: cloneHours(weekdayHours),
        tuesday: cloneHours(weekdayHours),
        wednesday: cloneHours(weekdayHours),
        thursday: cloneHours(weekdayHours),
        friday: cloneHours(weekdayHours),
        saturday: cloneHours(saturdayHours),
        sunday: cloneHours(sundayHours),
    };

    const hasAnyHours = DAY_KEYS.some((day) => {
        const entry = payload[day];
        return Boolean(entry && entry.open && entry.close);
    });

    return hasAnyHours ? payload : null;
};

export const formatOperatingHoursInput = (hours: OperatingHours): string => {
    if (!hours || !hours.open || !hours.close) {
        return 'Closed';
    }

    const open = hours.open.trim();
    const close = hours.close.trim();

    if (!open || !close || /^closed$/i.test(open) || /^closed$/i.test(close)) {
        return 'Closed';
    }

    return `${open} - ${close}`;
};
