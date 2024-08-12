import { format, formatRelative, isThisWeek, isToday, isTomorrow, isYesterday } from "date-fns";
import { humanReadableDateTimeTillNow } from "@components-core/utils/misc";

export function isoDateString (date?: string) {
  return (!date ? new Date() : new Date(date)).toJSON();
}

export function formatDate (date: string | Date) {
  return new Date(date).toLocaleDateString();
}

export function formatDateTime (date: string | Date) {
  return new Date(date).toLocaleString();
}

export function formatTime (date: string | Date) {
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
