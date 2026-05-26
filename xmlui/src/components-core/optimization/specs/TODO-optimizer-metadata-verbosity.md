# TODO: Optimize `optimizer-metadata.ts` Verbosity

## Issue Description
The `optimizer-metadata.ts` file is currently quite verbose, particularly when configuring event payloads. For components like `Form` that inject identical lexical variables (like `$data`) into multiple event handlers, we must duplicate the payload definition for every event.

While strict lexical scoping requires component children (`childInjectedVars`) and component events (`events.[name].injectedVars`) to have separate definitions (to prevent false parent dependencies causing stale closures or unnecessary re-renders), manually enumerating this in metadata creates excessive boilerplate.

For example, the current `Form` definition looks like this:
```typescript
  Form: {
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$data"],
    events: {
      willSubmit: { injectedVars: ["$data"] },
      submit: { injectedVars: ["$data"] },
      submitFailed: { injectedVars: ["$data"] },
      cancel: { injectedVars: ["$data"] },
      reset: { injectedVars: ["$data"] },
      success: { injectedVars: ["$data"] },
    },
  },
```

## Proposed Solutions

### Solution 1: TypeScript Helper Function (Immediate / Low Effort)
We can drastically reduce boilerplate with zero structural changes to the framework or optimizer by introducing a utility function within `optimizer-metadata.ts`.

```typescript
function buildEvents(eventNames: string[], injectedVars: string[]) {
  return eventNames.reduce((acc, name) => {
    acc[name] = { injectedVars };
    return acc;
  }, {} as Record<string, { injectedVars: string[] }>);
}

// Usage:
  Form: {
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$data"],
    events: buildEvents(
      ["willSubmit", "submit", "submitFailed", "cancel", "reset", "success"], 
      ["$data"]
    ),
  },
```
* **Pros:** Zero risk, zero changes elsewhere in codebase, instantly cleans up the file.
* **Cons:** Still requires developers to manually maintain the list of event names.

### Solution 2: Introduce `defaultEventInjectedVars` (Structural / Medium Effort)
If maintaining exhaustive lists of event names becomes too tedious, modify the static AST analyzer (`computeUsesForTree`) to accept a fallback parameter.

```typescript
  Form: {
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$data"],
    defaultEventInjectedVars: ["$data"], // Applied if specific event isn't found
    events: {
      // Only list overrides or exceptions here
    }
  }
```

* **Pros:** Eliminates the need to update `optimizer-metadata.ts` every time a standard event is added to a component.
* **Cons:** Requires modifying the `computeUsesForTree` analysis logic to detect `onX` pattern attributes and fallback to `defaultEventInjectedVars`.

## Recommendation
Implement **Solution 1** immediately to clean up the existing metadata configuration with zero risk. Re-evaluate **Solution 2** in the future if maintaining the event lists in `buildEvents` proves cumbersome.
