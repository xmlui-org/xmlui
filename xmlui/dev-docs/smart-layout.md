# Smart Layout — Design Notes

> **Status:** Prototype / in progress
>
> Goal: components automatically adjust spacing based on their layout context — no
> explicit `margin`, `padding`, or `gap` needed in markup.

---

## Background and motivation

Every major UI framework solves the "correct spacing without manual values" problem differently:

| Framework | Mechanism |
|-----------|-----------|
| **SwiftUI** | `VStack(spacing:)` + per-platform defaults; `GroupBox`/`Section` adjust padding by context |
| **Material Design 3** | Canonical layout + density tokens; spacing is a function of component role and surface depth |
| **Flutter** | `Theme.of(context)` propagates spacing constants; `ListTile` inside `Card` auto-adjusts padding |
| **Chakra UI** | `<Stack spacing>` + `<Card><CardBody>` provides contextual padding automatically |
| **CSS owl selector** | `* + * { margin-top: 1em }` — uniform sibling-aware spacing with no component knowledge |

XMLUI is in a unique position: every component renderer already receives the full
`LayoutContext` ancestry chain at render time, and the framework owns all component
renderers. This means spacing decisions can be made centrally per-component without
any user-facing API changes — the markup stays clean, and the framework does the
typographic work.

The driving example: a user writes

```xml
<Card>
  <H1 value="Welcome" />
  <Text value="Some body copy." />
  <Button label="Get Started" />
</Card>
```

and gets visually correct spacing — heading margins, body rhythm, action separation —
without any explicit `margin`, `padding`, or `gap` in the markup.

---

## Key concepts

### Layout context (`LayoutContext`)

Every renderer receives `layoutContext`, a linked-list chain of layout boundaries from
the component up to the page root. Each node records `type` (layout algorithm, e.g.
`"Stack"`), `depth` (how many boundaries deep), and `parent` (the enclosing context).
The chain is immutable and created bottom-up as containers render their children.

The `[key: string]: any` index on `LayoutContext` allows containers to stamp arbitrary
metadata — e.g. Card stamps `host: "Card"` — so descendants can identify which kind
of surface they are inside without coupling to component internals.

### Tiers

A *tier* is a named abstraction over the raw context chain, reducing the decision
space from unbounded `(depth, host, ...)` combinations to four values:

| Tier | Condition |
|------|-----------|
| `page` | No layout boundary — component is at the root level (`depth === -1`) |
| `section` | Direct child of a raised surface (`host: "Card"` at depth ≤ 1) |
| `nested` | Inside a surface-within-a-surface (`depth ≥ 2` or `host` within `host`) |
| `cell` | Inside a `TableCell` or list row |

Tiers mirror Material Design's density levels and Apple's layout margin tiers.
A `getLayoutTier(ctx)` utility is planned but not yet implemented; current code
reads `host` and `depth` directly.

### Siblings

Spacing between two adjacent elements depends on *which two they are*, not just
each in isolation. A heading followed by body text should have tighter spacing than
body text followed by an action button — this is basic typographic convention that
appears in every professional design system.

The challenge: today `stableRenderChild` passes the same `layoutContext` object to
all children in a container. Adding a `previousSiblingType` field per-child (one line
change in `child-rendering.tsx`) unlocks this. See the "Remaining work" section for
the exact change.

### Roles

With 100+ components, enumerating every `(myType, siblingType)` pair is not tractable.
*Roles* classify components by semantic function (`heading`, `body`, `action`, `media`,
`divider`, `container`) so spacing rules operate on a small fixed vocabulary regardless
of how many components exist.

---

## What's been implemented

### Infrastructure

**`LayoutContext.host`** (custom field on `LayoutContext` index signature)
Container components that establish a visual surface stamp `host` on their
`childrenLayoutContext`. Card does this:

```ts
// Card.tsx
childrenLayoutContext: { type: "Stack", orientation: "vertical", host: "Card" }
```

**`countAncestorLayouts(ctx, predicate)`** — `layout-context-utils.ts`
Walks the `parent` chain and counts nodes matching a predicate. Used to compute
`cardDepth` (how many Cards deep a component sits).

### Card

- Default `gap-Card` reduced: `var(--stack-gap-default)` → `$space-2`
- Nested Card styling (tighter padding, sunken background) is handled entirely in
  CSS via the `.wrapper .wrapper` descendant selector in `Card.module.scss` — no JS
  needed, since both Cards share the same CSS Modules class hash

### Headings (H1–H6)

Each heading now has a page-level `marginBottom` in `defaultThemeVars`:

| Level | Page `marginBottom` |
|-------|-------------------|
| H1 | `$space-6` |
| H2 | `$space-4` |
| H3 | `$space-3` |
| H4 | `$space-2` |
| H5 | `$space-1` |
| H6 | `$space-1` |

**Card-depth demotion:** each H1–H6 renderer computes `cardDepth` via
`countAncestorLayouts(layoutContext, ctx => ctx.host === "Card")` and shifts its
rendered font size down by that many steps in the `HEADING_FONT_SIZES` array
(`var(--xmlui-fontSize-H1)` → `var(--xmlui-fontSize-H2)` etc.), capped at H6.
Margins are zeroed at any `cardDepth > 0`; Card's `gap` takes responsibility for
spacing. The semantic HTML tag (`<h1>`, `<h2>`) is unchanged — only the visual
size shifts.

```
Context               H1 renders as    H2 renders as
page                  fontSize-H1      fontSize-H2
inside one Card       fontSize-H2      fontSize-H3
Card inside Card      fontSize-H3      fontSize-H4
```

Font-size values reference per-heading CSS variables (`var(--xmlui-fontSize-H2)`)
rather than raw scale tokens, so theme customisations on individual heading sizes
are respected.

---

## Remaining work

### Next: sibling signal (highest leverage)

The single biggest remaining gap is that spacing between siblings is uniform —
Card's `gap` applies equally between all children. Real typography needs
`Heading→Text` to be tighter than `Text→Button`.

The injection point is `stableRenderChild` in `child-rendering.tsx`:

```ts
// Inside the children.map() loop
const prevSiblingType = childIndex > 0 ? children[childIndex - 1]?.type : undefined;
const childLc = prevSiblingType ? { ...lc, previousSiblingType: prevSiblingType } : lc;
// pass childLc instead of lc to renderChildUtil
```

`previousSiblingType` then flows into every renderer via `layoutContext`, just
like `host` does today. No type-system changes needed — `LayoutContext` already
has `[key: string]: any`.

Consumers once this lands:
- **H1–H6**: tighter `marginTop` when preceded by another heading (sub-section feel)
- **Text**: tight `marginTop` after a heading, paragraph gap after body text
- **Button**: generous `marginTop` after body text

### After siblings: role classification

Enumerating every `(myType, siblingType)` pair won't scale to 100+ components.
Add `layoutRole` to `ComponentMetadata`:

| Role | Examples |
|------|---------|
| `heading` | H1–H6 |
| `body` | Text |
| `action` | Button, Link |
| `media` | Image, Icon |
| `divider` | ContentSeparator, SpaceFiller |
| `container` | Card, Stack (nested) |

Rules then operate on `(myRole, siblingRole, tier)` — tractable even as more
components are added. Introduce `getSmartSpacing(myRole, siblingRole, tier)`
as the single source of truth.

### After roles: tier-aware container gap

Replace the single `stack-gap-default` CSS variable with a `getLayoutTier(ctx)`
utility that maps the ancestor chain to `page | section | nested | cell`, then
use that tier to drive Stack's default gap. This eliminates the need for
components to compensate with their own margins in most cases.

---

## Design principles

**Cascade priority** (high to low):
1. Explicit user prop (`marginBottom="$space-2"`)
2. Sibling rule `(myRole, siblingRole, tier)`
3. Tier rule `(myRole, tier)`
4. Theme default in `defaultThemeVars`

**Hybrid approach:** containers set a baseline `gap` for the tier; components
carry small role-based margin adjustments only for semantically meaningful
differences (e.g. heading–body tight coupling). 90% of cases are covered by
gap alone.

---

## Demo code

Observe how:
- Headings have smaller font sizes in nested Cards
- Headings in Cards have no bottom margin

```xml
<App>
    <H1>Component Display</H1>
    <H2>Component Display</H2>
    <H3>Component Display</H3>
    <H4>Component Display</H4>
    <H5>Component Display</H5>
    <Text>Use this page to test out components in isolation.</Text>
    <Button label="Button" />
    
    <Card>
      <H1>Component Display</H1>
      <H2>Component Display</H2>
      <H3>Component Display</H3>
      <H4>Component Display</H4>
      <H5>Component Display</H5>
      <Text>Use this page to test out components in isolation.</Text>
      <Button label="Button" />
    </Card>

    <Card>
      <Text>Use this page to test out components in isolation.</Text>
      <Button label="Button" />
      
      <Card>
        <H1>Component Display</H1>
        <H2>Component Display</H2>
        <H3>Component Display</H3>
        <H4>Component Display</H4>
        <H5>Component Display</H5>
        <Text>Use this page to test out components in isolation.</Text>
        <Button label="Button" />
      </Card>
    </Card>
</App>
```