import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const xmluiRoot = resolve(scriptDir, "..");
const reportDir = resolve(xmluiRoot, ".compatibility-report");

const report = {
  schemaVersion: 1,
  generatedAt: new Date(0).toISOString(),
  oldSourceAnchors: [
    "/Users/dotneteer/source/xmlui/xmlui/src/components/DataSource",
    "/Users/dotneteer/source/xmlui/xmlui/src/components/APICall",
    "/Users/dotneteer/source/xmlui/xmlui/src/components/Form",
    "/Users/dotneteer/source/xmlui/xmlui/src/components/FormItem",
    "/Users/dotneteer/source/xmlui/xmlui/src/components/Pages",
    "/Users/dotneteer/source/xmlui/xmlui/src/components/NavLink",
    "/Users/dotneteer/source/xmlui/xmlui/src/components/App",
    "/Users/dotneteer/source/xmlui/website/content/docs/pages/howto/show-toast-notifications-from-code.md",
  ],
  implementedSlices: [
    "DataSource mockData, fetch, resultSelector, transformResult, refetch, polling, loaded/error events",
    "APICall execute, beforeRequest/success/error/mockExecute events, invalidates",
    "Actions.callApi and Actions.navigate handler references",
    "Pages/Page/NavLink hash/history routing, route params, query params, fallback paths",
    "App-scoped toast service with toast(), toast.success(), toast.error(), toast.loading(), and toast.dismiss()",
  ],
  deferred: [
    "Full form context, validators, binding, dirty/touched state, and nested form behavior",
    "Full request builders, upload/download, cancellation, stale-response handling, tracing, and inspector hooks",
    "Confirmation, modal, queue, timer, event-source, websocket, lifecycle, i18n, audit, and accessibility services",
    "Full App shell navigation regions, mobile shell, search/index collection, page metadata, and config loading",
  ],
};

const markdown = [
  "# XMLUI Runtime Artifact Report",
  "",
  `Generated: ${report.generatedAt}`,
  "",
  "## Old Source Anchors",
  "",
  ...report.oldSourceAnchors.map((anchor) => `- \`${anchor}\``),
  "",
  "## Implemented Slices",
  "",
  ...report.implementedSlices.map((item) => `- ${item}`),
  "",
  "## Deferred",
  "",
  ...report.deferred.map((item) => `- ${item}`),
  "",
].join("\n");

await mkdir(reportDir, { recursive: true });
await writeFile(resolve(reportDir, "runtime-artifact-latest.json"), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(resolve(reportDir, "runtime-artifact-latest.md"), markdown);

console.log(`[runtime-artifact] wrote ${resolve(reportDir, "runtime-artifact-latest.json")}`);
console.log(`[runtime-artifact] wrote ${resolve(reportDir, "runtime-artifact-latest.md")}`);

