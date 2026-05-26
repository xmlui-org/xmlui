# API Snapshots

Frozen snapshots of the public XMLUI API surface, one per published version,
produced by `xmlui/scripts/api-diff/extract.ts`.

The CI release guard (plan #12 Phase 3) compares the PR's extracted surface
against the latest snapshot here and refuses to release if the diff demands
a higher changeset bump than the one staged.

The first snapshot committed becomes the baseline; subsequent snapshots are
appended on each release tag.
