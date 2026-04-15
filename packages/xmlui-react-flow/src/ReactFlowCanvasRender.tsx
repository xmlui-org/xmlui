import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BaseEdge,
  useNodesState,
  useEdgesState,
  addEdge,
  NodeResizer,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  type NodeProps,
  type EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function flattenChildren(children: React.ReactNode): React.ReactNode[] {
  const flat: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.props.children) {
      const inner = child.props.children;
      if (Array.isArray(inner)) {
        inner.forEach((c: React.ReactNode) => flat.push(c));
      } else {
        flat.push(child);
      }
    } else {
      flat.push(child);
    }
  });
  return flat;
}

// ---------------------------------------------------------------------------
// Context for passing live xmlui children to custom nodes
// ---------------------------------------------------------------------------

const ChildrenContext = createContext<React.ReactNode[]>([]);


// ---------------------------------------------------------------------------
// Default custom node — renders xmlui children with handles + resizer
// ---------------------------------------------------------------------------

function XmluiNode({ id, data, selected }: NodeProps) {
  const chromeless = data.chrome === false;

  if (chromeless) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {data.renderContent ?? (
          <div style={{ fontSize: 14, color: "var(--xmlui-textColor, #1e293b)" }}>
            {data.label ?? data.id}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        borderRadius: "var(--xmlui-borderRadius-Card, 8px)",
        overflow: "visible",
        display: "flex",
        flexDirection: "column" as const,
        minWidth: 0,
        border: `1px solid ${selected ? "var(--xmlui-borderColor--focus, #3b82f6)" : "var(--xmlui-borderColor-Card, #e2e8f0)"}`,
        boxShadow: selected
          ? "0 0 0 2px var(--xmlui-borderColor--focus, #3b82f6)"
          : "0 1px 3px rgba(0,0,0,0.1)",
        background: "var(--xmlui-backgroundColor-Card, #fff)",
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={60}
        lineStyle={{ borderColor: "var(--xmlui-borderColor--focus, #3b82f6)", zIndex: 10 }}
        handleStyle={{ backgroundColor: "var(--xmlui-borderColor--focus, #3b82f6)", width: 10, height: 10, zIndex: 10 }}
      />
      {/* Top handles: left (20%), center (50%), right (80%) */}
      <Handle type="source" position={Position.Top} id="top-left" style={{ background: "#6b7280", zIndex: 2, left: "20%" }} />
      <Handle type="target" position={Position.Top} id="top-left" style={{ background: "#6b7280", zIndex: 2, left: "20%", opacity: 0 }} />
      <Handle type="source" position={Position.Top} id="top" style={{ background: "#6b7280", zIndex: 2 }} />
      <Handle type="target" position={Position.Top} id="top" style={{ background: "#6b7280", zIndex: 2, opacity: 0 }} />
      <Handle type="source" position={Position.Top} id="top-right" style={{ background: "#6b7280", zIndex: 2, left: "80%" }} />
      <Handle type="target" position={Position.Top} id="top-right" style={{ background: "#6b7280", zIndex: 2, left: "80%", opacity: 0 }} />
      {/* Bottom handles: left (20%), center (50%), right (80%) */}
      <Handle type="source" position={Position.Bottom} id="bottom-left" style={{ background: "#6b7280", zIndex: 2, left: "20%" }} />
      <Handle type="target" position={Position.Bottom} id="bottom-left" style={{ background: "#6b7280", zIndex: 2, left: "20%", opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: "#6b7280", zIndex: 2 }} />
      <Handle type="target" position={Position.Bottom} id="bottom" style={{ background: "#6b7280", zIndex: 2, opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom-right" style={{ background: "#6b7280", zIndex: 2, left: "80%" }} />
      <Handle type="target" position={Position.Bottom} id="bottom-right" style={{ background: "#6b7280", zIndex: 2, left: "80%", opacity: 0 }} />
      {/* Left handles: top (20%), middle (50%), bottom (80%) */}
      <Handle type="source" position={Position.Left} id="left-top" style={{ background: "#6b7280", zIndex: 2, top: "20%" }} />
      <Handle type="target" position={Position.Left} id="left-top" style={{ background: "#6b7280", zIndex: 2, top: "20%", opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="left" style={{ background: "#6b7280", zIndex: 2 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ background: "#6b7280", zIndex: 2, opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="left-bottom" style={{ background: "#6b7280", zIndex: 2, top: "80%" }} />
      <Handle type="target" position={Position.Left} id="left-bottom" style={{ background: "#6b7280", zIndex: 2, top: "80%", opacity: 0 }} />
      {/* Right handles: top (20%), middle (50%), bottom (80%) */}
      <Handle type="source" position={Position.Right} id="right-top" style={{ background: "#6b7280", zIndex: 2, top: "20%" }} />
      <Handle type="target" position={Position.Right} id="right-top" style={{ background: "#6b7280", zIndex: 2, top: "20%", opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ background: "#6b7280", zIndex: 2 }} />
      <Handle type="target" position={Position.Right} id="right" style={{ background: "#6b7280", zIndex: 2, opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right-bottom" style={{ background: "#6b7280", zIndex: 2, top: "80%" }} />
      <Handle type="target" position={Position.Right} id="right-bottom" style={{ background: "#6b7280", zIndex: 2, top: "80%", opacity: 0 }} />
      {/* Magnet handles — position configurable via data.magnetY (default 15%) */}
      <Handle type="source" position={Position.Right} id="right-magnet" style={{ background: "#6b7280", zIndex: 2, top: data.magnetY || "15%" }} />
      <Handle type="target" position={Position.Right} id="right-magnet" style={{ background: "#6b7280", zIndex: 2, top: data.magnetY || "15%", opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="left-magnet" style={{ background: "#6b7280", zIndex: 2, top: data.magnetY || "15%" }} />
      <Handle type="target" position={Position.Left} id="left-magnet" style={{ background: "#6b7280", zIndex: 2, top: data.magnetY || "15%", opacity: 0 }} />
      {/* Drag handle bar — only this area initiates node dragging */}
      <div className="xmlui-drag-handle" style={{
        height: 12,
        cursor: "grab",
        background: selected
          ? "var(--xmlui-borderColor--focus, #3b82f6)"
          : "var(--xmlui-color-surface-200, #e2e8f0)",
        borderBottom: "1px solid var(--xmlui-borderColor-Card, #e2e8f0)",
      }} />
      {/* Content layer — interactive, clicks reach xmlui components */}
      <div style={{ overflow: "hidden", width: "100%", minWidth: 0, boxSizing: "border-box", flex: 1 }}>
        {data.renderContent ?? (
          <div style={{ fontSize: 14, color: "var(--xmlui-textColor, #1e293b)", padding: "8px" }}>
            {data.label ?? data.id}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default custom edge — renders label from edge data
// ---------------------------------------------------------------------------

function InfoIcon({ size = 14, color = "currentColor", onClick }: { size?: number; color?: string; onClick?: () => void }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ cursor: "pointer", flexShrink: 0 }}
      onClick={onClick}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function XmluiEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  style,
  markerEnd,
}: EdgeProps) {
  const [edgePath, defaultLabelX, defaultLabelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Compute label position along the path as a percentage of path length (0-100, default 50)
  const labelPct = data?.labelPosition ?? 50;
  const pathRef = useRef<SVGPathElement>(null);
  const [labelPos, setLabelPos] = useState<{x: number, y: number} | null>(null);
  useEffect(() => {
    if (pathRef.current && labelPct !== 50) {
      const totalLen = pathRef.current.getTotalLength();
      const pt = pathRef.current.getPointAtLength(totalLen * labelPct / 100);
      console.log(`[labelPosition] ${data?.label}: pct=${labelPct} totalLen=${Math.round(totalLen)} pt=(${Math.round(pt.x)},${Math.round(pt.y)})`);
      setLabelPos({ x: pt.x, y: pt.y });
    } else {
      setLabelPos(null);
    }
  }, [edgePath, labelPct]);
  const labelX = labelPos?.x ?? defaultLabelX;
  const labelY = labelPos?.y ?? defaultLabelY;

  return (
    <g aria-label={data?.label || id}>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected
            ? "var(--xmlui-borderColor--focus, #3b82f6)"
            : "#475569",
          strokeWidth: selected ? 4 : 3,
          transition: "stroke 0.3s, stroke-width 0.3s",
        }}
      />
      {/* Hidden path for animateMotion — same bezier but discoverable by aria-label */}
      <path ref={pathRef} d={edgePath} fill="none" stroke="none" className="pulse-path" />
      {(data?.label || data?.renderContent) && (
        <EdgeLabelRenderer>
          <div
            aria-label={data?.label ? `${data.label} label` : undefined}
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX + (data?.labelOffsetX ?? 0)}px,${labelY + (data?.labelOffsetY ?? 0)}px)`,
              pointerEvents: "all",
              background: "var(--xmlui-backgroundColor, #fff)",
              border: "1px solid var(--xmlui-borderColor, #e2e8f0)",
              borderRadius: 4,
              padding: "2px 6px",
              fontSize: data?._canvasFontSize || 16,
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "border-color 0.3s, box-shadow 0.3s",
            }}
          >
            {data.renderContent ?? data.label}
            {data.showEdgeInfo && <InfoIcon
              size={14}
              color="var(--xmlui-color-surface-500, #6b7280)"
              onClick={() => {
                data?.onInfoClick?.(id, data.label);
              }}
            />}
          </div>
        </EdgeLabelRenderer>
      )}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Main canvas component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// localStorage persistence helpers
// ---------------------------------------------------------------------------

function loadState(storageKey: string) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(storageKey: string, nodes: Node[], edges: Edge[]) {
  try {
    const state = {
      nodes: nodes.map((n) => ({
        id: n.id,
        position: n.position,
        width: n.measured?.width ?? n.style?.width,
        height: n.measured?.height ?? n.style?.height,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        data: e.data ? { label: e.data.label } : undefined,
      })),
    };
    localStorage.setItem(storageKey, JSON.stringify(state));
    console.log("[ReactFlowCanvas] saved:", storageKey, JSON.stringify(state).substring(0, 200));
  } catch (e) { console.error("[ReactFlowCanvas] save error:", e); }
}

export function ReactFlowCanvasRender({
  nodes: initialNodes = [],
  edges: initialEdges = [],
  registerComponentApi,
  defaultNodeWidth = 200,
  defaultNodeHeight = 100,
  snapToGrid = false,
  snapGrid = "[16, 16]",
  fitView = true,
  fitViewPadding = 0.15,
  panOnDrag = true,
  zoomOnScroll = true,
  showMinimap = false,
  showControls = true,
  showBackground = true,
  showEdgeInfo = false,
  canvasFontSize = 16,
  storageKey,
  className,
  onNativeEvent,
  onPulseStep,
  onPulseComplete,
  onEdgeInfoClick,
  children,
}: {
  nodes?: Node[];
  edges?: Edge[];
  defaultNodeWidth?: number;
  defaultNodeHeight?: number;
  snapToGrid?: boolean;
  snapGrid?: string;
  fitView?: boolean;
  fitViewPadding?: number;
  panOnDrag?: boolean;
  zoomOnScroll?: boolean;
  showMinimap?: boolean;
  showControls?: boolean;
  showBackground?: boolean;
  showEdgeInfo?: boolean;
  canvasFontSize?: number;
  storageKey?: string;
  className?: string;
  onNativeEvent?: (event: any) => void;
  onPulseStep?: (event: any) => void;
  onPulseComplete?: (event: any) => void;
  onEdgeInfoClick?: (event: any) => void;
  registerComponentApi?: (api: any) => void;
  children?: React.ReactNode;
}) {
  const parsedSnapGrid: [number, number] = useMemo(() => {
    try {
      const parsed = JSON.parse(snapGrid);
      if (Array.isArray(parsed) && parsed.length === 2) return parsed as [number, number];
    } catch {}
    return [16, 16];
  }, [snapGrid]);

  // Storage key with fallback default
  const effectiveStorageKey = storageKey || "";
  const storageKeyRef = useRef(effectiveStorageKey);
  storageKeyRef.current = effectiveStorageKey;

  // Stable refs for callbacks to avoid stale closures
  const onNativeEventRef = useRef(onNativeEvent);
  onNativeEventRef.current = onNativeEvent;
  const onPulseStepRef = useRef(onPulseStep);
  onPulseStepRef.current = onPulseStep;
  console.log("[ReactFlowCanvas] onPulseStep prop:", typeof onPulseStep, !!onPulseStep);
  const onPulseCompleteRef = useRef(onPulseComplete);
  onPulseCompleteRef.current = onPulseComplete;
  const onEdgeInfoClickRef = useRef(onEdgeInfoClick);
  onEdgeInfoClickRef.current = onEdgeInfoClick;

  // Capture children once on mount to avoid re-render loops
  const flatChildren = flattenChildren(children);
  const childrenRef = useRef(flatChildren);
  childrenRef.current = flatChildren;

  // Load saved state once
  const savedState = useRef(loadState(effectiveStorageKey));

  // Build initial nodes/edges once, storing child index (not content) to avoid stale snapshots
  const renderCountRef = useRef(0);

  const makeNodes = useCallback(() => {
    renderCountRef.current++;
    const saved = savedState.current;
    return initialNodes.map((node, i) => {
      const savedNode = saved?.nodes?.find((s: any) => s.id === node.id);
      return {
        ...node,
        type: node.type || "xmlui",
        dragHandle: ".xmlui-drag-handle",
        position: savedNode?.position ?? node.position,
        style: {
          width: savedNode?.width ?? node.width ?? defaultNodeWidth,
          height: node.height ?? savedNode?.height ?? "auto",
          ...node.style,
        },
        data: {
          ...node.data,

          renderContent: childrenRef.current[i] ?? null,
        },
      };
    });
  }, [initialNodes, defaultNodeWidth, defaultNodeHeight]);

  const showEdgeInfoRef = useRef(showEdgeInfo);
  showEdgeInfoRef.current = showEdgeInfo;

  const canvasFontSizeRef = useRef(canvasFontSize);
  canvasFontSizeRef.current = canvasFontSize;

  const addInfoClick = useCallback((data: any) => ({
    ...data,
    showEdgeInfo: showEdgeInfoRef.current,
    _canvasFontSize: canvasFontSizeRef.current,
    onInfoClick: (edgeId: string, label: string) => {
      const evt = { edgeId, label };
      onNativeEventRef.current?.({
        type: "edgeInfoClick",
        displayLabel: `${label} (${edgeId})`,
        ...evt,
      });
      onEdgeInfoClickRef.current?.(evt);
    },
  }), []);

  const makeEdges = useCallback(() => {
    const saved = savedState.current;
    // Start with initial edges
    const defaultMarker = { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#64748b" };
    const edges = initialEdges.map((edge) => ({
      ...edge,
      type: edge.type || "xmlui",
      markerEnd: defaultMarker,
      data: addInfoClick(edge.data),
    }));
    // Note: we intentionally do not restore edges from saved state.
    // Dynamically added edges (e.g., signed agreements) should not persist across reloads.
    return edges;
  }, [initialEdges, addInfoClick]);

  const [nodes, setNodes, onNodesChange] = useNodesState(makeNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(makeEdges());
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;


  // Expose canvas API (both to XMLUI framework and to window for child node access)
  useEffect(() => {
    const api = {
      moveNode: (nodeId: string, x: number, y: number) => {
        setNodes((nds) =>
          nds.map((n) => n.id === nodeId ? { ...n, position: { x, y } } : n)
        );
      },
      moveNodeBeside: (nodeId: string, targetId: string, side: string) => {
        setNodes((nds) => {
          const target = nds.find((n) => n.id === targetId);
          const node = nds.find((n) => n.id === nodeId);
          if (!target || !node) return nds;
          const targetW = (target.measured?.width ?? target.style?.width ?? 300) as number;
          const nodeW = (node.measured?.width ?? node.style?.width ?? 300) as number;
          const gap = 150;
          const newX = side === "left"
            ? target.position.x - nodeW - gap
            : target.position.x + targetW + gap;
          return nds.map((n) =>
            n.id === nodeId ? { ...n, position: { x: newX, y: target.position.y } } : n
          );
        });
      },
      pulseEdge: (label: string, dur?: number) => {
        const duration = dur || 1200;

        const startPulse = (edgeGroup: Element) => {
          edgeGroup.classList.remove("pulse-active");
          edgeGroup.querySelectorAll(".pulse-dot").forEach((el) => el.remove());
          edgeGroup.classList.add("pulse-active");

          const pulsePath = edgeGroup.querySelector(".pulse-path");
          if (pulsePath) {
            const pathD = pulsePath.getAttribute("d");
            if (pathD) {
              const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
              dot.setAttribute("r", "6");
              dot.setAttribute("fill", "#3b82f6");
              dot.setAttribute("class", "pulse-dot");
              dot.setAttribute("opacity", "0.9");
              const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
              anim.setAttribute("dur", `${duration}ms`);
              anim.setAttribute("repeatCount", "1");
              anim.setAttribute("path", pathD);
              anim.setAttribute("fill", "freeze");
              dot.appendChild(anim);
              edgeGroup.appendChild(dot);
              try { anim.beginElement(); } catch(e) {}

              const reapply = () => {
                requestAnimationFrame(() => {
                  const currentGroup = document.querySelector(`g[aria-label="${label}"]`);
                  if (currentGroup && currentGroup.querySelector(".pulse-dot")) return;
                  if (!currentGroup) return;
                  currentGroup.classList.add("pulse-active");
                  const freshPath = currentGroup.querySelector(".pulse-path");
                  if (!freshPath) return;
                  const freshD = freshPath.getAttribute("d");
                  if (!freshD) return;
                  const dot2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                  dot2.setAttribute("r", "6");
                  dot2.setAttribute("fill", "#3b82f6");
                  dot2.setAttribute("class", "pulse-dot");
                  dot2.setAttribute("opacity", "0.9");
                  const anim2 = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
                  anim2.setAttribute("dur", `${duration * 0.8}ms`);
                  anim2.setAttribute("repeatCount", "1");
                  anim2.setAttribute("path", freshD);
                  anim2.setAttribute("fill", "freeze");
                  dot2.appendChild(anim2);
                  currentGroup.appendChild(dot2);
                  try { anim2.beginElement(); } catch(e) {}
                });
              };
              setTimeout(reapply, 50);
              setTimeout(reapply, 150);
            }
          }

          const labelEl = document.querySelector(`[aria-label="${label} label"]`);
          if (labelEl) {
            (labelEl as HTMLElement).style.borderColor = "#3b82f6";
            (labelEl as HTMLElement).style.boxShadow = "0 0 8px rgba(59,130,246,0.5)";
            setTimeout(() => {
              (labelEl as HTMLElement).style.borderColor = "";
              (labelEl as HTMLElement).style.boxShadow = "";
            }, duration);
          }
        };

        const edgeGroup = document.querySelector(`g[aria-label="${label}"]`);
        if (edgeGroup) {
          startPulse(edgeGroup);
        } else {
          let attempts = 0;
          const waitForEdge = () => {
            const el = document.querySelector(`g[aria-label="${label}"]`);
            if (el) { startPulse(el); return; }
            if (++attempts < 10) requestAnimationFrame(waitForEdge);
          };
          requestAnimationFrame(waitForEdge);
        }
      },
      pulseEdgeRoundTrip: (label: string, dur?: number) => {
        const duration = dur || 1200;
        const startRoundTrip = (edgeGroup: Element) => {

        // Find the main visible edge path (not the hidden pulse-path)
        const mainPath = edgeGroup.querySelector("path:not(.pulse-path)") as SVGPathElement;
        const pulsePath = edgeGroup.querySelector(".pulse-path") as SVGPathElement;
        if (!pulsePath) return;
        const pathD = pulsePath.getAttribute("d");
        if (!pathD) return;

        // Save original marker
        const originalMarkerEnd = mainPath?.getAttribute("marker-end") || "";

        edgeGroup.classList.add("pulse-active");

        // Helper to create and animate a dot
        const animateDot = (reverse: boolean, onDone: () => void) => {
          edgeGroup.querySelectorAll(".pulse-dot").forEach((el) => el.remove());
          const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          dot.setAttribute("r", "6");
          dot.setAttribute("fill", "#3b82f6");
          dot.setAttribute("class", "pulse-dot");
          dot.setAttribute("opacity", "0.9");
          const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
          anim.setAttribute("dur", `${duration}ms`);
          anim.setAttribute("repeatCount", "1");
          anim.setAttribute("path", pathD);
          anim.setAttribute("fill", "freeze");
          if (reverse) {
            anim.setAttribute("keyPoints", "1;0");
            anim.setAttribute("keyTimes", "0;1");
          }
          dot.appendChild(anim);
          edgeGroup.appendChild(dot);
          try { anim.beginElement(); } catch(e) {}
          setTimeout(onDone, duration);
        };

        // Leg 1: forward (source→target), arrow at target end
        if (mainPath) {
          mainPath.setAttribute("marker-end", originalMarkerEnd);
          mainPath.removeAttribute("marker-start");
        }
        // Highlight label for full round trip
        const labelEl = document.querySelector(`[aria-label="${label} label"]`);
        if (labelEl) {
          (labelEl as HTMLElement).style.borderColor = "#3b82f6";
          (labelEl as HTMLElement).style.boxShadow = "0 0 8px rgba(59,130,246,0.5)";
        }

        animateDot(false, () => {
          // Leg 2: reverse (target→source), swap arrow to source end
          if (mainPath) {
            mainPath.removeAttribute("marker-end");
            // Create a marker-start using the same marker URL but for the start
            const markerUrl = originalMarkerEnd;
            mainPath.setAttribute("marker-start", markerUrl);
          }
          animateDot(true, () => {
            // Cleanup: restore original markers, remove dot
            edgeGroup.querySelectorAll(".pulse-dot").forEach((el) => el.remove());
            edgeGroup.classList.remove("pulse-active");
            if (mainPath) {
              mainPath.setAttribute("marker-end", originalMarkerEnd);
              mainPath.removeAttribute("marker-start");
            }
            if (labelEl) {
              (labelEl as HTMLElement).style.borderColor = "";
              (labelEl as HTMLElement).style.boxShadow = "";
            }
          });
        });
        }; // end startRoundTrip

        // Wait for edge to appear in DOM (it may have just been added via addEdge)
        const edgeGroup = document.querySelector(`g[aria-label="${label}"]`);
        if (edgeGroup) {
          startRoundTrip(edgeGroup);
        } else {
          let attempts = 0;
          const waitForEdge = () => {
            const el = document.querySelector(`g[aria-label="${label}"]`);
            if (el) { startRoundTrip(el); return; }
            if (++attempts < 10) requestAnimationFrame(waitForEdge);
          };
          requestAnimationFrame(waitForEdge);
        }
      },
      clearPulse: () => {
        document.querySelectorAll(".pulse-active").forEach((el) => el.classList.remove("pulse-active"));
        document.querySelectorAll(".pulse-dot").forEach((el) => el.remove());
      },
      addEdge: (id: string, source: string, target: string, sourceHandle: string, targetHandle: string, label: string, noArrow?: boolean, extraData?: Record<string, any>) => {
        setEdges((eds) => {
          if (eds.find((e) => e.id === id)) return eds;
          return [...eds, {
            id,
            source,
            target,
            sourceHandle,
            targetHandle,
            type: "xmlui",
            ...(noArrow ? {} : { markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#64748b" } }),
            data: {
              label,
              ...extraData,
              onInfoClick: (edgeId: string, edgeLabel: string) => {
                const evt = { edgeId, label: edgeLabel };
                onNativeEventRef.current?.({
                  type: "edgeInfoClick",
                  displayLabel: `${edgeLabel} (${edgeId})`,
                  ...evt,
                });
                onEdgeInfoClickRef.current?.(evt);
              },
            },
          }];
        });
      },
      removeEdge: (id: string) => {
        setEdges((eds) => eds.filter((e) => e.id !== id));
      },
      getLayout: () => {
        const layout: Record<string, any> = {};
        nodesRef.current.forEach((n: any) => {
          layout[n.id] = {
            x: Math.round(n.position.x),
            y: Math.round(n.position.y),
            width: n.measured?.width ?? n.width ?? n.style?.width ?? 300,
            height: n.measured?.height ?? n.height ?? n.style?.height ?? 200,
          };
        });
        return { nodes: layout };
      },
    };
    registerComponentApi?.(api);
    // Expose API on window so XMLUI child nodes can access it
    (window as any).__reactFlowCanvasApi = api;
  }, [registerComponentApi, setNodes, setEdges]);

  // Sync from props when initialNodes identity changes
  const prevNodesRef = useRef(initialNodes);
  useEffect(() => {
    if (prevNodesRef.current !== initialNodes) {
      prevNodesRef.current = initialNodes;
      setNodes(makeNodes());
    }
  }, [initialNodes, makeNodes, setNodes]);

  const prevEdgesRef = useRef(initialEdges);
  useEffect(() => {
    if (prevEdgesRef.current !== initialEdges) {
      prevEdgesRef.current = initialEdges;
      setEdges(makeEdges());
    }
  }, [initialEdges, makeEdges, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge({ ...connection, type: "xmlui", data: {
          label: "relates to",
          onInfoClick: (edgeId: string, label: string) => {
            const evt = { edgeId, label };
            onNativeEventRef.current?.({
              type: "edgeInfoClick",
              displayLabel: `${label} (${edgeId})`,
              ...evt,
            });
            onEdgeInfoClickRef.current?.(evt);
          },
        } }, eds);
        if (storageKeyRef.current) {
          saveState(storageKeyRef.current, nodes, newEdges);
        }
        return newEdges;
      });
      onNativeEventRef.current?.({
        type: "connect",
        displayLabel: `${connection.source}:${connection.sourceHandle} → ${connection.target}:${connection.targetHandle}`,
        connection,
      });
    },
    [setEdges, nodes],
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node, allNodes: Node[]) => {
      onNativeEventRef.current?.({
        type: "nodeDragStop",
        displayLabel: `${node.id} → (${Math.round(node.position.x)}, ${Math.round(node.position.y)})`,
        node: { id: node.id, position: node.position, data: node.data },
      });
      if (storageKeyRef.current) {
        saveState(storageKeyRef.current, allNodes, edges);
      }
    },
    [edges],
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      onNativeEventRef.current?.({
        type: "nodesDelete",
        displayLabel: `delete ${deleted.map((n) => n.id).join(", ")}`,
        nodes: deleted.map((n) => ({ id: n.id, data: n.data })),
      });
    },
    [],
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      onNativeEventRef.current?.({
        type: "edgesDelete",
        displayLabel: `delete ${deleted.map((e) => e.id).join(", ")}`,
        edges: deleted.map((e) => ({ id: e.id, source: e.source, target: e.target })),
      });
    },
    [],
  );

  const selectionTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: { nodes: Node[]; edges: Edge[] }) => {
      clearTimeout(selectionTimerRef.current);
      selectionTimerRef.current = setTimeout(() => {
        onNativeEventRef.current?.({
          type: "selectionChange",
          displayLabel: `${selectedNodes.length} nodes, ${selectedEdges.length} edges`,
          selectedNodes: selectedNodes.map((n) => n.id),
          selectedEdges: selectedEdges.map((e) => e.id),
        });
      }, 50);
    },
    [],
  );

  // Persist to localStorage on any change (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!storageKeyRef.current) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveState(storageKeyRef.current!, nodes, edges);
    }, 300);
  }, [nodes, edges]);

  const nodeTypes: NodeTypes = useMemo(() => ({ xmlui: XmluiNode }), []);
  const edgeTypes: EdgeTypes = useMemo(() => ({ xmlui: XmluiEdge }), []);

  return (
      <div style={{ position: "absolute", inset: 0, fontSize: `${canvasFontSize}px` }} className={className}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            snapToGrid={snapToGrid}
            snapGrid={parsedSnapGrid}
            fitView={fitView}
            fitViewOptions={{ padding: fitViewPadding }}
            panOnDrag={panOnDrag}
            zoomOnScroll={zoomOnScroll}
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
          >
            {/* Pulse animation styles and SVG filter */}
            <style>{`
              .pulse-active > path:first-of-type {
                stroke: #3b82f6 !important;
                stroke-width: 4px !important;
              }
            `}</style>
            <svg style={{ position: "absolute", width: 0, height: 0 }}>
              <defs>
                <filter id="pulse-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>
            {showBackground && <Background gap={16} size={1} />}
            {showControls && <Controls />}
            {showMinimap && <MiniMap />}
          </ReactFlow>
      </div>
  );
}
