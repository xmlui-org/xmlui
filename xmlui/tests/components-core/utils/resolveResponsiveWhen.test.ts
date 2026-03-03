import { describe, expect, it } from "vitest";
import type { ContainerState } from "../../../src/components-core/rendering/ContainerWrapper";
import type { AppContextObject } from "../../../src/abstractions/AppContextDefs";
import { resolveResponsiveWhen } from "../../../src/components-core/utils/extractParam";

describe("resolveResponsiveWhen", () => {
  const emptyState: ContainerState = {};
  const mockAppContext = (sizeIndex: number): AppContextObject =>
    ({
      mediaSize: {
        phone: sizeIndex === 0,
        landscapePhone: sizeIndex === 1,
        tablet: sizeIndex === 2,
        desktop: sizeIndex === 3,
        largeDesktop: sizeIndex === 4,
        xlDesktop: sizeIndex === 5,
        smallScreen: sizeIndex < 3,
        largeScreen: sizeIndex >= 3,
        size: ["xs", "sm", "md", "lg", "xl", "xxl"][sizeIndex],
        sizeIndex,
      },
    }) as any;

  // --- Test: No responsiveWhen, uses base when
  it("No responsiveWhen delegates to base when (true)", () => {
    const result = resolveResponsiveWhen("true", undefined, emptyState, mockAppContext(2));
    expect(result).equal(true);
  });

  it("No responsiveWhen delegates to base when (false)", () => {
    const result = resolveResponsiveWhen("false", undefined, emptyState, mockAppContext(2));
    expect(result).equal(false);
  });

  it("No responsiveWhen with undefined when is implicitly true", () => {
    const result = resolveResponsiveWhen(undefined, undefined, emptyState, mockAppContext(2));
    expect(result).equal(true);
  });

  // --- Test: Empty responsiveWhen object, uses base when
  it("Empty responsiveWhen object delegates to base when", () => {
    const result = resolveResponsiveWhen("true", {}, emptyState, mockAppContext(2));
    expect(result).equal(true);
  });

  // --- Test: Single responsive rule at exact breakpoint
  it("when-md=true at md (sizeIndex=2) returns true", () => {
    const result = resolveResponsiveWhen(undefined, { md: "true" }, emptyState, mockAppContext(2));
    expect(result).equal(true);
  });

  it("when-md=false at md (sizeIndex=2) returns false", () => {
    const result = resolveResponsiveWhen(undefined, { md: "false" }, emptyState, mockAppContext(2));
    expect(result).equal(false);
  });

  // --- Test: Responsive rule inherited upward (Tailwind mobile-first)
  it("when-md=true at lg (sizeIndex=3) inherits md (returns true)", () => {
    const result = resolveResponsiveWhen(undefined, { md: "true" }, emptyState, mockAppContext(3));
    expect(result).equal(true);
  });

  it("when-md=false at lg (sizeIndex=3) inherits md (returns false)", () => {
    const result = resolveResponsiveWhen(undefined, { md: "false" }, emptyState, mockAppContext(3));
    expect(result).equal(false);
  });

  it("when-md=true at xl (sizeIndex=4) inherits md (returns true)", () => {
    const result = resolveResponsiveWhen(undefined, { md: "true" }, emptyState, mockAppContext(4));
    expect(result).equal(true);
  });

  // --- Test: No matching rule below defined breakpoint returns false
  it("when-md=true at xs (sizeIndex=0) has no matching rule — falls back to base when (undefined → true)", () => {
    const result = resolveResponsiveWhen(undefined, { md: "true" }, emptyState, mockAppContext(0));
    expect(result).equal(true);
  });

  it("when-md=true at sm (sizeIndex=1) has no matching rule — falls back to base when (undefined → true)", () => {
    const result = resolveResponsiveWhen(undefined, { md: "true" }, emptyState, mockAppContext(1));
    expect(result).equal(true);
  });

  // --- Test: Multiple rules, most specific wins (walk down from current)
  it("when-md=false + when-lg=true at lg (sizeIndex=3) returns true (lg wins)", () => {
    const result = resolveResponsiveWhen(undefined, { md: "false", lg: "true" }, emptyState, mockAppContext(3));
    expect(result).equal(true);
  });

  it("when-md=false + when-lg=true at md (sizeIndex=2) returns false (md matches)", () => {
    const result = resolveResponsiveWhen(undefined, { md: "false", lg: "true" }, emptyState, mockAppContext(2));
    expect(result).equal(false);
  });

  it("when-xs=true + when-md=false at md (sizeIndex=2) returns false (md wins)", () => {
    const result = resolveResponsiveWhen(undefined, { xs: "true", md: "false" }, emptyState, mockAppContext(2));
    expect(result).equal(false);
  });

  it("when-xs=true + when-md=false at sm (sizeIndex=1) returns true (xs inherited)", () => {
    const result = resolveResponsiveWhen(undefined, { xs: "true", md: "false" }, emptyState, mockAppContext(1));
    expect(result).equal(true);
  });

  // --- Test: With base when (base when is ignored if responsiveWhen exists)
  it("when=true + when-md=false at md returns false (responsive wins)", () => {
    const result = resolveResponsiveWhen("true", { md: "false" }, emptyState, mockAppContext(2));
    expect(result).equal(false);
  });

  it("when=true + when-md=false at xs — no match, falls back to base when=true → true", () => {
    const result = resolveResponsiveWhen("true", { md: "false" }, emptyState, mockAppContext(0));
    expect(result).equal(true);
  });

  it("when=false + when-md=true at xs — no match, falls back to base when=false → false", () => {
    const result = resolveResponsiveWhen("false", { md: "true" }, emptyState, mockAppContext(0));
    expect(result).equal(false);
  });

  // --- Test: Boolean literals (not strings)
  it("Boolean literal when-md=true returns true", () => {
    const result = resolveResponsiveWhen(undefined, { md: true }, emptyState, mockAppContext(2));
    expect(result).equal(true);
  });

  it("Boolean literal when-md=false returns false", () => {
    const result = resolveResponsiveWhen(undefined, { md: false }, emptyState, mockAppContext(2));
    expect(result).equal(false);
  });

  // --- Test: Expression strings
  it("Expression string when-md={isVisible} evaluates correctly", () => {
    const state: ContainerState = { isVisible: true };
    const result = resolveResponsiveWhen(undefined, { md: "{isVisible}" }, state, mockAppContext(2));
    expect(result).equal(true);
  });

  // --- Test: sizeIndex undefined (not yet computed)
  it("sizeIndex undefined falls back to base when", () => {
    const appCtx = { mediaSize: undefined } as any;
    const result = resolveResponsiveWhen("true", { md: "false" }, emptyState, appCtx);
    expect(result).equal(true);
  });

  // --- Test: Complex cascade (xs → xxl)
  it("Cascade test: when-lg=true at xl (sizeIndex=4) returns true", () => {
    const result = resolveResponsiveWhen(undefined, { lg: "true" }, emptyState, mockAppContext(4));
    expect(result).equal(true);
  });

  it("Cascade test: when-xl=true at xxl (sizeIndex=5) returns true", () => {
    const result = resolveResponsiveWhen(undefined, { xl: "true" }, emptyState, mockAppContext(5));
    expect(result).equal(true);
  });

  it("Cascade test: when-xxl=true at sm (sizeIndex=1) has no match — falls back to base when (undefined → true)", () => {
    const result = resolveResponsiveWhen(undefined, { xxl: "true" }, emptyState, mockAppContext(1));
    expect(result).equal(true);
  });
});
