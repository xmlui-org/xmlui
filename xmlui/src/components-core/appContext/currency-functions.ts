import getUserLocale from 'get-user-locale';

/**
 * Cache for currency formatters to improve performance
 * Structure: Map<locale, Map<cacheKey, formatter>>
 */
const currencyFormatterCache = new Map<string, Map<string, Intl.NumberFormat>>();

/**
 * Formats a number as currency using Intl.NumberFormat
 * @param value The numeric value to format
 * @param currency The currency code (e.g., 'USD', 'EUR', 'GBP')
 * @param locale Optional locale (defaults to user's browser locale)
 * @param options Optional Intl.NumberFormatOptions for customization
 * @returns Formatted currency string
 * 
 * @example
 * currencyFormat(1234.56, 'USD') // "$1,234.56"
 * currencyFormat(1234.56, 'EUR', 'de-DE') // "1.234,56 €"
 * currencyFormat(1234.56, 'GBP', 'en-GB', { minimumFractionDigits: 0 }) // "£1,235"
 */
function currencyFormat(
  value: number | string | null | undefined,
  currency: string,
  locale?: string,
  options?: Partial<Intl.NumberFormatOptions>
): string {
  // Handle null/undefined/empty
  if (value === null || value === undefined || value === '') {
    return '';
  }

  // Convert string to number
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) {
    console.warn(`currencyFormat: Invalid numeric value "${value}"`);
    return '';
  }

  const localeWithDefault = locale || getUserLocale();
  
  // Create cache key from currency and options
  const cacheKey = `${currency}:${JSON.stringify(options || {})}`;

  // Initialize cache for locale
  if (!currencyFormatterCache.has(localeWithDefault)) {
    currencyFormatterCache.set(localeWithDefault, new Map());
  }

  const localeCache = currencyFormatterCache.get(localeWithDefault)!;

  // Create or retrieve cached formatter
  if (!localeCache.has(cacheKey)) {
    const formatter = new Intl.NumberFormat(localeWithDefault, {
      style: 'currency',
      currency: currency,
      ...options,
    });
    localeCache.set(cacheKey, formatter);
  }

  return localeCache.get(cacheKey)!.format(numericValue);
}

/**
 * Parses a currency string to a number
 * Handles various currency formats from different locales
 * @param value The currency string to parse (can also be a number)
 * @param locale Optional locale for parsing hints
 * @returns Numeric value or null if invalid
 * 
 * @example
 * currencyToNumber('$1,234.56') // 1234.56
 * currencyToNumber('1.234,56 €', 'de-DE') // 1234.56
 * currencyToNumber('£1,234') // 1234
 * currencyToNumber('invalid') // null
 */
function currencyToNumber(
  value: string | number | null | undefined,
  locale?: string
): number | null {
  // Handle null/undefined/empty
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // Already a number
  if (typeof value === 'number') {
    return value;
  }

  // Get locale-specific separators
  const localeWithDefault = locale || getUserLocale();
  const parts = new Intl.NumberFormat(localeWithDefault).formatToParts(1234.5);
  const group = parts.find((p) => p.type === 'group')?.value || ',';
  const decimal = parts.find((p) => p.type === 'decimal')?.value || '.';

  // Check if value contains parentheses (accounting format for negative)
  const isNegativeAccounting = value.includes('(') && value.includes(')');

  // Remove currency symbols, spaces, parentheses, and other non-numeric characters except digits, decimal, group, minus, plus
  let cleaned = value
    .replace(/[^\d\-+.,]/g, ''); // Remove currency symbols, letters, parentheses, and spaces

  // Remove group separators (thousand separators)
  const groupEscaped = group.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  cleaned = cleaned.replace(new RegExp(groupEscaped, 'g'), '');

  // Normalize decimal separator to period
  if (decimal !== '.') {
    // Replace the decimal separator with period
    // Only replace the last occurrence to handle cases where both separators might appear
    const lastDecimalIndex = cleaned.lastIndexOf(decimal);
    if (lastDecimalIndex !== -1) {
      cleaned = cleaned.substring(0, lastDecimalIndex) + '.' + cleaned.substring(lastDecimalIndex + 1);
    }
  }

  // Remove any remaining non-numeric characters except minus, plus, and period
  cleaned = cleaned.replace(/[^\d\-+.]/g, '');

  const parsed = parseFloat(cleaned);
  
  // Apply negative sign if accounting format
  const result = isNegativeAccounting && parsed > 0 ? -parsed : parsed;
  
  return isNaN(result) ? null : result;
}

