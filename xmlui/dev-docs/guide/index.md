# XMLUI Developer Guides

Comprehensive, numbered guides covering all major XMLUI subsystems. Read them in order for a full picture, or jump to the relevant guide for your task.

---

## AI-Assisted Tasks

The most common development tasks have ready-made prompt files in `.github/prompts/`. Invoke them in VS Code Copilot Chat using `#` followed by the prompt name:

| Task | Prompt | Key guides |
|------|--------|-----------|
| Create a new built-in component | `#create-component` | 04, 05, 07, 09 |
| Add props, events, or theme vars to an existing component | `#extend-component` | 04, 05, 07 |
| Create a component in an extension package | `#create-extension-component` | 04, 14 |
| Create a new extension package from scratch | `#create-extension-package` | 14 |
| Fix a bug with a regression test | `#fix-bug` | 02, 23 |
| Audit a component for correctness and coverage | `#qa-review` | 04, 23, 24 |
| Add or expand Playwright tests | `#add-e2e-tests` | 23 |
| Refactor framework internals | `#refactor-core` | 01, 02, 03 |
| Write or update component documentation | `#write-component-docs` | 25 |
| Add a new stereotype prompt | `#add-stereotype` | — |

**Example:** to create a new component, open Copilot Chat and type:
```
#create-component Create a new Divider component with an optional label prop.
```

---

**Core Architecture**
- [01 — Framework Mental Model & Request Lifecycle](./01-mental-model.md)
- [02 — Rendering Pipeline](./02-rendering-pipeline.md)
- [03 — Container & State System](./03-container-state.md)
- [06 — Expression Evaluation & Scripting](./06-expression-eval.md)

**Component Authoring**
- [04 — Component Architecture: The Two-File Pattern](./04-component-architecture.md)
- [05 — wrapComponent — The Integration Workhorse](./05-wrapcomponent.md)
- [09 — Behaviors System](./09-behaviors.md)
- [11 — User-Defined Components](./11-user-defined-components.md)
- [16 — Option-Based Components](./16-option-components.md)

**Theming & Styling**
- [07 — Theming & Styling](./07-theming-styling.md)

**Data & Actions**
- [08 — Data Operations & Loaders](./08-data-operations.md)
- [10 — Action Execution Model](./10-action-execution.md)
- [12 — Form Infrastructure](./12-form-infrastructure.md)

**App Infrastructure**
- [13 — Routing](./13-routing.md)
- [14 — Extension Packages](./14-extension-packages.md)
- [15 — Global Context & Utilities (AppContext)](./15-app-context.md)
- [17 — Error Handling Strategy](./17-error-handling.md)

**Tooling & Operations**
- [18 — Parsers](./18-parsers.md)
- [19 — Inspector & Debugging](./19-inspector-debugging.md)
- [20 — Language Server (LSP)](./20-language-server.md)
- [21 — Build System & Deployment](./21-build-system.md)
- [22 — Monorepo Structure & Tooling](./22-monorepo-structure.md)
- [23 — Testing Conventions](./23-testing-conventions.md)
- [24 — Accessibility](./24-accessibility.md)
- [25 — Documentation Generation](./25-doc-generation.md)
- [26 — Performance Profiling](./26-performance-profiling.md)
