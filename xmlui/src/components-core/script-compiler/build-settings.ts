/**
 * Script-compilation settings the build tooling resolved and baked into the app.
 *
 * `compileScripts` has two consumers that used to disagree:
 *
 * - the **build tooling** (`xmlui start` / `xmlui build`), which pre-compiles event
 *   handlers and script declaration functions into the emitted modules, and
 * - the **browser runtime**, which compiles binding expressions — every `var.`
 *   initializer and every attribute binding — on first evaluation, because prop values
 *   are parsed lazily in the browser and therefore have no build-time artifact.
 *
 * The build tooling reads the switch from `xmlui.config.json` *and* from the app
 * description; the runtime only ever saw the app description. An app that configured
 * `compileScripts` solely in `xmlui.config.json` — the documented place for it — got
 * its handlers and declarations compiled while every binding silently stayed
 * interpreted, which is exactly the hot, reactive half of an app.
 *
 * `createXmluiAppDefines` now bakes the settings `xmlui.config.json` states into the
 * app, and this module reads them back. The values are tri-state on purpose:
 * `undefined` means "the config file said nothing", so the app description keeps
 * deciding, and `false` means the file turned the switch off and must win over the
 * description — the precedence the documentation promises.
 */

export type BuildScriptCompilationSettings = {
  compileScripts?: boolean;
  reportCompileFallbacks?: boolean;
};

/**
 * `import.meta.env` values survive `define` substitution as strings, and the whole
 * `import.meta.env` object is absent in non-Vite hosts (a plain Node test run, an
 * embedding bundler). Both cases must read as "not stated".
 */
function readFlag(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return undefined;
}

export function readBuildScriptCompilationSettings(): BuildScriptCompilationSettings {
  let env: Record<string, any> | undefined;
  try {
    env = import.meta.env as Record<string, any> | undefined;
  } catch {
    // --- Not a Vite host; nothing was baked in.
    return {};
  }
  const compileScripts = readFlag(env?.VITE_XMLUI_COMPILE_SCRIPTS);
  const reportCompileFallbacks = readFlag(env?.VITE_XMLUI_REPORT_COMPILE_FALLBACKS);
  return {
    ...(compileScripts === undefined ? {} : { compileScripts }),
    ...(reportCompileFallbacks === undefined ? {} : { reportCompileFallbacks }),
  };
}

/**
 * Layers the build-resolved settings on top of a merged `xmluiConfig`, so every
 * consumer of `appContext.xmluiConfig` — binding evaluation, event handlers, the
 * startup banner, the Inspector — reads one answer.
 */
export function applyBuildScriptCompilationSettings<T extends Record<string, any>>(
  merged: T,
): T {
  const settings = readBuildScriptCompilationSettings();
  if (settings.compileScripts === undefined && settings.reportCompileFallbacks === undefined) {
    return merged;
  }
  return { ...merged, ...settings };
}
