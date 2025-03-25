import {
  formatDate,
  formatDateTime,
  formatDateWithoutYear,
  formatTime,
  formatTimeWithoutSeconds,
  getDate,
  getDateUntilNow,
  isDateToday,
  isDateTomorrow,
  isDateYesterday,
  isoDateString,
  smartFormatDate,
  smartFormatDateTime
} from "../utils/date-utils";
import { differenceInMinutes, isSameDay, isThisYear, isToday } from "date-fns";

export const dateFunctions = {
  isoDateString,
  formatDate,
  formatDateTime,
  formatTime,
  formatTimeWithoutSeconds,
  formatDateWithoutYear,
  getDate,
  getDateUntilNow,
  smartFormatDateTime,
  smartFormatDate,
  isToday: isDateToday,
  isYesterday: isDateYesterday,
  isTomorrow: isDateTomorrow,
  differenceInMinutes,
  isSameDay,
  isThisYear,
};
