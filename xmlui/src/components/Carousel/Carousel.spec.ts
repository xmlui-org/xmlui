import { getBounds, SKIP_REASON } from "../../testing/component-test-helpers";
import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders", async ({ page, initTestBed }) => {
    await initTestBed(`<Carousel testId="carousel"></Carousel>`);
    await expect(page.getByTestId("carousel")).toBeVisible();
  });

  test("component renders with correct role", async ({ page, initTestBed }) => {
    await initTestBed(`<Carousel></Carousel>`);
    await expect(page.getByRole("region")).toBeVisible();
  });

  // NOTE: all carousel items are visible by default in embla-carousel
  // From this point on, instead of visibility checks, we check that the correct slide is in the viewport
  test("component renders with correct role on items", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Carousel>
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </Carousel>
    `);
    const slides = page.getByRole("region").getByRole("group");
    await expect(slides).toHaveCount(3);
    await expect(slides.nth(0)).toContainText("Slide 1");
    await expect(slides.nth(1)).toContainText("Slide 2");
    await expect(slides.nth(2)).toContainText("Slide 3");
  });

  test("renders slide #2 if startIndex is 1", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Carousel startIndex="1">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </Carousel>
    `);
    await expect(page.getByRole("region").getByRole("group").nth(1)).toBeInViewport();
  });

  test("controls prop displays controls", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Carousel controls="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </Carousel>
    `);
    await expect(page.getByRole("button", { name: "Previous Slide" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next Slide" })).toBeVisible();
  });

  test("component scrolls to next slide on control click", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Carousel controls="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </Carousel>
    `);
    // Click next button
    await page.getByRole("button", { name: "Next Slide" }).click();

    // Verify second slide is now visible
    await expect(page.getByRole("region").getByRole("group").nth(1)).toBeInViewport();
  });

  test("component scrolls to previous slide on control click", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Carousel startIndex="1" controls="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </Carousel>
    `);
    // Verify we start on slide 2
    await expect(page.getByRole("region").getByRole("group").nth(1)).toBeInViewport();

    // Click previous button
    await page.getByRole("button", { name: "Previous Slide" }).click();

    // Verify first slide is now visible
    const firstSlide = page.getByRole("region").getByRole("group").first();
    await expect(firstSlide).toBeInViewport();
  });

  test("component navigates to slide on indicator click", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Carousel>
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </Carousel>
    `);

    // Click on the third indicator
    const indicators = page.getByRole("tab", { name: "Go to slide 3" });
    await indicators.click();

    // Verify third slide is visible
    const thirdSlide = page.getByRole("region").getByRole("group").nth(2);
    await expect(thirdSlide).toBeInViewport();
  });

  test("component loops correctly when loop is enabled", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Carousel loop="true" startIndex="2">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </Carousel>
    `);
    // Verify we're on the last slide
    await expect(page.getByRole("region").getByRole("group").nth(2)).toBeInViewport();

    // Click next again to loop back to first slide
    await page.getByRole("button", { name: "Next Slide" }).click();

    // Verify we're back on the first slide
    await expect(page.getByRole("region").getByRole("group").first()).toBeInViewport();
  });

  test("component autoplay works correctly", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Carousel autoplay="true" autoplayInterval="100">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </Carousel>
    `);
    const slides = page.getByRole("region").getByRole("group");

    // Verify first slide is initially visible
    await expect(slides.first()).toBeInViewport();

    await page.waitForTimeout(200);
    await expect(slides.nth(1)).toBeInViewport();
  });

  // TODO: handle vertical test
  test.skip(
    "component renders with vertical orientation",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ page, initTestBed }) => {
      await initTestBed(`
      <Carousel orientation="vertical">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </Carousel>
    `);
    },
  );
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