/**
 * Validates if a value is a valid currency amount
 * @param value The value to validate
 * @param options Validation options
 * @returns Validation result object with isValid flag, optional error message, and parsed value
 * 
 * @example
 * currencyValidate('$100', { required: true, min: 0 }) 
 * // { isValid: true, value: 100 }
 * 
 * currencyValidate('', { required: true }) 
 * // { isValid: false, invalidMessage: 'Currency value is required', value: null }
 * 
 * currencyValidate('-$50', { allowNegative: false }) 
 * // { isValid: false, invalidMessage: 'Negative values are not allowed', value: -50 }
 */
function currencyValidate(
  value: string | number | null | undefined,
  options: {
    required?: boolean;
    min?: number;
    max?: number;
    allowNegative?: boolean;
  } = {}
): {
  isValid: boolean;
  invalidMessage?: string;
  value?: number | null;
} {
  const { required = false, min, max, allowNegative = false } = options;

  // Check if empty
  if (value === null || value === undefined || value === '') {
    if (required) {
      return {
        isValid: false,
        invalidMessage: 'Currency value is required',
        value: null,
      };
    }
    return { isValid: true, value: null };
  }

  // Parse to number
  const numericValue = currencyToNumber(value);

  if (numericValue === null) {
    return {
      isValid: false,
      invalidMessage: 'Invalid currency format',
      value: null,
    };
  }

  // Validate negative values
  if (!allowNegative && numericValue < 0) {
    return {
      isValid: false,
      invalidMessage: 'Negative values are not allowed',
      value: numericValue,
    };
  }

  // Validate minimum
  if (min !== undefined && numericValue < min) {
    return {
      isValid: false,
      invalidMessage: `Value must be at least ${min}`,
      value: numericValue,
    };
  }

  // Validate maximum
  if (max !== undefined && numericValue > max) {
    return {
      isValid: false,
      invalidMessage: `Value must be at most ${max}`,
      value: numericValue,
    };
  }

  return { isValid: true, value: numericValue };
}

/**
 * Converts an amount from one currency to another using a provided exchange rate
 * @param amount The amount to convert
 * @param fromCurrency The source currency code (for reference, not used in calculation)
 * @param toCurrency The target currency code (for reference, not used in calculation)
 * @param exchangeRate The exchange rate to apply (1 fromCurrency = exchangeRate toCurrency)
 * @param decimals Optional number of decimal places to round to (preserves full precision if not provided)
 * @returns Converted amount
 * 
 * @example
 * currencyConvert(100, 'USD', 'EUR', 0.85) // 85
 * currencyConvert(100, 'USD', 'EUR', 0.85234, 2) // 85.23
 * currencyConvert(50, 'GBP', 'USD', 1.27) // 63.5
 * currencyConvert(50, 'GBP', 'USD', 1.27456, 4) // 63.7280
 */
function currencyConvert(
  amount: number | string | null | undefined,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number,
  decimals?: number
): number | null {
  // Handle null/undefined/empty
  if (amount === null || amount === undefined || amount === '') {
    return null;
  }

  // Convert to number if string
  const numericAmount = typeof amount === 'string' ? currencyToNumber(amount) : amount;

  if (numericAmount === null || isNaN(numericAmount)) {
    console.warn(`currencyConvert: Invalid amount "${amount}"`);
    return null;
  }

  if (typeof exchangeRate !== 'number' || isNaN(exchangeRate)) {
    console.warn(`currencyConvert: Invalid exchange rate "${exchangeRate}"`);
    return null;
  }

  // Perform conversion
  const converted = numericAmount * exchangeRate;

  // Apply decimal rounding if specified
  if (decimals !== undefined) {
    return Number(converted.toFixed(decimals));
  }

  return converted;
}

export const currencyFunctions = {
  currencyFormat,
  currencyToNumber,
  currencyValidate,
  currencyConvert,
};
