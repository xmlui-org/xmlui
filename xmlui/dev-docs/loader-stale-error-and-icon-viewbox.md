# Bug Investigation: Stale Cached Error Replay & Icon viewBox

**Branch:** `marcello-tk/coressh-login-gate-issue`  
**Date:** 2026-03-18

---

## Background

A downstream customer product (Core Server) reported two distinct symptoms when a browser session is reused across a server restart or after a large system-clock advance:

1. After re-logging in successfully (HTTP 200), the web UI remains stuck on the login screen.
2. A console error: `<symbol> attribute viewBox: Expected number, "undefined"`.

These were initially suspected to be a backend authentication problem. Investigation confirmed one bug in the XMLUI framework for each symptom.

---

## Bug 1 — Stale cached 401 replayed as a new error on mount

### File
`xmlui/src/components-core/loader/Loader.tsx`

### Symptom
After a server restart (or any event that invalidates the session), re-logging in correctly returns HTTP 200. However the app immediately navigates back to the login screen. In Wireshark, the subsequent `/api/status` request is cancelled mid-flight by the client — the server never sends a response because the React component tree is torn down before the response arrives.

### Root cause

When a `DataSource` component mounts, react-query may already have a cached `error` entry for the query key from the previous (now-expired) session. The `Loader` component uses `usePrevious(error)` to detect *new* errors:

```ts
} else if (status === "error" && error !== prevError) {
  loaderError(error);
}
```

`usePrevious` is implemented with `useEffect`, which runs **after paint**. The `loaderError` check runs inside `useIsomorphicLayoutEffect`, which runs **before** that `useEffect`. On the very first render after mount:

- `error` = stale `UnauthorizedError` from cache
- `prevError` = `undefined` (the `useEffect` hasn't fired yet)
- `error !== prevError` → `true` → `loaderError` fires instantly

The app's `onError` handler navigates to `/login`, unmounting all data components. The real background re-fetch (which would have succeeded) is aborted mid-flight — producing the `ERR_EMPTY_RESPONSE` / TCP-close-before-response seen in Wireshark. The "second 401" Martin observed in the Bugzilla thread is **not** from the server; it is the framework replaying a stale cache entry.

### Fix

A `hasFetchCompletedRef` flag is set to `true` the first time `isFetching` transitions from `true` to `false` after mount (meaning a real fetch cycle completed). `loaderError` is now gated on this flag:

```ts
const hasFetchCompletedRef = useRef(false);

useIsomorphicLayoutEffect(() => {
  loaderInProgressChanged(isFetching || isLoading);
  if (prevIsFetching && !isFetching) {
    hasFetchCompletedRef.current = true;
  }
}, [isLoading, isFetching, loaderInProgressChanged, prevIsFetching]);

// ...

} else if (status === "error" && error !== prevError && hasFetchCompletedRef.current) {
  loaderError(error);
}
```

This means a cached error that was already present at mount time is silently skipped. Only errors that arrive from a fetch initiated *after* the component mounted are surfaced to the application. The ref resets automatically on remount (which occurs naturally when the `queryId` key changes).

---

## Bug 2 — Icon `<symbol>` rendered with `viewBox="undefined"`

### File
`xmlui/src/components/IconProvider.tsx`

### Symptom
Browser console: `Error: <symbol> attribute viewBox: Expected number, "undefined"`.

### Root cause

`ensureCustomResourceSvgIcon` fetches an SVG by URL and creates a `<symbol>` element for the sprite sheet:

```ts
d.setAttributeNS(null, "viewBox", attrs["viewBox"]);
```

If the fetched SVG does not have a `viewBox` attribute, `attrs["viewBox"]` is `undefined`. Passing `undefined` to `setAttributeNS` coerces it to the string `"undefined"`, which is an invalid SVG attribute value.

The same function's sibling code path (the `icons` prop branch) already handles this correctly with a fallback:

```ts
const viewBox = safeAttributes.viewBox || '0 0 24 24';
```

### Fix

Apply the same fallback to the `setAttributeNS` call:

```ts
d.setAttributeNS(null, "viewBox", attrs["viewBox"] ?? "0 0 24 24");
```

---

## What XMLUI is and is not responsible for

| Symptom | Responsible party |
|---|---|
| Login stuck after restart / clock advance | **XMLUI** — stale cached error replayed on mount (Bug 1, fixed) |
| `viewBox: "undefined"` console error | **XMLUI** — missing fallback in `ensureCustomResourceSvgIcon` (Bug 2, to fix) |
| `ERR_EMPTY_RESPONSE` on `/api/status` | **Downstream effect** of Bug 1 — component unmounts mid-fetch; not a server bug |
| `/api/login` sending credentials in the request body | Separate UI-layer issue, not related to XMLUI core |
