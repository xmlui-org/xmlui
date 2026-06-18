# Plan Diff 02

Snapshot: `master-plan-02.md`  
Previous snapshot: `master-plan-01.md`

## 1. Prompt

I want to start preparing the XMLUI migration by executing these small XMLUI
apps correctly. For now, build only enough infrastructure to handle them in
Vite dev-server mode:

- a local counter app;
- a counter using user-defined components;
- a counter using global variables and local shadowing.

Please update the master plan to start with whatever we need for this
experiment.

## 1. Edit Summary

- Added a new `First Migration Experiment` section.
- Defined the first executable target as a deliberately small Vite dev-server
  slice.
- Added the three counter examples as target apps.
- Scoped the initial implementation to `Main.xmlui`, sibling user-defined
  components, `<App>`, `<H1>`, `<Button>`, text expressions, literal and
  expression props, `$props`, local variables, global variables, lexical
  shadowing, compiled `count++`, and incremental UI updates.
- Explicitly deferred routing, data fetching, forms, theming, extension
  packages, code-behind files, production builds, standalone mode, SSG,
  language-server behavior, and full XMLUI scripting.
- Reworked the initial milestones so the first migration experiment comes
  before the broader compatibility inventory and architecture work.

## 2. Prompt

I changed the XMLUI code fences to XML code fences because XML is supported
directly by GitHub and VS Code.

Now collect the pieces from the original architecture that we should implement
for the new experiment so we can run the examples from earlier. Include things
like project structure, Vite dev-server setup, XMLUI markup parsing,
expression/event-handler parsing, compilation, and the initial rendering
pipeline.

Use only the original architecture elements that are truly required. Do not
copy them blindly; review them, remove unnecessary pieces, and learn how the
existing XMLUI uses the Managed React approach. Incorporate only the lightest
Managed React features required for the experiment.

## 2. Edit Summary

- Added a `Required Architecture Pieces` section under the first experiment.
- Broke the initial slice into ten concrete areas:
  - project skeleton;
  - Vite dev-server integration;
  - markup parser;
  - expression and event parsing;
  - compiler IR;
  - code generation;
  - runtime state model;
  - rendering pipeline;
  - minimal Managed React contracts;
  - verification harness.
- For each area, recorded what must be built now, which old XMLUI pieces to
  learn from, and which old subsystems to leave out.
- Captured the minimal Managed React principles needed now: parsed and checked
  expressions/handlers, XMLUI-owned state and rendering, a compiler IR as the
  contract boundary, and a tiny metadata/diagnostic surface.
- Explicitly deferred the old provider stack, containers, reducers, proxies,
  analyzers, theming, routing, data operations, lifecycle, concurrency,
  sandboxing, accessibility enforcement, i18n, audit logging, and versioning
  diagnostics.

## 3. Prompt

I want to use the existing unit and E2E test cases, keeping them almost
literally the same, while allowing changes to the unit and E2E test
infrastructure. Our initial experiment is invalid unless we can support it with
unit and E2E tests.

## 3. Edit Summary

- Made unit and E2E tests a hard validity gate for the first experiment.
- Extended the verification harness to require:
  - unit tests for parser, compiler IR, dependency extraction, code generation,
    and runtime state rules;
  - an E2E harness that can run XMLUI snippets and sibling component
    definitions with test bodies nearly identical to the old suite.
- Added a `Test Reuse Contract`.
- Specified that old XMLUI snippets, expected visible text, and interaction
  sequences should be preserved as much as practical.
- Allowed changes to imports, fixtures, helper setup, and app mounting where
  required by the new infrastructure.
- Required deferred tests to be recorded with their missing feature instead of
  deleted.
- Identified the first reusable old-test areas: local variables, `count++`,
  globals, local shadowing, user-defined components, repeated component
  instances, and parser handling of `var.*`, `global.*`, text expressions,
  props, and `<Component name="...">`.

## 4. Prompt

Assume the first experiment is successful. Please plan incremental experiments,
focusing only on their scope and what we will learn from them, so we can
progress toward the full re-implementation of the XMLUI framework. Each
experiment should test something that moves us closer to the project goals.

## 4. Edit Summary

- Added an `Incremental Experiment Roadmap` after the first experiment.
- Planned experiments for:
  - broader expression compilation;
  - handler compilation and mutation semantics;
  - reactive graph and derived variables;
  - user-defined component composition;
  - built-in component expansion;
  - data operations and Managed React fetching;
  - routing and app shell;
  - theming, layout, and styling;
  - standalone runtime compilation;
  - production build and artifact shape;
  - static site generation and hydration;
  - tooling and metadata unification;
  - extension packages and public API compatibility;
  - full compatibility sweep.
- For each experiment, documented the intended scope and the architectural
  lesson it should teach.
- Kept the roadmap incremental, compatibility-driven, and focused on learning
  rather than implementing the entire framework at once.
