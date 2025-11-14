import { format, formatRelative, isThisWeek, isToday, isTomorrow, isYesterday } from "date-fns";
import { humanReadableDateTimeTillNow } from "../utils/misc";

export function isoDateString (date?: string) {
  return (!date ? new Date() : new Date(date)).toJSON();
}

export function formatDate (date: string | Date, formatString?: string) {
  if (formatString) {
    return format(new Date(date), formatString);
  }
  return new Date(date).toLocaleDateString();
}

export function formatDateTime (date: string | Date, formatString?: string) {
  if (formatString) {
    return format(new Date(date), formatString);
  }
  return new Date(date).toLocaleString();
}

export function formatTime (date: string | Date, formatString?: string) {
  if (formatString) {
    return format(new Date(date), formatString);
  }
  return new Date(date).toLocaleTimeString();
}

export function formatTimeWithoutSeconds (date: string | Date) {
  return format(new Date(date), "H:m");
}

export function formatDateWithoutYear (date: string | Date) {
  return new Date(date).toLocaleDateString([], {
    month: "numeric",
    day: "2-digit"
  });
}

export function getDate (date?: string | number | Date) {
  return date ? new Date(date) : new Date();
}

export function getDateUntilNow (date?: string | number | Date, nowLabel?: string, time?: string) {
  return date ? humanReadableDateTimeTillNow(date, nowLabel, time) : "-";
}

export function smartFormatDateTime (date?: string | number | Date) {
  if (!date) {
    return "-";
  }
  if (isToday(new Date(date))) {
    return new Date(date).toLocaleTimeString();
  }
  if (isThisWeek(new Date(date))) {
    return `${formatRelative(new Date(date), new Date())}`;
  }
  return new Date(date).toLocaleString();
}

export function smartFormatDate (date?: string | number | Date) {
  if (!date) {
    return "-";
  }
  //TODO we could use formatRelative when they implement this: https://github.com/date-fns/date-fns/issues/1218
  if (isToday(new Date(date))) {
    return "Today";
  }
  if (isYesterday(new Date(date))) {
    return "Yesterday";
  }
  return new Date(date).toLocaleDateString();
}

export function isDateToday (date: string | Date) {
  return isToday(new Date(date));
}

export function isDateYesterday (date: string | Date) {
  return isYesterday(new Date(date));
}

export function isDateTomorrow (date: string | Date) {
  return isTomorrow(new Date(date));
}

/**
 * Formats a date into a human-readable elapsed time string.
 * Returns strings like "now", "12 seconds ago", "3 hours ago", "today", "yesterday", "3 weeks ago", etc.
 * 
 * @param date The date to format
 * @param shortFormat When true, uses abbreviated time units (e.g. "s" instead of "seconds")
 * @returns A human-readable elapsed time string
 */
export function formatHumanElapsedTime(date: string | Date, shortFormat = false): string {
  const now = new Date();
  const inputDate = new Date(date);
  
  // Calculate time difference in milliseconds
  const diffMs = now.getTime() - inputDate.getTime();
  
  // Handle future dates
  if (diffMs < 0) {
    return formatDate(date);
  }
  
  // Convert to seconds, minutes, hours, days, weeks
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  // Define unit formats based on shortFormat parameter
  const units = {
    second: {
      singular: shortFormat ? 's' : 'second',
      plural: shortFormat ? 's' : 'seconds'
    },
    minute: {
      singular: shortFormat ? 'min' : 'minute',
      plural: shortFormat ? 'min' : 'minutes'
    },
    hour: {
      singular: shortFormat ? 'hr' : 'hour',
      plural: shortFormat ? 'hrs' : 'hours'
    },
    day: {
      singular: shortFormat ? 'd' : 'day',
      plural: shortFormat ? 'd' : 'days'
    },
    week: {
      singular: shortFormat ? 'wk' : 'week',
      plural: shortFormat ? 'wks' : 'weeks'
    },
    month: {
      singular: shortFormat ? 'mo' : 'month',
      plural: shortFormat ? 'mos' : 'months'
    },
    year: {
      singular: shortFormat ? 'y' : 'year',
      plural: shortFormat ? 'yrs' : 'years'
    }
  };
  
  // Just now (within 10 seconds)
  if (diffSeconds < 10) {
    return "now";
  }
  
  // Seconds ago (up to 1 minute)
  if (diffSeconds < 60) {
    const unit = diffSeconds === 1 ? units.second.singular : units.second.plural;
    return `${diffSeconds} ${unit} ago`;
  }
  
  // Minutes ago (up to 1 hour)
  if (diffMinutes < 60) {
    const unit = diffMinutes === 1 ? units.minute.singular : units.minute.plural;
    return `${diffMinutes} ${unit} ago`;
  }
  
  // Hours ago (up to today)
  if (isToday(inputDate)) {
    const unit = diffHours === 1 ? units.hour.singular : units.hour.plural;
    return `${diffHours} ${unit} ago`;
  }
  
  // Yesterday
  if (isYesterday(inputDate)) {
    return "yesterday";
  }
  
  // Days ago (up to 1 week)
  if (diffDays < 7) {
    const unit = diffDays === 1 ? units.day.singular : units.day.plural;
    return `${diffDays} ${unit} ago`;
  }
  
  // Weeks ago (up to 4 weeks / 1 month)
  if (diffWeeks < 4) {
    const unit = diffWeeks === 1 ? units.week.singular : units.week.plural;
    return `${diffWeeks} ${unit} ago`;
  }
  
  // Months ago (up to 12 months / 1 year)
  if (diffMonths < 12) {
    const unit = diffMonths === 1 ? units.month.singular : units.month.plural;
    return `${diffMonths} ${unit} ago`;
  }
  
  // Years ago
  const unit = diffYears === 1 ? units.year.singular : units.year.plural;
  return `${diffYears} ${unit} ago`;
}
