# Rendering Pipeline Old Architecture Notes

Old XMLUI references:

- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/rendering/renderChild.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/rendering/ComponentWrapper.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/CompoundComponent.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/optimization/computedUses.ts`

Compatibility lessons to keep:

- Rendering is runtime-owned and recursive. The compiler prepares structured
  component definitions; runtime code decides how to instantiate and render
  nodes.
- `renderChild` is the central indirection that lets components render
  children while preserving parent render context.
- `ComponentWrapper` protects render boundaries and uses dependency metadata to
  avoid rerendering subtrees for unrelated state changes.
- `CompoundComponent` instantiates user-defined component bodies with evaluated
  props and a parent render context.
- `computedUses` is the old dependency-narrowing idea. The rewrite should use
  compiler/codegen dependency metadata and runtime state slot subscriptions
  instead of proxy reads.

Simplifications for the experiment:

- No provider stack beyond the React root and tiny XMLUI runtime context.
- No behavior chain, theming, layout context, slots, `when`, loaders, component
  APIs, or old container wrappers.
- Built-ins are limited to `App`, `H1`, and `Button`.
- User-defined components instantiate their body with isolated local state and
  parent-evaluated props.
