import type {
  ArrayDestructure,
  Destructure,
  ObjectDestructure,
  VarDeclaration,
} from "../script-runner/ScriptingSourceTree";
import { assertJsIdentifier } from "./identifiers";

/**
 * Flattening a destructuring pattern into name/path pairs.
 *
 * Both targets need this and neither should own it. `event-async` grew the implementation
 * first, which is why a destructured parameter compiled in a handler and was a hard error
 * in a binding — the same pattern, two answers, depending on where it appeared. Sharing
 * the collectors is what stops that drifting again.
 *
 * The result is a flat list: `({ a, b: { c } }) => …` becomes `[["a", ["a"]], ["c", ["b",
 * "c"]]]`, which the runtime walks to pull each value out of the argument.
 */
export type DestructureSpec = [name: string, path: Array<string | number>];

export function collectDestructureSpecs(
  declaration: Pick<VarDeclaration | Destructure, "aDestr" | "oDestr">,
  sourceId: string,
): DestructureSpec[] {
  if (declaration.aDestr) {
    return collectArrayDestructureSpecs(declaration.aDestr, [], sourceId);
  }
  if (declaration.oDestr) {
    return collectObjectDestructureSpecs(declaration.oDestr, [], sourceId);
  }
  return [];
}

export function collectArrayDestructureSpecs(
  destructure: ArrayDestructure[],
  path: Array<string | number>,
  sourceId: string,
): DestructureSpec[] {
  return destructure.flatMap((item, index) => {
    const itemPath = [...path, index];
    if (item.id) {
      assertJsIdentifier({ name: item.id }, sourceId);
      return [[item.id, itemPath] satisfies DestructureSpec];
    }
    if (item.aDestr) return collectArrayDestructureSpecs(item.aDestr, itemPath, sourceId);
    if (item.oDestr) return collectObjectDestructureSpecs(item.oDestr, itemPath, sourceId);
    return [];
  });
}

export function collectObjectDestructureSpecs(
  destructure: ObjectDestructure[],
  path: Array<string | number>,
  sourceId: string,
): DestructureSpec[] {
  return destructure.flatMap((item) => {
    const itemPath = [...path, item.id];
    if (item.aDestr) return collectArrayDestructureSpecs(item.aDestr, itemPath, sourceId);
    if (item.oDestr) return collectObjectDestructureSpecs(item.oDestr, itemPath, sourceId);
    const name = item.alias ?? item.id;
    assertJsIdentifier({ name }, sourceId);
    return [[name, itemPath] satisfies DestructureSpec];
  });
}

/** Pulls each destructured value out of an argument, following its path. */
export function destructureValue(
  value: any,
  specs: Array<[string, Array<string | number>]>,
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [name, path] of specs) {
    let current = value;
    for (const member of path) {
      current = current?.[member];
    }
    result[name] = current;
  }
  return result;
}
