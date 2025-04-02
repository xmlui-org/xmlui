# Component Review Checklist

We intend to use this checklist when reviewing components.

1. Do we need (and use) the component (so it's not to be removed)?
  - Every planned feature of the component is implemented?
  - Are the any features that do not provide value (we remove them)?
2. Component structure and naming
  - Component uses a proper name
  - Component property and event names are straightforward
  - Exposed APIs are straightforward
  - Context value names (like $item) are straightforward
  - We expose all significant properties that we may need to work with the component
  - We expose all significant events that we may need to work with the component
3. Component theming
  - Theme variable names comply with theme variable name conventions
  - There are no obvious theme properties missing
  - Non-trivial (component-specific) theme properties have metadata
  - The component documentation's style section is helpful, it adds value (if not, we remove it)
4. Component API
  - The component's API contains useful methods and properties. We can use them to execute some action that cannot be done otherwise.
  - We can trigger most (all) important actions that we would need for a particular component (such as scrolling to the bottom of a List)
5. Context values
  - The component exposes all significant values for its nested components
  - All context values are described in the metadata
6. Documentation
  - The documentation has a "usage" section where the usage of the component can be easily understood through properties, events, etc.
  - The relevant properties, events, APIs, and context values are documented with examples.
  - Only those are documented with examples where the usage is not obvious. (e.g. the autoFocus prop can be easily deduced from the name)
7. Anything we do not like in the component implementations?
  - Bad practice regarding the code
  - The overall idea of the component's implementation is faulty and we should re-evaluate? (e.g. our component is way too complex but there is an alternative package to use or copy its code)
8. Code structure
  - Is the native React component separated from the xmlui component?
  - Is the styling separated from the xmlui component?
  - Does the component have proper documentation in the metadata and in the accompanying document?
  - Can we identify a recurring feature in the component that can be moved to a separate file? (e.g. mouse interactions, being clickable, input handling, etc.)
9. Testing
  - Can we test the typical usage patterns of the component through unit tests/e2e tests?
  - Can we test the styling of the component with e2e tests?
  - Do we miss any important aspect of testing the component?
10. Accessibility
  - Is the component accessible according to WCAG guidelines? ([see accessibility article](./accessibility.md))
