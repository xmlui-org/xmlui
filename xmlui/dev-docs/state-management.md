# State Management

> Managing a particular *xmlui app's state* (regarding the app's functionality) differs from managing the *rendering engine's state* though the app's state management leverages the engine's. This article discusses the latter.

## Containers

In xmlui, the rendering engine uses hierarchical containers to manage the app's rendering state and refresh the UI according to state changes. The container hierarchy is bound to the markup hierarchy; several components in the markup are wrapped into a container.

> **Note**: When the engine runs, it does not work with the markup; it uses a pre-compiled internal representation, which is structurally equivalent to the markup.

Whenever the state of a particular component changes, it triggers the refresh of the associated UI, namely, the container-wrapped component and its entire child hierarchy. Thus, for example, if the topmost state container changes, the entire app's UI gets refreshed.

A container is a black box with the following traits:
- It stores the entire state of its wrapped markup (with the wrapped node and all of its children recursively).
- The state stored within the container is closed from its external context (an outermost container cannot directly see what's inside a nested container).
- The components within a particular component can see the entire state.
- Parent containers may (and do) flow down the public part of their state to their child containers.


## Updating Component State

_TBT_