import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { formatHumanElapsedTime } from "../../../src/components-core/utils/date-utils";
import * as dateFns from "date-fns";

// Mock date-fns functions used by formatHumanElapsedTime
// Note: These mocks are designed to be timezone-independent to prevent
// test failures when running in different timezones (e.g., US Pacific UTC-7)
// Fixed issue: https://github.com/xmlui-org/xmlui/issues/1726#issuecomment-3122165968
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
    // These need to be timezone-independent to avoid failures in different timezones
    vi.mocked(dateFns.isToday).mockImplementation((date) => {
      const d = new Date(date);
      const now = new Date();
      
      // Compare UTC dates to avoid timezone issues
      const dUTC = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      const nowUTC = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
      
      return dUTC.getTime() === nowUTC.getTime();
    });
    
    vi.mocked(dateFns.isYesterday).mockImplementation((date) => {
      const d = new Date(date);
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      
      // Compare UTC dates to avoid timezone issues
      const dUTC = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      const yesterdayUTC = new Date(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate());
      
      return dUTC.getTime() === yesterdayUTC.getTime();
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
    // Create a date that is exactly yesterday using UTC to avoid timezone issues
    const yesterday = new Date(fixedDate);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    
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
    // Use a more predictable format expectation that's timezone-independent
    expect(formatHumanElapsedTime(tomorrow)).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
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

  it("should work consistently across different timezones", () => {
    // Test with a variety of time differences to ensure consistency
    // regardless of the local timezone where tests are run
    
    // 30 seconds ago - should always be "30 seconds ago"
    const thirtySecondsAgo = new Date(fixedDate.getTime() - 30 * 1000);
    expect(formatHumanElapsedTime(thirtySecondsAgo)).toBe("30 seconds ago");
    
    // 5 minutes ago - should always be "5 minutes ago" 
    const fiveMinutesAgo = new Date(fixedDate.getTime() - 5 * 60 * 1000);
    expect(formatHumanElapsedTime(fiveMinutesAgo)).toBe("5 minutes ago");
    
    // 2 hours ago (still today in UTC) - should be "2 hours ago"
    const twoHoursAgo = new Date(fixedDate.getTime() - 2 * 60 * 60 * 1000);
    expect(formatHumanElapsedTime(twoHoursAgo)).toBe("2 hours ago");
  });

  it("should handle timezone edge cases for day boundaries", () => {
    // Test dates that might cross day boundaries in different timezones
    // Use UTC-based calculations to ensure consistent behavior
    
    // 25 hours ago - should be "yesterday" if isYesterday returns true
    const twentyFiveHoursAgo = new Date(fixedDate.getTime() - 25 * 60 * 60 * 1000);
    
    // Mock isYesterday to return true for this specific test
    vi.mocked(dateFns.isYesterday).mockReturnValueOnce(true);
    vi.mocked(dateFns.isToday).mockReturnValueOnce(false);
    
    expect(formatHumanElapsedTime(twentyFiveHoursAgo)).toBe("yesterday");
  });
});
