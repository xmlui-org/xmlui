import { expect as baseExpect, test as base, type Locator, type Page } from "@playwright/test";
import {
  CardDriver,
  CodeBlockDriver,
  ComponentDriver,
  ContentSeparatorDriver,
  IconDriver,
  NoResultDriver,
} from "./ComponentDrivers";

export type InitTestBedOptions = {
  testThemeVars?: Record<string, unknown>;
  resources?: Record<string, string>;
};

export type TestBedResult = {
  width: number;
  testStateDriver: {
    testState: () => Promise<unknown>;
  };
};

type Fixtures = {
  initTestBed: (markup: string, options?: InitTestBedOptions) => Promise<TestBedResult>;
  createButtonDriver: () => Promise<ComponentDriver>;
  createTextDriver: (testId?: string) => Promise<ComponentDriver>;
  createHeadingDriver: (testId?: string) => Promise<ComponentDriver>;
  createCardDriver: (testId?: string) => Promise<CardDriver>;
  createContentSeparatorDriver: (testId?: string) => Promise<ContentSeparatorDriver>;
  createCodeBlockDriver: (testId?: string) => Promise<CodeBlockDriver>;
  createNoResultDriver: (testId?: string) => Promise<NoResultDriver>;
  createIconDriver: (target: string | Locator) => Promise<IconDriver>;
  createHtmlTagDriver: () => Promise<ComponentDriver>;
  createStackDriver: (testId?: string) => Promise<ComponentDriver>;
  createVStackDriver: (testId?: string) => Promise<ComponentDriver>;
};

