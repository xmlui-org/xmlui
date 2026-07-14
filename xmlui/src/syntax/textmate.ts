import xmluiThemeDarkSource from "./textMate/xmlui-dark.json" with { type: "json" };
import xmluiThemeLightSource from "./textMate/xmlui-light.json" with { type: "json" };
import xmluiThemeSource from "./textMate/xmlui.json" with { type: "json" };
import xmluiGrammarSource from "./textMate/xmlui.tmLanguage.json" with { type: "json" };

export const xmluiGrammar = {
  ...xmluiGrammarSource,
  name: "xmlui",
  aliases: ["xmlui-pg"],
};

export const xmluiThemeLight = xmluiThemeLightSource;
export const xmluiThemeDark = xmluiThemeDarkSource;
export const xmluiTheme = xmluiThemeSource;
