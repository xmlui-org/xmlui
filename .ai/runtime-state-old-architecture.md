# Runtime State Old Architecture Notes

Old XMLUI references:

- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/rendering/StateContainer.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/rendering/reducer.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/state/global-variables.ts`

Compatibility lessons to keep:

- State is owned by XMLUI containers, not by authored React code.
- Container state is assembled in ordered layers; local variables are checked
  before globals, so locals shadow globals with the same name.
- Global variables are inherited by child containers and non-root containers
  route global writes upward to the root.
- User-defined component/container instances isolate their local variables.
- The old reducer supports many mutation shapes and component APIs, but the
  initial rewrite only needs whole-slot writes for generated `count++`.
- The old global-variable code tracks dependencies so global changes can
  re-evaluate dependent expressions. The rewrite should preserve slot-level
  invalidation metadata now, even before the renderer becomes fine-grained.

Simplifications for the experiment:

- No `StateContainer`/`Container` class or reducer action enum.
- No immer, proxies, component APIs, `uses` boundaries, loaders, routing state,
  context variables beyond `$props`, or path-level object mutations.
- Runtime state exposes explicit read/write/subscription APIs used by generated
  expression and event functions.
