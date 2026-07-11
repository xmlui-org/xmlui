const lightTheme = {
  base: "vs",
  inherit: true,
  rules: [
    { token: "comment", foreground: "#606060" },
    { token: "comment.content", foreground: "#606060", fontStyle: "italic" },
    { token: "tag-component", foreground: "#B33175" },
    { token: "tag-event", foreground: "#005AE1" },
    { token: "tag-helper", foreground: "#005AE1" },
    { token: "attribute", foreground: "#2D2D2D" },
    { token: "operators", foreground: "#2D2D2D" },
    { token: "delimiter.angle", foreground: "#66748E" },
    { token: "delimiter.curly",  foreground: "#F07100", fontStyle: "bold" },
    { token: "string", foreground:  "#0074a9"},
    { token: "tag-cdata", foreground: "#079CF1" },
    { token: "tag-script", foreground: "#02A1A1" },
    { token: "string.escape", foreground: "#708C00" },
  ],
  colors: {
    "editor.foreground": "#0D458C",
  },
};

export default lightTheme;
