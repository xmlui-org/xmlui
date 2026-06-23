# Column

`Column` defines a table column. It is a non-visual child of `Table`.

This migration slice preserves the foundation contract: `bindTo`, `header`,
width constraints, and sort enablement. Full old table behavior is tracked by
the copied old `Table` E2E suite.
