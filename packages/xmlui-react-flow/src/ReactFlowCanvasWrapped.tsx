import { ReactFlowCanvasRender } from "./ReactFlowCanvasRender";
import { wrapComponent, createMetadata, d } from "xmlui";

const COMP = "ReactFlowCanvas";

export const ReactFlowCanvasMd = createMetadata({
  status: "experimental",
  description:
    "`ReactFlowCanvas` wraps React Flow to provide a pannable, zoomable canvas " +
    "with draggable, resizable, connectable nodes and custom edges. Each node " +
    "renders user-defined xmlui component content.",
  props: {
    nodes: d(
      "Array of node objects. Each node: { id, type?, position: {x,y}, data, width?, height? }. " +
      "Node `data` is exposed as `$node.data` inside node templates.",
    ),
    edges: d(
      "Array of edge objects. Each edge: { id, source, target, sourceHandle?, targetHandle?, type?, data? }. " +
      "Edge `data` is exposed as `$edge.data` inside edge templates.",
    ),
    defaultNodeWidth: d(
      "Default width for nodes that don't specify one.",
      undefined,
      "number",
      200,
    ),
    defaultNodeHeight: d(
      "Default height for nodes that don't specify one.",
      undefined,
      "number",
      100,
    ),
    snapToGrid: d(
      "Whether nodes snap to a grid when dragged.",
      undefined,
      "boolean",
      false,
    ),
    snapGrid: d(
      "Grid size as [x, y] when snapToGrid is true.",
      undefined,
      "string",
      "[16, 16]",
    ),
    fitView: d(
      "Whether to auto-fit all nodes in view on initial render.",
      undefined,
      "boolean",
      true,
    ),
    panOnDrag: d(
      "Whether the canvas pans when dragging on empty space.",
      undefined,
      "boolean",
      true,
    ),
    zoomOnScroll: d(
      "Whether scroll-wheel zooms the canvas.",
      undefined,
      "boolean",
      true,
    ),
    showMinimap: d(
      "Whether to show a minimap overview.",
      undefined,
      "boolean",
      false,
    ),
    showControls: d(
      "Whether to show zoom/fit controls.",
      undefined,
      "boolean",
      true,
    ),
    showBackground: d(
      "Whether to show a dot-grid background.",
      undefined,
      "boolean",
      true,
    ),
    storageKey: d(
      "localStorage key for persisting node positions and edges. When set, canvas state is saved automatically and restored on reload.",
      undefined,
      "string",
    ),
    nodeTemplate: d(
      "The default template used to render node content. Use `$node` to access the current node object.",
    ),
    edgeTemplate: d(
      "The template used to render custom edge labels. Use `$edge` to access the current edge object.",
    ),
  },
  contextVars: {
    $node: d("The current node object (available inside node templates)."),
    $edge: d("The current edge object (available inside edge templates)."),
    $nodes: d("The full array of nodes."),
    $edges: d("The full array of edges."),
  },
  childrenAsTemplate: "nodeTemplate",
  apis: {
    moveNode: {
      description: "Move a node to a new position. Args: nodeId, x, y",
      signature: "moveNode(nodeId: string, x: number, y: number): void",
    },
    pulseEdge: {
      description:
        "Animate a single edge by its semantic label. " +
        "A glowing dot travels the edge.",
      signature: "pulseEdge(label: string, duration?: number): void",
    },
    pulseEdgeRoundTrip: {
      description: "Animate a dot forward then back along an edge, with arrows appearing at the appropriate ends.",
      signature: "pulseEdgeRoundTrip(label: string, duration?: number): void",
    },
    clearPulse: {
      description: "Clear all pulse animations.",
      signature: "clearPulse(): void",
    },
    getLayout: {
      description: "Returns current node positions and sizes as a layout object.",
      signature: "getLayout(): { nodes: Record<string, { x: number, y: number, width: number, height: number }> }",
    },
  },
});

export const reactFlowCanvasComponentRenderer = wrapComponent(
  COMP,
  ReactFlowCanvasRender,
  ReactFlowCanvasMd,
  { captureNativeEvents: true, strings: ["storageKey", "snapGrid"], exposeRegisterApi: true },
);
