import { describe, expect, it } from "vitest";
import { matchThemeVar } from "../../../src/components-core/theming/hvar";

describe("Generate HVar chain", () => {
  it("Input:backgroundColor-TextArea--default--hover", () => {
    const ret = matchThemeVar("Input:backgroundColor-TextArea--default--hover", [
      {
        "backgroundColor-Input": "$yeah",
        "backgroundColor-TextArea--default--hover": "$something else"
      },
      {
        "backgroundColor-Input--hover": "$something",
      }
    ]);

    const expected = {
      forValue: "backgroundColor-TextArea--default--hover",
      matchedValue: "backgroundColor-Input--hover",
      from: [
        "backgroundColor-TextArea--default--hover",
        "backgroundColor-Input--default--hover",
        "backgroundColor-TextArea--hover",
        "backgroundColor-Input--hover",
        "backgroundColor-TextArea--default",
        "backgroundColor-Input--default",
        "backgroundColor-TextArea",
        "backgroundColor-Input",
      ],
    };

    expect(ret).eqls(expected);
  });

  it("backgroundColor-Button-primary-solid", () => {
    const ret = matchThemeVar("backgroundColor-Button-primary-solid", [{
      "backgroundColor-Button-primary-solid": "$something",
    }]);

    const expected = {
      forValue: "backgroundColor-Button-primary-solid",
      matchedValue: "backgroundColor-Button-primary-solid",
      from: ["backgroundColor-Button-primary-solid", "backgroundColor-Button-primary", "backgroundColor-Button-solid", "backgroundColor-Button"],
    };

    expect(ret).eqls(expected);
  });
});
