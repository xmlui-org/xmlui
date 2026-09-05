/**
 * Counts the parse-time script artifacts an app actually shipped.
 *
 * The startup banner used to report the *requested* compilation flags, so it read
 * "compiled" whether the build had produced 700 artifacts or none at all. This walk
 * lets it report what is really there, and name the constructs behind any fallback.
 */
export type ParsedScriptInventory = {
  /** Parsed script blocks found in the app definition. */
  total: number;
  /** Blocks that carry a compiled JavaScript artifact. */
  compiled: number;
  /** Blocks the compiler refused; `reasons` says why. */
  unsupported: number;
  /**
   * Blocks with neither an artifact nor an "unsupported" marker — compilation never
   * ran for them at build time, so they are compiled on first use instead.
   */
  notAttempted: number;
  /** Distinct fallback reasons, in first-seen order. */
  reasons: string[];
};

const MAX_TRACKED_REASONS = 10;

export function collectParsedScriptInventory(value: unknown): ParsedScriptInventory {
  const inventory: ParsedScriptInventory = {
    total: 0,
    compiled: 0,
    unsupported: 0,
    notAttempted: 0,
    reasons: [],
  };
  const seenReasons = new Set<string>();
  const visited = new Set<unknown>();

  const walk = (node: unknown): void => {
    if (!node || typeof node !== "object") {
      return;
    }
    if (visited.has(node)) {
      return;
    }
    visited.add(node);

    const parsed = node as {
      compiled?: unknown;
      compiledUnsupported?: boolean;
      compiledUnsupportedReason?: string;
    };
    // --- Every compilable slot carries a boolean `compiledUnsupported`, whether it is
    // --- an event handler or a code-behind function declaration.
    if (typeof parsed.compiledUnsupported === "boolean") {
      inventory.total++;
      if (parsed.compiled) {
        inventory.compiled++;
      } else if (parsed.compiledUnsupported === true) {
        inventory.unsupported++;
        const reason = parsed.compiledUnsupportedReason;
        if (reason && !seenReasons.has(reason) && seenReasons.size < MAX_TRACKED_REASONS) {
          seenReasons.add(reason);
          inventory.reasons.push(reason);
        }
      } else {
        inventory.notAttempted++;
      }
    }

    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    Object.values(node as Record<string, unknown>).forEach(walk);
  };

  walk(value);
  return inventory;
}

/**
 * The line the startup banner adds under the execution-mode line: what the build
 * produced, what fell back, and why.
 */
export function formatParsedScriptInventory(inventory: ParsedScriptInventory): string {
  if (inventory.total === 0) {
    return "[xmlui] No parsed script blocks found in the app definition.";
  }
  if (inventory.compiled === 0 && inventory.unsupported === 0) {
    return (
      `[xmlui] Script compilation is on, but none of the ${inventory.total} script block(s) ` +
      `carry a build-time artifact — they are compiled on first use instead. To pre-compile ` +
      `them, set "compileScripts" in xmlui.config.json (or in the app description read by ` +
      `xmlui start / xmlui build).`
    );
  }
  const parts = [
    `${inventory.compiled} compiled at build time`,
    `${inventory.unsupported} fell back to interpretation`,
  ];
  if (inventory.notAttempted > 0) {
    parts.push(`${inventory.notAttempted} compiled on first use`);
  }
  const reasons =
    inventory.reasons.length > 0 ? ` Fallback reasons: ${inventory.reasons.join("; ")}.` : "";
  return `[xmlui] Script artifacts: ${parts.join(", ")}.${reasons}`;
}

/**
 * Configuration keys that used to steer script compilation. They are inert now, so an
 * app still carrying one is told what replaced it — once per page load, at startup,
 * next to the compilation report.
 */
const REMOVED_COMPILATION_KEYS: Record<string, string> = {
  compileBindings: '"compileScripts" now covers bindings, handlers, and code-behind alike',
  compileEventHandlers: '"compileScripts" now covers bindings, handlers, and code-behind alike',
  compiledScriptSourceMaps: "source maps are automatic: on under `xmlui start`, off in builds",
  logCompiledEventHandlerSource:
    'use "reportCompileFallbacks" for fallback diagnostics, or `xsVerbose` for per-artifact traces',
};

/** The notices an app's configuration has earned, empty when it uses the current keys. */
export function collectRemovedCompilationKeyNotices(
  xmluiConfig: Record<string, any> | undefined,
): string[] {
  if (!xmluiConfig) {
    return [];
  }
  return Object.entries(REMOVED_COMPILATION_KEYS)
    .filter(([key]) => xmluiConfig[key] !== undefined)
    .map(([key, advice]) => `[xmlui] "${key}" is no longer supported — ${advice}.`);
}
