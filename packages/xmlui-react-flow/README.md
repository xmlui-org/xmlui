# xmlui-react-flow

A ReactFlow wrapper for XMLUI that exposes React Flow diagrams as declarative XMLUI components with animation, layout persistence, and semantic edge targeting via ARIA labels.

## Why ARIA labels?

In React Flow, the library owns the DOM. React will replace elements, reorder children, and reconcile virtual DOM trees. ARIA labels are the one stable, semantic layer that survives re-renders. The `aria-label` on a `<g>` element is a contract: this element means "proffers", and when React recreates it, the new element will have the same label.

This makes `querySelector('[aria-label="proffers"]')` a reliable bridge between the reactive world (where state changes trigger re-renders) and the imperative world (where you need to find a specific SVG element and append an animated circle to it).

## Animation APIs

### pulseEdge(label, duration?)

Animate a glowing dot along an edge identified by its semantic label. The dot follows the edge's bezier path using SVG `<animateMotion>`.

```js
canvas.pulseEdge('proffers', 1800)
```

If the edge was just added via `addEdge`, the API retries finding the DOM element across multiple animation frames before starting.

### pulseEdgeRoundTrip(label, duration?)

Animate a dot forward (source to target) then back (target to source) along the same edge. Arrows swap direction between legs.

```js
canvas.pulseEdgeRoundTrip('consults policy', 1800)
```

Use this for request/response patterns where a single labeled edge represents bidirectional communication.

### Concurrent pulses

Multiple edges can pulse simultaneously. Each `pulseEdge` call only clears its own edge's previous animation, not all animations globally.

```js
canvas.pulseEdge('delegates to', 1800)
canvas.pulseEdge('delegates personal agency', 1800)
```

### clearPulse()

Clear all active pulse animations.

## Edge APIs

### addEdge(id, source, target, sourceHandle, targetHandle, label, noArrow?, extraData?)

Dynamically add an edge. Optional `extraData` is merged into the edge's data object.

```js
canvas.addEdge('e-consult', 'entity-agent', 'entity', 'bottom-left', 'top-left', 'consults policy')
canvas.addEdge('e-send', 'person', 'person-agent', 'bottom', 'top', 'send', false, { labelPosition: 60 })
```

### removeEdge(id)

Remove a dynamically added edge by ID. Use with `addEdge` for transient edges that appear only during animation.

```js
canvas.removeEdge('e-consult')
```

## Layout

### getLayout()

Returns current node positions and sizes as a JSON object matching the `layout.json` format.

```js
canvas.getLayout()
// { nodes: { person: { x: 112, y: -384, width: 300, height: 380 }, ... } }
```

## Node features

### Chromeless nodes

Set `data.chrome` to `false` to render a node without border, shadow, drag bar, or handles. Useful for placing buttons or labels on the canvas.

```js
{ id: 'control', position: { x: 400, y: -500 }, data: { label: 'Control', chrome: false }, width: 100, height: 50 }
```

### Handles

Each node has 3 handles per side:

| Side | Handles |
|------|---------|
| Top | `top-left`, `top`, `top-right` |
| Bottom | `bottom-left`, `bottom`, `bottom-right` |
| Left | `left-top`, `left`, `left-bottom` |
| Right | `right-top`, `right`, `right-bottom` |

Plus configurable magnet handles via `data.magnetY`.

## Edge label positioning

### labelPosition

Place the label at a percentage (0-100) of the edge's path length. Default is 50 (midpoint). Uses SVG `getPointAtLength` for accurate positioning along bezier curves.

```js
{ id: 'e1', ..., data: { label: 'delegates agency', labelPosition: 30 } }
```

### labelOffsetX / labelOffsetY

Pixel offset for fine-tuning label position after `labelPosition` is applied.

## Props

| Prop | Default | Description |
|------|---------|-------------|
| `fitView` | `true` | Auto-fit all nodes on initial render |
| `fitViewPadding` | `0.15` | Padding around nodes when fitView is active |
| `showEdgeInfo` | `false` | Show info icons on edge labels |
| `showControls` | `true` | Show zoom/fit controls |
| `showMinimap` | `false` | Show minimap |
| `showBackground` | `true` | Show dot grid background |
| `snapToGrid` | `false` | Snap nodes to grid when dragging |
| `storageKey` | (none) | localStorage key for persisting positions. Omit to disable persistence. |

## Canvas API from child nodes

The canvas API is exposed on `window.__reactFlowCanvasApi` so XMLUI components rendered inside canvas nodes can call it:

```xml
<Button onClick="window.__reactFlowCanvasApi.pulseEdge('proffers', 1800)" />
```

This solves the scoping problem where a component rendered inside the canvas can't reference the canvas by its XMLUI id.

## React re-render resilience

Animation dots are appended directly to the SVG DOM, bypassing React. When React re-renders destroy the edge group (e.g., because a state change triggered by the animation causes a re-render), a `requestAnimationFrame`-based reapply mechanism re-creates the dot on the fresh DOM element, found by the same `aria-label`.

The render counter (`_rc`) in node data ensures ReactFlow re-renders nodes when the XMLUI props expression changes, without requiring manual `_v` tracking in app code.
