/**
 * ScriptExtractor: Utility for extracting inline script content from XMLUI markup
 * Provides a centralized way to handle `<script>` tag extraction with consistent parsing.
 */

/**
 * Result of script extraction
 */
export interface ScriptExtractionResult {
  /**
   * The extracted script content (without <script> tags)
   */
  script: string;

  /**
   * The original markup with the script tag removed
   */
  cleanedMarkup: string;
}

/**
 * Extracts inline script from XMLUI markup
 * Finds the first `<script>...</script>` tag and extracts its content.
 * The rest of the markup (without the script tag) is returned as cleanedMarkup.
 *
 * @param markup The XMLUI markup to extract script from
 * @returns Object with extracted script and cleaned markup, or null if no script found
 *
 * @example
 * ```typescript
 * const result = ScriptExtractor.extractInlineScript(
 *   '<div>Hello</div><script>function test() {}</script>'
 * );
 * if (result) {
 *   console.log(result.script);  // 'function test() {}'
 *   console.log(result.cleanedMarkup);  // '<div>Hello</div>'
 * }
 * ```
 */
export class ScriptExtractor {
  /**
   * Regex pattern for matching script tags
   * Uses non-greedy matching to capture content between first <script> and </script>
   */
  private static readonly SCRIPT_PATTERN = /<script>([\s\S]*?)<\/script>/;

  /**
   * Extracts inline script from markup
   * @param markup The markup to extract from
   * @returns Extraction result or null if no script found
   */
  static extractInlineScript(markup: string): ScriptExtractionResult | null {
    const match = markup.match(this.SCRIPT_PATTERN);
    
    if (!match || !match[1]) {
      return null;
    }

    const script = match[1];
    const cleanedMarkup = markup.replace(this.SCRIPT_PATTERN, "");

    return {
      script,
      cleanedMarkup,
    };
  }

  /**
   * Checks if markup contains an inline script
   * @param markup The markup to check
   * @returns True if markup contains a script tag
   */
  static hasInlineScript(markup: string): boolean {
    return this.SCRIPT_PATTERN.test(markup);
  }

  /**
   * Extracts script content only (without cleanup)
   * @param markup The markup to extract from
   * @returns Script content or null if no script found
   */
  static extractScriptContent(markup: string): string | null {
    const match = markup.match(this.SCRIPT_PATTERN);
    return match ? match[1] : null;
  }

  /**
   * Removes script tags from markup
   * @param markup The markup to clean
   * @returns Markup without script tags
   */
  static removeScriptTags(markup: string): string {
    return markup.replace(this.SCRIPT_PATTERN, "");
  }
}
