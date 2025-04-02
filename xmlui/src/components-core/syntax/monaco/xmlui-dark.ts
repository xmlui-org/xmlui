const darkTheme: any = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "#4E4E4E" },
    { token: "comment.content", foreground: "#4E4E4E" },
    { token: "tag-component", foreground: "#F07100" },
    { token: "tag-event", foreground: "#3572F6" },
    { token: "tag-helper", foreground: "#3572F6" },
    { token: "attribute", foreground: "#C79B00" },
    { token: "operators", foreground: "#7235C7" },
    { token: "delimiter.angle", foreground: "#66748E" },
    { token: "delimiter.curly", foreground: "#000000" },
    { token: "string", foreground: "#497A48" },
    { token: "tag-cdata", foreground: "#1BADFF" },
    { token: "tag-script", foreground: "#0CA6A6" },
    { token: "string.escape", foreground: "#1BB95A" },
    { token: "constant", foreground: "#FF00E8" },
  ],
  colors: {
    "editor.background": "#17232b",
    "editor.foreground": "#497A48",
  },
};

export default darkTheme;