// --- Used this resource for a11y testing best practices: https://www.w3.org/WAI/ARIA/apg/patterns/carousel/
test.describe("Accessibility", () => {
  test("regular carousel has correct a11y attributes", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Carousel indicators="false">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>
    `);
    const carousel = page.getByRole("region");
    const slides = carousel.getByRole("group");

    await expect(carousel).toHaveAttribute("aria-roledescription", "carousel");
    await expect(slides.first()).toHaveAttribute("aria-roledescription", "slide");
  });

  test("tabbed carousel has correct a11y attributes", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Carousel indicators="true">
        <CarouselItem>Slide 1</CarouselItem>
      </Carousel>
    `);
    const carousel = page.getByRole("region");
    const slides = carousel.getByRole("group");

    await expect(slides.first()).toHaveAttribute("role", "group tabpanel");
    await expect(slides.first()).not.toHaveAttribute("aria-roledescription", "slide");
  });

  test("carousel controls have correct a11y attributes", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Carousel controls="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>
    `);
    const prevControl = page.getByRole("button", { name: "Previous Slide" });
    const nextControl = page.getByRole("button", { name: "Next Slide" });

    await expect(prevControl).toHaveAttribute("aria-label", "Previous Slide");
    await expect(nextControl).toHaveAttribute("aria-label", "Next Slide");
  });

  test("component is keyboard navigable", async ({ page, initTestBed }) => {
    await initTestBed(`
    <Carousel>
      <CarouselItem>Slide 1</CarouselItem>
      <CarouselItem>Slide 2</CarouselItem>
      <CarouselItem>Slide 3</CarouselItem>
    </Carousel>
  `);

    // Focus the carousel container
    await page.getByRole("region").focus();

    // Press right arrow key
    await page.keyboard.press("ArrowRight");

    // Verify second slide is visible
    const secondSlide = page.getByRole("region").getByRole("group").nth(1);
    await expect(secondSlide).toBeInViewport();

    // Press left arrow key
    await page.keyboard.press("ArrowLeft");

    // Verify first slide is visible again
    const firstSlide = page.getByRole("region").getByRole("group").first();
    await expect(firstSlide).toBeInViewport();
  });
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.describe("Visual States", () => {
  test("component control background color", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel controls="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "backgroundColor-control-Carousel": "rgb(255, 0, 0)",
        },
      },
    );
    const control = page.getByRole("button", { name: "Next Slide" });
    await expect(control).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test("component control text color", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel controls="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "textColor-control-Carousel": "rgb(0, 0, 255)",
        },
      },
    );
    const control = page.getByRole("button", { name: "Next Slide" });
    await expect(control).toHaveCSS("color", "rgb(0, 0, 255)");
  });

  test("component indicator width", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel indicators="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "width-indicator-Carousel": "20px",
        },
      },
    );
    const indicator = page.getByRole("tab", { name: "Go to slide 1" });
    await expect(indicator).toHaveCSS("width", "20px");
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test("component handles many slides efficiently", async ({ page, initTestBed }) => {
    const itemNum = 20;

    // Create many carousel items
    let carouselItems = "";
    for (let i = 1; i <= itemNum; i++) {
      carouselItems += `<CarouselItem>Slide ${i}</CarouselItem>`;
    }

    await initTestBed(`
      <Carousel>
        ${carouselItems}
      </Carousel>
    `);

    // Verify carousel renders
    await expect(page.getByRole("region")).toBeVisible();
    const slides = page.getByRole("region").getByRole("group");

    // Verify all slides are created
    await expect(slides).toHaveCount(itemNum);

    // Verify we can navigate through slides
    await page
      .getByRole("button", { name: "Next Slide" })
      .click({ clickCount: itemNum, delay: 100 });

    // Verify we've navigated to the correct slide
    await expect(slides.last()).toBeInViewport();
  });

  test("component displays tab indicators for many slides", async ({ page, initTestBed }) => {
    // Create many carousel items
    let carouselItems = "";
    for (let i = 1; i <= 20; i++) {
      carouselItems += `<CarouselItem>Slide ${i}</CarouselItem>`;
    }

    await initTestBed(`
      <Carousel indicators="true" controls="false">
        ${carouselItems}
      </Carousel>
    `);

    // Verify carousel renders
    await expect(page.getByRole("region").getByRole("button")).toHaveCount(20);
  });

  test("component works without indicators and controls", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Carousel indicators="false" controls="false">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>
    `);

    // Verify carousel container renders
    await expect(page.getByRole("region")).toBeVisible();

    // Verify indicators are not visible
    await expect(page.getByRole("region").getByRole("tablist")).not.toBeVisible();

    // Verify controls are not visible
    await expect(page.getByRole("region").getByRole("button", { name: "Previous Slide" })).not.toBeVisible();
    await expect(page.getByRole("region").getByRole("button", { name: "Next Slide" })).not.toBeVisible();
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.describe("Integration", () => {
  test("component works correctly with custom content", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Carousel>
        <CarouselItem>
          <Card title="Card 1" />
        </CarouselItem>
        <CarouselItem>
          <Card title="Card 2" />
        </CarouselItem>
      </Carousel>
    `);
    await expect(page.getByRole("group").first()).toContainText("Card 1");
    await expect(page.getByRole("group").last()).toContainText("Card 2");
  });

  test.skip(
    "component handles custom control icon on Prev button",
    SKIP_REASON.XMLUI_BUG("Icon does not show up"),
    async ({ page, initTestBed }) => {
      await initTestBed(
        `
          <Carousel controls="true" prevIcon="test">
            <CarouselItem>Slide 1</CarouselItem>
            <CarouselItem>Slide 2</CarouselItem>
          </Carousel>    
        `,
        {
          resources: {
            "icon.test": "resources/bell.svg",
          },
        },
      );
      const useElement = page.getByRole("button", { name: "Previous Slide" }).locator("svg use");
      await expect(useElement).toHaveAttribute("href", expect.stringMatching(/#bell/));
    },
  );

  test.skip(
    "component handles custom control icon on Next button",
    SKIP_REASON.XMLUI_BUG("Icon does not show up"),
    async ({ page, initTestBed }) => {
      await initTestBed(
        `
          <Carousel controls="true" nextIcon="test">
            <CarouselItem>Slide 1</CarouselItem>
            <CarouselItem>Slide 2</CarouselItem>
          </Carousel>    
        `,
        {
          resources: {
            "icon.test": "resources/bell.svg",
          },
        },
      );
      const useElement = page.getByRole("button", { name: "Next Slide" }).locator("svg use");
      await expect(useElement).toHaveAttribute("href", expect.stringMatching(/#bell/));
    },
  );
});
