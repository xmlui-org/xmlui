# Loader Readability Pass

## Readability Plan

- [x] `xmlui/src/components-core/loader/ApiLoader.tsx`
  - [comment] Replace generic component comments with concise intent summaries.
  - [name] Rename local loading/data variables to describe the resolved URL and parsed response.
- [x] `xmlui/src/components-core/loader/Loader.tsx`
  - [comment] Replace debug/stale comments with concise lifecycle summaries.
  - [name] Rename local query/update variables to describe loaded values and current cache items.
  - [condition] Add named predicates for load reset and load/error notification transitions.
- [x] `xmlui/src/components-core/loader/PageableLoader.tsx`
  - [comment] Clarify paging, cache cleanup, and load notification phases.
  - [name] Rename private props/query-key locals to describe their purpose.
  - [duplication] Extract repeated page-selector expression handling into a helper.
