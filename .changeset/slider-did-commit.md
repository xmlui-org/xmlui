---
"xmlui": patch
---

Add a `didCommit` event to `Slider`, fired once when an adjustment finishes rather than on every step crossed during a drag, so expensive handlers (filtering a result set, fetching) can run per gesture while `didChange` keeps driving the live readout.
