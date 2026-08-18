/**
 * Shared substring-highlight matching core.
 *
 * `Markdown` and `Text` both expose `highlightText` / `highlightActiveIndex`, and a
 * list may mix rows of both kinds under a single find plan — stepping the active
 * index has to walk every match top-to-bottom regardless of which component rendered
 * it. That only holds if both components agree exactly on what a match is and how
 * matches are numbered, so the rules live here once rather than in each component.
 *
 * Nothing in this module knows about React or hast: it turns a string into segments,
 * and each caller renders those in its own node type.
 */

/** One run of text, either a match (`hit`) or the plain text between matches. */
export type HighlightSegment = {
  text: string;
  hit: boolean;
  /** 0-based match number in document order; -1 for non-matching text. */
  ordinal: number;
};

export type ScanResult = {
  segments: HighlightSegment[];
  /** Ordinal the next scan should start from, so numbering continues across nodes. */
  nextOrdinal: number;
  /** True when at least one match was found — callers can skip rewriting a node without one. */
  hasMatch: boolean;
};

/**
 * Normalize the `highlightText` prop (`string | string[]`) to a list of needles.
 * A string stays a single phrase (never whitespace-split — that would break an
 * intentional `"foo bar"` phrase highlight); an array is treated as independent
 * terms. Each needle is trimmed; those shorter than 2 characters are dropped, and
 * case-insensitive duplicates are removed.
 */
export function normalizeNeedles(highlightText?: string | string[]): string[] {
  if (highlightText == null) return [];
  const raw = Array.isArray(highlightText) ? highlightText : [highlightText];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const term of raw) {
    const s = (term ?? "").trim();
    const key = s.toLowerCase();
    if (s.length >= 2 && !seen.has(key)) {
      seen.add(key);
      out.push(s);
    }
  }
  return out;
}

/**
 * Prepare needles for scanning: lowercased and sorted longest-first, so that at any
 * position an overlapping longer term wins (`category` beats `cat`) and matches can
 * never nest or overlap.
 */
export function prepareNeedles(needles: string[]): string[] {
  return needles
    .map((n) => (n || "").toLowerCase())
    .filter((q) => q.length >= 2)
    .sort((a, b) => b.length - a.length);
}

/**
 * Scan `value` for case-insensitive occurrences of any prepared needle, returning the
 * text split into alternating plain and matching segments.
 *
 * Matches are numbered from `startOrdinal` in a single sequence, so a caller walking
 * several nodes in document order passes `nextOrdinal` forward and gets one continuous
 * numbering across all of them — which is what makes `highlightActiveIndex` mean the
 * same thing across a document, and across components.
 *
 * `preparedNeedles` must come from `prepareNeedles`; passing raw needles would lose the
 * longest-first guarantee.
 */
export function scanHighlightSegments(
  value: string,
  preparedNeedles: string[],
  startOrdinal = 0,
): ScanResult {
  if (!value || preparedNeedles.length === 0) {
    return {
      segments: value ? [{ text: value, hit: false, ordinal: -1 }] : [],
      nextOrdinal: startOrdinal,
      hasMatch: false,
    };
  }

  const hay = value.toLowerCase();
  const segments: HighlightSegment[] = [];
  let ordinal = startOrdinal;
  let i = 0; // scan cursor
  let last = 0; // start of pending unmatched text
  let hasMatch = false;

  while (i < value.length) {
    let matchLen = 0;
    for (const q of preparedNeedles) {
      if (hay.startsWith(q, i)) {
        matchLen = q.length;
        break;
      }
    }
    if (matchLen > 0) {
      hasMatch = true;
      if (i > last) {
        segments.push({ text: value.slice(last, i), hit: false, ordinal: -1 });
      }
      segments.push({ text: value.slice(i, i + matchLen), hit: true, ordinal });
      ordinal++;
      i += matchLen;
      last = i;
    } else {
      i++;
    }
  }

  if (!hasMatch) {
    return {
      segments: [{ text: value, hit: false, ordinal: -1 }],
      nextOrdinal: ordinal,
      hasMatch: false,
    };
  }
  if (last < value.length) {
    segments.push({ text: value.slice(last), hit: false, ordinal: -1 });
  }
  return { segments, nextOrdinal: ordinal, hasMatch: true };
}
