import { test as base, type Page } from "@playwright/test";

export const projectNames = {
  STANDALONE: "standalone",
  VITE_BUILD: "vite-build",
  VITE_SSG: "vite-ssg",
  VITE_START: "vite-start",
  VITE_BUILD_PLUGIN: "vite-build-plugin",
} as const;

export type ProjectName = (typeof projectNames)[keyof typeof projectNames];

type ExtendedPage = Page & {
  /**
   * Navigate to a path, automatically applying the correct URL scheme
   * for the current project mode.
   *
   * - **SSG**: paths are used as-is (no hash prefix).
   * - **All other modes**: paths are prefixed with `#/` (hash routing).
   *
   * Paths that already start with `#` are passed through unchanged.
   *
   * @example
   *   await page.gotoWithMode("/about");  // navigates to /about or /#/about
   */
  gotoWithMode: (path: string, options?: Parameters<Page["goto"]>[1]) => ReturnType<Page["goto"]>;
};

export const test = base.extend<{ page: ExtendedPage }>({
  page: async ({ page }, use, testInfo) => {
    const useHash = testInfo.project.name !== projectNames.VITE_SSG;
    const prefix = useHash ? "/#" : "";

    (page as ExtendedPage).gotoWithMode = (path, options) => {
      if (path.startsWith("#")) {
        return page.goto(path, options);
      }
      const normalized = path.startsWith("/") ? path : `/${path}`;
      return page.goto(`${prefix}${normalized}`, options);
    };

    await use(page as ExtendedPage);
  },
});

export { expect } from "@playwright/test";
