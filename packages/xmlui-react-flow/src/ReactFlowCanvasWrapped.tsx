import { ReactFlowCanvasRender } from "./ReactFlowCanvasRender";
import { wrapComponent, createMetadata } from "xmlui";

const COMP = "ReactFlowCanvas";

export const ReactFlowCanvasMd = createMetadata({
  status: "experimental",
  description:
    "`ReactFlowCanvas` wraps React Flow to provide a pannable, zoomable canvas " +
    "with draggable, resizable, connectable nodes and custom edges. Each node " +
    "renders user-defined xmlui component content.",
  props: {
    nodes: {
      description:
        "Array of node objects. Each node: { id, type?, position: {x,y}, data, width?, height? }. " +
        "Node `data` is exposed as `$node.data` inside node templates.",
    },
    edges: {
      description:
        "Array of edge objects. Each edge: { id, source, target, sourceHandle?, targetHandle?, type?, data? }. " +
        "Edge `data` is exposed as `$edge.data` inside edge templates.",
    },
    defaultNodeWidth: {
      description: "Default width for nodes that don't specify one.",
      valueType: "number",
      defaultValue: 200,
    },
    defaultNodeHeight: {
      description: "Default height for nodes that don't specify one.",
      valueType: "number",
      defaultValue: 100,
    },
    snapToGrid: {
      description: "Whether nodes snap to a grid when dragged.",
      valueType: "boolean",
      defaultValue: false,
    },
    snapGrid: {
      description: "Grid size as [x, y] when snapToGrid is true.",
      valueType: "string",
      defaultValue: "[16, 16]",
    },
    fitView: {
      description: "Whether to auto-fit all nodes in view on initial render.",
      valueType: "boolean",
      defaultValue: true,
    },
    panOnDrag: {
      description: "Whether the canvas pans when dragging on empty space.",
      valueType: "boolean",
      defaultValue: true,
    },
    zoomOnScroll: {
      description: "Whether scroll-wheel zooms the canvas.",
      valueType: "boolean",
      defaultValue: true,
    },
    showMinimap: {
      description: "Whether to show a minimap overview.",
      valueType: "boolean",
      defaultValue: false,
    },
    showControls: {
      description: "Whether to show zoom/fit controls.",
      valueType: "boolean",
      defaultValue: true,
    },
    showBackground: {
      description: "Whether to show a dot-grid background.",
      valueType: "boolean",
      defaultValue: true,
    },
    storageKey: {
      description:
        "localStorage key for persisting node positions and edges. When set, canvas state is saved automatically and restored on reload.",
      valueType: "string",
    },
    nodeTemplate: {
      description:
        "The default template used to render node content. Use `$node` to access the current node object.",
    },
    edgeTemplate: {
      description:
        "The template used to render custom edge labels. Use `$edge` to access the current edge object.",
    },
  },
  contextVars: {
    $node: {
      description: "The current node object (available inside node templates).",
    },
    $edge: {
      description: "The current edge object (available inside edge templates).",
    },
    $nodes: {
      description: "The full array of nodes.",
    },
    $edges: {
      description: "The full array of edges.",
    },
  },
  childrenAsTemplate: "nodeTemplate",
  apis: {
    moveNode: {
      description: "Move a node to a new position. Args: nodeId, x, y",
      signature: "moveNode(nodeId: string, x: number, y: number): void",
    },
    pulseEdge: {
      description:
        "Animate a single edge by its semantic label. " + "A glowing dot travels the edge.",
      signature: "pulseEdge(label: string, duration?: number): void",
    },
    pulseEdgeRoundTrip: {
      description:
        "Animate a dot forward then back along an edge, with arrows appearing at the appropriate ends.",
      signature: "pulseEdgeRoundTrip(label: string, duration?: number): void",
    },
    clearPulse: {
      description: "Clear all pulse animations.",
      signature: "clearPulse(): void",
    },
    getLayout: {
      description: "Returns current node positions and sizes as a layout object.",
      signature:
        "getLayout(): { nodes: Record<string, { x: number, y: number, width: number, height: number }> }",
    },
  },
});

export const reactFlowCanvasComponentRenderer = wrapComponent(
  COMP,
  ReactFlowCanvasRender,
  ReactFlowCanvasMd,
  { captureNativeEvents: true, strings: ["storageKey", "snapGrid"], exposeRegisterApi: true },
);
