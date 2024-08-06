import {describe, expect, it, test} from "vitest";
import { parseHVar } from "@components-core/theming/hvar";

describe("Parse HVar", () => {

  const cases = [
    {
      src: 'color-bg-Button-primary-solid--active--hover',
      attribute: "color-bg",
      component: "Button",
      traits: ["primary", "solid"],
      states: ["active", "hover"],
    },
    {
      src: 'color-bg-Button--active--hover',
      attribute: "color-bg",
      component: "Button",
      states: ["active", "hover"],
    },
    {
      src: "color-bg-Button-primary-solid",
      attribute: "color-bg",
      component: "Button",
      traits: ["primary", "solid"],
    },
    {
      src: "color-bg-Button-primary--active",
      attribute: "color-bg",
      component: "Button",
      traits: ["primary"],
      states: ["active"],
    },
    {
      src: "color-bg-Button",
      attribute: "color-bg",
      component: "Button",
    },
    {
      src: "Input:color-bg-TextBox",
      classes: ['Input'],
      attribute: "color-bg",
      component: "TextBox",
    },
    {
      src: "Control:Input:color-bg-TextBox",
      classes: ['Control', 'Input'],
      attribute: "color-bg",
      component: "TextBox",
    }
  ];

  test.each(cases)('parse hvar: $src', ({src, states, traits, component, attribute, classes})=>{
    const parsed = parseHVar(src)!;
    expect(parsed.classes).eqls(classes || []);
    expect(parsed.attribute).equal(attribute);
    expect(parsed.component).equal(component);
    expect(parsed.traits).eqls(traits || []);
    expect(parsed.states).eqls(states || []);
  });

});
