import { chromium } from "@playwright/test";

const baseURL = process.env.XMLUI_E2E_BASE_URL ?? "http://127.0.0.1:5173";
const extensionPackage = process.env.XMLUI_E2E_EXTENSION_PACKAGE;

export default async function extensionE2eGlobalSetup() {
  if (process.env.XMLUI_E2E_WARMUP === "0") {
    return;
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });
  const extensionIds = extensionPackage ? [extensionPackage] : [];
  try {
    await page.addInitScript((extensionIds) => {
      window.sessionStorage.setItem("__xmluiTestBedSource", "<App />");
      window.sessionStorage.setItem("__xmluiTestBedComponents", "[]");
      window.sessionStorage.setItem("__xmluiTestBedExtensionIds", JSON.stringify(extensionIds));
      window.sessionStorage.setItem("__xmluiTestBedResources", "{}");
      window.sessionStorage.setItem("__xmluiTestBedThemes", "[]");
      window.sessionStorage.removeItem("__xmluiTestBedDefaultTheme");
    }, extensionIds);
    await page.goto("/?__xmluiTestBed=1", { waitUntil: "load", timeout: 60_000 });
    await page.waitForFunction(() => window.__xmluiTestBedReady === true, undefined, {
      timeout: 60_000,
    });
  } finally {
    await browser.close();
  }
}
