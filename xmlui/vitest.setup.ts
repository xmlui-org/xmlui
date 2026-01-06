import "@testing-library/jest-dom/vitest";
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock console methods to reduce noise in test output (optional)
// Uncomment if needed
// global.console = {
//   ...console,
//   warn: vi.fn(),
//   error: vi.fn(),
// };
