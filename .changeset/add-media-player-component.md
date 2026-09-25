---
"xmlui": patch
---

Add an experimental MediaPlayer component for audio and video, with playback events that carry the playhead position, play/pause/seek methods, and reactive paused/ended/duration state. Components that capture native events can now attach a plain `traceData` object, which is recorded as the Inspector log entry's `data` and survives trace export.
