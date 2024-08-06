import { describe, expect, it } from "vitest";
import { matchThemeVar } from "@components-core/theming/hvar";

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

  // it(`color-bg-Button-primary-solid--hover`, () => {
  //   const chain = generateHVarChain("color-bg-Button-primary-solid--hover");
  //
  //   // backgroundColor: var(--nsoftware-color-bg-Button-primary-solid--hover,
  //   // var(--nsoftware-color-bg-Button-primary--hover,
  //   // var(--nsoftware-color-bg-Button-solid--hover,
  //   // var(--nsoftware-color-bg-Button--hover,
  //   // var(--nsoftware-color-bg-Button-primary-solid,
  //   // var(--nsoftware-color-bg-Button-primary,
  //   // var(--nsoftware-color-bg-Button-solid,
  //   // var(--nsoftware-color-bg-Button))))))))
  //
  //   const expected1 = {
  //     "color-bg-Button": "",
  //     "color-bg-Button-primary": "color-bg-Button",
  //     "color-bg-Button-solid": "color-bg-Button",
  //     "color-bg-Button-primary-solid": "color-bg-Button-primary" || "color-bg-Button-solid",
  //     "color-bg-Button--hover": "color-bg-Button",
  //     "color-bg-Button-primary--hover": "color-bg-Button--hover" || "color-bg-Button-primary",
  //     "color-bg-Button-solid--hover": "color-bg-Button--hover" || "color-bg-Button-solid",
  //     "color-bg-Button-primary-solid--hover":
  //       "color-bg-Button-primary--hover" ||
  //       "color-bg-Button-solid--hover" ||
  //       "color-bg-Button--hover" ||
  //       "color-bg-Button-primary-solid",
  //   };
  //
  //   expect(chain).eq(expected1);
  //
  //   // expect(parsed.attribute).equal("color-bg");
  //   // expect(parsed.component).equal("Button");
  //   // expect(parsed.traits).eqls(["primary", "solid"]);
  //   // expect(parsed.states).eqls(["active", "hover"]);
  // });
  //
  // it(`color-bg-Button-primary--hover--active`, () => {
  //   const chain = generateHVarChain("color-bg-Button-primary--hover--active");
  //
  //   // var(--nsoftware-color-bg-Button-primary--hover--active,
  //   // var(--nsoftware-color-bg-Button--hover--active,
  //   // var(--nsoftware-color-bg-Button-primary--active,
  //   // var(--nsoftware-color-bg-Button--active,
  //   // var(--nsoftware-color-bg-Button-primary--hover,
  //   // var(--nsoftware-color-bg-Button--hover,
  //   // var(--nsoftware-color-bg-Button-primary,
  //   // var(--nsoftware-color-bg-Button))))))));
  //
  //   const expected = {
  //     "color-bg-Button": "",
  //
  //     "color-bg-Button-primary": "color-bg-Button",
  //     "color-bg-Button-primary--hover": "color-bg-Button-primary",
  //     "color-bg-Button-primary--active": "color-bg-Button-primary",
  //
  //     "color-bg-Button--active": "color-bg-Button",
  //     "color-bg-Button--hover": "color-bg-Button",
  //     "color-bg-Button--hover--active": "color-bg-Button--hover" || "color-bg-Button--active",
  //     "color-bg-Button-primary--hover--active":
  //       "color-bg-Button--hover--active" ||
  //       "color-bg-Button-primary--hover" ||
  //       "color-bg-Button-primary--active" ||
  //       "color-bg-Button-primary",
  //   };
  //
  //   expect(chain).eq(expected);
  //
  //   // expect(parsed.attribute).equal("color-bg");
  //   // expect(parsed.component).equal("Button");
  //   // expect(parsed.traits).eqls(["primary", "solid"]);
  //   // expect(parsed.states).eqls(["active", "hover"]);
  // });
  //
  // it(`color-bg-Button-primary-solid--hover--active`, () => {
  //   const chain = generateHVarChain("Control:color-bg-Button-primary-solid--hover--active");
  //
  //   // var(--nsoftware-color-bg-Button-primary-solid--hover--active,
  //   // var(--nsoftware-color-bg-Button-primary--hover--active,
  //   // var(--nsoftware-color-bg-Button-solid--hover--active,
  //   // var(--nsoftware-color-bg-Button--hover--active,
  //   // var(--nsoftware-color-bg-Button-primary-solid--active,
  //   // var(--nsoftware-color-bg-Button-primary--active,
  //   // var(--nsoftware-color-bg-Button-solid--active,
  //   // var(--nsoftware-color-bg-Button--active,
  //   // var(--nsoftware-color-bg-Button-primary-solid--hover,
  //   // var(--nsoftware-color-bg-Button-primary--hover,
  //   // var(--nsoftware-color-bg-Button-solid--hover,
  //   // var(--nsoftware-color-bg-Button--hover,
  //   // var(--nsoftware-color-bg-Button-primary-solid,
  //   // var(--nsoftware-color-bg-Button-primary,
  //   // var(--nsoftware-color-bg-Button-solid,
  //   // var(--nsoftware-color-bg-Button))))))))))))))))
  //
  //   const expected = {};
  //
  //   expect(chain).eq(expected);
  //
  //   // expect(parsed.attribute).equal("color-bg");
  //   // expect(parsed.component).equal("Button");
  //   // expect(parsed.traits).eqls(["primary", "solid"]);
  //   // expect(parsed.states).eqls(["active", "hover"]);
  // });
});
