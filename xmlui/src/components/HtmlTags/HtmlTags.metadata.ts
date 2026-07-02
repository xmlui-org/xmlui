import { htmlTagDefinitions, type HtmlTagDefinition } from "../../component-core/htmlTags";
import { createMetadata } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";

const themeVars = themeVarsFromNames([
  "textColor-HtmlTable",
  "backgroundColor-HtmlTable",
  "fontFamily-HtmlTable",
  "fontSize-HtmlTable",
  "fontWeight-HtmlTable",
  "textTransform-HtmlTable",
  "marginTop-HtmlTable",
  "marginBottom-HtmlTable",
  "width-HtmlTable",
  "border-HtmlTable",
  "borderTop-HtmlTable",
  "borderRight-HtmlTable",
  "borderBottom-HtmlTable",
  "borderLeft-HtmlTable",
  "borderColor-HtmlTable",
  "borderStyle-HtmlTable",
  "borderWidth-HtmlTable",
  "padding-HtmlTable",
  "paddingTop-HtmlTable",
  "paddingRight-HtmlTable",
  "paddingBottom-HtmlTable",
  "paddingLeft-HtmlTable",
  "backgroundColor-HtmlThead",
  "textColor-HtmlThead",
  "fontWeight-HtmlThead",
  "fontSize-HtmlThead",
  "textTransform-HtmlThead",
  "border-HtmlThead",
  "padding-HtmlThead",
  "backgroundColor-HtmlTbody",
  "textColor-HtmlTbody",
  "textAlign-HtmlTbody",
  "verticalAlignment-HtmlTbody",
  "textTransform-HtmlTbody",
  "backgroundColor-HtmlTfoot",
  "textColor-HtmlTfoot",
  "backgroundColor-HtmlTh",
  "textColor-HtmlTh",
  "fontWeight-HtmlTh",
  "fontSize-HtmlTh",
  "backgroundColor-HtmlTh--hover",
  "border-HtmlTh",
  "padding-HtmlTh",
  "backgroundColor-HtmlTr",
  "backgroundColor-HtmlTr--hover",
  "backgroundColor-even-HtmlTr",
  "textColor-HtmlTr",
  "textColor-HtmlTr--hover",
  "fontSize-HtmlTr",
  "fontWeight-HtmlTr",
  "border-HtmlTr",
  "backgroundColor-HtmlTd",
  "text-align-HtmlTd",
  "verticalAlignment-HtmlTd",
  "fontSize-HtmlTd",
  "fontWeight-HtmlTd",
  "border-HtmlTd",
  "padding-HtmlTd",
  "border-HtmlOl",
  "padding-HtmlOl",
  "marginTop-HtmlOl",
  "marginBottom-HtmlOl",
  "border-HtmlUl",
  "padding-HtmlUl",
  "marginTop-HtmlUl",
  "marginBottom-HtmlUl",
  "border-HtmlLi",
  "padding-HtmlLi",
  "marginLeft-HtmlLi",
  "marginTop-HtmlLi",
  "marginBottom-HtmlLi",
  "listStyleType-HtmlLi",
  "marginTop-HtmlHeading",
  "marginBottom-HtmlHeading",
  "marginTop-HtmlVideo",
  "marginBottom-HtmlVideo",
  "border-HtmlDetails",
  "padding-HtmlDetails",
  "marginTop-HtmlDetails",
  "marginBottom-HtmlDetails",
]);

const htmlThemeGroups: Record<string, {
  themeVarPrefixes: readonly string[];
  defaultThemeVars?: Record<string, string>;
}> = {
  details: {
    themeVarPrefixes: ["HtmlDetails"],
  },
  h1: headingThemeGroup(),
  h2: headingThemeGroup(),
  h3: headingThemeGroup(),
  h4: headingThemeGroup(),
  h5: headingThemeGroup(),
  h6: headingThemeGroup(),
  li: {
    themeVarPrefixes: ["HtmlLi"],
  },
  ol: {
    themeVarPrefixes: ["HtmlOl"],
    defaultThemeVars: {
      "marginTop-HtmlOl": "$space-5",
      "marginBottom-HtmlOl": "$space-5",
    },
  },
  table: {
    themeVarPrefixes: ["HtmlTable"],
    defaultThemeVars: {
      "backgroundColor-HtmlTable": "$backgroundColor",
      "border-HtmlTable": "1px solid $borderColor",
      "marginBottom-HtmlTable": "$space-4",
      "marginTop-HtmlTable": "$space-4",
    },
  },
  tbody: {
    themeVarPrefixes: ["HtmlTbody"],
  },
  td: {
    themeVarPrefixes: ["HtmlTd"],
    defaultThemeVars: {
      "padding-HtmlTd": "$space-2",
      "borderBottom-HtmlTd": "1px solid $borderColor",
    },
  },
  tfoot: {
    themeVarPrefixes: ["HtmlTfoot"],
  },
  th: {
    themeVarPrefixes: ["HtmlTh"],
    defaultThemeVars: {
      "padding-HtmlTh": "$space-2",
      "fontSize-HtmlTh": "$fontSize-tiny",
      "fontWeight-HtmlTh": "$fontWeight-bold",
    },
  },
  thead: {
    themeVarPrefixes: ["HtmlThead"],
    defaultThemeVars: {
      "textTransform-HtmlThead": "uppercase",
      "backgroundColor-HtmlThead": "$color-surface-100",
      "textColor-HtmlThead": "$color-surface-500",
    },
  },
  tr: {
    themeVarPrefixes: ["HtmlTr"],
    defaultThemeVars: {
      "fontSize-HtmlTr": "$fontSize-sm",
      "backgroundColor-row-HtmlTr": "inherit",
    },
  },
  ul: {
    themeVarPrefixes: ["HtmlUl"],
    defaultThemeVars: {
      "marginTop-HtmlUl": "$space-5",
      "marginBottom-HtmlUl": "$space-5",
    },
  },
  video: {
    themeVarPrefixes: ["HtmlVideo"],
    defaultThemeVars: {
      "marginTop-HtmlVideo": "1rem",
      "marginBottom-HtmlVideo": "1rem",
    },
  },
};

export const htmlTagMetadata: Record<string, ComponentMetadata> = Object.fromEntries(
  htmlTagDefinitions.map((definition) => [
    definition.name,
    createHtmlTagMetadata(definition),
  ]),
);

function headingThemeGroup() {
  return {
    themeVarPrefixes: ["HtmlHeading"],
    defaultThemeVars: {
      "marginTop-HtmlHeading": "1rem",
      "marginBottom-HtmlHeading": ".5rem",
    },
  };
}

function createHtmlTagMetadata(definition: HtmlTagDefinition): ComponentMetadata {
  const group = htmlThemeGroups[definition.tagName];
  return createMetadata({
    status: "deprecated",
    description: `This component renders an HTML \`${definition.tagName}\` tag.`,
    isHtmlTag: true,
    allowArbitraryProps: true,
    props: {
      testId: {
        description: "Adds a test identifier to the rendered HTML element.",
        valueType: "string",
      },
    },
    themeVars: group ? themeVarsFor(group.themeVarPrefixes) : undefined,
    defaultThemeVars: group?.defaultThemeVars,
  });
}

function themeVarsFor(prefixes: readonly string[]) {
  return Object.fromEntries(
    Object.entries(themeVars).filter(([name]) =>
      prefixes.some((prefix) => name.includes(prefix)),
    ),
  );
}

function themeVarsFromNames(names: readonly string[]) {
  return Object.fromEntries(names.map((name) => [
    name,
    `Theme variable declared by ${name}.`,
  ]));
}
