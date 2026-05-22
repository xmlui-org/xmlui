# Plan: Sharpen Learn, Guides, and Tutorial

## Purpose

Improve the XMLUI docs so the first screen of each key page immediately explains why XMLUI matters, what the reader will learn, and where to go next.

This is not a plan to replace the whole docs site. The current material is valuable. The opportunity is to make the Learn XMLUI, Guides, and Tutorial sections more focused, more skimmable, and more clearly aligned with the main product story on the home page.

## Product Story To Reflect

The docs should repeatedly reinforce the core XMLUI promise:

- **Simple**: build practical web UIs with declarative XML markup, without needing React or CSS expertise.
- **Reactive**: values, API calls, and UI components update automatically when dependencies change.
- **Connected**: fetch, display, mutate, and refresh API data with little or no scripting.
- **Professional**: built-in components, layout primitives, and themes produce clean modern apps by default.
- **Composable**: combine built-in components, user-defined components, and extension packages.
- **Deployable**: standalone apps can be served as static files; Vite mode supports production builds and HMR.
- **AI-readable and observable**: markup is concise enough for humans and agents to reason about, and semantic traces make runtime behavior inspectable.

Every top-level learning page should answer, above the fold:

1. What can I build with this?
2. What XMLUI feature does this page teach?
3. What is the smallest credible example?
4. Where should I go next?

## First-Screen Pattern

Use the same page-opening pattern for Learn, Guides, Tutorial, and the most important guide pages.

Recommended structure:

````md
# Page title

One-sentence promise: what the reader will be able to do.

> [!GIST]
> 3 to 5 bullets that summarize the page's core ideas.

```xmlui-pg
Small live example, preferably under 25 lines.
```

## When to use this

Short orientation paragraph or a compact list of use cases.

## What you will learn

Short list of concrete outcomes.
````

The page may remain long after this opening. The important change is that the reader gets the gist before scrolling.

## Information Architecture

### Learn XMLUI

Goal: explain the mental model and the "why XMLUI" story in four tightly connected pages.

Recommended nav:

- **What is XMLUI?**: declarative markup, no React required, live connected app in a few lines.
- **Reactive Data**: show `id`, `.value`, `DataSource`, and dependent UI updates.
- **Components**: built-in components, user-defined components, extension components, composition.
- **Themes and Layout**: professional defaults, theme tokens, responsive layout, light/dark mode.
- **AI and Traces**: concise markup, semantic traces, MCP/docs-assisted development. This can be a new page or a short section linked from Learn.

Actions:

- Rewrite `website/content/docs/pages/intro.md` around the home page pillars: simple, reactive, connected, professional, deployable.
- Remove the static "This paragraph is static text..." sentence from the intro; it distracts from the product story.
- Move deeper definitions below the first live example. Keep the definitions, but compress them.
- Add a "Pick your path" block: "Build first", "Understand the model", "Find a recipe", "Look up a component".
- Consider adding `website/content/docs/pages/ai-and-traces.md` and a corresponding nav item under Learn XMLUI.

### Guides

Goal: turn Guides from a long sidebar mirror into a decision page that helps readers choose the right conceptual guide.

Recommended guide groups:

- **Start an app**: App Structure, Markup, Hosted Deployment, Playground and Codefences.
- **Build screens**: Layout, Working with Text, Working with Markdown, Routing and Links, Modal Dialogs.
- **Work with data**: Reactive Data, Scripting, Forms, Scoping, Visibility.
- **Reuse and extend**: User-defined Components, Refactoring, Wrapping and Theming.
- **Polish and production**: Themes, accessibility-facing patterns, deployment, traces.

Actions:

- Rewrite `website/content/docs/pages/guides.md` as a routed index, not a plain list.
- For each guide card, include:
  - reader problem
  - core XMLUI feature
  - best first page
  - next link
- Add a "Most common paths" section:
  - "I want to show API data in a table"
  - "I want a form that validates and submits"
  - "I want routing and navigation"
  - "I want a reusable component"
  - "I want to theme the app"
- Add a short "Guides vs How To vs Reference" explanation so readers know where to go.

### Tutorial

Goal: make the Invoice tutorial feel like a guided build with visible progress and clear learning outcomes, not only a sequence of chapters.

Recommended structure:

- Add a stronger tutorial landing page at `/docs/tutorial`.
- Keep the 12 existing tutorial pages, but add a compact first-screen summary to each.
- Make each tutorial page begin with:
  - "In this step you will build..."
  - screenshot or live app state
  - "XMLUI features used"
  - "Files touched"
  - "Finished when..."
- End each page with:
  - "You now have..."
  - "Next step..."
  - link to the relevant guide/reference page

Tutorial landing page outline:

````md
# Build XMLUI Invoice

Build a small but realistic business app while learning XMLUI's core ideas:
layout, data loading, forms, routes, charts, search, import, and settings.

