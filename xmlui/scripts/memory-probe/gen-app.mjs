#!/usr/bin/env node
// Generate a synthetic standalone XMLUI app for memory measurement.
//
//   node gen-app.mjs <outDir> --rows N --compile on|off [--unmounted] --bundle <path>
//
// Each "row" is shaped like the always-visible markup of a real dashboard-style
// app (Bram's pane): an HStack with its own var and a `when`, three Texts with
// bindings, a Button with a handler, and a user-defined component instance
// (RowCard: a Card with its own var, a Text, a Button and a conditional Text).
// Every 10th row also has a DataSource reading a local JSON file.
//
// --unmounted wraps all rows in `<VStack when="{false}">`, so the components are
// named in the markup but never mounted: does compiling them cost memory?

import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";

function parseArgs(argv) {
  const args = {
    rows: 0,
    compile: "on",
    unmounted: false,
    tabs: 0,
    tabsMode: "named",
    bundle: null,
    out: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--rows") args.rows = Number(argv[++i]);
    else if (a === "--compile") args.compile = argv[++i];
    else if (a === "--unmounted") args.unmounted = true;
    else if (a === "--tabs") args.tabs = Number(argv[++i]);
    else if (a === "--tabs-mode") args.tabsMode = argv[++i];
    else if (a === "--bundle") args.bundle = argv[++i];
    else if (!args.out) args.out = a;
  }
  if (
    !args.out ||
    !args.bundle ||
    !Number.isInteger(args.rows) ||
    args.rows < 0 ||
    !Number.isInteger(args.tabs) ||
    args.tabs < 0 ||
    !["named", "absent"].includes(args.tabsMode)
  ) {
    console.error(
      "usage: gen-app.mjs <outDir> --rows N --compile on|off [--unmounted] [--tabs K --tabs-mode named|absent] --bundle <path>",
    );
    process.exit(2);
  }
  return args;
}

// --- A tab-sized user-defined component: about 100 elements and 70 bindings,
// --- the order of Bram's tab components (Search, Issues, Sessions… 60–230 tags).
function tabComponent(k) {
  const blocks = Array.from(
    { length: 12 },
    (_, j) => `    <HStack var.v${j}="{${j}}">
      <Text value="Tab ${k} item ${j}: {v${j} + seen}" />
      <Text value="{v${j} % 3 === 0 ? 'fizz' : 'plain'}" />
      <Button label="Inc ${k}.${j}" onClick="v${j}++; seen++" />
      <Text when="{v${j} > 5}" value="big" />
    </HStack>`,
  ).join("\n");
  return `<Component name="Tab${k}">
  <VStack var.seen="{0}">
    <DataSource id="tabData${k}" url="data.json" />
    <Text value="Tab ${k}: {tabData${k}.value ? tabData${k}.value.items.length : 0} items, {seen} clicks" />
${blocks}
  </VStack>
</Component>
`;
}

function row(i) {
  const ds =
    i % 10 === 0
      ? `\n      <DataSource id="ds${i}" url="data.json" />\n      <Text value="{ds${i}.value ? ds${i}.value.items.length : 0} items" />`
      : "";
  return `    <HStack var.n="{${i}}" when="{count >= 0}">
      <Text value="Row ${i}: {n + count}" />
      <Text value="{n % 2 === 0 ? 'even' : 'odd'}" />
      <Text value="{'x'.repeat(n % 5)}" />
      <Button label="Bump ${i}" onClick="n++" />
      <RowCard index="{n}" />${ds}
    </HStack>`;
}

function main() {
  const { out, rows, compile, unmounted, tabs, tabsMode, bundle } = parseArgs(process.argv.slice(2));
  mkdirSync(join(out, "components"), { recursive: true });

  const rowsXml = Array.from({ length: rows }, (_, i) => row(i)).join("\n");
  const body = unmounted ? `  <VStack when="{false}">\n${rowsXml}\n  </VStack>` : rowsXml;

  // --- Tabs, the way Bram's pane names them: <Pages> mounts only the current page, so
  // --- "named" tab components are referenced but never mounted (only "/" is current).
  // --- "absent" writes the same component files but never names them: the control.
  for (let k = 0; k < tabs; k++) {
    writeFileSync(join(out, "components", `Tab${k}.xmlui`), tabComponent(k));
  }
  const pages =
    tabs > 0
      ? `  <Pages fallbackPath="/">
    <Page url="/"><Text value="home" /></Page>
${
  tabsMode === "named"
    ? Array.from({ length: tabs }, (_, k) => `    <Page url="/t${k}"><Tab${k} /></Page>`).join("\n")
    : ""
}
  </Pages>`
      : "";
  writeFileSync(
    join(out, "Main.xmlui"),
    `<App var.count="{0}">
  <Button label="Tick" onClick="count++" />
  <Text value="Ticks: {count}" />
  <Text value="rows=${rows} compile=${compile} unmounted=${unmounted} tabs=${tabs}:${tabsMode}" />
${body}
${pages}
</App>
`,
  );

  writeFileSync(
    join(out, "components", "RowCard.xmlui"),
    `<Component name="RowCard">
  <Card var.open="{false}">
    <Text value="Card {$props.index}" />
    <Button label="Toggle" onClick="open = !open" />
    <Text when="{open}" value="open {$props.index}" />
  </Card>
</Component>
`,
  );

  writeFileSync(
    join(out, "config.json"),
    JSON.stringify(
      {
        name: "memory-probe",
        appGlobals: { xsVerbose: false },
        xmluiConfig: { compileScripts: compile === "on" },
      },
      null,
      2,
    ),
  );

  writeFileSync(
    join(out, "data.json"),
    JSON.stringify({ items: Array.from({ length: 20 }, (_, i) => ({ id: i, name: `item ${i}` })) }),
  );

  copyFileSync(bundle, join(out, "xmlui-standalone.umd.js"));
  writeFileSync(
    join(out, "index.html"),
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>memory-probe rows=${rows} compile=${compile}${unmounted ? " unmounted" : ""}</title>
  <script src="./xmlui-standalone.umd.js"></script>
</head>
<body></body>
</html>
`,
  );
}

main();
