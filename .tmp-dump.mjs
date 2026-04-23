import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ baseURL: "http://localhost:3211", serviceWorkers: "allow" });
const page = await ctx.newPage();
const app = {
  name: "test bed app",
  themes: [{ id: "test", name: "Test", extends: "xmlui",
    themeVars: { "backgroundColor-Button-primary-solid": "rgb(255, 0, 0)" } }],
  defaultTheme: "test",
  components: [],
  entryPoint: { type: "Fragment", children: [
    { type: "Button", props: { variant: "solid", themeColor: "primary" }, testId: "test-id-component" } ] },
  runtime: {},
};
await page.addInitScript((a) => {
  window.TEST_ENV = a;
  window.TEST_RUNTIME = a.runtime;
  window.TEST_EXTENSION_IDS = [];
}, app);
await page.goto("/");
await page.getByTestId("test-id-component").waitFor({ state: "attached", timeout: 5000 });
const info = await page.evaluate(() => {
  const btn = document.querySelector('[data-testid="test-id-component"]');
  const matched = [];
  for (const sheet of Array.from(document.styleSheets)) {
    function walk(rule) {
      if (rule.cssRules) for (const r of Array.from(rule.cssRules)) walk(r);
      if (rule.selectorText) {
        try {
          if (btn.matches(rule.selectorText)) {
            const txt = rule.cssText;
            if (txt.includes("background")) {
              matched.push({ sel: rule.selectorText, cssText: txt.slice(0, 500) });
            }
          }
        } catch {}
      }
    }
    try { for (const r of Array.from(sheet.cssRules)) walk(r); } catch {}
  }
  return { className: btn.className, matched };
});
console.log("classes:", info.className);
console.log("matched rules with background:");
for (const r of info.matched) console.log("---\n", r.sel, "\n", r.cssText);
await browser.close();
