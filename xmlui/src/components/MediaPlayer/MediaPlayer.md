%-DESC-START

**Key features:**
- **Audio and video**: `kind="video"` (the default) renders a `<video>` element; `kind="audio"` renders a compact `<audio>` control bar
- **Any format the browser plays**: `src` goes to the native element unchanged, so supported formats and codecs are whatever the host browser or WebView supports
- **Events that carry the playhead**: `play`, `pause`, `seeked` and `ended` each report `currentTime`, so the path a listener took through the media can be rebuilt from events alone
- **Methods**: `play()`, `pause()`, `seek(seconds)` and `getCurrentTime()`

```xmlui-pg copy display name="Example: a video" height="480px"
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

## Reading playback state

`paused`, `ended` and `duration` are reactive: bindings that read them update when they change. The playhead position changes too often to be reactive, so there are two ways to read it:

- the `timeUpdate` event, for a display that follows playback;
- `getCurrentTime()`, for the position at a particular moment, such as inside a click handler.

If you rebuild a listener's path from events, note one browser behavior: when the user starts dragging the scrubber while the media is playing, the browser pauses first, and that `pause` event reports the position being dragged *to*, not the last position played. To measure how long a stretch played, use the `play` position plus the elapsed wall-clock time, rather than that `pause` event's `currentTime`.

```xmlui-pg copy display name="Example: custom controls" height="540px"
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

%-DESC-END

%-PROP-START kind

The two kinds render differently: `<video>` reserves a frame for the picture, while `<audio>` is a control bar only. Set `kind="audio"` for sound-only media, even if the file would also play in a `<video>` element.

%-PROP-END

%-PROP-START src

Formats are not checked or filtered. Whether a given file plays depends on the browser or WebView showing the app.

%-PROP-END

%-PROP-START poster

```xmlui-pg copy display name="Example: poster" height="600px"
<App>
  <MediaPlayer
    src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm"
    poster="/resources/images/components/image/breakfast.jpg" />
</App>
```

%-PROP-END

%-EVENT-START play

```xmlui-pg copy display name="Example: log plays, pauses and seeks" height="640px"
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

%-EVENT-END

%-EVENT-START loadedMetadata

```xmlui-pg copy display name="Example: loadedMetadata" height="520px"
<App var.info="">
  <MediaPlayer
    src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    preload="metadata"
    onLoadedMetadata="(e) => info = e.duration.toFixed(1) + ' s, ' + e.videoWidth + 'x' + e.videoHeight" />
  <Text value="Metadata: {info}" />
</App>
```

%-EVENT-END
