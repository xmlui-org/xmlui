import { describe, expect, it } from "vitest";
import { matchThemeVar } from "../../../src/components-core/theming/hvar";

describe("Generate HVar chain", () => {
  it("Input:color-bg-TextArea-default--hover", () => {
    const ret = matchThemeVar("Input:color-bg-TextArea-default--hover", [
      {
        "color-bg-Input": "$yeah",
        "color-bg-TextArea-default--hover": "$something else"
      },
      {
        "color-bg-Input--hover": "$something",
      }
    ]);

    const expected = {
      forValue: "color-bg-TextArea-default--hover",
      matchedValue: "color-bg-Input--hover",
      from: [
        "color-bg-TextArea-default--hover",
        "color-bg-Input-default--hover",
        "color-bg-TextArea--hover",
        "color-bg-Input--hover",
        "color-bg-TextArea-default",
        "color-bg-Input-default",
        "color-bg-TextArea",
        "color-bg-Input",
      ],
    };

    expect(ret).eqls(expected);
  });

  it("color-bg-Button-primary-solid", () => {
    const ret = matchThemeVar("color-bg-Button-primary-solid", [{
      "color-bg-Button-primary-solid": "$something",
    }]);

    const expected = {
      forValue: "color-bg-Button-primary-solid",
      matchedValue: "color-bg-Button-primary-solid",
      from: ["color-bg-Button-primary-solid", "color-bg-Button-primary", "color-bg-Button-solid", "color-bg-Button"],
    };

    expect(ret).eqls(expected);
  });
});
