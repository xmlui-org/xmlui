# Local Storage Persistence

XMLUI can automatically persist data to the browser's `localStorage` and restore it on the next page load — no server, no custom logic required. There are two levels of persistence:

- **App-level**: the active theme and tone persist across reloads.
- **Variable-level**: any `<global>` variable can be pinned to a localStorage key.

Both levels are completely opt-in. Apps that don't declare any persistence continue to work exactly as before.

## Persisting the app theme and tone

Set `persistTheme="true"` on the `<App>` component. XMLUI will save the active theme ID and tone to `localStorage` and restore them on the next load — no flash, no two-phase init.

```xmlui
<App persistTheme="true">
  ...
</App>
```

By default the values are stored under the keys `appTheme` and `appTone`. You can override these with `themeStorageKey` and `toneStorageKey`:

```xmlui
<App
  persistTheme="true"
  themeStorageKey="myApp.theme"
  toneStorageKey="myApp.tone"
>
  ...
</App>
```

> [!INFO]
> `persistTheme` covers both the theme selection and the light/dark tone toggle in one prop. The two storage keys let you namespace them inside a shared object if you prefer dot-path semantics.

## Persisting global variables

### With an explicit storage key

Pass `storageKey` on the `<global>` tag. On every page load the variable is initialised from localStorage (falling back to `value` when nothing is stored yet), and every change writes back automatically.

```xmlui-pg display copy name="Example: Persisting global variable"
<App>
  <global name="count" value="{0}" storageKey="count" />
  <VStack>
    <Text>Count: {count}</Text>
    <HStack gap="$space-2">
      <Button label="Increment" onClick="count++" />
      <Button label="Decrement" onClick="count--" />
    </HStack>
    <Text>
      Reload the app (with <Icon name="refresh" />) to see the count restored.
    </Text>
  </VStack>
</App>
```

### With the `persist` shorthand

When `storageKey` is omitted, `persist="true"` uses the variable's own `name` as the key:

```xmlui
<!-- These two are equivalent -->
<global name="count" value="{0}" persist="true" />
<global name="count" value="{0}" storageKey="count" />
```

An explicit `storageKey` always wins over the global variable name:

```xmlui
<!-- Key used is "myApp.v1.count", not "count" -->
<global name="count" value="{0}" persist="true" storageKey="myApp.v1.count" />
```

### How it works

| Situation | Behaviour |
|---|---|
| First run — nothing stored yet | Variable starts at the `value` attribute. |
| Subsequent runs — value found in storage | Variable starts at the stored value. `value` is ignored. |
| Storage read fails (corrupt data, `SecurityError`) | Variable starts at the `value` attribute. |
| Variable changes at runtime | New value written to localStorage immediately. |

The read happens synchronously during state initialisation, so the variable holds its correct persisted value on the very first render — no UI flash.

## Reading and writing storage manually

Five global functions are available in XMLUI scripts for direct localStorage access:

### `readLocalStorage(key, fallback?)`

Reads a value from localStorage. The `key` uses **dot-path semantics**: the first segment is the entry name, the rest is a property path inside the parsed JSON object.

```xmlui-pg copy display name="Example: readLocalStorage"
<App>
  <VStack>
    <Button 
      label="Write 'Hello'" 
      onClick="writeLocalStorage('demo.greeting', 'Hello!')"
    />
    <Button 
      label="Write 42" 
      onClick="writeLocalStorage('demo.number', 42)" 
    />
    <Button
      label="Read greeting"
      onClick="toast.success(readLocalStorage('demo.greeting', '(nothing stored)'))"
    />
    <Button
      label="Read full entry"
      onClick="toast.success(JSON.stringify(readLocalStorage('demo')))"
    />
  </VStack>
</App>
```

### `writeLocalStorage(key, value)`

Writes a value. For a simple key the value replaces the whole entry; for a dot-path key it merges into the existing object:

```xmlui
<!-- Stores {"theme":"dark","tone":"light"} under "prefs" -->
writeLocalStorage("prefs.theme", "dark")
writeLocalStorage("prefs.tone", "light")
```

