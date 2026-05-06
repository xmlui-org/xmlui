---
"xmlui": patch
---

Fix script functions not callable from event handlers when the script contains template literals.

Functions defined in a `<script>` block were silently not hoisted to the parent component when the script contained template literal interpolations (e.g. `` `${n}` ``). This caused calls like `onClick="loop(100)"` to fail with no error when `loop` used a template literal in its body.

Root cause: `hoistScriptCollectedFromFragments` used `child.script?.includes("$")` to detect context-variable references (e.g. `$item`), but this check incorrectly matched `${...}` inside template literals. The fix narrows the check to `/\$[a-zA-Z_]/`, which matches `$identifier` patterns only.
