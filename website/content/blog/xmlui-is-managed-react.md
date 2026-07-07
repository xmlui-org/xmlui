---
title: "A safer target language for LLMs"
slug: "xmlui-is-managed-react"
description: "XMLUI is to React/CSS as Java and C# are to C++"
author: "Jon Udell"
date: "2026-06-09"
---

Managed languages like Java and C# abolished a whole class of error. If you can't write directly to memory you can't corrupt it. When LLMs write front-end code they target React and CSS which, as the LLMs themselves like to say, are rife with "footguns": a `useEffect` that leaks a subscription, a state update that races a render, a CSS class that accidentally overrides a distant element.

XMLUI aims to do for AI-built business UI what managed runtimes did for memory safety: abolish common classes of error. The language, which is concise, declarative, and semantic, constrains agents to a narrower and safer subset of the markup, style, and runtime behaviors available to them when they target React and CSS.

At launch, XMLUI made a few strong guarantees: you can leverage reactivity without knowing React, deliver a good-looking and well-behaved UI without touching CSS, and deploy with minimal ceremony. We've now extended those guarantees to place guardrails around how programmers, and their agents, can use XMLUI.

Three examples make the idea concrete.

## Props are checked

In React, a typo like `<Button labe="Save" />` may or may not be caught. If `Button` has precise TypeScript props and the build checks them, the compiler can flag the error. But React itself does not define that contract. It is up to each component author to supply it, keep it accurate, and make sure every tool in the chain respects it. In loosely typed code, or in components that accept arbitrary props, the typo can pass through silently. The component ignores `labe`, the page renders, and the first signal something is wrong may be a blank button.

Every XMLUI component declares its props in metadata: name, type, allowed values, deprecation status, default. The same metadata that powers editor completions and generated docs also powers diagnostics. Write `<Button labe="Save" />` and you get:

```
<Button> has unknown prop "labe". Did you mean "label"?
```

The diagnostic shows up in the editor through the language server, at build time through the Vite plugin, and at runtime when strict mode is on. All three surfaces draw from the same metadata; there is no separate type-checker to keep in sync.

None of this is exotic. A managed language does the same thing: refuses to load a class with a broken contract. The novelty is that the contract is a small JSON object next to every component, not a separate type-system layer, and the same object covers documentation, completion, doc generation, and runtime validation. There is only one place to be right.

## Cleanup is automatic

A common React footgun is the `useEffect` that subscribes to something and forgets, or wrongly orders, its cleanup function. Subscribe to a WebSocket, return nothing from the effect, and the socket leaks past unmount. Subscribe in one effect and unsubscribe in another, and now you have an ordering bug that depends on the order React runs them. Add a dependency array that's slightly wrong and the cleanup runs at the wrong time. These are the canonical sources of memory leaks, double-subscription bugs, and "why is my state stale" questions on Stack Overflow.

XMLUI gives every component three lifecycle events. No declaration is needed; they are just available.

```xml
<Stack
  var.openedAt="{null}"
  onMount="openedAt = App.now(); Log.info('panel opened')"
  onUnmount="Log.info('panel closed', { duration: App.now() - openedAt })">
  <Text value="Hello." />
</Stack>
```

`onMount` runs once when the component becomes visible. `onUnmount` runs once when it leaves. `onError` catches anything either of them throws and receives `{ source, error }`, where `source` is `"mount"`, `"unmount"`, `"beforeDispose"`, or `"action"`. The agent does not write a return value, does not pick a dependency array, does not name a cleanup function. There is nothing to forget.

For the resources that actually live longer than a single mount, like HTTP requests, WebSockets, server-sent events, and timers, the framework owns the lifetime. `DataSource`, `<WebSocket>`, `<EventSource>`, `<Timer>` all install their own teardown in the React `useEffect` that the framework writes, not the one the author writes. An `AbortController` cancels in-flight fetches on key change or unmount. A WebSocket closes when the component leaves the tree.

For state that needs to flush before a container goes away, like a draft to persist, a scroll position to record, or an analytics event to send, containers have `onBeforeDispose`. It runs asynchronously with a bounded time budget (`disposeTimeoutMs`, 250ms out of the box) and races against the unmount. If it doesn't finish in time, a lifecycle violation gets traced and the unmount proceeds anyway. The author writes the work; the framework keeps it honest.

## Data flow is declarative

Another common React footgun is the `useState` that gets out of sync with the `useEffect` that fetches its data. The agent writes a state variable, an effect that depends on it, a fetch call, a setState in the `.then`, and (if it remembers) an abort controller and a cleanup. Then it does the whole dance again for the next variable that depends on this one. The bug surface is enormous: missing dependencies, stale closures, races between two effects, double-fetches in development mode, state that updates after unmount.

In XMLUI an agent writes none of that. A small Tube-status app, complete:

```xml
<App>
  <Select id="lines" initialValue="bakerloo">
    <Items data="https://api.tfl.gov.uk/line/mode/tube/status">
      <Option value="{$item.id}" label="{$item.name}" />
    </Items>
  </Select>

  <DataSource
    id="stations"
    url="https://api.tfl.gov.uk/Line/{lines.value}/Route/Sequence/inbound"
    resultSelector="stations" />

  <Table data="{stations}">
    <Column bindTo="name" />
    <Column bindTo="modes" />
  </Table>
</App>
```

There is no state variable, no effect, no fetch, no setData. The `Select` exposes `lines.value`; the `DataSource` URL interpolates that value; the `Table` binds to the DataSource's result. The reactive graph is implicit in the bindings, and the framework reads it.

Because the graph is implicit in markup, the framework can analyze it statically at build time and dynamically at runtime. If the agent writes a binding that creates a cycle, because `a` depends on `b` which depends on `a`, the analyzer reports both endpoints, with file and line, before the page tries to render. If a cycle slips through and only manifests at runtime, a `reactive-cycle` trace entry records it instead of letting the app spin into an oscillation that looks like a frozen tab.

The agent also doesn't write the cancellation logic. The `DataSource` carries an `AbortController` under the hood. When the user picks a different line in the `Select`, the in-flight request for the previous line is aborted; when the page unmounts, every in-flight request is aborted. React Query manages the cache key, so a return visit to a previously-loaded line shows its data immediately while the framework decides whether to revalidate.

It isn't that the agent gets a cleaner version of `useState` + `useEffect`; rather it doesn't see those primitives at all. The class of bug that comes from coordinating them is removed, in the same sense that the class of bug that comes from coordinating `malloc` and `free` is removed in Java.

## From convention to contract

In React and CSS, many safety rules are conventions: remember the dependency array, the cleanup, the class scope, the prop name. People forget those rules, and agents hallucinate different ones.

XMLUI turns conventions into contracts. Component metadata defines the allowed props; markup defines the reactive graph; framework-owned components manage resource lifetimes. When programmers and their agents cannot use dangerous primitives, whole classes of mistakes vanish from the space of possible programs.

We like to say that English is the new programming language but LLMs do not translate English into machine code, they write an intermediate representation. The more code agents write, the more the nature and qualities of that representation matter.

React and CSS are powerful intermediate representations, but they expose too much of the machinery. XMLUI is smaller, more semantic, more observable, and more constrained. A safer target language for LLMs gives agents fewer ways to be clever and fewer ways to be wrong.
