# PointerLayer [#pointerlayer]

`PointerLayer` sits over its children and lets the user draw live, fading ink on top of them while holding a modifier key: freehand strokes, or shapes such as lines, arrows, rectangles and ellipses. It reports pointer movement and each finished stroke or shape as events, in coordinates normalized to the layer (or to the picture inside it), so an app can record where the user pointed and what they drew.

**Key features:**
- **Ink over any content**: wrap children in `PointerLayer` and draw on top of them. Strokes appear under the pointer as you draw, then fade.
- **Intentional drawing**: by default a stroke needs the Command key (`drawModifier="meta"`) held while dragging, so ordinary mousing and clicks reach the children untouched.
- **Events you can record**: `strokeEnd` delivers every point of a stroke with its timing, and `pointerMove` reports the pointer position, all in coordinates from 0 to 1.
- **Coordinates that follow the picture**: set `contentAspect` to a video's aspect ratio and the coordinates are measured against the picture, not the letterbox bars around it.

Hold the Command key (on macOS; the Windows key elsewhere) and drag over the card to draw.

```xmlui-pg copy display name="Example: draw over content" height="420px"
<App var.strokes="{0}">
  <PointerLayer onStrokeEnd="strokes++">
    <Card title="Point at something">
      <Text>Hold Command and drag to circle any part of this card.</Text>
      <Text>The ink fades after a moment; the strokes counter below doesn't.</Text>
    </Card>
  </PointerLayer>
  <Text value="Strokes drawn: {strokes}" />
</App>
```

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `color` [#color]

> [!DEF]  default: **"#ff3b30"**

The color of the ink and the pointer indicator.

### `contentAspect` [#contentaspect]

The aspect ratio (width / height) of the picture inside the layer, such as a video's `videoWidth / videoHeight`. When set, coordinates are normalized to that picture as it is fitted into the layer (letterbox bars fall outside 0-1). When not set, coordinates are normalized to the layer itself.

Over a video, the picture often doesn't fill the element: black bars pad it to the element's shape. Set `contentAspect` to the video's `videoWidth / videoHeight`, which `MediaPlayer`'s `loadedMetadata` event supplies, and coordinates are measured against the picture itself. A point on the picture's left edge is `x = 0`, even with bars beside it.

```xmlui-pg copy display name="Example: ink over a video" height="660px"
<App var.aspect="{undefined}" var.last="">
  <PointerLayer
    contentAspect="{aspect}"
    onStrokeEnd="(e) => last = e.points.length + ' points, from ('
      + e.points[0].x.toFixed(2) + ', ' + e.points[0].y.toFixed(2) + ')'">
    <MediaPlayer
      src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      onLoadedMetadata="(e) => aspect = e.videoWidth / e.videoHeight" />
  </PointerLayer>
  <Text value="Picture aspect: {aspect ? aspect.toFixed(3) : '(loading)'}" />
  <Text value="Last stroke: {last}" />
</App>
```

### `drawModifier` [#drawmodifier]

> [!DEF]  default: **"meta"**

The key that must be held to draw. While it is held, a drag draws a stroke instead of reaching the children; otherwise the children behave normally. `meta` is the Command key on macOS. `none` draws on every drag.

Available values:

| Value | Description |
| --- | --- |
| `meta` | Command on macOS, the Windows key on Windows **(default)** |
| `alt` | Option on macOS, Alt elsewhere |
| `ctrl` | Control |
| `shift` | Shift |
| `none` | No key needed: every drag draws |

With `drawModifier="none"`, every drag draws. That suits a dedicated drawing surface, but the children can no longer receive clicks or drags.

```xmlui-pg copy display name="Example: drawModifier none" height="360px"
<App>
  <PointerLayer drawModifier="none" color="#0a84ff" strokeWidth="6" fadeMs="0" id="pad">
    <Card height="220px">
      <Text>Drag anywhere here to draw. Strokes stay until you clear them.</Text>
    </Card>
  </PointerLayer>
  <Button label="Clear" onClick="pad.clear()" />
</App>
```

### `enabled` [#enabled]

> [!DEF]  default: **true**

Turns the layer on. When `false`, it reports nothing, draws nothing, and every click and drag reaches the children.

### `fadeMs` [#fadems]

> [!DEF]  default: **1500**

How long a finished stroke takes to fade out, in milliseconds. A stroke stays fully visible while it is being drawn. `0` keeps strokes until `clear()` is called.

### `sampleMs` [#samplems]

> [!DEF]  default: **50**

The minimum interval between `pointerMove` events, in milliseconds. Strokes record every point regardless.

### `showPointer` [#showpointer]

> [!DEF]  default: **"held"**

When to show a dot at the pointer position.

Available values:

| Value | Description |
| --- | --- |
| `held` | While a stroke is being drawn **(default)** |
| `always` | Whenever the pointer is over the layer |
| `none` | Never |

### `strokeWidth` [#strokewidth]

> [!DEF]  default: **4**

The width of drawn strokes, in CSS pixels.

### `tool` [#tool]

> [!DEF]  default: **"freehand"**

What a drag draws. `freehand` follows the pointer. The shape tools draw from where the drag starts to where it ends: `line`, `arrow` (the head at the end), and `rect` and `ellipse` (fitted to the drag's bounding box). `pointer` drops a ring where you press, with no drag. Hold Shift to constrain a shape (square, circle, or a line at a multiple of 45 degrees). Hold Alt to draw a `rect` or `ellipse` from its center, unless Alt is the `drawModifier`.

Available values:

| Value | Description |
| --- | --- |
| `freehand` | Freehand ink that follows the pointer **(default)** |
| `line` | A straight line |
| `arrow` | A straight line with an arrowhead at the end |
| `rect` | A rectangle |
| `ellipse` | An ellipse |
| `pointer` | A ring at the pressed point |

Freehand ink is hard to keep tidy with a mouse. The shape tools draw clean geometry instead: press where the shape starts, drag, and release. Hold Shift to make a square, a circle, or a line at a multiple of 45°. Hold Alt to draw a rectangle or ellipse outward from its center.

```xmlui-pg copy display name="Example: drawing tools" height="480px"
<App var.tool="arrow" var.last="">
  <HStack>
    <Button label="freehand" variant="{tool === 'freehand' ? 'solid' : 'outlined'}" onClick="tool = 'freehand'" />
    <Button label="line" variant="{tool === 'line' ? 'solid' : 'outlined'}" onClick="tool = 'line'" />
    <Button label="arrow" variant="{tool === 'arrow' ? 'solid' : 'outlined'}" onClick="tool = 'arrow'" />
    <Button label="rect" variant="{tool === 'rect' ? 'solid' : 'outlined'}" onClick="tool = 'rect'" />
    <Button label="ellipse" variant="{tool === 'ellipse' ? 'solid' : 'outlined'}" onClick="tool = 'ellipse'" />
    <Button label="pointer" variant="{tool === 'pointer' ? 'solid' : 'outlined'}" onClick="tool = 'pointer'" />
  </HStack>
  <PointerLayer
    tool="{tool}"
    onShapeEnd="(e) => last = e.tool + ' from (' + e.x1.toFixed(2) + ', ' + e.y1.toFixed(2)
      + ') to (' + e.x2.toFixed(2) + ', ' + e.y2.toFixed(2) + ')'">
    <Card height="240px">
      <Text>Hold Command, then drag to draw with the selected tool.</Text>
    </Card>
  </PointerLayer>
  <Text value="Last shape: {last}" />
</App>
```

## Events [#events]

### `pointerMove` [#pointermove]

Fires as the pointer moves over the layer, at most once per `sampleMs`. The handler receives `{ x, y, buttons, time }`: normalized coordinates, the pressed mouse buttons, and the wall-clock time (`Date.now()`).

**Signature**: `pointerMove(event: { x: number; y: number; buttons: number; time: number }): void`

- `event`: The normalized position, pressed buttons and wall-clock time.

`pointerMove` fires while the pointer moves over the layer, whether or not you're drawing, at most once every `sampleMs` milliseconds.

```xmlui-pg copy display name="Example: follow the pointer" height="360px"
<App var.pos="">
  <PointerLayer onPointerMove="(e) => pos = e.x.toFixed(2) + ', ' + e.y.toFixed(2)">
    <Card height="200px">
      <Text>Move the pointer over this card.</Text>
    </Card>
  </PointerLayer>
  <Text value="Position: {pos}" />
</App>
```

### `shapeEnd` [#shapeend]

Fires when a shape tool finishes (every tool except `freehand`). The handler receives `{ tool, x1, y1, x2, y2, time, duration, color, width }`. For `line` and `arrow`, (x1, y1) is the start and (x2, y2) the end. For `rect` and `ellipse`, they are the top-left and bottom-right corners. For `pointer`, both are the pressed point. `time` is the wall-clock time the drag began, and `duration` how long it lasted, in milliseconds.

**Signature**: `shapeEnd(event: { tool: string; x1: number; y1: number; x2: number; y2: number; time: number; duration: number; color: string; width: number }): void`

- `event`: The shape's tool, corners, timing, color and width.

Shapes report their geometry, not sampled points, so a recording can redraw them crisply. `duration` is how long the drag lasted, which is enough to animate a shape growing in on replay.

### `strokeEnd` [#strokeend]

Fires when a freehand stroke ends. The handler receives `{ points, time, color, width }`: `points` is every point as `{ x, y, t }` with `t` in milliseconds from the stroke's start, and `time` is the wall-clock time the stroke began.

**Signature**: `strokeEnd(event: { points: Array<{ x: number; y: number; t: number }>; time: number; color: string; width: number }): void`

- `event`: The stroke's points, start time, color and width.

Each point's `t` is milliseconds since the stroke began, and `time` is the wall-clock time (`Date.now()`) it began. Recording `time` lets you line strokes up with other events you log, such as a `MediaPlayer`'s.

```xmlui-pg copy display name="Example: log strokes" height="520px"
<App var.log="{[]}">
  <PointerLayer
    onStrokeEnd="(e) => log = [...log, e.points.length + ' points over '
      + e.points[e.points.length - 1].t + ' ms']">
    <Card height="200px">
      <Text>Hold Command and draw a few strokes here.</Text>
    </Card>
  </PointerLayer>
  <Items data="{log}">
    <Text value="{$item}" />
  </Items>
</App>
```

### `strokeStart` [#strokestart]

Fires when a freehand stroke begins. The handler receives `{ x, y, time, color, width }`.

**Signature**: `strokeStart(event: { x: number; y: number; time: number; color: string; width: number }): void`

- `event`: The starting point, wall-clock time, and the stroke's color and width.

## Exposed Methods [#exposed-methods]

### `clear` [#clear]

Removes every stroke still visible on the layer.

**Signature**: `clear(): void`

## Styling [#styling]

This component does not have any styles.
