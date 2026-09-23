// import.meta.env is undefined in plain browser (no Vite); Vite replaces it at build time.
if (import.meta.env) {
  // Vite mode (start / build / ssg): Vite resolves the dynamic import at build time
  const { init } = await import("./vite-entrypoint.js");
  init();
} else {
  // Standalone mode: load UMD bundles then kick off the app.
  // With top-level await, Chrome fires DOMContentLoaded before this module
  // completes, so the bundle is appended to an already-parsed document. The
  // standalone entry point detects that via document.readyState and boots
  // itself — this module deliberately does nothing to help, so these tests
  // cover the late-load path (xmlui-org/xmlui#3786).
  const load = (src) =>
    new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  await load("/public/js/xmlui-standalone.umd.js");
  await load("/public/js/xmlui-test-extension.js");
}
