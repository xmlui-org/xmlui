// Extension registry for test environment
// Maps extension IDs to their import functions
// This file is intentionally kept in the browser-side testing infrastructure
// to ensure extensions are loaded in the browser context where Vite can handle SCSS

export const extensionRegistry: Record<string, () => Promise<any>> = {
  "xmlui-recharts": () => import("xmlui-recharts"),
  "xmlui-pdf": () => import("xmlui-pdf"),
  "xmlui-search": () => import("xmlui-search"),
  "xmlui-website-blocks": () => import("xmlui-website-blocks"),
  "xmlui-animations": () => import("xmlui-animations"),
  "xmlui-docs-blocks": () => import("xmlui-docs-blocks"),
  "xmlui-echart": () => import("xmlui-echart"),
  "xmlui-gauge": () => import("xmlui-gauge"),
  "xmlui-masonry": () => import("xmlui-masonry"),
  "xmlui-tiptap-editor": () => import("xmlui-tiptap-editor"),
  "xmlui-crm-blocks": () => import("xmlui-crm-blocks"),
  "xmlui-calendar": () => import("xmlui-calendar"),
  "xmlui-grid-layout": () => import("xmlui-grid-layout"),
  // Add more extensions here as needed:
  // "xmlui-spreadsheet": () => import("xmlui-spreadsheet"),
};
