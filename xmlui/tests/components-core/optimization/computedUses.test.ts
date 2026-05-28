import { describe, it, expect, afterEach } from "vitest";
import { computeUsesForTree as originalComputeUsesForTree, COMPUTED_USES_ENABLED } from
  "../../../src/components-core/optimization/computedUses";
import { collectedComponentMetadata } from "../../../src/components/collectedComponentMetadata";
import { DataSourceMd } from "../../../src/components/DataSource/DataSource";
import { getOptimizerMetadata } from "../../../src/components-core/optimization/metadataLookup";
import { extractScopedState } from "../../../src/components-core/rendering/ContainerUtils";
import type { ComponentDef } from "../../../src/abstractions/ComponentDefs";
import { Parser } from "../../../src/parsers/scripting/Parser";
import { collectCodeBehindFromSource } from "../../../src/parsers/scripting/code-behind-collect";

const skipIfDisabled = !COMPUTED_USES_ENABLED;

const computeUsesForTree = (root: any) => originalComputeUsesForTree(root, (t) => {
  if (t === "DataSource") return DataSourceMd;
  if (t === "ScopedContainer") {
    return {
      childInjectedVars: ["$item", "$index"],
    };
  }
  if (t === "ScopedEvent") {
    return {
      events: {
        click: { injectedVars: ["$event"] },
      },
    };
  }
  return getOptimizerMetadata(t);
});

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
  it("contains Select, List, Table", () => {
    expect((collectedComponentMetadata as any).Select.isImplicitContainerByDefault).toBe(true);
    expect((collectedComponentMetadata as any).List.isImplicitContainerByDefault).toBe(true);
    expect((collectedComponentMetadata as any).Table.isImplicitContainerByDefault).toBe(true);
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

  it("framework global (toast) IS filtered — does NOT appear in computedUses", () => {
    // toast is wired into every expression scope by appContextValue (see AppContent.tsx).
    // It is resolved from localContext at runtime and is NEVER stored in parent UI state,
    // so it must not contribute to parentDependencies.
    // After the XMLUI_GLOBAL_NAMES filter, toast is excluded; only rarelyChanges remains.
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
    // toast is filtered by XMLUI_GLOBAL_NAMES; rarelyChanges stays
    expect(root.computedUses).not.toContain("toast");
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
// XMLUI_GLOBAL_NAMES filter (framework globals leak proposal)
// Framework globals (Actions, toast, navigate, App, Log, ...) are wired into
// every expression scope via appContextValue and must not be treated as
// external parent-state dependencies.
// ---------------------------------------------------------------------------

describe.skipIf(skipIfDisabled)(
  "computeUsesForTree — XMLUI_GLOBAL_NAMES filter (framework globals leak proposal)",
  () => {
    it("Actions.* in onChange does NOT appear in computedUses for Select", () => {
      // Proposal headline scenario: <Select onChange="Actions.callApi('save')" />
      // `Actions` is a framework global — filtered. It must NOT appear in computedUses.
      // Note: Select's own uid still appears because it must register its API in the
      // parent container (needed for sibling refs like {mySelect.value}).
      const root = node("Stack", {
        vars: { x: "{0}" },
        children: [
          node("Select", {
            uid: "mySelect",
            events: { onChange: "Actions.callApi('save')" },
          }),
        ],
      });
      computeUsesForTree(root);
      const select = root.children![0];
      // Actions is a framework global — must be absent from computedUses.
      expect(select.computedUses ?? []).not.toContain("Actions");
    });

    it("Actions.* in onChange on uid-less Select does NOT promote it to a StateContainer", () => {
      // Without a uid, Select has no reason to become a container — its only
      // identifier (Actions) is a framework global and is filtered out.
      const root = node("Stack", {
        vars: { x: "{0}" },
        children: [
          node("Select", {
            // no uid
            events: { onChange: "Actions.callApi('save')" },
          }),
        ],
      });
      computeUsesForTree(root);
      const select = root.children![0];
      // No real parent deps, no uid → no computedUses assigned.
      expect(select.computedUses).toBeUndefined();
    });

    it("toast in onClick does NOT appear in computedUses alongside real var", () => {
      // toast is a framework global injected via localContext (see XMLUI_GLOBAL_NAMES).
      // It is resolved from localContext at runtime and is NEVER stored in parent UI
      // state, so it must NOT appear in `parentDependencies`.
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
      const button = root.children![0];
      // toast is filtered, rarelyChanges remains
      expect(button.computedUses ?? []).not.toContain("toast");
    });

    it("toast filtered but real var still drives implicit-container promotion for Select", () => {
      // Select is isImplicitContainerByDefault. After filtering toast, only the real
      // var `rarelyChanges` remains — it is still enough to produce computedUses.
      const root = node("Stack", {
        vars: { x: "{0}" },
        children: [
          node("Select", {
            uid: "selWithToast",
            events: { onClick: "{toast('hi')}" },
            props: { initialValue: "{rarelyChanges}" },
          }),
        ],
      });
      computeUsesForTree(root);
      const sel = root.children![0];
      expect(sel.computedUses).toContain("rarelyChanges");
      expect(sel.computedUses).not.toContain("toast");
    });

    it("navigate in prop does NOT appear in computedUses", () => {
      const root = node("Stack", {
        vars: { x: "{0}" },
        children: [
          node("Button", {
            events: { onClick: "{navigate('/home')}" },
          }),
        ],
      });
      computeUsesForTree(root);
      expect(root.computedUses ?? []).not.toContain("navigate");
    });

    it("App.fetch in expression does NOT appear in computedUses", () => {
      const root = node("Stack", {
        vars: { x: "{0}" },
        children: [
          node("Button", {
            events: { onClick: "{App.fetch('/api')}" },
          }),
        ],
      });
      computeUsesForTree(root);
      expect(root.computedUses ?? []).not.toContain("App");
    });

    it("Log in expression does NOT appear in computedUses", () => {
      const root = node("Stack", {
        vars: { x: "{0}" },
        children: [
          node("Text", {
            props: { text: "{Log.info('test')}" },
          }),
        ],
      });
      computeUsesForTree(root);
      expect(root.computedUses ?? []).not.toContain("Log");
    });
  },
);

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
    // parent functions are analyzed (empty bodies → no extra deps) so parent
    // is now narrowed based on actual child deps rather than blanket disabled.
    expect(parent.computedUses).toBeDefined();
    expect(parent.computedUses).toContain("items");
    // Select: no function call, only reads {items} → safeToNarrow=true
    expect(select.computedUses).toBeDefined();
    expect(select.computedUses).toContain("items");
    expect(select.computedUses).not.toContain("handleSelect");
    expect(select.computedUses).not.toContain("loadData");
  });

  it("node with own <script> IS narrowed when its functions are analyzable", () => {
    // inner has its own <script> with analyzable functions (empty bodies here).
    // After analysis no extra deps are discovered, but child Text reads {items}
    // which bubbles up → inner is narrowed to ["items"].
    const inner = nodeWithScript("Stack", { localFn: {} }, {
      children: [node("Text", { props: { text: "{items}" } })],
    });
    const outer = node("Stack", {
      vars: { items: "{[]}" },
      children: [inner],
    });
    computeUsesForTree(outer);
    // inner functions analyzed → dep set complete → safeToNarrow=true
    expect(inner.computedUses).toBeDefined();
    expect(inner.computedUses).toContain("items");
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
    // parent .xs functions analyzed (empty bodies → no extra deps) → narrowed
    expect(parent.computedUses).toBeDefined();
    expect(parent.computedUses).toContain("items");
    // Select: function-free → also narrowed
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

  it("scriptCollected with only vars: parent is narrowed, children with no parent functions are also narrowed", () => {
    // scriptCollected carries only vars (no functions) and no hasInvalidStatements
    // → no function names registered → parentFunctionNames={} for children
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
    // parent: vars analyzed (0 has no deps) → dep set complete → narrowed
    expect(parent.computedUses).toBeDefined();
    expect(parent.computedUses).toContain("items");
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
    // inner: fn2 analyzed (empty body → no extra deps) → narrowed based on child deps
    expect(inner.computedUses).toBeDefined();
    expect(inner.computedUses).toContain("items");
    // select: reads {items}, fn2 ∉ deps → safeToNarrow=true → narrowed
    expect(select.computedUses).toBeDefined();
    expect(select.computedUses).toContain("items");
    // callerOfFn2: calls fn2 which is in parentFunctionNames → blocked
    expect(callerOfFn2.computedUses).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Transitive AST analysis of .xs / <script> functions
// Tests for the feature described in TODO-ast-analysis-xs-files.md:
// code-behind functions are analyzed to determine actual parent-scope deps,
// replacing the old blanket "disable narrowing for any script node" approach.
// ---------------------------------------------------------------------------

describe.skipIf(skipIfDisabled)("computeUsesForTree — transitive code-behind function analysis", () => {
  it("code-behind function reading parent state: node narrowed to actual dep", () => {
    // handleClick reads and writes `count` from parent scope.
    // After analysis the node must be narrowed to contain `count`.
    const { functions: { handleClick } } = collectCodeBehindFromSource(
      "test.xs",
      "function handleClick() { count = count + 1; }",
    );
    const comp = node("Stack", {
      vars: { x: "{0}" },
      functions: { handleClick } as any,
    });
    const root = node("Stack", {
      vars: { count: "{0}", unrelated: "{0}" },
      children: [comp],
    });
    computeUsesForTree(root);
    expect(comp.computedUses).toBeDefined();
    expect(comp.computedUses).toContain("count");
    expect(comp.computedUses).not.toContain("unrelated");
    // function names must not appear as deps (they are locally declared)
    expect(comp.computedUses).not.toContain("handleClick");
  });

  it("transitive call: callHelper → doWork → items; only items in computedUses", () => {
    // callHelper calls doWork which reads `items`.
    // collectScriptFunctionDeps must follow the call chain and surface `items`.
    const { functions: { doWork, callHelper } } = collectCodeBehindFromSource(
      "test.xs",
      [
        "function doWork() { return items.length; }",
        "function callHelper() { doWork(); }",
      ].join("\n"),
    );
    const comp = node("Stack", {
      vars: { x: "{0}" },
      functions: { doWork, callHelper } as any,
    });
    const root = node("Stack", {
      vars: { items: "{[]}", unrelated: "{0}" },
      children: [comp],
    });
    computeUsesForTree(root);
    expect(comp.computedUses).toBeDefined();
    expect(comp.computedUses).toContain("items");
    expect(comp.computedUses).not.toContain("unrelated");
    expect(comp.computedUses).not.toContain("doWork");
    expect(comp.computedUses).not.toContain("callHelper");
  });

  it("mutually recursive functions do not cause infinite recursion", () => {
    // a calls b, b calls a and reads `count`. DFS visited-set must break the cycle.
    const { functions: { a, b } } = collectCodeBehindFromSource(
      "test.xs",
      [
        "function a() { return b() + 1; }",
        "function b() { return a() + count; }",
      ].join("\n"),
    );
    const comp = node("Stack", {
      vars: { x: "{0}" },
      functions: { a, b } as any,
    });
    const root = node("Stack", {
      vars: { count: "{0}" },
      children: [comp],
    });
    // Must not throw or hang.
    expect(() => computeUsesForTree(root)).not.toThrow();
    expect(comp.computedUses).toBeDefined();
    expect(comp.computedUses).toContain("count");
  });

  it("scriptCollected.vars initial-value deps are analyzed", () => {
    // localCount = sharedCount + 1 — initializer references sharedCount from parent.
    const { vars } = collectCodeBehindFromSource(
      "test.xs",
      "var localCount = sharedCount + 1;",
    );
    const comp = node("Stack", {
      scriptCollected: { vars } as any,
    });
    const root = node("Stack", {
      vars: { sharedCount: "{0}", unrelated: "{0}" },
      children: [comp],
    });
    computeUsesForTree(root);
    expect(comp.computedUses).toBeDefined();
    expect(comp.computedUses).toContain("sharedCount");
    expect(comp.computedUses).not.toContain("unrelated");
    expect(comp.computedUses).not.toContain("localCount");
  });

  it("hasInvalidStatements=true: node is NOT narrowed (dep set incomplete)", () => {
    // When the script parser could not handle all statements, we cannot know
    // the complete dep set → conservatively block narrowing for this node.
    const comp = node("Stack", {
      vars: { x: "{0}" },
      scriptCollected: {
        functions: {},
        hasInvalidStatements: true,
      } as any,
      children: [node("Text", { props: { text: "{externalVar}" } })],
    });
    const root = node("Stack", {
      vars: { externalVar: "{0}" },
      children: [comp],
    });
    computeUsesForTree(root);
    expect(comp.computedUses).toBeUndefined();
  });

  // myworkdrive pattern: FileVersionsDrawer.handleRestore reads a parent UID +
  // calls imported self-contained functions (publishEvent reads global `events`,
  // customConfirm calls window.customConfirmDelegate). The component must still
  // be narrowed to its REAL parent dependency and must NOT be isolated from it
  // by the presence of browser/global identifiers (window resolves via globalThis;
  // Globals.xs vars resolve via the global-vars layer — both bypass narrowing).
  it("code-behind calling imported self-contained fns (window + global) still narrows to real parent dep", () => {
    // Imported, self-contained helpers (mirror shared.xs): no refs to the
    // importing component's own parent state — only window + a global var.
    const { functions: imported } = collectCodeBehindFromSource(
      "shared.xs",
      [
        "function publishEvent(topic, data) { events[topic] = { v: 1, data: data }; }",
        "function customConfirm(title) { return window.customConfirmDelegate({ title: title }); }",
      ].join("\n"),
    );
    // Direct code-behind: reads a real parent var (selectedPath) and calls the
    // imported helpers.
    const { functions: codeBehind } = collectCodeBehindFromSource(
      "FileVersionsDrawer.xmlui.xs",
      [
        "function handleRestore() {",
        "  const ok = customConfirm('Restore?');",
        "  if (!ok) return;",
        "  Actions.callApi({ url: selectedPath });",
        "  publishEvent('FilesPage:refresh');",
        "}",
      ].join("\n"),
    );
    const comp = node("Stack", {
      scriptCollected: { functions: imported } as any,
      functions: codeBehind as any,
    });
    const root = node("Stack", {
      vars: { selectedPath: "{''}", unrelated: "{0}" },
      children: [comp],
    });
    computeUsesForTree(root);
    // The component is narrowed (analysis is complete) ...
    expect(comp.computedUses).toBeDefined();
    // ... and the REAL parent dependency is captured → not isolated.
    expect(comp.computedUses).toContain("selectedPath");
    // Unrelated parent state is correctly excluded.
    expect(comp.computedUses).not.toContain("unrelated");
    // Imported/local function names are not deps (they are locally declared).
    expect(comp.computedUses).not.toContain("publishEvent");
    expect(comp.computedUses).not.toContain("customConfirm");
    expect(comp.computedUses).not.toContain("handleRestore");
    // Actions (framework global) is filtered by XMLUI_GLOBAL_NAMES.
    expect(comp.computedUses).not.toContain("Actions");
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
// Lexical scoping — runtime context vars in child scope (Bug 17 regression)
//
// Most runtime context vars ($param, $item, $row, $data, $this, $checked,
// etc.) are injected by the framework into child templates via the
// childInjectedVars metadata field.  Because they are declared in
// injectedVarsScope they are excluded from computedUses — they are NOT keys
// in the parent StateContainer's state map.
//
// Router state vars ($pathname, $routeParams, $queryParams, $linkInfo) DO live
// in parent state (Layer 6 — useRoutingParams) and must NOT be filtered.
//
// $context is set via component dispatch into the parent container's reducer
// (e.g. ContextMenu.openAt → updateState → implicit dispatch → App state).
// It IS a genuine parent-state key and must appear in computedUses when read.
// It is NOT listed in any built-in component's childInjectedVars, so it flows
// through the optimizer as a regular parent dependency.
// ---------------------------------------------------------------------------

describe.skipIf(skipIfDisabled)("computeUsesForTree — lexical scoping: runtime context vars in child scope (Bug 17 regression)", () => {
  it("$param in child expression does NOT appear in computedUses", () => {
    // Regression: ModalDialog-like pattern — $param injected by .open() at runtime.
    // Fixed in Iteration 2: metadata.childInjectedVars must include $param.
    const container = node("ModalDialog", {
      vars: { title: "{'Hello'}" },
      children: [node("Text", { props: { text: "{$param.msg}" } })],
    });
    computeUsesForTree(container);
    expect(container.computedUses).toBeUndefined();
  });

  it("$param does not appear even when mixed with a real parent-state dependency", () => {
    // Real var 'title' must be in computedUses; $param must be excluded.
    const outer = node("ModalDialog", {
      vars: { title: "{'Hello'}" },
      children: [
        node("Select", {
          vars: { x: "1" }, // make it a container
          children: [
            node("Text", { props: { text: "{$param.msg} — {title}" } }),
          ],
        }),
      ],
    });
    computeUsesForTree(outer);
    const select = outer.children![0];
    // $param is filtered by ModalDialog scope → only title remains.
    expect(select.computedUses).toEqual(["title"]);
  });

  it.each([
    ["$param", "ModalDialog"],
    ["$params", "ModalDialog"],
    ["$item", "List"],
    ["$itemIndex", "List"],
    ["$row", "Table"],
    ["$rowIndex", "Table"],
    ["$item", "ScopedContainer"],
  ])("%s is filtered out of computedUses when using %s", (runtimeVar, componentType) => {
    const container = node(componentType, {
      vars: { x: "{0}" },
      children: [node("Text", { props: { text: `{${runtimeVar}}` } })],
    });
    computeUsesForTree(container);
    expect(container.computedUses ?? []).not.toContain(runtimeVar);
  });

  it("$context IS kept in computedUses when mixed with real deps (parent-state dynamic var)", () => {
    // $context lives in parent state.
    const outer = node("Stack", {
      vars: { lastAction: "''" },
      children: [
        node("Select", {
          vars: { x: "1" }, // make it a container
          children: [node("Text", { props: { text: "{$context.name} — {lastAction}" } })],
        }),
      ],
    });
    computeUsesForTree(outer);
    const select = outer.children![0];
    expect(select.computedUses).toContain("$context");
    expect(select.computedUses).toContain("lastAction");
  });

  it("$context alone DOES promote a heavy component (Iteration 2 behavior change)", () => {
    // $context is NOT in any component's childInjectedVars, so the optimizer
    // treats it as a genuine parent-state dep (correct — it lives in App state).
    const select = node("Select", {
      children: [node("Text", { props: { text: "{$context.name}" } })],
    });
    computeUsesForTree(select);
    expect(select.computedUses).toEqual(["$context"]);
  });

  it("$context DOES cascade to grandparent (Iteration 2 behavior change)", () => {
    // Now that $context is a regular parent dep, it flows up the tree.
    const outer = node("Stack", {
      vars: { lastAction: "''" },
      children: [
        node("Select", {
          vars: { placeholder: "'select'" },
          children: [
            node("Text", { props: { text: "{$context.name} — {lastAction}" } }),
          ],
        }),
      ],
    });
    computeUsesForTree(outer);
    const select = outer.children![0];
    expect(select.computedUses).toContain("$context");
    expect(select.computedUses).toContain("lastAction");
    // $context cascades to Stack because Stack is a container (has vars)
    // and its subtree depends on $context.
    expect(outer.computedUses).toContain("$context");
  });

  it.each([
    "$pathname", "$routeParams", "$queryParams", "$linkInfo",
  ])("router state var %s IS kept in computedUses (genuine parent-state key)", (routerVar) => {
    const select = node("Select", {
      children: [node("Text", { props: { text: `{${routerVar}}` } })],
    });
    computeUsesForTree(select);
    expect(select.computedUses).toContain(routerVar);
  });

  it("$param does not make an implicit container out of a non-container node", () => {
    const modal = node("ModalDialog", {
      children: [
        node("Items", {
          props: { data: "{items}" },
          vars: { x: "1" }, // make it a container
          children: [node("Option", { props: { value: "{$param.id}" } })],
        }),
      ],
    });
    computeUsesForTree(modal);
    const items = modal.children![0];
    expect(items.computedUses).toEqual(["items"]);
    expect(items.computedUses).not.toContain("$param");
  });
});

// ---------------------------------------------------------------------------
// Iteration 2: Children Scope
// ---------------------------------------------------------------------------

describe.skipIf(skipIfDisabled)("computeUsesForTree — Iteration 2: Children Scope", () => {
  it("U2.1: $item in ScopedContainer is filtered", () => {
    const root = node("ScopedContainer", {
      children: [node("Text", { props: { value: "{$item.name}" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toBeUndefined();
  });

  it("U2.2: multiple injected vars ($item, $index) are filtered", () => {
    const root = node("ScopedContainer", {
      children: [node("Text", { props: { value: "{$item.name} at {$index}" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toBeUndefined();
  });

  it("U2.4: Shadowing — child injects a var with the same name as parent dep", () => {
    // Outer stack has 'item' in vars.
    // Inner ScopedContainer injects '$item'. (Wait, names are different).
    // Let's use 'x'.
    (collectedComponentMetadata as any)["ShadowContainer"] = {
      childInjectedVars: ["x"],
    };
    const root = node("Stack", {
      vars: { x: "1" },
      children: [
        node("ShadowContainer", {
          children: [node("Text", { props: { value: "{x}" } })],
        }),
      ],
    });
    computeUsesForTree(root);
    const shadow = root.children![0];
    // ShadowContainer: x is locally injected → parentDependencies={} → computedUses=undefined.
    expect(shadow.computedUses).toBeUndefined();
    expect(root.computedUses).toBeUndefined();
  });

  it("U2.5: Nested scopes — inner scope extends outer scope", () => {
    (collectedComponentMetadata as any)["Level1"] = { childInjectedVars: ["$a"] };
    (collectedComponentMetadata as any)["Level2"] = { childInjectedVars: ["$b"] };

    const root = node("Level1", {
      vars: { x: "1" }, // make it a container
      children: [
        node("Level2", {
          vars: { y: "1" }, // make it a container
          children: [
            node("Text", { props: { value: "{$a} + {$b} + {$c}" } }),
          ],
        }),
      ],
    });
    computeUsesForTree(root);
    const level2 = root.children![0];
    // Level 2: $a (from Level1) and $b (from Level2) are in scope. Only $c is free.
    expect(level2.computedUses).toEqual(["$c"]);
    // Level 1: Only $c is free.
    expect(root.computedUses).toEqual(["$c"]);
  });

  it("U2.6: Extension component with childInjectedVars metadata is supported", () => {
    (collectedComponentMetadata as any)["MyGrid"] = {
      childInjectedVars: ["$cellValue"],
    };
    const root = node("Stack", {
      vars: { x: "1" },
      children: [
        node("MyGrid", {
          vars: { z: "1" }, // make it a container
          children: [node("Text", { props: { value: "{$cellValue} + {x}" } })],
        }),
      ],
    });
    computeUsesForTree(root);
    const grid = root.children![0];
    // MyGrid: $cellValue is filtered, x is kept.
    expect(grid.computedUses).toEqual(["x"]);
  });

  it("U2.3: sibling isolation — $item in List template does NOT leak into sibling Stack", () => {
    // Hot-spot A from the design spec. Two siblings share the same parent App.
    // The List's $item must NOT appear in Stack's computedUses.
    const root = node("App", {
      vars: { items: "{[]}", title: "'hello'" },
      children: [
        node("List", {
          props: { data: "{items}" },
          children: [node("Text", { props: { value: "{$item.name}" } })],
        }),
        node("Stack", {
          vars: { x: "1" },
          children: [node("Text", { props: { value: "{title}" } })],
        }),
      ],
    });
    computeUsesForTree(root);
    const list = root.children![0];
    const stack = root.children![1];
    // List sees $item — filtered. Items is a child-injected var, not a parent dep.
    expect(list.computedUses).not.toContain("$item");
    expect(list.computedUses).toContain("items");
    // Stack has no awareness of $item at all.
    expect(stack.computedUses).not.toContain("$item");
    expect(stack.computedUses).toEqual(["title"]);
  });

  it("U2.7: childInjectedVars scopes only children, NOT the component's own props", () => {
    // List.data="{items}" must still see `items` as a parent dep even though
    // $item is in List's childInjectedVars. The childInjectedVars only extend
    // the scope passed DOWN to children, not the scope used for the host node's props.
    const root = node("Stack", {
      vars: { items: "{[]}" },
      children: [
        node("List", {
          vars: { x: "1" },
          props: { data: "{items}" },
          children: [node("Text", { props: { value: "{$item.name}" } })],
        }),
      ],
    });
    computeUsesForTree(root);
    const list = root.children![0];
    // List reads `items` in its own prop — must appear in its computedUses.
    expect(list.computedUses).toContain("items");
    // $item is child-injected — must NOT appear.
    expect(list.computedUses).not.toContain("$item");
  });

  it("U2.9: deep shadowing — nested Items scopes, inner $item shadows outer $item", () => {
    // Outer Items injects $item (outer element). Inner Items also injects $item
    // (inner element). The inner reference to $item refers to the innermost scope
    // and should be filtered; it must NOT bubble up as a parent dep.
    const root = node("Stack", {
      vars: { outerData: "{[]}" },
      children: [
        node("Items", {
          vars: { x: "1" },
          props: { data: "{outerData}" },
          children: [
            node("Items", {
              vars: { y: "1" },
              props: { data: "{$item.children}" },
              children: [node("Text", { props: { value: "{$item.name}" } })],
            }),
          ],
        }),
      ],
    });
    computeUsesForTree(root);
    const outerItems = root.children![0];
    const innerItems = outerItems.children![0];
    // $item is injected by both scopes — must NOT appear in any computedUses.
    expect(outerItems.computedUses).not.toContain("$item");
    expect(innerItems.computedUses ?? []).not.toContain("$item");
    // outerData is a genuine parent dep of outerItems.
    expect(outerItems.computedUses).toContain("outerData");
  });

  it("U2.10: mixed global/local/scoped in one expression — only real parent dep kept", () => {
    // Hot-spot C. Expression: "{$item.name + parentVar + JSON.stringify(otherVar)}"
    // $item  → filtered (child-injected by List)
    // JSON   → filtered (JS built-in)
    // parentVar, otherVar → kept
    const root = node("Stack", {
      vars: { parentVar: "1", otherVar: "2" },
      children: [
        node("List", {
          vars: { z: "1" },
          props: { data: "{[]}" },
          children: [
            node("Text", {
              props: { value: "{$item.name + parentVar + JSON.stringify(otherVar)}" },
            }),
          ],
        }),
      ],
    });
    computeUsesForTree(root);
    const list = root.children![0];
    expect(list.computedUses).not.toContain("$item");
    expect(list.computedUses).not.toContain("JSON");
    expect(list.computedUses).toContain("parentVar");
    expect(list.computedUses).toContain("otherVar");
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
    // Fragment has vars but no `uses` → explicit container at runtime.
    // It has an external dependency on a real parent var (`externalVar`), which
    // triggers computedUses narrowing. It also contains `mySelect` which registers
    // its API in the parent's state (bubbles through the Fragment).
    //
    // Before the Bug 22 fix: child escaping UIDs were incorrectly seen as "locally
    // owned" by ANY container, so they were filtered out of computedUses.
    // Result: computedUses=["externalVar"] → extractScopedState(parentState, ["externalVar"])
    // removed `mySelect` from the scoped state → Button crashed.
    //
    // Note: the original version used `toast` as the external dep. `toast` is now
    // filtered by XMLUI_GLOBAL_NAMES, so a real parent-state var is used instead.
    const root = node("Stack", {
      vars: { x: "{0}", externalVar: "{42}" },
      children: [
        node("Fragment", {
          vars: { testState: "{null}" },
          children: [
            node("Select", { uid: "mySelect" }),
            node("Button", {
              events: { onClick: "doSomething(externalVar, mySelect.value)" },
            }),
          ],
        }),
      ],
    });
    computeUsesForTree(root);
    const fragment = root.children![0];
    expect(fragment.computedUses).toBeDefined();
    expect(fragment.computedUses).toContain("externalVar");
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

describe.skipIf(skipIfDisabled)("lexical scoping — Iteration 1 per-event isolation", () => {
  it("U1.3: event WITHOUT injectedVars metadata does not strip its free vars", () => {
    // DataSource.onLoaded has no injectedVars — names used there are regular parent deps.
    // Note: handlers that contain "{" are processed as XMLUI template strings; use
    // expression-lambda form (no braces) so the script parser handles them correctly.
    const root = node("Fragment", {
      vars: { x: "{0}" },
      loaders: [
        node("DataSource", {
          uid: "ds",
          props: { id: "ds", url: "/api/x" },
          events: { onLoaded: "() => externalVar" },
        }),
      ],
    });
    computeUsesForTree(root);
    // externalVar must NOT be stripped because onLoaded has no injectedVars.
    expect(root.computedUses).toContain("externalVar");
  });

  it("U1.4: two events on one component — injected scope is per-event, not shared", () => {
    // DataSource: fetch gets $queryParams injected (filtered from that handler);
    // onLoaded does not — names used there are regular parent deps.
    const root = node("Fragment", {
      vars: { x: "{0}" },
      loaders: [
        node("DataSource", {
          uid: "ds",
          props: { id: "ds", url: "{$queryParams.q}" },
          events: {
            fetch: "() => $queryParams.q",
            onLoaded: "() => sharedCounter",
          },
        }),
      ],
    });
    computeUsesForTree(root);
    // $queryParams appears in url prop (genuine dep) — still in computedUses.
    expect(root.computedUses).toContain("$queryParams");
    // sharedCounter is from onLoaded which has no injectedVars → must appear.
    expect(root.computedUses).toContain("sharedCounter");
  });
});

// ---------------------------------------------------------------------------
// Regression test for Group P (Checkbox.spec.ts:885,900 "$checked/$setChecked
// has no meaning outside component"): when a sibling references a Checkbox-
// scoped name like `$checked`, the host container's computedUses=["$checked"]
// previously caused `extractScopedState` to strip ALL Symbol-keyed component-
// state entries from the narrowed parentState — including the Checkbox's own
// `value` slice — so Toggle's value was permanently undefined and the inner
// template rendered "false" instead of the actual initialValue.
// Root cause: ContainerUtils.ts extractScopedState filtered Symbols by
// `description ∈ usesSet`, which only kept Symbols whose uid was itself in
// `uses`. The fix preserves ALL Symbol-keyed entries because they represent
// internal component-instance state, not external subscribable names.
// ---------------------------------------------------------------------------
describe.skipIf(skipIfDisabled)(
  "extractScopedState preserves Symbol-keyed component state across narrowing",
  () => {
    it(
      "Symbols are kept even when their description is NOT in `uses`",
      () => {
        const childA = Symbol("childA");
        const childB = Symbol("");
        const childC = Symbol(undefined);
        const parentState: any = {
          known: 1,
          ignored: 2,
          [childA]: { value: true },
          [childB]: { value: true },
          [childC]: { value: true },
        };
        const picked = extractScopedState(parentState, ["known"]) as any;
        expect(Object.keys(picked)).toEqual(["known"]);
        expect(childA in picked).toBe(true);
        expect(childB in picked).toBe(true);
        expect(childC in picked).toBe(true);
        expect(picked[childA]).toEqual({ value: true });
      },
    );
  },
);

// ---------------------------------------------------------------------------
// regression guard: computeUsesForTree must correctly analyze the inner
// ComponentDef even when called with a CompoundComponentDef wrapper.
//
// Before the fix, a hard-coded "for i<3" loop with `as any` drilled into
// `.component`.  After the fix, `unwrapToComponentDef()` follows the chain
// without a magic depth cap, and a plain ComponentDef (no `.component` field)
// is returned as-is.
// ---------------------------------------------------------------------------
describe.skipIf(skipIfDisabled)(
  "computeUsesForTree — N4: unwrapToComponentDef handles CompoundComponentDef wrappers",
  () => {
    it("plain ComponentDef (no .component field) is analyzed directly", () => {
      const root = node("Stack", {
        vars: { a: "{0}" },
        children: [node("Text", { props: { text: "{externalVar}" } })],
      });
      computeUsesForTree(root);
      expect(root.computedUses).toContain("externalVar");
    });

    it("one-level CompoundComponentDef wrapper: inner ComponentDef is analyzed", () => {
      // Simulate the shape StandaloneApp passes for a compound component:
      // { name: "MyComp", component: { type: "Stack", ... } }
      const innerComponent = node("Stack", {
        vars: { x: "{0}" },
        children: [node("Text", { props: { text: "{outerDep}" } })],
      });
      const compoundWrapper: any = {
        name: "MyComp",
        component: innerComponent,
      };
      computeUsesForTree(compoundWrapper);
      // computedUses is set on the inner node, not the wrapper
      expect(innerComponent.computedUses).toContain("outerDep");
    });

    it("two-level wrapper chain: innermost ComponentDef is still analyzed", () => {
      // A wrapper whose .component is itself another wrapper-like object.
      const realComponent = node("Stack", {
        vars: { y: "{0}" },
        children: [node("Text", { props: { text: "{deepDep}" } })],
      });
      const middleWrapper: any = { component: realComponent };
      const outerWrapper: any = { component: middleWrapper };
      computeUsesForTree(outerWrapper);
      expect(realComponent.computedUses).toContain("deepDep");
    });
  },
);

// ---------------------------------------------------------------------------
// Bug 30: Stale computedUses Survives Between Two Passes (Parse-time and Runtime-time)
//
// Symptom: ComponentDef trees are analyzed twice:
//   1) In xmlui-parser.ts after parsing .xmlui, BEFORE .xs code-behind is merged
//   2) In StandaloneApp.tsx after merging .xs — node.functions now present
//
// Between passes, nodes are NOT cloned—the same object references are reused.
// If pass 1 sets node.computedUses but pass 2 determines safeToNarrow=false
// (because functions are now known), the old computedUses from pass 1 survives.
// This causes stale narrowing at runtime: component references become undefined.
//
// Root cause: node.computedUses was set in-place by computeUsesInternal and
// never cleared when re-analyzing would mark safeToNarrow=false. The fix is
// mechanical: clear node.computedUses = undefined at the start of each traversal
// to ensure the current pass is the single source of truth.
// ---------------------------------------------------------------------------
describe.skipIf(skipIfDisabled)(
  "Bug 30: Stale computedUses Survives Between Two Passes (Parse-time and Runtime-time)",
  () => {
    it("REGRESSION: stale computedUses from parse-time pass survives into runtime-time pass once .xs functions are merged", () => {
      const button = node("Button", {
        props: { when: "{!$item.isCurrent}" },
        events: { click: parsedEvent("() => handleRestore($item)") },
      });
      const column = node("Column", {
        props: { header: "", width: "40px" },
        children: [button],
      });
      const table = node("Table", {
        props: { items: "{items}" },
        children: [column],
      });
      const drawer = node("Drawer", {
        uid: "versionsDrawer",
        props: { position: "right" },
        children: [table],
      });

      // ── PASS 1: parser-level call, BEFORE .xs merge ──
      // The root has vars (so it's a container) but NO functions yet, because
      // the .xs file hasn't been read in. This mirrors xmlui-parser.ts:60.
      const root: ComponentDef = {
        type: "Fragment",
        vars: { item: "{null}" },
        // functions: undefined  ← .xs not merged yet
        children: [drawer],
      };
      computeUsesForTree(root);
      const passOneTable = table.computedUses;
      // Pass 1 narrows the Table because handleRestore looks like a free
      // var coming from parent state (no .xs functions known yet).
      expect(passOneTable).toContain("handleRestore");
      expect(passOneTable).not.toContain("versionsDrawer");

      // ── PASS 2: StandaloneApp call, AFTER .xs merge ──
      // Now the root has functions from .xs. We do NOT clone the children —
      // they are the SAME object references, exactly as in production
      // StandaloneApp.tsx:744-757 (which spreads `compound.component` but
      // keeps `children` by reference).
      (root as any).functions = {
        handleRestore: "(version) => { versionsDrawer.close(); }" as any,
      };
      computeUsesForTree(root);
      const passTwoTable = table.computedUses;

      // EXPECTED: Pass 2 should recognise handleRestore as a parent function
      // and CLEAR the stale narrowing → table.computedUses should be undefined.
      // The mechanical guard at the start of computeUsesInternal (node.computedUses = undefined)
      // ensures stale values from pass 1 don't survive into pass 2.
      expect(passTwoTable, "Pass 2 should clear stale computedUses set by pass 1 once handleRestore is recognised as a parent function").toBeUndefined();
    });
  },
);
