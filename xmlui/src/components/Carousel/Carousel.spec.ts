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

test.skip("component applies theme variables correctly", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests

  await initTestBed(
    `<Carousel>
      <CarouselItem>Slide 1</CarouselItem>
      <CarouselItem>Slide 2</CarouselItem>
    </Carousel>`,
    {
      testThemeVars: {
        "backgroundColor-control-Carousel": "rgb(255, 0, 0)",
        "textColor-control-Carousel": "rgb(0, 0, 255)",
        "width-indicator-Carousel": "20px",
      },
    },
  );

  // Check control button styling
  const control = page.locator(".control").first();
  await expect(control).toHaveCSS("background-color", "rgb(255, 0, 0)");
  await expect(control).toHaveCSS("color", "rgb(0, 0, 255)");

  // Check indicator styling
  const indicator = page.locator(".indicator").first();
  await expect(indicator).toHaveCSS("width", "20px");
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
    await page.getByRole("button", { name: "Next Slide" }).click({ clickCount: itemNum, delay: 100 });

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
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.skip("component works correctly with custom content", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests

  await initTestBed(
    `
    <Carousel>
      <CarouselItem>
        <Card>
          <CardHeader>Card 1 Header</CardHeader>
          <CardBody>Card 1 Content</CardBody>
        </Card>
      </CarouselItem>
      <CarouselItem>
        <Card>
          <CardHeader>Card 2 Header</CardHeader>
          <CardBody>Card 2 Content</CardBody>
        </Card>
      </CarouselItem>
    </Carousel>
  `,
    {},
  );

  // Verify complex content renders correctly
  await expect(page.locator("text=Card 1 Header")).toBeVisible();
  await expect(page.locator("text=Card 1 Content")).toBeVisible();

  // Navigate to second slide
  await page.locator(".controlNext").click();
  await page.waitForTimeout(500);

  // Verify second card is visible
  await expect(page.locator("text=Card 2 Header")).toBeVisible();
  await expect(page.locator("text=Card 2 Content")).toBeVisible();
});

test.skip("component handles custom control icons", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests

  await initTestBed(
    `
    <Carousel prevIcon="chevronleft" nextIcon="chevronright">
      <CarouselItem>Slide 1</CarouselItem>
      <CarouselItem>Slide 2</CarouselItem>
    </Carousel>
  `,
    {},
  );

  // Verify custom icons are used
  await expect(page.locator(".controlPrev [data-icon-name='chevronleft']")).toBeVisible();
  await expect(page.locator(".controlNext [data-icon-name='chevronright']")).toBeVisible();
});

test.skip("component works without indicators and controls", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests

  await initTestBed(
    `
    <Carousel indicators={false} controls={false}>
      <CarouselItem>Slide 1</CarouselItem>
      <CarouselItem>Slide 2</CarouselItem>
    </Carousel>
  `,
    {},
  );

  // Verify carousel container renders
  await expect(page.locator(".embla")).toBeVisible();

  // Verify indicators are not visible
  await expect(page.locator(".indicators")).toBeHidden();

  // Verify controls are not visible
  await expect(page.locator(".controlPrev")).toBeHidden();
  await expect(page.locator(".controlNext")).toBeHidden();
});
