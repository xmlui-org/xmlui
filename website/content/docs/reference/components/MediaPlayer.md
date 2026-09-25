# MediaPlayer [#mediaplayer]

`MediaPlayer` plays audio or video. It renders the browser's native `<video>` or `<audio>` element, reports playback through events that carry the playhead position, and exposes methods to play, pause, and seek. It plays whatever formats the host browser or WebView supports.

**Key features:**
- **Audio and video**: `kind="video"` (the default) renders a `<video>` element; `kind="audio"` renders a compact `<audio>` control bar
- **Any format the browser plays**: `src` goes to the native element unchanged, so supported formats and codecs are whatever the host browser or WebView supports
- **Events that carry the playhead**: `play`, `pause`, `seeked` and `ended` each report `currentTime`, so the path a listener took through the media can be rebuilt from events alone
- **Methods**: `play()`, `pause()`, `seek(seconds)` and `getCurrentTime()`

```xmlui-pg copy display name="Example: a video"
<App>
  <MediaPlayer src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" />
</App>
```

```xmlui-pg copy display name="Example: audio"
<App>
  <MediaPlayer
    kind="audio"
    src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3" />
</App>
```

## Reading playback state [#reading-playback-state]

`paused`, `ended` and `duration` are reactive: bindings that read them update when they change. The playhead position changes too often to be reactive, so there are two ways to read it:

- the `timeUpdate` event, for a display that follows playback;
- `getCurrentTime()`, for the position at a particular moment, such as inside a click handler.

If you rebuild a listener's path from events, note one browser behavior: when the user starts dragging the scrubber while the media is playing, the browser pauses first, and that `pause` event reports the position being dragged *to*, not the last position played. To measure how long a stretch played, use the `play` position plus the elapsed wall-clock time, rather than that `pause` event's `currentTime`.

```xmlui-pg copy display name="Example: custom controls" height="420px"
<App var.position="{0}">
  <MediaPlayer
    id="player"
    controls="false"
    src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    onTimeUpdate="(e) => position = e.currentTime" />
  <HStack verticalAlignment="center">
    <Button
      label="{player.paused ? 'Play' : 'Pause'}"
      onClick="player.paused ? player.play() : player.pause()" />
    <Button label="Back 2s" onClick="player.seek(player.getCurrentTime() - 2)" />
    <Text value="{position.toFixed(1)} / {player.duration ? player.duration.toFixed(1) : '?'} s" />
  </HStack>
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

### `autoPlay` [#autoplay]

> [!DEF]  default: **false**

Starts playback as soon as the media can play. Browsers may block autoplay of media with sound unless `muted` is also set.

### `controls` [#controls]

> [!DEF]  default: **true**

Shows the browser's built-in playback controls.

### `crossOrigin` [#crossorigin]

The CORS mode used when fetching the media.

Available values:

| Value | Description |
| --- | --- |
| `anonymous` | Send CORS requests without credentials |
| `use-credentials` | Send CORS requests with credentials |

### `kind` [#kind]

> [!DEF]  default: **"video"**

Selects the element to render. Use `audio` for sound-only media: it renders a compact control bar instead of a video frame.

Available values:

| Value | Description |
| --- | --- |
| `video` | Render a `<video>` element **(default)** |
| `audio` | Render an `<audio>` element |

The two kinds render differently: `<video>` reserves a frame for the picture, while `<audio>` is a control bar only. Set `kind="audio"` for sound-only media, even if the file would also play in a `<video>` element.

### `loop` [#loop]

> [!DEF]  default: **false**

Restarts playback from the beginning when the media ends.

### `muted` [#muted]

> [!DEF]  default: **false**

Mutes the audio.

### `playbackRate` [#playbackrate]

> [!DEF]  default: **1**

The playback speed, where `1` is normal speed.

### `poster` [#poster]

The URL of an image to show before video playback starts. Applies only when `kind` is `video`; ignored for audio.

```xmlui-pg copy display name="Example: poster"
<App>
  <MediaPlayer
    src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm"
    poster="/resources/images/components/image/breakfast.jpg" />
