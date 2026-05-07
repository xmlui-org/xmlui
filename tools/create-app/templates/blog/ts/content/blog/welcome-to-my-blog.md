---
title: "Welcome to My Blog"
slug: "welcome-to-my-blog"
description: "The first post on this blog — what to expect and how it was built."
author: "Jane Smith"
date: "2025-03-01"
tags: ["news", "meta"]
---

## Why I Started This Blog

Every developer needs a place to share ideas, document experiments, and connect with others. This blog is mine.

I built it with [XMLUI](https://xmlui.org) — a declarative UI framework that lets me write apps in markup without wrestling with component boilerplate.

## What to Expect

I plan to write about:

- **XMLUI tips and tricks** — patterns I find useful day to day
- **Project walkthroughs** — building real apps from scratch
- **Tooling** — the CLI tools, editors, and workflows that make me productive

## How This Site Works

The blog is a single XMLUI app with a post listing page and individual post pages. All
posts live in `content/blog/` as Markdown files with a frontmatter header. To add a new
post, drop a new `.md` file into that folder — title, slug, date, author, and tags all
come from the frontmatter.

For a larger blog you would swap the local Markdown for an API call — the `PostList` and
`PostPage` components stay exactly the same.

## Get in Touch

Have a question or idea? Open an issue on the repo or reach out directly.
