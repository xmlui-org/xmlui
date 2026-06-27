# AGENTS.md — xmlui-ai-blocks Package Guidance

This package contains reusable XMLUI AI-oriented components. Work in this package must be tightly scoped, conservative, and respectful of existing component boundaries.

## Core Working Rule

Change only what the user explicitly asked to change.

Do not improve, refactor, restyle, rename, reorganize, or broaden behavior unless the user specifically requested it or it is strictly necessary to complete the requested change.

## Component Boundaries

By default, affect exactly one component.

A change may cross component boundaries only when the user explicitly asks for a cross-component behavior, shared API, shared styling, shared utility, or package-level change.

Before touching another component, verify that the requested behavior cannot be implemented inside the original target component.

## Template and Slot Boundaries

Many components in this package expose templatable regions such as toolbar, status, chat, composer, preview, code, timeline, auxiliary, or similar slots.

Treat the component shell and its templates as separate ownership areas:

- The shell owns layout, placement, accessibility wiring, and region orchestration.
- Templates own the actual content and behavior inside their region.
- Do not inspect, rewrite, or couple to template internals unless the user explicitly asks.
- A change to one template or region must not alter other regions unless required by the request.

## Minimal Change Policy

Use the least amount of code change that correctly implements the request.

Prefer local edits over new abstractions. Do not introduce helper functions, shared utilities, new props, new metadata, new theme variables, or new files unless they are necessary for the requested behavior.

Do not perform logic-neutral refactors while making a functional change. Keep formatting churn out of unrelated lines.

## Preserve Existing Design

Preserve the current visual identity, spacing, colors, layout structure, class names, theme variables, and interaction patterns unless the user explicitly asks for visual/design changes.

If the request requires a visual change, make it as narrow as possible and prefer existing styling hooks:

- existing SCSS module classes
- existing metadata `parts`
- existing theme variables
- existing `classes` part overrides

Do not redesign the component.

## Public API Discipline

Treat metadata as the public XMLUI contract.

Only add or change props, events, APIs, parts, context variables, or theme variables when the user asks for a public capability or the implementation cannot be done safely without it.

When changing metadata or theme variables, remember that generated metadata snapshots may need to be updated according to the repository rules.

## Unclear Requests

If the request is ambiguous, do not start implementation.

Ask targeted clarification questions and update the execution plan before editing files.

Examples of ambiguity that should trigger questions:

- unclear target component
- unclear region/template to change
- unclear visual outcome
- unclear whether behavior should be local or package-wide
- unclear compatibility expectation
- request conflicts with existing component API or styling

## Execution Plan

Before implementation, identify:

1. Target component.
2. Exact requested behavior.
3. Files expected to change.
4. Whether the change is local or cross-boundary.
5. Whether metadata, styling, tests, or docs are affected.

If new information changes the scope, update the plan before continuing.

## After Implementation

Stop after the requested implementation is complete.

Do not continue into unrelated cleanup, broad refactoring, documentation expansion, or extra feature work.

Ask the user whether they want tests added or updated to preserve functional and visual integrity. Recommend the appropriate test type when clear, such as:

- unit tests for state, prop, and rendering behavior
- Playwright/E2E tests for user workflows
- visual or screenshot-oriented checks for layout and styling-sensitive changes

Do not create tests unless the user asked for tests or the repository task explicitly requires them.
