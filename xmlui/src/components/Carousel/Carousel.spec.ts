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
    await expect(page.getByRole("region")).toBeFocused();

    // Press right arrow key
    await page.keyboard.press("ArrowRight");

    // Verify second slide is visible
    const secondSlide = page.getByRole("region").getByRole("group").nth(1);
    await expect(secondSlide).toBeInViewport();

    // Press left arrow key
    await expect(secondSlide).toBeVisible();
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
  test("component width", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel width="500px">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`
    );
    const carousel = page.getByRole("region");
    await expect(carousel).toHaveCSS("width", "500px");
  });

  test("component height", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel height="500px">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`
    );
    const carousel = page.getByRole("region");
    await expect(carousel).toHaveCSS("height", "500px");
  });

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

  test("component control height", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel controls="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "height-control-Carousel": "50px",
        },
      },
    );
    const control = page.getByRole("button", { name: "Next Slide" });
    await expect(control).toHaveCSS("height", "50px");
  });

  test("component control width", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel controls="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "width-control-Carousel": "50px",
        },
      },
    );
    const control = page.getByRole("button", { name: "Next Slide" });
    await expect(control).toHaveCSS("width", "50px");
  });

  test("component control border radius", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel controls="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "borderRadius-control-Carousel": "10px",
        },
      },
    );
    const control = page.getByRole("button", { name: "Next Slide" });
    await expect(control).toHaveCSS("border-radius", "10px");
  });

  test("component control hover background color", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel controls="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "backgroundColor-control-hover-Carousel": "rgb(255, 165, 0)",
        },
      },
    );
    const control = page.getByRole("button", { name: "Next Slide" });
    await control.hover();
    await expect(control).toHaveCSS("background-color", "rgb(255, 165, 0)");
  });

  test("component control hover text color", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel controls="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "textColor-control-hover-Carousel": "rgb(255, 255, 255)",
        },
      },
    );
    const control = page.getByRole("button", { name: "Next Slide" });
    await control.hover();
    await expect(control).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("component control active background color", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel controls="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "backgroundColor-control-active-Carousel": "rgb(0, 128, 0)",
        },
      },
    );
    const control = page.getByRole("button", { name: "Next Slide" });
    await control.hover();
    await page.mouse.down();
    await expect(control).toHaveCSS("background-color", "rgb(0, 128, 0)");
  });

  test("component control active text color", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel controls="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "textColor-control-active-Carousel": "rgb(255, 255, 0)",
        },
      },
    );
    const control = page.getByRole("button", { name: "Next Slide" });
    await control.hover();
    await page.mouse.down();
    await expect(control).toHaveCSS("color", "rgb(255, 255, 0)");
  });

  test("component control disabled background color", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel controls="true" loop="false">
        <CarouselItem>Slide 1</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "backgroundColor-control-disabled-Carousel": "rgb(200, 200, 200)",
        },
      },
    );
    const control = page.getByRole("button", { name: "Next Slide" });
    await expect(control).toHaveCSS("background-color", "rgb(200, 200, 200)");
  });

  test("component control disabled text color", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel controls="true" loop="false">
        <CarouselItem>Slide 1</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "textColor-control-disabled-Carousel": "rgb(150, 150, 150)",
        },
      },
    );
    const control = page.getByRole("button", { name: "Next Slide" });
    await expect(control).toHaveCSS("color", "rgb(150, 150, 150)");
  });

  test("component indicator height", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel indicators="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "height-indicator-Carousel": "15px",
        },
      },
    );
    const indicator = page.getByRole("tab", { name: "Go to slide 1" });
    await expect(indicator).toHaveCSS("height", "15px");
  });

  test("component indicator background color", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel indicators="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "backgroundColor-indicator-Carousel": "rgb(100, 100, 100)",
        },
      },
    );
    const indicator = page.getByRole("tab", { name: "Go to slide 2" });
    await expect(indicator).toHaveCSS("background-color", "rgb(100, 100, 100)");
  });

  test("component indicator text color", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel indicators="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "textColor-indicator-Carousel": "rgb(50, 50, 50)",
        },
      },
    );
    const indicator = page.getByRole("tab", { name: "Go to slide 2" });
    await expect(indicator).toHaveCSS("color", "rgb(50, 50, 50)");
  });

  test("component indicator hover background color", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel indicators="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "backgroundColor-indicator-hover-Carousel": "rgb(150, 150, 255)",
        },
      },
    );
    const indicator = page.getByRole("tab", { name: "Go to slide 2" });
    await indicator.hover();
    await expect(indicator).toHaveCSS("background-color", "rgb(150, 150, 255)");
  });

  test("component indicator hover text color", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel indicators="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "textColor-indicator-hover-Carousel": "rgb(255, 100, 100)",
        },
      },
    );
    const indicator = page.getByRole("tab", { name: "Go to slide 2" });
    await indicator.hover();
    await expect(indicator).toHaveCSS("color", "rgb(255, 100, 100)");
  });

  test("component indicator active background color", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel indicators="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "backgroundColor-indicator-active-Carousel": "rgb(0, 0, 255)",
        },
      },
    );
    const indicator = page.getByRole("tab", { name: "Go to slide 1" });
    await expect(indicator).toHaveCSS("background-color", "rgb(0, 0, 255)");
  });

  test("component indicator active text color", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Carousel indicators="true">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </Carousel>`,
      {
        testThemeVars: {
          "textColor-indicator-active-Carousel": "rgb(255, 255, 255)",
        },
      },
    );
    const indicator = page.getByRole("tab", { name: "Go to slide 1" });
    await expect(indicator).toHaveCSS("color", "rgb(255, 255, 255)");
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
    await expect(page.getByRole("region").getByRole("tab")).toHaveCount(20);
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
    await expect(
      page.getByRole("region").getByRole("button", { name: "Previous Slide" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("region").getByRole("button", { name: "Next Slide" }),
    ).not.toBeVisible();
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

  test("component handles custom control icon on Prev button", async ({ page, initTestBed }) => {
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
  });

  test("component handles custom control icon on Next button", async ({ page, initTestBed }) => {
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
  });
});
