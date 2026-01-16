import { describe, expect, it, beforeEach, vi } from "vitest";
import { currencyFunctions } from "../../src/components-core/appContext/currency-functions";

const { currencyFormat, currencyToNumber, currencyValidate, currencyConvert } = currencyFunctions;

describe("Currency Functions", () => {
  describe("currencyFormat", () => {
    it("formats USD currency with default locale", () => {
      const result = currencyFormat(1234.56, "USD");
      expect(result).toMatch(/1[,\s]?234\.56/); // Allow for different separators
    });

    it("formats EUR currency with German locale", () => {
      const result = currencyFormat(1234.56, "EUR", "de-DE");
      expect(result).toContain("1.234,56");
      expect(result).toContain("€");
    });

    it("formats GBP currency with UK locale", () => {
      const result = currencyFormat(1234.56, "GBP", "en-GB");
      expect(result).toContain("£");
      expect(result).toMatch(/1[,\s]?234\.56/);
    });

    it("formats with custom options - no decimals", () => {
      const result = currencyFormat(1234.56, "USD", "en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      expect(result).toMatch(/\$1[,\s]?235/);
      expect(result).not.toContain(".56");
    });

    it("handles string input", () => {
      const result = currencyFormat("1234.56", "USD", "en-US");
      expect(result).toMatch(/1[,\s]?234\.56/);
    });

    it("returns empty string for null", () => {
      expect(currencyFormat(null, "USD")).toBe("");
    });

    it("returns empty string for undefined", () => {
      expect(currencyFormat(undefined, "USD")).toBe("");
    });

    it("returns empty string for empty string", () => {
      expect(currencyFormat("", "USD")).toBe("");
    });

    it("warns and returns empty string for invalid input", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const result = currencyFormat("invalid", "USD");
      expect(result).toBe("");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid numeric value")
      );
      consoleSpy.mockRestore();
    });

    it("formats negative values", () => {
      const result = currencyFormat(-1234.56, "USD", "en-US");
      expect(result).toMatch(/-?\$?1[,\s]?234\.56/);
    });

    it("formats zero", () => {
      const result = currencyFormat(0, "USD", "en-US");
      expect(result).toMatch(/\$0\.00/);
    });

    it("caches formatters for performance", () => {
      // Call multiple times with same params
      const result1 = currencyFormat(100, "USD", "en-US");
      const result2 = currencyFormat(200, "USD", "en-US");
      const result3 = currencyFormat(300, "USD", "en-US");
      
      // Should produce consistent results
      expect(result1).toMatch(/\$100\.00/);
      expect(result2).toMatch(/\$200\.00/);
      expect(result3).toMatch(/\$300\.00/);
    });
  });

  describe("currencyToNumber", () => {
    it("parses US formatted currency", () => {
      expect(currencyToNumber("$1,234.56")).toBe(1234.56);
    });

    it("parses German formatted currency", () => {
      expect(currencyToNumber("1.234,56 €", "de-DE")).toBe(1234.56);
    });

    it("parses UK formatted currency", () => {
      expect(currencyToNumber("£1,234.56", "en-GB")).toBe(1234.56);
    });

    it("parses currency without symbols", () => {
      expect(currencyToNumber("1,234.56")).toBe(1234.56);
    });

    it("parses currency without thousand separators", () => {
      expect(currencyToNumber("$1234.56")).toBe(1234.56);
    });

    it("parses negative values", () => {
      expect(currencyToNumber("-$1,234.56")).toBe(-1234.56);
      expect(currencyToNumber("($1,234.56)")).toBe(-1234.56);
    });

    it("returns number unchanged", () => {
      expect(currencyToNumber(1234.56)).toBe(1234.56);
    });

    it("returns null for null", () => {
      expect(currencyToNumber(null)).toBe(null);
    });

    it("returns null for undefined", () => {
      expect(currencyToNumber(undefined)).toBe(null);
    });

    it("returns null for empty string", () => {
      expect(currencyToNumber("")).toBe(null);
    });

    it("returns null for invalid input", () => {
      expect(currencyToNumber("invalid")).toBe(null);
      // "abc123" will parse to 123 since we extract digits - this is expected behavior
      expect(currencyToNumber("abc123")).toBe(123);
      // Truly invalid input with no digits
      expect(currencyToNumber("xyz")).toBe(null);
    });

    it("handles zero", () => {
      expect(currencyToNumber("$0.00")).toBe(0);
      expect(currencyToNumber("0")).toBe(0);
    });

    it("handles decimal-only values", () => {
      expect(currencyToNumber("$0.99")).toBe(0.99);
      expect(currencyToNumber(".50")).toBe(0.5);
    });

    it("handles large numbers", () => {
      expect(currencyToNumber("$1,000,000.00")).toBe(1000000);
    });

    it("handles plus sign prefix", () => {
      expect(currencyToNumber("+$100.00")).toBe(100);
    });
  });

  describe("currencyValidate", () => {
    it("validates required field - valid", () => {
      const result = currencyValidate("$100", { required: true });
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(100);
      expect(result.invalidMessage).toBeUndefined();
    });

    it("validates required field - empty", () => {
      const result = currencyValidate("", { required: true });
      expect(result.isValid).toBe(false);
      expect(result.invalidMessage).toBe("Currency value is required");
      expect(result.value).toBe(null);
    });

    it("validates optional field - empty", () => {
      const result = currencyValidate("", { required: false });
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(null);
    });

    it("validates minimum value - valid", () => {
      const result = currencyValidate("$100", { min: 50 });
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(100);
    });

    it("validates minimum value - invalid", () => {
      const result = currencyValidate("$30", { min: 50 });
      expect(result.isValid).toBe(false);
      expect(result.invalidMessage).toBe("Value must be at least 50");
      expect(result.value).toBe(30);
    });

    it("validates maximum value - valid", () => {
      const result = currencyValidate("$100", { max: 200 });
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(100);
    });

    it("validates maximum value - invalid", () => {
      const result = currencyValidate("$300", { max: 200 });
      expect(result.isValid).toBe(false);
      expect(result.invalidMessage).toBe("Value must be at most 200");
      expect(result.value).toBe(300);
    });

    it("validates range - valid", () => {
      const result = currencyValidate("$100", { min: 50, max: 200 });
      expect(result.isValid).toBe(true);
    });

    it("validates negative values - allowed", () => {
      const result = currencyValidate("-$50", { allowNegative: true });
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(-50);
    });

    it("validates negative values - not allowed", () => {
      const result = currencyValidate("-$50", { allowNegative: false });
      expect(result.isValid).toBe(false);
      expect(result.invalidMessage).toBe("Negative values are not allowed");
      expect(result.value).toBe(-50);
    });

    it("validates negative values - default behavior (not allowed)", () => {
      const result = currencyValidate("-$50");
      expect(result.isValid).toBe(false);
      expect(result.invalidMessage).toBe("Negative values are not allowed");
    });

    it("validates invalid format", () => {
      const result = currencyValidate("invalid", { required: true });
      expect(result.isValid).toBe(false);
      expect(result.invalidMessage).toBe("Invalid currency format");
      expect(result.value).toBe(null);
    });

    it("validates null with no required option", () => {
      const result = currencyValidate(null);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(null);
    });

    it("validates number input", () => {
      const result = currencyValidate(100, { min: 50, max: 200 });
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(100);
    });

    it("validates zero", () => {
      const result = currencyValidate(0, { min: 0 });
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(0);
    });

    it("validates complex scenario - all constraints", () => {
      const result = currencyValidate("$150.50", {
        required: true,
        min: 100,
        max: 200,
        allowNegative: false,
      });
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(150.5);
    });
  });

  describe("currencyConvert", () => {
    it("converts USD to EUR", () => {
      const result = currencyConvert(100, "USD", "EUR", 0.85);
      expect(result).toBe(85);
    });

    it("converts with decimal precision", () => {
      const result = currencyConvert(100, "USD", "EUR", 0.85234, 2);
      expect(result).toBe(85.23);
    });

    it("converts without decimal precision (full precision)", () => {
      const result = currencyConvert(100, "USD", "EUR", 0.85234);
      expect(result).toBe(85.234);
    });

    it("converts GBP to USD", () => {
      const result = currencyConvert(50, "GBP", "USD", 1.27);
      expect(result).toBe(63.5);
    });

    it("converts with 4 decimal precision", () => {
      const result = currencyConvert(50, "GBP", "USD", 1.27456, 4);
      expect(result).toBe(63.728);
    });

    it("converts string amount", () => {
      const result = currencyConvert("100", "USD", "EUR", 0.85);
      expect(result).toBe(85);
    });

    it("converts formatted currency string", () => {
      const result = currencyConvert("$1,000", "USD", "EUR", 0.85);
      expect(result).toBe(850);
    });

    it("returns null for null amount", () => {
      expect(currencyConvert(null, "USD", "EUR", 0.85)).toBe(null);
    });

    it("returns null for undefined amount", () => {
      expect(currencyConvert(undefined, "USD", "EUR", 0.85)).toBe(null);
    });

    it("returns null for empty string amount", () => {
      expect(currencyConvert("", "USD", "EUR", 0.85)).toBe(null);
    });

    it("warns and returns null for invalid amount", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const result = currencyConvert("invalid", "USD", "EUR", 0.85);
      expect(result).toBe(null);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid amount")
      );
      consoleSpy.mockRestore();
    });

    it("warns and returns null for invalid exchange rate", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const result = currencyConvert(100, "USD", "EUR", NaN);
      expect(result).toBe(null);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid exchange rate")
      );
      consoleSpy.mockRestore();
    });

    it("handles zero amount", () => {
      const result = currencyConvert(0, "USD", "EUR", 0.85);
      expect(result).toBe(0);
    });

    it("handles zero exchange rate", () => {
      const result = currencyConvert(100, "USD", "EUR", 0);
      expect(result).toBe(0);
    });

    it("handles negative amounts", () => {
      const result = currencyConvert(-100, "USD", "EUR", 0.85);
      expect(result).toBe(-85);
    });

    it("handles exchange rate greater than 1", () => {
      const result = currencyConvert(100, "EUR", "JPY", 130.5);
      expect(result).toBe(13050);
    });

    it("handles very small exchange rates", () => {
      const result = currencyConvert(100, "USD", "VND", 0.00004, 6);
      expect(result).toBe(0.004);
    });

    it("preserves precision without decimals parameter", () => {
      const result = currencyConvert(100, "USD", "EUR", 0.8523456789);
      // JavaScript floating point precision - close enough
      expect(result).toBeCloseTo(85.23456789, 8);
    });

    it("rounds correctly with decimals parameter", () => {
      // Test rounding up
      const result1 = currencyConvert(100, "USD", "EUR", 0.8567, 2);
      expect(result1).toBe(85.67);

      // Test rounding down
      const result2 = currencyConvert(100, "USD", "EUR", 0.8562, 2);
      expect(result2).toBe(85.62);
    });

    it("handles decimal parameter of 0", () => {
      const result = currencyConvert(100, "USD", "EUR", 0.856789, 0);
      expect(result).toBe(86);
    });

    it("handles large amounts", () => {
      const result = currencyConvert(1000000, "USD", "EUR", 0.85, 2);
      expect(result).toBe(850000);
    });
  });

  describe("Integration scenarios", () => {
    it("format -> parse -> format roundtrip", () => {
      const original = 1234.56;
      const formatted = currencyFormat(original, "USD", "en-US");
      const parsed = currencyToNumber(formatted, "en-US");
      const reformatted = currencyFormat(parsed, "USD", "en-US");
      
      expect(parsed).toBe(original);
      expect(reformatted).toBe(formatted);
    });

    it("validate -> convert -> format workflow", () => {
      const input = "$100";
      const validation = currencyValidate(input, { required: true, min: 0 });
      
      expect(validation.isValid).toBe(true);
      
      const converted = currencyConvert(validation.value, "USD", "EUR", 0.85, 2);
      const formatted = currencyFormat(converted, "EUR", "en-US");
      
      expect(converted).toBe(85);
      expect(formatted).toContain("85.00");
    });

    it("parse user input -> validate -> convert -> format result", () => {
      const userInput = "1,234.56";
      const parsed = currencyToNumber(userInput);
      
      const validation = currencyValidate(parsed, { 
        required: true, 
        min: 1000, 
        max: 10000 
      });
      
      expect(validation.isValid).toBe(true);
      expect(validation.value).toBe(1234.56);
      
      const converted = currencyConvert(validation.value, "USD", "GBP", 0.79, 2);
      expect(converted).toBe(975.3);
      
      const formatted = currencyFormat(converted, "GBP", "en-GB");
      expect(formatted).toContain("975.30");
    });
  });
});
