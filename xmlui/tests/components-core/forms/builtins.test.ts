/**
 * Unit tests for all built-in validators (Plan #9 Step 1.1 / 1.3).
 *
 * Exercises the exported pure helper functions directly — no registry
 * calls — so tests are fast and free of side-effects.
 */

import { describe, it, expect } from "vitest";
import { isValidEmail } from "../../../src/components-core/forms/builtins/email";
import { isValidUrl } from "../../../src/components-core/forms/builtins/url";
import { isValidPhone } from "../../../src/components-core/forms/builtins/phone";
import { isValidIsoDate } from "../../../src/components-core/forms/builtins/isoDate";
import { isValidLength } from "../../../src/components-core/forms/builtins/length";
import { isValidStrongPassword } from "../../../src/components-core/forms/builtins/strongPassword";
import { isValidCreditCard } from "../../../src/components-core/forms/builtins/creditCard";
import { isValidIban } from "../../../src/components-core/forms/builtins/iban";
import { hasNoLeadingTrailingWhitespace } from "../../../src/components-core/forms/builtins/noLeadingTrailingWhitespace";

// ---------------------------------------------------------------------------
// email
// ---------------------------------------------------------------------------

describe("isValidEmail", () => {
  it.each([null, undefined, ""])("passes empty / null / undefined: %s", (v) =>
    expect(isValidEmail(v)).toBe(true),
  );
  it("accepts a standard email address", () =>
    expect(isValidEmail("user@example.com")).toBe(true));
  it("rejects an address without @", () =>
    expect(isValidEmail("notanemail")).toBe(false));
  it("rejects non-string values", () =>
    expect(isValidEmail(42)).toBe(false));
});

// ---------------------------------------------------------------------------
// url
// ---------------------------------------------------------------------------

describe("isValidUrl", () => {
  it.each([null, undefined, ""])("passes empty / null / undefined: %s", (v) =>
    expect(isValidUrl(v)).toBe(true),
  );
  it("accepts http URLs", () =>
    expect(isValidUrl("http://example.com")).toBe(true));
  it("accepts https URLs", () =>
    expect(isValidUrl("https://example.com/path?q=1")).toBe(true));
  it("rejects ftp URLs", () =>
    expect(isValidUrl("ftp://files.example.com")).toBe(false));
  it("rejects bare text", () =>
    expect(isValidUrl("not a url")).toBe(false));
});

// ---------------------------------------------------------------------------
// phone
// ---------------------------------------------------------------------------

describe("isValidPhone", () => {
  it.each([null, undefined, ""])("passes empty / null / undefined: %s", (v) =>
    expect(isValidPhone(v)).toBe(true),
  );
  it("accepts a typical E.164 number", () =>
    expect(isValidPhone("+14155552671")).toBe(true));
  it("accepts formatted number with dashes", () =>
    expect(isValidPhone("1-800-555-0199")).toBe(true));
  it("rejects string with no digits", () =>
    expect(isValidPhone("abcdef")).toBe(false));
  it("rejects string with invalid characters", () =>
    expect(isValidPhone("123!456")).toBe(false));
});

// ---------------------------------------------------------------------------
// isoDate
// ---------------------------------------------------------------------------

describe("isValidIsoDate", () => {
  it.each([null, undefined, ""])("passes empty / null / undefined: %s", (v) =>
    expect(isValidIsoDate(v)).toBe(true),
  );
  it("accepts a valid calendar date", () =>
    expect(isValidIsoDate("2024-03-15")).toBe(true));
  it("accepts a full ISO 8601 timestamp with Z", () =>
    expect(isValidIsoDate("2024-03-15T14:30:00Z")).toBe(true));
  it("accepts a timestamp with timezone offset", () =>
    expect(isValidIsoDate("2024-03-15T14:30:00+05:30")).toBe(true));
  it("rejects non-padded month/day", () =>
    expect(isValidIsoDate("2024-3-5")).toBe(false));
  it("rejects slash-separated date", () =>
    expect(isValidIsoDate("03/15/2024")).toBe(false));
  it("rejects Feb 30 (invalid day)", () =>
    expect(isValidIsoDate("2024-02-30")).toBe(false));
  it("rejects Feb 29 in a non-leap year", () =>
    expect(isValidIsoDate("2023-02-29")).toBe(false));
  it("accepts Feb 29 in a leap year", () =>
    expect(isValidIsoDate("2024-02-29")).toBe(true));
});

// ---------------------------------------------------------------------------
// length (parameterised)
// ---------------------------------------------------------------------------

