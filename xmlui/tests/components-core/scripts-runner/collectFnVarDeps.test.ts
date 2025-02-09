import { expect, it } from "vitest";
import { collectFnVarDeps } from "../../../src/components-core/rendering/collectFnVarDeps";


it("simple #1", () => {
  const fnDeps = {
    fn1: ["var1", "var2"],
  };

  expect(collectFnVarDeps(fnDeps)).deep.eq({
    fn1: ["var1", "var2"],
  });
});

it("simple #2", () => {
  const fnDeps = {
    fn1: ["fn2", "var1", "var2"],
    fn2: ["var1", "var3"],
  };

  expect(collectFnVarDeps(fnDeps)).deep.eq({
    fn1: ["var1", "var3", "var2"],
    fn2: ["var1", "var3"],
  });
});


it("simple #3", () => {
  const fnDeps = {
    fn1: ["fn2", "var1", "var2"],
    fn2: ["var1", "var3", "fn3"],
    fn3: ["var4"]
  };

  expect(collectFnVarDeps(fnDeps)).deep.eq({
    fn1: ["var1", "var3", "var4", "var2"],
    fn2: ["var1", "var3", "var4"],
    fn3: ["var4"]
  });
});

it("circular (fn1 -> fn2 -> fn1)", () => {
  const fnDeps = {
    fn1: ["fn2"],
    fn2: ["fn1"],
  };

  expect(collectFnVarDeps(fnDeps)).deep.eq({
    fn1: [],
    fn2: [],
  });
});

it("circular with var deps (fn1 -> fn2 -> fn1)", () => {
  const fnDeps = {
    fn1: ["fn2", "var1"],
    fn2: ["fn1"],
  };

  expect(collectFnVarDeps(fnDeps)).deep.eq({
    fn1: ["var1"],
    fn2: ["var1"],
  });
});

it("circular with var deps (fn1 -> fn2 -> fn1)", () => {
  const fnDeps = {
    fn1: ["fn2", "var1"],
    fn2: ["fn1", "fn3"],
    fn3: ["var2"],
  };

  expect(collectFnVarDeps(fnDeps)).deep.eq({
    fn1: ["var2", "var1"],
    fn2: ["var1", "var2"],
    fn3: ["var2"],
  });
});

it("circular with var deps (fn1 -> fn2 -> fn3 -> fn1)", () => {
  const fnDeps = {
    fn1: ["fn2", "var1"],
    fn2: ["fn3"],
    fn3: ["fn1", "var2"],
  };

  expect(collectFnVarDeps(fnDeps)).deep.eq({
    fn1: ["var2", "var1"],
    fn2: ["var1", "var2"],
    fn3: ["var1", "var2"],
  });
});

it("circular with var deps (fn1 -> fn2 -> fn3 (fn1) -> fn1)", () => {
  const fnDeps = {
    fn1: ["fn2", "var1"],
    fn2: ["fn1", "fn3"],
    fn3: ["fn1", "var2"],
  };

  expect(collectFnVarDeps(fnDeps)).deep.eq({
    fn1: ["var2", "var1"],
    fn2: ["var1", "var2"],
    fn3: ["var1", "var2"],
  });
});