> [!GIST]
> - You will build a complete invoice app, one feature at a time.
> - Each step introduces one or two XMLUI ideas.
> - The tutorial favors practical app structure over isolated snippets.
> - Use it after the Learn pages, or jump in if you prefer building first.

## What you will build

Screenshot plus 5 feature bullets.

## Learning path

12 compact step cards with outcome, main feature, and estimated effort.

## Before you start

Prerequisites and download/start instructions.
````

Actions:

- Expand `website/content/docs/pages/tutorial-01.md` from a 7-line intro into a proper tutorial landing page.
- If `/docs/tutorial` currently renders a generic `Overview`, replace it with the tutorial landing content or a dedicated component.
- Add summaries to `tutorial-02.md` through `tutorial-12.md`.
- Include a progress map on every tutorial page, even if it is just a compact list near the top.

## Page-Level Content Rules

Use these rules when revising individual pages:

- Start with the outcome, not the backstory.
- Keep the first code sample short enough to understand in one glance.
- Prefer "this is the XMLUI idea" over "let's unpack everything".
- Use live examples early, but keep the first one focused on a single concept.
- Turn long explanations into short sections with descriptive headings.
- Use "When to use this" and "Common mistakes" sections for practical guides.
- Link to reference pages after the concept is clear, not before.
- Preserve deeper details below the first-screen summary.

## Specific High-Impact Edits

### `intro.md`

Current issue: it has the right ideas, but the opening mixes product promise, concept definitions, and deployment steps. The reader has to scroll and parse.

Proposed first screen:

- H1: `Build reactive web apps with XML markup`
- One-sentence promise.
- Gist block with simple/reactive/connected/professional/deployable.
- A 15-25 line live app showing API data, selection, and reactive update.
- "Choose your next step" links.

Move deployment details to the bottom or link to Hosted Deployment.

### `reactive-intro.md`

Current issue: good example, but the reader reaches the key mental model after the second code block.

Proposed first screen:

- State the spreadsheet analogy immediately.
- Show the dependency chain: `Select value -> DataSource URL -> Table data`.
- Keep the current tube example, but add a 3-line "What changes when you select a line" block before the long explanation.

### `components-intro.md`

Current issue: it lists many components before explaining the component model.

Proposed first screen:

- Lead with "Everything is a component: visible UI, data, routes, actions, and layout."
- Show a compact example containing a visible component, data component, and user-defined component.
- Put the component category list after the mental model.
- Fix broken links that contain `/docs/reference/docs/reference/...`.

### `guides.md`

Current issue: it repeats the sidebar.

Proposed first screen:

- H1: `Guides by task`
- Gist block explaining Guides vs How To vs Reference.
- Five grouped paths with links.
- A "Start here" row for common reader goals.

### `tutorial-01.md`

Current issue: too short to carry the tutorial landing page.

Proposed first screen:

- H1: `Build XMLUI Invoice`
- Screenshot stays near the top.
- Add "What you will build", "What you will learn", and "Tutorial map".
- Link to final download after the reader understands the goal.

## Navigation Changes

Recommended minimal nav changes:

- Keep the existing top-level groups: Learn XMLUI, Guides, Tutorial, How To, Reference.
- Under Learn XMLUI, consider adding **AI and Traces**.
- In Guides, regroup pages visually in the sidebar if supported, but the bigger win is rewriting the `Guides` index.
- Use `/docs/tutorial` as a real landing page instead of relying on a generic overview.
- Keep How To as the task-recipe library; do not merge it into Guides.

## Implementation Phases

### Phase 1: Editorial Reframe

- Rewrite `intro.md`, `guides.md`, and `tutorial-01.md`.
- Add first-screen summaries to `reactive-intro.md` and `components-intro.md`.
- Fix obvious broken links in these pages.

### Phase 2: Tutorial Usability

- Add step summaries to tutorial pages 02-12.
- Add "Files touched", "XMLUI features used", and "Finished when" blocks.
- Add a consistent next-step footer.

### Phase 3: Guide Index and Crosslinks

- Add task-path cards to Guides.
- Link every Learn page to at least one Guide, one How To group, and one Reference page.
- Add "Common next questions" blocks to the most visited guide pages.

### Phase 4: AI and Observability Story

- Add or integrate an "AI and Traces" Learn page.
- Crosslink to the semantic trace and XMLUI-for-LLMs blog posts.
- Explain how docs, MCP, Inspector traces, and concise markup work together.

## Definition Of Done

The improvement is successful when:

- A new reader can explain XMLUI's core value after reading only the first screen of `/docs`.
- `/docs/guides` helps readers choose a path instead of duplicating the sidebar.
- `/docs/tutorial` clearly sells the Invoice app as a practical learning journey.
- Each tutorial step states its outcome before the detailed instructions.
- The main docs sections visibly reflect XMLUI's home page promise: simple, semantic, connected, deployable, reactive, professional, and AI-readable.
