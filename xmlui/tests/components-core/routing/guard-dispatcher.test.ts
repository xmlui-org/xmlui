import { describe, expect, it } from "vitest";

import { guardAllows, guardRedirect, runGuard } from "../../../src/components-core/routing";

describe("routing guard dispatcher", () => {
  const to = { pathname: "/admin", routeParams: {}, search: "", trigger: "navigate" as const };

  it("allows missing guards", async () => {
    await expect(runGuard(undefined, to, null)).resolves.toEqual({ allow: true });
  });

  it("normalizes false as a denial", async () => {
    const result = await runGuard(() => false, to, null);
    expect(guardAllows(result)).toBe(false);
  });

  it("extracts redirect targets", async () => {
    const result = await runGuard(() => ({ allow: false, redirect: "/login" }), to, null);
    expect(guardAllows(result)).toBe(false);
    expect(guardRedirect(result)).toBe("/login");
  });
});
