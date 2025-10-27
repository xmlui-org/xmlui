import { test, expect } from "xmlui/testing";

test("renders HeroSection", async ({ initTestBed, page }) => {
  // const src = `
  // <App>
  //   <HeroSection
  //     backgroundColor="lightblue"
  //     fullWidthBackground="false"
  //     headline="Modern Project Management
  //             You Truly Own
  //     subheadline="A fast, intuitive tool you can host, shape, and trust."
  //     mainText="Manage your projects, tasks, and teams with ease using our open-source project management tool. Enjoy full control over your data and workflows."
  //     ctaButtonIcon="home"
  //     ctaButtonText="Go Home"
  //     onCtaClick="() => toast('CTA Clicked')">
  //     BlaBlaBla
  //   </HeroSection>
  // </App>
  // `;
  const src = `
  <App>
      Modern Project Management
  </App>
  `;
  await initTestBed(src);
  await expect(page.getByText("Modern Project Management")).toBeVisible();
});
