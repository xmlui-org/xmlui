import { validationStatusStyleNames } from "./themes/base-utils";

export type HVar = {
  classes: Array<string>;
  attribute: string;
  component: string;
  traits: Array<string>;
  states: Array<string>;
};

const parsedHVarCache: Record<string, HVar | null> = {};

//extremely dummy solution, will come back later
export function parseHVar(input: string): HVar | null {
  if (parsedHVarCache[input] !== undefined) {
    return parsedHVarCache[input];
  }
  // Split the input string into parts using regex
  const parts = input.split(/-[A-Z]+/);
  if (parts.length !== 2) {
    parsedHVarCache[input] = null;
    return parsedHVarCache[input];
  }

  const firstPart = parts[0];
  const classessParts = firstPart.split(":");
  const attribute = classessParts[classessParts.length - 1];
  const classes = classessParts.length > 1 ? classessParts.slice(0, classessParts.length - 1) : [];
  const secondPart = input.substring(firstPart.length + 1);
  const [compName, ...rest] = secondPart.split("-");
  const traitsAndStates = secondPart.substring(compName.length).split("--");

  const states: Array<string> = [];
  const traits: Array<string> = [];
  traitsAndStates.forEach((part) => {
    if (!part.includes("-") && part) {
      states.push(part);
    } else {
      part.split("-").forEach((trait) => {
        if (trait) {
          traits.push(trait);
        }
      });
    }
  });

  parsedHVarCache[input] = {
    classes: classes,
    attribute: attribute,
    component: compName,
    traits: traits,
    states: states,
  };

  return parsedHVarCache[input];
}

function createCombinations(arr: Array<any> = []) {
  const stateCombinations = [];

  for (let i = 1; i <= arr.length; i++) {
    for (let j = 0; j <= arr.length - i; j++) {
      stateCombinations.push(arr.slice(j, j + i));
    }
  }
  const result = stateCombinations.sort((a, b) => {
    if (b.length !== a.length) {
      return b.length - a.length;
    }
    // If lengths are equal, prioritize non-validation states
    const aHasValidation = a.some((state: any) => validationStatusStyleNames.includes(state));
    const bHasValidation = b.some((state: any) => validationStatusStyleNames.includes(state));

    if (aHasValidation && !bHasValidation) return 1;
    if (!aHasValidation && bHasValidation) return -1;
    return 0;
  });
  return result;
}

export type ThemeVarMatchResult = {
  forValue: string;
  matchedValue: string | undefined;
  from: Array<string>;
};

export function matchThemeVar(
  themeVar: string,
  availableThemeVars: Array<Record<string, string>> = []
): ThemeVarMatchResult | undefined {
  const hvar = parseHVar(themeVar);
  if (!hvar) {
    return;
  }
  const stateCombinations = createCombinations(hvar.states);
  const traitCombinations = createCombinations(hvar.traits);

  const sortedTraitCombinations: Array<string> = [];
  traitCombinations.forEach((traitComb) => {
    let result = "";
    traitComb.forEach((t) => {
      result = `${result}-${t}`;
    });
    sortedTraitCombinations.push(result);
  });
  sortedTraitCombinations.push("");

  const sortedStateCombinations: Array<string> = [];
  stateCombinations.forEach((stateComb) => {
    let result = "";
    stateComb.forEach((s) => {
      result = `${result}--${s}`;
    });
    sortedStateCombinations.push(result);
  });
  sortedStateCombinations.push("");

  const componentParts = [hvar.component, ...hvar.classes];
  const from: Array<string> = [];
  sortedStateCombinations.forEach((stateComb) => {
    sortedTraitCombinations.forEach((traitComb) => {
      componentParts.forEach((componentPart) => {
        from.push(`${hvar.attribute}-${componentPart}${traitComb}${stateComb}`);
      });
    });
  });

  let matchedValue;
  for (let i = availableThemeVars.length - 1; i >= 0; i--) {
    const themeVars = availableThemeVars[i];
    let foundValue = from.find((themeVar) => themeVars[themeVar] !== undefined);
    if (foundValue) {
      matchedValue = foundValue;
      break;
    }
  }
  const forValue = from[0];
  return {
    forValue: forValue,
    matchedValue: matchedValue,
    from: from,
  };
}
