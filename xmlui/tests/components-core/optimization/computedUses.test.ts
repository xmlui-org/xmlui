import { describe, it, expect } from "vitest";
import { computeUsesForTree as originalComputeUsesForTree, COMPUTED_USES_ENABLED, IMPLICIT_CONTAINER_COMPONENT_NAMES } from
  "../../../src/components-core/optimization/computedUses";
import { collectedComponentMetadata } from "../../../src/components/collectedComponentMetadata";
import { DataLoaderMd } from "../../../src/components-core/loader/DataLoader";
import { DataSourceMd } from "../../../src/components/DataSource/DataSource";

const skipIfDisabled = !COMPUTED_USES_ENABLED;

const computeUsesForTree = (root: any) => originalComputeUsesForTree(root, (t) => {
  if (t === "DataLoader") return DataLoaderMd;
  if (t === "DataSource") return DataSourceMd;
  return (collectedComponentMetadata as any)[t];
});
import { extractScopedState } from "../../../src/components-core/rendering/ContainerUtils";
import type { ComponentDef } from "../../../src/abstractions/ComponentDefs";
import { Parser } from "../../../src/parsers/scripting/Parser";

function node(
  type: string,
  overrides: Partial<ComponentDef> = {},
): ComponentDef {
  return { type, ...overrides } as ComponentDef;
}

/**
 * Build an event handler value that mimics what the production transform
 * pipeline produces: a pre-parsed object with a `statements` array of
 * numeric-discriminator AST nodes. Use this for tests that care about
 * scope tracking (arrow-fn params, const/let declarations, etc.).
 */
function parsedEvent(source: string) {
  return { statements: new Parser(source).parseStatements() } as any;
}

describe("IMPLICIT_CONTAINER_COMPONENT_NAMES", () => {
  it("contains Select, List, Table, DataGrid", () => {
    expect(IMPLICIT_CONTAINER_COMPONENT_NAMES.has("Select")).toBe(true);
    expect(IMPLICIT_CONTAINER_COMPONENT_NAMES.has("List")).toBe(true);
    expect(IMPLICIT_CONTAINER_COMPONENT_NAMES.has("Table")).toBe(true);
    expect(IMPLICIT_CONTAINER_COMPONENT_NAMES.has("DataGrid")).toBe(true);
  });
});

