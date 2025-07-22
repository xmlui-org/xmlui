// import type { editor } from "monaco-editor"

// todo: after unification of the grammar files, put this back in.
// const lightTheme: editor.IStandaloneThemeData = {
const lightTheme: any = {
  base: "vs",
  inherit: true,
  rules: [
    { token: "comment", foreground: "#4E4E4E" },
    { token: "comment.content", foreground: "#4E4E4E" },
    { token: "tag-component", foreground: "#0D458C" },
    { token: "tag-event", foreground: "#3367CC" },
    { token: "tag-helper", foreground: "#3367CC" },
    { token: "attribute", foreground: "#8C150D" },
    { token: "operators", foreground: "#7235C7" },
    { token: "delimiter.angle", foreground: "#66748E" },
    { token: "delimiter.curly", foreground: "#FF9536", fontStyle: "bold" },
    { token: "string", foreground: "#497A48" },
    { token: "tag-cdata", foreground: "#1BADFF" },
    { token: "tag-script", foreground: "#0CA6A6" },
    { token: "string.escape", foreground: "#3CBC89" },
    { token: "constant", foreground: "#E366D8" },
  ],
  colors: {
    "editor.foreground": "#0D458C",
  },
};

export default lightTheme;
