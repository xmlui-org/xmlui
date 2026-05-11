import "@testing-library/jest-dom/vitest";
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// ResizeObserver is used by @formkit/auto-animate (a transitive dep of the Form
// component). It is not available in jsdom; stub it globally for all tests.
if (typeof globalThis.ResizeObserver === "undefined") {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
}

// Mock console methods to reduce noise in test output (optional)
// Uncomment if needed
// global.console = {
//   ...console,
//   warn: vi.fn(),
//   error: vi.fn(),
// };
