const withTM = require("next-transpile-modules")(["react-icons", "xmlui-charts", "xmlui", "xmlui-animations", "xmlui-pdf"]);
const withSvgr = require("next-plugin-svgr");
const shiki = require("shiki");
const fs = require("fs");
const theme = require("../xmlui/src/syntax/textMate/xmlui.json");

const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.jsx",
  flexsearch: true,
  mdxOptions: {
    rehypePrettyCodeOptions: {
      getHighlighter: async (options) => {
        const myLanguageGrammar = JSON.parse(fs.readFileSync("../xmlui/src/syntax/grammar.tmLanguage.json"));

        const uemlLanguage = {
          id: "xmlui",
          scopeName: "source.xmlui",
          grammar: myLanguageGrammar,
          aliases: ["ueml", "xmlui"],
        };

        const highlighter = await shiki.getHighlighter({
          ...options,
          theme,
          langs: [...shiki.BUNDLED_LANGUAGES],
        });
        await highlighter.loadLanguage(uemlLanguage);

        highlighter.setColorReplacements({
          "#000001": "var(--syntax-token-component)",
          "#000002": "var(--syntax-token-delimiter-angle)",
          "#000003": "var(--syntax-token-attribute-name)",
          "#000004": "var(--syntax-token-equal-sign)",
          "#000005": "var(--syntax-token-string)",
          "#000006": "var(--syntax-token-script)",
          "#000007": "var(--syntax-token-helper)",
          "#000008": "var(--syntax-token-comment)",
          "#000009": "var(--syntax-token-escape)",
          "#000010": "var(--syntax-token-constant)",
          "#000011": "var(--syntax-token-cdata)",
          "#000012": "var(--syntax-token-delimiter-curly)",
          "#000013": "var(--syntax-token-text)",
          "#000014": "var(--syntax-token-string-quoted)",
        });

        return highlighter;
      },
    },
  },
});

/** @type {import('next').NextConfig} */
let nextConfig = {
  fileLoader: true,
  output: "export",
  distDir: "dist",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    VITE_MOCK_ENABLED: true,
  },
  reactStrictMode: true,
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.xmlui$/i,
      use: "raw-loader",
    });

    config.module.rules.push({
      test: /\.(jsx?|tsx?|ts)$/,
      exclude: [/node_modules/, /theme.config.jsx/],
      use: [
        {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-react",
                {
                  runtime: "automatic",
                },
              ],
              "@babel/preset-typescript",
            ],
          },
        },
      ],
    });

    if (options.isServer) {
      // next server build => ignore msw/browser
      if (Array.isArray(config.resolve.alias)) {
        // in Next the type is always object, so this branch isn't necessary. But to keep TS happy, avoid @ts-ignore and prevent possible future breaking changes it's good to have it
        config.resolve.alias.push({ name: "msw/browser", alias: false });
      } else {
        config.resolve.alias["msw/browser"] = false;
      }
    } else {
      // browser => ignore msw/node
      if (Array.isArray(config.resolve.alias)) {
        config.resolve.alias.push({ name: "msw/node", alias: false });
      } else {
        config.resolve.alias["msw/node"] = false;
      }
    }

    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = withNextra(withTM(withSvgr(nextConfig)));
