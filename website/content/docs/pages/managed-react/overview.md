# Managed React Overview

Managed React is XMLUI's promise that the framework handles the
dangerous, repetitive parts of React application development for you. You
describe the app in XMLUI markup: data, layout, navigation, forms, actions,
themes, and error states. XMLUI turns that declarative model into React and
adds guardrails around the parts that are easy to get wrong by hand.

The idea is similar to managed languages and runtimes such as C# on the .NET
CLR or Java on the JVM. Those platforms do not ask every developer to remember
how to free memory safely; the runtime owns that problem. XMLUI takes the same
approach to React concerns: component contracts, data fetching, lifecycle
cleanup, accessibility, routing, concurrency, theming, observability, and safe
scripting are framework responsibilities.

## What it means for app authors

For XMLUI users, Managed React means you can focus on the application you are
building instead of recreating infrastructure in every screen.

```xmlui
<App>
  <DataSource id="orders" url="/api/orders" />

  <List data="{orders.value}">
    <Card>
      <H3 value="{$item.customer}" />
      <Text value="{$item.status}" />
    </Card>
  </List>
</App>
```

In this example, XMLUI owns the React rendering, loader lifecycle, request
cancellation, state updates, expression evaluation, and error containment. The
markup stays close to the user's intent: load orders and render them.

Managed React extends that pattern across the app:

- **Verified component contracts** catch misspelled props, invalid enum
  values, missing required props, and deprecated APIs.
- **Centralized data access** routes HTTP work through XMLUI-managed loaders
  and fetch helpers instead of ad hoc browser APIs.
- **Cooperative concurrency** coordinates repeated clicks, slow handlers,
  cancellation, timeouts, and transactional state writes.
- **Structured errors** give failures a predictable shape for retries,
  fallback UI, telemetry, and user feedback.
- **Enforced accessibility** turns common keyboard, labeling, contrast, and
  automation requirements into diagnostics and framework primitives.
- **Defended routing, forms, i18n, theming, and lifecycle rules** make common
  app behavior explicit and checkable.

## Why it matters with AI assistance

XMLUI is especially useful when applications are created or revised with AI
assistance. AI can generate markup quickly, but speed is only helpful when the
platform can validate the result. Managed React gives generated XMLUI code a
smaller and safer vocabulary than raw React: no direct DOM mutation, no
uncontrolled network APIs, no hand-written effect cleanup, and fewer hidden
state-management choices.

That does not make review unnecessary. It does make review more focused.
Instead of inspecting every generated component for low-level React hazards,
you can look at the application behavior while XMLUI reports contract
violations, unsafe APIs, reactive cycles, accessibility issues, and build-time
validation problems through the editor, build, runtime diagnostics, and
Inspector traces.

## The practical result

Managed React is not a separate mode you turn on to stop writing React. It is
the direction of the XMLUI platform: move repeated application concerns into
declarative components, metadata, validators, diagnostics, and managed runtime
services.

For teams, that means applications become easier to inspect, test, and govern.
For individual builders, it means less wiring before the first useful screen
works. For AI-assisted development, it means generated app code lands inside a
framework that can say "this is valid", "this is unsafe", or "this will behave
unpredictably" before those problems reach users.

The pages in this section describe the individual Managed React guarantees,
including [Verified Type Contracts](./verified-type-contracts.md),
[Cooperative Concurrency](./cooperative-concurrency.md),
[Structured Exception Model](./structured-exception-model.md),
[Defended Routing](./defended-routing.md), and
[Enforced Accessibility](./enforced-accessibility.md).
