%-DESC-START

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

%-DESC-END

%-PROP-START tool

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

%-PROP-END

%-PROP-START drawModifier

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

%-PROP-END

%-PROP-START contentAspect

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

%-PROP-END

%-EVENT-START strokeEnd

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

%-EVENT-END

%-EVENT-START shapeEnd

Shapes report their geometry, not sampled points, so a recording can redraw them crisply. `duration` is how long the drag lasted, which is enough to animate a shape growing in on replay.

%-EVENT-END

%-EVENT-START pointerMove

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

%-EVENT-END
