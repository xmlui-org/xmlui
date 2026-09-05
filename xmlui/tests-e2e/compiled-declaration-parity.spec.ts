import { expect, test, type TestBedDescription } from "../src/testing/fixtures";

type DeclarationParityCase = {
  name: string;
  source: string;
  description?: TestBedDescription;
  expected: unknown;
  resultTestId?: string;
};

const MODES = [
  { name: "interpreted", compileScripts: false },
  { name: "compiled", compileScripts: true },
] as const;

function withCompilationMode(
  description: TestBedDescription | undefined,
  compileScripts: boolean,
): TestBedDescription {
  return {
    ...description,
    parserOptions: {
      ...description?.parserOptions,
      compileScripts,
    },
    xmluiConfig: {
      ...description?.xmluiConfig,
      compileScripts,
    },
  };
}

async function runParityCase(
  initTestBed: (source: string, description?: TestBedDescription) => Promise<any>,
  page: any,
  testCase: DeclarationParityCase,
) {
  const results: unknown[] = [];

  for (const mode of MODES) {
    const { testStateDriver } = await initTestBed(
      testCase.source,
      withCompilationMode(testCase.description, mode.compileScripts),
    );
    const button = page.getByTestId("run");
    await expect(button).toBeVisible();
    await button.click();
    if (testCase.resultTestId) {
      const result = page.getByTestId(testCase.resultTestId);
      await expect(result).toHaveText(String(testCase.expected));
      results.push(await result.textContent());
    } else {
      await expect.poll(testStateDriver.testState).toEqual(testCase.expected);
      results.push(await testStateDriver.testState());
    }
  }

  expect(results[1], testCase.name).toEqual(results[0]);
}

async function installCompiledFunctionProbe(page: any) {
  await page.evaluate(() => {
    const win = window as any;
    if (!win.__xmluiOriginalFunction) {
      win.__xmluiOriginalFunction = window.Function;
    }
    win.__xmluiCompiledFunctionBodies = [];
    const OriginalFunction = win.__xmluiOriginalFunction;
    window.Function = new Proxy(OriginalFunction, {
      apply(target, thisArg, args) {
        win.__xmluiCompiledFunctionBodies.push(args.map(String).join("\n"));
        return Reflect.apply(target, thisArg, args);
      },
      construct(target, args, newTarget) {
        win.__xmluiCompiledFunctionBodies.push(args.map(String).join("\n"));
        return Reflect.construct(target, args, newTarget);
      },
    });
  });
}

async function restoreCompiledFunctionProbe(page: any) {
  await page.evaluate(() => {
    const win = window as any;
    if (win.__xmluiOriginalFunction) {
      window.Function = win.__xmluiOriginalFunction;
      delete win.__xmluiOriginalFunction;
    }
    delete win.__xmluiCompiledFunctionBodies;
  });
}

async function getCompiledFunctionBodies(page: any): Promise<string[]> {
  return await page.evaluate(() => ((window as any).__xmluiCompiledFunctionBodies ?? []).slice());
}

