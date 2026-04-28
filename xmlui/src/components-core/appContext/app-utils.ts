import { pushXsLog } from "../inspector/inspectorUtils";

// =============================================================================
// App.randomBytes(n)
// =============================================================================

/**
 * Returns `n` cryptographically random bytes as a `Uint8Array`.
 *
 * `n` must be an integer in the range [1, 1024]. The length of the request
 * (but never the bytes themselves) is pushed to the Inspector trace so
 * entropy consumption is observable.
 *
 * This is the sanctioned replacement for the banned `crypto.getRandomValues`.
 */
export function randomBytes(n: number): Uint8Array {
  if (!Number.isInteger(n) || n < 1 || n > 1024) {
    throw new RangeError(`App.randomBytes: n must be an integer in [1, 1024], got ${n}.`);
  }
  const buf = new Uint8Array(n);
  crypto.getRandomValues(buf);
  pushXsLog({ kind: "app:randomBytes", ts: Date.now(), n });
  return buf;
}

// =============================================================================
// App.now() / App.mark() / App.measure()
// =============================================================================

/**
 * Returns a high-resolution timestamp (milliseconds, fractional) relative to
 * the navigation start — equivalent to `performance.now()`.
 *
 * This is the sanctioned replacement for the banned `performance` global.
 */
export function now(): number {
  return performance.now();
}

const _marks = new Map<string, number>();

/**
 * Records a named timing mark. The mark and its timestamp are pushed to the
 * Inspector trace so they appear in the DevTools timeline without polluting
 * the browser's own Performance buffer.
 */
export function mark(label: string): void {
  const ts = performance.now();
  _marks.set(label, ts);
  pushXsLog({ kind: "app:mark", ts: Date.now(), label, perfTs: ts });
}

/**
 * Measures the elapsed time between `fromMark` and the current instant (or
 * between `fromMark` and `toMark`). Pushes the result to the Inspector trace.
 *
 * @returns Elapsed milliseconds, or `NaN` if `fromMark` was never set.
 */
export function measure(label: string, fromMark: string, toMark?: string): number {
  const start = _marks.get(fromMark);
  if (start === undefined) return NaN;
  const end = toMark !== undefined ? (_marks.get(toMark) ?? performance.now()) : performance.now();
  const duration = end - start;
  pushXsLog({ kind: "app:measure", ts: Date.now(), label, fromMark, toMark, duration });
  return duration;
}

// =============================================================================
// Clipboard.copy(text)
// =============================================================================

/**
 * Writes `text` to the system clipboard.
 *
 * This is the sanctioned replacement for the banned `navigator.clipboard.writeText`.
 * The call is logged to the Inspector trace on every invocation.
 *
 * @throws {Error} If the clipboard API is unavailable (non-HTTPS context, denied
 *   permission, or SSR environment).
 */
export async function clipboardCopy(text: string): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    throw new Error("Clipboard.copy: the Clipboard API is not available in this context.");
  }
  await navigator.clipboard.writeText(text);
  pushXsLog({ kind: "clipboard:copy", ts: Date.now(), length: text.length });
}

export const AppUtilsNamespace = {
  randomBytes,
  now,
  mark,
  measure,
};

export const ClipboardNamespace = {
  copy: clipboardCopy,
};
