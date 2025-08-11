import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { formatHumanElapsedTime } from "../../../src/components-core/utils/date-utils";
import * as dateFns from "date-fns";

// Mock date-fns functions used by formatHumanElapsedTime
vi.mock("date-fns", async () => {
  const actual = await vi.importActual("date-fns");
  return {
    ...(actual as object),
    isToday: vi.fn(),
    isYesterday: vi.fn(),
  };
});

describe("formatHumanElapsedTime tests", () => {
  const fixedDate = new Date("2025-07-15T12:00:00Z");
  
  beforeEach(() => {
    // Use fake timers to control the current date
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
    
    // Setup mocks for date-fns functions that are used in the implementation
    vi.mocked(dateFns.isToday).mockImplementation((date) => {
      const d = new Date(date);
      return (
        d.getDate() === fixedDate.getDate() &&
        d.getMonth() === fixedDate.getMonth() &&
        d.getFullYear() === fixedDate.getFullYear()
      );
    });
    
    vi.mocked(dateFns.isYesterday).mockImplementation((date) => {
      const d = new Date(date);
      const yesterday = new Date(fixedDate);
      yesterday.setDate(yesterday.getDate() - 1);
      return (
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear()
      );
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // =============================================================================
  // BASIC FUNCTIONALITY TESTS
  // =============================================================================

  it("should return 'now' for times within 10 seconds", () => {
    // Create dates within 10 seconds of the fixed date
    const now = new Date(fixedDate);
    const fiveSecondsAgo = new Date(fixedDate.getTime() - 5 * 1000);
    
    expect(formatHumanElapsedTime(now)).toBe("now");
    expect(formatHumanElapsedTime(fiveSecondsAgo)).toBe("now");
  });

  it("should format seconds correctly", () => {
    const fifteenSecondsAgo = new Date(fixedDate.getTime() - 15 * 1000);
    const elevenSecondsAgo = new Date(fixedDate.getTime() - 11 * 1000);
    const fiftyNineSecondsAgo = new Date(fixedDate.getTime() - 59 * 1000);
    
    expect(formatHumanElapsedTime(fifteenSecondsAgo)).toBe("15 seconds ago");
    expect(formatHumanElapsedTime(elevenSecondsAgo)).toBe("11 seconds ago");
    expect(formatHumanElapsedTime(fiftyNineSecondsAgo)).toBe("59 seconds ago");
  });

  it("should format minutes correctly", () => {
    const oneMinuteAgo = new Date(fixedDate.getTime() - 1 * 60 * 1000);
    const thirtyMinutesAgo = new Date(fixedDate.getTime() - 30 * 60 * 1000);
    const fiftyNineMinutesAgo = new Date(fixedDate.getTime() - 59 * 60 * 1000);
    
    expect(formatHumanElapsedTime(oneMinuteAgo)).toBe("1 minute ago");
    expect(formatHumanElapsedTime(thirtyMinutesAgo)).toBe("30 minutes ago");
    expect(formatHumanElapsedTime(fiftyNineMinutesAgo)).toBe("59 minutes ago");
  });

  it("should format hours correctly for today", () => {
    const oneHourAgo = new Date(fixedDate.getTime() - 1 * 60 * 60 * 1000);
    const sixHoursAgo = new Date(fixedDate.getTime() - 6 * 60 * 60 * 1000);
    
    expect(formatHumanElapsedTime(oneHourAgo)).toBe("1 hour ago");
    expect(formatHumanElapsedTime(sixHoursAgo)).toBe("6 hours ago");
  });

  it("should return 'yesterday' for yesterday's dates", () => {
    // Create a date that is exactly yesterday (24 hours ago)
    const yesterday = new Date(fixedDate);
    yesterday.setDate(yesterday.getDate() - 1);
    
    expect(formatHumanElapsedTime(yesterday)).toBe("yesterday");
  });

  it("should format days correctly for dates within a week", () => {
    const twoDaysAgo = new Date(fixedDate.getTime() - 2 * 24 * 60 * 60 * 1000);
    const sixDaysAgo = new Date(fixedDate.getTime() - 6 * 24 * 60 * 60 * 1000);
    
    // Ensure these aren't identified as "yesterday"
    vi.mocked(dateFns.isYesterday).mockReturnValue(false);
    
    expect(formatHumanElapsedTime(twoDaysAgo)).toBe("2 days ago");
    expect(formatHumanElapsedTime(sixDaysAgo)).toBe("6 days ago");
  });

  it("should format weeks correctly for dates within a month", () => {
    const oneWeekAgo = new Date(fixedDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const threeWeeksAgo = new Date(fixedDate.getTime() - 21 * 24 * 60 * 60 * 1000);
    
    expect(formatHumanElapsedTime(oneWeekAgo)).toBe("1 week ago");
    expect(formatHumanElapsedTime(threeWeeksAgo)).toBe("3 weeks ago");
  });

  it("should format months correctly for dates within a year", () => {
    const oneMonthAgo = new Date(fixedDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(fixedDate.getTime() - 180 * 24 * 60 * 60 * 1000);
    const elevenMonthsAgo = new Date(fixedDate.getTime() - 330 * 24 * 60 * 60 * 1000);
    
    expect(formatHumanElapsedTime(oneMonthAgo)).toBe("1 month ago");
    expect(formatHumanElapsedTime(sixMonthsAgo)).toBe("6 months ago");
    expect(formatHumanElapsedTime(elevenMonthsAgo)).toBe("11 months ago");
  });

  it("should format years correctly for older dates", () => {
    const oneYearAgo = new Date(fixedDate.getTime() - 365 * 24 * 60 * 60 * 1000);
    const fiveYearsAgo = new Date(fixedDate.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
    
    expect(formatHumanElapsedTime(oneYearAgo)).toBe("1 year ago");
    expect(formatHumanElapsedTime(fiveYearsAgo)).toBe("5 years ago");
  });

  // =============================================================================
  // EDGE CASE TESTS
  // =============================================================================

  it("should handle string date input correctly", () => {
    const dateStr = new Date(fixedDate.getTime() - 15 * 1000).toISOString();
    expect(formatHumanElapsedTime(dateStr)).toBe("15 seconds ago");
  });

  it("should handle future dates by returning the formatted date", () => {
    const tomorrow = new Date(fixedDate.getTime() + 24 * 60 * 60 * 1000);
    expect(formatHumanElapsedTime(tomorrow)).toBe(tomorrow.toLocaleDateString());
  });

  it("should handle dates at exactly the boundary between time units", () => {
    // Exactly 60 seconds = 1 minute
    const exactlyOneMinute = new Date(fixedDate.getTime() - 60 * 1000);
    expect(formatHumanElapsedTime(exactlyOneMinute)).toBe("1 minute ago");
    
    // Exactly 60 minutes = 1 hour
    const exactlyOneHour = new Date(fixedDate.getTime() - 60 * 60 * 1000);
    expect(formatHumanElapsedTime(exactlyOneHour)).toBe("1 hour ago");
  });

  it("should handle invalid date inputs gracefully", () => {
    const invalidDate = new Date("invalid date");
    expect(() => formatHumanElapsedTime(invalidDate)).not.toThrow();
  });

  // =============================================================================
  // SHORT FORMAT TESTS
  // =============================================================================
  
  it("should return 'now' for short format within 10 seconds", () => {
    // Create dates within 10 seconds of the fixed date
    const now = new Date(fixedDate);
    const fiveSecondsAgo = new Date(fixedDate.getTime() - 5 * 1000);
    
    expect(formatHumanElapsedTime(now, true)).toBe("now");
    expect(formatHumanElapsedTime(fiveSecondsAgo, true)).toBe("now");
  });

  it("should format seconds correctly with short format", () => {
    const fifteenSecondsAgo = new Date(fixedDate.getTime() - 15 * 1000);
    const elevenSecondsAgo = new Date(fixedDate.getTime() - 11 * 1000);
    const fiftyNineSecondsAgo = new Date(fixedDate.getTime() - 59 * 1000);
    
    expect(formatHumanElapsedTime(fifteenSecondsAgo, true)).toBe("15 s ago");
    expect(formatHumanElapsedTime(elevenSecondsAgo, true)).toBe("11 s ago");
    expect(formatHumanElapsedTime(fiftyNineSecondsAgo, true)).toBe("59 s ago");
  });

  it("should format minutes correctly with short format", () => {
    const oneMinuteAgo = new Date(fixedDate.getTime() - 1 * 60 * 1000);
    const thirtyMinutesAgo = new Date(fixedDate.getTime() - 30 * 60 * 1000);
    const fiftyNineMinutesAgo = new Date(fixedDate.getTime() - 59 * 60 * 1000);
    
    expect(formatHumanElapsedTime(oneMinuteAgo, true)).toBe("1 min ago");
    expect(formatHumanElapsedTime(thirtyMinutesAgo, true)).toBe("30 min ago");
    expect(formatHumanElapsedTime(fiftyNineMinutesAgo, true)).toBe("59 min ago");
  });

  it("should format hours correctly for today with short format", () => {
    const oneHourAgo = new Date(fixedDate.getTime() - 1 * 60 * 60 * 1000);
    const sixHoursAgo = new Date(fixedDate.getTime() - 6 * 60 * 60 * 1000);
    
    expect(formatHumanElapsedTime(oneHourAgo, true)).toBe("1 hr ago");
    expect(formatHumanElapsedTime(sixHoursAgo, true)).toBe("6 hrs ago");
  });

  it("should return 'yesterday' for yesterday's dates with short format", () => {
    // Create a date that is exactly yesterday (24 hours ago)
    const yesterday = new Date(fixedDate);
    yesterday.setDate(yesterday.getDate() - 1);
    
    expect(formatHumanElapsedTime(yesterday, true)).toBe("yesterday");
  });

  it("should format days correctly for dates within a week with short format", () => {
    const twoDaysAgo = new Date(fixedDate.getTime() - 2 * 24 * 60 * 60 * 1000);
    const sixDaysAgo = new Date(fixedDate.getTime() - 6 * 24 * 60 * 60 * 1000);
    
    // Ensure these aren't identified as "yesterday"
    vi.mocked(dateFns.isYesterday).mockReturnValue(false);
    
    expect(formatHumanElapsedTime(twoDaysAgo, true)).toBe("2 d ago");
    expect(formatHumanElapsedTime(sixDaysAgo, true)).toBe("6 d ago");
  });

  it("should format weeks correctly for dates within a month with short format", () => {
    const oneWeekAgo = new Date(fixedDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const threeWeeksAgo = new Date(fixedDate.getTime() - 21 * 24 * 60 * 60 * 1000);
    
    expect(formatHumanElapsedTime(oneWeekAgo, true)).toBe("1 wk ago");
    expect(formatHumanElapsedTime(threeWeeksAgo, true)).toBe("3 wks ago");
  });

  it("should format months correctly for dates within a year with short format", () => {
    const oneMonthAgo = new Date(fixedDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(fixedDate.getTime() - 180 * 24 * 60 * 60 * 1000);
    const elevenMonthsAgo = new Date(fixedDate.getTime() - 330 * 24 * 60 * 60 * 1000);
    
    expect(formatHumanElapsedTime(oneMonthAgo, true)).toBe("1 mo ago");
    expect(formatHumanElapsedTime(sixMonthsAgo, true)).toBe("6 mos ago");
    expect(formatHumanElapsedTime(elevenMonthsAgo, true)).toBe("11 mos ago");
  });

  it("should format years correctly for older dates with short format", () => {
    const oneYearAgo = new Date(fixedDate.getTime() - 365 * 24 * 60 * 60 * 1000);
    const fiveYearsAgo = new Date(fixedDate.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
    
    expect(formatHumanElapsedTime(oneYearAgo, true)).toBe("1 y ago");
    expect(formatHumanElapsedTime(fiveYearsAgo, true)).toBe("5 yrs ago");
  });

  it("should handle string date input correctly with short format", () => {
    const dateStr = new Date(fixedDate.getTime() - 15 * 1000).toISOString();
    expect(formatHumanElapsedTime(dateStr, true)).toBe("15 s ago");
  });
});
