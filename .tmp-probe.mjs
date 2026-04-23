import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const ctx = await browser.newContext({ baseURL: "http://localhost:3211", serviceWorkers: "allow" });
const page = await ctx.newPage();

page.on("console", (m) => console.log("[browser]", m.type(), m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message));

const app = {
  name: "test bed app",
  themes: [
    {
      id: "test",
      name: "Test",
      extends: "xmlui",
      themeVars: {
        "backgroundColor-Button-primary-solid": "rgb(255, 0, 0)",
      },
    },
  ],
  defaultTheme: "test",
  components: [],
  entryPoint: {
    type: "Fragment",
    children: [
      { type: "Button", props: { variant: "solid", themeColor: "primary" }, testId: "test-id-component" },
    ],
  },
  runtime: {},
};

await page.addInitScript((appArg) => {
  // @ts-ignore
  window.TEST_ENV = appArg;
  // @ts-ignore
  window.TEST_RUNTIME = appArg.runtime;
  // @ts-ignore
  window.TEST_EXTENSION_IDS = [];
}, app);

await page.goto("/");
await page.waitForLoadState("networkidle");
const btn = page.getByTestId("test-id-component");
await btn.waitFor({ state: "attached", timeout: 5000 }).catch(() => {});
const html = await page.content();
console.log("--- BUTTON HTML ---");
const m = html.match(/<button[^>]*>[\s\S]{0,200}?<\/button>/);
console.log(m ? m[0] : "no button");

const computed = await btn.evaluate((el) => {
  const cs = getComputedStyle(el);
  const elVar = cs.getPropertyValue("--xmlui-backgroundColor-Button-primary-solid");
  const bg = cs.backgroundColor;
  // Walk up parents
  const chain = [];
  let cur = el;
  while (cur) {
    chain.push({
      tag: cur.tagName,
      cls: cur.className?.slice ? cur.className.slice(0, 80) : "",
      bg: getComputedStyle(cur).getPropertyValue("--xmlui-backgroundColor-Button-primary-solid"),
    });
    cur = cur.parentElement;
  }
  // Examine matched rules for background on button
  const rules = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        const txt = rule.cssText || "";
        if (txt.includes("backgroundColor-Button-primary-solid") || txt.includes("_solidPrimary_y0kp7_105")) {
          rules.push(txt.slice(0, 250));
        }
      }
    } catch {}
  }
  return { bg, elVar, chain, rulesCount: rules.length, rulesSample: rules.slice(0, 5) };
}).catch((e) => ({ err: e.message }));
console.log("computed:", JSON.stringify(computed, null, 2));

// Check style tags
const styleTags = await page.evaluate(() => {
  const tags = Array.from(document.querySelectorAll("style"));
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  // Examine all stylesheets
  let totalRules = 0;
  let solidRules = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        totalRules++;
        const txt = rule.cssText || "";
        if (txt.includes("_solidPrimary")) {
          solidRules.push({ href: sheet.href, txt: txt.slice(0, 300) });
        }
      }
    } catch (e) {}
  }
  return {
    styleTagCount: tags.length,
    linkCount: links.length,
    linkHrefs: links.map((l) => l.getAttribute("href")),
    sheetCount: document.styleSheets.length,
    sheetHrefs: Array.from(document.styleSheets).map((s) => s.href),
    totalRules,
    solidRulesFound: solidRules.length,
    solidRules,
  };
});
console.log("css info:", JSON.stringify(styleTags, null, 2));

await browser.close();
