import type React from "react";
import {
  type CSSProperties,
  type ReactNode,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import classnames from "classnames";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { getStroke } from "perfect-freehand";

import styles from "./PointerLayer.module.scss";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

type DrawModifier = "meta" | "alt" | "ctrl" | "shift" | "none";
type ShowPointer = "held" | "always" | "none";
type Tool = "freehand" | "line" | "arrow" | "rect" | "ellipse" | "pointer";
type ShapeTool = Exclude<Tool, "freehand">;
type StrokePoint = { x: number; y: number; t: number };

type ShapeEvent = {
  tool: ShapeTool;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  time: number;
  duration: number;
  color: string;
  width: number;
};

type Props = {
  enabled?: boolean;
  drawModifier?: DrawModifier;
  tool?: Tool;
  color?: string;
  strokeWidth?: number;
  fadeMs?: number;
  sampleMs?: number;
  showPointer?: ShowPointer;
  contentAspect?: number;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
  registerComponentApi?: RegisterComponentApiFn;
  onPointerMove?: (event: { x: number; y: number; buttons: number; time: number }) => void;
  onStrokeStart?: (event: {
    x: number;
    y: number;
    time: number;
    color: string;
    width: number;
  }) => void;
  onStrokeEnd?: (event: {
    points: StrokePoint[];
    time: number;
    color: string;
    width: number;
  }) => void;
  onShapeEnd?: (event: ShapeEvent) => void;
  // Passed by wrapComponent only when verbose tracing is on (captureNativeEvents)
  onNativeEvent?: (event: Record<string, unknown>) => void;
};

// What is on screen. Positions are normalized to the layer box (0-1), so ink
// survives resizes; events report positions normalized to the content picture.
type Rendered =
  | {
      id: number;
      kind: "freehand";
      points: Array<[number, number, number]>;
      pen: boolean;
      color: string;
      width: number;
      ended: boolean;
    }
  | {
      id: number;
      kind: ShapeTool;
      a: [number, number];
      b: [number, number];
      color: string;
      width: number;
      ended: boolean;
    };

type Current =
  | {
      kind: "freehand";
      id: number;
      pointerId: number;
      startPerf: number;
      startTime: number;
      points: StrokePoint[];
      boxPoints: Array<[number, number, number]>;
    }
  | {
      kind: ShapeTool;
      id: number;
      pointerId: number;
      startPerf: number;
      startTime: number;
      anchor: [number, number]; // layer pixels
      a: [number, number]; // layer pixels, after constraints
      b: [number, number];
    };

const MODIFIER_FLAG: Record<
  Exclude<DrawModifier, "none">,
  "metaKey" | "altKey" | "ctrlKey" | "shiftKey"
> = {
  meta: "metaKey",
  alt: "altKey",
  ctrl: "ctrlKey",
  shift: "shiftKey",
};

const POINTER_RING_RADIUS = 14;

// perfect-freehand outline polygon -> SVG path data (quadratic smoothing,
// as in the library's README)
function outlineToPath(outline: number[][]): string {
  if (outline.length < 2) return "";
  const parts = outline.reduce(
    (acc: (string | number)[], [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...outline[0], "Q"],
  );
  parts.push("Z");
  return parts.join(" ");
}

function freehandPath(
  item: Extract<Rendered, { kind: "freehand" }>,
  width: number,
  height: number,
): string {
  const pts = item.points.map(([x, y, p]) => [x * width, y * height, p]);
  return outlineToPath(
    getStroke(pts, {
      size: item.width,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
      simulatePressure: !item.pen,
      last: item.ended,
    }),
  );
}

function round(value: number): number {
  return Math.round(value * 10000) / 10000;
}

// The rect of a picture with the given aspect ratio, fitted into the box the
// way object-fit: contain does. Without an aspect ratio, the box itself.
function contentRect(boxWidth: number, boxHeight: number, aspect?: number) {
  if (!aspect || !Number.isFinite(aspect) || aspect <= 0 || boxWidth <= 0 || boxHeight <= 0) {
    return { x: 0, y: 0, width: boxWidth, height: boxHeight };
  }
  if (boxWidth / boxHeight > aspect) {
    const width = boxHeight * aspect;
    return { x: (boxWidth - width) / 2, y: 0, width, height: boxHeight };
  }
  const height = boxWidth / aspect;
  return { x: 0, y: (boxHeight - height) / 2, width: boxWidth, height };
}

// Shape corners from the anchor and the pointer, in layer pixels.
// Shift constrains (square / circle / 45-degree lines); center draws a
// rect or ellipse outward from the anchor.
function shapeCorners(
  tool: ShapeTool,
  anchor: [number, number],
  pointer: [number, number],
  constrain: boolean,
  center: boolean,
): { a: [number, number]; b: [number, number] } {
  if (tool === "pointer") return { a: anchor, b: anchor };
  let dx = pointer[0] - anchor[0];
  let dy = pointer[1] - anchor[1];
  if (tool === "line" || tool === "arrow") {
    if (constrain && (dx !== 0 || dy !== 0)) {
      const length = Math.hypot(dx, dy);
      const step = Math.PI / 4;
      const angle = Math.round(Math.atan2(dy, dx) / step) * step;
      dx = Math.cos(angle) * length;
      dy = Math.sin(angle) * length;
    }
    return { a: anchor, b: [anchor[0] + dx, anchor[1] + dy] };
  }
  if (constrain) {
    const side = Math.max(Math.abs(dx), Math.abs(dy));
    dx = (dx < 0 ? -1 : 1) * side;
    dy = (dy < 0 ? -1 : 1) * side;
  }
  const a: [number, number] = center ? [anchor[0] - dx, anchor[1] - dy] : anchor;
  const b: [number, number] = [anchor[0] + dx, anchor[1] + dy];
  // rect / ellipse: report the bounding box top-left -> bottom-right
  return {
    a: [Math.min(a[0], b[0]), Math.min(a[1], b[1])],
    b: [Math.max(a[0], b[0]), Math.max(a[1], b[1])],
  };
}

function ShapeSvg({
  item,
  width,
  height,
}: {
  item: Extract<Rendered, { kind: ShapeTool }>;
  width: number;
  height: number;
}) {
  const x1 = item.a[0] * width;
  const y1 = item.a[1] * height;
  const x2 = item.b[0] * width;
  const y2 = item.b[1] * height;
  const stroke = {
    stroke: item.color,
    strokeWidth: item.width,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  switch (item.kind) {
    case "line":
      return <line x1={x1} y1={y1} x2={x2} y2={y2} {...stroke} />;
    case "arrow": {
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const head = Math.max(12, item.width * 4);
      const spread = (28 * Math.PI) / 180;
      const p1 = [x2 - head * Math.cos(angle - spread), y2 - head * Math.sin(angle - spread)];
      const p2 = [x2 - head * Math.cos(angle + spread), y2 - head * Math.sin(angle + spread)];
      return (
        <>
          <line x1={x1} y1={y1} x2={x2} y2={y2} {...stroke} />
          <polygon points={`${x2},${y2} ${p1.join(",")} ${p2.join(",")}`} fill={item.color} />
        </>
      );
    }
    case "rect":
      return <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} {...stroke} />;
    case "ellipse":
      return (
        <ellipse
          cx={(x1 + x2) / 2}
          cy={(y1 + y2) / 2}
          rx={(x2 - x1) / 2}
          ry={(y2 - y1) / 2}
          {...stroke}
        />
      );
    case "pointer":
      return <circle cx={x1} cy={y1} r={POINTER_RING_RADIUS} {...stroke} />;
  }
}

export const PointerLayer = memo(
  forwardRef(function PointerLayer(
    {
      enabled = true,
      drawModifier = "meta",
      tool = "freehand",
      color = "#ff3b30",
      strokeWidth = 4,
      fadeMs = 1500,
      sampleMs = 50,
      showPointer = "held",
      contentAspect,
      children,
      style,
      className,
      classes,
      registerComponentApi,
      onPointerMove,
      onStrokeStart,
      onStrokeEnd,
      onShapeEnd,
      onNativeEvent,
      ...rest
    }: Props,
    ref: React.ForwardedRef<HTMLDivElement>,
  ) {
    const layerRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, layerRef);

    const [armed, setArmed] = useState(drawModifier === "none");
    const [items, setItems] = useState<Rendered[]>([]);
    const [dot, setDot] = useState<{ x: number; y: number } | null>(null);
    const [drawing, setDrawing] = useState(false);
    const [size, setSize] = useState({ width: 0, height: 0 });

    const nextId = useRef(1);
    const lastMoveSent = useRef(-Infinity);
    const current = useRef<Current | null>(null);

    // Ink is drawn in layer pixels
    useEffect(() => {
      const el = layerRef.current;
      if (!el) return;
      const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight });
      measure();
      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    const isHeld = useCallback(
      (e: { metaKey: boolean; altKey: boolean; ctrlKey: boolean; shiftKey: boolean }) =>
        drawModifier === "none" ? true : e[MODIFIER_FLAG[drawModifier]],
      [drawModifier],
    );

    // Track the modifier from the keyboard; pointer events re-sync it, and
    // losing window focus disarms, so a key released elsewhere can't stick.
    useEffect(() => {
      if (!enabled) {
        setArmed(false);
        return;
      }
      if (drawModifier === "none") {
        setArmed(true);
        return;
      }
      const onKey = (e: KeyboardEvent) => setArmed(isHeld(e));
      const onBlur = () => setArmed(false);
      window.addEventListener("keydown", onKey);
      window.addEventListener("keyup", onKey);
      window.addEventListener("blur", onBlur);
      return () => {
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("keyup", onKey);
        window.removeEventListener("blur", onBlur);
      };
    }, [enabled, drawModifier, isHeld]);

    useEffect(() => {
      registerComponentApi?.({
        clear: () => setItems([]),
      });
    }, [registerComponentApi]);

    // Layer-pixel position -> box-normalized and picture-normalized
    const normalize = useCallback(
      (localX: number, localY: number) => {
        const el = layerRef.current;
        const width = el?.clientWidth ?? 0;
        const height = el?.clientHeight ?? 0;
        if (width <= 0 || height <= 0) return null;
        const pic = contentRect(width, height, contentAspect);
        return {
          boxX: localX / width,
          boxY: localY / height,
          x: round((localX - pic.x) / pic.width),
          y: round((localY - pic.y) / pic.height),
        };
      },
      [contentAspect],
    );

    const local = (clientX: number, clientY: number): [number, number] | null => {
      const box = layerRef.current?.getBoundingClientRect();
      return box ? [clientX - box.left, clientY - box.top] : null;
    };

    const trace = (name: string, payload: Record<string, unknown>) =>
      onNativeEvent?.({ type: `pointer.${name}`, traceData: payload });

    // Observing: capture phase on the wrapper, so moves over the children are
    // reported without being intercepted.
    const handleMoveCapture = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled) return;
      if (drawModifier !== "none") setArmed(isHeld(e));
      const at = local(e.clientX, e.clientY);
      const n = at && normalize(at[0], at[1]);
      if (!n) return;
      if (showPointer === "always" || (showPointer === "held" && current.current)) {
        setDot({ x: n.boxX, y: n.boxY });
      }
      const now = performance.now();
      if (onPointerMove && now - lastMoveSent.current >= sampleMs) {
        lastMoveSent.current = now;
        onPointerMove({ x: n.x, y: n.y, buttons: e.buttons, time: Date.now() });
      }
    };

    const handleLeave = () => {
      if (!current.current) setDot(null);
    };

    const handleDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled || e.button !== 0 || current.current) return;
      const at = local(e.clientX, e.clientY);
      const n = at && normalize(at[0], at[1]);
      if (!at || !n) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      const id = nextId.current++;
      const startTime = Date.now();
      const startPerf = performance.now();
      setDrawing(true);
      if (showPointer !== "none") setDot({ x: n.boxX, y: n.boxY });

      if (tool === "freehand") {
        const pen = e.pointerType === "pen";
        const first: [number, number, number] = [n.boxX, n.boxY, pen ? e.pressure : 0.5];
        current.current = {
          kind: "freehand",
          id,
          pointerId: e.pointerId,
          startPerf,
          startTime,
          points: [{ x: n.x, y: n.y, t: 0 }],
          boxPoints: [first],
        };
        setItems((all) => [
          ...all,
          { id, kind: "freehand", points: [first], pen, color, width: strokeWidth, ended: false },
        ]);
        const payload = { x: n.x, y: n.y, time: startTime, color, width: strokeWidth };
        trace("strokeStart", payload);
        onStrokeStart?.(payload);
        return;
      }

      current.current = {
        kind: tool,
        id,
        pointerId: e.pointerId,
        startPerf,
        startTime,
        anchor: at,
        a: at,
        b: at,
      };
      setItems((all) => [
        ...all,
        {
          id,
          kind: tool,
          a: [n.boxX, n.boxY],
          b: [n.boxX, n.boxY],
          color,
          width: strokeWidth,
          ended: false,
        },
      ]);
    };

    const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
      const cur = current.current;
      if (!cur || e.pointerId !== cur.pointerId) return;
      const at = local(e.clientX, e.clientY);
      const n = at && normalize(at[0], at[1]);
      if (!at || !n) return;

      if (cur.kind === "freehand") {
        cur.points.push({ x: n.x, y: n.y, t: Math.round(performance.now() - cur.startPerf) });
        cur.boxPoints.push([n.boxX, n.boxY, e.pointerType === "pen" ? e.pressure : 0.5]);
        const points = [...cur.boxPoints];
        setItems((all) =>
          all.map((s) => (s.id === cur.id && s.kind === "freehand" ? { ...s, points } : s)),
        );
        return;
      }

      // Alt draws from the center, unless Alt is the key that arms drawing
      const center = e.altKey && drawModifier !== "alt";
      const { a, b } = shapeCorners(cur.kind, cur.anchor, at, e.shiftKey, center);
      cur.a = a;
      cur.b = b;
      const na = normalize(a[0], a[1]);
      const nb = normalize(b[0], b[1]);
      if (!na || !nb) return;
      setItems((all) =>
        all.map((s) =>
          s.id === cur.id && s.kind !== "freehand"
            ? { ...s, a: [na.boxX, na.boxY], b: [nb.boxX, nb.boxY] }
            : s,
        ),
      );
    };

    const handleEnd = (e: React.PointerEvent<HTMLDivElement>) => {
      const cur = current.current;
      if (!cur || e.pointerId !== cur.pointerId) return;
      current.current = null;
      setDrawing(false);
      if (showPointer === "held") setDot(null);
      setItems((all) => all.map((s) => (s.id === cur.id ? { ...s, ended: true } : s)));

      if (cur.kind === "freehand") {
        const payload = { points: cur.points, time: cur.startTime, color, width: strokeWidth };
        trace("strokeEnd", { ...payload, pointCount: cur.points.length });
        onStrokeEnd?.(payload);
        return;
      }

      const na = normalize(cur.a[0], cur.a[1]);
      const nb = normalize(cur.b[0], cur.b[1]);
      if (!na || !nb) return;
      const payload: ShapeEvent = {
        tool: cur.kind,
        x1: na.x,
        y1: na.y,
        x2: nb.x,
        y2: nb.y,
        time: cur.startTime,
        duration: Math.round(performance.now() - cur.startPerf),
        color,
        width: strokeWidth,
      };
      trace("shapeEnd", payload);
      onShapeEnd?.(payload);
    };

    // Finished ink fades, then is removed
    const removeItem = (id: number) => setItems((all) => all.filter((s) => s.id !== id));

    // The overlay takes input only while armed, or while a stroke or shape
    // begun armed is still in progress (releasing the key doesn't end it)
    const overlayActive = enabled && (armed || drawing);

    return (
      <div
        {...rest}
        ref={composedRef}
        className={classnames(classes?.[COMPONENT_PART_KEY], className, styles.pointerLayer)}
        style={style}
        onPointerMoveCapture={handleMoveCapture}
        onPointerLeave={handleLeave}
      >
        {children}
        <svg className={styles.ink} aria-hidden="true">
          {items.map((s) => (
            <g
              key={s.id}
              data-ink-id={s.id}
              data-ink-kind={s.kind}
              className={s.ended && fadeMs > 0 ? styles.fading : undefined}
              style={s.ended && fadeMs > 0 ? { animationDuration: `${fadeMs}ms` } : undefined}
              onAnimationEnd={() => removeItem(s.id)}
            >
              {s.kind === "freehand" ? (
                <path d={freehandPath(s, size.width, size.height)} fill={s.color} />
              ) : (
                <ShapeSvg item={s} width={size.width} height={size.height} />
              )}
            </g>
          ))}
        </svg>
        {dot && showPointer !== "none" && (
          <div
            className={styles.dot}
            style={{ left: `${dot.x * 100}%`, top: `${dot.y * 100}%`, backgroundColor: color }}
            aria-hidden="true"
          />
        )}
        <div
          className={classnames(styles.overlay, { [styles.active]: overlayActive })}
          data-part-id="overlay"
          onPointerDown={overlayActive ? handleDown : undefined}
          onPointerMove={handleMove}
          onPointerUp={handleEnd}
          onPointerCancel={handleEnd}
          onLostPointerCapture={handleEnd}
        />
      </div>
    );
  }),
);
