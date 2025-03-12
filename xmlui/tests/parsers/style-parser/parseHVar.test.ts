import {describe, expect, test} from "vitest";
import { parseHVar } from "../../../src/components-core/theming/hvar";

describe("Parse HVar", () => {

  const cases = [
    {
      src: 'backgroundColor-Button-primary-solid--active--hover',
      attribute: "backgroundColor",
      component: "Button",
      traits: ["primary", "solid"],
      states: ["active", "hover"],
    },
    {
      src: 'backgroundColor-Button--active--hover',
      attribute: "backgroundColor",
      component: "Button",
      states: ["active", "hover"],
    },
    {
      src: "backgroundColor-Button-primary-solid",
      attribute: "backgroundColor",
      component: "Button",
      traits: ["primary", "solid"],
    },
    {
      src: "backgroundColor-Button-primary--active",
      attribute: "backgroundColor",
      component: "Button",
      traits: ["primary"],
      states: ["active"],
    },
    {
      src: "backgroundColor-Button",
      attribute: "backgroundColor",
      component: "Button",
    },
    {
      src: "Input:backgroundColor-TextBox",
      classes: ['Input'],
      attribute: "backgroundColor",
      component: "TextBox",
    },
    {
      src: "Control:Input:backgroundColor-TextBox",
      classes: ['Control', 'Input'],
      attribute: "backgroundColor",
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
