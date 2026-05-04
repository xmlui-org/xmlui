// import.meta.env is undefined in plain browser (no Vite); Vite replaces it at build time.
if (import.meta.env) {
  // Vite mode (start / build / ssg): Vite resolves the dynamic import at build time
  const { init } = await import("./vite-entrypoint.ts");
  init();
} else {
  // Standalone mode: load UMD bundles then kick off the app.
  // With top-level await, Chrome fires DOMContentLoaded before this module
  // completes, so the UMD's DOMContentLoaded startup listener will have
  // already missed its event by the time the scripts are appended.
  // We therefore re-dispatch DOMContentLoaded ourselves after loading.
  const load = (src) =>
    new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  await load("./xmlui-standalone.umd.js");
  await load("./xmlui-test-extension.js");
  // Retrigger DOMContentLoaded so the UMD's startup handler fires.
  document.dispatchEvent(new Event("DOMContentLoaded"));
}
