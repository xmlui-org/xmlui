import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Adornment } from "./InputAdornment";
import { InputDivider } from "./InputDivider";
import { InputLabel } from "./InputLabel";
import { PartialInput } from "./PartialInput";

describe("Input shared internals", () => {
  it("renders the old-compatible label shape", () => {
    const html = renderToStaticMarkup(
      <InputLabel text="Name" forFieldId="name-input" required disabled />,
    );

    expect(html).toContain("<label");
    expect(html).toContain('for="name-input"');
    expect(html).toContain("inputLabel");
    expect(html).toContain("disabled");
    expect(html).toContain("required");
    expect(html).toContain("Name");
  });

  it("renders adornments only when text or icon is present", () => {
    expect(renderToStaticMarkup(<Adornment />)).toBe("");

    const html = renderToStaticMarkup(<Adornment text="USD" iconName="search" />);
    expect(html).toContain("wrapper");
    expect(html).toContain('role="presentation"');
    expect(html).toContain('data-icon-name="search"');
    expect(html).toContain("USD");
  });

  it("renders dividers with the shared divider class", () => {
    const html = renderToStaticMarkup(<InputDivider separator=":" />);

    expect(html).toContain("inputDivider");
    expect(html).toContain(">:</span>");
  });

  it("renders partial input defaults and generated placeholder", () => {
    const inputRef = createRef<HTMLInputElement>();
    const html = renderToStaticMarkup(
      <PartialInput
        inputRef={inputRef}
        name="hour"
        ariaLabel="Hour"
        max={23}
        min={0}
        emptyCharacter="•"
        placeholderLength={2}
      />,
    );

    expect(html).toContain("partialInput");
    expect(html).toContain('data-input="true"');
    expect(html).toContain('inputMode="numeric"');
    expect(html).toContain('placeholder="••"');
    expect(html).toContain('type="number"');
  });
});
