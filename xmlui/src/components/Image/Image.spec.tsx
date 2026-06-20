import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Image } from "./ImageReact";

describe("Image migration", () => {
  it("uses class-based visual states for inline display", () => {
    const html = renderToStaticMarkup(
      <Image src="/resources/test-image-100x100.jpg" inline />,
    );

    expect(html).toContain("xmlui-imageRoot");
    expect(html).toContain("xmlui-imageInline");
    expect(html).toContain("xmlui-imageInlineWrapper");
    expect(html).not.toContain("display:inline");
  });

  it("uses CSS variables only for dynamic image values", () => {
    const html = renderToStaticMarkup(
      <Image src="/resources/test-image-100x100.jpg" fit="cover" aspectRatio="16/9" />,
    );

    expect(html).toContain("--xmlui-objectFit-Image:cover");
    expect(html).toContain("--xmlui-aspectRatio-Image:16 / 9");
  });
});
