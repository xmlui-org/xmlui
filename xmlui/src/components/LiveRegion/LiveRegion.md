# LiveRegion

`LiveRegion` announces dynamic status messages to assistive technologies while
remaining visually hidden.

This migration keeps the original `message` and `politeness` authoring surface.
The global `announceLiveRegion` helper from the old runtime is deferred until
the broader accessibility service layer is rebuilt.
