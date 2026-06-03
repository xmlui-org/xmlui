import { collectedComponentMetadata } from "../../components/collectedComponentMetadata";
import { coreComponentMetadata } from "../coreComponentMetadata";
import { UNSTABLE_GLOBAL_VARS } from "./unstableGlobalVars";

// XMLUI_GLOBAL_NAMES lives in the factory — the single source of truth.
// Re-exported here so the optimizer (computedUses) has a stable import path.
export { XMLUI_GLOBAL_NAMES } from "./appContextFactory";

// Re-export so existing callers can still import UNSTABLE_GLOBAL_VARS from here.
export { UNSTABLE_GLOBAL_VARS } from "./unstableGlobalVars";

const ALL_METADATA = { ...collectedComponentMetadata, ...coreComponentMetadata };

for (const meta of Object.values(ALL_METADATA)) {
  const unstableVars = (meta as any)?.unstableChildInjectedVars;
  if (unstableVars) {
    for (const v of unstableVars) {
      UNSTABLE_GLOBAL_VARS.add(v);
    }
  }
}
