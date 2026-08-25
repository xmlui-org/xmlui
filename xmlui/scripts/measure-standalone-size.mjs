#!/usr/bin/env node
/**
 * Standalone bundle-size benchmark.
 *
 * Builds `dist/standalone/xmlui-standalone.umd.js` by default, then reports:
 *   - raw, gzip, and Brotli sizes for the UMD bundle
 *   - sourcemap and declaration artifact sizes
 *   - sourcemap source-content weights grouped by known heavy areas
 *   - largest source-map package/file contributors
 *
 * Usage:
 *   npm run measure:standalone-size
 *   npm run measure:standalone-size -- --no-build
 *   npm run measure:standalone-size -- --sourcemap
 *   npm run measure:standalone-size -- --json
 *   npm run measure:standalone-size -- --out .benchmark-results/custom.json
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const XMLUI_ROOT = resolve(__dirname, "..");
const DIST_ROOT = join(XMLUI_ROOT, "dist", "standalone");
const DEFAULT_OUTPUT = join(XMLUI_ROOT, ".benchmark-results", "standalone-size.json");
const DEFAULT_TOP_COUNT = 25;

const SOURCE_GROUPS = [
  {
    key: "metadata",
    label: "Runtime/live metadata path",
    pattern: /xmlui-metadata-generated|collectedComponentMetadata/,
  },
  {
    key: "markdown",
    label: "Markdown/HTML parsing stack",
    pattern:
      /react-markdown|remark-|rehype-|hast-|mdast-|micromark|unified|vfile|property-information|space-separated|comma-separated|decode-named|parse5|entities|ccount|trim-lines|zwitch|unist-|bail|devlop|html-url|trough|web-namespaces|character-entities|markdown-table|extend|is-plain-obj|fault|escape-string-regexp|decode-named-character-reference|components\/Markdown\//,
  },
  {
    key: "datepicker",
    label: "Date picker/date stack",
    pattern:
      /react-day-picker|date-fns|@internationalized\/date|@zag-js\/date-picker|components\/(DatePicker|DateInput|TimeInput)\//,
  },
  {
    key: "animation",
    label: "Animation stack",
    pattern: /framer-motion|motion-dom|motion-utils|@react-spring|components\/Animation\//,
  },
  {
    key: "mock",
    label: "Mock/MSW stack",
    pattern:
      /msw|@mswjs|@bundled-es-modules|headers-polyfill|outvariant|strict-event-emitter|until-async|path-to-regexp|components-core\/interception\//,
  },
  {
    key: "table",
    label: "Table stack",
    pattern: /@tanstack\/table-core|@tanstack\/react-table|components\/Table\//,
  },
  {
    key: "routing",
    label: "Routing stack",
    pattern: /react-router|@remix-run\/router|components\/Pages\/|components\/Redirect\//,
  },
  {
    key: "lodash",
    label: "Lodash helpers",
    pattern: /lodash-es/,
  },
  {
    key: "tree",
    label: "Tree component",
    pattern: /components\/Tree\//,
  },
  {
    key: "upload",
    label: "File upload/dropzone",
    pattern: /react-dropzone|file-selector|components\/(FileInput|FileUploadDropZone)\//,
  },
  {
    key: "htmltags",
    label: "HTML tag renderers",
    pattern: /components\/HtmlTags\//,
  },
];

function parseArgs(argv) {
  const options = {
    build: true,
    sourcemap: false,
    json: false,
    out: DEFAULT_OUTPUT,
    top: DEFAULT_TOP_COUNT,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--no-build") {
      options.build = false;
    } else if (arg === "--sourcemap") {
      options.sourcemap = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--out") {
      const value = argv[++i];
      if (!value) throw new Error("--out requires a file path");
      options.out = resolve(XMLUI_ROOT, value);
    } else if (arg === "--top") {
      const value = Number.parseInt(argv[++i], 10);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("--top requires a non-negative integer");
      }
      options.top = value;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/measure-standalone-size.mjs [options]

Options:
  --no-build       Measure existing dist/standalone output.
  --sourcemap      Build with XMLUI_STANDALONE_SOURCEMAP=true for hotspot analysis.
  --json           Print only the JSON report to stdout.
  --out <path>     Write JSON report to this path. Defaults to .benchmark-results/standalone-size.json.
  --top <count>    Number of top source contributors to include. Defaults to ${DEFAULT_TOP_COUNT}.
  -h, --help       Show this help.
`);
}

function runBuild(options) {
  const startedAt = Date.now();
  const result = spawnSync("npm", ["run", "build:xmlui-standalone"], {
    cwd: XMLUI_ROOT,
    encoding: "utf8",
    env: {
      ...process.env,
      ...(options.sourcemap ? { XMLUI_STANDALONE_SOURCEMAP: "true" } : {}),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const elapsedMs = Date.now() - startedAt;
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  const moduleMatch = output.match(/([0-9]+)\s+modules transformed/);
  const viteBuildMatch = output.match(/built in ([0-9.]+)(ms|s)/);

  if (result.status !== 0) {
    process.stdout.write(result.stdout ?? "");
    process.stderr.write(result.stderr ?? "");
    throw new Error(`Standalone build failed with exit code ${result.status}`);
  }

  return {
    elapsedMs,
    modulesTransformed: moduleMatch ? Number.parseInt(moduleMatch[1], 10) : null,
    viteBuildMs: viteBuildMatch
      ? viteBuildMatch[2] === "s"
        ? Math.round(Number.parseFloat(viteBuildMatch[1]) * 1000)
        : Math.round(Number.parseFloat(viteBuildMatch[1]))
      : null,
  };
}

function fileSize(path) {
  return existsSync(path) ? statSync(path).size : null;
}

function compressedSizes(path) {
  const bytes = readFileSync(path);
  return {
    rawBytes: bytes.length,
    gzipBytes: gzipSync(bytes, { level: 9 }).length,
    brotliBytes: brotliCompressSync(bytes, {
      params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
    }).length,
  };
}

function sourceWeight(sourceMap, index) {
  const content = sourceMap.sourcesContent?.[index];
  return typeof content === "string" ? content.length : 0;
}

function packageNameForSource(source) {
  const normalized = source.replace(/\\/g, "/");
  const match = normalized.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  if (match) return match[1];
  if (normalized.includes("/src/") || normalized.startsWith("../../src/")) return "xmlui/src";
  return "other";
}

function analyzeSourceMap(path, topCount) {
  if (!existsSync(path)) {
    return null;
  }

  const sourceMap = JSON.parse(readFileSync(path, "utf8"));
  const sourceRows = sourceMap.sources.map((source, index) => ({
    source,
    bytes: sourceWeight(sourceMap, index),
  }));
  const totalSourceContentBytes = sourceRows.reduce((sum, row) => sum + row.bytes, 0);

  const groups = SOURCE_GROUPS.map((group) => {
    const bytes = sourceRows.reduce(
      (sum, row) => (group.pattern.test(row.source) ? sum + row.bytes : sum),
      0,
    );
    return { key: group.key, label: group.label, sourceBytes: bytes };
  }).sort((a, b) => b.sourceBytes - a.sourceBytes);

  const packageTotals = new Map();
  for (const row of sourceRows) {
    const key = packageNameForSource(row.source);
    packageTotals.set(key, (packageTotals.get(key) ?? 0) + row.bytes);
  }

  const topPackages = [...packageTotals.entries()]
    .map(([name, sourceBytes]) => ({ name, sourceBytes }))
    .sort((a, b) => b.sourceBytes - a.sourceBytes)
    .slice(0, topCount);

  const topSources = sourceRows
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, topCount)
    .map((row) => ({ source: row.source, sourceBytes: row.bytes }));

  return {
    sourceCount: sourceRows.length,
    hasSourcesContent: Array.isArray(sourceMap.sourcesContent),
    totalSourceContentBytes,
    groups,
    topPackages,
    topSources,
  };
}

function createReport(options, buildInfo) {
  const jsPath = join(DIST_ROOT, "xmlui-standalone.umd.js");
  const mapPath = `${jsPath}.map`;
  const gzipPath = `${jsPath}.gz`;
  const brotliPath = `${jsPath}.br`;
  const declarationPath = join(DIST_ROOT, "xmlui-standalone.es.d.ts");

  if (!existsSync(jsPath)) {
    throw new Error(
      `Standalone bundle not found at ${relative(XMLUI_ROOT, jsPath)}. Run with build enabled first.`,
    );
  }

  return {
    measuredAt: new Date().toISOString(),
    command: "npm run build:xmlui-standalone",
    packageName: "xmlui",
    bundle: {
      path: relative(XMLUI_ROOT, jsPath),
      ...compressedSizes(jsPath),
    },
    artifacts: {
      gzip: {
        path: relative(XMLUI_ROOT, gzipPath),
        rawBytes: fileSize(gzipPath),
      },
      brotli: {
        path: relative(XMLUI_ROOT, brotliPath),
        rawBytes: fileSize(brotliPath),
      },
      sourceMap: {
        path: relative(XMLUI_ROOT, mapPath),
        rawBytes: fileSize(mapPath),
      },
      declaration: {
        path: relative(XMLUI_ROOT, declarationPath),
        rawBytes: fileSize(declarationPath),
      },
    },
    build: buildInfo,
    buildOptions: {
      sourcemap: options.sourcemap,
    },
    sourceMap: analyzeSourceMap(mapPath, options.top),
  };
}

function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return "(missing)";
  return `${bytes.toLocaleString("en-US")} B`;
}

function printHumanReport(report, outputPath) {
  console.log("XMLUI standalone bundle-size benchmark");
  console.log(`Measured at: ${report.measuredAt}`);
  if (report.build) {
    console.log(
      `Build: ${report.build.viteBuildMs ?? report.build.elapsedMs} ms, ` +
        `${report.build.modulesTransformed ?? "unknown"} modules transformed`,
    );
  } else {
    console.log("Build: skipped (--no-build)");
  }

  console.log("\nBundle:");
  console.log(`  raw:    ${formatBytes(report.bundle.rawBytes)}`);
  console.log(`  gzip:   ${formatBytes(report.bundle.gzipBytes)}`);
  console.log(`  Brotli: ${formatBytes(report.bundle.brotliBytes)}`);
  console.log(`  .gz:    ${formatBytes(report.artifacts.gzip.rawBytes)}`);
  console.log(`  .br:    ${formatBytes(report.artifacts.brotli.rawBytes)}`);
  console.log(`  map:    ${formatBytes(report.artifacts.sourceMap.rawBytes)}`);
  console.log(`  d.ts:   ${formatBytes(report.artifacts.declaration.rawBytes)}`);

  if (report.sourceMap) {
    console.log("\nSource-map groups:");
    for (const group of report.sourceMap.groups) {
      console.log(`  ${String(group.sourceBytes).padStart(9)}  ${group.label}`);
    }

    console.log("\nTop source packages:");
    for (const row of report.sourceMap.topPackages) {
      console.log(`  ${String(row.sourceBytes).padStart(9)}  ${row.name}`);
    }

    console.log("\nTop source files:");
    for (const row of report.sourceMap.topSources) {
      console.log(`  ${String(row.sourceBytes).padStart(9)}  ${row.source}`);
    }
  } else {
    console.log("\nSource-map analysis skipped: sourcemap not found.");
  }

  console.log(`\nJSON report written to ${relative(XMLUI_ROOT, outputPath)}`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const buildInfo = options.build ? runBuild(options) : null;
  const report = createReport(options, buildInfo);

  mkdirSync(dirname(options.out), { recursive: true });
  writeFileSync(options.out, `${JSON.stringify(report, null, 2)}\n`);

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printHumanReport(report, options.out);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
