import type { Locator } from "@playwright/test";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { expect as baseExpect, test as baseTest } from "@playwright/test";
import { initComponent } from "./component-test-helpers";
import { xmlUiMarkupToComponent } from "@components-core/xmlui-parser";
import type { StandaloneAppDescription } from "@components-core/abstractions/standalone";
import type { Page } from "playwright-core";

export { test } from "@playwright/test";

async function getElementSize(locator: Locator) {
  const dimensions = await locator.evaluate((element) => [
    element.clientWidth,
    element.clientHeight,
  ]);
  return { width: dimensions[0] ?? 0, height: dimensions[1] ?? 0 } as const;
}

export type ComponentDriverParams = {
  locator: Locator;
  testStateLocator: Locator;
  page: Page;
}

export class ComponentDriver {
  protected readonly locator: Locator;
  protected readonly testStateLocator: Locator;
  page: Page;

  constructor({ locator, testStateLocator, page }: ComponentDriverParams) {
    this.locator = locator;
    this.testStateLocator = testStateLocator;
    this.page = page;
  }

  get component () {
    return this.locator;
  }

  // NOTE: methods must be created using the arrow function notation.
  // Otherwise, the "this" will not be correctly bound to the class instance when destructuring.

  click = async (options?: { timeout?: number }) => {
    await this.locator.click(options);
  }

  focus = async (options?: { timeout?: number }) => {
    await this.locator.focus(options);
  }

  blur = async (options?: { timeout?: number }) => {
    await this.locator.blur(options);
  }

  getComponentSize = async () => {
    return getElementSize(this.locator);
  }

  /** returns an async function that can query the test state */
  get testState () {
    return async () =>{
      const text = await this.testStateLocator.textContent();
      const testState = text === "undefined" ? undefined : JSON.parse(text!);
      return testState;
    }
  }
}


export function createTestWithDriver<T extends new (...args: ComponentDriverParams[]) => any>(
  DriverClass: T
) {
  return baseTest.extend<{
    createDriver: (source: string, description?: Omit<Partial<StandaloneAppDescription>, "entryPoint">) => Promise<InstanceType<T>>;
  }>({
    createDriver: async ({page}, use) => {
      await use(async (source: string, description?: Omit<Partial<StandaloneAppDescription>, "entryPoint">) => {
        const testStateViewTestId = "test-state-view-testid"
        const { errors, component } = xmlUiMarkupToComponent(`
            <Fragment var.testState="{null}">
              ${source}
              <Stack width="0" height="0">
                <Text
                  testId="${testStateViewTestId}"
                  value="{ typeof testState === 'undefined' ? 'undefined' : JSON.stringify(testState) }"/>
              </Stack>
            </Fragment>  
        `)
        const entryPoint = component as ComponentDef
        if (errors.length > 0){
          throw { errors };
        }
        const componentTestId = "test-id-component";
        (entryPoint).children![0].testId ??= componentTestId;

        await initComponent(page, { ...description, entryPoint },);
        return new DriverClass({
          locator: page.getByTestId((entryPoint).children![0].testId!),
          testStateLocator: page.getByTestId(testStateViewTestId),
          page: page
        });
      });
    }
  });
}

// -----------------------------------------------------------------

export const expect = baseExpect.extend({});