describe("isValidLength", () => {
  it.each([null, undefined, ""])("passes empty / null / undefined: %s", (v) =>
    expect(isValidLength(v)).toBe(true),
  );
  it("passes string within bounds", () =>
    expect(isValidLength("hello", { min: 3, max: 10 })).toBe(true));
  it("fails string below min", () =>
    expect(isValidLength("hi", { min: 3 })).toBe(false));
  it("fails string above max", () =>
    expect(isValidLength("toolongstring", { max: 5 })).toBe(false));
  it("passes array within bounds", () =>
    expect(isValidLength([1, 2, 3], { min: 1, max: 5 })).toBe(true));
  it("fails non-string non-array value", () =>
    expect(isValidLength(42, { min: 0 })).toBe(false));
  it("passes with no params (no-op constraint)", () =>
    expect(isValidLength("anything")).toBe(true));
});

// ---------------------------------------------------------------------------
// strongPassword
// ---------------------------------------------------------------------------

describe("isValidStrongPassword", () => {
  it.each([null, undefined, ""])("passes empty / null / undefined: %s", (v) =>
    expect(isValidStrongPassword(v)).toBe(true),
  );
  it("accepts a strong password meeting the default policy", () =>
    expect(isValidStrongPassword("StrongPass1!")).toBe(true));
  it("rejects too short password", () =>
    expect(isValidStrongPassword("Short1!")).toBe(false));
  it("rejects password with no uppercase", () =>
    expect(isValidStrongPassword("weakpassword1!")).toBe(false));
  it("rejects password with no digit", () =>
    expect(isValidStrongPassword("StrongPassword!")).toBe(false));
  it("rejects password with no symbol", () =>
    expect(isValidStrongPassword("StrongPassword1")).toBe(false));
  it("respects custom minLength param", () =>
    // 14-char password should fail default-12 policy at length 16.
    expect(isValidStrongPassword("StrongPass1!", { minLength: 16 })).toBe(false));
});

// ---------------------------------------------------------------------------
// creditCard (Luhn)
// ---------------------------------------------------------------------------

describe("isValidCreditCard", () => {
  it.each([null, undefined, ""])("passes empty / null / undefined: %s", (v) =>
    expect(isValidCreditCard(v)).toBe(true),
  );
  // Well-known Luhn-valid test numbers.
  it("accepts Visa test number", () =>
    expect(isValidCreditCard("4111111111111111")).toBe(true));
  it("accepts Mastercard test number with spaces", () =>
    expect(isValidCreditCard("5500 0000 0000 0004")).toBe(true));
  it("rejects a tampered card number", () =>
    expect(isValidCreditCard("4111111111111112")).toBe(false));
  it("rejects a string that is too short", () =>
    expect(isValidCreditCard("12345")).toBe(false));
  it("rejects non-numeric garbage", () =>
    expect(isValidCreditCard("not-a-card")).toBe(false));
});

// ---------------------------------------------------------------------------
// IBAN (mod-97)
// ---------------------------------------------------------------------------

describe("isValidIban", () => {
  it.each([null, undefined, ""])("passes empty / null / undefined: %s", (v) =>
    expect(isValidIban(v)).toBe(true),
  );
  // Canonical GB IBAN (public test value).
  it("accepts a valid GB IBAN", () =>
    expect(isValidIban("GB82WEST12345698765432")).toBe(true));
  it("accepts IBAN with spaces (normalised)", () =>
    expect(isValidIban("GB82 WEST 1234 5698 7654 32")).toBe(true));
  it("rejects a corrupted IBAN", () =>
    expect(isValidIban("GB82WEST12345698765433")).toBe(false));
  it("rejects a short string", () =>
    expect(isValidIban("GB82")).toBe(false));
});

// ---------------------------------------------------------------------------
// noLeadingTrailingWhitespace
// ---------------------------------------------------------------------------

describe("hasNoLeadingTrailingWhitespace", () => {
  it.each([null, undefined, ""])("passes empty / null / undefined: %s", (v) =>
    expect(hasNoLeadingTrailingWhitespace(v)).toBe(true),
  );
  it("accepts a clean string", () =>
    expect(hasNoLeadingTrailingWhitespace("hello")).toBe(true));
  it("rejects leading whitespace", () =>
    expect(hasNoLeadingTrailingWhitespace(" hello")).toBe(false));
  it("rejects trailing whitespace", () =>
    expect(hasNoLeadingTrailingWhitespace("hello ")).toBe(false));
  it("rejects both leading and trailing whitespace", () =>
    expect(hasNoLeadingTrailingWhitespace("  hello  ")).toBe(false));
  it("rejects a tab character at the start", () =>
    expect(hasNoLeadingTrailingWhitespace("\thello")).toBe(false));
});
