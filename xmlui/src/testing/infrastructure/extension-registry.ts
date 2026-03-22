// Extension registry for test environment
// Maps extension IDs to their import functions
// This file is intentionally kept in the browser-side testing infrastructure
// to ensure extensions are loaded in the browser context where Vite can handle SCSS

export const extensionRegistry: Record<string, () => Promise<any>> = {
  "xmlui-recharts": () => import("../../../../packages/xmlui-recharts/src/index"),
  "xmlui-pdf": () => import("../../../../packages/xmlui-pdf/src/index"),
  "xmlui-search": () => import("../../../../packages/xmlui-search/src/index"),
  "xmlui-website-blocks": () => import("../../../../packages/xmlui-website-blocks/src/index"),
  "xmlui-animations": () => import("../../../../packages/xmlui-animations/src/index"),
  // Add more extensions here as needed:
  // "xmlui-spreadsheet": () => import("../../../../packages/xmlui-spreadsheet/src/index"),
};
