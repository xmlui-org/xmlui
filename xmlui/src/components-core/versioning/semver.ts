/**
 * Tiny semver comparator used by the versioning verifier.
 *
 * Returns:
 *   - negative when `a < b`
 *   - 0       when equal
 *   - positive when `a > b`
 *
 * Pre-release suffixes (e.g. `0.10.0-rc.1`) are stripped before
 * comparison — sufficient for the deprecation/removal lifecycle
 * checks; the api-diff tool uses a richer comparison.
 */
export function compareSemver(a: string, b: string): number {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  if (pa.major !== pb.major) return pa.major - pb.major;
  if (pa.minor !== pb.minor) return pa.minor - pb.minor;
  return pa.patch - pb.patch;
}

interface ParsedSemver {
  major: number;
  minor: number;
  patch: number;
}

export function parseSemver(input: string): ParsedSemver {
  const clean = String(input).split("-")[0].split("+")[0].trim();
  const parts = clean.split(".");
  return {
    major: toInt(parts[0]),
    minor: toInt(parts[1]),
    patch: toInt(parts[2]),
  };
}

function toInt(s: string | undefined): number {
  if (s === undefined) return 0;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : 0;
}
