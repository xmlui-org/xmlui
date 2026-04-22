# Mermaid Diagram Conventions

Lessons learned authoring Mermaid diagrams for the XMLUI dev docs.

---

## Node label formatting

- Use `<br>` for line breaks inside node labels, **not** `\n`. Backslash-n is not rendered by Mermaid's parser inside `"…"` label strings.
- Avoid escaped double quotes (`\"`) inside `"…"` labels — this causes a parse error. Use single quotes or backtick-quoted inner strings instead:
  ```
  Node["var.y = 'hello'"]          ✓
  Node["var.y = \"{'hello'}\""]    ✗ parse error
  Node["var.y = '{`hello`}'"]      ✓ workaround with backticks
  ```
- HTML entities work in labels: `&lt;` → `<`, `&gt;` → `>`, `&quot;` → `"`.
- Use `·` (middle dot, U+00B7) as a compact inline separator when listing short items that don't warrant a full `<br>`. Example: `"subject · validationResults · interactionFlags"`. Reserve `<br>` for longer or structured content that genuinely needs a new line.

---

## Subgraph layout

- **Never mix `direction` overrides inside nested subgraphs.** Declaring `direction TB` inside a subgraph that lives inside a `graph LR` (or vice versa) causes Mermaid to misplace nodes — they float outside their intended container.
- For deeply nested structures, use **`graph TD` with no `direction` overrides anywhere**. This is the most stable option.
- `graph LR` gives more horizontal breathing room for subgraph title labels, but nesting more than two levels deep often breaks layout. Prefer it only for shallow (one-level) subgraphs.
- Subgraph title labels get clipped by child boxes in `graph TD` when children expand to full width. Mitigation: reduce node content, or flatten the nesting.

---

## Edge declarations in nested subgraphs

- **Do not target a subgraph frame with an edge.** `A --> MySubgraph` does not work reliably. Always create an explicit node inside the subgraph and target that.
- **Declare all cross-boundary edges outside all subgraph blocks**, at the top level of the diagram. Mermaid resolves node IDs globally, so edge declarations outside subgraphs work regardless of where the nodes were defined.
- Edges declared inside a subgraph that reference a node outside it may render incorrectly or cause layout shifts.

---

## Choosing the right diagram type

| Situation | Best Mermaid type |
|-----------|-------------------|
| Static ownership/nesting (what belongs where) | `graph TD` |
| Runtime/temporal flow (what happens when) | `sequenceDiagram` |
| Side-by-side comparison of two structures | `graph TB` with two top-level subgraphs |
| Mutation bubbling through containers | `sequenceDiagram` |
| State before vs after | Two separate `graph TD` diagrams, or a `sequenceDiagram` with `Note` separators |

---

## Dashed vs solid edges

- Use solid arrows (`-->`) for data flow and structural relationships (ownership, inheritance, declaration).
- Use dashed arrows (`-.->`) for event-driven or conditional flows (mutations bubbling, writes, user interactions).
- Label edges with `|"label text"|` for clarity on non-obvious relationships.

---

## Nodes vs edges: what goes where

- **Nodes are nouns** — they represent things that exist: components, state objects, registries, DOM nodes.
- **Edges are verbs** — they represent what happens between nodes: transformations, checks, dispatches, wraps.
- If a node label contains a question ("label prop present?") or an imperative ("wrap with Label element"), that text belongs on the **edge**, not the node. The condition and its outcome describe the *transition*, not the *thing*.

**Wrong** — stuffs the transition logic into the node:
```
B1["label behavior<br>label prop present?<br>wrap with Label element"]
B2["animation behavior<br>..."]
B1 --> B2
```

**Correct** — node is the name, edge carries the logic:
```
B1["label"]
B2["animation"]
B1 -->|"label prop? → wrap with Label element"| B2
```

---

## Bidirectional state flows

When a diagram shows both a provider pushing data down and consumers dispatching updates back up (e.g., React context + reducer), model both directions explicitly:

```
State -->|"populates"| FC
FC -.->|"useContextSelector: field value"| Input
Input -.->|"dispatch FIELD_VALUE_CHANGED"| State
```

Use solid arrows for the top-down provision (structural) and dashed arrows for the bottom-up dispatches (event-driven). This makes the state loop visible rather than flattening it into a one-way chain.

---

## Representing the React component tree accurately

In the real React tree, a container **wraps** its component — `StateContainer` renders first and passes state down to the actual component node. Diagrams must reflect this nesting to avoid misleading readers.

**Wrong** — collapses the container and component into one node, hiding the wrapper relationship:
```
P1["App<br>var.count=0, var.name='Alice'"]
```

**Correct** — outer subgraph is the container, inner subgraph (or node) is the component:
```
subgraph AppContainer["AppContainer — owns count, name"]
  AppState["owned state<br>count=0, name='Alice'"]
  subgraph AppComp["&lt;App&gt;"]
    ...children...
  end
end
```

The `id` Registration example and the mutation routing examples follow this pattern. The first "Implicit vs Explicit Containers" diagram does not (it was written for compactness) — treat it as an exception only when nesting depth would make the diagram unreadable. When in doubt, prefer accuracy over compactness.
