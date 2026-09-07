// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

// `build()` runs a real Vite build and reads the project's Vite config off disk.
// Both are stubbed here: the point of these tests is the output-directory plumbing,
// not the bundling.
const viteBuildMock = vi.fn(async (_config: any): Promise<void> => undefined);

vi.mock("vite", () => ({
  build: (config: any) => viteBuildMock(config),
}));

vi.mock("../../src/nodejs/bin/viteConfig", () => ({
  getViteConfig: async () => ({
    build: {
      rolldownOptions: { input: "index.html" },
    },
  }),
}));

const { build } = await import("../../src/nodejs/bin/build");

function lastViteConfig() {
  return viteBuildMock.mock.calls.at(-1)![0];
}

describe("build() output directory", () => {
  beforeEach(() => {
    viteBuildMock.mockClear();
  });

  it("writes to dist by default", async () => {
    await build({ buildMode: "INLINE_ALL" });

    expect(lastViteConfig().build.outDir).toBe("dist");
  });

  it("honors an explicit outDir", async () => {
    await build({ buildMode: "INLINE_ALL", outDir: ".xmlui-ssg-dist" });

    expect(lastViteConfig().build.outDir).toBe(".xmlui-ssg-dist");
  });

  it("keeps the rest of the project's build config", async () => {
    await build({ buildMode: "INLINE_ALL", outDir: ".xmlui-ssg-dist" });

    // Regression guard: the outDir override must merge into `build`, not replace it.
    // Replacing it would drop the rolldown input and silently change what gets bundled.
    expect(lastViteConfig().build.rolldownOptions).toEqual({ input: "index.html" });
    expect(lastViteConfig().build.emptyOutDir).toBe(true);
  });
});
