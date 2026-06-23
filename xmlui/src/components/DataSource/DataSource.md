# DataSource

`DataSource` is a non-visual component that loads data and exposes its state
through an `id`-based component API.

This migration slice implements the foundation behavior used by the current
experiments: mock data, scripted fetch, managed fetch, result selection,
transforming, polling, `loaded`/`error` events, and `refetch`.
