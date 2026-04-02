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
  "xmlui-docs-blocks": () => import("../../../../packages/xmlui-docs-blocks/src/index"),
  "xmlui-echart": () => import("../../../../packages/xmlui-echart/src/index"),
  "xmlui-gauge": () => import("../../../../packages/xmlui-gauge/src/index"),
  "xmlui-masonry": () => import("../../../../packages/xmlui-masonry/src/index"),
  "xmlui-tiptap-editor": () => import("../../../../packages/xmlui-tiptap-editor/src/index"),
  "xmlui-crm-blocks": () => import("../../../../packages/xmlui-crm-blocks/src/index"),
  // Add more extensions here as needed:
  // "xmlui-spreadsheet": () => import("../../../../packages/xmlui-spreadsheet/src/index"),
};