async function runCompiledOnlyProof(
  initTestBed: (source: string, description?: TestBedDescription) => Promise<any>,
  page: any,
  source: string,
  description: TestBedDescription | undefined,
  expected: unknown,
  expectedSourceIds: string[],
) {
  const { testStateDriver } = await initTestBed(
    source,
    withCompilationMode(
      // --- No test-only affordance here: the proof reads the `//# sourceURL=` line that
      // --- every compiled artifact carries, so it holds for a built app exactly as it
      // --- does under `xmlui start`. Asking for source maps would have made this pass
      // --- in dev mode alone.
      { ...description },
      true,
    ),
  );

  await installCompiledFunctionProbe(page);
  try {
    const button = page.getByTestId("run");
    await expect(button).toBeVisible();
    await button.click();
    await expect.poll(testStateDriver.testState).toEqual(expected);

    const bodies = await getCompiledFunctionBodies(page);
    const capturedSourceUrls = bodies
      .map((body) => body.match(/\/\/# sourceURL=([^\n]+)/)?.[1] ?? "<no sourceURL>")
      .join(", ");
    for (const sourceId of expectedSourceIds) {
      const encodedSourceId = encodeURIComponent(sourceId);
      expect(
        bodies.some((body) => body.includes(sourceId) || body.includes(encodedSourceId)),
        `expected compiled executor for ${sourceId}; captured ${capturedSourceUrls}`,
      ).toBe(true);
    }
  } finally {
    await restoreCompiledFunctionProbe(page);
  }
}

test.describe("compiled declaration parity", () => {
  const cases: DeclarationParityCase[] = [
    {
      name: "inline .xmlui script function called from onClick",
      source: `
        <App>
          <script>
            function delayedAdd(value) {
              delay(1);
              return value + 2;
            }
          </script>
          <Button testId="run" onClick="testState = delayedAdd(40)">Run</Button>
        </App>
      `,
      expected: 42,
    },
    {
      name: "Main.xmlui.xs function mutates state from onClick",
      source: `<Button testId="run" onClick="bumpTwice()">Run</Button>`,
      description: {
        codeBehind: `
          function bumpTwice() {
            testState = 1;
            testState = testState + 1;
          }
        `,
      },
      expected: 2,
    },
    {
      name: "component .xmlui.xs function called inside that component",
      source: `
        <App>
          <global name="parityResult" value="unset" />
          <Text testId="result">{parityResult}</Text>
          <CodeBehindPanel />
        </App>
      `,
      description: {
        noFragmentWrapper: true,
        components: [
          `
            <Component name="CodeBehindPanel" codeBehind="./components/CodeBehindPanel.xmlui.xs">
              <Button testId="run" onClick="parityResult = componentValue(5)">Run</Button>
            </Component>
          `,
        ],
        sources: {
          "/src/components/CodeBehindPanel.xmlui.xs": `
            function componentValue(value) {
              return value + 7;
            }
          `,
        },
      },
      expected: 12,
      resultTestId: "result",
    },
    {
      name: "inline component codeBehind function",
      source: `
        <Component name="InlinePanel" codeBehind="./InlinePanel.xs">
          <Button testId="run" onClick="parityResult = inlineValue(6)">Run</Button>
        </Component>
        <App>
          <global name="parityResult" value="unset" />
          <Text testId="result">{parityResult}</Text>
          <InlinePanel />
        </App>
      `,
      description: {
        noFragmentWrapper: true,
        parserOptions: { role: "entrypoint" },
        sources: {
          "/src/InlinePanel.xs": `
            function inlineValue(value) {
              return value * 3;
            }
          `,
        },
      },
      expected: 18,
      resultTestId: "result",
    },
    {
      name: "Globals.xs function called from component event handler",
      source: `<Button testId="run" onClick="testState = globalValue(6)">Run</Button>`,
      description: {
        globalsXs: `
          function globalValue(value) {
            return value + 30;
          }
        `,
      },
      expected: 36,
    },
    {
      name: "imported helper alias transitively called from code-behind",
      source: `<Button testId="run" onClick="testState = importedValue(7)">Run</Button>`,
      description: {
        codeBehind: `
          import { multiply as times } from "./helpers.xs";
          function importedValue(value) {
            return times(value, 3);
          }
        `,
        sources: {
          "/src/helpers.xs": `
            function multiply(value, factor) {
              return value * factor;
            }
          `,
        },
      },
      expected: 21,
    },
    {
      // --- `new` compiles since plan #3879; kept as a parity case for constructors.
      name: "declaration constructing an object",
      source: `<Button testId="run" onClick="testState = epochYear()">Run</Button>`,
      description: {
        codeBehind: `
          function epochYear() {
            return new Date(0).getFullYear();
          }
        `,
      },
      expected: 1970,
    },
    // --- There is no longer a construct that a declaration can both fall back on and
    // --- still execute: since plan #3879 the compiler covers everything the
    // --- interpreter runs, and what is left (`await`, async arrows) is rejected by
    // --- both. The fallback path itself is covered by
    // --- `tests/parsers/scripting/code-behind-import.test.ts` and
    // --- `tests/components-core/compiled-events/event-async-handler-arrow.test.ts`.
  ];

  for (const testCase of cases) {
    test(testCase.name, async ({ initTestBed, page }) => {
      await runParityCase(initTestBed, page, testCase);
    });
  }
});

test.describe("compiled declaration execution proof", () => {
  test("executes inline script tag functions through compiled artifacts", async ({
    initTestBed,
    page,
  }) => {
    await runCompiledOnlyProof(
      initTestBed,
      page,
      `
        <script>
          function inlineCompiledOnly(value) {
            return value + 4;
          }
        </script>
        <Button testId="run" onClick="testState = inlineCompiledOnly(38)">Run</Button>
      `,
      undefined,
      42,
      ["#function-inlineCompiledOnly"],
    );
  });

  test("executes Main.xmlui.xs functions through compiled artifacts", async ({
    initTestBed,
    page,
  }) => {
    await runCompiledOnlyProof(
      initTestBed,
      page,
      `<Button testId="run" onClick="testState = mainXsCompiledOnly(21)">Run</Button>`,
      {
        codeBehind: `
          function mainXsCompiledOnly(value) {
            return value * 2;
          }
        `,
      },
      42,
      ["/src/Main.xmlui.xs#function-mainXsCompiledOnly"],
    );
  });

  test("executes Globals.xs functions through compiled artifacts", async ({
    initTestBed,
    page,
  }) => {
    await runCompiledOnlyProof(
      initTestBed,
      page,
      `<Button testId="run" onClick="testState = globalsXsCompiledOnly(40)">Run</Button>`,
      {
        globalsXs: `
          function globalsXsCompiledOnly(value) {
            return value + 2;
          }
        `,
      },
      42,
      ["/src/Globals.xs#function-globalsXsCompiledOnly"],
    );
  });

  test("executes imported .xs helper functions through compiled artifacts", async ({
    initTestBed,
    page,
  }) => {
    await runCompiledOnlyProof(
      initTestBed,
      page,
      `<Button testId="run" onClick="testState = importEntryCompiledOnly(6)">Run</Button>`,
      {
        codeBehind: `
          import { helperCompiledOnly } from "./helpers.xs";
          function importEntryCompiledOnly(value) {
            return helperCompiledOnly(value, 7);
          }
        `,
        sources: {
          "/src/helpers.xs": `
            function helperCompiledOnly(value, factor) {
              return value * factor;
            }
          `,
        },
      },
      42,
      [
        "/src/Main.xmlui.xs#function-importEntryCompiledOnly",
        "/src/helpers.xs#function-helperCompiledOnly",
      ],
    );
  });
});