</App>
```

### `preload` [#preload]

Hints how much of the media the browser should load before playback starts.

Available values:

| Value | Description |
| --- | --- |
| `none` | Load nothing until playback starts |
| `metadata` | Load only metadata such as duration and dimensions |
| `auto` | Let the browser load the whole media if it chooses |

### `src` [#src]

The URL of the media to play. It is passed to the native element unchanged; which formats and codecs play depends on the browser or WebView.

Formats are not checked or filtered. Whether a given file plays depends on the browser or WebView showing the app.

## Events [#events]

### `ended` [#ended]

Fires when playback reaches the end of the media. The handler receives `{ currentTime }`. Does not fire when `loop` is set.

**Signature**: `ended(event: { currentTime: number }): void`

- `event`: An object with the playhead position (`currentTime`, seconds).

### `loadedMetadata` [#loadedmetadata]

Fires when the media's duration (and, for video, its dimensions) are known. The handler receives `{ duration }`, plus `videoWidth` and `videoHeight` when `kind` is `video`.

**Signature**: `loadedMetadata(event: { duration: number; videoWidth?: number; videoHeight?: number }): void`

- `event`: An object with `duration` (seconds) and, for video, `videoWidth` and `videoHeight`.

```xmlui-pg copy display name="Example: loadedMetadata"
<App var.info="">
  <MediaPlayer
    src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    preload="metadata"
    onLoadedMetadata="(e) => info = e.duration.toFixed(1) + ' s, ' + e.videoWidth + 'x' + e.videoHeight" />
  <Text value="Metadata: {info}" />
</App>
```

### `pause` [#pause]

Fires when playback pauses. The handler receives `{ currentTime }`, the playhead position in seconds.

**Signature**: `pause(event: { currentTime: number }): void`

- `event`: An object with the playhead position (`currentTime`, seconds).

### `play` [#play]

Fires when playback starts or resumes. The handler receives `{ currentTime }`, the playhead position in seconds.

**Signature**: `play(event: { currentTime: number }): void`

- `event`: An object with the playhead position (`currentTime`, seconds).

```xmlui-pg copy display name="Example: log plays, pauses and seeks" height="440px"
<App var.log="{[]}">
  <MediaPlayer
    src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    onPlay="(e) => log = [...log, 'play at ' + e.currentTime.toFixed(2)]"
    onPause="(e) => log = [...log, 'pause at ' + e.currentTime.toFixed(2)]"
    onSeeked="(e) => log = [...log, 'seeked to ' + e.currentTime.toFixed(2)]"
    onEnded="(e) => log = [...log, 'ended at ' + e.currentTime.toFixed(2)]" />
  <Items data="{log}">
    <Text value="{$item}" />
  </Items>
</App>
```

### `seeked` [#seeked]

Fires when a seek completes. The handler receives `{ currentTime }`, the new playhead position in seconds.

**Signature**: `seeked(event: { currentTime: number }): void`

- `event`: An object with the new playhead position (`currentTime`, seconds).

### `timeUpdate` [#timeupdate]

Fires repeatedly while the playhead moves, at a rate the browser chooses (typically every 15 to 250 milliseconds). The handler receives `{ currentTime }`. Use it to display a moving position.

**Signature**: `timeUpdate(event: { currentTime: number }): void`

- `event`: An object with the playhead position (`currentTime`, seconds).

## Exposed Methods [#exposed-methods]

### `duration` [#duration]

The media's length in seconds once its metadata has loaded, otherwise `undefined`. `Infinity` for live streams. Reactive.

**Signature**: `get duration(): number | undefined`

### `ended` [#ended]

`true` after playback has reached the end. Reactive.

**Signature**: `get ended(): boolean`

### `getCurrentTime` [#getcurrenttime]

Returns the playhead position in seconds, read from the element at the moment of the call. It is not reactive: a binding that calls it does not update as playback proceeds. Use the `timeUpdate` event for a moving display.

**Signature**: `getCurrentTime(): number`

### `pause` [#pause]

Pauses playback.

**Signature**: `pause(): void`

### `paused` [#paused]

`true` unless the media is playing. Reactive.

**Signature**: `get paused(): boolean`

### `play` [#play]

Starts or resumes playback. Returns a promise that rejects if the browser refuses to play (for example, when autoplay with sound is blocked).

**Signature**: `play(): Promise<void>`

### `seek` [#seek]

Moves the playhead to the given position.

**Signature**: `seek(seconds: number): void`

- `seconds`: The new playhead position, in seconds.

## Styling [#styling]

This component does not have any styles.
