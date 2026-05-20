import { afterEach, describe, expect, it } from "vitest";
import {
  clearFocusScopesForTests,
  popFocusScope,
  pushFocusScope,
  topFocusScope,
} from "../../../src/components-core/accessibility";

describe("focusScopeStack", () => {
  afterEach(() => clearFocusScopesForTests());

  it("tracks nested scopes in stack order", () => {
    const outer = document.createElement("div");
    const inner = document.createElement("div");
    const outerId = pushFocusScope(outer);
    const innerId = pushFocusScope(inner);

    expect(topFocusScope()?.element).toBe(inner);
    expect(popFocusScope(innerId)?.element).toBe(inner);
    expect(topFocusScope()?.element).toBe(outer);
    expect(popFocusScope(outerId)?.element).toBe(outer);
    expect(topFocusScope()).toBeUndefined();
  });
});
