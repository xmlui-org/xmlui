import { expect, test } from "xmlui/testing";

const EXT = { extensionIds: "xmlui-docs-blocks" };

test.describe("Share", () => {
  test.describe("Basic Functionality", () => {
    test("renders the trigger button with the default label", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<Share />`, EXT);
      await expect(page.getByTestId("share-trigger")).toBeVisible();
      await expect(page.getByTestId("share-trigger")).toHaveText(/Copy & share/);
    });

    test("renders the trigger with a custom 'label'", async ({ initTestBed, page }) => {
      await initTestBed(`<Share label="Share this" />`, EXT);
      await expect(page.getByTestId("share-trigger")).toHaveText(/Share this/);
    });

    test("menu is closed by default", async ({ initTestBed, page }) => {
      await initTestBed(`<Share />`, EXT);
      await expect(page.getByTestId("share-menu")).toHaveCount(0);
    });

    test("opens the menu when the trigger is clicked", async ({ initTestBed, page }) => {
      await initTestBed(`<Share />`, EXT);
      await page.getByTestId("share-trigger").click();
      await expect(page.getByTestId("share-menu")).toBeVisible();
    });

    test("closes the menu when the trigger is clicked again", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<Share />`, EXT);
      const trigger = page.getByTestId("share-trigger");
      await trigger.click();
      await expect(page.getByTestId("share-menu")).toBeVisible();
      await trigger.click();
      await expect(page.getByTestId("share-menu")).toHaveCount(0);
    });

    test("closes the menu when clicking outside", async ({ initTestBed, page }) => {
      await initTestBed(
        `
        <Fragment>
          <Share />
          <Text testId="outside">Outside content</Text>
        </Fragment>
      `,
        EXT,
      );
      await page.getByTestId("share-trigger").click();
      await expect(page.getByTestId("share-menu")).toBeVisible();
      await page.getByTestId("outside").click();
      await expect(page.getByTestId("share-menu")).toHaveCount(0);
    });

    test("closes the menu when Escape is pressed", async ({ initTestBed, page }) => {
      await initTestBed(`<Share />`, EXT);
      const trigger = page.getByTestId("share-trigger");
      await trigger.click();
      await expect(page.getByTestId("share-menu")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByTestId("share-menu")).toHaveCount(0);
    });

    test("renders all five share items by default", async ({ initTestBed, page }) => {
      await initTestBed(`<Share />`, EXT);
      await page.getByTestId("share-trigger").click();
      await expect(page.getByTestId("share-copy")).toBeVisible();
      await expect(page.getByTestId("share-chatgpt")).toBeVisible();
      await expect(page.getByTestId("share-claude")).toBeVisible();
      await expect(page.getByTestId("share-twitter")).toBeVisible();
      await expect(page.getByTestId("share-linkedin")).toBeVisible();
    });

    test("renders the default item labels", async ({ initTestBed, page }) => {
      await initTestBed(`<Share />`, EXT);
      await page.getByTestId("share-trigger").click();
      await expect(page.getByText("Copy page", { exact: true })).toBeVisible();
      await expect(page.getByText("Open in ChatGPT", { exact: true })).toBeVisible();
      await expect(page.getByText("Open in Claude", { exact: true })).toBeVisible();
      await expect(page.getByText("Share in X (Twitter)", { exact: true })).toBeVisible();
      await expect(page.getByText("Share in LinkedIn", { exact: true })).toBeVisible();
    });

    test("renders the default item descriptions", async ({ initTestBed, page }) => {
      await initTestBed(`<Share />`, EXT);
      await page.getByTestId("share-trigger").click();
      await expect(
        page.getByText("Copy page as markdown for LLMs", { exact: true }),
      ).toBeVisible();
      // Two items share the "Ask questions about this page" description.
      await expect(
        page.getByText("Ask questions about this page", { exact: true }),
      ).toHaveCount(2);
      // Two items share the "Start conversation" description.
      await expect(page.getByText("Start conversation", { exact: true })).toHaveCount(2);
    });

    test("hides items when their show* flag is false", async ({ initTestBed, page }) => {
      await initTestBed(
        `<Share showChatGpt="false" showClaude="false" showLinkedIn="false" />`,
        EXT,
      );
      await page.getByTestId("share-trigger").click();
      await expect(page.getByTestId("share-copy")).toBeVisible();
      await expect(page.getByTestId("share-twitter")).toBeVisible();
      await expect(page.getByTestId("share-chatgpt")).toHaveCount(0);
      await expect(page.getByTestId("share-claude")).toHaveCount(0);
      await expect(page.getByTestId("share-linkedin")).toHaveCount(0);
    });

    test("renders nothing when every show* flag is false", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(
        `<Share
          showCopy="false"
          showChatGpt="false"
          showClaude="false"
          showTwitter="false"
          showLinkedIn="false"
        />`,
        EXT,
      );
      await expect(page.getByTestId("share-trigger")).toHaveCount(0);
    });

    test("custom 'copyLabel' is shown for the copy item", async ({ initTestBed, page }) => {
      await initTestBed(`<Share copyLabel="Másolás" />`, EXT);
      await page.getByTestId("share-trigger").click();
      await expect(page.getByText("Másolás", { exact: true })).toBeVisible();
    });

    test("custom 'chatGptLabel' is shown for the ChatGPT item", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<Share chatGptLabel="GPT-vel megnyitás" />`, EXT);
      await page.getByTestId("share-trigger").click();
      await expect(page.getByText("GPT-vel megnyitás", { exact: true })).toBeVisible();
    });

    test("Copy page action writes 'markdownContent' to the clipboard", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(
        `<Share markdownContent="# Hello\nThis is the page content." />`,
        EXT,
      );
      await page.getByTestId("share-trigger").click();
      await page.getByTestId("share-copy").click();
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toBe("# Hello\nThis is the page content.");
    });

    test("Copy page swaps the label to the copied confirmation", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(
        `<Share markdownContent="hi" copiedLabel="Vágólapra másolva" />`,
        EXT,
      );
      await page.getByTestId("share-trigger").click();
      await page.getByTestId("share-copy").click();
      await expect(
        page.getByText("Vágólapra másolva", { exact: true }),
      ).toBeVisible();
    });

    test("Open in ChatGPT navigates to chatgpt.com with the page URL in the prompt", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(
        `<Share pageUrl="https://example.com/post" />`,
        EXT,
      );
      await page.evaluate(() => {
        (window as any).__lastOpen = null;
        window.open = ((url?: string | URL) => {
          (window as any).__lastOpen = String(url ?? "");
          return null;
        }) as typeof window.open;
      });
      await page.getByTestId("share-trigger").click();
      await page.getByTestId("share-chatgpt").click();
      const url = await page.evaluate(() => (window as any).__lastOpen as string);
      expect(url.startsWith("https://chatgpt.com/")).toBe(true);
      expect(url).toContain(encodeURIComponent("https://example.com/post"));
    });

    test("Open in Claude navigates to claude.ai with the page URL in the prompt", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(
        `<Share pageUrl="https://example.com/post" />`,
        EXT,
      );
      await page.evaluate(() => {
        (window as any).__lastOpen = null;
        window.open = ((url?: string | URL) => {
          (window as any).__lastOpen = String(url ?? "");
          return null;
        }) as typeof window.open;
      });
      await page.getByTestId("share-trigger").click();
      await page.getByTestId("share-claude").click();
      const url = await page.evaluate(() => (window as any).__lastOpen as string);
      expect(url.startsWith("https://claude.ai/")).toBe(true);
      expect(url).toContain(encodeURIComponent("https://example.com/post"));
    });

    test("Share in X opens a Twitter intent URL with the page URL and title", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(
        `<Share pageUrl="https://example.com/post" pageTitle="Hello world" />`,
        EXT,
      );
      await page.evaluate(() => {
        (window as any).__lastOpen = null;
        window.open = ((url?: string | URL) => {
          (window as any).__lastOpen = String(url ?? "");
          return null;
        }) as typeof window.open;
      });
      await page.getByTestId("share-trigger").click();
      await page.getByTestId("share-twitter").click();
      const url = await page.evaluate(() => (window as any).__lastOpen as string);
      expect(url.startsWith("https://twitter.com/intent/tweet")).toBe(true);
      expect(url).toContain(`url=${encodeURIComponent("https://example.com/post")}`);
      expect(url).toContain(`text=${encodeURIComponent("Hello world")}`);
    });

    test("Share in LinkedIn opens the LinkedIn post composer prefilled with the title and URL", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(
        `<Share pageUrl="https://example.com/post" pageTitle="Hello world" />`,
        EXT,
      );
      await page.evaluate(() => {
        (window as any).__lastOpen = null;
        window.open = ((url?: string | URL) => {
          (window as any).__lastOpen = String(url ?? "");
          return null;
        }) as typeof window.open;
      });
      await page.getByTestId("share-trigger").click();
      await page.getByTestId("share-linkedin").click();
      const url = await page.evaluate(() => (window as any).__lastOpen as string);
      expect(url.startsWith("https://www.linkedin.com/feed/?shareActive=true")).toBe(true);
      expect(url).toContain(
        `text=${encodeURIComponent("Hello world\n\nhttps://example.com/post")}`,
      );
    });

    test("clicking an external item closes the menu", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(
        `<Share pageUrl="https://example.com/post" />`,
        EXT,
      );
      await page.evaluate(() => {
        window.open = (() => null) as typeof window.open;
      });
      await page.getByTestId("share-trigger").click();
      await expect(page.getByTestId("share-menu")).toBeVisible();
      await page.getByTestId("share-claude").click();
      await expect(page.getByTestId("share-menu")).toHaveCount(0);
    });
  });

  test.describe("Accessibility", () => {
    test("trigger exposes aria-haspopup='menu'", async ({ initTestBed, page }) => {
      await initTestBed(`<Share />`, EXT);
      await expect(page.getByTestId("share-trigger")).toHaveAttribute(
        "aria-haspopup",
        "menu",
      );
    });

    test("trigger toggles aria-expanded as the menu opens and closes", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<Share />`, EXT);
      const trigger = page.getByTestId("share-trigger");
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await trigger.click();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await trigger.click();
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    test("menu has role='menu' and items have role='menuitem'", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<Share />`, EXT);
      await page.getByTestId("share-trigger").click();
      await expect(page.getByRole("menu")).toBeVisible();
      // 5 default items
      await expect(page.getByRole("menuitem")).toHaveCount(5);
    });
  });

  test.describe("Theme Variables", () => {
    test("applies 'backgroundColor-Share' to the trigger", async ({
      initTestBed,
      page,
    }) => {
      const EXPECTED = "rgb(255, 0, 0)";
      await initTestBed(`<Share />`, {
        ...EXT,
        testThemeVars: { "backgroundColor-Share": EXPECTED },
      });
      await expect(page.getByTestId("share-trigger")).toHaveCSS(
        "background-color",
        EXPECTED,
      );
    });

    test("applies 'color-Share' to the trigger", async ({ initTestBed, page }) => {
      const EXPECTED = "rgb(0, 128, 0)";
      await initTestBed(`<Share />`, {
        ...EXT,
        testThemeVars: { "color-Share": EXPECTED },
      });
      await expect(page.getByTestId("share-trigger")).toHaveCSS("color", EXPECTED);
    });

    test("applies 'backgroundColor-ShareMenu' to the menu", async ({
      initTestBed,
      page,
    }) => {
      const EXPECTED = "rgb(0, 0, 255)";
      await initTestBed(`<Share />`, {
        ...EXT,
        testThemeVars: { "backgroundColor-ShareMenu": EXPECTED },
      });
      await page.getByTestId("share-trigger").click();
      await expect(page.getByTestId("share-menu")).toHaveCSS(
        "background-color",
        EXPECTED,
      );
    });
  });
});
