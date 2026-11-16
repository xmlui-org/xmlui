---
"xmlui": patch
---

Experimental `xmluiConfig.readScopedRendering` (off by default): a container re-renders its children only when something its bindings read changed, or a component's own state did. A write nothing displays, such as an unread DataSource flag, still updates state but no longer re-renders the screen that owns it. Event handlers always see the latest state. With `xsVerbose` on, `render:pass` entries show `stateHeld` when a pass was held back.

Independently of the switch, a container whose definition arrives as a new object with the same `props`, `loaders` and `children` entries keeps its previous definition, so it is not re-wrapped and re-rendered.
