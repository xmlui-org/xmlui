import { defineConfig } from "@playwright/test";

const reuseExistingServer = process.env.XMLUI_REUSE_EXISTING_SERVER !== "0";

export default defineConfig({
  testDir: ".",
  timeout: 10_000,
  testMatch: [
    "packages/**/*.e2e.spec.ts",
    "packages/xmlui-search/src/Search.spec.ts",
    "packages/xmlui-website-blocks/src/Backdrop/Backdrop.spec.ts",
    "packages/xmlui-website-blocks/src/Breakout/Breakout.spec.ts",
    "packages/xmlui-website-blocks/src/Carousel/Carousel.spec.ts",
    "packages/xmlui-website-blocks/src/HeroSection/HeroSection.spec.ts",
    "packages/xmlui-docs-blocks/src/blog/Share.spec.ts",
    "packages/xmlui-docs-blocks/src/docs/DocsBlocks.spec.ts",
    "packages/xmlui-gauge/src/Gauge.spec.ts",
    "packages/xmlui-echart/src/EChart.spec.ts",
    "packages/xmlui-masonry/src/Masonry.spec.ts",
    "packages/xmlui-tiptap-editor/src/TiptapEditor.spec.ts",
    "packages/xmlui-calendar/src/Calendar.spec.ts",
    "packages/xmlui-grid-layout/src/GridLayout.spec.ts",
    "packages/xmlui-ai-blocks/src/AiConversation.spec.ts",
    "packages/xmlui-animations/src/Animation.spec.ts",
    "packages/xmlui-crm-blocks/src/components/TableSelect.spec.ts",
    "packages/xmlui-pdf/src/Pdf.spec.ts",
  ],
  fullyParallel: true,
  workers: process.env.CI ? "80%" : "75%",
  reporter: process.env.CI ? [["github"], ["html"]] : [["html", { open: "never" }]],
  expect: { timeout: 10_000 },
  webServer: {
    command: "npm --workspace xmlui run dev -- --host 127.0.0.1 --port 5173",
    url: "http://127.0.0.1:5173/",
    reuseExistingServer,
  },
  use: {
    baseURL: "http://127.0.0.1:5173/",
  },
});