### `deleteLocalStorage(key)`

Removes a single entry or a sub-path within an entry:

```xmlui
deleteLocalStorage("count")       // removes the "count" entry entirely
deleteLocalStorage("prefs.tone")  // removes only prefs.tone from the "prefs" entry
```

### `getAllLocalStorage()`

Returns every entry currently in localStorage as a plain object (values JSON-parsed where possible):

```xmlui-pg display copy name="Example: getAllLocalStorage"
<App>
  <VStack>
    <Button 
      label="Write some values" 
      onClick="
        writeLocalStorage('example.x', 1); 
        writeLocalStorage('example.y', 2)" 
      />
    <Button
      label="Show all entries"
      onClick="toast.success(JSON.stringify(getAllLocalStorage()))"
    />
  </VStack>
</App>
```

## Resetting persisted data

### From a button or script: `resetLocalStorage(prefix?)`

Call `resetLocalStorage()` to wipe all localStorage entries, or pass a prefix to remove only matching keys:

```xmlui-pg copy display name="Example: resetLocalStorage"
<App>
  <global name="count" value="{0}" storageKey="demo.count" />
  <VStack>
    <Text>Count: {count}</Text>
    <Button label="Increment" onClick="count++" />
    <Button
      label="Reset count to default"
      onClick="resetLocalStorage('demo.count'); count = 0"
    />
    <Button
      label="Reset ALL storage"
      onClick="resetLocalStorage()"
    />
  </VStack>
</App>
```

`resetLocalStorage` removes the entry from localStorage but does not automatically reset the in-memory variable — set it explicitly if you want the UI to reflect the default immediately (as shown above).

### From the browser console

Two console helpers are available on `window`:

```js
// Inspect what is persisted
window.XMLUI_GET_STORAGE()
// → { count: 5, appTheme: "dark", appTone: "dark" }

// Clear everything and reload
window.XMLUI_RESET_STORAGE()

// Clear only a prefix and reload
window.XMLUI_RESET_STORAGE("myApp.v1")
```

## Schema versioning

When you ship a new version of your app with an incompatible data shape, clients that previously stored the old format will receive the old value on load. The safest fix is to change the storage key by including a version in the prefix:

```xmlui
<!-- v1 of the app -->
<global name="prefs" value="{{}}" storageKey="myApp.v1.prefs" />

<!-- v2: breaking change in the data shape — bump the version -->
<global name="prefs" value="{{}}" storageKey="myApp.v2.prefs" />
```

Old `myApp.v1.*` keys are silently ignored (the variable starts from `value`) and can be cleaned up with `clearLocalStorage("myApp.v1")` in a migration script or a one-time startup check.

> [!INFO]
> The `storageKey` attribute is intentionally named without a "local" prefix so the same attribute can be reused by future providers (sessionStorage, IndexedDB, or a remote KV store) without a breaking rename.

## Quick reference

### `<global>` attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `storageKey` | `string` | — | Explicit dot-path key into localStorage. Implies persistence. |
| `persist` | `boolean` | `false` | When `true`, uses the variable `name` as the storage key. |

### `<App>` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `persistTheme` | `boolean` | `false` | Persist the active theme ID and tone across page loads. |
| `themeStorageKey` | `string` | `"appTheme"` | localStorage key for the theme ID. |
| `toneStorageKey` | `string` | `"appTone"` | localStorage key for the tone (`"light"` / `"dark"`). |

### Global functions

| Function | Signature | Description |
|---|---|---|
| `readLocalStorage` | `(key, fallback?) → any` | Read a value (dot-path supported). Returns `fallback` on any error. |
| `writeLocalStorage` | `(key, value) → void` | Write a value (dot-path merges into the root entry). |
| `deleteLocalStorage` | `(key) → void` | Remove an entry or sub-path. |
| `resetLocalStorage` | `(prefix?) → void` | Remove all entries, or only those matching a prefix. |
| `clearLocalStorage` | `(prefix?) → void` | Alias for `resetLocalStorage`. |
| `getAllLocalStorage` | `() → object` | Return all entries as a plain object. |
