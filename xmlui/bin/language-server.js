#!/usr/bin/env node
require("ts-node").register({
  transpileOnly: true,
  esm: true,
  compilerOptions: {
    module: "commonjs",
    esModuleInterop: true,
  },
});
require("../src/language-server/server");
