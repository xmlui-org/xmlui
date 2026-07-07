---
title: "The XMLUI loop for Claude Code and Codex"
slug: "xmlui-for-llms"
description: "You're up and running with an AI assistant (Claude Code or Codex) that knows the XMLUI docs, and a built-in Inspector for debugging. Here's what happens next."
author: "Jon Udell"
date: "2026-05-06"
---

The [Get Started](https://xmlui.org/get-started) page is a five-minute path from nothing to a running XMLUI app, a Claude Code or Codex session that can read the XMLUI docs via the installed MCP server, and an Inspector that exports traces your agent can use to observe and analyze what your app does. Once you have those ingredients in place, here's what can happen next.

## Two information channels

When an assistant writes XMLUI markup, it needs to know about the framework's patterns and conventions. The [XMLUI MCP server](https://xmlui.org/blog/improving-the-xmlui-mcp-server) is that channel. The assistant calls `xmlui_search_howto` to find working HowTo recipes, `xmlui_component_docs` for API reference, and `xmlui_examples` for usage in real apps. Every answer carries a citation back to a docs URL or a source file, so claims are checkable.

If the running app misbehaves, the assistant needs to find out what went wrong. It asks you to export a trace that records clicks identified by ARIA label, API calls with URLs, data binds with row counts, event handlers with arguments and return values, and more. These [semantic traces](https://xmlui.org/blog/semantic-trace) describe intentions and outcomes, not low-level DOM activity.

Each channel is useful alone. Together they enable an agent to read the docs, write code that respects XMLUI syntax and conventions, and read a trace to verify the code works or analyze why it doesn't.

## A turn through the loop

Start the weather demo and say:

> Add three tables that report hourly temperatures for three user-specifiable cities.

The assistant doesn't already know the right XMLUI idiom for "three input fields wired to three independent DataSources feeding three Tables." It uses `xmlui_search_howto` to find patterns for input-driven data fetches, and `xmlui_component_docs` to confirm the props on `TextBox`, `DataSource`, and `Table`. Then it writes markup that cites those sources. You refresh the browser and check the display.

Suppose the third table loads but renders empty. Click to open the Inspector and use the **Export** button to save a trace. The MCP server provides analysis tools. Tell the agent:

> Distill and analyze the trace.

It calls `xmlui_find_trace` to find the latest export, and `xmlui_distill_trace` to summarize it. The trace might show that the third `DataSource` fired with a malformed URL because the API wasn't expecting a comma. That's not a guess from reading markup or API docs, it's an observation based on the request the browser sent and the response it received.

The MCP channel and the Inspector channel pass the same task back and forth: docs for how it should work, trace for what it did, docs for the fix, trace to confirm the fix. Neither channel alone gets you there; the assistant uses both because each one answers a question the other can't.

## What this changes

You don't have to be the bridge between the docs and the running app. The assistant has structured access to both. Of course you can still read the docs and view the Inspector's summary of the trace. But your focus stays where it belongs: on what your app does, not how to express your intentions as XMLUI markup. And of course you can read the markup too. It's declarative, concise, and easy to skim.

If you haven't set up the pieces yet, the [Get Started](https://xmlui.org/get-started) page has the install commands for macOS, Linux, and Windows, plus the one-liner that registers the MCP server with Claude Code or Codex. When the weather app feels routine, try the same loop on your own app with different components, API calls, layouts, and interactions.
