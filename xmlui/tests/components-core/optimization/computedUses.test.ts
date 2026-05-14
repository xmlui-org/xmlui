import { describe, it, expect } from "vitest";
import { computeUsesForTree, IMPLICIT_CONTAINER_COMPONENT_NAMES } from
  "../../../src/components-core/optimization/computedUses";
import { extractScopedState } from "../../../src/components-core/rendering/ContainerUtils";
import type { ComponentDef } from "../../../src/abstractions/ComponentDefs";

function node(
  type: string,
  overrides: Partial<ComponentDef> = {},
): ComponentDef {
  return { type, ...overrides } as ComponentDef;
}

describe("IMPLICIT_CONTAINER_COMPONENT_NAMES", () => {
  it("contains Select, List, Table, DataGrid", () => {
    expect(IMPLICIT_CONTAINER_COMPONENT_NAMES.has("Select")).toBe(true);
    expect(IMPLICIT_CONTAINER_COMPONENT_NAMES.has("List")).toBe(true);
    expect(IMPLICIT_CONTAINER_COMPONENT_NAMES.has("Table")).toBe(true);
    expect(IMPLICIT_CONTAINER_COMPONENT_NAMES.has("DataGrid")).toBe(true);
  });
});

describe("computeUsesForTree — basic cases", () => {
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

describe("computeUsesForTree — isImplicitContainerByDefault", () => {
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

  it("Select without external dependencies: computedUses not set", () => {
    const select = node("Select", {
      children: [node("Option", { props: { value: "static" } })],
    });
    computeUsesForTree(select);
    expect(select.computedUses).toBeUndefined();
  });

  it("contextVar keys are locally declared — do NOT make Select an implicit container", () => {
    // Typical pattern: <Select><Items contextVar="$item" data="{...}"><Option value="{$item.value}"/></Items></Select>
    // $item is a contextVar of Items — locally provided, not from parent scope.
    // Without this fix, $item leaks out of Items → Select has parentDependencies={"$item"} → becomes
    // implicit container → gets wrapped in outer Container with computedUses=["$item"] →
    // extractScopedState(parentState, ["$item"]) = {} → value updates get isolated inside
    // the outer Container and never propagate to Fragment → {mySelect.value} stays empty.
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
    // Items absorbs $item (contextVar) and someData (external dep).
    // Select has parentDependencies={"someData"} — no $item leak.
    // Select IS an implicit container (has free vars), but computedUses=["someData"] only.
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
});

describe("computeUsesForTree — child UIDs", () => {
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

  it("grandchild uid captured by intermediate container does NOT become local in ancestor", () => {
    // innerStack has vars → IS a container → captures mySelect, does not let it escape
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
    // mySelect is captured by innerStack, so root must request it from parent
    expect(root.computedUses).toContain("mySelect");
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

describe("computeUsesForTree — loaders", () => {
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

describe("computeUsesForTree — events", () => {
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

describe("computeUsesForTree — empty parentDependencies must NOT set computedUses", () => {
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
    // Contrast: same shape but text also reads an EXTERNAL var → computedUses set
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
    expect(root.computedUses).not.toContain("mySelect");
  });
});

describe("computeUsesForTree — JS_STDLIB_GLOBALS filter", () => {
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

describe("computeUsesForTree — function-free child narrowing", () => {
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

describe("computeUsesForTree — expression sources (api, when, responsiveWhen, loaders)", () => {
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
    // ds uid is locally declared via loader processing
    expect(root.computedUses).not.toContain("ds");
  });
});

// ---------------------------------------------------------------------------
// function-free child narrowing — additional edge cases
// ---------------------------------------------------------------------------

describe("computeUsesForTree — function-free narrowing edge cases", () => {
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

describe("computeUsesForTree + extractScopedState — end-to-end narrowing", () => { // eslint-disable-line
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
