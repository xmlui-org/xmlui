---
title: "Improving the XMLUI MCP server"
slug: "improving-the-xmlui-mcp-server"
description: "It's a virtuous cycle and you can help us turn the wheel."
author: "Jon Udell"
date: "2026-02-20"
tags: ["mcp"]
---

Here's a review of the [XMLUI MCP server](https://github.com/xmlui-org/xmlui-mcp) written by one of its primary users, Claude Code.

<blockquote>
The xmlui-mcp is genuinely useful. For understanding an XMLUI app, the combination of xmlui_component_docs (API reference), xmlui_search_howto (task-oriented recipes), and xmlui_search (broad search) covers the three essential questions: "what does this component do?", "how should I use it?", and "how do others use it?" The URL citations make every answer verifiable.
</blockquote>

Agents are sycophantic creatures and you should always be suspicious of their claims. But in this case, there's strong evidence.

## How the MCP server helps agents help you

The XMLUI MCP server aims to enable an XMLUI developer to use agents reliably. When an agent runs the server, by way of the [XMLUI CLI](https://github.com/xmlui-org/xmlui-cli), the server refreshes a local cache of the [XMLUI documentation](https://docs.xmlui.org). These are the doc-oriented tools the MCP server provides for agents to use.

 | Tool | Description |
 |------|-------------|
 | `xmlui_component_docs` | Returns docs for a given XMLUI component |
 | `xmlui_examples` | Searches sample apps for component usage examples |
 | `xmlui_list_components` | Lists all available XMLUI components |
 | `xmlui_list_howto` | Lists all "How To" entry titles |
 | `xmlui_search` | Searches XMLUI source, docs, and examples |
 | `xmlui_search_howto` | Searches "How To" entries |

Suppose as an XMLUI developer you ask "What's the best way to manage state in XMLUI?" Here's how Claude uses various tools to answer the question.

![](/resources/claude-state-management-1.png)

The research phase begins with `xmlui_search_howto` because the server prioritizes How To articles with [playgrounds](https://blog.xmlui.org/blog/xmlui-playground) that provide live working examples. Finding none on a first pass it pivots to a broader search for *state management variable*. Along with search hits the agent sees clues (*Topics*, *Facets*) that help it contextualize results.

From there it explores a tutorial, discovers the [AppState](/docs/reference/components/AppState) component, notices it has been deprecated, and redirects to looking for information about the global variables mentioned in the deprecation warning.

Armed with those results the agent produces a pretty good report.

![](/resources/claude-state-management-2.png)

Codex does the same thing more concisely.

![](/resources/codex-state-management.png)

## How the MCP server gets better

Outcomes weren't always this good. We improved them recently by pointing our agents at logs the MCP server has collected over the past few months as it helped me work on a dozen different XMLUI apps. Here is part of [Claude's](https://github.com/xmlui-org/xmlui-mcp/issues/5) analysis.

<img src="/resources/claude-analysis-1.png" style="width:60%;" />

Claude Code proceeded to implement the suggestions which, along with topic indexes, tweaked the scoring system to penalize deprecated components. To test the new build we started another instance of Claude Code and assigned it a task that required it to ask questions the MCP server should help it answer. Claude 1 — the author of the new features — tailed the logs and watched Claude 2 try to use them. I asked Claude 2 for feedback to relay to Claude 1, and it obliged.

<img src="/resources/claude-analysis-2.png" style="width:60%;" />

As a result we've dropped the intriguing idea of *pattern* search for now. Maybe we'll find a reason to bring it back. Or maybe you will! If you suspect the MCP server could be doing a better job with the questions your agents are asking it, try turning an agent loose on the MCP logs. If the analysis seems sound and the recommendations promising, [raise an issue](https://github.com/xmlui-org/xmlui-mcp/issues/new) and share that info, we'll take a look.