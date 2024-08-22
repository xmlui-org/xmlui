export const UEMLGrammar: any = {
  id: "ueml",
  config: {
    comments: {
      blockComment: ["<!--", "-->"],
    },
    brackets: [["<", ">"]],
    autoClosingPairs: [
      { open: "<", close: ">" },
      { open: "'", close: "'" },
      { open: '"', close: '"' },
      { open: "`", close: "`" },
    ],
    surroundingPairs: [
      { open: "<", close: ">" },
      { open: "'", close: "'" },
      { open: '"', close: '"' },
      { open: "`", close: "`" },
    ],
  },
  language: {
    defaultToken: "",
    tokenPostfix: ".ueml",
    ignoreCase: false,
    identifier: /[a-zA-Z$_][-\w.:$]*/,
    tokenizer: {
      root: [
        { include: "@commentStart" },
        { include: "@helperTag" },
        { include: "@componentTagStart" },
        { include: "@escapeCharacter" },
        { include: "@textWithBindingExpr" },
        { include: "@entity" },
        { include: "@cdataStart" },
      ],
      helperTag: [
        { include: "@scriptTagStart" },
        { include: "@eventTagStart" },
        { include: "@apiTagStart" },
        { include: "@propOrVarTagStart" },
      ],
      eventTagStart: [
        [
          /(<)((?:[a-zA-Z_][\w\.\-]*?:)?)(event)/,
          ["delimiter.angle", "namespace", { token: "tag-event", next: "@eventTag" }],
        ],
      ],
      eventTag: [
        { include: "@commentStart" },
        { include: "@valueAttributeScriptInsideStart" },
        { include: "@attributeStart" },
        [/\/>/, "delimiter.angle", "@pop"],
        [/(<\/)(event)(\s*>)/, ["delimiter.angle", "tag-event", { token: "delimiter.angle", next: "@pop" }]],
        [/>/, { token: "delimiter.angle", next: "@eventTagContent" }],
      ],
      eventTagContent: [
        { include: "commentStart" },
        { include: "componentTagStart" },
        [/[^<]/, { token: "@rematch", next: "@eventTagScriptContent", nextEmbedded: "xmluiscript" }],
        [/<\/event\s*>/, { token: "@rematch", next: "@pop" }],
      ],
      eventTagScriptContent: [
        [/<\/event\s*>/, { token: "@rematch", next: "@pop", nextEmbedded: "@pop" }],
        [/[^<]/, ""],
      ],
      apiTagStart: [
        [/(<)((?:[a-zA-Z_][\w\.\-]*?:)?)(api)/, ["delimiter.angle", "namespace", { token: "tag-helper", next: "@apiTag" }]],
      ],
      apiTag: [
        { include: "@commentStart" },
        { include: "@valueAttributeScriptInsideStart" },
        { include: "@attributeStart" },
        [/\/>/, "delimiter.angle", "@pop"],
        [/>/, { token: "delimiter.angle", next: "@apiTagScriptContent", nextEmbedded: "xmluiscript" }],
        [/(<\/)(api)(\s*>)/, ["delimiter.angle", "tag-helper", { token: "delimiter.angle", next: "@pop" }]],
      ],
      apiTagScriptContent: [
        [/<\/api\s*>/, { token: "@rematch", next: "@pop", nextEmbedded: "@pop" }],
        [/[^</]/, ""],
      ],
      valueAttributeScriptInsideStart: [
        [
          /(^|\s+)(value)(\s*=)(['\"`])/,
          [
            "",
            "attribute",
            "operators",
            {
              cases: {
                "'": { token: "string", next: "@singleQuotedScript", nextEmbedded: "xmluiscript" },
                '"': { token: "string", next: "@doubleQuotedScript", nextEmbedded: "xmluiscript" },
                "`": { token: "string", next: "@backtickQuotedScript", nextEmbedded: "xmluiscript" },
              },
            },
          ],
        ],
      ],
      scriptTagStart: [
        [
          /(<)(script\s*)(>)/,
          [
            "delimiter.angle",
            "tag-script",
            { token: "delimiter.angle", nextEmbedded: "xmluiscript", next: "@scriptTag" },
          ],
        ],
        [/(<\/)(script\s*)(>)/, ["delimiter.angle", "tag-script", "delimiter.angle"]],
      ],
      scriptTag: [
        [/<\/script>/, { token: "@rematch", next: "@pop", nextEmbedded: "@pop" }],
        [/[^<]+/, ""],
      ],
      propOrVarTagStart: [
        [
          /(<\/?)((?:[a-zA-Z_][\w\.\-]*?:)?)((?:prop)|(?:var))/,
          ["delimiter.angle", "namespace", { token: "tag-helper", next: "@propOrVarTag" }],
        ],
      ],
      propOrVarTag: [
        [/\/?>/, { token: "delimiter.angle", next: "@pop" }],
        { include: "@commentStart" },
        { include: "@attributeStart" },
      ],
      componentTagStart: [
        [
          /(\s*<\/?)((?:[a-zA-Z_][\w\.\-]*?:)?)([A-Z][\w\.\-]*)/,
          ["delimiter.angle", "namespace", { token: "tag-component", next: "@componentTag" }],
        ],
      ],
      componentTag: [
        [/\/?>/, { token: "delimiter.angle", next: "@pop" }],
        { include: "@commentStart" },
        { include: "@eventHandler" },
        { include: "@attributeStart" },
      ],
      eventHandler: [
        [
          /(^|\s+)(on[A-Z][-\w.]*)(\s*=)(['\"`])/,
          [
            "",
            "attribute",
            "operators",
            {
              cases: {
                "'": { token: "string", next: "@singleQuotedScript", nextEmbedded: "xmluiscript" },
                '"': { token: "string", next: "@doubleQuotedScript", nextEmbedded: "xmluiscript" },
                "`": { token: "string", next: "@backtickQuotedScript", nextEmbedded: "xmluiscript" },
              },
            },
          ],
        ],
      ],
      doubleQuotedScript: [
        [/"/, { token: "string", next: "@pop", nextEmbedded: "@pop" }],
        [/[^"]/, ""],
      ],
      singleQuotedScript: [
        [/'/, { token: "string", next: "@pop", nextEmbedded: "@pop" }],
        [/[^']/, ""],
      ],
      backtickQuotedScript: [
        [/`/, { token: "string", next: "@pop", nextEmbedded: "@pop" }],
        [/[^`]/, ""],
      ],
      attributeStart: [
        [
          /(^|\s+)(@identifier)(\s*=\s*)(['\"`])/,
          [
            "",
            "attribute",
            "operators",
            {
              cases: {
                "'": { token: "string", next: "@singleQuotedString" },
                '"': { token: "string", next: "@doubleQuotedString" },
                "`": { token: "string", next: "@backtickQuotedString" },
              },
            },
          ],
        ],
        [
          /(^|\s+)(@identifier)/,
          [
            "",
            "attribute"
          ]
        ]
      ],
      singleQuotedString: [[/'/, "string", "@pop"], { include: "@textWithBindingExpr" }, [/[^']/, "string"]],
      doubleQuotedString: [[/"/, "string", "@pop"], { include: "@textWithBindingExpr" }, [/[^"]/, "string"]],
      backtickQuotedString: [[/`/, "string", "@pop"], { include: "@textWithBindingExpr" }, [/[^`]/, "string"]],
      textWithBindingExpr: [
        { include: "@escapeCharacter" },
        { include: "@entity" },
        [/{/, { token: "delimiter.curly", next: "@bindingExpr", nextEmbedded: "xmluiscript" }],
      ],
      bindingExpr: [
        [/}/, { token: "delimiter.curly", next: "@pop", nextEmbedded: "@pop" }],
        [/[^}]+/, ""],
      ],
      cdataStart: [
        [/(<!\[)(CDATA)(\[)/, ["delimiter.angle", "tag-cdata", { token: "delimiter.angle", next: "@cdata" }]],
      ],
      cdata: [
        [/]]>/, "delimiter.angle", "@pop"],
        [/./, "string"],
      ],
      commentStart: [[/<!--/, "comment", "@comment"]],
      comment: [
        [/[^<\-]+/, "comment.content"],
        [/-->/, { token: "comment", next: "@pop" }],
        [/[<\-]/, "comment.content"],
      ],
      escapeCharacter: [
        [/\\S/, "string.escape"],
        [/\\0/, "string.escape"],
        [/\\'/, "string.escape"],
        [/\\\"/, "string.escape"],
        [/\\\\/, "string.escape"],
        [/\\n/, "string.escape"],
        [/\\r/, "string.escape"],
        [/\\v/, "string.escape"],
        [/\\t/, "string.escape"],
        [/\\b/, "string.escape"],
        [/\\$/, "string.escape"],
        [/\\f/, "string.escape"],
      ],
      entity: [[/(&)((?:amp)|(?:lt)|(?:gt)|(?:quot)|(?:apos))(;)/, ["constant", "constant", "constant"]]],
    },
  },
};
