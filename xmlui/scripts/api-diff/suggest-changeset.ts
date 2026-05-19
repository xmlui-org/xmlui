/**
 * Changeset suggester (plan #12 Phase 3 Step 3.2 + 3.3).
 *
 * Given a `DiffReport`, scans `.changeset/*.md` for entries that satisfy
 * the recommended bump and emits a Markdown report describing the
 * coverage. The function does NOT modify the changeset directory — the
 * human is expected to confirm the suggestion.
 *
 * Repo convention (`AGENTS.md`): every entry is `patch` unless the diff
 * demands otherwise. This suggester only escalates when metadata forces
 * a higher bump.
 */

import type { BumpType, DiffReport } from "./diff";

export interface ChangesetEntry {
  file: string;
  packages: Record<string, BumpType>;
  body: string;
}

export interface SuggestionResult {
  required: BumpType;
  covered: boolean;
  /** When `covered === false`, a Markdown explanation suitable for surfacing in CI. */
  report: string;
  allowPatch?: boolean;
}

export interface SuggestOptions {
  /**
   * Set by `--allow-patch` to accept a `patch` changeset even when the
   * diff demands `minor` / `major`. The override is recorded in the
   * report body for downstream review.
   */
  allowPatch?: boolean;
  /** Package name to consider (defaults to `"xmlui"`). */
  packageName?: string;
}

const BUMP_RANK: Record<BumpType, number> = { patch: 0, minor: 1, major: 2 };

export function suggestChangeset(
  diff: DiffReport,
  changesets: readonly ChangesetEntry[],
  opts?: SuggestOptions,
): SuggestionResult {
  const required = diff.bump;
  const pkg = opts?.packageName ?? "xmlui";
  const stagedBumps = changesets
    .map((c) => c.packages[pkg])
    .filter((b): b is BumpType => b != null);
  const highestStaged = stagedBumps.reduce<BumpType>(
    (acc, b) => (BUMP_RANK[b] > BUMP_RANK[acc] ? b : acc),
    "patch",
  );
  const covered =
    stagedBumps.length > 0 && BUMP_RANK[highestStaged] >= BUMP_RANK[required];

  if (covered) {
    return {
      required,
      covered: true,
      report: `Changeset coverage OK: required \`${required}\`, staged \`${highestStaged}\`.`,
    };
  }

  if (opts?.allowPatch && required !== "patch") {
    return {
      required,
      covered: true,
      allowPatch: true,
      report:
        `Override accepted: diff demands \`${required}\` but \`--allow-patch\` was provided.\n` +
        `Repo convention is \`patch\`; record the rationale in the changeset body.`,
    };
  }

  const reasons = diff.deltas
    .filter((d) => BUMP_RANK[d.bump] >= BUMP_RANK[required])
    .map((d) => {
      const target = d.propName ?? d.eventName ?? d.methodName ?? "";
      const where = target ? `${d.componentName}.${target}` : d.componentName;
      return `- \`${d.kind}\` on \`${where}\`${d.detail ? ` — ${d.detail}` : ""} (bump: \`${d.bump}\`)`;
    });

  const report =
    `Repo convention is \`patch\`; this change requires \`${required}\` for the following reasons:\n` +
    `${reasons.join("\n")}\n\n` +
    `Staged changeset bump for \`${pkg}\`: \`${highestStaged}\`. ` +
    `Add or upgrade a changeset entry to \`${required}\`, or re-run with \`--allow-patch\` ` +
    `and document the rationale in the changeset body.`;

  return { required, covered: false, report };
}

/**
 * Tiny parser for changeset `.md` files. Recognises the leading YAML
 * block of `package: bump` pairs.
 */
export function parseChangeset(file: string, contents: string): ChangesetEntry {
  const packages: Record<string, BumpType> = {};
  const frontMatchEnd = contents.indexOf("---", 3);
  let body = contents;
  if (contents.startsWith("---") && frontMatchEnd > 0) {
    const head = contents.slice(3, frontMatchEnd).trim();
    body = contents.slice(frontMatchEnd + 3).trim();
    for (const line of head.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const m = /^"?([^":]+)"?\s*:\s*(patch|minor|major)\s*$/i.exec(trimmed);
      if (m) {
        packages[m[1].trim()] = m[2].toLowerCase() as BumpType;
      }
    }
  }
  return { file, packages, body };
}
