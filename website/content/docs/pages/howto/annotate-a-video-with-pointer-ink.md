# Annotate a video with pointer ink

Wrap a `MediaPlayer` in a `PointerLayer` to draw on top of the video: circle something, point an arrow at it, box it in. You can also pin your own content, such as callouts, to places on the picture. The ink fades on its own, but every stroke and shape is also reported as an event, so you can keep a record of what was marked and when.

Drawing is deliberate: hold the Command key (on macOS; the Windows key elsewhere) while you drag. Without it, the video's own controls work as usual.

## Draw over a video and log each annotation

Set the layer's `contentAspect` from the player's `loadedMetadata` event. Coordinates are then measured against the picture itself, not the black bars that may pad it. Each finished stroke or shape is logged with the video position it was drawn at, read with the player's `getCurrentTime()`.

```xmlui-pg copy display name="Draw over a video and log each annotation" id="draw-over-a-video-and-log-each-annotation" height="860px"
<App var.tool="arrow" var.aspect="{undefined}" var.notes="{[]}">
  <script>
    function note(kind, x, y) {
      notes = [...notes, {
        id: notes.length + 1,
        kind: kind,
        at: player.getCurrentTime(),
        x: x,
        y: y
      }];
    }
  </script>
  <HStack>
    <Button label="freehand" variant="{tool === 'freehand' ? 'solid' : 'outlined'}" onClick="tool = 'freehand'" />
    <Button label="arrow" variant="{tool === 'arrow' ? 'solid' : 'outlined'}" onClick="tool = 'arrow'" />
    <Button label="ellipse" variant="{tool === 'ellipse' ? 'solid' : 'outlined'}" onClick="tool = 'ellipse'" />
    <Button label="rect" variant="{tool === 'rect' ? 'solid' : 'outlined'}" onClick="tool = 'rect'" />
    <Button label="pointer" variant="{tool === 'pointer' ? 'solid' : 'outlined'}" onClick="tool = 'pointer'" />
  </HStack>
  <PointerLayer
    tool="{tool}"
    contentAspect="{aspect}"
    onStrokeEnd="(e) => note('freehand', e.points[0].x, e.points[0].y)"
    onShapeEnd="(e) => note(e.tool, e.x1, e.y1)">
    <MediaPlayer
      id="player"
      src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      onLoadedMetadata="(e) => aspect = e.videoWidth / e.videoHeight" />
  </PointerLayer>
  <Table data="{notes}">
    <Column header="#" bindTo="id" width="50px" />
    <Column header="Annotation" bindTo="kind" />
    <Column header="At (s)">{$item.at.toFixed(2)}</Column>
    <Column header="Where">{'(' + $item.x.toFixed(2) + ', ' + $item.y.toFixed(2) + ')'}</Column>
  </Table>
</App>
```

Pause the video, hold Command, and draw. Then play for a moment, pause again, and draw something else. Each row records which tool you used, the video position, and where the annotation started on the picture, from (0, 0) at the top-left to (1, 1) at the bottom-right.

## Jump back to an annotation

With a log of annotations and their positions, a click can take the viewer back to the moment each one was made. The table's selection highlights the chosen row: `rowsSelectable` with `hideSelectionCheckboxes` gives a row highlight without checkboxes, and `onRowClick` seeks the player.

```xmlui-pg copy display name="Jump back to an annotation" id="jump-back-to-an-annotation" height="860px"
<App var.tool="ellipse" var.aspect="{undefined}" var.notes="{[]}">
  <script>
    function note(kind) {
      notes = [...notes, { id: notes.length + 1, kind: kind, at: player.getCurrentTime() }];
    }

    function jumpTo(item) {
      player.pause();
      player.seek(item.at);
      noteTable.selectId(item.id);
    }
  </script>
  <HStack>
    <Button label="freehand" variant="{tool === 'freehand' ? 'solid' : 'outlined'}" onClick="tool = 'freehand'" />
    <Button label="arrow" variant="{tool === 'arrow' ? 'solid' : 'outlined'}" onClick="tool = 'arrow'" />
    <Button label="ellipse" variant="{tool === 'ellipse' ? 'solid' : 'outlined'}" onClick="tool = 'ellipse'" />
  </HStack>
  <PointerLayer
    tool="{tool}"
    contentAspect="{aspect}"
    onStrokeEnd="note('freehand')"
    onShapeEnd="(e) => note(e.tool)">
    <MediaPlayer
      id="player"
      src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      onLoadedMetadata="(e) => aspect = e.videoWidth / e.videoHeight" />
  </PointerLayer>
  <Table
    id="noteTable"
    data="{notes}"
    rowsSelectable="true"
    enableMultiRowSelection="false"
    hideSelectionCheckboxes="true"
    onRowClick="(item) => jumpTo(item)">
    <Column header="#" bindTo="id" width="50px" />
    <Column header="Annotation" bindTo="kind" />
    <Column header="At (s)">{$item.at.toFixed(2)}</Column>
  </Table>
</App>
```

