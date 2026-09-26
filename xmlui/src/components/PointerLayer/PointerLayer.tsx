import styles from "./PointerLayer.module.scss";

import { parseScssVar } from "../../components-core/theming/themeVars";
import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { PointerLayer } from "./PointerLayerReact";

const COMP = "PointerLayer";

export const PointerLayerMd = createMetadata({
  status: "experimental",
  description:
    "`PointerLayer` sits over its children and lets the user draw live, fading ink on top of " +
    "them while holding a modifier key: freehand strokes, or shapes such as lines, arrows, " +
    "rectangles and ellipses. It reports pointer movement and each finished stroke or shape " +
    "as events, in coordinates normalized to the layer (or to the picture inside it), so an " +
    "app can record where the user pointed and what they drew.",
  props: {
    enabled: {
      description:
        "Turns the layer on. When `false`, it reports nothing, draws nothing, and every click " +
        "and drag reaches the children.",
      valueType: "boolean",
      defaultValue: true,
    },
    drawModifier: {
      description:
        "The key that must be held to draw. While it is held, a drag draws a stroke instead of " +
        "reaching the children; otherwise the children behave normally. `meta` is the Command " +
        "key on macOS. `none` draws on every drag.",
      valueType: "string",
      availableValues: [
        { value: "meta", description: "Command on macOS, the Windows key on Windows" },
        { value: "alt", description: "Option on macOS, Alt elsewhere" },
        { value: "ctrl", description: "Control" },
        { value: "shift", description: "Shift" },
        { value: "none", description: "No key needed: every drag draws" },
      ],
      isStrictEnum: true,
      defaultValue: "meta",
    },
    tool: {
      description:
        "What a drag draws. `freehand` follows the pointer. The shape tools draw from where " +
        "the drag starts to where it ends: `line`, `arrow` (the head at the end), and `rect` " +
        "and `ellipse` (fitted to the drag's bounding box). `pointer` drops a ring where you " +
        "press, with no drag. Hold Shift to constrain a shape (square, circle, or a line at a " +
        "multiple of 45 degrees). Hold Alt to draw a `rect` or `ellipse` from its center, " +
        "unless Alt is the `drawModifier`.",
      valueType: "string",
      availableValues: [
        { value: "freehand", description: "Freehand ink that follows the pointer" },
        { value: "line", description: "A straight line" },
        { value: "arrow", description: "A straight line with an arrowhead at the end" },
        { value: "rect", description: "A rectangle" },
        { value: "ellipse", description: "An ellipse" },
        { value: "pointer", description: "A ring at the pressed point" },
      ],
      isStrictEnum: true,
      defaultValue: "freehand",
    },
    color: {
      description: "The color of the ink and the pointer indicator.",
      valueType: "string",
      defaultValue: "#ff3b30",
    },
    strokeWidth: {
      description: "The width of drawn strokes, in CSS pixels.",
      valueType: "number",
      defaultValue: 4,
    },
    fadeMs: {
      description:
        "How long a finished stroke takes to fade out, in milliseconds. A stroke stays fully " +
        "visible while it is being drawn. `0` keeps strokes until `clear()` is called.",
      valueType: "number",
      defaultValue: 1500,
    },
    sampleMs: {
      description:
        "The minimum interval between `pointerMove` events, in milliseconds. Strokes record " +
        "every point regardless.",
      valueType: "number",
      defaultValue: 50,
    },
    showPointer: {
      description: "When to show a dot at the pointer position.",
      valueType: "string",
      availableValues: [
        { value: "held", description: "While a stroke is being drawn" },
        { value: "always", description: "Whenever the pointer is over the layer" },
        { value: "none", description: "Never" },
      ],
      isStrictEnum: true,
      defaultValue: "held",
    },
    contentAspect: {
      description:
        "The aspect ratio (width / height) of the picture inside the layer, such as a video's " +
        "`videoWidth / videoHeight`. When set, coordinates are normalized to that picture as " +
        "it is fitted into the layer (letterbox bars fall outside 0-1). When not set, " +
        "coordinates are normalized to the layer itself.",
      valueType: "number",
    },
  },
  events: {
    pointerMove: {
      description:
        "Fires as the pointer moves over the layer, at most once per `sampleMs`. The handler " +
        "receives `{ x, y, buttons, time }`: normalized coordinates, the pressed mouse buttons, " +
        "and the wall-clock time (`Date.now()`).",
      signature: "pointerMove(event: { x: number; y: number; buttons: number; time: number }): void",
      parameters: { event: "The normalized position, pressed buttons and wall-clock time." },
    },
    strokeStart: {
      description:
        "Fires when a freehand stroke begins. The handler receives " +
        "`{ x, y, time, color, width }`.",
      signature:
        "strokeStart(event: { x: number; y: number; time: number; color: string; width: number }): void",
      parameters: { event: "The starting point, wall-clock time, and the stroke's color and width." },
    },
    strokeEnd: {
      description:
        "Fires when a freehand stroke ends. The handler receives `{ points, time, color, width }`: " +
        "`points` is every point as `{ x, y, t }` with `t` in milliseconds from the stroke's " +
        "start, and `time` is the wall-clock time the stroke began.",
      signature:
        "strokeEnd(event: { points: Array<{ x: number; y: number; t: number }>; time: number; color: string; width: number }): void",
      parameters: { event: "The stroke's points, start time, color and width." },
    },
    shapeEnd: {
      description:
        "Fires when a shape tool finishes (every tool except `freehand`). The handler receives " +
        "`{ tool, x1, y1, x2, y2, time, duration, color, width }`. For `line` and `arrow`, " +
        "(x1, y1) is the start and (x2, y2) the end. For `rect` and `ellipse`, they are the " +
        "top-left and bottom-right corners. For `pointer`, both are the pressed point. `time` " +
        "is the wall-clock time the drag began, and `duration` how long it lasted, in " +
        "milliseconds.",
      signature:
        "shapeEnd(event: { tool: string; x1: number; y1: number; x2: number; y2: number; time: number; duration: number; color: string; width: number }): void",
      parameters: { event: "The shape's tool, corners, timing, color and width." },
    },
  },
  apis: {
    clear: {
      description: "Removes every stroke still visible on the layer.",
      signature: "clear(): void",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const pointerLayerComponentRenderer = wrapComponent(COMP, PointerLayer, PointerLayerMd, {
  strings: ["drawModifier", "tool", "color", "showPointer"],
  exposeRegisterApi: true,
  captureNativeEvents: true,
  childrenLayoutContext: { type: "Stack", orientation: "vertical" },
});
