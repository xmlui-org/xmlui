import { afterEach, describe, expect, it } from "vitest";

import {
  clearFocusScopesForTests,
  popFocusScope,
  pushFocusScope,
  topFocusScope,
} from "../../../src/component-core/accessibility";

describe("focusScopeStack", () => {
  afterEach(() => clearFocusScopesForTests());

  it("tracks nested focus scopes in stack order", () => {
    const outer = {} as HTMLElement;
    const inner = {} as HTMLElement;

    const outerId = pushFocusScope(outer);
    const innerId = pushFocusScope(inner);

    expect(topFocusScope()?.element).toBe(inner);
    expect(popFocusScope(innerId)?.element).toBe(inner);
    expect(topFocusScope()?.element).toBe(outer);
    expect(popFocusScope(outerId)?.element).toBe(outer);
    expect(topFocusScope()).toBeUndefined();
  });
});
