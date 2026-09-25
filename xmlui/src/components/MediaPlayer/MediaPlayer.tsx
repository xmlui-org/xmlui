import styles from "./MediaPlayer.module.scss";

import { parseScssVar } from "../../components-core/theming/themeVars";
import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { MediaPlayer } from "./MediaPlayerReact";

const COMP = "MediaPlayer";

export const MediaPlayerMd = createMetadata({
  status: "experimental",
  description:
    "`MediaPlayer` plays audio or video. It renders the browser's native `<video>` or " +
    "`<audio>` element, reports playback through events that carry the playhead position, " +
    "and exposes methods to play, pause, and seek. It plays whatever formats the host " +
    "browser or WebView supports.",
  props: {
    kind: {
      description:
        "Selects the element to render. Use `audio` for sound-only media: it renders a compact " +
        "control bar instead of a video frame.",
      valueType: "string",
      availableValues: [
        { value: "video", description: "Render a `<video>` element" },
        { value: "audio", description: "Render an `<audio>` element" },
      ],
      isStrictEnum: true,
      defaultValue: "video",
    },
    src: {
      description:
        "The URL of the media to play. It is passed to the native element unchanged; which " +
        "formats and codecs play depends on the browser or WebView.",
      valueType: "string",
    },
    controls: {
      description: "Shows the browser's built-in playback controls.",
      valueType: "boolean",
      defaultValue: true,
    },
    autoPlay: {
      description:
        "Starts playback as soon as the media can play. Browsers may block autoplay of " +
        "media with sound unless `muted` is also set.",
      valueType: "boolean",
      defaultValue: false,
    },
    loop: {
      description: "Restarts playback from the beginning when the media ends.",
      valueType: "boolean",
      defaultValue: false,
    },
    muted: {
      description: "Mutes the audio.",
      valueType: "boolean",
      defaultValue: false,
    },
    preload: {
      description: "Hints how much of the media the browser should load before playback starts.",
      valueType: "string",
      availableValues: [
        { value: "none", description: "Load nothing until playback starts" },
        { value: "metadata", description: "Load only metadata such as duration and dimensions" },
        { value: "auto", description: "Let the browser load the whole media if it chooses" },
      ],
      isStrictEnum: true,
    },
    crossOrigin: {
      description: "The CORS mode used when fetching the media.",
      valueType: "string",
      availableValues: [
        { value: "anonymous", description: "Send CORS requests without credentials" },
        { value: "use-credentials", description: "Send CORS requests with credentials" },
      ],
      isStrictEnum: true,
    },
    playbackRate: {
      description: "The playback speed, where `1` is normal speed.",
      valueType: "number",
      defaultValue: 1,
    },
    poster: {
      description:
        "The URL of an image to show before video playback starts. Applies only when " +
        "`kind` is `video`; ignored for audio.",
      valueType: "string",
    },
  },
  events: {
    play: {
      description:
        "Fires when playback starts or resumes. The handler receives `{ currentTime }`, the " +
        "playhead position in seconds.",
      signature: "play(event: { currentTime: number }): void",
      parameters: { event: "An object with the playhead position (`currentTime`, seconds)." },
    },
    pause: {
      description:
        "Fires when playback pauses. The handler receives `{ currentTime }`, the playhead " +
        "position in seconds.",
      signature: "pause(event: { currentTime: number }): void",
      parameters: { event: "An object with the playhead position (`currentTime`, seconds)." },
    },
    seeked: {
      description:
        "Fires when a seek completes. The handler receives `{ currentTime }`, the new playhead " +
        "position in seconds.",
      signature: "seeked(event: { currentTime: number }): void",
      parameters: { event: "An object with the new playhead position (`currentTime`, seconds)." },
    },
    ended: {
      description:
        "Fires when playback reaches the end of the media. The handler receives " +
        "`{ currentTime }`. Does not fire when `loop` is set.",
      signature: "ended(event: { currentTime: number }): void",
      parameters: { event: "An object with the playhead position (`currentTime`, seconds)." },
    },
    timeUpdate: {
      description:
        "Fires repeatedly while the playhead moves, at a rate the browser chooses (typically " +
        "every 15 to 250 milliseconds). The handler receives `{ currentTime }`. Use it to " +
        "display a moving position.",
      signature: "timeUpdate(event: { currentTime: number }): void",
      parameters: { event: "An object with the playhead position (`currentTime`, seconds)." },
    },
    loadedMetadata: {
      description:
        "Fires when the media's duration (and, for video, its dimensions) are known. The " +
        "handler receives `{ duration }`, plus `videoWidth` and `videoHeight` when `kind` is " +
        "`video`.",
      signature:
        "loadedMetadata(event: { duration: number; videoWidth?: number; videoHeight?: number }): void",
      parameters: {
        event: "An object with `duration` (seconds) and, for video, `videoWidth` and `videoHeight`.",
      },
    },
  },
  apis: {
    play: {
      description:
        "Starts or resumes playback. Returns a promise that rejects if the browser refuses " +
        "to play (for example, when autoplay with sound is blocked).",
      signature: "play(): Promise<void>",
    },
    pause: {
      description: "Pauses playback.",
      signature: "pause(): void",
    },
    seek: {
      description: "Moves the playhead to the given position.",
      signature: "seek(seconds: number): void",
      parameters: { seconds: "The new playhead position, in seconds." },
    },
    getCurrentTime: {
      description:
        "Returns the playhead position in seconds, read from the element at the moment of " +
        "the call. It is not reactive: a binding that calls it does not update as playback " +
        "proceeds. Use the `timeUpdate` event for a moving display.",
      signature: "getCurrentTime(): number",
    },
    paused: {
      description: "`true` unless the media is playing. Reactive.",
      signature: "get paused(): boolean",
    },
    ended: {
      description: "`true` after playback has reached the end. Reactive.",
      signature: "get ended(): boolean",
    },
    duration: {
      description:
        "The media's length in seconds once its metadata has loaded, otherwise `undefined`. " +
        "`Infinity` for live streams. Reactive.",
      signature: "get duration(): number | undefined",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const mediaPlayerComponentRenderer = wrapComponent(COMP, MediaPlayer, MediaPlayerMd, {
  resourceUrls: ["src", "poster"],
  strings: ["kind", "preload", "crossOrigin"],
  exposeRegisterApi: true,
  stateful: true,
  // Verbose tracing: media events become native:media.* Inspector entries
  captureNativeEvents: true,
});
