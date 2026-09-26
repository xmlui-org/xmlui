# Log a media player's playhead path

`MediaPlayer` reports what happens to it through events, and takes instructions through methods. This how-to uses both: the events to record what a viewer did, and the methods to play a list of clips back to back.

## Record a sequence of media player events

The `play`, `pause`, `seeked` and `ended` events each tell you the playhead position, in seconds, as `currentTime`. Every play, pause and jump fires one of them, so recording them gives you a complete account of what the viewer did. You don't need to keep checking the position.

Add a row for each event with two numbers: where the playhead was, and how many seconds had passed since the first event. A function in a `<script>` block does the recording, so each handler is one line.

```xmlui-pg copy display name="Record a sequence of media player events" id="record-a-sequence-of-media-player-events" height="820px"
<App var.events="{[]}">
  <script>
    function record(name, e) {
      events = [...events, { name: name, position: e.currentTime, time: Date.now() }];
    }
  </script>
  <MediaPlayer
    src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    onPlay="(e) => record('play', e)"
    onPause="(e) => record('pause', e)"
    onSeeked="(e) => record('seeked', e)"
    onEnded="(e) => record('ended', e)" />
  <Button label="Clear" onClick="events = []" />
  <Table data="{events}">
    <Column header="Event" bindTo="name" />
    <Column header="Position (s)">{$item.position.toFixed(2)}</Column>
    <Column header="Seconds since first event">{(($item.time - events[0].time) / 1000).toFixed(2)}</Column>
  </Table>
</App>
```

Play, pause, and drag the scrubber to see the rows. Dragging produces a short run of `seeked` rows, one for each position the player showed along the way.

> **Note:** one row can mislead you. If the video is playing and you grab the scrubber, the browser pauses the video as the drag begins, and that `pause` row shows a position from the drag, not where playback stopped. Say the video reaches 2.00 and you drag toward 4.50: the `pause` row can read 4.10, although the video never played past 2.00. The "Seconds since first event" column is still right. So to work out how long the video actually played, subtract the times of the `play` and `pause` rows, not their positions.

## Stitch together a sequence of clips

To play selected parts of a video back to back, describe them as data: a list of clips, each with a start and an end position. Then drive the player with its methods:

- `seek(seconds)` moves the playhead to a clip's start, and `play()` starts it;
- the `timeUpdate` event fires repeatedly while the video plays, so its handler can notice when the playhead has reached the current clip's end and move on to the next clip;
- after the last clip, `pause()` stops the video.

```xmlui-pg copy display name="Stitch together a sequence of clips" id="stitch-together-a-sequence-of-clips" height="640px"
<App
  var.clips="{[
    { id: 'A', start: 0.5, end: 1.5 },
    { id: 'B', start: 3.5, end: 4.5 },
    { id: 'C', start: 2.0, end: 3.0 }
  ]}"
  var.current="{-1}">
  <script>
    function playClip(index) {
      current = index;
      clipTable.selectId(clips[index].id);
      player.seek(clips[index].start);
      player.play();
    }

    function stop() {
      current = -1;
      clipTable.clearSelection();
    }

    function checkClipEnd(e) {
      if (current < 0 || e.currentTime < clips[current].end) return;
      if (current + 1 < clips.length) {
        playClip(current + 1);
      } else {
        player.pause();
        stop();
      }
    }
  </script>
  <MediaPlayer
    id="player"
    src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    onTimeUpdate="(e) => checkClipEnd(e)"
    onEnded="stop()" />
  <HStack verticalAlignment="center">
    <Button label="Play the clips" onClick="playClip(0)" />
    <Text value="{current < 0 ? 'Stopped' : 'Playing clip ' + clips[current].id}" />
  </HStack>
  <Table
    id="clipTable"
    data="{clips}"
    rowsSelectable="true"
    enableMultiRowSelection="false"
    hideSelectionCheckboxes="true"
    onRowClick="(item) => playClip(clips.findIndex((c) => c.id === item.id))">
    <Column header="Clip" bindTo="id" />
    <Column header="Start (s)">{$item.start.toFixed(2)}</Column>
    <Column header="End (s)">{$item.end.toFixed(2)}</Column>
  </Table>
</App>
```

The playing clip's row is highlighted through the table's selection: `selectId()` selects the row when its clip starts, and `clearSelection()` clears it at the end. `hideSelectionCheckboxes` keeps the selection checkboxes out of view. Selecting a row styles the whole row, so the cells need no styling of their own. Clicking a row plays the list from that clip, so a click can't move the highlight away from what's playing.

The clips play in list order, not in the order they appear in the video: A, then B, then C, which is earlier in the video than B.

Each clip can run a little past its end. `timeUpdate` fires every 15 to 250 milliseconds, depending on the browser, so the handler sees the end up to a quarter of a second late. That's fine for previewing an edit; for frame-accurate cuts, use a video-editing tool.

The clip list is ordinary data, so it can come from anywhere: a file, an API, or events recorded as in the first example.

## Key points

**Events report, methods instruct**: `play`, `pause`, `seeked`, `ended` and `timeUpdate` tell you what the player did. `seek()`, `play()` and `pause()` tell it what to do next.

**The events are a complete record**: every play, pause and jump fires an event carrying `currentTime`. You don't need to poll the position.

**Record `Date.now()` with each event**: the position says *where* the playhead was; the time says *when*. Use the times to measure how long something played.

**Use `timeUpdate` to act at a position**: its handler runs repeatedly during playback, so it can check whether a clip's end has been reached.

**Highlight a row with the table's selection**: `rowsSelectable` with `hideSelectionCheckboxes` lets code highlight a whole row with `selectId()` and clear it with `clearSelection()`.

**Replace the array to update the view**: `events = [...events, entry]` assigns a new array, which is what makes the `Table` update.

---

## See also

- [MediaPlayer](/docs/reference/components/MediaPlayer) - props, events, methods and reactive state
