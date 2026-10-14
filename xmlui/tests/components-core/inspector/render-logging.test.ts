import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  RENDER_PASS_KIND,
  RenderPassTracker,
  buildCauses,
  changedKeys,
  groupFolded,
  keyLabel,
  type RenderPassSnapshot,
} from "../../../src/components-core/inspector/render-logging";
import { pushXsLog } from "../../../src/components-core/inspector/inspectorUtils";
import { ContainerActionKind } from "../../../src/components-core/rendering/containers";

function snapshot(partial: Partial<RenderPassSnapshot> = {}): RenderPassSnapshot {
  return { props: {}, componentState: {}, version: 0, ...partial };
}

const noKinds = () => ({ uidKinds: new Map(), uidFields: new Map() });

describe("render-logging", () => {
  let originalWindow: any;

  beforeEach(() => {
    originalWindow = (globalThis as any).window;
    (globalThis as any).window = { _xsLogs: [] };
  });

  afterEach(() => {
    if (originalWindow) (globalThis as any).window = originalWindow;
    else delete (globalThis as any).window;
  });

  const logs = () => (globalThis as any).window._xsLogs as any[];

  describe("changedKeys", () => {
    it("reports string and symbol keys whose values differ by identity", () => {
      const s = Symbol("ds");
      const obj = {};
      expect(
        changedKeys({ a: 1, b: obj, [s]: 1 }, { a: 2, b: obj, [s]: 2, c: 3 }).sort((x, y) =>
          String(x).localeCompare(String(y)),
        ),
      ).toEqual(["a", "c", s].sort((x, y) => String(x).localeCompare(String(y))));
    });

    it("returns nothing for the same object", () => {
      const o = { a: 1 };
      expect(changedKeys(o, o)).toEqual([]);
    });

    it("labels anonymous symbols", () => {
      expect(keyLabel(Symbol())).toBe("<anonymous>");
      expect(keyLabel(Symbol("x"))).toBe("x");
    });
  });

  describe("buildCauses", () => {
    it("reports a mount on the first pass", () => {
      expect(buildCauses({ prev: undefined, next: snapshot(), isUdc: false, ...noKinds() })).toEqual(
        [{ kind: "mount" }],
      );
    });

    it("names own var keys as state", () => {
      const causes = buildCauses({
        prev: snapshot({ componentState: { n: 1 } }),
        next: snapshot({ componentState: { n: 2 } }),
        isUdc: false,
        ...noKinds(),
      });
      expect(causes).toEqual([{ kind: "state", keys: ["n"] }]);
    });

    it("separates loader state from component state by the kind seen at dispatch", () => {
      const ds = Symbol("ds");
      const player = Symbol("takePlayer");
      const uidKinds = new Map<symbol, any>([
        [ds, "loader"],
        [player, "componentState"],
      ]);
      const uidFields = new Map([[player, new Set(["currentTime"])]]);
      const causes = buildCauses({
        prev: snapshot({ componentState: { [ds]: {}, [player]: {} } }),
        next: snapshot({ componentState: { [ds]: { value: 1 }, [player]: { currentTime: 2 } } }),
        isUdc: false,
        uidKinds,
        uidFields,
      });
      // --- Fields come from diffing the uid's entries (ds: value; takePlayer: currentTime)
      expect(causes).toEqual([
        { kind: "loader", uid: "ds", fields: ["value"] },
        { kind: "componentState", uid: "takePlayer", fields: ["currentTime"] },
      ]);
    });

    it("names changed UDC props and flags a function prop with the same source", () => {
      const sources = { onPick: { tree: "() => 1" }, label: "{x}" };
      const prev = snapshot({
        props: { node: { vars: { $props: { onPick: () => 1, label: "a" } } } },
        propSources: sources,
      });
      const next = snapshot({
        props: { node: { vars: { $props: { onPick: () => 1, label: "b" } } } },
        propSources: { ...sources },
      });
      expect(buildCauses({ prev, next, isUdc: true, ...noKinds() })).toEqual([
        { kind: "props", names: ["onPick", "label"], sameSourceNewIdentity: ["onPick"] },
      ]);
    });

    it("reports a parent pass-through with the parent's pass id and changed keys", () => {
      const causes = buildCauses({
        prev: snapshot({ props: { parentState: { n: 1, k: 1 } } }),
        next: snapshot({ props: { parentState: { n: 2, k: 1 } } }),
        isUdc: false,
        parentPassId: 7,
        ...noKinds(),
      });
      expect(causes).toEqual([{ kind: "parent", passId: 7, inputs: ["parentState"], keys: ["n"] }]);
    });

    it("reports only what changed in the raw state and API map (#3942 gate 4)", () => {
      // --- Regression: diffing the merged state-with-APIs reported every key,
      // --- because the merge rebuilds each entry. The raw inputs keep identity.
      const ds = Symbol("ds");
      const tab = Symbol("annotTab");
      const player = Symbol("takePlayer");
      const dsState = { value: [1] };
      const tabApi = { nudge: () => {} };
      const prevState = { item: 1, cuts: [], [ds]: dsState, [player]: { ended: false } };
      const nextState = { ...prevState, [player]: { ended: true } };
      const causes = buildCauses({
        prev: snapshot({ componentState: prevState, componentApis: { [tab]: tabApi } }),
        next: snapshot({ componentState: nextState, componentApis: { [tab]: { ...tabApi } } }),
        isUdc: false,
        uidKinds: new Map<symbol, any>([[ds, "loader"]]),
        uidFields: new Map([
          [player, new Set(["ended"])],
          [tab, new Set(["nudgeInProgress"])],
        ]),
      });
      expect(causes).toEqual([
        { kind: "componentState", uid: "takePlayer", fields: ["ended"] },
        // --- An equal-valued copy: flagged, with the field recorded at dispatch
        { kind: "componentState", uid: "annotTab", fields: ["nudgeInProgress"], identityOnly: true },
      ]);
    });

    it("says unknown rather than guessing when nothing differs", () => {
      const s = snapshot();
      expect(buildCauses({ prev: s, next: snapshot(), isUdc: false, ...noKinds() })).toEqual([
        { kind: "unknown" },
      ]);
    });
  });

  describe("groupFolded", () => {
    it("groups folded containers by component and cause, sampling uids", () => {
      const cause = [{ kind: "parent" as const, inputs: ["parentState"] }];
      const entries = Array.from({ length: 7 }, (_, i) => ({
        component: "HStack",
        uid: `row${i}`,
        cause,
      }));
      const groups = groupFolded([...entries, { component: "Text", cause: [{ kind: "mount" }] }]);
      expect(groups).toEqual([
        { component: "HStack", cause, count: 7, uids: ["row0", "row1", "row2", "row3", "row4"] },
        { component: "Text", cause: [{ kind: "mount" }], count: 1 },
      ]);
    });
  });

  describe("RenderPassTracker", () => {
    const info = (component: string, extra: any = {}) => ({
      component,
      isUdc: false,
      isImplicit: false,
      ...extra,
    });

    it("emits one entry per pass with duration, cause and parent link", () => {
      const parent = new RenderPassTracker(info("App", { uid: "root" }));
      const child = new RenderPassTracker(info("Heavy", { isUdc: true }));

      parent.beginRender(null);
      parent.observe(snapshot());
      child.beginRender(parent.handle);
      child.observe(snapshot());
      child.commit();
      parent.commit();

      const [childEntry, parentEntry] = logs();
      expect(parentEntry.kind).toBe(RENDER_PASS_KIND);
      expect(parentEntry.component).toBe("App");
      expect(parentEntry.cause).toEqual([{ kind: "mount" }]);
      expect(parentEntry.parentPassId).toBeUndefined();
      expect(childEntry.parentPassId).toBe(parentEntry.passId);
      expect(childEntry.udc).toBe(true);
      expect(typeof childEntry.startMs).toBe("number");
      expect(childEntry.durationMs).toBeGreaterThanOrEqual(0);
    });

    it("folds an implicit container into its rendering ancestor", () => {
      const parent = new RenderPassTracker(info("App"));
      const row = new RenderPassTracker(info("HStack", { isImplicit: true }));

      parent.beginRender(null);
      parent.observe(snapshot());
      row.beginRender(parent.handle);
      row.observe(snapshot());
      row.commit();
      parent.commit();

      expect(logs()).toHaveLength(1);
      expect(logs()[0].implicitContainers).toBe(1);
      expect(logs()[0].folded).toEqual([{ component: "HStack", cause: [{ kind: "mount" }], count: 1 }]);
    });

    it("emits an implicit container's own pass when no ancestor is rendering", () => {
      const row = new RenderPassTracker(info("HStack", { isImplicit: true }));
      row.beginRender(null);
      row.observe(snapshot());
      row.commit();
      expect(logs()[0]).toMatchObject({ component: "HStack", implicit: true });
    });

    it("takes the trace id from the dispatch, not from render time", () => {
      const w = (globalThis as any).window;
      const tracker = new RenderPassTracker(info("Clock"));
      tracker.beginRender(null);
      tracker.observe(snapshot({ componentState: { count: 0 } }));
      tracker.commit();

      w._xsCurrentTrace = "t-handler";
      tracker.noteDispatch({ type: ContainerActionKind.STATE_PART_CHANGED, payload: {} });
      w._xsCurrentTrace = undefined; // the handler's trace has ended before React renders

      tracker.beginRender(null);
      tracker.observe(snapshot({ componentState: { count: 1 } }));
      tracker.commit();

      expect(logs()[1]).toMatchObject({ traceId: "t-handler", cause: [{ kind: "state", keys: ["count"] }] });
    });
  });

  describe("RenderPassTracker, changes landing after a pass has read its cause", () => {
    it("carries a dispatch from a descendant's layout effect to the next pass (#3942 gate 5)", () => {
      // --- Regression: fields and trace id were cleared at commit, which runs after
      // --- the descendants' layout effects, so a change dispatched there was lost.
      const w = (globalThis as any).window;
      const ds = Symbol("callouts");
      const tracker = new RenderPassTracker({ component: "AnnotateTab", isUdc: true, isImplicit: false });
      tracker.beginRender(null);
      tracker.observe(snapshot({ componentState: { [ds]: { inProgress: false } } }));

      // --- A child's layout effect dispatches before this container commits
      w._xsCurrentTrace = "t-refresh";
      tracker.noteDispatch({
        type: ContainerActionKind.LOADER_IN_PROGRESS_CHANGED,
        payload: { uid: ds, inProgress: true },
      });
      w._xsCurrentTrace = undefined;
      tracker.commit();

      tracker.beginRender(null);
      tracker.observe(snapshot({ componentState: { [ds]: { inProgress: true } } }));
      tracker.commit();

      expect(logs()[1]).toMatchObject({
        traceId: "t-refresh",
        cause: [{ kind: "loader", uid: "callouts", fields: ["inProgress"] }],
      });
    });
  });

  describe("pushXsLog buffer size", () => {
    it("defaults to the configured size published by AppContent", () => {
      const w = (globalThis as any).window;
      w._xsLogMax = 500;
      for (let i = 0; i < 300; i++) pushXsLog({ ts: i, kind: "test" });
      expect(logs()).toHaveLength(300);
    });

    it("falls back to 200 when no size is published", () => {
      for (let i = 0; i < 300; i++) pushXsLog({ ts: i, kind: "test" });
      expect(logs()).toHaveLength(200);
    });
  });
});
