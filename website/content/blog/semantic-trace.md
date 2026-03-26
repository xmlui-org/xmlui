---
title: "How ARIA helps users, developers, and AIs work with XMLUI"
slug: "semantic-trace"
description: "Software that's built, reviewed, and tested in the same language that describes it."
author: "Jon Udell"
date: "2026-03-26"
draft: true
---

With XMLUI you build apps in a declarative way using simple markup. A dozen lines of XML is all you need to wire up a DataSource to a Select, query an endpoint with the value of the Select, and fill a Table. Apps are reactive and themed without requiring you to be (or hire) a React or CSS pro. The XML markup is easy to read and understand.

```xmlui
<Component name="LondonTubeTab">
  <VStack>
    <H1>London Tube</H1>

    <Select id="lines" aria-label="Tube line" initialValue="bakerloo">
      <Items data="https://api.tfl.gov.uk/line/mode/tube/status">
        <Option value="{$item.id}" label="{$item.name}" />
      </Items>
    </Select>

    <DataSource
      id="stations"
      url="https://api.tfl.gov.uk/Line/{lines.value}/Route/Sequence/inbound"
      when="{!!lines.value}"
      resultSelector="stations"/>

    <Table data="{stations}" height="200px">
      <Column bindTo="name" />
      <Column bindTo="modes" />
    </Table>
  </VStack>
</Component>
```

There's a lot going on under the hood, though! The `url` property of the DataSource tracks the value of the Select, so choosing Piccadilly triggers an API call. The Table tracks the `stations` property of the DataSource and refills on completion of the API call. How can you visualize this bundle of reactivity? How can you test it? These are challenges for all reactive systems.

## Semantic traces

To make XMLUI observable and testable we started by instrumenting the engine to emit semantic traces in debug mode. These are not low-level stack traces, they describe system behavior in a way that both people and AIs can easily understand.

| # | Action | Target | Details |
|---|--------|--------|---------|
| 1 | click | tab "LondonTube" | Switch to LondonTube tab |
| 2 | click | option "Hammersmith & City" (Select "Tube line") | GET /Line/hammersmith-city, Table: up |
| 3 | click | option "Piccadilly" (Select "Tube line") | GET /Line/piccadilly, Table: up |

That table summarizes these raw traces emitted by the XMLUI engine.

```
=== trace: i-mn6al1ok-vvvic7 ===
  3806.6 interaction ariaRole=tab ariaName=LondonTube event=click comp=Tabs
  6658.6 api:start GET .../line/mode/tube/status → 245ms
  6903.3 api:complete GET .../line/mode/tube/status ← 245ms

=== trace: i-mn6al3yz-v55cw1 ===
  6773.7 interaction event=click
  8087.4 interaction ariaRole=option ariaName=Hammersmith & City selectAriaLabel=Tube line comp=Select
  8087.5 native:selection:change label=Hammersmith & City
  8100.8 state:changes event=DataSource:stations comp=DataSource
  8111.1 api:start GET .../Line/hammersmith-city/Route/Sequence/inbound → 2543ms
  8111.6 api:start GET .../line/mode/tube/status → 209ms
  8320.5 api:complete GET .../line/mode/tube/status ← 209ms
  10654.5 api:complete GET .../Line/hammersmith-city/Route/Sequence/inbound ← 2543ms
  10658.4 state:changes event=DataSource:stations comp=DataSource
  10673.2 data:bind label=Table: 25 → 29 items
  11542.7 api:start GET .../line/mode/tube/status → 34ms
  11576.8 api:complete GET .../line/mode/tube/status ← 34ms
```

The engine correlates UI interaction, reactive state changes, API calls, and data binding so you can understand the complete flow from a Select to the refilled Table. This raw evidence is a powerful debugging aid. Suppose you didn't match the id of the Select to the reactive variable embedded in the DataSource's `url` property. That's an easy error to make and a hard one to debug. Now, with traces like these, you can see what's going on, no need to add logging. And these traces are catnip for AIs. Show a trace like this to Claude and it will say: "Oh, yeah, I can see exactly what's going on here."

