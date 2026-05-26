# TODO: Lazy State Cloning in Event Handlers (Proxy)

## Context
Current implementation uses `cloneDeep` for state creation during events in the `computedUses` optimization algorithm. 

## Problem 
On heavy pages or when dealing with particularly large states, this full deep cloning takes noticeable time, causing potential delays or jitter during fast interactions (such as rapid typing, dragging, or window resizing) where events fire frequently.

## Proposed Solution
Introduce a `Proxy` object with a *Copy-on-Write* (CoW) strategy.

Instead of fully duplicating the state upfront:
1. Wrap the current active state in a Proxy.
2. Read operations simply pass through to the original state with virtually zero cost.
3. Write operations are intercepted. Upon the first write to any node, that specific node (and its ancestors to preserve immutability) is shallow-cloned, creating a new reference only where data changes.

This defers the cost of cloning entirely to the exact moment of modification, and limits it only to the strictly affected branches of the state tree. On read-heavy event handlers, the cloning overhead becomes fundamentally zero.
