// Extension registry for test environment
// Maps extension IDs to their import functions
// This file is intentionally kept in the browser-side testing infrastructure
// to ensure extensions are loaded in the browser context where Vite can handle SCSS

export const extensionRegistry: Record<string, () => Promise<any>> = {
  "xmlui-pdf": () => import("../../../../packages/xmlui-pdf/src/index"),
  // Add more extensions here as needed:
  // "xmlui-spreadsheet": () => import("../../../../packages/xmlui-spreadsheet/src/index"),
  // "xmlui-animations": () => import("../../../../packages/xmlui-animations/src/index"),
};
