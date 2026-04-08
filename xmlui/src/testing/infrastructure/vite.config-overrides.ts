import { defineConfig } from "vite";

// Pre-bundle heavy dependencies so Vite doesn't need to transform them
// on-demand during the first test page load. This reduces the cold-start
// latency of the dev server for E2E tests.
export default defineConfig({
  optimizeDeps: {
    include: [
      "react",
      "react/jsx-runtime",
      "react-dom",
      "react-dom/client",
      "react-router-dom",
      "@tanstack/react-query",
      "@tanstack/react-table",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-select",
      "@radix-ui/react-slider",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "react-hot-toast",
      "react-helmet-async",
      "react-markdown",
      "react-day-picker",
      "immer",
      "lodash-es",
      "date-fns",
      "classnames",
      "framer-motion",
      "overlayscrollbars",
      "overlayscrollbars-react",
      "js-yaml",
    ],
  },
});