describe.skipIf(skipIfDisabled)("computeUsesForTree — basic cases", () => {
  it("node without expressions: computedUses not set", () => {
    const root = node("Stack", {
      children: [node("Button", { props: { label: "Click" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toBeUndefined();
  });

  it("implicit container with children reading external var", () => {
    const root = node("Stack", {
      vars: { a: "{0}" },
      children: [node("Text", { props: { text: "{b}" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toEqual(["b"]);
  });

  it("local var does not bubble to computedUses", () => {
    const root = node("Stack", {
      vars: { x: "{0}" },
      children: [node("Text", { props: { text: "{x}" } })],
    });
    computeUsesForTree(root);
    // parentDependencies is empty → computedUses is not set (undefined), not []
    // Setting computedUses=[] would incorrectly isolate parent state for implicit containers
    expect(root.computedUses).toBeUndefined();
  });

  it("member-access: only root identifier", () => {
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      children: [node("Text", { props: { text: "{user.profile.name}" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toContain("user");
    expect(root.computedUses).not.toContain("user.profile");
    expect(root.computedUses).not.toContain("user.profile.name");
  });

  it("deep nesting: each level gets the right set", () => {
    const inner = node("Stack", {
      vars: { b: "{0}" },
      children: [node("Text", { props: { text: "{a + c}" } })],
    });
    const outer = node("Stack", {
      vars: { a: "{0}" },
      children: [inner],
    });
    computeUsesForTree(outer);
    expect(inner.computedUses).toContain("a");
    expect(inner.computedUses).toContain("c");
    expect(inner.computedUses).not.toContain("b");
    expect(outer.computedUses).not.toContain("a");
    expect(outer.computedUses).toContain("c");
  });
});

describe.skipIf(skipIfDisabled)("computeUsesForTree — DataLoader onFetch context", () => {
  it("does not bubble fetch-injected $url / $method / $queryParams as parent deps", () => {
    const root = node("Fragment", {
      vars: { x: "{0}" },
      loaders: [
        node("DataLoader", {
          uid: "ds",
          props: { id: "ds", url: "/api/x" },
          events: { fetch: "() => $url + '|' + $method + '|' + $queryParams.q" },
        }),
      ],
      children: [node("Text", { props: { value: "{x}" } })],
    });
    computeUsesForTree(root);
    // Fetch-handler identifiers must not force narrowing on `$queryParams` (router key).
    expect(root.computedUses).toBeUndefined();
  });

  it("keeps $queryParams as parent dependency if it is used in a regular property alongside fetch", () => {
    const root = node("Fragment", {
      vars: { x: "{0}" },
      loaders: [
        node("DataLoader", {
          uid: "ds",
          props: { id: "ds", url: "{$queryParams.q}" },
          events: { fetch: "() => $url + '|' + $method + '|' + $queryParams.q" },
        }),
      ],
      children: [node("Text", { props: { value: "{x}" } })],
    });
    computeUsesForTree(root);
    // Because url="{$queryParams.q}", the component genuinely depends on the router state.
    expect(root.computedUses).toContain("$queryParams");
  });
});

describe.skipIf(skipIfDisabled)("computeUsesForTree — isImplicitContainerByDefault (Mandatory Shielding)", () => {
  it("Select with children that have dependencies becomes container", () => {
    const select = node("Select", {
      children: [
        node("Items", {
          contextVars: { $item: "$item" },
          props: { data: "{rarelyChanges}" },
          children: [node("Option", { props: { value: "{$item}" } })],
        }),
      ],
    });
    computeUsesForTree(select);
    expect(select.computedUses).toBeDefined();
    expect(select.computedUses).toContain("rarelyChanges");
  });

  it("Select WITHOUT external dependencies: computedUses NOT set (no mandatory shield)", () => {
    // Mandatory Shielding was reverted because forcing a StateContainer around
    // Select with computedUses=[] hid parent vars from `extractValue` during
    // render and re-introduced the Bug 20 regression in clearable/multiSelect
    // internals. Static heavy components stay naked inside the parent.
    const select = node("Select", {
      children: [node("Option", { props: { value: "static" } })],
    });
    computeUsesForTree(select);
    expect(select.computedUses).toBeUndefined();
  });

  it("Select with child UIDs but no other read deps: NOT promoted, computedUses undefined", () => {
    // Without real read deps, the heavy component is not wrapped at all.
    // The child UID escapes naturally to the enclosing real container.
    const select = node("Select", {
      children: [node("Option", { uid: "opt1", props: { value: "1" } })],
    });
    computeUsesForTree(select);
    expect(select.computedUses).toBeUndefined();
  });

  it("HStack with dependencies: NOT promoted to container (Prevention of Accidental Promotion)", () => {
    // Non-heavy components must NOT be promoted to containers just because they
    // have dependencies. Promoting them would unnecessarily narrow their state
    // and isolate descendants from sibling APIs.
    const root = node("App", {
      vars: { x: "{0}" },
      children: [
        node("HStack", {
          props: { gap: "{x}" },
          children: [node("Text", { props: { value: "Hello" } })],
        }),
      ],
    });
    computeUsesForTree(root);
    const hstack = root.children![0];
    // HStack is not heavy, has no vars/loaders → not a container
    expect(hstack.computedUses).toBeUndefined();
  });

  it("contextVar keys are locally declared — Select promoted by real read dep", () => {
    const select = node("Select", {
      children: [
        node("Items", {
          contextVars: { $item: "$item" },
          props: { data: "{someData}" },
          children: [node("Option", { props: { value: "{$item.value}" } })],
        }),
      ],
    });
    computeUsesForTree(select);
    // Select is promoted because `someData` is a real read dep bubbled up
    // from Items. computedUses=["someData"], no $item leak.
    expect(select.computedUses).not.toContain("$item");
    expect(select.computedUses).toContain("someData");
  });

  it("explicit uses is not overwritten by computedUses", () => {
    const root = node("Stack", {
      uses: ["count"],
      children: [node("Text", { props: { text: "{name}" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toBeUndefined();
    expect(root.uses).toEqual(["count"]);
  });

  it("Table with syncWithVar string prop stays naked — string props are opaque to static analysis (Bug 26)", () => {
    // syncWithVar="syncState" is a plain string literal, not an expression.
    // The static analyzer cannot see it as a variable reference, so Table gets
    // no read deps → NOT promoted → parent's syncState remains accessible at runtime.
    // (Mandatory Shielding would have set computedUses=[], hiding syncState.)
    const root = node("Fragment", {
      vars: { syncState: "{{}}" },
      children: [
        node("Table", {
          props: { syncWithVar: "syncState", rowsSelectable: "true" },
        }),
      ],
    });
    computeUsesForTree(root);
    const table = root.children![0];
    expect(table.computedUses).toBeUndefined();
  });

  it("Table WITH a real read dep IS promoted even alongside syncWithVar (Bug 26 baseline)", () => {
    // When Table has a genuine read dep (data="{rows}"), it is promoted as before.
    // computedUses includes the read dep, not syncWithVar (which is opaque).
    const root = node("Fragment", {
      vars: { rows: "{[]}", syncState: "{{}}" },
      children: [
        node("Table", {
          props: { data: "{rows}", syncWithVar: "syncState" },
        }),
      ],
    });
    computeUsesForTree(root);
    const table = root.children![0];
    expect(table.computedUses).toBeDefined();
    expect(table.computedUses).toContain("rows");
  });

  it("Select with no read deps stays naked — clearable/multiSelect internal logic is unaffected (Bug 26)", () => {
    // Mirrors the failing test-case from Select.spec.ts that broke under Mandatory
    // Shielding: <Select clearable onDidChange="testState='changed'"> with static
    // Options. No external reads → no container → internal logic works correctly.
    const root = node("Fragment", {
      vars: { testState: "{null}" },
      children: [
        node("Select", {
          props: { clearable: "true" },
          events: { onDidChange: "testState = 'changed'" },
          children: [
            node("Option", { props: { value: "opt1", label: "first" } }),
          ],
        }),
      ],
    });
    computeUsesForTree(root);
    const select = root.children![0];
    expect(select.computedUses).toBeUndefined();
  });
});

describe.skipIf(skipIfDisabled)("computeUsesForTree — child UIDs", () => {
  it("child uid is treated as locally declared (not bubbled up)", () => {
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      children: [
        node("Select", { uid: "mySelect" }),
        node("Text", { props: { text: "{mySelect.value}" } }),
      ],
    });
    computeUsesForTree(root);
    // mySelect escapes up as an UID → locally declared → parentDependencies is empty
    // computedUses not set (undefined) rather than [] to preserve implicit container semantics
    expect(root.computedUses).toBeUndefined();
  });

  it("slot child uid is treated as locally declared (not bubbled up)", () => {
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      slots: { header: [node("Select", { uid: "mySelect" })] },
      children: [node("Text", { props: { text: "{mySelect.value}" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toBeUndefined();
  });

  it("grandchild uid through non-container intermediary is locally declared", () => {
    // VStack has no vars → NOT a container → mySelect escapes through it to Stack
    const vstack = node("VStack", {
      children: [node("Select", { uid: "mySelect" })],
    });
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      children: [
        vstack,
        node("Text", { props: { text: "{mySelect.value}" } }),
      ],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toBeUndefined();
  });

  it("grandchild uid captured by intermediate EXPLICIT container does NOT escape to ancestor", () => {
    // innerStack has explicit `uses` → IS an explicit-owner container → captures mySelect
    // (registerComponentApi writes into innerStack's state, not the parent's).
    const innerStack = node("Stack", {
      uses: ["x"],
      vars: { x: "{0}" },
      children: [node("Select", { uid: "mySelect" })],
    });
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      children: [
        innerStack,
        node("Text", { props: { text: "{mySelect.value}" } }),
      ],
    });
    computeUsesForTree(root);
    // mySelect is captured by innerStack, so root must request it from parent
    expect(root.computedUses).toContain("mySelect");
  });

  it("grandchild uid propagates through IMPLICIT intermediate container to nearest explicit owner", () => {
    // innerStack has vars but NO `uses` → IMPLICIT container at runtime: its child
    // registerComponentApi calls bubble up to the parent. So mySelect actually lives
    // in the ancestor (root) container's parent state, not in innerStack.
    const innerStack = node("Stack", {
      vars: { x: "{0}" },
      children: [node("Select", { uid: "mySelect" })],
    });
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      children: [
        innerStack,
        node("Text", { props: { text: "{mySelect.value}" } }),
      ],
    });
    computeUsesForTree(root);
    // root is ALSO implicit, so mySelect would bubble further; root's own
    // parentDependencies excludes it (treated as local by processChildList).
    // No additional deps trigger narrowing → computedUses stays undefined,
    // which means stateFromOutside = full parent state (mySelect visible).
    expect(root.computedUses).toBeUndefined();
  });

  it("grandchild uid captured by uses-container does NOT escape to ancestor", () => {
    // Fragment with explicit uses IS a StateContainer at runtime — captures child UIDs
    const innerFrag = node("Fragment", {
      uses: ["x"],
      children: [node("Select", { uid: "s1" })],
    });
    const root = node("Stack", {
      vars: { x: "{0}" },
      children: [innerFrag, node("Text", { props: { text: "{s1.value}" } })],
    });
    computeUsesForTree(root);
    // s1 is owned by innerFrag's StateContainer; root must ask its parent for it
    expect(root.computedUses).toContain("s1");
  });

  it("uid escapes through multiple non-container intermediaries (3+ levels)", () => {
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      children: [
        node("VStack", {
          children: [
            node("HStack", {
              children: [node("Select", { uid: "deepSelect" })],
            }),
          ],
        }),
        node("Text", { props: { text: "{deepSelect.value}" } }),
      ],
    });
    computeUsesForTree(root);
    // deepSelect bubbles through all non-container intermediaries → locally declared in root
    // parentDependencies is empty → computedUses undefined
    expect(root.computedUses).toBeUndefined();
  });

  it("container own uid escapes to parent container (not listed in parent computedUses)", () => {
    const inner = node("Stack", {
      uid: "innerStack",
      vars: { x: "{0}" },
    });
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      children: [
        inner,
        node("Text", { props: { text: "{innerStack.someApi}" } }),
      ],
    });
    computeUsesForTree(root);
    // innerStack registers its own API in root — root doesn't need it from parent
    // parentDependencies is empty → computedUses undefined
    expect(root.computedUses).toBeUndefined();
  });
});

describe.skipIf(skipIfDisabled)("computeUsesForTree — loaders", () => {
  it("loader uid is treated as locally declared (not bubbled up)", () => {
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      loaders: [node("DataSource", { uid: "myData" })],
      children: [node("Text", { props: { text: "{myData.items}" } })],
    });
    computeUsesForTree(root);
    // myData uid is locally declared via processChildList(loaders) → parentDependencies empty
    expect(root.computedUses).toBeUndefined();
  });
});

describe.skipIf(skipIfDisabled)("computeUsesForTree — events", () => {
  it("assignment targets (LHS) are included in computedUses (Bug 20)", () => {
    // When an event handler writes to a variable (flag = true), that variable
    // must be in computedUses so it's included in the evaluation scope.
    // We also need a read (counter) to trigger computedUses calculation.
    const root = node("Stack", {
      vars: { flag: "{false}", counter: "{0}" },
      children: [
        node("Fragment", {
          vars: { x: "{1}" },
          children: [
            node("Text", { props: { text: "{counter}" } }),
            node("Button", {
              events: { onClick: "flag = true" },
            }),
          ],
        }),
      ],
    });
    computeUsesForTree(root);
    const fragment = root.children![0];
    expect(fragment.computedUses).toContain("flag");
    expect(fragment.computedUses).toContain("counter");
  });

  it("write-only assignment does NOT promote implicit containers (Bug 20 regression fix)", () => {
    // Select is in IMPLICIT_CONTAINER_COMPONENT_NAMES, but it has only a
    // write-only target (testState) — no read deps. Promotion would wrap
    // Select in an unnecessary StateContainer that breaks its internal
    // clearable/multiSelect logic (see bugs-history.md, Bug 20).
    // Net effect: Select stays naked, the handler runs in parent scope
    // where testState is naturally accessible.
    const root = node("Stack", {
      vars: { testState: "{null}" },
      children: [
        node("Select", {
          events: { onDidChange: "testState = 'changed'" },
        }),
      ],
    });
    computeUsesForTree(root);
    const select = root.children![0];
    expect(select.computedUses).toBeUndefined();
  });

  it("identifiers in parsed event handlers are included", () => {
    const buttonWithEvent = node("Button", {
      events: {
        onClick: {
          __PARSED: true,
          statements: [
            {
              type: "ExpressionStatement",
              expr: { type: "Identifier", name: "externalVar" },
            },
          ],
        },
      },
    });
    const root = node("Stack", {
      vars: { x: "{0}" },
      children: [buttonWithEvent],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toContain("externalVar");
  });
});

describe.skipIf(skipIfDisabled)("computeUsesForTree — empty parentDependencies must NOT set computedUses", () => {
  /**
   * Regression tests for the bug where computedUses=[] was set on containers
   * with no external free vars, causing extractScopedState(state,[]) to return {}
   * and isolate implicit containers from parent state.
   *
   * Pattern that broke: <Wrapper var.x="{0}">
   *                       <Select id="mySelect"/>       ← registers API in Wrapper
   *                       <Text>{mySelect.value}</Text> ← reads API from Wrapper
   *                     </Wrapper>
   *
   * With computedUses=[], scopedParentState became {}, so mySelect.value was always "".
   */

  it("container with only local vars and uid refs: computedUses undefined (not [])", () => {
    // Select uid escapes to Stack → Stack adds it to localDeclared → parentDependencies is empty
    // Stack must NOT get computedUses=[] which would isolate it from parent state
    const root = node("Stack", {
      vars: { x: "{0}" },
      children: [
        node("Select", { uid: "mySelect" }),
        node("Text", { props: { text: "{mySelect.value}" } }),
      ],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toBeUndefined();
  });

  it("fragment without external deps wrapping Select+Text: computedUses undefined", () => {
    // Exact shape used by initTestBed wrapper: Fragment var.testState="{null}"
    // containing Select with uid and sibling Text reading that uid.
    // Before the fix this produced computedUses=[] → mySelect.value was empty.
    const root = node("Fragment", {
      vars: { testState: "{null}" },
      children: [
        node("Select", { uid: "mySelect" }),
        node("Text", { props: { text: "{mySelect.value}" } }),
      ],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toBeUndefined();
  });

  it("container with vars that are self-contained: computedUses undefined", () => {
    // All references inside are to local vars — nothing external needed
    const root = node("Stack", {
      vars: { count: "{0}", doubled: "{count * 2}" },
      children: [node("Text", { props: { text: "{doubled}" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toBeUndefined();
  });

  it("initTestBed exact markup with marker text: computedUses undefined", () => {
    // initTestBed wraps markup in:
    // <Fragment var.testState="{null}">
    //   ${source}
    //   <Stack width="0" height="0">
    //     <Text value="{ typeof testState === 'undefined' ? 'undefined' : JSON.stringify(testState) }"/>
    //   </Stack>
    // </Fragment>
    //
    // The marker Text has JSON.stringify which references the global "JSON".
    // If "JSON" is treated as a free var, Fragment gets computedUses=["JSON"],
    // extractScopedState(appRootState, ["JSON"]) = {} → stateFromOutside = {} → broken.
    const markerText = node("Text", {
      props: { value: "{ typeof testState === 'undefined' ? 'undefined' : JSON.stringify(testState) }" },
    });
    const root = node("Fragment", {
      vars: { testState: "{null}" },
      children: [
        node("Select", { uid: "mySelect" }),
        node("Text", { props: { text: "{mySelect.value}" } }),
        node("Stack", { children: [markerText] }),
      ],
    });
    computeUsesForTree(root);
    // "JSON" is a built-in global — should not pollute computedUses
    // Fragment must get computedUses undefined (not ["JSON"]) to avoid state isolation
    expect(root.computedUses).toBeUndefined();
  });

  it("only when parentDependencies has entries does computedUses get set", () => {
    // Contrast: same shape but text also reads an EXTERNAL var → computedUses set.
    // Once narrowing IS triggered, child escaping UIDs of an IMPLICIT container must
    // also be included in computedUses — at runtime those UIDs live in the parent's
    // state (registerComponentApi bubbles up through implicit containers), and a
    // narrowed parentState that omits them would isolate descendants from sibling APIs.
    const root = node("Stack", {
      vars: { x: "{0}" },
      children: [
        node("Select", { uid: "mySelect" }),
        node("Text", { props: { text: "{mySelect.value} {externalVar}" } }),
      ],
    });
    computeUsesForTree(root);
    // externalVar is not declared locally → must appear in computedUses
    expect(root.computedUses).toBeDefined();
    expect(root.computedUses).toContain("externalVar");
    // mySelect was registered into THIS implicit container's parent state via the
    // bubbled registerComponentApi, so it must also be in computedUses to survive
    // the narrowing imposed by `externalVar`.
    expect(root.computedUses).toContain("mySelect");
  });

  it("handles Symbol UIDs gracefully (does not fail on sort, excludes from final array)", () => {
    // Regression test: if a UID is a Symbol, sorting Array.from(computedUsesSet)
    // used to throw "TypeError: Cannot convert a Symbol value to a string".
    const root = node("Stack", {
      uid: Symbol("stack-uid") as any,
      vars: { x: "{0}" },
      children: [
        node("Select", {
          uid: Symbol("select-uid") as any,
          children: [
            node("Text", { props: { text: "{externalVar}" } }),
          ],
        }),
      ],
    });
    // This must not throw
    computeUsesForTree(root);
    // Select (implicit container) should have externalVar in computedUses
    const select = root.children![0];
    expect(select.computedUses).toEqual(["externalVar"]);
    // The symbol UIDs should NOT be in the computedUses array
    expect(select.computedUses).not.toContain(Symbol("select-uid"));
  });
});

describe.skipIf(skipIfDisabled)("computeUsesForTree — JS_STDLIB_GLOBALS filter", () => {
  it("ECMAScript built-ins (JSON, Math, Array) are NOT included in computedUses", () => {
    // These identifiers exist on globalThis but are never app state —
    // they must be filtered so they don't pollute computedUses.
    const root = node("Stack", {
      vars: { x: "{0}" },
      children: [
        node("Text", {
          props: { text: "{JSON.stringify(x)} {Math.max(0, x)} {Array.from(x)}" },
        }),
      ],
    });
    computeUsesForTree(root);
    // JSON, Math, Array → filtered; no external deps remain → computedUses not set
    expect(root.computedUses).toBeUndefined();
  });

  it("JS built-in mixed with real app var: only app var in computedUses", () => {
    // {JSON.stringify(rarelyChanges)} — JSON filtered, rarelyChanges stays
    const root = node("Stack", {
      vars: { x: "{0}" },
      children: [
        node("Text", {
          props: { text: "{JSON.stringify(rarelyChanges)}" },
        }),
      ],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toContain("rarelyChanges");
    expect(root.computedUses).not.toContain("JSON");
  });

  it("framework-like identifier (toast) is NOT filtered — appears in computedUses", () => {
    // Framework globals like 'toast' are resolved from localContext at runtime,
    // not from globalThis. They are NOT in JS_STDLIB_GLOBALS, so they correctly
    // appear in computedUses. This is harmless: toast is stable (never changes),
    // and since it's not in parentState, extractScopedState simply omits it without
    // breaking the scoped state for other dependencies.
    const root = node("Stack", {
      vars: { x: "{0}" },
      children: [
        node("Button", {
          events: { onClick: "{toast('hello')}" },
          props: { label: "{rarelyChanges}" },
        }),
      ],
    });
    computeUsesForTree(root);
    // toast passes through (not a JS_STDLIB_GLOBAL), rarelyChanges also passes
    expect(root.computedUses).toContain("toast");
    expect(root.computedUses).toContain("rarelyChanges");
  });

  it("legacy browser property (external, screen) is NOT filtered", () => {
    // window.external, window.screen etc. are browser-specific legacy props.
    // They could legitimately be XMLUI var names, so they must NOT be filtered.
    const root = node("Stack", {
      vars: { x: "{0}" },
      children: [node("Text", { props: { text: "{external} {screen}" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toContain("external");
    expect(root.computedUses).toContain("screen");
  });
});

// ---------------------------------------------------------------------------
// function-free child narrowing
// A container that inherits nextDisableNarrowing=true from an ancestor with
// <script>/code-behind can still be narrowed if it has no own script and
// does not call any parent-scope function.
// ---------------------------------------------------------------------------

describe.skipIf(skipIfDisabled)("computeUsesForTree — function-free child narrowing", () => {
  function nodeWithScript(
    type: string,
    scriptFunctions: Record<string, unknown>,
    overrides: Partial<ComponentDef> = {},
  ): ComponentDef {
    return node(type, {
      scriptCollected: { functions: scriptFunctions } as any,
      ...overrides,
    });
  }

  function nodeWithCodeBehind(
    type: string,
    functions: Record<string, unknown>,
    overrides: Partial<ComponentDef> = {},
  ): ComponentDef {
    return node(type, { functions: functions as any, ...overrides });
  }

  it("function-free Select inside <script> component gets computedUses", () => {
    const select = node("Select", {
      children: [
        node("Items", {
          contextVars: { $item: "$item" },
          props: { data: "{items}" },
          children: [node("Option", { props: { value: "{$item}" } })],
        }),
      ],
    });
    const parent = nodeWithScript("Stack", { handleSelect: {}, loadData: {} }, {
      children: [select],
    });
    computeUsesForTree(parent);
    // parent has own <script> → ownHasScript=true → never narrowed
    expect(parent.computedUses).toBeUndefined();
    // Select: no function call, only reads {items} → safeToNarrow=true
    expect(select.computedUses).toBeDefined();
    expect(select.computedUses).toContain("items");
    expect(select.computedUses).not.toContain("handleSelect");
    expect(select.computedUses).not.toContain("loadData");
  });

  it("node with own <script> is NOT narrowed even if it reads parent state without calling functions", () => {
    // inner has its own <script> — its function bodies may read parent vars not in template
    const inner = nodeWithScript("Stack", { localFn: {} }, {
      children: [node("Text", { props: { text: "{items}" } })],
    });
    const outer = node("Stack", {
      vars: { items: "{[]}" },
      children: [inner],
    });
    computeUsesForTree(outer);
    // inner reads {items} from outer and doesn't call outer functions,
    // but it HAS OWN script → ownHasScript=true → safeToNarrow=false
    expect(inner.computedUses).toBeUndefined();
  });

  it("container calling a parent function is NOT narrowed", () => {
    // Stack with var.x references handleSelect in its props → dependsOnParentFunction=true
    const containerCallingFn = node("Stack", {
      vars: { x: "{0}" },
      props: { label: "{handleSelect()}" },
    });
    const parent = nodeWithScript("Stack", { handleSelect: {} }, {
      children: [containerCallingFn],
    });
    computeUsesForTree(parent);
    expect(containerCallingFn.computedUses).toBeUndefined();
  });

  it("mixed siblings: function-free Select narrowed, function-calling container not narrowed", () => {
    const select = node("Select", {
      children: [
        node("Items", {
          contextVars: { $item: "$item" },
          props: { data: "{items}" },
          children: [node("Option", { props: { value: "{$item}" } })],
        }),
      ],
    });
    const containerCallingFn = node("Stack", {
      vars: { x: "{0}" },
      props: { label: "{handleSelect()}" },
    });
    const parent = nodeWithScript("Stack", { handleSelect: {} }, {
      children: [select, containerCallingFn],
    });
    computeUsesForTree(parent);
    // Select: function-free → narrowed
    expect(select.computedUses).toBeDefined();
    expect(select.computedUses).toContain("items");
    // containerCallingFn: calls handleSelect → not narrowed
    expect(containerCallingFn.computedUses).toBeUndefined();
  });

  it("function-free Select inside .xs code-behind component gets computedUses", () => {
    const select = node("Select", {
      children: [
        node("Items", {
          contextVars: { $item: "$item" },
          props: { data: "{items}" },
          children: [node("Option", { props: { value: "{$item}" } })],
        }),
      ],
    });
    const parent = nodeWithCodeBehind("Stack", { handleSelect: {} }, {
      children: [select],
    });
    computeUsesForTree(parent);
    // parent has own code-behind → never narrowed
    expect(parent.computedUses).toBeUndefined();
    // Select: function-free → narrowed (same as <script> case)
    expect(select.computedUses).toBeDefined();
    expect(select.computedUses).toContain("items");
  });

  it("Select narrowed when nextDisableNarrowing inherited through non-container intermediary", () => {
    // nextDisableNarrowing=true set by grandparent with <script>, passes through
    // VStack (non-container) to Select — Select should still get computedUses
    const select = node("Select", {
      children: [
        node("Items", {
          contextVars: { $item: "$item" },
          props: { data: "{rarelyChanges}" },
          children: [node("Option", { props: { value: "{$item}" } })],
        }),
      ],
    });
    const vstack = node("VStack", { children: [select] });
    const parent = nodeWithScript("Stack", { handleSelect: {} }, {
      children: [vstack],
    });
    computeUsesForTree(parent);
    expect(select.computedUses).toBeDefined();
    expect(select.computedUses).toContain("rarelyChanges");
  });
});

// ---------------------------------------------------------------------------
// expression sources: api, when, responsiveWhen, loader props
// These fields are scanned by depsOfRecord/depsOfValue in computeUsesInternal.
// ---------------------------------------------------------------------------

describe.skipIf(skipIfDisabled)("computeUsesForTree — expression sources (api, when, responsiveWhen, loaders)", () => {
  it("api property expressions contribute to parentDependencies", () => {
    const root = node("Stack", {
      vars: { local: "{0}" },
      children: [
        node("Select", {
          uid: "mySelect",
          api: { currentValue: "{externalVar}" } as any,
        }),
      ],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toContain("externalVar");
  });

  it("when condition contributes to parentDependencies", () => {
    const root = node("Stack", {
      vars: { local: "{0}" },
      children: [
        node("Text", {
          when: "{isAdmin}",
          props: { text: "Admin" },
        }),
      ],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toContain("isAdmin");
  });

  it("boolean when=true does not contribute to parentDependencies", () => {
    const root = node("Stack", {
      vars: { local: "{0}" },
      children: [node("Text", { when: true, props: { text: "{externalVar}" } })],
    });
    computeUsesForTree(root);
    // boolean when is skipped by typeof check; externalVar still captured from props
    expect(root.computedUses).toContain("externalVar");
    expect(root.computedUses).not.toContain("true");
  });

  it("responsiveWhen values contribute to parentDependencies", () => {
    const root = node("Stack", {
      vars: { local: "{0}" },
      children: [
        node("Panel", {
          responsiveWhen: { desktop: "{showPanel}", mobile: "{showPanelMobile}" } as any,
        }),
      ],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toContain("showPanel");
    expect(root.computedUses).toContain("showPanelMobile");
  });

  it("loader props expressions contribute to container computedUses", () => {
    const root = node("Stack", {
      vars: { local: "{0}" },
      loaders: [
        node("DataSource", {
          uid: "ds",
          props: { url: "{apiEndpoint}" },
        }),
      ],
      children: [node("Text", { props: { text: "{ds.items}" } })],
    });
    computeUsesForTree(root);
    // apiEndpoint is used in loader — must appear in computedUses
    expect(root.computedUses).toContain("apiEndpoint");
    // root is implicit (vars but no `uses`) → ds registers into root's PARENT state
    // at runtime, so once narrowing is triggered ds must also be in computedUses.
    expect(root.computedUses).toContain("ds");
  });
});

// ---------------------------------------------------------------------------
// function-free child narrowing — additional edge cases
// ---------------------------------------------------------------------------

describe.skipIf(skipIfDisabled)("computeUsesForTree — function-free narrowing edge cases", () => {
  it("nodeFunctionNames merges scriptCollected.functions and node.functions", () => {
    // A parent with BOTH sources: calling either one blocks narrowing for that child
    const callerOfScriptFn = node("Stack", {
      vars: { x: "{0}" },
      props: { label: "{fromScript()}" },
    });
    const callerOfCodeBehindFn = node("Stack", {
      vars: { y: "{0}" },
      props: { label: "{fromCodeBehind()}" },
    });
    const select = node("Select", {
      children: [
        node("Items", {
          contextVars: { $item: "$item" },
          props: { data: "{items}" },
          children: [node("Option", { props: { value: "{$item}" } })],
        }),
      ],
    });
    const parent = node("Stack", {
      scriptCollected: { functions: { fromScript: {} } } as any,
      functions: { fromCodeBehind: {} } as any,
      children: [callerOfScriptFn, callerOfCodeBehindFn, select],
    });
    computeUsesForTree(parent);
    // Both function names recognized as parent functions → callers blocked
    expect(callerOfScriptFn.computedUses).toBeUndefined();
    expect(callerOfCodeBehindFn.computedUses).toBeUndefined();
    // Select reads only {items} — neither fromScript nor fromCodeBehind in deps
    expect(select.computedUses).toBeDefined();
    expect(select.computedUses).toContain("items");
  });

  it("scriptCollected without .functions: ownHasScript=true blocks node, children have no parent functions → all narrowed", () => {
    // scriptCollected is truthy (so ownHasScript=true) but carries no function names
    // → parentFunctionNames={} for children → dependsOnParentFunction=false for all
    const select = node("Select", {
      children: [
        node("Items", {
          contextVars: { $item: "$item" },
          props: { data: "{items}" },
          children: [node("Option", { props: { value: "{$item}" } })],
        }),
      ],
    });
    const parent = node("Stack", {
      scriptCollected: { vars: { localVar: 0 } } as any,
      children: [select],
    });
    computeUsesForTree(parent);
    // parent has own script → not narrowed itself
    expect(parent.computedUses).toBeUndefined();
    // select: no functions in scope → narrowed
    expect(select.computedUses).toBeDefined();
    expect(select.computedUses).toContain("items");
  });

  it("nested script containers: childFunctionNames resets at each container boundary", () => {
    // outer declares fn1, inner declares fn2
    // select inside inner sees only fn2 as parentFunctionNames, not fn1
    const select = node("Select", {
      children: [
        node("Items", {
          contextVars: { $item: "$item" },
          props: { data: "{items}" },
          children: [node("Option", { props: { value: "{$item}" } })],
        }),
      ],
    });
    const callerOfFn2 = node("Stack", {
      vars: { z: "{0}" },
      props: { label: "{fn2()}" },
    });
    const inner = node("Stack", {
      scriptCollected: { functions: { fn2: {} } } as any,
      children: [select, callerOfFn2],
    });
    const outer = node("Stack", {
      scriptCollected: { functions: { fn1: {} } } as any,
      children: [inner],
    });
    computeUsesForTree(outer);
    // inner: own script → not narrowed
    expect(inner.computedUses).toBeUndefined();
    // select: reads {items}, fn2 ∉ deps → safeToNarrow=true → narrowed
    expect(select.computedUses).toBeDefined();
    expect(select.computedUses).toContain("items");
    // callerOfFn2: calls fn2 which is in parentFunctionNames → blocked
    expect(callerOfFn2.computedUses).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// computeUsesForTree + extractScopedState — integration (standalone
// extractScopedState behavior is covered in ContainerUtils.test.ts)
// ---------------------------------------------------------------------------

describe.skipIf(skipIfDisabled)("computeUsesForTree + extractScopedState — end-to-end narrowing", () => { // eslint-disable-line
  it("no external deps → computedUses undefined → full parent state passes through", () => {
    // computedUses must not be set to [] when parentDependencies is empty —
    // that would isolate the container from all parent state.
    const stack = node("Stack", {
      vars: { a: "{0}" },
      children: [node("Text", { props: { text: "{a}" } })],
    });
    computeUsesForTree(stack);
    expect(stack.computedUses).toBeUndefined();
    const parentState = { a: 5, b: 99 };
    expect(extractScopedState(parentState, stack.computedUses)).toBe(parentState);
  });

  it("external dep in computedUses passes through; unlisted dep does not", () => {
    const stack = node("Stack", {
      vars: { local: "{0}" },
      children: [
        node("Text", { props: { text: "{external}" } }),
        node("Text", { props: { text: "{local}" } }),
      ],
    });
    computeUsesForTree(stack);
    expect(stack.computedUses).toContain("external");
    const parentState = { external: 42, irrelevant: 99 };
    const scoped = extractScopedState(parentState, stack.computedUses);
    expect(scoped).toHaveProperty("external", 42);
    expect(scoped).not.toHaveProperty("irrelevant");
  });
});

// ---------------------------------------------------------------------------
// isRuntimeContextVar filter — Баг 17 regression
//
// Most runtime context vars ($param, $item, $row, $data, $this, $checked,
// etc.) are injected by the framework at render time via the contextVars
// mechanism.  They do NOT exist as keys in the parent StateContainer's state
// map.  Including them in computedUses causes extractScopedState to return {},
// breaking the component.
//
// Router state vars ($pathname, $routeParams, $queryParams, $linkInfo) DO live
// in parent state (Layer 6 — useRoutingParams) and must NOT be filtered.
//
// PARENT_STATE_DYNAMIC_VARS ($context, …) are set via component dispatch into
// the parent container's reducer (e.g. ContextMenu.openAt → updateState →
// implicit dispatch → App state).  They DO live in parent state and must NOT
// be filtered — containers need them in computedUses so they re-render when
// the value changes.
// ---------------------------------------------------------------------------

describe.skipIf(skipIfDisabled)("computeUsesForTree — isRuntimeContextVar filter (Баг 17)", () => {
  it("$param in child expression does NOT appear in computedUses", () => {
    // Regression: ModalDialog-like pattern — $param injected by .open() at runtime.
    // Before the fix: computedUses=['$param'] → extractScopedState returns {} → dialog broken.
    const container = node("Container", {
      vars: { title: "{'Hello'}" },
      children: [node("Text", { props: { text: "{$param.msg}" } })],
    });
    computeUsesForTree(container);
    expect(container.computedUses).toBeUndefined();
  });

  it("$param does not appear even when mixed with a real parent-state dependency", () => {
    // Real var 'title' must be in computedUses; $param must be excluded.
    // Use Select (implicit container) so the node becomes a container when it has free deps.
    const outer = node("Stack", {
      vars: { title: "{'Hello'}" },
      children: [
        node("Select", {
          children: [
            node("Text", { props: { text: "{$param.msg} — {title}" } }),
          ],
        }),
      ],
    });
    computeUsesForTree(outer);
    const select = outer.children![0];
    // Select: parentDependencies={'title'} ($param filtered) → implicit container → computedUses=['title']
    expect(select.computedUses).toContain("title");
    expect(select.computedUses).not.toContain("$param");
  });

  it.each([
    "$params", "$item", "$itemIndex",
    "$row", "$rowIndex", "$rowKey",
    "$data", "$this",
    "$checked", "$setChecked",
  ])("%s is filtered out of computedUses (render-time contextVar, not in parent state)", (runtimeVar) => {
    const container = node("Container", {
      vars: { x: "{0}" },
      children: [node("Text", { props: { text: `{${runtimeVar}}` } })],
    });
    computeUsesForTree(container);
    // Only x is a real parent dep; runtimeVar must be excluded.
    expect(container.computedUses ?? []).not.toContain(runtimeVar);
  });

  it("$context IS kept in computedUses when mixed with real deps (parent-state dynamic var)", () => {
    // $context lives in parent state (dispatched by ContextMenu.openAt → implicit container →
    // App reducer). Containers that read BOTH $context AND real parent-state deps must include
    // $context in computedUses so they re-render when openAt is called.
    const outer = node("Stack", {
      vars: { lastAction: "''" },
      children: [
        node("Select", {
          children: [node("Text", { props: { text: "{$context.name} — {lastAction}" } })],
        }),
      ],
    });
    computeUsesForTree(outer);
    const select = outer.children![0];
    // $context is NOT filtered → parentDependencies includes it → computedUses includes $context
    expect(select.computedUses).toContain("$context");
    expect(select.computedUses).toContain("lastAction");
  });

  it("$context alone does NOT promote a heavy component (dynamic vars are not promotion triggers)", () => {
    // $context lives in PARENT_STATE_DYNAMIC_VARS — it is filtered from
    // nonDynamicReadDeps so it cannot by itself drive implicit-container
    // promotion. With Mandatory Shielding reverted, Select with only a
    // $context dep stays naked. Bug 19's narrowing-when-only-$context
    // failure mode (computedUses=["$context"] making stateFromOutside={})
    // is therefore avoided automatically.
    const select = node("Select", {
      children: [node("Text", { props: { text: "{$context.name}" } })],
    });
    computeUsesForTree(select);
    expect(select.computedUses).toBeUndefined();
  });

  it("$context does NOT cascade to grandparent (container stops propagation)", () => {
    // ContextMenu-like pattern: ContextMenu is a container whose children use $context.
    // $context should be in ContextMenu's computedUses (so it re-renders after openAt).
    // But $context must NOT propagate to the outer Stack's parentDeps — otherwise
    // Stack gets computedUses=['$context'] → stateFromOutside={} → Stack loses parent state.
    //
    // Note: The real ContextMenu node from the XMLUI parser does NOT have static
    // contextVars — the parser does not inject metadata contextVars into the node.
    // So $context is NOT in ContextMenu's localDeclared, which is why it ends up in
    // ContextMenu's parentDependencies and then in computedUses.
    const outer = node("Stack", {
      vars: { lastAction: "''" },
      children: [
        node("Select", {
          // No contextVars — simulates a ContextMenu-like container where $context
          // is set via implicit dispatch, not via static node.contextVars.
          vars: { placeholder: "'select'" },
          children: [
            node("Text", { props: { text: "{$context.name} — {lastAction}" } }),
          ],
        }),
      ],
    });
    computeUsesForTree(outer);
    const ctxMenuLike = outer.children![0];
    // Container gets computedUses with $context (has lastAction as other dep)
    expect(ctxMenuLike.computedUses).toContain("$context");
    expect(ctxMenuLike.computedUses).toContain("lastAction");
    // Stack gets NO computedUses — $context must NOT have cascaded to Stack's deps
    expect(outer.computedUses).toBeUndefined();
  });

  it.each([
    "$pathname", "$routeParams", "$queryParams", "$linkInfo",
  ])("router state var %s IS kept in computedUses (genuine parent-state key)", (routerVar) => {
    // Router vars live in parent state (Layer 6 — useRoutingParams) — they must survive the filter.
    // Use Select (implicit container): it becomes a container when it has non-empty parentDependencies.
    const select = node("Select", {
      children: [node("Text", { props: { text: `{${routerVar}}` } })],
    });
    computeUsesForTree(select);
    // $pathname etc. are NOT filtered by isRuntimeContextVar → parentDependencies={routerVar}
    // → isImplicitDefault=true → computedUses=[routerVar]
    expect(select.computedUses).toContain(routerVar);
  });

  it("$param does not make an implicit container out of a non-container node", () => {
    // Select is in IMPLICIT_CONTAINER_COMPONENT_NAMES.
    // Before fix: $param would leak → parentDependencies={'$param'} (non-empty) →
    // isImplicitDefault=true → Select gets computedUses=['$param'] → extractScopedState={}.
    // After fix: $param is filtered → parentDependencies={} → isImplicitDefault=false.
    const select = node("Select", {
      children: [
        node("Items", {
          props: { data: "{items}" },
          children: [node("Option", { props: { value: "{$param.id}" } })],
        }),
      ],
    });
    computeUsesForTree(select);
    // $param excluded → parentDependencies has only 'items' (from Items.data) which
    // belongs to Items, not Select. Select itself has no free vars after filtering.
    expect(select.computedUses ?? []).not.toContain("$param");
  });
});

// ---------------------------------------------------------------------------
// Regression tests for Bug 22: arrow-function parameters used as the object of
// a method call (`param.method(...)`) must NOT leak into computedUses.
//
// Before fix: T_FUNCTION_INVOCATION_EXPRESSION pushed `caller.obj.name` without
// consulting `getIdentifierScope`. Block-local identifiers like arrow-fn
// parameters bubbled up as free vars, causing wrong narrowing on ancestors.
// ---------------------------------------------------------------------------

describe.skipIf(skipIfDisabled)("computeUsesForTree — Бaг 22: arrow-fn parameter scope in method calls", () => {
  it("arrow-fn parameter used as method-call receiver does NOT leak as dep", () => {
    // <Stack var.userOptions><DataSource onLoaded="(departments) => userOptions = departments.map(...)" />
    // `departments` is the arrow parameter; `userOptions` is local to Stack.
    // Before fix: T_FUNCTION_INVOCATION_EXPRESSION pushed `departments` (the caller of
    // `.map(...)`) without scope check → `departments` bubbled to Stack.computedUses.
    const root = node("Stack", {
      vars: { userOptions: "{[]}" },
      children: [
        node("DataSource", {
          events: {
            loaded: parsedEvent(
              "(departments) => { userOptions = departments.map(d => ({ id: d.id })); }",
            ),
          },
        }),
      ],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toBeUndefined();
  });

  it("non-arrow function invocation on a parent identifier still bubbles up", () => {
    // Sanity check for the symmetric case: when the caller is NOT block-local,
    // the dep MUST still be tracked.
    const root = node("Stack", {
      vars: { x: "{0}" },
      children: [
        node("Button", {
          events: { click: parsedEvent("userOptions.push(1)") },
        }),
      ],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toContain("userOptions");
  });

  it("nested arrow parameters do not leak through chained method calls", () => {
    // Mirrors the actual Group E case:
    //   (departments) => { users.map(user => { const d = departments.find(x => x.id === user.id); }); }
    // `departments`, `user`, `d`, `x` are all block-local — only `users` should bubble up.
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      children: [
        node("DataSource", {
          events: {
            loaded: parsedEvent(
              "(departments) => { users.map(user => { const d = departments.find(x => x.id === user.id); return d; }); }",
            ),
          },
        }),
      ],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toEqual(["users"]);
  });

  it("const/let-declared identifier used as method-call receiver does NOT leak", () => {
    // Same scope-respect rule for block-scoped const/let, not just arrow params.
    // The handler also reads parent-state `external` so we exercise the read path
    // (which is what drives container narrowing — write-only targets are excluded
    // by design, see Bug 20).
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      children: [
        node("Button", {
          events: {
            click: parsedEvent(
              "const arr = [1, 2, 3]; const filtered = arr.filter(n => n > external);",
            ),
          },
        }),
      ],
    });
    computeUsesForTree(root);
    // `arr`, `filtered`, `n` are local; only `external` (a free read from parent state)
    // bubbles up. The Bug 22 fix ensures `arr` (receiver of `.filter(...)`) is filtered.
    expect(root.computedUses).not.toContain("arr");
    expect(root.computedUses).toContain("external");
  });

  it("implicit container with other deps does NOT exclude child UIDs from computedUses (Implicit UID Propagation Bug)", () => {
    // Fragment has vars but no `uses` → implicit container at runtime.
    // It has an external dependency on `toast`, which triggers computedUses calculation.
    // It also contains `mySelect` which registers its API in the parent's state
    // (bubbles through the implicit Fragment).
    //
    // Before the fix: child escaping UIDs were incorrectly seen as "locally owned"
    // by ANY container, so they were filtered out of computedUses.
    // Result: computedUses=["toast"] → extractScopedState(parentState, ["toast"])
    // removed `mySelect` from the scoped state → Button crashed.
    const root = node("Stack", {
      vars: { x: "{0}" },
      children: [
        node("Fragment", {
          vars: { testState: "{null}" },
          children: [
            node("Select", { uid: "mySelect" }),
            node("Button", {
              events: { onClick: "toast.error(mySelect.value)" },
            }),
          ],
        }),
      ],
    });
    computeUsesForTree(root);
    const fragment = root.children![0];
    expect(fragment.computedUses).toBeDefined();
    expect(fragment.computedUses).toContain("toast");
    // mySelect must be included in computedUses even though it's not "external"
    // (it registers in the parent), otherwise the narrowed parent state for
    // Fragment would exclude it.
    expect(fragment.computedUses).toContain("mySelect");
  });
});

// ---------------------------------------------------------------------------
// Regression tests for Бaг 24: CompoundComponent runtime restructure must
// invalidate the compound body's stale `computedUses`.
//
// Static analysis runs on the compound body BEFORE CompoundComponent
// moves `vars`/`loaders`/`functions`/`scriptCollected` out to a freshly
// created outer Container. While vars live inside the body they are
// `localDeclared` and correctly EXCLUDED from `computedUses`. After the
// runtime move, those vars are EXTERNAL to the body (they live in the new
// outer Container), so the body's pre-computed `computedUses` is now
// semantically stale: it filters those vars out of `parentState` when
// `extractScopedState` narrows.
//
// The fix: CompoundComponent's destructure strips `computedUses` from
// `rest` (the rest spread that becomes the outer Container's child). See
// the destructure block in xmlui/src/components-core/CompoundComponent.tsx.
//
// Full chain documented in specs/computed-uses-specification.md (Бaг 24).
// The exposing e2e regression lives in tests-e2e/compound-component.spec.ts
// ("var initialized with $queryParams ..."), and the broad e2e regression
// for the computedUses feature is section 7 of
// tests-e2e/computed-uses.spec.ts.
// ---------------------------------------------------------------------------

describe.skipIf(skipIfDisabled)("computeUsesForTree — Бaг 24: stale computedUses after CompoundComponent restructure", () => {
  it("static analysis: compound body's computedUses excludes its own vars (correct in isolation)", () => {
    // The compound body as the parser/builder produces it,
    // BEFORE CompoundComponent runtime restructures it.
    const compoundBody = node("Fragment", {
      vars: {
        selectedFilter:
          "{$queryParams.filter ? $queryParams.filter : 'all'}",
      },
      children: [
        node("Text", { props: { value: "{selectedFilter}" } as any }),
      ],
    });

    computeUsesForTree(compoundBody);

    // The container declares selectedFilter locally, so it MUST NOT appear in
    // computedUses (computedUses lists names that must come from the parent).
    // $queryParams comes from outside (routing state), so it MUST appear.
    expect(compoundBody.computedUses).toBeDefined();
    expect(compoundBody.computedUses).toContain("$queryParams");
    expect(compoundBody.computedUses).not.toContain("selectedFilter");
  });

  it("OLD broken destructure (no strip) leaks stale computedUses into `rest` — documents the bug shape", () => {
    // This test pins the PRE-FIX behavior: if CompoundComponent destructured
    // WITHOUT stripping `computedUses`, the spread carries the now-stale array
    // into `rest`. That stale array later drives `extractScopedState` and
    // filters out the just-hoisted vars (see test 4 below).
    //
    // The current fix lives in xmlui/src/components-core/CompoundComponent.tsx
    // and is verified end-to-end by tests-e2e/computed-uses.spec.ts section 7
    // and tests-e2e/compound-component.spec.ts:722,759.
    const compoundBody: any = node("Fragment", {
      vars: {
        selectedFilter:
          "{$queryParams.filter ? $queryParams.filter : 'all'}",
      },
      children: [
        node("Text", { props: { value: "{selectedFilter}" } as any }),
      ],
    });
    computeUsesForTree(compoundBody);

    // OLD shape: destructure WITHOUT pulling `computedUses` out — what
    // CompoundComponent used to do before the fix.
    const {
      loaders: _loaders,
      vars: _vars,
      functions: _functions,
      scriptError: _scriptError,
      ...restOldShape
    } = compoundBody;

    // The stale array survives the spread and ends up on `rest`. This is the
    // mechanism behind Бaг 24.
    expect((restOldShape as any).computedUses).toEqual(["$queryParams"]);
    expect((restOldShape as any).computedUses).not.toContain("selectedFilter");

    // FIXED shape: destructure DOES pull `computedUses` out — `rest` no longer
    // carries the stale array, so downstream narrowing falls back to the outer
    // Container's full state.
    const {
      loaders: _l2,
      vars: _v2,
      functions: _f2,
      scriptError: _s2,
      computedUses: _staleComputedUses,
      ...restFixedShape
    } = compoundBody;
    expect((restFixedShape as any).computedUses).toBeUndefined();
  });

  it("integration: with the fix, `rest` sees selectedFilter from the outer Container's state", () => {
    // The outer Container's combinedState that runtime passes to `rest` as
    // parentState contains selectedFilter (resolved from vars), routing state,
    // and any narrowed parent slice CompoundComponent decided to expose.
    const outerCombinedState = {
      selectedFilter: "hello",
      $queryParams: { filter: "hello" },
      $pathname: "/filtered",
    };

    // Simulate the post-fix `rest`: no `uses`, no `computedUses` →
    // extractScopedState returns full parent state.
    const rest: any = { type: "Fragment" };
    const scoped = extractScopedState(
      outerCombinedState,
      rest.uses ?? rest.computedUses,
    );

    expect(scoped).toBeDefined();
    expect(scoped).toEqual(outerCombinedState);
    expect((scoped as any).selectedFilter).toBe("hello");
  });

  it("regression guard: simulating the OLD broken behaviour (stale computedUses present) drops selectedFilter", () => {
    // Locks in why stripping `computedUses` from the destructure is required.
    // Without the strip, the stale array filters out the var that the outer
    // Container has just hoisted, and the inner Text reads `undefined`.
    const outerCombinedState = {
      selectedFilter: "hello",
      $queryParams: { filter: "hello" },
    };

    const restWithStaleComputedUses: any = {
      type: "Fragment",
      computedUses: ["$queryParams"], // ← stale: excludes selectedFilter
    };

    const scoped = extractScopedState(
      outerCombinedState,
      restWithStaleComputedUses.uses ?? restWithStaleComputedUses.computedUses,
    );

    expect(scoped).toBeDefined();
    expect((scoped as any).$queryParams).toEqual({ filter: "hello" });
    // selectedFilter is dropped — this is the bug we fixed.
    expect((scoped as any).selectedFilter).toBeUndefined();
  });
});

describe.skipIf(skipIfDisabled)("lexical scoping — Iteration 1 fallback", () => {
  it("U1.6: node without injectedVars metadata keeps $queryParams as a parent dep", () => {
    const root = node("Fragment", {
      vars: { x: "{0}" },
      children: [
        node("CustomLoader", {
          events: { fetch: "() => $queryParams.q" },
        }),
      ],
    });
    computeUsesForTree(root);
    // Since CustomLoader has no metadata (and isn't DataLoader/DataSource),
    // $queryParams is NOT filtered and bubbles up to Fragment.
    expect(root.computedUses).toContain("$queryParams");
  });
});

describe.skipIf(skipIfDisabled)("lexical scoping — Iteration 1 events", () => {
  afterEach(() => {
    delete (collectedComponentMetadata as any)["ExtensionLoader"];
  });

  it("U1.2: a custom extension loader with metadata.events.fetch.injectedVars filters $queryParams", () => {
    (collectedComponentMetadata as any)["ExtensionLoader"] = {
      events: {
        fetch: {
          description: "test",
          injectedVars: ["$queryParams"],
        },
      },
    };

    const root = node("Fragment", {
      vars: { someVar: "1" },
      children: [
        node("ExtensionLoader", {
          events: { fetch: "() => $queryParams.q + tableQ" },
        }),
      ],
    });

    computeUsesForTree(root);

    expect(root.computedUses).toBeDefined();
    expect(root.computedUses).not.toContain("$queryParams");
    expect(root.computedUses).toContain("tableQ");
  });
});
