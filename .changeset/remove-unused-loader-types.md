---
"xmlui": patch
---

Remove unused loader types `ExternalDataLoader` and `MockLoader`.

Neither loader type was used anywhere in the framework or any known application. Both carried `status: "stable"` metadata but had no markup usage, no tests, and were never emitted by `ApiBoundComponent` at runtime. The `MockLoader` functionality is fully covered by `DataSource.mockData`; `ExternalDataLoader` served only as a reference pattern for the planned `ApiBoundDataLoader` (documented in `api-components-plan.md`), which will be introduced as a new loader type when that feature lands.
