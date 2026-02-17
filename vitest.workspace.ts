import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  // Main xmlui package
  {
    extends: "./xmlui/vitest.config.ts",
    test: {
      name: "xmlui",
      root: "./xmlui",
    },
  },
  // xmlui-pdf extension package
  {
    extends: "./packages/xmlui-pdf/vitest.config.ts",
    test: {
      name: "xmlui-pdf",
      root: "./packages/xmlui-pdf",
    },
  },
]);
