/**
 * URL normalization utilities for consistent handling of query parameters.
 * 
 * Fixes issue #2672: https://github.com/xmlui-org/xmlui/issues/2672
 * Ensures that query parameters embedded in URLs are treated identically to
 * query parameters provided via the queryParams prop, for both cache keys
 * and actual API calls.
 */

/**
 * Normalizes a URL by extracting any embedded query parameters and returning
 * the base URL and merged query parameters separately.
 * 
 * This ensures consistent behavior regardless of whether query params are:
 * - Embedded in the URL string: url="/api/data?id=123"
 * - Provided separately: url="/api/data" queryParams={{ id: 123 }}
 * 
 * @param url - The URL which may contain embedded query parameters
 * @param queryParams - Explicit query parameters (takes precedence over embedded params)
 * @returns Object with baseUrl (without query string) and mergedParams
 */
export function normalizeUrlAndParams(
  url: string | undefined | null,
  queryParams: Record<string, any> | undefined
): { baseUrl: string; mergedParams: Record<string, any> | undefined } {
  // Return early for undefined/null URLs without converting to empty string
  // This preserves the original behavior for error handling
  if (url === undefined || url === null) {
    return { baseUrl: url as any, mergedParams: queryParams };
  }
  
  // Handle empty string separately
  if (url === "") {
    return { baseUrl: url, mergedParams: queryParams };
  }

  // Check if URL contains query parameters
  const queryIndex = url.indexOf('?');
  if (queryIndex === -1) {
    // No embedded query params, return as-is
    return { baseUrl: url, mergedParams: queryParams };
  }

  // Split URL into base and query string
  const baseUrl = url.substring(0, queryIndex);
  const queryString = url.substring(queryIndex + 1);

  // Parse embedded query parameters
  const embeddedParams: Record<string, any> = {};
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((value, key) => {
      // Store the decoded value to match URLSearchParams behavior when building URLs
      embeddedParams[key] = value;
    });
  }

  // Merge embedded params with explicit queryParams
  // Explicit queryParams take precedence over embedded params
  const mergedParams = Object.keys(embeddedParams).length > 0
    ? { ...embeddedParams, ...queryParams }
    : queryParams;

  return { baseUrl, mergedParams };
}
