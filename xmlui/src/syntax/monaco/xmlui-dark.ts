const darkTheme = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "#9296a9" },
    { token: "comment.content", foreground: "#9296a9", fontStyle: "italic" },
    { token: "tag-component", foreground: "#FE6BAD" },
    { token: "tag-event", foreground: "#80A6F8" },
    { token: "tag-helper", foreground: "#80A6F8" },
    { token: "attribute", foreground: "#cbd5e1" },
    { token: "operators", foreground: "#cbd5e1" },
    { token: "delimiter.angle", foreground: "#97A7C5" },
    { token: "delimiter.curly", foreground: "#FFD502" },
    { token: "string", foreground: "#7dd3fc" },
    { token: "tag-cdata", foreground: "#5CC1F9" },
    { token: "tag-script", foreground: "#78DBDB" },
    { token: "string.escape", foreground: "#BAF80A" },
  ],
  colors: {
    "editor.background": "#17232b",
  },
};

export default darkTheme;