# From traces to tests

We can do more with these traces. A distiller converts them into this format, keeping only the fields that matter: the ARIA target, the API awaits with response schema, and the data binds.

```json
=== Step 0 ===
{
  "action": "click",
  "target": {
    "ariaRole": "tab",
    "ariaName": "LondonTube"
  },
  "await": {
    "api": [{
      "method": "GET",
      "endpoint": ".../line/mode/tube/status",
      "apiResult": { "type": "rowcount", "count": 11,
        "keys": ["$type","created","crowding","disruptions","id",
          "lineStatuses","modeName","modified","name",
          "routeSections","serviceTypes"] }
    }]
  }
}
=== Step 1 ===
{
  "action": "click",
  "target": {
    "ariaRole": "option",
    "ariaName": "Hammersmith & City",
    "selectAriaLabel": "Tube line"
  },
  "await": {
    "api": [{
      "method": "GET",
      "endpoint": ".../Line/hammersmith-city/Route/Sequence/inbound",
      "apiResult": { "type": "snapshot",
        "keys": ["$type","direction","isOutboundOnly","lineId",
          "lineName","lineStrings","mode","orderedLineRoutes",
          "stations","stopPointSequences"] }
    }]
  },
  "dataBinds": [{ "component": "Table", "prevCount": 25, "rowCount": 29 }]
}
```

A generator reads that format to produce Playwright tests.

```typescript
// Step 0: click the LondonTube tab
// Set up response capture BEFORE the click to avoid a race condition
const tubeListResponse = page.waitForResponse(r =>
  r.url().includes('/line/mode/tube/status'));
// The tab click triggers the Select's Items DataSource to fetch tube lines
await page.getByRole('tab', { name: 'LondonTube', exact: true }).click();
// Wait for the response then verify it returned the expected schema
const tubeLines = await (await tubeListResponse).json();
// The TfL status endpoint should return an array of tube lines
expect(tubeLines.length).toBeGreaterThan(0);
// Verify the response shape hasn't changed — if TfL renames a field, this catches it
expect(Object.keys(tubeLines[0]).sort()).toEqual(
  ['$type','created','crowding','disruptions','id',
   'lineStatuses','modeName','modified','name',
   'routeSections','serviceTypes']);

// Step 1: select Hammersmith & City from the "Tube line" dropdown
// The combobox name comes from aria-label="Tube line" on the Select
const hammersmithResponse = page.waitForResponse(r =>
  r.url().includes('/Line/hammersmith-city/Route/Sequence/inbound'));
await page.getByRole('combobox', { name: 'Tube line' }).click();
await page.getByRole('option', { name: 'Hammersmith & City', exact: true }).click();
// The Select triggers a DataSource refetch with the new line id in the URL
const hammersmithRoute = await (await hammersmithResponse).json();
// Verify the route response has station data
expect(Object.keys(hammersmithRoute).sort()).toEqual(
  ['$type','direction','isOutboundOnly','lineId','lineName',
   'lineStrings','mode','orderedLineRoutes','stations',
   'stopPointSequences']);

// Step 2: select Piccadilly — same reactive chain, different line
...
```

The test navigates, clicks, and assert. It's all generated from the distilled trace, there's no hand-written test code. The `expect` calls verify that the API returns the expected schema: 11 tube lines with the right fields: route data with stations and stop sequences. If the API changes its response shape, or if a reactive variable miswiring causes the DataSource to stop refetching, the test fails. It might also fail if the XMLUI engine itself introduced a reactivity bug that wasn't caught by its suite of unit and end-to-end tests.

