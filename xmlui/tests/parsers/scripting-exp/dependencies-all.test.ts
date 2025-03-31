import { describe, expect, it } from "vitest";
import { resolveIdentifiers } from "../../../src/components-core/script-runner/id-resolution";
import { Parser } from "../../../src/parsers/scripting-exp/Parser";
import { ResolutionScope } from "../../../src/parsers/scripting-exp/ResolutionScope";

describe("Dependency resolution", () => {
  const stmtCases = [
    { src: "() => x", exp: ["x"] },
    { src: "(x) => x", exp: [] },
    { src: "({x}) => x", exp: [] },
    { src: "(x, y) => x + y", exp: [] },
    { src: "(x, y) => x + y + z.x", exp: ["z.x"] },
    { src: "(x, y) => x + y + z[x]", exp: ["z[x]"] },
    { src: "({x, y}) => x + y", exp: [] },
    { src: "({x, y}) => x + y + z.x", exp: ["z.x"] },
    {
      src: `
      () => { let x; z = 2 * x; }
      `,
      exp: [],
    },
    {
      src: `
      () => { let x; z = 2 * x + k; }
      `,
      exp: ["k"],
    },
    {
      src: `
      () => { let x; z = 2 * x + k[23].a; }
      `,
      exp: ["k['23'].a"],
    },
    {
      src: `
      () => { const x = 1; z = 2 * x; }
      `,
      exp: [],
    },
    {
      src: `
      () => { const x = 1; z = 2 * x + k; }
      `,
      exp: ["k"],
    },
    {
      src: `
      () => { const x = 1; z = 2 * x + k[23].a; }
      `,
      exp: ["k['23'].a"],
    },
    {
      src: `
      () => {
        let a; 
        { 
          let x; 
          z = 2 * x + a;
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        a++; 
        { 
          let x; 
          z = 2 * x + a;
        }
      }
      `,
      exp: ["a"],
    },
    {
      src: `
      () => {
        for (let i = 0; i < 10; i++) {
          z = i;        
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        for (let i = 0; i < 10; i++) {
          z = i + x;        
        }
      }
      `,
      exp: ["x"],
    },
    {
      src: `
      (x) => {
        for (let i = 0; i < 10; i++) {
          z = i + x;        
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        for (let i in collection) {
          z = i;        
        }
      }
      `,
      exp: ["collection"],
    },
    {
      src: `
      () => {
        for (const i in collection) {
          z = i;        
        }
      }
      `,
      exp: ["collection"],
    },
    {
      src: `
      () => {
        let collection = [1, 2];
        for (let i in collection) {
          z = i;        
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        for (let i of collection) {
          z = i;        
        }
      }
      `,
      exp: ["collection"],
    },
    {
      src: `
      () => {
        for (const i of collection) {
          z = i;        
        }
      }
      `,
      exp: ["collection"],
    },
    {
      src: `
      () => {
        let collection = [1, 2];
        for (let i of collection) {
          z = i;        
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        try {
          const x = 3;
          z = x;
        } catch {
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        try {
          const x = 3;
          z = x + a;
        } catch {
        }
      }
      `,
      exp: ["a"],
    },
    {
      src: `
      () => {
        try {
          const x = 3;
          z = x + a;
        } catch {
          z = x + a
        }
      }
      `,
      exp: ["a", "x"],
    },
    {
      src: `
      () => {
        try {
          const x = 3;
          z = x + a;
        } catch {
          let y = 6;
          z = x + y + a
        }
      }
      `,
      exp: ["a", "x"],
    },
    {
      src: `
      () => {
        try {
          const x = 3;
          z = x + a;
        } finally {
          z = x + a
        }
      }
      `,
      exp: ["a", "x"],
    },
    {
      src: `
      () => {
        try {
          const x = 3;
          z = x + a;
        } finally {
          let y = 6;
          z = x + y + a
        }
      }
      `,
      exp: ["a", "x"],
    },
    {
      src: `
      () => {
        try {
          const x = 3;
          z = x + a;
        } catch (e) {
          z = x + a + e
        }
      }
      `,
      exp: ["a", "x"],
    },
    {
      src: `
      () => {
        if (true) { 
          let x = 3;
          z = x;
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        if (true) { 
          let x = 3;
        } else {
          z = x;
        }
      }
      `,
      exp: ["x"],
    },
    {
      src: `
      () => {
        if (true) { 
        } else {
          let x = 3;
          z = x;
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        let x = 2;
        switch (x) {
          case 2:
            z = x;
            break;
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        switch (x) {
          case 2:
            z = x;
            break;
        }
      }
      `,
      exp: ["x"],
    },
    {
      src: `
      () => {
        switch (123) {
          case 2:
            let x = 2;
            z = x;
            break;
        }
      }
      `,
      exp: [],
    },

    {
      src: `
      () => {
        switch (123) {
          case 1:
            z = x; 
          case 2:
            let x = 2;
            z = x;
            break;
        }
      }
      `,
      exp: ["x"],
    },

    {
      src: `
      () => {
        switch (123) {
          case 1:
            let y = 3;
            z = y; 
          case 2:
            let x = 2;
            z = x;
            break;
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        switch (123) {
          case 2: {
            let x = 2;
            z = x;
            break;
          }
          default:
            z = x;
            break;
        }
      }
      `,
      exp: ["x"],
    },
    {
      src: `
      () => {
        while (true) {
          let x = 23;
          z = 2 * x 
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        while (true) {
          let x = 23;
          z = 2 * x + a 
        }
      }
      `,
      exp: ["a"],
    },
    {
      src: `
      () => {
        while (true) {
          z = 2 * x + a 
        }
      }
      `,
      exp: ["x", "a"],
    },
    {
      src: `
      () => {
        do {
          let x = 23;
          z = 2 * x + a 
        } while (true)
      }
      `,
      exp: ["a"],
    },
    {
      src: `
      () => {
        do {
          let x = 23;
          z = 2 * x 
        } while (true)
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        do {
          z = 2 * x + a 
        } while (true)
      }
      `,
      exp: ["x", "a"],
    },
  ];
  stmtCases.forEach((c) =>
    it(`statement dependencies '${c.src}'`, () => {
      const dps = collectDependencies(c.src).allDeps;
      expect(dps).deep.equal(c.exp);
    })
  );

  const exprCases = [
    { src: "x", exp: ["x"] },
    { src: "x + y", exp: ["x", "y"] },
    { src: "x - y", exp: ["x", "y"] },
    { src: "-x", exp: ["x"] },
    { src: "z * x + y", exp: ["z", "x", "y"] },
    { src: "z = x - y", exp: ["x", "y"] },
    { src: "z, x + y", exp: ["z", "x", "y"] },
    { src: "z, y, x", exp: ["z", "y", "x"] },
    { src: "[x, y, 123]", exp: ["x", "y"] },
    { src: "...x", exp: ["x"] },
    { src: "{x, y: z}", exp: ["x", "z"] },
    { src: "{x: a, y: z}", exp: ["a", "z"] },
    { src: "{...x}", exp: ["x"] },
    { src: "z += x * y", exp: ["x", "y"] },
    { src: "++x", exp: ["x"] },
    { src: "x--", exp: ["x"] },
    { src: "x > y ? a + 12 : z - 3", exp: ["x", "y", "a", "z"] },
    {
      src: "z = x + x.stuff + Object.keys(y[0]).reduce((acc, i)=>{acc + i} , 0)",
      exp: ["x", "x.stuff", "y['0']", "Object"],
    },
    { src: "x.y", exp: ["x.y"] },
    { src: "x[y]", exp: ["x[y]"] },
    { src: "x['y']", exp: ["x['y']"] },
    { src: "x['y'].z", exp: ["x['y'].z"] },
    { src: "x['y'].z + x['y']", exp: ["x['y'].z", "x['y']"] },
    { src: "x[123]", exp: ["x['123']"] },
    { src: "x[123].z", exp: ["x['123'].z"] },
    { src: "x[123].z + x[123]", exp: ["x['123'].z", "x['123']"] },
    { src: "x['y'].z + x[y]", exp: ["x['y'].z", "x[y]"] },
    { src: "x[123].z + x['123'].z", exp: ["x['123'].z"] },
    { src: "x.y[z]", exp: ["x.y[z]"] },
    { src: "x.y[z+x], x.y", exp: ["x.y", "z", "x"] },
    { src: "x.y[z+m].k", exp: ["x.y", "z", "m"] },
    { src: "x.y[z+m][k]", exp: ["x.y", "z", "m", "k"] },
    { src: "x.y[z+m][k].x", exp: ["x.y", "z", "m", "k"] },
    { src: "z = x", exp: ["x"] },
    { src: "x, y", exp: ["x", "y"] },
    { src: "x.y, y", exp: ["x.y", "y"] },
    { src: "Object.keys()", exp: ["Object"] },
    { src: "Object.keys(y[0])", exp: ["y['0']", "Object"] },
    { src: "Object.keys(y[a+b])", exp: ["y", "a", "b", "Object"] },
    { src: "Object.keys(y[0]).reduce", exp: ["y['0']", "Object"] },
  ];
  exprCases.forEach((c) =>
    it(`expr dependencies '${c.src}'`, () => {
      const dps = collectDependencies(c.src).allDeps;
      expect(dps).deep.equal(c.exp);
    })
  );
});

function collectDependencies(source: string, referenceTrackedApi: Record<string, any> = {}): ResolutionScope {
  const parser = new Parser(source);
  const expr = parser.parseExpr();
  return resolveIdentifiers(expr!, referenceTrackedApi);
}
