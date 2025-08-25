// Merged utility functions for TimePicker component
import getUserLocale from 'get-user-locale';

// ============================================================================
// Types (from types.ts)
// ============================================================================

export type Range<T> = [T, T];

export type AmPmType = 'am' | 'pm';

export type ClassName = string | null | undefined | (string | null | undefined)[];

export type Detail = 'hour' | 'minute' | 'second';

export type LooseValuePiece = string | Date | null;

export type LooseValue = LooseValuePiece | Range<LooseValuePiece>;

export type Value = string | null;

// ============================================================================
// Date Formatter utilities (from dateFormatter.ts)
// ============================================================================

const formatterCache = new Map();

export function getFormatter(
  options: Intl.DateTimeFormatOptions,
): (locale: string | undefined, date: Date) => string {
  return function formatter(locale: string | undefined, date: Date): string {
    const localeWithDefault = locale || getUserLocale();

    if (!formatterCache.has(localeWithDefault)) {
      formatterCache.set(localeWithDefault, new Map());
    }

    const formatterCacheLocale = formatterCache.get(localeWithDefault);

    if (!formatterCacheLocale.has(options)) {
      formatterCacheLocale.set(
        options,
        new Intl.DateTimeFormat(localeWithDefault || undefined, options).format,
      );
    }

    return formatterCacheLocale.get(options)(date);
  };
}

const numberFormatterCache = new Map();

export function getNumberFormatter(
  options: Intl.NumberFormatOptions,
): (locale: string | undefined, number: number) => string {
  return (locale: string | undefined, number: number): string => {
    const localeWithDefault = locale || getUserLocale();

    if (!numberFormatterCache.has(localeWithDefault)) {
      numberFormatterCache.set(localeWithDefault, new Map());
    }

    const numberFormatterCacheLocale = numberFormatterCache.get(localeWithDefault);

    if (!numberFormatterCacheLocale.has(options)) {
      numberFormatterCacheLocale.set(
        options,
        new Intl.NumberFormat(localeWithDefault || undefined, options).format,
      );
    }

    return numberFormatterCacheLocale.get(options)(number);
  };
}

// ============================================================================
// Date utilities (from dateUtils.ts)
// ============================================================================

export function getHours(dateOrTimeString: string | Date | null | undefined): number {
  if (!dateOrTimeString) return 0;
  
  if (dateOrTimeString instanceof Date) {
    return dateOrTimeString.getHours();
  }
  
  // Handle time string format like "14:30:45" or "14:30"
  const timeString = String(dateOrTimeString);
  const timeParts = timeString.split(':');
  
  if (timeParts.length >= 1) {
    const hours = parseInt(timeParts[0], 10);
    return isNaN(hours) ? 0 : hours;
  }
  
  return 0;
}

export function getMinutes(dateOrTimeString: string | Date | null | undefined): number {
  if (!dateOrTimeString) return 0;
  
  if (dateOrTimeString instanceof Date) {
    return dateOrTimeString.getMinutes();
  }
  
  // Handle time string format like "14:30:45" or "14:30"
  const timeString = String(dateOrTimeString);
  const timeParts = timeString.split(':');
  
  if (timeParts.length >= 2) {
    const minutes = parseInt(timeParts[1], 10);
    return isNaN(minutes) ? 0 : minutes;
  }
  
  return 0;
}

export function getSeconds(dateOrTimeString: string | Date | null | undefined): number {
  if (!dateOrTimeString) return 0;
  
  if (dateOrTimeString instanceof Date) {
    return dateOrTimeString.getSeconds();
  }
  
  // Handle time string format like "14:30:45"
  const timeString = String(dateOrTimeString);
  const timeParts = timeString.split(':');
  
  if (timeParts.length >= 3) {
    const seconds = parseInt(timeParts[2], 10);
    return isNaN(seconds) ? 0 : seconds;
  }
  
  return 0;
}

export function getHoursMinutes(dateOrTimeString: string | Date | null | undefined): string {
  if (!dateOrTimeString) return '';
  
  if (dateOrTimeString instanceof Date) {
    const hours = dateOrTimeString.getHours().toString().padStart(2, '0');
    const minutes = dateOrTimeString.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  // Handle time string - return first two components
  const timeString = String(dateOrTimeString);
  const timeParts = timeString.split(':');
  
  if (timeParts.length >= 2) {
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    if (!isNaN(hours) && !isNaN(minutes)) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }
  
  return timeString;
}

export function getHoursMinutesSeconds(dateOrTimeString: string | Date | null | undefined): string {
  if (!dateOrTimeString) return '';
  
  if (dateOrTimeString instanceof Date) {
    const hours = dateOrTimeString.getHours().toString().padStart(2, '0');
    const minutes = dateOrTimeString.getMinutes().toString().padStart(2, '0');
    const seconds = dateOrTimeString.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
  
  // Handle time string - ensure it has three components
  const timeString = String(dateOrTimeString);
  const timeParts = timeString.split(':');
  
  if (timeParts.length >= 3) {
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = parseInt(timeParts[2], 10);
    
    if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  } else if (timeParts.length === 2) {
    // Add seconds if missing
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    if (!isNaN(hours) && !isNaN(minutes)) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    }
  }
  
  return timeString;
}

// ============================================================================
// Date conversion utilities (from dates.ts)
// ============================================================================

export function convert12to24(hour12: string | number, amPm: AmPmType): number {
  let hour24 = Number(hour12);

  if (amPm === 'am' && hour24 === 12) {
    hour24 = 0;
  } else if (amPm === 'pm' && hour24 < 12) {
    hour24 += 12;
  }

  return hour24;
}

export function convert24to12(hour24: string | number): [number, AmPmType] {
  const hour12 = Number(hour24) % 12 || 12;

  return [hour12, Number(hour24) < 12 ? 'am' : 'pm'];
}

// ============================================================================
// General utilities (from utils.ts)
// ============================================================================

const nines = ['9', '٩'];
const ninesRegExp = new RegExp(`[${nines.join('')}]`);
const amPmFormatter = getFormatter({ hour: 'numeric' });

export function getAmPmLabels(locale: string | undefined): [string, string] {
  const amString = amPmFormatter(locale, new Date(2017, 0, 1, 9));
  const pmString = amPmFormatter(locale, new Date(2017, 0, 1, 21));

  const [am1, am2] = amString.split(ninesRegExp) as [string, string];
  const [pm1, pm2] = pmString.split(ninesRegExp) as [string, string];

  if (pm2 !== undefined) {
    // If pm2 is undefined, nine was not found in pmString - this locale is not using 12-hour time
    if (am1 !== pm1) {
      return [am1, pm1].map((el) => el.trim()) as [string, string];
    }

    if (am2 !== pm2) {
      return [am2, pm2].map((el) => el.trim()) as [string, string];
    }
  }

  // Fallback
  return ['AM', 'PM'];
}

function isValidNumber(num: unknown): num is number {
  return num !== null && num !== false && !Number.isNaN(Number(num));
}

export function safeMin(...args: unknown[]): number {
  return Math.min(...args.filter(isValidNumber));
}

export function safeMax(...args: unknown[]): number {
  return Math.max(...args.filter(isValidNumber));
}