You can visit a live instance of the app [here](https://xmlui-org.github.io/xmlui-regression/), take that journey, and click the Inspector icon to see a visualization of the traces.

![semantic trace](/resources/blog/images/semantic-trace.png)

The test also captures a fresh trace during replay and compares it semantically against the baseline — checking that the same APIs fired, the same data binds occurred, and no unexpected mutations appeared.

```
Before (baseline):                    After (replay):
  APIs:                                 APIs:
    GET /Line/hammersmith-city ✓          GET /Line/hammersmith-city ✓
    GET /Line/piccadilly ✓                GET /Line/piccadilly ✓
  Mutations: (none) ✓                   Mutations: (none) ✓
  Data binds:                           Data binds:
    Table: up (25→29 rows) ✓              Table: up (25→29 rows) ✓
    Table: up (29→53 rows) ✓              Table: up (29→53 rows) ✓

SEMANTIC: PASS
```

Here's what a failure might look like.

```
  Before (baseline):                    After (replay):
    APIs:                                 APIs:
      GET /Line/hammersmith-city            GET /Line/hammersmith-city
      GET /Line/piccadilly                  ✗ missing
    Data binds:                           Data binds:
      Table: up (25→29 rows) ✓              Table: up (25→29 rows) ✓
      Table: up                             ✗ missing

  SEMANTIC: FAIL — Behavioral regression detected
    apis_missing_gets: GET /Line/piccadilly in baseline but not replay
    data_bind_count: expected 2, got 1
```

The tests don't hardcode values, they assert the shape of responses and direction of change. In this case, more rows is 'up'. This strategy ensures that generated tests don't encode app-specific values.

You can see the tests running continuously in a [GitHub Action](https://github.com/xmlui-org/xmlui-regression/actions/workflows/regression-tests.yml).

## The role of ARIA

Every XMLUI component uses a common wrapper that emits traces. Before we unified the wrapping infrastructure, traces identified components only by type:

```
interaction click TextBox
interaction click TextBox
interaction click Button
```

Three events, but which TextBox? Which Button? If the app has a Name field and an Email field, the trace can't tell them apart.

The wrapper now resolves each component's ARIA label — from `placeholder`, `label`, `title`, or explicit `aria-label` — and includes it in every trace event:

```
interaction click TextBox [Name]
interaction click TextBox [Email]
interaction click Button [Save]
```

The trace is self-describing. A developer reads it and knows exactly what happened. An AI reads it and can reason about the flow. And Playwright can generate `getByRole('textbox', { name: 'Name' })` instead of a fragile CSS selector. The same `aria-label` that makes the app accessible to screen readers is what makes the trace readable and the test robust.

None of this requires extra work from app developers. The system resolves labels automatically through a three-tier cascade, with sensible defaults baked in by component and wrapper authors:

- **Static defaults in component metadata** — the component author sets a fallback once. Spinner gets "Loading", ToneChangerButton gets "Toggle color mode". Every instance benefits with no action from the app developer.

- **Dynamic derivation from existing props** — the wrapper author points at the prop that already describes the instance. A TextBox with `placeholder="Search..."` automatically gets that as its label. A Card with `title="Dashboard"` gets "Dashboard". The app developer wrote these props for functional reasons — the label comes for free.

- **App author's explicit `aria-label`** — always wins if provided. Write `aria-label="Volume control"` and that overrides everything else.

An app developer doesn't need to know this cascade exists. You write `<TextBox placeholder="Search..." />` and the trace shows `[Search...]`, the screen reader announces "Search...", and Playwright can find it with `getByRole('textbox', { name: 'Search...' })`.

The cascade becomes especially powerful with reactive expressions. Here a TextBox searches a list of countries via a DataSource. The `aria-label` includes the result count, which updates reactively as the DataSource refetches:

```xml
<TextBox
  placeholder="Search countries..."
  aria-label="{'Search: ' + (countries.value || []).length + ' results'}"
  onDidChange="(val) => { searchTerm = val }" />
```

Each trace entry captures the live label at the moment of the value change:

```
value:change TextBox [Search: 147 results] "c"       ← label reflects previous query ("")
value:change TextBox [Search: 25 results] "ca"        ← label reflects previous query ("c")
value:change TextBox [Search: 9 results] "can"        ← label reflects previous query ("ca")
value:change TextBox [Search: 2 results] "cana"       ← label reflects previous query ("can")
```

The label lags the input by one refetch cycle — it shows the count from the *previous* query because the DataSource hasn't completed the fetch for the *current* keystroke yet. This is the reality of async reactive data binding, and exactly the kind of timing subtlety you can see in a trace but nowhere else.

Elsewhere in the trace we can see the precise counts as data:bind entries.

```
19m 40s ago data:bind Table: 2 → 1 items
19m 40s ago data:bind Table: 9 → 2 items
19m 41s ago data:bind Table: 25 → 9 items
19m 42s ago data:bind Table: 147 → 25 items
```

## The ecosystem unlocked

XMLUI ships with a set of core components, but the React ecosystem offers thousands more: charting libraries, rich-text editors, layout engines, calendars, mapping tools, visualization frameworks. The engine provides a function (`wrapComponent`) that can make all of them available to XMLUI users as extension components. These work exactly like core components:  declarative, composable, debuggable, accessible, and testable. No ARIA work is required, but you can bake in sensible defaults.

```ts
// Static: every Spinner instance gets a label
defaultAriaLabel: "Loading"

// Dynamic: each Avatar instance gets a label from its name prop
deriveAriaLabel: (props) => props.name

// Rich: EChart derives from its configuration
deriveAriaLabel: (props) => {
  const title = props.option?.title?.text;
  const chartType = /* derive from series types */;
  return title ? `${title} — ${chartType}` : chartType;
}
```

The wrapper author does this once, and every app that uses the component benefits.

Some wrapped components become observable in new ways. For example, the wrapper for [Apache ECharts](https://echarts.apache.org/) bridges the library's canvas events to XMLUI's trace system. ECharts renders on the HTML `canvas` element, there are no DOM elements for Playwright to click or screen readers to announce. But the wrapper translates native chart events into structured traces:

```
native:mouseover [User activity bar chart] "Commits → Wed = 150"
native:click [User activity bar chart] "Commits → Wed = 150"
native:mouseout [User activity bar chart] "Commits → Wed = 150"
native:legendselectchanged [User activity bar chart] "Commits: hide"
```

A hover reveals a data value (`Commits → Wed = 150`); toggling a legend toggle hides a series. Each event carries the chart's `aria-label` (`User activity bar chart`) and a human-readable description of the interaction. Canvas-rendered components are normally opaque to testing and accessibility tools, but here the wrapper makes them as observable as any DOM-based component.

## ARIA connects everything

The engine's trace emission and correlation, the interactive Inspector, the trace systems distiller, and the Playwright test generator are separate mechanisms. ARIA provides the standard vocabulary that ties everything together. The `aria-label` attribute is already understood by screen readers and already supported by Playwright's `getByRole` API Accessibility advocates like to say that curb cuts benefit everyone. Here that's especially true. It's not just that accessible apps happen to be more testable. It's that the same attribute — `aria-label` — simultaneously serves the screen reader user, the developer reading a trace, the AI reasoning about behavior, and the test framework generating selectors.

Who benefits?

- The XMLUI developer debugging an app. See in a single visualization what would otherwise be spread across browser devtools panes.

- Claude Code. Given a semantic trace it says "I can see exactly what's going on" because the trace speaks the same language the developer used in markup.

- A user of an XMLUI app who encounters a problem. Show the semantic trace to the developer.

- A company providing an XMLUI app. Run regression tests that work at the semantic level: Button clicked, API called, data changed (or didn't).

- A company depending on an XMLUI app. Unlike a vibe-coded React app where AI-written code is opaque to non-specialists, XMLUI markup is simple enough for a business stakeholder to read and understand, with observability tools that make the runtime behavior transparent.

With XMLUI, the markup that you write, or Claude writes, or you write together, is small, simple, and declarative. When we can all engage in conversations about the design and construction of software, using a vocabulary of intentions and actions that all parties can speak and understand, the result is software that's built, reviewed, and tested in the same language that describes it.

