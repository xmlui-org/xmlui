---
"xmlui": patch
---

Expose SkipLink, FocusScope, and LiveRegion in component metadata and generated documentation.
Preserve user-authored Fragment scopes inside App content so variables declared on those Fragments remain readable and writable from child event handlers.
Add a withLiveRegion behavior for supported text-like components so dynamic status text can be announced without adding a separate LiveRegion component.
Add accessibility how-to articles for SkipLink, LiveRegion, withLiveRegion, and FocusScope, with website example tests.
Allow SkipLink targets to resolve XMLUI component/test ids as well as DOM ids.
Keep FocusScope trapping scoped to the active focus container, including xmlui-pg Shadow DOM previews, so sibling examples embedded on the same page do not disable each other.