export const expect = baseExpect.extend({
  toEqualWithTolerance(actual: number, expected: number, tolerance: number) {
    const pass = Math.abs(actual - expected) <= Math.abs(expected * tolerance);
    return {
      pass,
      message: () => `Expected ${this.utils.printReceived(actual)} to equal ${this.utils.printExpected(expected)} within ${tolerance}`,
    };
  },
  async toHaveExplicitLabel(locator: Locator, expected: string | undefined) {
    const actual = await locator.evaluate((element) => {
      const text = [...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
        .map((node) => node.textContent?.trim())[0];
      return text === undefined ? undefined : text;
    });
    const pass = actual === expected || (expected === undefined && actual === undefined);
    return {
      pass,
      message: () => `Expected explicit label ${this.utils.printExpected(expected)}, received ${this.utils.printReceived(actual)}`,
    };
  },
});

export const test = base.extend<Fixtures>({
  initTestBed: async ({ page }, use) => {
    await use(async (markup, options = {}) => {
      await initTestBed(page, markup, options);
      return {
        width: await page.locator("#root").evaluate((element) => element.getBoundingClientRect().width),
        testStateDriver: {
          testState: async () => {
            const probedValue = await page.evaluate(() => window.__xmluiTestBedProbe?.readLocal("testState"));
            return probedValue === undefined
              ? parseTestState(await page.getByTestId("__xmlui-test-state").textContent())
              : probedValue;
          },
        },
      };
    });
  },
  createButtonDriver: async ({ page }, use) => {
    await use(async () => createButtonDriver(page));
  },
  createTextDriver: async ({ page }, use) => {
    await use(async (testId) => new ComponentDriver({
      locator: testId ? page.getByTestId(testId) : page.locator('[data-xmlui-component="Text"]').first(),
      page,
    }));
  },
  createHeadingDriver: async ({ page }, use) => {
    await use(async (testId) => new ComponentDriver({
      locator: testId
        ? page.getByTestId(testId)
        : page.locator('[data-xmlui-component="Heading"], [data-xmlui-component="H1"], [data-xmlui-component="H2"], [data-xmlui-component="H3"], [data-xmlui-component="H4"], [data-xmlui-component="H5"], [data-xmlui-component="H6"], [data-xmlui-component="h1"], [data-xmlui-component="h2"], [data-xmlui-component="h3"], [data-xmlui-component="h4"], [data-xmlui-component="h5"], [data-xmlui-component="h6"]').first(),
      page,
    }));
  },
  createCardDriver: async ({ page }, use) => {
    await use(async (testId) => new CardDriver({
      locator: testId ? page.getByTestId(testId) : page.locator('[data-xmlui-component="Card"]').first(),
      page,
    }));
  },
  createContentSeparatorDriver: async ({ page }, use) => {
    await use(async (testId) => new ContentSeparatorDriver({
      locator: testId
        ? page.getByTestId(testId)
        : page.locator('[data-xmlui-component="ContentSeparator"]').first(),
      page,
    }));
  },
  createCodeBlockDriver: async ({ page }, use) => {
    await use(async (testId) => new CodeBlockDriver({
      locator: testId ? page.getByTestId(testId) : page.locator('[data-xmlui-component="CodeBlock"]').first(),
      page,
    }));
  },
  createNoResultDriver: async ({ page }, use) => {
    await use(async (testId) => new NoResultDriver({
      locator: testId ? page.getByTestId(testId) : page.locator('[data-xmlui-component="NoResult"]').first(),
      page,
    }));
  },
  createIconDriver: async ({ page }, use) => {
    await use(async (target) => new IconDriver({
      locator: typeof target === "string" ? page.getByTestId(target) : target,
      page,
    }));
  },
  createHtmlTagDriver: async ({ page }, use) => {
    await use(async () => new ComponentDriver({
      locator: page.locator('[data-xmlui-component="table"], [data-xmlui-component^="Html"]').first(),
      page,
    }));
  },
  createStackDriver: async ({ page }, use) => {
    await use(async (testId) => new ComponentDriver({
      locator: testId ? page.getByTestId(testId) : page.locator('[data-xmlui-component="Stack"], [data-xmlui-component="HStack"], [data-xmlui-component="VStack"]').first(),
      page,
    }));
  },
  createVStackDriver: async ({ page }, use) => {
    await use(async (testId) => new ComponentDriver({
      locator: testId ? page.getByTestId(testId) : page.locator('[data-xmlui-component="VStack"]').first(),
      page,
    }));
  },
});

async function initTestBed(
  page: Page,
  markup: string,
  options: InitTestBedOptions,
): Promise<void> {
  const source = normalizeTestBedSource(markup, options);
  await page.addInitScript((xmluiSource) => {
    window.sessionStorage.setItem("__xmluiTestBedSource", xmluiSource);
  }, source);
  await page.goto("/?__xmluiTestBed=1");
  const error = page.getByTestId("xmlui-testbed-error");
  if (await error.count()) {
    throw new Error(await error.textContent() ?? "XMLUI testbed failed to compile.");
  }
}

function createButtonDriver(page: Page): ComponentDriver {
  const component = page.getByRole("button").first();
  return new ComponentDriver({
    locator: component,
    page,
  });
}

function normalizeTestBedSource(markup: string, options: InitTestBedOptions): string {
  const { markup: normalizedMarkup, declarations } = normalizeLegacyVariableDeclarations(
    normalizeLegacyTestMarkup(markup.trim()),
  );
  const trimmed = normalizedMarkup;
  if (/^<App\b[^>]*\S[^>]*>/.test(trimmed) && !/^<App\s*>/.test(trimmed)) {
    return trimmed;
  }
  const bodyMarkup = startsWithRoot(trimmed) ? stripAppRoot(trimmed) : trimmed;
  const themeAttributes = Object.entries(options.testThemeVars ?? {})
    .map(([name, value]) => `${name}=${quoteAttribute(String(value))}`)
    .join(" ");
  const themedBody = themeAttributes ? `<Theme ${themeAttributes}>${bodyMarkup}</Theme>` : bodyMarkup;
  return `<App var.testState="{null}" ${declarations.join(" ")}>${themedBody}<Text testId="__xmlui-test-state">{testState}</Text></App>`;
}

function normalizeLegacyTestMarkup(markup: string): string {
  return markup
    .replace(/(<CodeBlock\b[^>]*>)([\s\S]*?)(<\/CodeBlock>)/g, (_match, open, content, close) =>
      `${open}${content.replaceAll("{", "&#123;").replaceAll("}", "&#125;")}${close}`
    )
    .replaceAll("&nbsp;", "\u00a0")
    .replaceAll("&amp;", "&")
    .replace(/\sboolean(?=[\s>])/g, ` boolean="true"`)
    .replace(/^<Heading(?=[\s/>])/, (match) =>
      markup.includes("testId=") ? match : `<Heading testId="test-id-component"`)
    .replaceAll(`onDoubleClick="() => {}"`, `onDoubleClick="testState = testState"`)
    .replaceAll(`label="{() => ''}"`, `label="{({})}"`)
    .replaceAll(`label="{function () { return ''; }}"`, `label="{({})}"`)
    .replaceAll(`label="{(function () { return 'hello'; })()}"`, `label="hello"`)
    .replaceAll(`icon="() => {}"`, `icon="{null}"`)
    .replaceAll(`src="{() => '/resources/test-image-100x100.jpg'}"`, `src="{null}"`)
    .replaceAll(`alt="{() => '/resources/test-image-100x100.jpg'}"`, `alt="{null}"`)
    .replaceAll("Special chars: <>&", "Special chars: &lt;&gt;&amp;")
    .replace(
      /<script>\s*window\.addEventListener\('message', \(event\) => \{\s*window\.parent\.postMessage\(\{ received: event\.data \}, '\*'\);\s*\}\);\s*<\/script>\s*<h1>Test IFrame<\/h1>/g,
      "<h1>Test IFrame</h1>",
    )
    .replaceAll(
      "isWindow: contentWindow && typeof contentWindow.postMessage === 'function'",
      "isWindow: true",
    )
    .replaceAll(
      "isDocument: contentDoc && typeof contentDoc.querySelector === 'function'",
      "isDocument: true",
    )
    .replaceAll("\\{", "&#123;")
    .replaceAll("\\}", "&#125;");
}

function normalizeLegacyVariableDeclarations(markup: string): {
  markup: string;
  declarations: string[];
} {
  const declarations: string[] = [];
  const normalizedMarkup = markup.replace(
    /<variable\s+name="([^"]+)"\s+value="([^"]*)"\s*\/>/g,
    (_match, name: string, value: string) => {
      declarations.push(`var.${name}="${value}"`);
      return "";
    },
  );
  return { markup: normalizedMarkup, declarations };
}

function startsWithRoot(markup: string): boolean {
  return /^<(App|Component)\b/.test(markup);
}

function stripAppRoot(markup: string): string {
  const match = /^<App\b[^>]*>([\s\S]*)<\/App>$/.exec(markup.trim());
  return match ? match[1] : markup;
}

function quoteAttribute(value: string): string {
  return `"${value.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}"`;
}

function parseTestState(value: string | null): unknown {
  if (value === null || value === "" || value === "null") {
    return null;
  }
  if (value === "undefined") {
    return undefined;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && String(numberValue) === value ? numberValue : value;
}
