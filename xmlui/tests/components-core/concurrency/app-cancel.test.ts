/**
 * Plan #06 Phase 1 Step 1.2 — `App.cancel()` global tests.
 *
 * Verifies that `appCancel()` routes through the default
 * `HandlerCoordinator` and aborts running invocations with
 * `reason:"user"`. Coordinator-internal semantics are covered in
 * `coordinator.test.ts`; here we only test the public `App.cancel`
 * surface and its scoping rules.
 */

import { describe, it, expect, afterEach } from "vitest";
import { appCancel } from "../../../src/components-core/appContext/app-utils";
import {
  getDefaultHandlerCoordinator,
  __resetDefaultCoordinatorForTests,
} from "../../../src/components-core/concurrency";
import type { HandlerInvocation } from "../../../src/components-core/concurrency/policy";

function inv(
  componentUid: string,
  eventName: string,
  policy: HandlerInvocation["policy"] = "single-flight",
): HandlerInvocation {
  return { componentUid, eventName, policy };
}

afterEach(() => {
  __resetDefaultCoordinatorForTests();
});

describe("App.cancel — global handler cancellation", () => {
  it("aborts every running non-parallel handler when called with no args", async () => {
    const c = getDefaultHandlerCoordinator();
    const a = await c.enter(inv("u1", "click"));
    const b = await c.enter(inv("u2", "click"));
    expect(a.token.aborted).toBe(false);
    expect(b.token.aborted).toBe(false);
    appCancel();
    expect(a.token.aborted).toBe(true);
    expect(b.token.aborted).toBe(true);
    expect(a.token.reason).toBe("user");
    expect(b.token.reason).toBe("user");
  });

  it("scopes cancellation to a single componentUid", async () => {
    const c = getDefaultHandlerCoordinator();
    const a = await c.enter(inv("u1", "click"));
    const b = await c.enter(inv("u2", "click"));
    appCancel("u1");
    expect(a.token.aborted).toBe(true);
    expect(b.token.aborted).toBe(false);
  });

  it("scopes cancellation to (componentUid, eventName)", async () => {
    const c = getDefaultHandlerCoordinator();
    const a = await c.enter(inv("u1", "click"));
    const b = await c.enter(inv("u1", "submit"));
    appCancel("u1", "submit");
    expect(a.token.aborted).toBe(false);
    expect(b.token.aborted).toBe(true);
  });

  it("does not affect parallel handlers (coordinator does not track them)", async () => {
    const c = getDefaultHandlerCoordinator();
    const a = await c.enter(inv("u1", "click", "parallel"));
    appCancel();
    expect(a.token.aborted).toBe(false);
  });
});
