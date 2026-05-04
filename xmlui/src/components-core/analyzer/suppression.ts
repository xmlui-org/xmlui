/**
 * Diagnostic suppression support.
 *
 * XMLUI markup may suppress specific rules on specific lines using comment
 * directives:
 *
 *   <!-- xmlui-disable-next-line id-unknown-component -->
 *   <Buttn />
 *
 *   <!-- xmlui-disable expr-unused-var -->
 *   ...
 *   <!-- xmlui-enable expr-unused-var -->
 *
 * `buildSuppressionMap` parses a source file's text and returns a map
 * keyed by diagnostic code. Each entry is an array of line ranges
 * `{ from, to }` (1-based, inclusive) within which that code is suppressed.
 *
 * `isSuppressed` answers whether a given (code, line) pair falls within
 * any suppressed range.
 */

export interface SuppressionRange {
  from: number;
  to: number;
}

/** Maps diagnostic code → list of suppression ranges in a single file. */
export type SuppressionMap = ReadonlyMap<string, ReadonlyArray<SuppressionRange>>;

const DISABLE_NEXT_LINE_RE = /<!--\s*xmlui-disable-next-line\s+([\w-]+(?:\s+[\w-]+)*)\s*-->/;
const DISABLE_RE = /<!--\s*xmlui-disable\s+([\w-]+(?:\s+[\w-]+)*)\s*-->/;
const ENABLE_RE = /<!--\s*xmlui-enable\s+([\w-]+(?:\s+[\w-]+)*)\s*-->/;

/**
 * Parse `source` and build a suppression map for it.
 * This is called once per file before running rules.
 */
export function buildSuppressionMap(source: string): SuppressionMap {
  const lines = source.split("\n");
  const result = new Map<string, SuppressionRange[]>();

  // Tracks open `xmlui-disable` regions: code → 1-based start line.
  const openDisables = new Map<string, number>();

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1; // 1-based
    const line = lines[i];

    // --- xmlui-disable-next-line ---
    const nextLineMatch = DISABLE_NEXT_LINE_RE.exec(line);
    if (nextLineMatch) {
      const codes = nextLineMatch[1].trim().split(/\s+/);
      for (const code of codes) {
        if (!result.has(code)) result.set(code, []);
        result.get(code)!.push({ from: lineNo + 1, to: lineNo + 1 });
      }
      continue;
    }

    // --- xmlui-enable ---
    const enableMatch = ENABLE_RE.exec(line);
    if (enableMatch) {
      const codes = enableMatch[1].trim().split(/\s+/);
      for (const code of codes) {
        const start = openDisables.get(code);
        if (start !== undefined) {
          if (!result.has(code)) result.set(code, []);
          result.get(code)!.push({ from: start, to: lineNo - 1 });
          openDisables.delete(code);
        }
      }
      continue;
    }

    // --- xmlui-disable ---
    const disableMatch = DISABLE_RE.exec(line);
    if (disableMatch) {
      const codes = disableMatch[1].trim().split(/\s+/);
      for (const code of codes) {
        if (!openDisables.has(code)) {
          openDisables.set(code, lineNo + 1);
        }
      }
    }
  }

  // Close any unterminated disable regions at the end of the file.
  for (const [code, start] of openDisables) {
    if (!result.has(code)) result.set(code, []);
    result.get(code)!.push({ from: start, to: lines.length });
  }

  return result;
}

/**
 * Return `true` when `(code, line)` falls within a suppressed range in `suppressions`.
 */
export function isSuppressed(
  code: string,
  line: number,
  suppressions: SuppressionMap,
): boolean {
  const ranges = suppressions.get(code);
  if (!ranges) return false;
  for (const range of ranges) {
    if (line >= range.from && line <= range.to) return true;
  }
  return false;
}
