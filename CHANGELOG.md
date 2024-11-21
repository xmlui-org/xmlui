# xmlui Changelog

## v0.6.7

### Breaking changes:

- `RadioGroupOption` has been removed; `RadioGroup` uses `Option` instead of `RadioGroupOption`.

## v0.6.6

### Breaking changes:

- The `$eventArgs` property of event handlers renamed to `$params`

## v0.6.5

### Breaking changes:

- The `globals` property of app configuration renamed to `appGlobals`

## v0.6.3

### Breaking changes:

- Renaming in `Form`: 
  - `subject` property is now `data`.
  - `$subject` context value is now `$data`

## v0.6.1

### Breaking changes:

- `Utils` namespace removed. Replace `Utils.getByPath` with `getPropertyByPath`.

## v0.6.0

### Breaking changes:

- Merging the "datasource" and "data" properties; new we have only "data"

## v0.5.0

### Features

- `App` and `Stack` (all specialized types) now have default paddings and gaps (context-sensitive). *This is a breaking feature; your app's layout may be different than earlier.**

## 0.4.0

Initial xmlui version