Draw a few annotations at different points in the video, then click a row. The video pauses at that annotation's moment and the row is highlighted.

The ink itself doesn't come back: it faded when you drew it. The log records the moment and the kind of mark. If you need to redraw the marks, the full geometry is in the events: `strokeEnd` carries every point, and `shapeEnd` carries the shape's corners. You could render them yourself, as an app that records screencasts does when it composites the ink into the final video.

## Pin callouts to the picture

Ink fades, but some annotations should stay: a label on a detail, a note that points something out. `PointerLayer` can place your own content over the video with `anchors`, a list of `{ id, x, y, ... }` in the same picture coordinates as the drawing events. `anchorTemplate` says what to show for each one.

Here, a Command-click with the `pointer` tool drops a callout where you clicked: `shapeEnd` supplies the point. With `anchorDrag`, dragging a callout reports its new position, and the handler writes it back into the list, so the callout follows the pointer. Handle `anchorDragEnd` as well as `anchorDragMove`: moves are throttled by `sampleMs`, so the end event is what guarantees the callout lands exactly where the drag stopped. The table shows what an app would save.

```xmlui-pg copy display name="Pin callouts to the picture" id="pin-callouts-to-the-picture" height="820px"
<App var.aspect="{undefined}" var.callouts="{[]}">
  <script>
    function addCallout(e) {
      const n = callouts.length + 1;
      callouts = [...callouts, { id: n, x: e.x1, y: e.y1, width: 0.3, text: 'Callout ' + n }];
    }

    function moveCallout(e) {
      callouts = callouts.map((c) => c.id === e.id ? { ...c, x: e.x, y: e.y } : c);
    }
  </script>
  <PointerLayer
    tool="pointer"
    contentAspect="{aspect}"
    anchors="{callouts}"
    anchorDrag="true"
    onShapeEnd="(e) => addCallout(e)"
    onAnchorDragMove="(e) => moveCallout(e)"
    onAnchorDragEnd="(e) => moveCallout(e)">
    <MediaPlayer
      src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      onLoadedMetadata="(e) => aspect = e.videoWidth / e.videoHeight" />
    <property name="anchorTemplate">
      <Card padding="$space-2" backgroundColor="rgba(255, 255, 255, 0.9)">
        <Text variant="strong" value="{$item.text}" />
      </Card>
    </property>
  </PointerLayer>
  <Table data="{callouts}">
    <Column header="Callout" bindTo="text" />
    <Column header="x">{$item.x.toFixed(3)}</Column>
    <Column header="y">{$item.y.toFixed(3)}</Column>
  </Table>
</App>
```

Command-click a few places on the video, then drag the callouts around. Each one keeps its place on the picture when the player resizes, because its position is stored relative to the picture, not the element. The video's controls still work underneath the callouts: anchored content ignores the pointer except where dragging is turned on.

## Key points

**Hold Command to draw**: without the key, the layer is transparent and the video's controls behave normally. Set `drawModifier` to use a different key, or `"none"` to draw on every drag.

**Wire `contentAspect` from `loadedMetadata`**: `videoWidth / videoHeight` makes coordinates relative to the picture, so a mark at the picture's corner is (0, 0) whatever the player's size or letterboxing.

**Freehand reports points, shapes report geometry**: `strokeEnd` gives `points` with timing; `shapeEnd` gives `tool`, two corners, and `duration`. Record whichever your app needs to replay.

**Read the video position when the annotation ends**: `player.getCurrentTime()` in the event handler ties each mark to a moment in the video. It's a method call, not a reactive property, so it's always current.

**Anchors are controlled**: dragging an anchor reports its new position in `anchorDragMove` and `anchorDragEnd`; the layer doesn't move it. Write `x` and `y` back into `anchors` from both, since moves are throttled and the end carries the final position. Your data stays the source of truth.

**Keep dragged anchors present**: a drag ends if its anchor leaves `anchors`. Derive draggable anchors from state that doesn't blank out during async work, such as a `DataSource` that's empty while it reloads, or keep the last value until the new one arrives.

**Use Table selection for a row highlight**: `rowsSelectable`, `enableMultiRowSelection="false"` and `hideSelectionCheckboxes` highlight one whole row, set from code with `selectId()`.

---

## See also

- [PointerLayer](/docs/reference/components/PointerLayer) - props, events and the `clear()` method
- [MediaPlayer](/docs/reference/components/MediaPlayer) - events, methods and reactive state
- [Log a media player's playhead path](/docs/howto/log-a-media-players-playhead-path) - record and replay what a viewer watched
