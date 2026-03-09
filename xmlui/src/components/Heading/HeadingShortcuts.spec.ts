import { test, expect } from "../../testing/fixtures";

// Tests for the H1–H6 shortcut components (specialised wrappers around Heading).
// Each level is tested in a single initTestBed call that covers:
//   1. Basic render with text content
//   2. The value property
//   3. Equivalence with <Heading level="hN">
//   4. The level prop is ignored (HN is always level N regardless)

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

for (const level of ["h1", "h2", "h3", "h4", "h5", "h6"] as const) {
  const Tag = level.toUpperCase(); // H1, H2, …, H6
  const otherLevel = level === "h1" ? "h3" : "h1"; // a different level for "ignores level" test

  test.describe(`Basic Functionality — ${Tag}`, () => {
    test(`${Tag}: renders correctly, matches Heading level="${level}", ignores level override`, async ({
      initTestBed,
      createHeadingDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <!-- 1. basic text content render -->
          <${Tag} testId="basic">Test Heading</${Tag}>

          <!-- 2. value property -->
          <${Tag} testId="valueProp" value="Value Property Text" />

          <!-- 3. equivalence: Heading with level="${level}" should render the same tag -->
          <Heading testId="generic" level="${level}">Content</Heading>
          <${Tag} testId="specialized">Content</${Tag}>

          <!-- 4. level prop is ignored: should still render as ${level} -->
          <${Tag} testId="ignoresLevel" level="${otherLevel}">Should be ${level}</${Tag}>
        </Fragment>
      `);

      const basicDriver      = await createHeadingDriver("basic");
      const valuePropDriver  = await createHeadingDriver("valueProp");
      const genericDriver    = await createHeadingDriver("generic");
      const specializedDriver = await createHeadingDriver("specialized");
      const ignoresDriver    = await createHeadingDriver("ignoresLevel");

      // 1. Basic render
      await expect(basicDriver.component).toBeVisible();
      await expect(basicDriver.component).toContainText("Test Heading");
      await expect(basicDriver.component).toHaveRole("heading");
      expect((await basicDriver.getComponentTagName()).toLowerCase()).toBe(level);

      // 2. Value property
      await expect(valuePropDriver.component).toBeVisible();
      await expect(valuePropDriver.component).toContainText("Value Property Text");
      await expect(valuePropDriver.component).toHaveRole("heading");
      expect((await valuePropDriver.getComponentTagName()).toLowerCase()).toBe(level);

      // 3. Equivalence with generic Heading
      const genericTag     = (await genericDriver.getComponentTagName()).toLowerCase();
      const specializedTag = (await specializedDriver.getComponentTagName()).toLowerCase();
      expect(genericTag).toBe(level);
      expect(specializedTag).toBe(level);
      expect(genericTag).toEqual(specializedTag);
      await expect(genericDriver.component).toHaveRole("heading");
      await expect(specializedDriver.component).toHaveRole("heading");

      // 4. Level prop is ignored
      await expect(ignoresDriver.component).toBeVisible();
      await expect(ignoresDriver.component).toContainText(`Should be ${level}`);
      expect((await ignoresDriver.getComponentTagName()).toLowerCase()).toBe(level);
    });
  });
}
