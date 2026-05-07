import { expect, test } from "xmlui/testing";

const EXT = { extensionIds: "xmlui-docs-blocks" };

test.describe("Share", () => {
  test.describe("Basic Functionality", () => {
    test("renders the split-button with the default copy label and a chevron toggle", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<Share />`, EXT);
      await expect(page.getByRole("button", { name: "Copy page" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Open share menu" })).toBeVisible();
    });

    test("renders the primary button with a custom 'label'", async ({ initTestBed, page }) => {
      await initTestBed(`<Share label="Save page" />`, EXT);
      await expect(page.getByRole("button", { name: "Save page" })).toBeVisible();
    });

    test("clicking the primary button copies 'markdownContent' to the clipboard without opening the menu", async ({
      initTestBed,
      page,
    }) => {
      const { clipboard } = await initTestBed(
        `<Share markdownContent="# Hello\nThis is the page content." />`,
        EXT,
      );
      await page.getByRole("button", { name: "Copy page" }).click();
      const clipboardText = await clipboard.read();
      expect(clipboardText).toBe("# Hello\nThis is the page content.");
      await expect(page.getByRole("menu")).toHaveCount(0);
    });

    test("primary button label swaps to the copied confirmation after clicking", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(
        `<Share markdownContent="hi" copiedLabel="Copied to clipboard" />`,
        EXT,
      );
      await page.getByRole("button", { name: "Copy page" }).click();
      await expect(
        page.getByRole("button", { name: "Copied to clipboard" }),
      ).toBeVisible();
    });

    test("menu is closed by default", async ({ initTestBed, page }) => {
      await initTestBed(`<Share />`, EXT);
      await expect(page.getByRole("menu")).toHaveCount(0);
    });

    test("opens the menu when the chevron is clicked", async ({ initTestBed, page }) => {
      await initTestBed(`<Share />`, EXT);
      await page.getByRole("button", { name: "Open share menu" }).click();
      await expect(page.getByRole("menu")).toBeVisible();
    });

    test("closes the menu when the chevron is clicked again", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<Share />`, EXT);
      const toggle = page.getByRole("button", { name: "Open share menu" });
      await toggle.click();
      await expect(page.getByRole("menu")).toBeVisible();
      await toggle.click();
      await expect(page.getByRole("menu")).toHaveCount(0);
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
      await page.getByRole("button", { name: "Open share menu" }).click();
      await expect(page.getByRole("menu")).toBeVisible();
      await page.getByTestId("outside").click();
      await expect(page.getByRole("menu")).toHaveCount(0);
    });

    test("closes the menu when Escape is pressed", async ({ initTestBed, page }) => {
      await initTestBed(`<Share />`, EXT);
      await page.getByRole("button", { name: "Open share menu" }).click();
      await expect(page.getByRole("menu")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("menu")).toHaveCount(0);
    });

    test("renders all five share items by default", async ({ initTestBed, page }) => {
      await initTestBed(`<Share />`, EXT);
      await page.getByRole("button", { name: "Open share menu" }).click();
      await expect(page.getByRole("menuitem", { name: /Copy page/ })).toBeVisible();
      await expect(page.getByRole("menuitem", { name: /Open in ChatGPT/ })).toBeVisible();
      await expect(page.getByRole("menuitem", { name: /Open in Claude/ })).toBeVisible();
      await expect(
        page.getByRole("menuitem", { name: /Share in X \(Twitter\)/ }),
      ).toBeVisible();
      await expect(
        page.getByRole("menuitem", { name: /Share in LinkedIn/ }),
      ).toBeVisible();
    });

    test("renders the default item descriptions", async ({ initTestBed, page }) => {
      await initTestBed(`<Share />`, EXT);
      await page.getByRole("button", { name: "Open share menu" }).click();
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
      await page.getByRole("button", { name: "Open share menu" }).click();
      await expect(page.getByRole("menuitem", { name: /Copy page/ })).toBeVisible();
      await expect(
        page.getByRole("menuitem", { name: /Share in X \(Twitter\)/ }),
      ).toBeVisible();
      await expect(page.getByRole("menuitem", { name: /Open in ChatGPT/ })).toHaveCount(0);
      await expect(page.getByRole("menuitem", { name: /Open in Claude/ })).toHaveCount(0);
      await expect(
        page.getByRole("menuitem", { name: /Share in LinkedIn/ }),
      ).toHaveCount(0);
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
      await expect(page.getByRole("button", { name: "Copy page" })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Open share menu" })).toHaveCount(0);
    });

    test("custom 'copyLabel' is shown for the menu copy item", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<Share copyLabel="Copy this page" />`, EXT);
      await page.getByRole("button", { name: "Open share menu" }).click();
      await expect(page.getByRole("menuitem", { name: /Copy this page/ })).toBeVisible();
    });

    test("custom 'chatGptLabel' is shown for the ChatGPT item", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<Share chatGptLabel="Open with GPT" />`, EXT);
      await page.getByRole("button", { name: "Open share menu" }).click();
      await expect(
        page.getByRole("menuitem", { name: /Open with GPT/ }),
      ).toBeVisible();
    });

    test("menu Copy page action writes 'markdownContent' to the clipboard", async ({
      initTestBed,
      page,
    }) => {
      const { clipboard } = await initTestBed(
        `<Share markdownContent="# Hello\nThis is the page content." />`,
        EXT,
      );
      await page.getByRole("button", { name: "Open share menu" }).click();
      await page.getByRole("menuitem", { name: /Copy page/ }).click();
      const clipboardText = await clipboard.read();
      expect(clipboardText).toBe("# Hello\nThis is the page content.");
    });

    test("menu copy item swaps the label to the copied confirmation", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(
        `<Share markdownContent="hi" copiedLabel="Copied to clipboard" />`,
        EXT,
      );
      await page.getByRole("button", { name: "Open share menu" }).click();
      await page.getByRole("menuitem", { name: /Copy page/ }).click();
      await expect(
        page.getByRole("menuitem", { name: /Copied to clipboard/ }),
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
      await page.getByRole("button", { name: "Open share menu" }).click();
      await page.getByRole("menuitem", { name: /Open in ChatGPT/ }).click();
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
      await page.getByRole("button", { name: "Open share menu" }).click();
      await page.getByRole("menuitem", { name: /Open in Claude/ }).click();
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
      await page.getByRole("button", { name: "Open share menu" }).click();
      await page.getByRole("menuitem", { name: /Share in X \(Twitter\)/ }).click();
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
      await page.getByRole("button", { name: "Open share menu" }).click();
      await page.getByRole("menuitem", { name: /Share in LinkedIn/ }).click();
      const url = await page.evaluate(() => (window as any).__lastOpen as string);
      expect(url.startsWith("https://www.linkedin.com/feed/?shareActive=true")).toBe(true);
      expect(url).toContain(
        `text=${encodeURIComponent("Hello world\n\nhttps://example.com/post")}`,
      );
    });

    test("clicking an external item closes the menu", async ({ initTestBed, page }) => {
      await initTestBed(
        `<Share pageUrl="https://example.com/post" />`,
        EXT,
      );
      await page.evaluate(() => {
        window.open = (() => null) as typeof window.open;
      });
      await page.getByRole("button", { name: "Open share menu" }).click();
      await expect(page.getByRole("menu")).toBeVisible();
      await page.getByRole("menuitem", { name: /Open in Claude/ }).click();
      await expect(page.getByRole("menu")).toHaveCount(0);
    });
  });

  test.describe("Accessibility", () => {
    test("toggle exposes aria-haspopup='menu'", async ({ initTestBed, page }) => {
      await initTestBed(`<Share />`, EXT);
      await expect(
        page.getByRole("button", { name: "Open share menu" }),
      ).toHaveAttribute("aria-haspopup", "menu");
    });

    test("toggle's aria-expanded reflects the menu open state", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<Share />`, EXT);
      const toggle = page.getByRole("button", { name: "Open share menu" });
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    test("menu has role='menu' and exposes five menuitems by default", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<Share />`, EXT);
      await page.getByRole("button", { name: "Open share menu" }).click();
      await expect(page.getByRole("menu")).toBeVisible();
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
      await expect(page.getByRole("button", { name: "Copy page" })).toHaveCSS(
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
      await expect(page.getByRole("button", { name: "Copy page" })).toHaveCSS(
        "color",
        EXPECTED,
      );
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
      await page.getByRole("button", { name: "Open share menu" }).click();
      await expect(page.getByRole("menu")).toHaveCSS("background-color", EXPECTED);
    });
  });
});
